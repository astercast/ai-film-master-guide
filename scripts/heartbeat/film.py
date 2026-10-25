"""Film heartbeat (bundle 2026-10-24, RECORD section 11.1).

Runs every 6 hours from .github/workflows/heartbeat.yml (cron 7 */6).
Checks, in order:
  1. ALL 44 model source pages, by reusing the repo's own checker
     (scripts/refresh/check_models.py main()). That checker never
     edits models.json or any price: a moved source signature lands
     in data/v1/model-review-queue.json for a human, and here it
     also lands on the Wire as an Unconfirmed item. Price-shaped
     signals (the checker's price_signal extracts) are labelled
     price-signal and are NEVER applied to pricing data by this job.
  2. Hugging Face text-to-video model list (new models -> Wire,
     Unconfirmed: one automated sighting is not a verification).
  3. arXiv video-generation papers (new papers -> Wire, Unconfirmed).
  4. Hacker News "AI video" stories at 50+ points (Wire, Unconfirmed).
  5. GitHub release feeds (diffusers, ComfyUI) (Wire, Unconfirmed).

This job creates Verified wire items NEVER: Verified is reserved for
the curated record (data/v1/model-history.json, seeded into the Wire
by scripts/build_wire_seed.py). Everything automated is Unconfirmed
until a human promotes it.

Env AFMG_HEARTBEAT_LIGHT=1 skips the full model check (smoke tests);
the models source then reports the last published check file instead.
Stdlib only, via scripts/heartbeat/lib.py.
"""
import os
import re
import sys

sys.path.insert(0, os.path.dirname(__file__))
from lib import Pulse, get, get_json, now, read, write_if_changed  # noqa: E402

ROOT = os.path.join(os.path.dirname(__file__), "..", "..")
STATE_NAME = "heartbeat-state.json"
WIRE_NAME = "wire.json"

GH_FEEDS = [
    ("diffusers", "https://github.com/huggingface/diffusers/releases.atom"),
    ("comfyui", "https://github.com/comfyanonymous/ComfyUI/releases.atom"),
]


def load_wire():
    doc = read(WIRE_NAME, {"format": "wire/1", "items": []})
    return doc.get("items", [])


def save_wire(new_items, pulse):
    """Prepend new items, dedupe by id, cap at 150. Returns count added."""
    items = load_wire()
    known = {i.get("id") for i in items}
    added = [i for i in new_items if i.get("id") not in known]
    if not added:
        return 0
    merged = added + items
    merged.sort(key=lambda i: str(i.get("at", "")), reverse=True)
    write_if_changed(WIRE_NAME, {"format": "wire/1", "generated_at": now(),
                                 "items": merged[:150]},
                     volatile=("generated_at",))
    for i in added:
        pulse.change(i.get("kind", "wire"), i.get("title", ""), i.get("url"))
    return len(added)


def wire_item(id_, at, model, title, url, kind):
    return {"id": id_, "at": at, "model": model, "title": title,
            "url": url, "kind": kind, "label": "Unconfirmed",
            "source": "heartbeat"}


def check_models_step(pulse):
    """Step 1: the 44 model pages, via the repo's own checker."""
    if os.environ.get("AFMG_HEARTBEAT_LIGHT") == "1":
        checks = read("model-checks.json", {})
        summ = checks.get("summary", {})
        ok = bool(checks)
        pulse.source("models", "Model source pages (44)", ok,
                     summ.get("models_total", 0),
                     None if ok else "no published check file",
                     "data/v1/model-checks.json")
        return []
    import importlib.util
    path = os.path.join(ROOT, "scripts", "refresh", "check_models.py")
    spec = importlib.util.spec_from_file_location("afmg_check_models", path)
    mod = importlib.util.module_from_spec(spec)
    try:
        spec.loader.exec_module(mod)
        rc = mod.main()
    except Exception as e:  # noqa: BLE001 - one bad step must not kill the beat
        pulse.source("models", "Model source pages (44)", False, 0,
                     type(e).__name__, "data/v1/model-checks.json")
        return []
    checks = read("model-checks.json", {})
    summ = checks.get("summary", {})
    total = summ.get("models_total", 0)
    ok = (rc == 0 and total > 0)
    pulse.source("models", "Model source pages (44)", ok, total,
                 None if ok else f"checker rc={rc}",
                 "data/v1/model-checks.json")
    items = []
    for rec in checks.get("models", []):
        if not rec.get("changed"):
            continue
        sig_names = {s.get("name") for s in rec.get("signals", [])}
        is_price = "price_signal" in sig_names
        kind = "price-signal" if is_price else "source-change"
        title = (f"{rec['model']}: source pages changed"
                 + (" - price-shaped text spotted, queued for human review; "
                    "this job never edits prices" if is_price else
                    " - queued for human review"))
        items.append(wire_item(
            f"check-{rec['model']}-{str(rec.get('last_checked',''))[:10]}",
            str(rec.get("last_checked", now())),
            rec["model"], title,
            (rec.get("moved_urls") or [None])[0], kind))
    return items


def hf_step(pulse, state):
    url = ("https://huggingface.co/api/models?pipeline_tag=text-to-video"
           "&sort=lastModified&direction=-1&limit=30")
    data, err = get_json(url)
    items = []
    if data:
        seen = set(state.get("hf", []))
        for m in data:
            mid = m.get("id")
            if mid and mid not in seen:
                items.append(wire_item(
                    f"hf-{mid}", str(m.get("lastModified", now()))[:19] + "Z"
                    if m.get("lastModified") else now(),
                    mid, f"New text-to-video model listed on Hugging Face: {mid}",
                    f"https://huggingface.co/{mid}", "new-model"))
        state["hf"] = sorted({m.get("id") for m in data if m.get("id")} | seen)
    pulse.source("hf", "Hugging Face text-to-video list", bool(data),
                 len(data) if data else 0, err, url)
    return items


def arxiv_step(pulse, state):
    url = ("http://export.arxiv.org/api/query?search_query=all:%22video+generation%22"
           "&start=0&max_results=20&sortBy=submittedDate&sortOrder=descending")
    raw, err = get(url)
    items = []
    if raw:
        text = raw.decode("utf-8", errors="ignore")
        seen = set(state.get("arxiv", []))
        found = []
        for entry in re.findall(r"<entry>(.*?)</entry>", text, re.S):
            idm = re.search(r"<id>(http[^<]+)</id>", entry)
            tm = re.search(r"<title>(.*?)</title>", entry, re.S)
            dm = re.search(r"<published>(.*?)</published>", entry)
            if not (idm and tm):
                continue
            aid = idm.group(1).strip()
            found.append(aid)
            if aid not in seen:
                title = re.sub(r"\s+", " ", tm.group(1)).strip()
                items.append(wire_item(
                    f"arxiv-{aid.rsplit('/', 1)[-1]}",
                    dm.group(1).strip() if dm else now(),
                    "", f"New arXiv paper: {title}", aid, "paper"))
        state["arxiv"] = sorted(set(found) | seen)
    pulse.source("arxiv", "arXiv video generation", bool(raw),
                 len(state.get("arxiv", [])), err, url)
    return items


def hn_step(pulse, state):
    url = ("https://hn.algolia.com/api/v1/search?query=AI%20video&tags=story"
           "&numericFilters=points%3E%3D50&hitsPerPage=20")
    data, err = get_json(url)
    items = []
    if data:
        seen = set(state.get("hn", []))
        hits = data.get("hits", [])
        for h in hits:
            oid = str(h.get("objectID", ""))
            if oid and oid not in seen and h.get("title"):
                items.append(wire_item(
                    f"hn-{oid}", h.get("created_at", now()), "",
                    h["title"],
                    h.get("url") or f"https://news.ycombinator.com/item?id={oid}",
                    "story"))
        state["hn"] = sorted({str(h.get("objectID")) for h in hits} | seen)
    pulse.source("hn", "Hacker News AI video (50+ points)", bool(data),
                 len(data.get("hits", [])) if data else 0, err, url)
    return items


def github_step(pulse, state):
    items = []
    all_ok = True
    total = 0
    for name, url in GH_FEEDS:
        raw, err = get(url)
        if not raw:
            all_ok = False
            continue
        text = raw.decode("utf-8", errors="ignore")
        seen = set(state.get(f"gh-{name}", []))
        found = []
        for entry in re.findall(r"<entry>(.*?)</entry>", text, re.S)[:5]:
            idm = re.search(r"<id>([^<]+)</id>", entry)
            tm = re.search(r"<title>(.*?)</title>", entry, re.S)
            lm = re.search(r'<link[^>]+href="([^"]+)"', entry)
            dm = re.search(r"<updated>(.*?)</updated>", entry)
            if not (idm and tm):
                continue
            total += 1
            found.append(idm.group(1))
            if idm.group(1) not in seen:
                items.append(wire_item(
                    f"gh-{name}-{idm.group(1).rsplit('/', 1)[-1]}",
                    dm.group(1).strip() if dm else now(), name,
                    f"{name} release: {re.sub(chr(92)+'s+', ' ', tm.group(1)).strip()}",
                    lm.group(1) if lm else url, "release"))
        state[f"gh-{name}"] = sorted(set(found) | seen)
    pulse.source("github", "GitHub release feeds", all_ok, total,
                 None if all_ok else "a feed did not answer",
                 "https://github.com/huggingface/diffusers/releases")
    return items


def main():
    pulse = Pulse()
    state = read(STATE_NAME, {})
    new_items = []
    new_items += check_models_step(pulse)
    new_items += hf_step(pulse, state)
    new_items += arxiv_step(pulse, state)
    new_items += hn_step(pulse, state)
    new_items += github_step(pulse, state)
    added = save_wire(new_items, pulse)
    write_if_changed(STATE_NAME, state, volatile=())
    pulse.write()
    print(f"[heartbeat] wire +{added} new item(s); "
          f"sources ok {pulse.prev and ''}"
          f"{sum(1 for s in pulse.sources.values() if s['ok'])}/{len(pulse.sources)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
