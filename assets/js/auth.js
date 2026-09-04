/**
 * Auth helpers and page guards.
 */
(function (window, $) {
  "use strict";

  function pageName() {
    var path = window.location.pathname.replace(/\\/g, "/");
    var parts = path.split("/");
    return parts[parts.length - 1] || "index.html";
  }

  async function requireAuth() {
    var session = await window.DB.getSession();
    if (!session) {
      window.location.href = "login.html";
      return null;
    }
    return session;
  }

  async function redirectIfAuthed() {
    var session = await window.DB.getSession();
    if (session) window.location.href = "dashboard.html";
  }

  window.Auth = {
    pageName: pageName,
    requireAuth: requireAuth,
    redirectIfAuthed: redirectIfAuthed,
    async logout() {
      await window.DB.signOut();
      window.location.href = "login.html";
    }
  };
})(window, window.jQuery);
