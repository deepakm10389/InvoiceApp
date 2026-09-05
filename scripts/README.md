# Seed / import scripts

Data extracted from the existing .NET invoice app:

- `ManageClient.aspx` / `ManageItem.aspx` → masters
- `ManageBill.aspx` → bill headers

## Files

| File | Purpose |
|------|---------|
| [`seed-data/clients.json`](seed-data/clients.json) | ~290 clients + Address 1 each |
| [`seed-data/items.json`](seed-data/items.json) | 38 item master rows |
| [`seed-data/invoices.json`](seed-data/invoices.json) | Bill headers from ManageBill (summary lines) |
| [`../import-masters.html`](../import-masters.html) | One-click clients/items import |
| [`../import-bills.html`](../import-bills.html) | One-click bill import |
| [`generate-sql-preview.py`](generate-sql-preview.py) | Optional SQL preview helper |

## How to import

1. Sign in to the Invoice App (demo or Supabase).
2. Open **import-masters.html** and import clients/items first.
3. Open **import-bills.html** and import bills.
4. Duplicates are skipped (masters by name; bills by client + bill no + date + total).

## Bill import notes

- Old `ManageBill.aspx` lists headers only. Edit does not expose line items, so each imported bill is one summary line equal to the taxable subtotal.
- GST is recalculated at 18% (CGST+SGST).
- Many recent old-site bills show bill number `0`; those get the next free tax-invoice number in this app.

## Refresh seed from old app

Ask the agent to re-scrape, or re-run an authenticated export against:

- `http://twpl.i3techsolution.com/ManageClient.aspx`
- `http://twpl.i3techsolution.com/ManageItem.aspx`
- `http://twpl.i3techsolution.com/ManageBill.aspx`

Then replace the JSON files under `seed-data/`.
