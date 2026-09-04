# Invoice App

HTML + jQuery GST quotation / tax invoice app, rebuilt from the existing .NET + SQL Server application. Hosts free on **GitHub Pages** and uses **Supabase** (open-source Postgres) as the cloud database — or runs fully offline in **demo mode** with browser storage.

## Features

- Dashboard with counts and recent bills
- Clients master (CRUD + search/filter)
- Items master (CRUD + search/filter)
- Create / **edit** quotations and tax invoices with per-line **SFT / RFT / Other**
- Auto GST: CGST + SGST (intra-state) or IGST (inter-state)
- All Bills grid with search, date range, doc type, and client filters
- Printable / PDF report matching the original Quotation & Tax Invoice layout (letterhead, bank details, CGST/SGST/IGST %)
- Mobile-first responsive UI (hamburger menu, card lists on phones)
- Profile / letterhead + bank details + change password

## Quick start (demo mode — no signup needed)

1. Open the folder in a static file server, or simply open `login.html` via a local HTTP server.
2. Sign in with:
   - Email: `demo@invoice.local`
   - Password: `demo1234`
3. Explore Clients, Items, Create Invoice, All Bills, and Report / PDF.

```bash
cd "Documents/Deepak/Invoice/InvoiceApp"
python3 -m http.server 43127
```

Then open http://127.0.0.1:43127/

## Connect Supabase (free cloud database)

1. Create a free project at [https://supabase.com](https://supabase.com).
2. Open **SQL Editor** → paste and run [`supabase/schema.sql`](supabase/schema.sql).
3. Go to **Project Settings → API** and copy:
   - Project URL
   - `anon` public key
4. Paste them into [`assets/js/config.js`](assets/js/config.js):

```js
SUPABASE_URL: "https://YOUR_PROJECT.supabase.co",
SUPABASE_ANON_KEY: "YOUR_ANON_KEY",
```

5. Reload the app. The badge switches to **Cloud (Supabase)**. Sign up a new user, fill Profile (letterhead + bank), then create invoices. Data is shared across devices for that user (RLS keeps each user’s data private).

## Deploy free on GitHub Pages

1. Push this folder (or the whole repo) to GitHub.
2. Repository **Settings → Pages → Deploy from branch** → choose `main` (or your branch) and set the site root to `/` or the path that contains `index.html` (e.g. `/Documents/Deepak/Invoice App` if kept nested).
3. After deploy, open the Pages URL and sign in.

> Tip: for the cleanest Pages URL, put the app files at the repo root (or use a `docs/` folder). Nested under `Documents/Deepak/Invoice App` still works if you set that as the Pages path / use a project site.

## Project layout

```
Documents/Deepak/Invoice/InvoiceApp/
  index.html              # redirects to login or dashboard
  login.html
  dashboard.html
  create-invoice.html     # create + edit (?id=)
  invoices.html           # filtered grid + edit/report/delete
  clients.html
  items.html
  profile.html
  invoice-print.html      # Quotation / Tax Invoice report + PDF
  assets/css/styles.css
  assets/js/config.js
  assets/js/db.js         # Supabase or localStorage
  assets/js/auth.js
  assets/js/ui.js
  supabase/schema.sql
  README.md
```

## Notes

- Demo data is seeded with sample clients/items and one tax invoice so you can open a report immediately.
- Editing an existing bill and saving regenerates totals; open **Report** again to print / download the updated PDF.
- The anon key is safe in the frontend when Row Level Security (included in `schema.sql`) is enabled.
