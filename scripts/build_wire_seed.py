#!/usr/bin/env python3
"""Seed data/v1/wire.json + data/v1/pulse.json from the curated record.

Wire labels are honest by construction:
  - Verified: events from data/v1/model-history.json (the curated,
    human-verified event log) only.
  - Unconfirmed: standing watches from data/v1/model-review-queue.json
    (items with a `status` and no `detected_at`).
The heartbeat (scripts/heartbeat/run.py) only ever appends
Unconfirmed items; it never mints a Verified one and never edits
prices. Safe to re-run: it rebuilds the seed portion and keeps any
heartbeat items already on the wire.
"""
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
V1 = ROOT / "data" / "v1"


def now_iso():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def main():
    history = json.loads((V1 / "model-history.json").read_text())
    queue = json.loads((V1 / "model-review-queue.json").read_text())
    checks = json.loads((V1 / "model-checks.json").read_text())

    items = []
    for e in sorted(history.get("events", []),
                    key=lambda x: (x["date"], x["id"]), reverse=True)[:60]:
        items.append({
            "id": f"history-{e['id']}", "at": e["date"],
            "model": e.get("model", ""), "title": e.get("summary", ""),
            "url": None, "kind": e.get("kind", "event"),
            "label": "Verified", "source": "model-history",
        })
    for it in queue.get("items", []):
        if "detected_at" in it:
            continue  # heartbeat territory; the checker owns those
        note = (it.get("note") or "").strip()
        title = f"{it.get('model', 'Watch')}: standing watch"
        if note:
            title += " - " + note.split(". ")[0][:180]
        items.append({
            "id": f"watch-{it.get('model', 'item')}",
            "at": str(queue.get("generated_at", ""))[:10],
            "model": it.get("model", ""), "title": title,
            "url": None, "kind": "watch",
            "label": "Unconfirmed", "source": "review-queue",
        })

    wire_path = V1 / "wire.json"
    if wire_path.exists():
        try:
            old = json.loads(wire_path.read_text()).get("items", [])
            seed_ids = {i["id"] for i in items}
            items += [i for i in old
                      if i.get("source") == "heartbeat" and i["id"] not in seed_ids]
        except Exception:  # noqa: BLE001 - corrupt wire: reseed clean
            pass
    items.sort(key=lambda i: str(i.get("at", "")), reverse=True)
    doc = {"format": "wire/1", "generated_at": now_iso(), "items": items[:150]}
    wire_path.write_text(json.dumps(doc, indent=1, ensure_ascii=False) + "\n")

    checked = str(checks.get("checked_at", ""))
    pulse = {
        "format": "pulse/1", "generated_at": now_iso(), "healthy": False,
        "sources_ok": 1, "sources_total": 5,
        "sources": [
            {"id": "models", "label": "Model source pages (44)",
             "url": "data/v1/model-checks.json", "ok": True,
             "items": checks.get("summary", {}).get("models_total", 44),
             "checked_at": now_iso(),
             "last_ok_at": checked.replace("+00:00", "Z") if checked else None,
             "error": None, "fails_in_a_row": 0},
            {"id": "hf", "label": "Hugging Face text-to-video list",
             "url": "https://huggingface.co/api/models", "ok": False,
             "items": 0, "checked_at": now_iso(), "last_ok_at": None,
             "error": "not yet run", "fails_in_a_row": 0},
            {"id": "arxiv", "label": "arXiv video generation",
             "url": "http://export.arxiv.org/api/query", "ok": False,
             "items": 0, "checked_at": now_iso(), "last_ok_at": None,
             "error": "not yet run", "fails_in_a_row": 0},
            {"id": "hn", "label": "Hacker News AI video (50+ points)",
             "url": "https://hn.algolia.com/api", "ok": False,
             "items": 0, "checked_at": now_iso(), "last_ok_at": None,
             "error": "not yet run", "fails_in_a_row": 0},
            {"id": "github", "label": "GitHub release feeds",
             "url": "https://github.com/huggingface/diffusers/releases",
             "ok": False, "items": 0, "checked_at": now_iso(),
             "last_ok_at": None, "error": "not yet run", "fails_in_a_row": 0},
        ],
        "changes": [],
    }
    (V1 / "pulse.json").write_text(json.dumps(pulse, indent=1) + "\n")
    print(f"[wire-seed] {len(doc['items'])} items "
          f"({sum(1 for i in doc['items'] if i['label'] == 'Verified')} verified, "
          f"{sum(1 for i in doc['items'] if i['label'] == 'Unconfirmed')} unconfirmed); "
          "pulse.json seeded (models source from last published check)")


if __name__ == "__main__":
    main()
