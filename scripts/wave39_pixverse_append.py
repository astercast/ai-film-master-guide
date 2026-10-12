#!/usr/bin/env python3
"""Wave 39: add PixVerse V6 to the model watch — the guide's most conspicuous
uncovered model (launched Mar 30, 2026, native audio, 15s, 1080p).

Fuel: live web research conducted 2026-10-12 (browser.search batches).
Every number carries a source URL or a "verify live" flag.
No invented specs: third-party numbers are labeled as such.

Edits the ARTIFACT (generator-owns-output), then re-run:
  python3 scripts/build_api.py    # assert updated 30 -> 31 inside
  python3 scripts/build_skills.py # picks up the new model skill
  python3 scripts/build_site.py   # model page + counts
  python3 scripts/build_llms.py   # llms.txt freshness
"""

import json
from pathlib import Path

ART = Path.home() / "workspace/research_notes/ai-film-mega-research-20261010-0311/artifacts/artifact-3-model-comparison.json"

d = json.loads(ART.read_text())
by = {m["model"]: m for m in d["models"]}
assert len(d["models"]) == 30, f"expected 30 models, got {len(d['models'])}"
assert "PixVerse V6" not in by, "PixVerse V6 already in artifact"

TODAY = "2026-10-12"

# ---------------------------------------------------------------- NEW: PixVerse V6 (AIsphere)
# Launched March 30, 2026. Pricing below is third-party gateway/API pricing
# (reported, not vendor list) — flagged as such; PixVerse web plans exist
# separately (~$19/mo entry, free tier 60 daily credits at 720p watermarked).
d["models"].append({
    "model": "PixVerse V6",
    "platform": "AIsphere",
    "type": "video",
    "status": "active",
    "strength": ("Native audio generated in the same pass; 1-15s clips at up to "
                 "1080p; 20+ prompt-driven camera controls (focal length, aperture, "
                 "depth of field, lens distortion); multi-shot flag cuts one prompt "
                 "into an ordered scene; reference-to-video with up to 10 images; "
                 "strong independent image-to-video showings (Artificial Analysis "
                 "Elo 1,343, April 2026)."),
    "est_cost_credits": ("API gateways (reported, third-party — verify live): ~$0.09/s "
                         "at 720p with audio, ~$0.18-0.23/s at 1080p (worked: 5s 720p + "
                         "audio approx $0.60; 10s 1080p no audio approx $1.80; 15s 1080p "
                         "+ audio approx $3.45). PixVerse web plans from ~$19/mo; free "
                         "tier 60 daily credits at 720p, watermarked."),
    "weakness": ("1080p ceiling — no 4K; audio integration less mature than Kling 3.0 / "
                 "Seedance 2.x for dialogue and lip-sync; audio synthesis reported as "
                 "Pro-plan-and-up on the web product; free tier watermarked at 720p."),
    "best_use": ("Cinematic short-form and social video; anime/stylized work with "
                 "multi-shot consistency; pre-viz and multi-shot scene sketches"),
    "what_changed": ("NEW — added to model watch 2026-10-12; previously the guide's most "
                     "conspicuous uncovered model. Launched March 30, 2026 with native "
                     "audio and multi-shot. Sibling C1 (April 7, 2026) targets "
                     "action/VFX/high-speed motion; not separately tracked."),
    "sources": ["https://www.yottalabs.ai/post/pixverse-v6-vs-c1-differences-api-2026",
                "https://blog.segmind.com/ai-video-generation-api-pixverse-v6-review-real-world-use-cases-2026/",
                "http://tagshop.ai/ai-models/pixverse-6"],
    "last_verified": TODAY,
})

d = {"cost_basis": d["cost_basis"], "generated": d["generated"],
     "models": d["models"], "unverified": d["unverified"]}
ART.write_text(json.dumps(d, indent=2) + "\n")
print(f"artifact-3-model-comparison.json: 30 -> {len(d['models'])} models")
