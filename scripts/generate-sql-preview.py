#!/usr/bin/env python3
"""Generate SQL INSERT stubs from seed-data JSON (optional / reference).

Prefer using scripts/import-masters.html while signed in — it works for both
demo mode and Supabase with RLS using the logged-in user.

This script only prints SQL templates; user_id must be filled in.
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent / "seed-data"
clients = json.loads((ROOT / "clients.json").read_text(encoding="utf-8"))
items = json.loads((ROOT / "items.json").read_text(encoding="utf-8"))

print("-- Optional reference SQL. Replace :user_id with your auth.users.id")
print(f"-- Clients in seed: {len(clients)}")
print(f"-- Items in seed: {len(items)}")
print()
print("-- Prefer UI import: open /scripts/import-masters.html after login.")
print()
print("-- Example item inserts (user_id required):")
for it in items[:5]:
    name = it["item_name"].replace("'", "''")
    desc = (it.get("description") or "").replace("'", "''")
    print(
        f"insert into items (user_id, item_name, rate, description) values "
        f"(':user_id', '{name}', {it['rate']}, '{desc}');"
    )
print(f"-- ... {max(0, len(items)-5)} more items in seed-data/items.json")
