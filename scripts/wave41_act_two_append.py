#!/usr/bin/env python3
"""Wave 41 / completeness coordinator addendum (2026-10-15): add Runway
Act-Two to the model census, the one confirmed major model the
completeness wave's four lanes (image, audio, editing, finishing) did not
carry, and close the coordinator's own research findings on three
standing records.

Fuel: the coordinator's completeness research record
(~/workspace/fleet-ops/research-audits/film-completeness-2026-10-15.md),
verified 2026-10-15: Act-Two is a standing Runway first-party model
(Runway Dev's proprietary line is Gen-4.5, Aleph 2.0, Act-Two), a
performance-capture tool (driving video + character reference, face,
hands, body; up to 30 s at 24 fps; gesture control on image inputs),
billed at 5 credits per second with a 3 s minimum (aivideos.eu Act-Two
guide; facefusion.co's mirror of Runway's Act-Two guide; vp-land).
Kling 4.0 and Seedance 3.0 re-verified the same day against dated
October trackers (convly.ai updated Oct 11, vuela.ai Oct 13,
seedance3-pro's daily official-source checks): both statuses stand.

Edits the ARTIFACT (generator-owns-output), then re-run:
  python3 scripts/build_api.py    # assert updated 43 -> 44 inside
  python3 scripts/build_skills.py # picks up the new model skill
  python3 scripts/build_site.py   # model page + counts
  python3 scripts/build_llms.py   # llms.txt freshness
(pricing.json, curriculum.json, model-history.json and the test census
counts are updated separately, in the same wave, from the same figures,
the wave-39/40 pattern.)
"""

import json
from pathlib import Path

ART = Path.home() / "workspace/research_notes/ai-film-mega-research-20261010-0311/artifacts/artifact-3-model-comparison.json"

d = json.loads(ART.read_text())
by = {m["model"]: m for m in d["models"]}
assert len(d["models"]) == 43, f"expected 43 models, got {len(d['models'])}"
assert "Runway Act-Two" not in by, "Runway Act-Two already in artifact"

TODAY = "2026-10-15"

# ------------------------------------------------- NEW: Runway Act-Two (Runway)
# Performance capture: a driving performance video plus a character image
# or video. The est_cost string leads with the USD figure in words (no
# "N/5s" credit pattern), so the Studio engine treats it as API-priced,
# the PixVerse / Gemini Omni convention.
d["models"].append({
    "model": "Runway Act-Two",
    "platform": "Runway",
    "type": "video",
    "status": "active",
    "strength": ("Performance capture without a stage: shoot a driving "
                 "performance on any camera, give Act-Two a character "
                 "image or video, and it transfers the performance onto "
                 "the character, facial expressions, head rotation, hand "
                 "gestures and full-body movement. With image inputs a "
                 "gesture-control setting decides how much hand and body "
                 "motion carries over, and environmental motion is "
                 "synthesised so the character sits inside the scene "
                 "instead of floating on it. Up to 30s at 24 fps, the "
                 "clip lengths working scenes actually need."),
    "est_cost_credits": ("About $0.05/s at Runway's API credit price "
                         "($0.01 per credit): Act-Two bills 5 credits per "
                         "second of output, 3s minimum, on Runway plans "
                         "and Runway Dev. MuAPI lists performance transfer "
                         "at $0.07 per generation. Verify live."),
    "weakness": ("One performer per pass, and the driving video needs a "
                 "clearly visible face with no cuts; the performance you "
                 "get is the performance you shot, it cannot invent "
                 "acting. Output resolution sits below the current "
                 "generation flagships, and it is a transfer tool, not a "
                 "generator: no scene exists until a generator or a "
                 "camera makes one."),
    "best_use": ("Acted scenes with generated characters: direct the "
                 "performance yourself on camera, then put it on any "
                 "character. The fastest route to expressive, repeatable "
                 "acting in AI film, and the standard fix for the dead "
                 "faces pure text-to-video still produces."),
    "what_changed": ("NEW, added 2026-10-15 (completeness coordinator "
                     "addendum): a standing Runway first-party model "
                     "(Runway Dev's proprietary line is Gen-4.5, Aleph "
                     "2.0 and Act-Two) that no lane of the completeness "
                     "wave carried, despite performance capture being a "
                     "core AI-film technique with its own skill family "
                     "in this guide. Specs and rate verified against "
                     "October 2026 guide coverage on 2026-10-15."),
    "sources": ["https://aivideos.eu/blog/runway-act-one-vs-heygen-ai-actor-direction",
                "https://www.facefusion.co/runway-act-two",
                "https://github.com/anil-matcha/awesome-ai-video-models"],
    "last_verified": TODAY,
})

# --------------------------------------- Gen-4.5: align weakness with truth
# The completeness wave corrected this record's what_changed (Runway DID
# ship a model in 2026: Aleph 2.0), but the weakness line still carries
# the corrected claim verbatim. The presented record must not contradict
# itself.
g45 = by["Runway Gen-4.5"]
assert g45["weakness"].startswith("No new model in 2026"), g45["weakness"][:60]
g45["weakness"] = ("Gen-4.5 (Dec 2025) remains the latest Runway "
                   "generation model, but Runway's 2026 releases were "
                   "editing and performance tools (Aleph 2.0, Act-Two), "
                   "not a Gen-5; premium-tier pricing")
g45["last_verified"] = TODAY

# --------------------------------------- Kling 4.0: dated re-verification
k40 = by["Kling 4.0"]
assert k40["status"] == "announced"
k40["what_changed"] += (" Re-verified 2026-10-15 (completeness audit): "
                        "still not generally available. Flash remains "
                        "the only live tier (Ultra Yearly early access); "
                        "current trackers (convly.ai, updated Oct 11, "
                        "2026; vuela.ai, Oct 13, 2026) keep general "
                        "availability slated mid-to-late October, with "
                        "the API still on the 3.0 generation and no 4.0 "
                        "price published. One outlier (Wikipedia's Kling "
                        "article) phrases an October global launch; "
                        "every dated tracker checked disagrees, so the "
                        "announced status stands until Kuaishou ships a "
                        "date, a price, or an API model ID.")
k40["last_verified"] = TODAY

# --------------------------------------- Seedance 3.0: dated re-verification
s30 = by["Seedance 3.0"]
assert s30["status"] == "reported"
s30["what_changed"] += (" Re-verified 2026-10-15 (completeness audit): "
                        "still no official announcement. The daily "
                        "release tracker's catalog inspection (Oct 6, "
                        "2026) found ByteDance's official lineup still "
                        "listing Seedance 2.5 as current, and no 3.0 "
                        "announcement has appeared since; status stays "
                        "reported, and the Watchtower watch stays open.")
s30["last_verified"] = TODAY

d = {"cost_basis": d["cost_basis"], "generated": d["generated"],
     "models": d["models"], "unverified": d["unverified"]}
ART.write_text(json.dumps(d, indent=2) + "\n")
print(f"artifact-3-model-comparison.json: 43 -> {len(d['models'])} models")
