#!/usr/bin/env python3
"""Watchtower probe — uses the checker's OWN fetch path (imported, not
reimplemented) so probe signatures are comparable to run signatures."""
import hashlib, json, sys
sys.path.insert(0, "scripts/refresh")
import check_models as cm

cfg = json.loads(open("scripts/refresh/model-check-config.json").read())
d = cfg.get("defaults", {})
UA = d.get("user_agent", "AI-Film-Guide-ModelWatch/1.0")
TIMEOUT = d.get("timeout_seconds", 20)
MAXB = d.get("max_bytes_per_url", 250000)

def probe(url):
    ok, status, text, err = cm.fetch(url, TIMEOUT, MAXB, UA)
    if not ok:
        return {"url": url, "ok": False, "status": status, "error": err}
    cleaned = cm.clean_text(text)
    sig = hashlib.sha256(cleaned.encode("utf-8")).hexdigest()
    return {"url": url, "ok": True, "status": status, "chars": len(cleaned),
            "signature": sig, "text": cleaned}

if __name__ == "__main__":
    urls = sys.argv[1:]
    for u in urls:
        r = probe(u)
        print(json.dumps({k: v for k, v in r.items() if k != "text"}))
