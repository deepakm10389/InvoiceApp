/**
 * Shared UI: shell, toasts, filters, money helpers.
 */
(function (window, $) {
  "use strict";

  var NAV = [
      { href: "dashboard.html", label: "Dashboard" },
    { href: "create-invoice.html", label: "Create Invoice" },
    { href: "invoices.html", label: "All Bills" },
    { href: "clients.html", label: "Clients" },
    { href: "items.html", label: "Items" },
    { href: "import-masters.html", label: "Import masters" },
    { href: "profile.html", label: "Profile" }
  ];

  function toast(message, type) {
    var host = $("#toastHost");
    if (!host.length) {
      $("body").append('<div class="toast-host" id="toastHost"></div>');
      host = $("#toastHost");
    }
    var el = $(
      '<div class="toast-item ' +
        (type || "") +
        '">' +
        $("<div>").text(message).html() +
        "</div>"
    );
    host.append(el);
    setTimeout(function () {
      el.fadeOut(300, function () {
        el.remove();
      });
    }, 2800);
  }

  function escapeHtml(str) {
    return $("<div>").text(str == null ? "" : String(str)).html();
  }

  function renderShell(session, active) {
    var mode = window.APP_CONFIG.useSupabase() ? "Cloud (Supabase)" : "Demo mode";
    var modeClass = window.APP_CONFIG.useSupabase() ? "cloud" : "";
    var navHtml = NAV.map(function (item) {
      var cls = item.href === active ? "nav-link active" : "nav-link";
      return '<a class="' + cls + '" href="' + item.href + '">' + item.label + "</a>";
    }).join("");

    var shell =
      '<div class="app-shell">' +
      '<header class="app-topbar no-print">' +
      '<button type="button" class="btn-menu" id="btnMenu" aria-label="Menu">☰</button>' +
      '<div class="brand">' +
      escapeHtml(window.APP_CONFIG.APP_NAME) +
      "</div>" +
      '<span class="user-chip">' +
      escapeHtml((session.user && (session.user.name || session.user.email)) || "") +
      "</span>" +
      '<button type="button" class="btn-logout" id="btnLogout" title="Logout">⎋</button>' +
      "</header>" +
      '<div class="app-body">' +
      '<aside class="app-sidebar no-print" id="appSidebar">' +
      '<div class="nav-section">Menu</div>' +
      navHtml +
      '<div class="nav-section">Mode</div>' +
      '<div style="padding:0.5rem 0.9rem"><span class="mode-badge ' +
      modeClass +
      '">' +
      mode +
      "</span></div>" +
      "</aside>" +
      '<div class="sidebar-backdrop" id="sidebarBackdrop"></div>' +
      '<main class="app-main" id="appMain"></main>' +
      "</div></div>";

    var $page = $("#pageRoot");
    var content = $page.html();
    $page.replaceWith(shell);
    $("#appMain").html(content);

    $("#btnMenu").on("click", function () {
      $("#appSidebar").toggleClass("open");
      $("#sidebarBackdrop").toggleClass("show");
    });
    $("#sidebarBackdrop").on("click", function () {
      $("#appSidebar").removeClass("open");
      $("#sidebarBackdrop").removeClass("show");
    });
    $("#btnLogout").on("click", function () {
      window.Auth.logout();
    });
  }

  /**
   * Simple client-side grid filter/sort helper.
   * options: {
   *   rows: array,
   *   searchSelector, filterFns: { key: fn(row, value) },
   *   sortKey, sortDir,
   *   render: function(filteredRows)
   * }
   */
  function createGridController(options) {
    var state = {
      rows: options.rows || [],
      search: "",
      filters: {},
      sortKey: options.sortKey || null,
      sortDir: options.sortDir || "asc"
    };

    function apply() {
      var filtered = state.rows.filter(function (row) {
        if (state.search) {
          var hay = JSON.stringify(row).toLowerCase();
          if (hay.indexOf(state.search.toLowerCase()) === -1) return false;
        }
        var ok = true;
        Object.keys(state.filters).forEach(function (key) {
          var val = state.filters[key];
          if (val === "" || val == null) return;
          if (options.filterFns && options.filterFns[key]) {
            if (!options.filterFns[key](row, val)) ok = false;
          }
        });
        return ok;
      });

      if (state.sortKey) {
        filtered = filtered.slice().sort(function (a, b) {
          var av = a[state.sortKey];
          var bv = b[state.sortKey];
          if (av == null) av = "";
          if (bv == null) bv = "";
          if (typeof av === "number" && typeof bv === "number") {
            return state.sortDir === "asc" ? av - bv : bv - av;
          }
          av = String(av).toLowerCase();
          bv = String(bv).toLowerCase();
          if (av < bv) return state.sortDir === "asc" ? -1 : 1;
          if (av > bv) return state.sortDir === "asc" ? 1 : -1;
          return 0;
        });
      }

      if (options.metaSelector) {
        $(options.metaSelector).text(filtered.length + " of " + state.rows.length + " shown");
      }
      options.render(filtered);
      return filtered;
    }

    return {
      setRows: function (rows) {
        state.rows = rows || [];
        apply();
      },
      setSearch: function (q) {
        state.search = q || "";
        apply();
      },
      setFilter: function (key, value) {
        state.filters[key] = value;
        apply();
      },
      toggleSort: function (key) {
        if (state.sortKey === key) {
          state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
        } else {
          state.sortKey = key;
          state.sortDir = "asc";
        }
        apply();
      },
      refresh: apply,
      getState: function () {
        return state;
      }
    };
  }

  function bindFilterBar(controller, opts) {
    if (opts.search) {
      $(opts.search).on("input", function () {
        controller.setSearch($(this).val());
      });
    }
    Object.keys(opts.filters || {}).forEach(function (key) {
      $(opts.filters[key]).on("change input", function () {
        controller.setFilter(key, $(this).val());
      });
    });
    if (opts.sortHeaders) {
      $(opts.sortHeaders).on("click", "[data-sort]", function () {
        controller.toggleSort($(this).data("sort"));
      });
    }
  }

  function confirmAction(message) {
    return window.confirm(message);
  }

  /**
   * Turn a <select> into a searchable autocomplete box.
   * Call again after rebuilding options to refresh the label list.
   */
  function makeAutocompleteSelect($select, opts) {
    opts = opts || {};
    $select = $($select);
    if (!$select.length) return;

    var placeholder = opts.placeholder || $select.find("option:first").text() || "Search…";
    var $wrap = $select.data("ac-wrap");
    if (!$wrap || !$wrap.length) {
      $wrap = $('<div class="ac-wrap"></div>');
      var $input = $(
        '<input type="text" class="form-control ac-input" autocomplete="off" spellcheck="false" />'
      );
      var $list = $('<div class="ac-list" hidden></div>');
      $select.hide().after($wrap);
      $wrap.append($input).append($list);
      $select.data("ac-wrap", $wrap);
      $select.data("ac-input", $input);
      $select.data("ac-list", $list);

      function hideList() {
        $list.attr("hidden", true);
      }

      function showList(filter) {
        var q = String(filter || "")
          .toLowerCase()
          .trim();
        var html = "";
        $select.find("option").each(function () {
          var $opt = $(this);
          var val = $opt.attr("value");
          var text = $opt.text();
          if (val === "" && !opts.includeEmpty) return;
          if (q && text.toLowerCase().indexOf(q) === -1 && String(val).toLowerCase().indexOf(q) === -1) {
            return;
          }
          html +=
            '<button type="button" class="ac-option" data-value="' +
            escapeHtml(val) +
            '">' +
            escapeHtml(text) +
            "</button>";
        });
        if (!html) {
          html = '<div class="ac-empty">No matches</div>';
        }
        $list.html(html).removeAttr("hidden");
      }

      function syncFromSelect() {
        var $sel = $select.find("option:selected");
        var val = $select.val();
        if (!val) {
          $input.val("");
          $input.attr("placeholder", placeholder);
        } else {
          $input.val($sel.text());
        }
      }

      $input.on("focus", function () {
        showList($input.val());
      });
      $input.on("input", function () {
        // typing clears underlying value until a choice is picked
        $select.val("");
        showList($input.val());
      });
      $list.on("mousedown", ".ac-option", function (e) {
        e.preventDefault();
        var val = $(this).attr("data-value");
        $select.val(val).trigger("change");
        syncFromSelect();
        hideList();
      });
      $input.on("keydown", function (e) {
        if (e.key === "Escape") hideList();
        if (e.key === "Enter") {
          e.preventDefault();
          var $first = $list.find(".ac-option").first();
          if ($first.length) $first.trigger("mousedown");
        }
      });
      $(document).on("click.ac." + $select.attr("id"), function (e) {
        if (!$(e.target).closest($wrap).length) hideList();
      });

      $select.on("change.acSync", syncFromSelect);
      $select.data("ac-sync", syncFromSelect);
      syncFromSelect();
    } else {
      // refresh display after options rebuilt
      var sync = $select.data("ac-sync");
      if (sync) sync();
      $select.data("ac-input").attr("placeholder", placeholder);
    }
  }

  function bindAutocompletes(selectors) {
    (selectors || []).forEach(function (sel) {
      makeAutocompleteSelect($(sel));
    });
  }

  window.UI = {
    toast: toast,
    escapeHtml: escapeHtml,
    renderShell: renderShell,
    createGridController: createGridController,
    bindFilterBar: bindFilterBar,
    confirm: confirmAction,
    makeAutocompleteSelect: makeAutocompleteSelect,
    bindAutocompletes: bindAutocompletes,
    async bootPage(activePage) {
      window.initDB();
      var session = await window.Auth.requireAuth();
      if (!session) return null;
      window.UI.renderShell(session, activePage);
      return session;
    }
  };
})(window, window.jQuery);
