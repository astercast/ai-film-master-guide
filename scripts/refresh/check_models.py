#!/usr/bin/env python3
"""Weekly AI-video-model freshness checker (Model Watch).

Reads data/v1/models.json, fetches each model's official source URLs
(changelog/pricing/announcement pages from the model's `sources`, plus any
per-model `extra_urls` in scripts/refresh/model-check-config.json),
computes a content signature per source, and compares against the stored
signatures from the previous run.

Additionally (public, no-key only): each model may carry a `news_query` in the
config. The checker pulls Google News RSS for that query and stores the latest
headlines in the record's `news_headlines` for review. News is PASSIVE SIGNAL, it never feeds the change signature (news churn would flag everything weekly).

Outputs (committed):
  data/v1/model-checks.json, per-model freshness records + run summary
  data/v1/model-review-queue.json, models whose sources changed since last
                                    run, awaiting HUMAN/AGENT review. Standing
                                    hand-authored watch items in the queue are
                                    preserved across runs, never overwritten.

Promotion workflow (models.json is NEVER mutated by this script, fetched
pages are unreliable signals, so price/status changes always need a person):
  1. Review queue lists models with changed=true plus the evidence
     (signature diff, signal excerpts, source URLs).
  2. An agent (or human) opens the flagged source URLs, verifies what really
     changed (price? version? discontinuation? noise?), and, only when
     confirmed, edits data/v1/models.json (last_verified, status,
     est_cost_credits, what_changed, sources).
  3. Re-run `python3 scripts/build_api.py`, inspect the git diff, commit,
     push. The next weekly check then establishes a new baseline.

Per-source failures (HTTP errors, timeouts, bad URLs) are recorded on the
model's record and do NOT kill the run. Exit code is 0 on partial success;
non-zero only if the config or models.json cannot even be loaded.

Stdlib only (urllib). Called weekly from scripts/refresh/refresh.sh.
"""

import hashlib
import json
import re
import sys
import time
import urllib.request
import urllib.error
import urllib.parse
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
MODELS_JSON = ROOT / "data" / "v1" / "models.json"
CONFIG_JSON = Path(__file__).resolve().parent / "model-check-config.json"
CHECKS_JSON = ROOT / "data" / "v1" / "model-checks.json"
QUEUE_JSON = ROOT / "data" / "v1" / "model-review-queue.json"


def now_iso():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def clean_text(html):
    """Strip scripts/styles/tags, collapse whitespace -> comparable text."""
    t = re.sub(r"(?is)<(script|style|noscript)[^>]*>.*?</\1\s*>", " ", html)
    t = re.sub(r"(?s)<!--.*?-->", " ", t)
    t = re.sub(r"(?s)<[^>]+>", " ", t)
    t = re.sub(r"\s+", " ", t)
    return t.strip()


def fetch(url, timeout, max_bytes, user_agent):
    """Return (ok, status, text, error). Never raises."""
    req = urllib.request.Request(url, headers={"User-Agent": user_agent})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            status = resp.status
            raw = resp.read(max_bytes + 1)
            text = raw[:max_bytes].decode("utf-8", errors="ignore")
            return True, status, text, None
    except urllib.error.HTTPError as e:
        return False, getattr(e, "code", None), "", f"HTTPError {getattr(e, 'code', '?')}"
    except urllib.error.URLError as e:
        return False, None, "", f"URLError: {getattr(e, 'reason', e)}"
    except TimeoutError:
        return False, None, "", "timeout"
    except Exception as e:  # noqa: BLE001, one bad URL must not kill the run
        return False, None, "", f"{type(e).__name__}: {e}"


def parse_rss_items(rss_text, max_items):
    """Extract (title, pubDate) pairs from a Google News RSS feed. Never raises."""
    items = []
    try:
        for m in re.finditer(r"<item>(.*?)</item>", rss_text, re.S):
            body = m.group(1)
            tm = re.search(r"<title>(.*?)</title>", body, re.S)
            dm = re.search(r"<pubDate>(.*?)</pubDate>", body, re.S)
            if tm:
                title = re.sub(r"\s+", " ", re.sub(r"<!\[CDATA\[|\]\]>", "", tm.group(1))).strip()
                date = dm.group(1).strip() if dm else ""
                if title:
                    items.append({"title": title, "date": date})
            if len(items) >= max_items:
                break
    except Exception:  # noqa: BLE001, malformed RSS: just return what we have
        pass
    return items


def apply_extracts(texts, extracts):
    hits = []
    for spec in extracts:
        try:
            rx = re.compile(spec["pattern"])
        except re.error as e:
            hits.append({"name": spec["name"], "error": f"bad regex: {e}"})
            continue
        found = []
        for t in texts:
            for m in rx.finditer(t):
                s = m.group(0).strip()
                if s and s not in found:
                    found.append(s)
                if len(found) >= spec.get("max_matches", 5):
                    break
            if len(found) >= spec.get("max_matches", 5):
                break
        if found:
            hits.append({"name": spec["name"], "matches": found})
    return hits


def main():
    try:
        models_doc = json.loads(MODELS_JSON.read_text())
        config = json.loads(CONFIG_JSON.read_text())
    except Exception as e:  # noqa: BLE001
        print(f"FATAL: cannot load inputs: {e}", file=sys.stderr)
        return 2

    models = models_doc.get("models", [])
    defaults = config.get("defaults", {})
    timeout = defaults.get("timeout_seconds", 20)
    max_bytes = defaults.get("max_bytes_per_url", 250000)
    ua = defaults.get("user_agent", "AI-Film-Guide-ModelWatch/1.0")
    delay = defaults.get("delay_between_requests_seconds", 0.5)
    rss_template = defaults.get("news_rss_template", "")
    news_max_items = defaults.get("news_max_items", 8)
    global_extracts = config.get("extract_global", [])
    model_cfg = config.get("models", {})

    prev = {}
    if CHECKS_JSON.exists():
        try:
            prev = {r["model"]: r for r in json.loads(CHECKS_JSON.read_text()).get("models", [])}
        except Exception as e:  # noqa: BLE001, corrupt old file: re-baseline
            print(f"WARN: previous checks file unreadable ({e}); re-baselining all.")

    records = []
    changed_count = 0
    err_count = 0
    no_source_count = 0

    for m in models:
        name = m.get("model", "?")
        cfg = model_cfg.get(name, {})
        urls = list(dict.fromkeys((m.get("sources") or []) + cfg.get("extra_urls", [])))

        rec = {
            "model": name,
            "platform": m.get("platform"),
            "type": m.get("type"),
            "last_checked": now_iso(),
            "changed": False,
            "baseline": False,
            "source_status": "ok",
            "source_results": [],
            "signal_excerpt": "",
            "signals": [],
            "news_status": "skipped",
            "news_headlines": [],
        }
        if cfg.get("note"):
            rec["note"] = cfg["note"]

        # Google News RSS: passive signal source (headlines only).
        # Headlines refresh weekly for human/agent review but do NOT feed the
        # change signature, news churn would flag every model every week.
        nq = cfg.get("news_query")
        if nq and rss_template:
            rss_url = rss_template.replace("{query}", urllib.parse.quote(nq))
            ok, status, rss_text, err = fetch(rss_url, timeout, max_bytes, ua)
            if ok and rss_text:
                headlines = parse_rss_items(rss_text, news_max_items)
                rec["news_status"] = "ok" if headlines else "empty"
                rec["news_headlines"] = headlines
                # run the signal regexes over headlines too
                hl_text = " ".join(h["title"] for h in headlines)
                rec["signals"].extend(apply_extracts([hl_text], global_extracts))
                time.sleep(delay)
            else:
                rec["news_status"] = "failed"
                rec["news_error"] = err

        if not urls:
            rec["source_status"] = "no_sources"
            no_source_count += 1
            records.append(rec)
            continue

        texts = []
        sigs = []
        failed = 0
        for url in urls:
            ok, status, text, err = fetch(url, timeout, max_bytes, ua)
            cleaned = clean_text(text) if ok and text else ""
            sig = hashlib.sha256(cleaned.encode()).hexdigest() if ok else None
            if ok:
                sigs.append(sig)
                texts.append(cleaned)
            else:
                failed += 1
            rec["source_results"].append(
                {"url": url, "ok": ok, "http_status": status,
                 "signature": sig, "chars": len(cleaned), "error": err}
            )
            time.sleep(delay)

        if failed == len(urls):
            rec["source_status"] = "all_failed"
            err_count += 1
        elif failed:
            rec["source_status"] = "partial"

        # Per-URL change detection (robust against URL sets shifting between runs):
        # a URL counts as "moved" only if it has a signature in BOTH the previous
        # and current run and they differ. URLs on the per-model
        # exclude_from_signature list (verified-noisy rotating marketing pages) are
        # fetched and recorded but never drive changed.
        # Signature exclusions: the defaults-level list (config `defaults`, # e.g. github.com, whose blob pages embed per-request nonces and can
        # never be signature-stable; proven in the Watchtower 2.2 calibration
        # by fetching one page twice and getting two signatures) merged with
        # this model's own exclude_from_signature list. Matching is by
        # substring, except an entry ending in "$" anchors to the exact URL
        # (so a vendor homepage can be excluded without also excluding its
        # pricing page, which shares the prefix).
        excluded = list(defaults.get("exclude_from_signature", [])) + \
            cfg.get("exclude_from_signature", [])

        def is_excluded(url):
            for x in excluded:
                if x.endswith("$"):
                    if url == x[:-1]:
                        return True
                elif x in url:
                    return True
            return False
        old = prev.get(name)
        old_sigs = {}
        if old:
            for r in old.get("source_results", []):
                if r.get("signature"):
                    old_sigs[r["url"]] = r["signature"]
        moved = []
        for res in rec["source_results"]:
            if not res["ok"]:
                continue
            if is_excluded(res["url"]):
                res["excluded_from_signature"] = True
                continue
            old_sig = old_sigs.get(res["url"])
            if old_sig is not None and old_sig != res["signature"]:
                moved.append(res["url"])
        if old is None:
            rec["baseline"] = True  # first-ever sighting: no diff yet
        elif moved:
            rec["changed"] = True
            rec["moved_urls"] = moved
            changed_count += 1

        if texts:
            rec["signal_excerpt"] = texts[0][:400]
        extracts = list(global_extracts) + cfg.get("extract", [])
        rec["signals"] = apply_extracts(texts, extracts)

        records.append(rec)

    # DATAOPS-002 header honesty: with_errors counts only all_failed models,
    # which masked a ~19-model partial mass in one run and a 15-model one in
    # another. The summary now also carries the full per-model source_status
    # distribution so the header alone shows the run's real shape. The four
    # standing keys are unchanged (the desk reads them).
    status_counts = {"ok": 0, "partial": 0, "all_failed": 0, "no_sources": 0}
    for r in records:
        status_counts[r["source_status"]] = \
            status_counts.get(r["source_status"], 0) + 1

    summary = {
        "models_total": len(models),
        "changed": changed_count,
        "with_errors": err_count,
        "no_sources": no_source_count,
        "source_status": status_counts,
    }

    checks_doc = {
        "format": "model-checks/1.0",
        "checked_at": now_iso(),
        "summary": summary,
        "models": records,
    }
    CHECKS_JSON.write_text(json.dumps(checks_doc, indent=2, ensure_ascii=False) + "\n")

    queue_items = []
    for rec in records:
        if rec["changed"]:
            queue_items.append({
                "model": rec["model"],
                "platform": rec.get("platform"),
                "detected_at": rec["last_checked"],
                "what_triggered": "source content signature differs from previous run",
                "sources_changed": rec.get("moved_urls", []),
                "source_results": rec["source_results"],
                "signal_excerpt": rec["signal_excerpt"],
                "signals": rec["signals"],
                "promotion": (
                    "Agent: verify the flagged URLs, confirm price/version/status change, "
                    "then update data/v1/models.json (last_verified, status, "
                    "est_cost_credits, what_changed, sources), re-run scripts/build_api.py, "
                    "commit, push. This script never edits models.json."
                ),
            })

    # Standing hand-authored watch items (carrying a `status`, no
    # `detected_at`) survive every run: the checker appends its own
    # changed-source items, it never deletes a human's standing watch.
    standing = []
    if QUEUE_JSON.exists():
        try:
            for it in json.loads(QUEUE_JSON.read_text()).get("items", []):
                if "detected_at" not in it:
                    standing.append(it)
        except Exception:  # noqa: BLE001, unreadable old queue: regenerate fresh
            standing = []
    queue_items = standing + queue_items

    queue_doc = {
        "format": "model-review-queue/1.0",
        "generated_at": now_iso(),
        "note": "Changed=true means a source page's content signature moved since the "
                "last check. This is a review signal, not a confirmed model change "
                "(landing pages are marketing copy; diffs may be noise). Promote via "
                "the per-item promotion step, never auto-mutate models.json. Items "
                "with a `status` and no `detected_at` are standing hand-authored "
                "watches, preserved across runs by the checker.",
        "pending": len(queue_items),
        "items": queue_items,
    }
    QUEUE_JSON.write_text(json.dumps(queue_doc, indent=2, ensure_ascii=False) + "\n")

    print(f"[model-watch] {len(models)} models | changed={changed_count} "
          f"| with_errors={err_count} | no_sources={no_source_count} "
          f"| ok={status_counts['ok']} partial={status_counts['partial']} "
          f"all_failed={status_counts['all_failed']}")
    if changed_count:
        for it in queue_items:
            if "what_triggered" in it:  # standing hand-authored items carry no trigger
                print(f"  REVIEW: {it['model']}, {it['what_triggered']}")
    print(f"[model-watch] wrote {CHECKS_JSON.name}, {QUEUE_JSON.name}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
