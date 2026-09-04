/**
 * Data layer: Supabase when configured, otherwise localStorage demo mode.
 */
(function (window, $) {
  "use strict";

  var STORAGE_KEY = "invoice_app_v1";
  var SESSION_KEY = "invoice_app_session";

  function uid() {
    return "id_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 9);
  }

  function todayISO() {
    var d = new Date();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + day;
  }

  function money(n) {
    var x = Number(n);
    if (!isFinite(x)) x = 0;
    return Math.round(x * 100) / 100;
  }

  function computeGst(subTotal, gstRate, sameState) {
    var rate = Number(gstRate);
    if (!isFinite(rate)) rate = window.APP_CONFIG.DEFAULT_GST_RATE || 18;
    subTotal = money(subTotal);
    var cgst = 0,
      sgst = 0,
      igst = 0,
      cgstPct = 0,
      sgstPct = 0,
      igstPct = 0;
    if (sameState) {
      cgstPct = rate / 2;
      sgstPct = rate / 2;
      cgst = money(subTotal * (cgstPct / 100));
      sgst = money(subTotal * (sgstPct / 100));
    } else {
      igstPct = rate;
      igst = money(subTotal * (igstPct / 100));
    }
    return {
      sub_total: subTotal,
      cgst_pct: cgstPct,
      sgst_pct: sgstPct,
      igst_pct: igstPct,
      cgst: cgst,
      sgst: sgst,
      igst: igst,
      total: money(subTotal + cgst + sgst + igst),
      gst_rate: rate
    };
  }

  function seedDemo() {
    var userId = "demo-user";
    var client1 = {
      id: "c1",
      user_id: userId,
      client_name: "Nitin Karwa",
      address: "Mahalaxmi",
      phone_no: "",
      mobile_no: "",
      gst_no: "",
      pan_no: "",
      state_code: "27",
      email_id: ""
    };
    var client2 = {
      id: "c2",
      user_id: userId,
      client_name: "Hind Aluminium Industries Limited",
      address:
        "Floor No 1St floor Building No Flat No B-1 Name Of Premises Building Tulsi Vihar Road Street DR A B Road City Town Village Worli Naka Worli Mumbai Maharashtra 400018",
      phone_no: "",
      mobile_no: "",
      gst_no: "27AAACA4671Q2Z7",
      pan_no: "",
      state_code: "27",
      email_id: ""
    };
    var items = [
      { id: "i1", user_id: userId, item_name: "PU Paint", rate: 245, description: "PU Paint" },
      { id: "i2", user_id: userId, item_name: "PU Polish", rate: 210, description: "PU Polish" },
      {
        id: "i3",
        user_id: userId,
        item_name: "Ceiling and wall painting",
        rate: 55,
        description: "Ceiling and wall painting"
      },
      {
        id: "i4",
        user_id: userId,
        item_name: "Covering and Cleaning",
        rate: 30000,
        description: "Covering and Cleaning"
      },
      {
        id: "i5",
        user_id: userId,
        item_name: "Wall Basecoat",
        rate: 40,
        description: "Wall Basecoat"
      },
      {
        id: "i6",
        user_id: userId,
        item_name: "Liquid Metal Finish",
        rate: 1200,
        description: "Liquid Metal Finish"
      }
    ];
    var profile = {
      id: userId,
      biller_name: "FAYANATH R. MAURYA",
      tagline: "FURNITURE POLISH, PAINTING, LAMINATION, SNOWCEM ,WHITE BASE,SENTEX",
      address: "B 308, Vimal Residency 1,\nNalasopara, Palghar,\nPincode : 401203.\nMaharashtra",
      gst_no: "27ARMPM1297L1Z4",
      pan_no: "ARMPM1297L",
      state_code: "27",
      phone: "9867272968",
      email: "fayanath986@gmail.com",
      bank_name: "Indian Bank",
      account_no: "6488851215",
      ifsc_code: "IDIB000D001",
      branch: "Dadar",
      proprietor_name: "Fayanath R Maurya"
    };

    var invItems = [
      {
        id: "li1",
        invoice_id: "inv1",
        item_id: "i3",
        item_name: "Ceiling and wall painting",
        type_name: "SFT",
        quantity: 3000,
        rate: 50,
        line_total: 150000
      },
      {
        id: "li2",
        invoice_id: "inv1",
        item_id: "i4",
        item_name: "Covering and Cleaning",
        type_name: "SFT",
        quantity: 1,
        rate: 30000,
        line_total: 30000
      }
    ];
    var gst = computeGst(180000, 18, true);
    var invoice = {
      id: "inv1",
      user_id: userId,
      doc_type: "tax_invoice",
      bill_number: 8,
      client_id: "c2",
      invoice_date: "2026-08-16",
      sac_code: "",
      gst_rate: gst.gst_rate,
      cgst_pct: gst.cgst_pct,
      sgst_pct: gst.sgst_pct,
      igst_pct: gst.igst_pct,
      sub_total: gst.sub_total,
      cgst: gst.cgst,
      sgst: gst.sgst,
      igst: gst.igst,
      total: gst.total,
      created_at: "2026-08-16T10:00:00.000Z"
    };

    return {
      users: [
        {
          id: userId,
          email: window.APP_CONFIG.DEMO_EMAIL,
          password: window.APP_CONFIG.DEMO_PASSWORD,
          name: profile.biller_name
        }
      ],
      profiles: [profile],
      clients: [client1, client2],
      items: items,
      invoices: [invoice],
      invoice_items: invItems,
      bill_seq: 8
    };
  }

  function loadStore() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        var seeded = seedDemo();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
        return seeded;
      }
      return JSON.parse(raw);
    } catch (e) {
      var fresh = seedDemo();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      return fresh;
    }
  }

  function saveStore(store) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }

  function getSession() {
    try {
      var raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setSession(session) {
    if (!session) localStorage.removeItem(SESSION_KEY);
    else localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  /* ---------- Local backend ---------- */
  var LocalDB = {
    mode: "demo",
    async getSession() {
      return getSession();
    },
    async signIn(email, password) {
      var store = loadStore();
      var user = store.users.find(function (u) {
        return u.email.toLowerCase() === String(email).toLowerCase() && u.password === password;
      });
      if (!user) throw new Error("Invalid email or password");
      var session = { user: { id: user.id, email: user.email, name: user.name }, mode: "demo" };
      setSession(session);
      return session;
    },
    async signUp(email, password, name) {
      var store = loadStore();
      if (
        store.users.some(function (u) {
          return u.email.toLowerCase() === String(email).toLowerCase();
        })
      ) {
        throw new Error("An account with this email already exists");
      }
      var id = uid();
      store.users.push({ id: id, email: email, password: password, name: name || email });
      store.profiles.push({
        id: id,
        biller_name: name || "My Business",
        tagline: "",
        address: "",
        gst_no: "",
        pan_no: "",
        state_code: "27",
        phone: "",
        email: email,
        bank_name: "",
        account_no: "",
        ifsc_code: "",
        branch: "",
        proprietor_name: name || ""
      });
      saveStore(store);
      var session = { user: { id: id, email: email, name: name || email }, mode: "demo" };
      setSession(session);
      return session;
    },
    async signOut() {
      setSession(null);
    },
    async changePassword(oldPass, newPass) {
      var session = getSession();
      if (!session) throw new Error("Not signed in");
      var store = loadStore();
      var user = store.users.find(function (u) {
        return u.id === session.user.id;
      });
      if (!user || user.password !== oldPass) throw new Error("Old password is incorrect");
      user.password = newPass;
      saveStore(store);
    },
    async getProfile() {
      var session = getSession();
      if (!session) return null;
      var store = loadStore();
      return (
        store.profiles.find(function (p) {
          return p.id === session.user.id;
        }) || null
      );
    },
    async saveProfile(data) {
      var session = getSession();
      if (!session) throw new Error("Not signed in");
      var store = loadStore();
      var idx = store.profiles.findIndex(function (p) {
        return p.id === session.user.id;
      });
      var profile = Object.assign({}, data, { id: session.user.id });
      if (idx >= 0) store.profiles[idx] = Object.assign({}, store.profiles[idx], profile);
      else store.profiles.push(profile);
      saveStore(store);
      return profile;
    },
    async listClients() {
      var session = getSession();
      var store = loadStore();
      return store.clients
        .filter(function (c) {
          return c.user_id === session.user.id;
        })
        .slice()
        .sort(function (a, b) {
          return a.client_name.localeCompare(b.client_name);
        });
    },
    async saveClient(client) {
      var session = getSession();
      var store = loadStore();
      if (client.id) {
        var idx = store.clients.findIndex(function (c) {
          return c.id === client.id && c.user_id === session.user.id;
        });
        if (idx < 0) throw new Error("Client not found");
        store.clients[idx] = Object.assign({}, store.clients[idx], client, {
          user_id: session.user.id
        });
        saveStore(store);
        return store.clients[idx];
      }
      var row = Object.assign({}, client, { id: uid(), user_id: session.user.id });
      store.clients.push(row);
      saveStore(store);
      return row;
    },
    async deleteClient(id) {
      var session = getSession();
      var store = loadStore();
      store.clients = store.clients.filter(function (c) {
        return !(c.id === id && c.user_id === session.user.id);
      });
      saveStore(store);
    },
    async listItems() {
      var session = getSession();
      var store = loadStore();
      return store.items
        .filter(function (i) {
          return i.user_id === session.user.id;
        })
        .slice()
        .sort(function (a, b) {
          return a.item_name.localeCompare(b.item_name);
        });
    },
    async saveItem(item) {
      var session = getSession();
      var store = loadStore();
      if (item.id) {
        var idx = store.items.findIndex(function (i) {
          return i.id === item.id && i.user_id === session.user.id;
        });
        if (idx < 0) throw new Error("Item not found");
        store.items[idx] = Object.assign({}, store.items[idx], item, {
          user_id: session.user.id
        });
        saveStore(store);
        return store.items[idx];
      }
      var row = Object.assign({}, item, { id: uid(), user_id: session.user.id });
      store.items.push(row);
      saveStore(store);
      return row;
    },
    async deleteItem(id) {
      var session = getSession();
      var store = loadStore();
      store.items = store.items.filter(function (i) {
        return !(i.id === id && i.user_id === session.user.id);
      });
      saveStore(store);
    },
    async listInvoices() {
      var session = getSession();
      var store = loadStore();
      var clients = {};
      store.clients.forEach(function (c) {
        clients[c.id] = c;
      });
      var profile = store.profiles.find(function (p) {
        return p.id === session.user.id;
      });
      return store.invoices
        .filter(function (inv) {
          return inv.user_id === session.user.id;
        })
        .map(function (inv) {
          return Object.assign({}, inv, {
            client_name: clients[inv.client_id] ? clients[inv.client_id].client_name : "",
            biller_name: profile ? profile.biller_name : ""
          });
        })
        .sort(function (a, b) {
          return String(b.invoice_date).localeCompare(String(a.invoice_date));
        });
    },
    async getInvoice(id) {
      var session = getSession();
      var store = loadStore();
      var inv = store.invoices.find(function (i) {
        return i.id === id && i.user_id === session.user.id;
      });
      if (!inv) return null;
      var client = store.clients.find(function (c) {
        return c.id === inv.client_id;
      });
      var items = store.invoice_items.filter(function (li) {
        return li.invoice_id === inv.id;
      });
      var profile = store.profiles.find(function (p) {
        return p.id === session.user.id;
      });
      return {
        invoice: inv,
        client: client || null,
        items: items,
        profile: profile || null
      };
    },
    async nextBillNumber() {
      var session = getSession();
      var store = loadStore();
      var max = 0;
      store.invoices.forEach(function (inv) {
        if (inv.user_id === session.user.id && Number(inv.bill_number) > max) {
          max = Number(inv.bill_number);
        }
      });
      return max + 1;
    },
    async saveInvoice(payload) {
      var session = getSession();
      var store = loadStore();
      var profile = store.profiles.find(function (p) {
        return p.id === session.user.id;
      });
      var client = store.clients.find(function (c) {
        return c.id === payload.client_id && c.user_id === session.user.id;
      });
      if (!client) throw new Error("Please select a client");
      if (!payload.items || !payload.items.length) throw new Error("Add at least one line item");

      var sameState =
        String(profile && profile.state_code ? profile.state_code : "") ===
        String(client.state_code || "");
      var sub = 0;
      payload.items.forEach(function (li) {
        sub += money(Number(li.quantity) * Number(li.rate));
      });
      var gst = computeGst(sub, payload.gst_rate, sameState);
      var docType = payload.doc_type || "tax_invoice";
      var billNumber = Number(payload.bill_number);
      if (docType === "quotation") billNumber = 0;
      else if (!billNumber) billNumber = await this.nextBillNumber();

      var invoiceId = payload.id || uid();
      var invoice = {
        id: invoiceId,
        user_id: session.user.id,
        doc_type: docType,
        bill_number: billNumber,
        client_id: payload.client_id,
        invoice_date: payload.invoice_date || todayISO(),
        sac_code: payload.sac_code || "",
        gst_rate: gst.gst_rate,
        cgst_pct: gst.cgst_pct,
        sgst_pct: gst.sgst_pct,
        igst_pct: gst.igst_pct,
        sub_total: gst.sub_total,
        cgst: gst.cgst,
        sgst: gst.sgst,
        igst: gst.igst,
        total: gst.total,
        created_at: payload.created_at || new Date().toISOString()
      };

      var existingIdx = store.invoices.findIndex(function (i) {
        return i.id === invoiceId;
      });
      if (existingIdx >= 0) {
        store.invoices[existingIdx] = invoice;
        store.invoice_items = store.invoice_items.filter(function (li) {
          return li.invoice_id !== invoiceId;
        });
      } else {
        store.invoices.push(invoice);
      }

      payload.items.forEach(function (li) {
        store.invoice_items.push({
          id: uid(),
          invoice_id: invoiceId,
          item_id: li.item_id || null,
          item_name: li.item_name,
          type_name: li.type_name || "SFT",
          quantity: money(li.quantity),
          rate: money(li.rate),
          line_total: money(Number(li.quantity) * Number(li.rate))
        });
      });

      if (billNumber > (store.bill_seq || 0)) store.bill_seq = billNumber;
      saveStore(store);
      return invoice;
    },
    async deleteInvoice(id) {
      var session = getSession();
      var store = loadStore();
      store.invoices = store.invoices.filter(function (i) {
        return !(i.id === id && i.user_id === session.user.id);
      });
      store.invoice_items = store.invoice_items.filter(function (li) {
        return li.invoice_id !== id;
      });
      saveStore(store);
    },
    async getDashboard() {
      var invoices = await this.listInvoices();
      var clients = await this.listClients();
      var items = await this.listItems();
      var revenue = invoices.reduce(function (sum, i) {
        return sum + Number(i.total || 0);
      }, 0);
      return {
        invoiceCount: invoices.length,
        clientCount: clients.length,
        itemCount: items.length,
        revenue: money(revenue),
        recent: invoices.slice(0, 5)
      };
    }
  };

  /* ---------- Supabase backend ---------- */
  function createSupabaseDB(client) {
    async function requireUser() {
      var res = await client.auth.getSession();
      var session = res.data && res.data.session;
      if (!session) throw new Error("Not signed in");
      return session.user;
    }

    return {
      mode: "supabase",
      async getSession() {
        var res = await client.auth.getSession();
        var session = res.data && res.data.session;
        if (!session) return null;
        return {
          user: {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata && session.user.user_metadata.name
          },
          mode: "supabase"
        };
      },
      async signIn(email, password) {
        var res = await client.auth.signInWithPassword({ email: email, password: password });
        if (res.error) throw new Error(res.error.message);
        return this.getSession();
      },
      async signUp(email, password, name) {
        var res = await client.auth.signUp({
          email: email,
          password: password,
          options: { data: { name: name || "" } }
        });
        if (res.error) throw new Error(res.error.message);
        return this.getSession();
      },
      async signOut() {
        await client.auth.signOut();
      },
      async changePassword(oldPass, newPass) {
        var session = await this.getSession();
        if (!session) throw new Error("Not signed in");
        var check = await client.auth.signInWithPassword({
          email: session.user.email,
          password: oldPass
        });
        if (check.error) throw new Error("Old password is incorrect");
        var res = await client.auth.updateUser({ password: newPass });
        if (res.error) throw new Error(res.error.message);
      },
      async getProfile() {
        var user = await requireUser();
        var res = await client.from("profiles").select("*").eq("id", user.id).maybeSingle();
        if (res.error) throw new Error(res.error.message);
        return res.data;
      },
      async saveProfile(data) {
        var user = await requireUser();
        var row = Object.assign({}, data, { id: user.id });
        var res = await client.from("profiles").upsert(row).select().single();
        if (res.error) throw new Error(res.error.message);
        return res.data;
      },
      async listClients() {
        await requireUser();
        var res = await client.from("clients").select("*").order("client_name");
        if (res.error) throw new Error(res.error.message);
        return res.data || [];
      },
      async saveClient(clientRow) {
        var user = await requireUser();
        var row = Object.assign({}, clientRow, { user_id: user.id });
        if (!row.id) delete row.id;
        var res = await client.from("clients").upsert(row).select().single();
        if (res.error) throw new Error(res.error.message);
        return res.data;
      },
      async deleteClient(id) {
        await requireUser();
        var res = await client.from("clients").delete().eq("id", id);
        if (res.error) throw new Error(res.error.message);
      },
      async listItems() {
        await requireUser();
        var res = await client.from("items").select("*").order("item_name");
        if (res.error) throw new Error(res.error.message);
        return res.data || [];
      },
      async saveItem(item) {
        var user = await requireUser();
        var row = Object.assign({}, item, { user_id: user.id });
        if (!row.id) delete row.id;
        var res = await client.from("items").upsert(row).select().single();
        if (res.error) throw new Error(res.error.message);
        return res.data;
      },
      async deleteItem(id) {
        await requireUser();
        var res = await client.from("items").delete().eq("id", id);
        if (res.error) throw new Error(res.error.message);
      },
      async listInvoices() {
        await requireUser();
        var res = await client
          .from("invoices")
          .select("*, clients(client_name), profiles:user_id(biller_name)")
          .order("invoice_date", { ascending: false });
        if (res.error) {
          // fallback without join aliases
          var plain = await client
            .from("invoices")
            .select("*, clients(client_name)")
            .order("invoice_date", { ascending: false });
          if (plain.error) throw new Error(plain.error.message);
          var profile = await this.getProfile();
          return (plain.data || []).map(function (inv) {
            return Object.assign({}, inv, {
              client_name: inv.clients ? inv.clients.client_name : "",
              biller_name: profile ? profile.biller_name : ""
            });
          });
        }
        var profile2 = await this.getProfile();
        return (res.data || []).map(function (inv) {
          return Object.assign({}, inv, {
            client_name: inv.clients ? inv.clients.client_name : "",
            biller_name: profile2 ? profile2.biller_name : ""
          });
        });
      },
      async getInvoice(id) {
        await requireUser();
        var invRes = await client.from("invoices").select("*").eq("id", id).maybeSingle();
        if (invRes.error) throw new Error(invRes.error.message);
        if (!invRes.data) return null;
        var clientRes = await client
          .from("clients")
          .select("*")
          .eq("id", invRes.data.client_id)
          .maybeSingle();
        var itemsRes = await client
          .from("invoice_items")
          .select("*")
          .eq("invoice_id", id)
          .order("id");
        var profile = await this.getProfile();
        return {
          invoice: invRes.data,
          client: clientRes.data || null,
          items: itemsRes.data || [],
          profile: profile
        };
      },
      async nextBillNumber() {
        await requireUser();
        var res = await client
          .from("invoices")
          .select("bill_number")
          .order("bill_number", { ascending: false })
          .limit(1);
        if (res.error) throw new Error(res.error.message);
        var max = res.data && res.data[0] ? Number(res.data[0].bill_number) : 0;
        return (max || 0) + 1;
      },
      async saveInvoice(payload) {
        var user = await requireUser();
        var profile = await this.getProfile();
        var clientRes = await client
          .from("clients")
          .select("*")
          .eq("id", payload.client_id)
          .maybeSingle();
        if (clientRes.error || !clientRes.data) throw new Error("Please select a client");
        if (!payload.items || !payload.items.length) throw new Error("Add at least one line item");

        var sameState =
          String(profile && profile.state_code ? profile.state_code : "") ===
          String(clientRes.data.state_code || "");
        var sub = 0;
        payload.items.forEach(function (li) {
          sub += money(Number(li.quantity) * Number(li.rate));
        });
        var gst = computeGst(sub, payload.gst_rate, sameState);
        var docType = payload.doc_type || "tax_invoice";
        var billNumber = Number(payload.bill_number);
        if (docType === "quotation") billNumber = 0;
        else if (!billNumber) billNumber = await this.nextBillNumber();

        var invoice = {
          user_id: user.id,
          doc_type: docType,
          bill_number: billNumber,
          client_id: payload.client_id,
          invoice_date: payload.invoice_date || todayISO(),
          sac_code: payload.sac_code || "",
          gst_rate: gst.gst_rate,
          cgst_pct: gst.cgst_pct,
          sgst_pct: gst.sgst_pct,
          igst_pct: gst.igst_pct,
          sub_total: gst.sub_total,
          cgst: gst.cgst,
          sgst: gst.sgst,
          igst: gst.igst,
          total: gst.total
        };
        if (payload.id) invoice.id = payload.id;

        var invRes = await client.from("invoices").upsert(invoice).select().single();
        if (invRes.error) throw new Error(invRes.error.message);
        var invoiceId = invRes.data.id;

        if (payload.id) {
          await client.from("invoice_items").delete().eq("invoice_id", invoiceId);
        }
        var lines = payload.items.map(function (li) {
          return {
            invoice_id: invoiceId,
            item_id: li.item_id || null,
            item_name: li.item_name,
            type_name: li.type_name || "SFT",
            quantity: money(li.quantity),
            rate: money(li.rate),
            line_total: money(Number(li.quantity) * Number(li.rate))
          };
        });
        var liRes = await client.from("invoice_items").insert(lines);
        if (liRes.error) throw new Error(liRes.error.message);
        return invRes.data;
      },
      async deleteInvoice(id) {
        await requireUser();
        await client.from("invoice_items").delete().eq("invoice_id", id);
        var res = await client.from("invoices").delete().eq("id", id);
        if (res.error) throw new Error(res.error.message);
      },
      async getDashboard() {
        var invoices = await this.listInvoices();
        var clients = await this.listClients();
        var items = await this.listItems();
        var revenue = invoices.reduce(function (sum, i) {
          return sum + Number(i.total || 0);
        }, 0);
        return {
          invoiceCount: invoices.length,
          clientCount: clients.length,
          itemCount: items.length,
          revenue: money(revenue),
          recent: invoices.slice(0, 5)
        };
      }
    };
  }

  function initDB() {
    if (window.APP_CONFIG.useSupabase() && window.supabase) {
      var sb = window.supabase.createClient(
        window.APP_CONFIG.SUPABASE_URL,
        window.APP_CONFIG.SUPABASE_ANON_KEY
      );
      window.DB = createSupabaseDB(sb);
      window.supabaseClient = sb;
    } else {
      window.DB = LocalDB;
      window.supabaseClient = null;
    }
    window.DB.helpers = {
      uid: uid,
      money: money,
      todayISO: todayISO,
      computeGst: computeGst,
      formatMoney: function (n) {
        return money(n).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
      },
      formatDate: function (iso) {
        if (!iso) return "";
        var p = String(iso).slice(0, 10).split("-");
        if (p.length !== 3) return iso;
        return p[2] + "/" + p[1] + "/" + p[0];
      }
    };
  }

  window.initDB = initDB;
})(window, window.jQuery);
