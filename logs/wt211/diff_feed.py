#!/usr/bin/env python3
"""Diff current feed vs the saved 2.10 baseline: changed flags + per-model source ok flips."""
import json, sys
base = json.load(open("logs/wt211/baseline-2.10-checks.json"))
cur = json.load(open("data/v1/model-checks.json"))
print("baseline checked_at:", base["checked_at"], "summary:", base["summary"])
print("current  checked_at:", cur["checked_at"], "summary:", cur["summary"])
bm = {m["model"]: m for m in base["models"]}
for m in cur["models"]:
    b = bm.get(m["model"], {})
    if m.get("changed") != b.get("changed") or m.get("source_status") != b.get("source_status"):
        print(f"MODEL {m['model']}: changed {b.get('changed')}->{m.get('changed')} status {b.get('source_status')}->{m.get('source_status')}")
    bs = {s["url"]: s for s in b.get("source_results", [])}
    for s in m.get("source_results", []):
        o = bs.get(s["url"])
        if o and (o.get("ok") != s.get("ok") or (s.get("ok") and o.get("signature") != s.get("signature") and not s.get("excluded_from_signature"))):
            print(f"  SRC {m['model']}: ok {o.get('ok')}->{s.get('ok')} sig {(o.get('signature') or '')[:8]}->{(s.get('signature') or '')[:8]} excl={s.get('excluded_from_signature')} {s['url'][:90]}")
q = json.load(open("data/v1/model-review-queue.json"))
print("queue pending:", q["pending"], "items:", len(q["items"]))
for it in q["items"]:
    if it.get("status") == "review":
        print("  REVIEW ITEM:", it.get("model"), it.get("source_url", "")[:90], it.get("detected_at"))
