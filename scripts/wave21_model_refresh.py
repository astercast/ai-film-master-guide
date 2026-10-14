#!/usr/bin/env python3
"""Wave 21: Q4 2026 model data refresh, re-verify all 27 models, add 2 new.

Fuel: live web research conducted 2026-10-11 (browser.search batches).
Every changed number carries a source URL or a "verify live" flag.
No invented specs: third-party numbers are labeled as such; single-source
claims carry an explicit single-source flag.

Edits the ARTIFACT (generator-owns-output), then re-run:
  python3 scripts/build_api.py   # assert updated 27 -> 29 inside
"""
import json
from pathlib import Path

ART = Path.home() / "workspace/research_notes/ai-film-mega-research-20261010-0311/artifacts/artifact-3-model-comparison.json"

d = json.loads(ART.read_text())
by = {m["model"]: m for m in d["models"]}
assert len(d["models"]) == 27, f"expected 27 models, got {len(d['models'])}"

TODAY = "2026-10-11"


def touch(m, what_changed=None, cost=None, cost_replace=None, extra_sources=(), status=None):
    """Bump last_verified; append change notes; never rewrite the Studio's
    first N/Ms credit pattern unless the platform-credit rate itself moved."""
    m["last_verified"] = TODAY
    if what_changed:
        prev = (m.get("what_changed") or "").strip()
        m["what_changed"] = (prev + " " if prev else "") + what_changed.strip()
    if cost_replace:
        m["est_cost_credits"] = cost_replace.strip()
    elif cost:
        m["est_cost_credits"] = (m.get("est_cost_credits") or "").rstrip() + " " + cost.strip()
    if extra_sources:
        srcs = m.get("sources", [])
        for s in extra_sources:
            if s not in srcs:
                srcs.append(s)
        m["sources"] = srcs
    if status:
        m["status"] = status


# ---------------------------------------------------------------- Kling 4.0
m = by["Kling 4.0"]
touch(m,
    what_changed=("Re-verified 2026-10-11: STILL not GA. Full model promised 'this October' with no date; "
                  "only Kling 4.0 Flash is live (limited early access for Ultra Yearly subscribers, capped 20s/720p/8-bit SDR). "
                  "4K 10-bit HDR stays 'coming soon'; no API model ID in the official docs as of Oct 4; APIMart lists pricing as unannounced. "
                  "Kling.ai homepage banners 4.0 but exposes no price/date/resolution text (wavespeed Oct-1 evidence review)."),
    extra_sources=("https://wavespeed.ai/blog/ai-news/kling-4-0-release-date/",
                   "https://rctv.com/posts/ai-video-weekly-roundup-2026-10-05/",
                   "https://www.orcarouter.ai/blog/kling-4-0-release-date",
                   "https://apimart.ai/model/kling-4-0"))

# ---------------------------------------------------------------- Kling 3.0
m = by["Kling 3.0"]
touch(m,
    what_changed=("Re-verified 2026-10-11: still the current GA model. CORRECTION of a circulating claim: Kling 3.0 ranks 12th (not 4th) "
                  "on the Artificial Analysis text-to-video leaderboard as of Sept 2026 (techtimes, single-source flag, the board itself "
                  "has not been independently re-polled by this guide). kling-3.0-turbo GA June 17, 2026 (audio always on)."),
    cost=("Kling API docs pricing: kling-3.0-turbo $0.112/s 720p, $0.14/s 1080p (audio included); "
          "kling-v3 $0.084/s std, $0.112/s pro, $0.126-$0.168/s with audio, $0.42/s 4K; "
          "kling-v2-5-turbo $0.042/s 720p, $0.07/s 1080p (1 unit = $0.14), third-party mirror of official docs, rechecked Oct 2026."),
    extra_sources=("https://github.com/vericontext/vibeframe/blob/HEAD/.agents/references/providers/kling.md",
                   "https://synthesys.io/blog/seedance-vs-kling/",
                   "https://www.usefastlane.ai/models/kling-3-0",
                   "https://www.techtimes.com/articles/328285/20260930/kling-40-promises-30-second-4k-video-broadcast-spec-coming-october-not-today.htm"))

# ------------------------------------------------------------ Kling 2.5 Turbo
m = by["Kling 2.5 Turbo"]
touch(m,
    what_changed=("Re-verified 2026-10-11: unchanged budget tier; docs price list: $0.042/s std, $0.07/s pro (1 unit = $0.14)."),
    extra_sources=("https://github.com/vericontext/vibeframe/blob/HEAD/.agents/references/providers/kling.md",))

# ------------------------------------------------------------ Seedance 2.0/2.5
m = by["Seedance 2.0"]
touch(m,
    what_changed=("Re-verified 2026-10-11: remains current alongside 2.5. BytePlus terms (updated Sept 30, 2026) say Seedance API is not available in the US, "
                  "US users go via Dreamina or hosted platforms (synthesys, single-source flag)."),
    cost=("BytePlus API estimate ~$0.37/s at 1080p for 2.0, 2.0 Mini 720p ~$0.08/s (third-party estimates, verify live)."),
    extra_sources=("https://synthesys.io/blog/seedance-vs-kling/",))

m = by["Seedance 2.5"]
touch(m,
    what_changed=("Re-verified 2026-10-11: reached API resellers ~mid-August (4-30s, 24fps, audio, third-party report, single-source flag). "
                  "Arena image-to-video (Sept 21, 2026): 2.5 and 2.0 score ~120 pts above Kling 3.0 Pro (synthesys, single-source flag). "
                  "Seedance 3.0 watch continues, no official announcement as of Oct 11."),
    cost=("BytePlus API estimate ~$0.57/s at 1080p for 2.5 (third-party estimate, verify live)."),
    extra_sources=("https://synthesys.io/blog/seedance-vs-kling/",
                   "https://www.versely.studio/blog/state-of-ai-video-oct-2026"))

# ------------------------------------------------------------ Seedance 3.0
m = by["Seedance 3.0"]
touch(m,
    what_changed=("Re-verified 2026-10-11: STILL unconfirmed. ByteDance Seed's public model directory lists 2.5 as the latest released Seedance video model; "
                  "no Seedance 3 product, card, API ID, price, or schedule exists (independent Medium audit, Sept 2026). "
                  "ByteDance's October-2026 real-time world model (Bloomberg, ~50ms latency, Pico VR target) is a SEPARATE product built on Seedance, "
                  "not a Seedance 3 video release. A third-party directory listing dated Oct 6, 2026 names 'Seedance 3.0' with generic copy and no vendor link, "
                  "treated as unconfirmed. Status stays 'reported'."),
    extra_sources=("https://medium.com/@ruben_25479/seedance-3-status-availability-and-how-to-prepare-for-the-video-model-update-7ea7df120ae7",
                   "https://www.breakread.com/bytedance-ai-real-time-world-model/",
                   "https://www.versely.studio/blog/state-of-ai-video-oct-2026"))

# ------------------------------------------------------------------ Veo 3.1
m = by["Veo 3.1"]
touch(m,
    what_changed=("Re-verified 2026-10-11: still the latest in the Veo line. 'Veo 4' pages ranking on Google remain SEO bait (verified again this wave; "
                  "versely Oct-1 state-of-video: 'Still not announced'). Gemini Omni 1.1 Flash is replacing Veo 3.1 inside the Gemini app, "
                  "but the Veo API continues separately."),
    extra_sources=("https://www.versely.studio/blog/state-of-ai-video-oct-2026",
                   "https://omniflash-ai.com/blog/gemini-omni-flash-1-1"))

m = by["Veo 3.1 Fast / Veo 3"]
touch(m,
    what_changed=("Re-verified 2026-10-11: tier lineup unchanged; reelina's Oct-2026 per-second snapshot: Veo 3.1 Fast 8s $1.22 ($0.15/s) -> 10s clip $1.52, "
                  "cheaper per-second than Kling 3.0 Std."),
    extra_sources=("http://dev.to/osman_sylemez_e83bde4a36/running-veo-31-kling-30-and-seedance-20-side-by-side-what-a-10-second-clip-actually-costs-597",))

# ------------------------------------------------------------ Gemini Omni
m = by["Gemini Omni"]
touch(m,
    what_changed=("2026-08-27: gemini-omni-1.1-flash went GA (scene extension to 40s in 10s steps with 10s context, first/last-frame interpolation, "
                  "360p-4K resolution ladder, 3s video references, stateful multi-turn editing). Preview endpoint gemini-omni-flash-preview deprecated "
                  "Sept 30, 2026 (404s, no fallback). Sept 23: free 1080p generation in Google Vids for all Google accounts. In the Gemini app, Omni 1.1 "
                  "Flash replaces Veo 3.1. Adobe Firefly and Figma Weave named as production users. SynthID watermark on all output."),
    cost=("RESOLUTION LADDER (reported benchmarks, verify live): 720p ~$0.10/s ($17.50/1M video tokens); 360p draft ~$0.03/s (up to 60% faster); "
          "1080p ~$0.15/s; 4K ~$0.30/s. 1080p/4K are upscaled from 720p. English only fully supported for prompts."),
    extra_sources=("https://www.marktechpost.com/2026/08/29/google-ai-releases-gemini-omni-1-1-flash-40-second-scene-extension-first-last-frame-control-and-4k-upscaling/",
                   "https://omniflash-ai.com/blog/gemini-omni-flash-1-1",
                   "https://www.unite.ai/google-brings-free-gemini-omni-1-1-video-generation-to-google-vids/",
                   "https://www.ffmpeg-micro.com/blog/gemini-omni-flash-preview-is-deprecated-swap-to-omni-1-1-flash"))

# ---------------------------------------------------------------- Wan models
m = by["Wan 3.0 / 3.0 Prime"]
touch(m,
    what_changed=("Re-verified 2026-10-11: formally released Aug 24, 2026; remains Alibaba's current flagship. Launch spec: 30s @ 30fps, 480p/720p/1080p, "
                  "native audio by default, up to 10 image + 5 video + 5 audio references, document-to-video mode (WinBuzzer via versely). "
                  "Hosted rows (e.g. Versely) cap at 15s, the 30s number is Alibaba's spec, not every host's."),
    cost=("Prime Singapore list (therundown, Aug 2026, verify live): $0.068/s 480p, $0.14/s 720p, $0.28/s 1080p. "
          "Third-party gateways: APIMart $0.0329 480p / $0.0658 720p / $0.1315 1080p; Atlas Cloud $0.04/s."),
    extra_sources=("https://www.versely.studio/blog/state-of-ai-video-oct-2026",
                   "https://www.therundown.ai/tools/wan-3-0"))

m = by["Wan 2.6"]
touch(m,
    what_changed=("Re-verified 2026-10-11: unchanged; the 2.x line stays the open-weights option while 3.0 is closed. "
                  "GAP FOUND: Wan 2.7 (Thinking Mode, t2v/i2v/r2v/videoedit suite, 2-15s, 720p/1080p) launched ~April 2026 and is not in this guide, "
                  "flagged for the review queue, not silently added (April predates this wave's scope)."),
    extra_sources=("http://www.upgrademag.com/web/2026/04/25/alibaba-unveils-wan2-7-video/",
                   "https://www.abnewswire.com/pressreleases/alibaba-launches-wan-27-breakthrough-ai-image-video-generation-model-with-thinking-mode_800302.html"))

# ------------------------------------------------------------ Hailuo 02 / 2.3
m = by["Hailuo 02 / 2.3"]
touch(m,
    what_changed=("Re-verified 2026-10-11: 2.3 is now MiniMax's LEGACY API generation (V1); H3 is the current V2 generation. "
                  "Legacy API pricing rechecked Oct 10, 2026 (magichour). Consumer-app subscriptions: Standard $10.50/mo, Pro $38/mo, Master $89/mo, Max $216/mo."),
    cost=("Direct API, rechecked 2026-10-10: 2.3 768p $0.28/6s, $0.56/10s; 1080p $0.49/6s; 2.3 Fast $0.19/6s, $0.32/10s (MiniMax pay-as-you-go)."),
    extra_sources=("https://magichour.ai/blog/hailuo-23-pricing",
                   "https://recatools.com/ai-directory/hailuo-video/",
                   "https://minimax-ai.chat/hailuo/"))

# ---------------------------------------------------------------- MiniMax H3
m = by["MiniMax H3"]
touch(m,
    what_changed=("Re-verified 2026-10-11: still MiniMax's current generation (Hailuo 3.0). H3 Max is the published cost-efficient tier "
                  "(768p $0.08/s, 480p $0.05/s; Pixazo ran a 50% promo to $0.04/$0.025 in Sept 2026). H3 480p at $0.038/s confirmed with MiniMax "
                  "but unpublished (monid connector docs). Open weights: announced 'in the coming days' July 31, 2026, no public weights repo confirmed "
                  "as of Oct 11, treat as pending. Arena: Gemini Omni Flash leads T2V; H3 Max ranks top-3 in earlier reports (verify live)."),
    cost_replace=("API MiniMax-H3: $0.13/s 2K, $0.08/s 768p; 480p $0.038/s (vendor-confirmed, unpublished); "
                  "H3 Max: $0.08/s 768p, $0.05/s 480p (published); H3-Max-Turbo: $0.04/$0.025/s 768p/480p (unpublished); "
                  "input video billed at output tier rate; first 5 ref images free, then $0.04 each, verify live"),
    extra_sources=("https://github.com/monid-ai/monid/blob/HEAD/openspec/changes/add-connector-minimax/design.md",
                   "https://www.abnewswire.com/pressreleases/pixazo-announces-reduced-pricing-on-minimax-h3-max-api-expanding-affordable-access-to-ai-video-with-native-audio_837151.html",
                   "https://pixo.video/blog/what-is-minimax-h3"))

# ------------------------------------------------------------ Grok Imagine
m = by["Grok Imagine Video 1.5"]
touch(m,
    what_changed=("2026-10-01/06: NEW Lite tier, Grok Imagine Video 1.5 Lite (xAI, model id grok-imagine-video-1.5-lite): 1-15s, 480p/720p/1080p "
                  "(1080p rendered at 720p upscaled), text+image to video, native audio, $0.02/s at 480p to $0.14/s at 1080p, $0.01/image input. "
                  "Live on xAI API, Venice, Vercel AI Gateway, OpenRouter. Also added to ComfyUI partner nodes (v0.39.0). "
                  "Headline 1.5 pricing stays $0.08/s."),
    cost=("Lite (Oct 2026, verify live): $0.02/s 480p to $0.14/s 1080p; $0.01/image input; 1-15s clips; 16:9, 9:16, 1:1, 4:3, 3:4, 3:2 +1."),
    extra_sources=("https://openrouter.ai/x-ai/grok-imagine-video-1.5-lite",
                   "https://llmgateway.io/timeline",
                   "https://deployedbyai.com/log/b06e09074889/grok-imagine-video-1-5-lite/",
                   "https://whatsnew.fyi/product/comfyui/releases/v0.39.0"))

# ------------------------------------------------------------ Midjourney V1
m = by["Midjourney V1 Video"]
touch(m,
    what_changed=("Re-verified 2026-10-11: no V2 announced; V1 (June 18, 2025) remains the current video model, still image-to-video only, "
                  "5s extendable to 21s, no native audio."),
    extra_sources=("https://www.outlookbusiness.com/deeptech/artificial-intelligence/midjourney-launches-v1-ai-video-model-generating-5second-clips-from-images",))

# ------------------------------------------------------------ Runway Gen-4.5
m = by["Runway Gen-4.5"]
touch(m,
    what_changed=("Re-verified 2026-10-11: no new first-party model shipped, Gen-4.5 is still the latest. Runway's September 2026 news was distribution "
                  "(other vendors' models inside its MCP). Runway is transitioning into a multi-model aggregator: one subscription now includes "
                  "Veo 3.1, Kling 3.0 Pro, Seedance, FLUX, Seedream (third-party catalog docs). Max plan ($95/mo, 9,500 credits) replaced Unlimited for "
                  "new subscribers June 1, 2026."),
    cost=("Gen-4.5: 12 credits/s (5s = 60 credits, 10s = 120); API $0.12/s. Standard $15/mo (625 credits) / Pro $35/mo (2,250) / Max $95/mo (9,500, 1-mo rollover)."),
    extra_sources=("https://magichour.ai/blog/runway-gen-45-pricing",
                   "https://multilogin.com/blog/runway-ai-review/",
                   "https://www.therundown.ai/tools/runway-gen-4-5",
                   "https://www.versely.studio/blog/state-of-ai-video-oct-2026"))

# ------------------------------------------------------------------ LTX-2.5
m = by["LTX-2.5"]
touch(m,
    what_changed=("Re-verified 2026-10-11: open-weights release confirmed and healthy, community running it on Intel Arc Pro B70 pairs (5s 1280x704 in ~21s warm, "
                  "Oct 2026), AWS L40S bake-offs succeeding. Hosted rows from ~44 credits (Fast) / 58 (Pro). 33M+ LTX world-model downloads reported."),
    extra_sources=("https://github.com/red-weasel/machx-inference-engine/blob/HEAD/docs/ltx25/LTX25_ON_ARC.md",
                   "https://roboticsandautomationnews.com/2026/08/13/ltx-launches-new-free-to-use-open-world-model-for-video-and-physical-ai/104079/"))

# ------------------------------------------------------------------- Vidu S2
m = by["Vidu S2"]
touch(m,
    what_changed=("Re-verified 2026-10-11: S2 went real-time Sept 15, 2026 (S2-Avatar interactive character to 720p; S2-Editing re-edits live streams). "
                  "Oct 7, 2026: Vidu Q4 Preview launched, next-gen flagship (added as its own record this wave)."),
    extra_sources=("https://www.versely.studio/blog/state-of-ai-video-oct-2026",
                   "https://www.globenewswire.com/news-release/2026/10/07/3376813/0/en/shengshu-technology-launches-vidu-q4-preview-a-next-generation-ai-video-model-built-for-lifelike-performances.html"))

# ------------------------------------------------------------ Mirage Tesseract
m = by["Mirage Tesseract"]
touch(m,
    what_changed=("Re-verified 2026-10-11: launched Sept 22, 2026 by Mirage (formerly Captions) as announced. Agent-driven editing/motion-graphics suite, "
                  "confirmed NOT a generation model: local engine free; agents work natively with layers, compositions, keyframes, masks, timing, sound. "
                  "No pricing for the hosted tier published yet, verify live."),
    extra_sources=("https://lifestyle.therapybutbetter.com/story/351680/mirage-introduces-tesseract-a-video-creative-suite-built-for-ai-agents/",))

# ---------------------------------------------------------------------- Pika
m = by["Pika 2.5"]
touch(m,
    what_changed=("Re-verified 2026-10-11: no Pika 3.0, 2.5 is still the current first-party model. Pika REBUILT into a routing studio (Sept 2026): "
                  "homepage catalog now routes across Seedance 2.5, Pika 2.5, GPT Image 2.5, Grok Imagine 1.5, Gemini 1.1 Omni Flash, Nano Banana 2, MiniMax H3 "
                  "(alphasignal). Pika API Club (self-serve, multi-provider) announced Aug 5, 2026 (magichour). Automatic routing means model pinning "
                  "is advised for reproducible work."),
    extra_sources=("https://alphasignal.ai/news/pika-rebuilds-into-a-full-creative-studio-routing-across-seven-ai-tools",
                   "https://magichour.ai/blog/ai-video-api-magic-hour-vs-runway-vs-pika"))

# ------------------------------------------------------------ Luma App / Ray
m = by["Luma App / Ray 3.2"]
touch(m,
    what_changed=("Re-verified 2026-10-11: no Ray 3.5, Ray 3.2 remains current. Legacy models (Ray 3, Ray 2, Ray 2 Flash, Ray 2 Relaxed, Ray 3 Reference, "
                  "Ray 3 Refiner) retired from the legacy API with migration deadline Oct 5, 2026, move to ray-3.2 on the Luma Agents API. "
                  "ComfyUI v0.39.0 deprecated Ray 2 nodes. Luma App now bundles third-party models (Veo 3.1, Kling 3.0, Seedance 2.0, ElevenLabs)."),
    cost=("Luma API standard video: $0.06 (5s, 360p) to $1.20 (5s, 1080p); $0.18-$3.60 for 10s generations (verify live)."),
    extra_sources=("https://mivicai.com/luma-ray-3-2-powerful-cinematic-video-creation/",
                   "https://whatsnew.fyi/product/comfyui/releases/v0.39.0"))

# ------------------------------------------------------------ Higgsfield rows
m = by["Soul 2.0"]
touch(m,
    what_changed=("Re-verified 2026-10-11: still Higgsfield's current image model; no Soul 3.0 announced. Style presets + Color Transfer confirmed current."),
    extra_sources=("https://github.com/osidemedia/higgsfield-ai-prompt-skill/blob/HEAD/skills/higgsfield-models/SKILL.md",))

m = by["Soul Cinema"]
touch(m,
    what_changed=("Re-verified 2026-10-11: Soul Cinema is now the DEFAULT image model in Cinema Studio 3.0 and 3.5's image-mode picker (single-step cinematic "
                  "scene generator, tops out at 2K). Cinema Studio 3.5 (480p/720p/1080p video tiers, up to 15s) coexists with 2.5 and 3.0 (Business/Team). "
                  "Per-image cost still unpublished, verify live."),
    extra_sources=("https://github.com/dsm5e/aso-tracker/blob/HEAD/aso-video/docs/higgsfield-prompts/skills/higgsfield-soul/SKILL.md",))

m = by["Soul Cast"]
touch(m,
    what_changed=("Re-verified 2026-10-11: Soul Cast AI actors confirmed in Cinema Studio 2.5 (8 parameter categories) and 3.0 Business/Team "
                  "(General 2K / Character 4K / Location 4K)."),
    extra_sources=("https://github.com/steven-3352/case-study/blob/HEAD/.agents/skills/higgsfield-soul/SKILL.md",))

m = by["DoP (Lite/Standard/Turbo)"]
touch(m, what_changed=("Re-verified 2026-10-11: no changes found in Oct 2026 coverage, verify live."))

m = by["Marketing Studio video"]
touch(m, what_changed=("Re-verified 2026-10-11: no changes found in Oct 2026 coverage, verify live."))

# ------------------------------------------------------------------- Sora 2
m = by["Sora 2 / Pro / Max"]
touch(m,
    what_changed=("Re-verified 2026-10-11: still dead. Sora 2 API shutdown Sept 24, 2026 confirmed; versely's Oct-1 state-of-video: 'Delete Sora routes and "
                  "their retries. A 410 does not come back.'"),
    extra_sources=("https://www.versely.studio/blog/state-of-ai-video-oct-2026",))

# ================================================================ NEW: Vidu Q4 Preview
d["models"].append({
    "model": "Vidu Q4 Preview",
    "platform": "Vidu / Shengshu Technology",
    "type": "video",
    "best_use": "Expressive character performance, short dramas, ads, lifelike acting with voice consistency at flagship quality",
    "est_cost_credits": "Launch pricing from $0.014/s; 2K/4K 10-bit output, verify live (preview pricing may rise)",
    "strength": "Next-gen flagship preview (Oct 7, 2026): lifelike performances, cinematic 4K 10-bit, up to 15 image references, 3 audio references for voice consistency, stable camera moves and cuts, strong Chinese text rendering",
    "weakness": "Preview tier, launch pricing and final spec may change; short public track record, verify live before production",
    "last_verified": TODAY,
    "status": "active",
    "what_changed": ("NEW, launched Oct 7, 2026 (Shengshu Technology, GlobeNewswire). First public preview of Vidu's next-generation flagship for "
                     "expressive audio+video. Faster generation and lower costs positioned for short-drama, advertising, and film teams."),
    "sources": [
        "https://www.globenewswire.com/news-release/2026/10/07/3376813/0/en/shengshu-technology-launches-vidu-q4-preview-a-next-generation-ai-video-model-built-for-lifelike-performances.html",
        "https://www.morningstar.com/news/pr-newswire/20261007cn65903/vidu-launches-q4-preview-making-flagship-ai-video-creation-accessible-to-everyone",
        "https://usanewshour.com/shengshu-technology-launches-vidu-q4-preview-a-next-generation-ai-video-model-built-for-lifelike-performances/396369/",
    ],
})

# ================================================================ NEW: FLUX 3 Video
d["models"].append({
    "model": "FLUX 3 Video",
    "platform": "Black Forest Labs",
    "type": "video",
    "best_use": "Dialogue-heavy scenes, multi-shot single takes, typography-in-video; draft-then-finish cost control",
    "est_cost_credits": "API: $0.06/s 720p draft, $0.17/s 720p, $0.29/s 1080p (~$2.90/10s HD), verify live",
    "strength": "Up to 20s single take with native 1080p and native multilingual audio + lip-sync; start/end frames and ordered keyframes; multi-shot generation and video continuation in one take; strong typography; draft mode for cheap iteration; Arena text-to-video #2 (1496 pts, behind Gemini Omni Flash 1512)",
    "weakness": "Headline preference stats are vendor-run, not independent; native 2K/4K upscale and open weights promised as 'coming soon', verify live",
    "last_verified": TODAY,
    "status": "active",
    "what_changed": ("NEW, Black Forest Labs' first video model: announced July 23, 2026, public Aug 4, 2026. "
                     "Single multimodal backbone (image+video+audio) with robotics head; draft mode renders a cheap preview then the same video at full quality."),
    "sources": [
        "https://www.eweek.com/news/black-forest-labs-flux-3-multimodal-ai-robotics/",
        "https://dev.to/leilarowe/flux-3-review-2026-black-forest-labs-multimodal-video-model-priced-per-second-p76",
        "https://www.bottlerocketcontent.com/flux-3-video-black-forest-labs-launch/",
        "https://www.digitaltoday.co.kr/en/view/89607/black-forest-labs-releases-flux-3-video-to-public",
        "https://www.marktechpost.com/2026/07/26/black-forest-labs-releases-flux-3-a-multimodal-flow-model-for-image-video-audio-and-robot-action-prediction/",
    ],
})

assert len(d["models"]) == 29, f"expected 29 models, got {len(d['models'])}"
ART.write_text(json.dumps(d, indent=2, ensure_ascii=False) + "\n")
print(f"artifact-3-model-comparison.json: 27 -> 29 models, all last_verified={TODAY}")
