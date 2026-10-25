#!/usr/bin/env python3
"""Build step (fleet-data migration, 2026-10-24): write the static health.json
that replaces the retired /api/health server function. The fleet watchdog
(scripts/watch.py in astercast/fleet-data) does the real checking now.
Writes {ok, built_at, data_files} into the deployed root (site/ when
vercel.json outputDirectory is "site", else the repo root)."""
import glob, json, os
from datetime import datetime, timezone

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
out = ROOT
try:
    cfg = json.load(open(os.path.join(ROOT, "vercel.json")))
    if cfg.get("outputDirectory") == "site":
        out = os.path.join(ROOT, "site")
except Exception:
    pass
count = len(glob.glob(os.path.join(ROOT, "data", "v1", "*.json")))
doc = {"ok": True,
       "built_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
       "data_files": count}
os.makedirs(out, exist_ok=True)
with open(os.path.join(out, "health.json"), "w", encoding="utf-8") as f:
    json.dump(doc, f, indent=1); f.write("\n")
print("health.json:", doc, "->", out)
