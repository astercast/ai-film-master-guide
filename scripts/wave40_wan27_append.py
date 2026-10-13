#!/usr/bin/env python3
"""Wave 40 / Watchtower 2.4: add Wan 2.7 to the model watch — the gap flagged
in wave 21, verified against the desk's criteria in Watchtower 2.3 (official
Alibaba Cloud model IDs wan2.7-t2v/-i2v/-r2v/-videoedit + published list
pricing), and deliberately NOT hand-added by that review pass: a new model
enters through the research-artifact chain as its own records change (the
PixVerse V6 path, wave 39).

Fuel: Watchtower 2.3 verification (2026-10-12) + live re-check 2026-10-12.
Every source below was probed with the checker's own fetch path before being
written down (poyo.ai 200, createvision.ai 200, upgrademag 200 on retry;
abnewswire timed out and sloptvnews dropped the connection — both excluded).
Pricing is the Alibaba Cloud Model Studio USD list ($0.10/s 720p, $0.15/s
1080p for every wan2.7 video endpoint), corroborated by fal hosting the same
card at the same rates; the China list is ¥0.6/s / ¥1.0/s (Watchtower 2.3).

Edits the ARTIFACT (generator-owns-output), then re-run:
  python3 scripts/build_api.py    # assert updated 31 -> 32 inside
  python3 scripts/build_skills.py # picks up the new model skill
  python3 scripts/build_site.py   # model page + counts
  python3 scripts/build_llms.py   # llms.txt freshness
(pricing.json is hand-maintained/preserved — the wan-2-7 entry is added
there separately, in the same wave, from the same figures.)
"""

import json
from pathlib import Path

ART = Path.home() / "workspace/research_notes/ai-film-mega-research-20261010-0311/artifacts/artifact-3-model-comparison.json"

d = json.loads(ART.read_text())
by = {m["model"]: m for m in d["models"]}
assert len(d["models"]) == 31, f"expected 31 models, got {len(d['models'])}"
assert "Wan 2.7" not in by, "Wan 2.7 already in artifact"

TODAY = "2026-10-12"

# ---------------------------------------------------------------- NEW: Wan 2.7 (Alibaba / Tongyi Lab)
# Launched April 2026. Four official endpoints (t2v/i2v/r2v/videoedit),
# Thinking Mode, 2-15s at 720p/1080p, native audio. USD list pricing is
# published (Model Studio, Singapore) — confidence official, not gateway
# estimates; the est_cost string stays in USD-per-second words with no
# "N/5s" credit pattern, so the Studio engine treats it as API-priced
# (the PixVerse / Gemini Omni convention), never as a credit rate.
d["models"].append({
    "model": "Wan 2.7",
    "platform": "Alibaba",
    "type": "video",
    "status": "active",
    "strength": ("Thinking Mode: the model plans the composition before it "
                 "generates, which shows up as fewer artifacts and steadier "
                 "multi-shot prompts — a prompt can carry timed shot changes "
                 "(Shot 1 / Shot 2 / Shot 3 with time ranges) and the model "
                 "cuts on them. Full four-endpoint suite under official IDs "
                 "(wan2.7-t2v, wan2.7-i2v, wan2.7-r2v, wan2.7-videoedit): "
                 "text-to-video, image-to-video with first/last-frame lock "
                 "and continuation, reference-to-video with up to 5 "
                 "reference images, and prompt-guided editing of existing "
                 "footage. 2-15s at 720p/1080p, native audio in the same "
                 "pass, precise color control (HEX codes and palettes) and "
                 "strong character consistency across references."),
    "est_cost_credits": ("Alibaba Cloud Model Studio list (USD): $0.10/s at "
                         "720p, $0.15/s at 1080p — the same rate on every "
                         "wan2.7 video endpoint; fal hosts the same card at "
                         "$0.10/s (720p) and $0.15/s (1080p). China list: "
                         "¥0.6/s at 720p, ¥1.0/s at 1080p. Worked: a 5s clip "
                         "at 720p runs $0.50; 10s at 1080p runs $1.50; the "
                         "full 15s at 1080p runs $2.25. Billed per "
                         "generated second — verify live."),
    "weakness": ("1080p ceiling — no 4K; the top rung of the Wan line is 3.0. "
                 "Closed weights: no local run (the open-weights Wan story "
                 "still ends at 2.2). Native audio is always on — some hosts "
                 "offer no silent option. Reference-to-video and videoedit "
                 "cap shorter than text-to-video on some hosts (2-10s "
                 "against 2-15s), so the row you rent is not always the "
                 "spec sheet."),
    "best_use": ("Directed mid-budget clips where the prompt is the "
                 "storyboard: timed multi-shot prompts, reference-held "
                 "characters and products, lip-synced talking heads from a "
                 "supplied audio track, and prompt-guided edits of footage "
                 "you already have — the videoedit endpoint is the one no "
                 "neighbouring model in this price band matches."),
    "what_changed": ("NEW — added to model watch 2026-10-12 (Watchtower 2.4) "
                     "through the research-artifact chain, closing the gap "
                     "flagged in wave 21 and verified in Watchtower 2.3. "
                     "Launched April 2026 (Tongyi Lab) with Thinking Mode "
                     "and the four-endpoint suite at 2-15s, 720p/1080p, "
                     "native audio. It sits between Wan 2.6 (the "
                     "camera-first 2.x line) and Wan 3.0 (the 30-second "
                     "flagship): the last 2.x generation, and the first Wan "
                     "with a published USD list card the budget tools can "
                     "read directly."),
    "sources": ["https://poyo.ai/models/wan-2-7-video",
                "https://createvision.ai/wan-2.7",
                "http://www.upgrademag.com/web/2026/04/25/alibaba-unveils-wan2-7-video/"],
    "last_verified": TODAY,
})

# ------------------------------------------------- Wan 2.6: close the stale gap note
# Wan 2.6's record still says Wan 2.7 "is not in this guide" — as of this
# wave that sentence is false, and the record should not keep saying it.
w26 = by["Wan 2.6"]
assert "not in this guide" in w26["what_changed"]
w26["what_changed"] += (" Wan 2.7 was added as its own record on 2026-10-12 "
                        "(Watchtower 2.4), through the artifact chain this "
                        "note asked for.")

d = {"cost_basis": d["cost_basis"], "generated": d["generated"],
     "models": d["models"], "unverified": d["unverified"]}
ART.write_text(json.dumps(d, indent=2) + "\n")
print(f"artifact-3-model-comparison.json: 31 -> {len(d['models'])} models")
