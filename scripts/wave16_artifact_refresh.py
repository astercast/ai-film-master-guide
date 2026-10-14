#!/usr/bin/env python3
"""Wave 16: refresh artifact-3-model-comparison.json with Oct 2026 fuel research.

Fuel: ~/workspace/research_notes/wave-fuel-2026-20261011-2355 (mission 2, sourced Oct 2026).
Every spec/price added here carries a source URL or a "reported, verify live" flag.
Run: python3 scripts/wave16_artifact_refresh.py  (edits the ARTIFACT, then re-run build_api.py)
"""
import json
from pathlib import Path

ART = Path.home() / "workspace/research_notes/ai-film-mega-research-20261010-0311/artifacts/artifact-3-model-comparison.json"

d = json.loads(ART.read_text())
by = {m["model"]: m for m in d["models"]}

NEW = [
    {
        "model": "Gemini Omni",
        "platform": "Google DeepMind",
        "type": "video",
        "best_use": "Conversational video generation and prompt-plus-reference clip editing inside Google's ecosystem (Gemini app, YouTube Shorts, Google Flow)",
        "est_cost_credits": "Gemini Omni Flash API: ~$0.10/s at 720p, token-billed (reported benchmark, verify live)",
        "strength": "Unified multimodal creation platform; Omni Flash shipped day one in the Gemini app, YouTube Shorts, and Google Flow; prompt-plus-reference generation and clip editing",
        "weakness": "Token-billed API makes cost math different from per-clip models; verify live before budgeting",
        "last_verified": "2026-10-11",
        "status": "active",
        "what_changed": "CORRECTION, Google's actual next play is Gemini Omni, unveiled at Google I/O 2026 (May 19 to 20), NOT a 'Veo 4'. 'Veo 4' pages ranking on Google are SEO bait; no Google documentation names such a model (verified across three sources). Gemini Omni Flash shipped day one; API since June 30, 2026.",
        "sources": [
            "https://www.lumeflow.ai/ai-tools/veo-4-release-date/",
            "https://innfactory.ai/en/ai-models/google-veo/",
        ],
    },
    {
        "model": "LTX-2.5",
        "platform": "Lightricks",
        "type": "video",
        "best_use": "4K fast-drafting and multi-shot sequences with commercial-legal safety",
        "est_cost_credits": "Open weights (22B); LTX 2.5 Fast API from ~$0.003/s (reported benchmark, verify live); paid license required above $10M revenue",
        "strength": "Fast/Pro variants up to 4K; open weights 22B; multi-shot in one pass; LTX line trained on licensed Getty/Shutterstock imagery, legal safety for commercial work",
        "weakness": "Young evidence base; license traps at revenue scale, read terms before monetizing",
        "last_verified": "2026-10-11",
        "status": "active",
        "what_changed": "Released Aug 11, 2026: Fast/Pro variants, up to 4K, open weights 22B, multi-shot in one pass. Trained on licensed Getty/Shutterstock imagery, the legal-safe open pick for commercial work.",
        "sources": [
            "https://magichour.ai/blog/ai-video-model-release-tracker-2026",
            "https://www.versely.studio/blog/state-of-ai-video-oct-2026",
            "https://intelligibberish.com/articles/best-local-video-generation-models-by-vram/",
        ],
    },
    {
        "model": "Vidu S2",
        "platform": "Vidu",
        "type": "video",
        "best_use": "Real-time interactive character video; live-stream editing",
        "est_cost_credits": "Cheapest paid tier ~$0.05/clip reported, verify live",
        "strength": "S2-Avatar: interactive character up to 720p; S2-Editing: changes a live stream as it plays",
        "weakness": "Real-time-first design, not a cinematic hero-shot model; pricing thinly documented, verify live",
        "last_verified": "2026-10-11",
        "status": "active",
        "what_changed": "Launched Sept 15, 2026: real-time S2-Avatar (interactive character up to 720p) and S2-Editing (live stream re-editing).",
        "sources": [
            "https://www.versely.studio/blog/state-of-ai-video-oct-2026",
            "https://higgsfield.ai/blog/best-affordable-ai-video-generators",
        ],
    },
    {
        "model": "Mirage Tesseract",
        "platform": "Mirage (formerly Captions)",
        "type": "suite",
        "best_use": "Agent-driven editing and motion graphics; free local engine",
        "est_cost_credits": "Local engine free (reported, verify live)",
        "strength": "Agent-driven editing and motion-graphics suite with a free local engine",
        "weakness": "Not a shot-generation model, it belongs to the edit/post stage, not the generation pool; young evidence base",
        "last_verified": "2026-10-11",
        "status": "active",
        "what_changed": "Launched Sept 22, 2026 (Mirage, formerly Captions): agent-driven editing and motion-graphics suite with a free local engine. Typed 'suite' so the Studio never treats it as a per-shot generation model.",
        "sources": [
            "https://www.versely.studio/blog/state-of-ai-video-oct-2026",
        ],
    },
    {
        "model": "Runway Gen-4.5",
        "platform": "Runway",
        "type": "video",
        "best_use": "4K with camera control; enterprise video pipelines; API access to a premium-tier model",
        "est_cost_credits": "API ~$1.20/10s 720p (reported Sept 2026 benchmark); consumer plans from ~$15/mo, verify live",
        "strength": "4K with camera control; enterprise NRR reportedly 300%+; $200M ARR with $350M year-end projection (company-claimed); Sept 30, 2026 Summit",
        "weakness": "No new model in 2026, Gen-4.5 still latest; premium-tier pricing",
        "last_verified": "2026-10-11",
        "status": "active",
        "what_changed": "Runway shipped NO new model in 2026, Gen-4.5 remains latest. Sept 2026 news was distribution (its MCP serving other companies' models) and the Sept 30 Summit; research pipeline spans creative video, interactive simulation, and humanoid robotics (world models). Included in Adobe's Sept 8 in-Premiere multi-model workbench.",
        "sources": [
            "https://www.versely.studio/blog/state-of-ai-video-oct-2026",
            "https://www.techtimes.com/articles/326994/20260908/runway-ai-hits-200m-arr-enterprise-video-adoption-triples-existing-spend.htm",
            "https://www.techtimes.com:443/articles/327054/20260909/adobe-embeds-five-competing-ai-video-models-premiere-killing-round-trip-export.htm",
        ],
    },
]

for rec in NEW:
    assert rec["model"] not in by, f"already exists: {rec['model']}"
    d["models"].append(rec)

# ---- per-record refreshes on existing models ----

def append(model, field, text):
    m = by[model]
    m[field] = (m[field] + " " + text).strip()

# Wan 3.0, formal release + provider-list price
append("Wan 3.0 / 3.0 Prime", "est_cost_credits",
       "; provider-list API: $0.05/s at 480p, 2 to 30s with native audio (reported benchmark, verify live)")
append("Wan 3.0 / 3.0 Prime", "what_changed",
       "Oct 2026 fuel refresh: formal release confirmed Aug 24, 2026; 2 to 30s with native audio at $0.05/s at 480p (provider list price), 'thirty seconds with audio got cheap; a year ago that length and price did not exist together'.")
by["Wan 3.0 / 3.0 Prime"]["sources"].append(
    "https://www.makeinfluencer.ai/guides/best-ai-video-generators-2026")

# MiniMax H3, open weights Aug 3 + API benchmark
by["MiniMax H3"]["est_cost_credits"] = (
    "third-party: ~$0.073 to 0.12/sec; API benchmark $0.80/10s 720p (reported Sept 2026); "
    "optimized third-party inference from $0.01/s, verify live")
append("MiniMax H3", "what_changed",
       "Open weights released Aug 3, 2026 (base checkpoint; hosted Context-IR/Regenerate-2K stages separate). Native audio now standard across Kling 3.0, Seedance 2.5, MiniMax H3, Wan 3.0, and Veo 3.1 (Oct 2026 coverage).")
by["MiniMax H3"]["sources"] += [
    "https://magichour.ai/blog/ai-video-model-release-tracker-2026",
    "https://www.einpresswire.com/article/948320883/protoface-expands-ai-video-api-with-kling-3-0-seedance-2-5-and-google-veo-3-1",
]

# Kling 3.0, API benchmark
append("Kling 3.0", "est_cost_credits", "; API $0.84/10s 720p (reported Sept 2026 benchmark)")
append("Kling 3.0", "what_changed",
       "API benchmark $0.84/10s 720p (reported, Sept 2026). Included in Adobe's Sept 8 in-Premiere multi-model workbench.")

# Seedance 2.5, API benchmark + modes
by["Seedance 2.5"]["est_cost_credits"] = (
    "API ~$2.31/10s 720p (reported Sept 2026 benchmark, verify live); "
    "Higgsfield promo ~80 videos on Plus/mo")
append("Seedance 2.5", "what_changed",
       "Five modes incl. standard/Turbo/Video Edit/Video Extend/Talking Avatar; Turbo drafting tier for cents-level prompt testing (drafting tiers now a workflow); up to 30 reference images in one pass.")
by["Seedance 2.5"]["sources"].append(
    "https://higgsfield.ai/blog/best-ai-video-generation-apis")

# Luma, API benchmark + 16 keyframes
append("Luma App / Ray 3.2", "est_cost_credits",
       "; API ~$0.90/10s 720p (reported Sept 2026 benchmark); Luma Plus $30/mo")
append("Luma App / Ray 3.2", "strength",
       "; 16-keyframe support, most of any listed tool in the field roundups (verify against vendor docs)")
append("Luma App / Ray 3.2", "what_changed",
       "Included in Adobe's Sept 8 in-Premiere multi-model workbench (Firefly/Veo/Runway/Kling/Luma). No new-model announcements in sources reviewed since Ray 3.2, Luma's documented strength is API + team controls and keyframe control.")
by["Luma App / Ray 3.2"]["sources"].append(
    "https://www.techtimes.com:443/articles/327054/20260909/adobe-embeds-five-competing-ai-video-models-premiere-killing-round-trip-export.htm")

# Veo 3.1, API benchmark + Veo-4 correction hardened
append("Veo 3.1", "est_cost_credits", "; API ~$3.20/8s (reported Sept 2026 benchmark, premium API tier)")
append("Veo 3.1", "what_changed",
       "CORRECTION (Oct 11, 2026): Veo 4 does not exist, 'Veo 4' pages ranking on Google are SEO bait; Google's actual play is Gemini Omni (I/O 2026), now its own record in this file (verified across three sources). Native audio always-on via the Gemini API.")
by["Veo 3.1"]["sources"].append("https://innfactory.ai/en/ai-models/google-veo/")

# Kling 4.0, leak-level flag, hard
by["Kling 4.0"]["strength"] = (
    "REPORTED, NOT CONFIRMED: 30s native clips, up to 10 keyframes, Omni Reference, "
    "stereo audio with improved lip-sync; 4K 10-bit HDR promised ('coming soon'). "
    "Treat ALL specs as leak-level until GA.")
append("Kling 4.0", "what_changed",
       "Oct 2026: specs (30s) are preview-leak level, GPTProto cautions they are unverified; do not present as confirmed. Note: Kling 4K is a 3.0 feature (added April 23, 2026), not a 4.0 feature, do not conflate.")
by["Kling 4.0"]["sources"].append(
    "https://medium.com/@gptproto.team/what-is-kling-4-0-preview-leaks-release-status-what-to-use-now-5d9afa268132")

# Wan 2.6, open-weights benchmark note
append("Wan 2.6", "what_changed",
       "Oct 2026: Wan 2.2 (Apache 2.0) remains the practical open-weights quality benchmark; LTX line offers licensed-data legal safety for commercial work.")

# ---- cost_basis: API benchmark table ----
d["cost_basis"] += (
    " API benchmark table (REPORTED, not vendor-quoted, Sept 2026, Higgsfield AI-video API "
    "price comparison, https://higgsfield.ai/blog/best-ai-video-generation-apis; verify live): "
    "per 10s 720p, MiniMax H3 $0.80, Kling 3.0 $0.84, Luma Ray 3.2 $0.90, Runway Gen-4.5 $1.20, "
    "Seedance 2.5 $2.31, Veo 3.1 $3.20 (per 8s). Veo 3.1 is the premium API tier. Open-model API "
    "floors: LTX 2.5 Fast ~$0.003/s, MiniMax H3 optimized ~$0.01/s. Drafting tiers (Seedance 2.5 "
    "Turbo, Gemini Omni Flash at 360p) exist for cents-level prompt testing before hero renders.")

assert len(d["models"]) == 27, f"expected 27 models, got {len(d['models'])}"
ART.write_text(json.dumps(d, indent=1, ensure_ascii=False) + "\n")
print(f"OK: {len(d['models'])} models written to artifact-3")
