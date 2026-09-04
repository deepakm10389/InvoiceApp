# Seed / import scripts

Data extracted from the existing .NET invoice app (`ManageClient.aspx` / `ManageItem.aspx`).

## Files

| File | Purpose |
|------|---------|
| [`seed-data/clients.json`](seed-data/clients.json) | ~290 clients + Address 1 each |
| [`seed-data/items.json`](seed-data/items.json) | 38 item master rows |
| [`../import-masters.html`](../import-masters.html) | One-click import into the signed-in account |
| [`generate-sql-preview.py`](generate-sql-preview.py) | Optional SQL preview helper |

## How to import

1. Sign in to the Invoice App (demo or Supabase).
2. Open: **http://127.0.0.1:43127/import-masters.html**
3. Click **Import into my account**.
4. Duplicates (same client/item name) are skipped; new addresses are added when missing.

## Refresh seed from old app

If the old app gets new masters, ask the agent to re-scrape, or re-run the authenticated export against:

- `http://twpl.i3techsolution.com/ManageClient.aspx`
- `http://twpl.i3techsolution.com/ManageItem.aspx`

Then replace the JSON files under `seed-data/`.
