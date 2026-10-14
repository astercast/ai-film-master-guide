#!/usr/bin/env python3
"""Wave 30: Late-Q4 model field sweep, re-verify all 29 models, add 1 new.

Fuel: live web research conducted 2026-10-11 (browser.search batches).
Every changed number carries a source URL or a "verify live" flag.
No invented specs: third-party numbers are labeled as such; single-source
claims carry an explicit single-source flag.

Headline correction: Vidu Q4 Preview's "$0.014/s" was the launch-headline
promotional floor (off-peak), NOT the list rate. The official Oct 7, 2026
rate card: $0.045/s at 540p, $0.12/s at 1080p, $0.39/s at 4K
(GlobeNewswire; sloptvnews). The cost string is written so the Studio's
rate parser binds the documented list rates to their resolutions, and the
$0.014 headline is deliberately non-parseable ("per second", no /s) so it
can never win the cost floor.

Edits the ARTIFACT (generator-owns-output), then re-run:
  python3 scripts/build_api.py   # assert updated 29 -> 30 inside
"""

import json
from pathlib import Path

ART = Path.home() / "workspace/research_notes/ai-film-mega-research-20261010-0311/artifacts/artifact-3-model-comparison.json"

d = json.loads(ART.read_text())
by = {m["model"]: m for m in d["models"]}
assert len(d["models"]) == 29, f"expected 29 models, got {len(d['models'])}"

TODAY = "2026-10-11"


def touch(m, what_changed=None, strength=None, cost=None, cost_replace=None,
          weakness=None, best_use=None, extra_sources=(), status=None):
    """Bump last_verified; append change notes; strength/cost/weakness/best_use
    appends unless *_replace is used. Never add resolution tokens to a cost
    string whose model must stay unpriced for the Studio's honest floor."""
    m["last_verified"] = TODAY
    if what_changed:
        prev = (m.get("what_changed") or "").strip()
        m["what_changed"] = (prev + " " if prev else "") + what_changed.strip()
    if strength:
        m["strength"] = (m.get("strength") or "").rstrip() + " " + strength.strip()
    if cost_replace:
        m["est_cost_credits"] = cost_replace.strip()
    elif cost:
        m["est_cost_credits"] = (m.get("est_cost_credits") or "").rstrip() + " " + cost.strip()
    if weakness:
        m["weakness"] = (m.get("weakness") or "").rstrip() + " " + weakness.strip()
    if best_use:
        m["best_use"] = (m.get("best_use") or "").rstrip() + " " + best_use.strip()
    if extra_sources:
        srcs = m.get("sources", [])
        for s in extra_sources:
            if s not in srcs:
                srcs.append(s)
        m["sources"] = srcs
    if status:
        m["status"] = status


# ---------------------------------------------------------------- Vidu Q4 Preview
# CORRECTION: the $0.014/s headline was promotional; list starts at $0.045/s 540p.
m = by["Vidu Q4 Preview"]
touch(m,
    what_changed=("Wave-30 CORRECTION: the $0.014/s launch headline was a promotional "
                  "off-peak floor, not a list rate. The official Oct 7, 2026 rate card "
                  "(GlobeNewswire): $0.045/s at 540p, $0.12/s at 1080p, $0.39/s at 4K; "
                  "image-to-video and reference-to-video at a 30% discount through "
                  "Nov 30; off-peak jobs at half. Artificial Analysis image-to-video: "
                  "Elo 1,179 on Oct 8, 2026, ranked #3, up 123 points from Vidu Q3 Pro's "
                  "1,056 (sloptvnews, single-source, the board itself was not re-polled "
                  "by this guide). Clips up to 16 seconds; image-to-video and "
                  "reference-to-video only, no text-to-video mode; audio on by default."),
    cost_replace=("Launch headline $0.014 per second was a promotional off-peak floor "
                  "(GlobeNewswire). List pricing (official Oct 7, 2026): $0.045/s at 540p, "
                  "$0.12/s at 1080p, $0.39/s at 4K; image-to-video and reference-to-video "
                  "30% off through Nov 30, verify live (preview pricing may change)"),
    extra_sources=("https://sloptvnews.com/vidu-q4-preview-price-per-second-launch-promo-vs-list/",
                   "https://www.morningstar.com/news/pr-newswire/20261007cn65903/vidu-launches-q4-preview-making-flagship-ai-video-creation-accessible-to-everyone"))

# ---------------------------------------------------------------- Kling 4.0 (still not GA)
m = by["Kling 4.0"]
touch(m,
    what_changed=("Re-verified 2026-10-11: STILL not GA. 'Coming this October' remains a "
                  "month, not a date (wavespeed Oct-1 evidence review; orcarouter: 'waiting "
                  "on a month, not a date'). Flash tier: 3-20s at 720p 8-bit SDR, limited "
                  "early access for Ultra Yearly subscribers. Announced (not confirmed) "
                  "full-model specs: 3-30s, 720p/1080p/4K, 21:9 ultrawide, up to 15 combined "
                  "multimodal references (10 images, 5 videos totaling at most 30s, 7 "
                  "subjects), 10 keyframes; no published price and no API model ID "
                  "(APIMart). Kling AI's Hong Kong IPO filing is proceeding in parallel "
                  "(reported ~120B yuan valuation)."),
    extra_sources=("https://finance.biggo.com/news/d4992938-39a9-4515-84b2-c35e4e2bdc27",))

# ---------------------------------------------------------------- Vidu S2
m = by["Vidu S2"]
touch(m,
    what_changed=("Re-verified 2026-10-11 against the official Sept 15, 2026 PR Newswire "
                  "release: S2-Avatar raised real-time output from 540p (S1) to 720p; users "
                  "can introduce a new reference image mid-session (object/outfit/background "
                  "change without restarting); S2-Editing applies style/outfit/subject/"
                  "background references to a live incoming stream. Real-time sessions are a "
                  "different product class from rendered clips, do not budget them as "
                  "per-second generation (versely.studio Oct 2026)."),
    extra_sources=("https://www.prnewswire.com/news-releases/shengshu-technology-unveils-vidu-s2-bringing-real-time-interaction-and-editing-to-ai-video-302879976.html",
                   "https://lapaasvoice.com/vidu-s2-real-time-ai-video-control/"))

# ---------------------------------------------------------------- Mirage Tesseract
m = by["Mirage Tesseract"]
touch(m,
    what_changed=("Re-verified 2026-10-11: launched Sept 22, 2026 (EZ Newswire) as an "
                  "agent-driven video creative suite, NOT a generation model. Agents get "
                  "direct access to the Captions native engine's layers, compositions, "
                  "keyframes, masks, adjustment layers, timing, and sound; they build from "
                  "user-supplied footage/images/brand assets/audio, and projects stay "
                  "editable, exportable, and reopenable. The local engine is free (Fortune, "
                  "via versely.studio). Keep this record in the edit/post lane, not the "
                  "generation pool."),
    extra_sources=("https://www.webdisclosure.com/press-release/mirage-introduces-tesseract-a-video-creative-suite-built-for-ai-agents-zPS3ERdoUFK",))

# ---------------------------------------------------------------- Grok Imagine Video 1.5
m = by["Grok Imagine Video 1.5"]
touch(m,
    what_changed=("Re-verified 2026-10-11: Lite-tier pricing now confirmed against xAI's "
                  "own API docs (via sloptvnews, Oct 2026): $0.02/s at 480p, $0.03/s at 720p, "
                  "$0.14/s at 1080p, plus $0.01 per input image; batch API, capped at 10 "
                  "requests/s, served in us-east-1 and us-west-2. Flagship 1.5: $0.08/s 480p, "
                  "$0.14/s 720p, $0.25/s 1080p (same ladder fal.ai lists). Venice listed Lite "
                  "Sept 30, 2026 ($0.04/clip entry)."),
    cost=("xAI API docs (rechecked Oct 2026): Lite $0.02/s at 480p, $0.03/s at 720p, "
          "$0.14/s at 1080p, +$0.01 per input image; flagship 1.5: $0.08/s at 480p, "
          "$0.14/s at 720p, $0.25/s at 1080p (third-party mirror of official docs, "
          "verify live)."),
    extra_sources=("https://sloptvnews.com/grok-imagine-video-1-5-lite-pricing/",
                   "https://venice.ai/models/grok-imagine-1-5-lite"))

# ---------------------------------------------------------------- Seedance 3.0 (still unannounced)
m = by["Seedance 3.0"]
touch(m,
    what_changed=("Re-verified 2026-10-11: STILL unannounced by any vendor as of Oct 1, 2026 "
                  "(versely.studio: 'Kling 4.0. Veo 4. Seedance 3.0. None of them had been "
                  "announced by any vendor as of 1 October'). A third-party directory "
                  "listing dated Oct 6, 2026 names 'Seedance 3.0' with generic copy and no "
                  "vendor link, treated as unconfirmed. ByteDance's real-time world-model "
                  "project (Bloomberg, ~50ms latency, Pico VR target) remains a separate "
                  "product built on Seedance, not a Seedance 3 video release. Status stays "
                  "'reported'."))

# ---------------------------------------------------------------- Veo 3.1
m = by["Veo 3.1"]
touch(m,
    what_changed=("Re-verified 2026-10-11: GA on Vertex (veo-3.1-generate-001); Lite tier on "
                  "Gemini API at $0.05/s 720p, $0.08/s 1080p; Standard $0.40/s (720p/1080p), "
                  "$0.60/s 4K; Fast $0.15/s, $0.35/s 4K (third-party mirror of Google docs, "
                  "verify live). Vertex has cheaper silent SKUs (~$0.03/s vs $0.05/s at 720p "
                  "for Lite, mer.vin, single-source). Clip durations 4/6/8s only; Vertex "
                  "serves us-central1 only; generated videos are deleted from the server "
                  "after 2 days (mer.vin). Veo 2 was shut down June 2026."),
    cost=("API ladder (third-party mirror of Google docs, verify live): Standard $0.40/s "
          "720p/1080p, $0.60/s 4K; Fast $0.15/s, $0.35/s 4K; Lite $0.05/s 720p, $0.08/s "
          "1080p (Gemini API; Vertex silent SKUs cheaper, single-source)."),
    extra_sources=("https://github.com/popschlock/promptfu/blob/HEAD/skills/promptfu/models/google/veo-3-1.md",
                   "https://mer.vin/2026/09/which-ai-video-models-actually-take-a-first-and-last-frame/",
                   "https://www.scriptbyai.com/gpt-gemini-claude-pricing/"))

# ---------------------------------------------------------------- Seedance 2.5
m = by["Seedance 2.5"]
touch(m,
    what_changed=("Re-verified 2026-10-11: 4-30s clips (BytePlus docs); references up to 50 "
                  "per run (30 images, 10 videos, 10 audio clips); edits by timestamp and "
                  "extension over several rounds. Official BytePlus rates re-read Oct 6, "
                  "2026: $0.1028/s 480p, $0.2311/s 720p, $0.5686/s 1080p (cellcog.ai). "
                  "Dreamina (ByteDance app) runs a first-month $0.035/s promo; the Seedance "
                  "API is not available in the US (BytePlus terms, Sept 30, 2026)."),
    cost=("BytePlus official, re-read Oct 6, 2026: $0.1028/s at 480p, $0.2311/s at 720p, "
          "$0.5686/s at 1080p; Dreamina first-month promo about $0.035 per second "
          "(app-only promo, not an API rate), verify live (promos end)."),
    extra_sources=("https://cellcog.ai/blog/seedance-2-5-pricing/",
                   "https://github.com/devlinmarsh/seedance-2-5-api-quickstart/blob/HEAD/README.md"))

# ---------------------------------------------------------------- Seedance 2.0
m = by["Seedance 2.0"]
touch(m,
    strength=("Reference limits per BytePlus docs: up to 15 references per run "
              "(9 images, 3 videos, 3 audio); 4-15s clips; edit and extend supported."),
    what_changed=("Re-verified 2026-10-11: reference and duration spec confirmed against "
                  "BytePlus docs (via synthesys.io comparison, Oct 1, 2026)."),
    extra_sources=("https://synthesys.io/blog/seedance-vs-kling/",))

# ---------------------------------------------------------------- Wan 3.0 / 3.0 Prime
m = by["Wan 3.0 / 3.0 Prime"]
touch(m,
    what_changed=("Re-verified 2026-10-11: formally released Aug 24, 2026 (public beta since "
                  "Aug 6). Native 30-second single generation at 30fps, not stitched clips; "
                  "480p/720p/1080p; up to 10 image, 5 video, and 5 audio references; a "
                  "document mode turns PDFs, decks, or webpages into video. Alibaba Cloud "
                  "Model Studio: $0.05/s 480p, $0.10/s 720p, $0.20/s 1080p (Zacks, Aug 2026)."),
    extra_sources=("https://www.zacks.com/stock/news/2979739/alibabas-wan-30-ai-debut-follows-102b-share-sale-whats-ahead",
                   "https://openrouter.ai/alibaba/wan-3.0"))

# ---------------------------------------------------------------- MiniMax H3
m = by["MiniMax H3"]
touch(m,
    what_changed=("Re-verified 2026-10-11: H3 Max gained native 1080p and a Turbo tier per "
                  "Krea's Sept 9 changelog, single secondary source, hold loosely; the "
                  "guide's H3 Max figures are unchanged until confirmed. Open-weights "
                  "availability: the announcement promised release 'in the coming days', "
                  "verify live whether the gated HF repo has shipped before planning "
                  "self-hosted work."),
    extra_sources=("https://magichour.ai/blog/hailuo-23-pricing",
                   "https://pixo.video/blog/what-is-minimax-h3"))

# ---------------------------------------------------------------- LTX-2.5
m = by["LTX-2.5"]
touch(m,
    strength=("LTX-2.x Community License: free commercial use under $10M ARR, gated "
              "Hugging Face repo; Fast = distilled 8-step schedule, Pro = higher fidelity "
              "(Pro tops out at 1080p currently, verify live); native multi-shot scenes in "
              "one pass; automatic duration; audio-to-video up to 20s at 720p/1080p "
              "(10s at higher resolutions); fine-tuned Gemma 4 12B text encoder; ComfyUI "
              "native templates; LTX Desktop for local inference."),
    what_changed=("Re-verified 2026-10-11: license terms, Fast/Pro split, and audio-to-video "
                  "limits confirmed against community spec docs (Aug-Oct 2026). Record "
                  "stays unpriced for the Studio's honest floor, no per-second rate "
                  "documented on a resolution this guide will parse."),
    extra_sources=("https://github.com/nicholashui/common-agent-structure/blob/HEAD/spec/ltx_operation_guide.md",
                   "https://www.runcomfy.com/models/lightricks/ltx-2.5/image-to-video/fast",
                   "https://www.therundown.ai/tools/ltx-2-5"))

# ---------------------------------------------------------------- FLUX 3 Video
m = by["FLUX 3 Video"]
touch(m,
    what_changed=("Re-verified 2026-10-11: GA since Aug 2026. From Sept 10, 2026 BFL lists "
                  "QHD at $0.40/s and UHD at $0.80/s (video-to-video $0.65/s and $0.95/s); "
                  "FLUX Video Upscale shipped Aug 20 (1.5-3x, up to 4K, clips up to 20s) "
                  "(versely.studio, Oct 2026). The headline Elo scores remain vendor-run, "
                  "not independent, unchanged from the wave-21 caveat."),
    extra_sources=("https://the-decoder.com/black-forest-labs-makes-flux-3-video-generally-available-and-claims-it-beats-seedance-2-0/",
                   "https://www.digitaltoday.co.kr/en/view/89607/black-forest-labs-releases-flux-3-video-to-public",
                   "https://developers.cloudflare.com/ai/models/black-forest-labs/flux-3-video/"))

# ---------------------------------------------------------------- Sora 2 / Pro / Max (discontinued)
m = by["Sora 2 / Pro / Max"]
touch(m,
    what_changed=("Re-verified 2026-10-11: the Sora API is gone, versely.studio (Oct 2026) "
                  "advises deleting Sora routes and retries because 'a 410 does not come "
                  "back'. Status stays 'discontinued'."))

# ---------------------------------------------------------------- Runway Gen-4.5
m = by["Runway Gen-4.5"]
touch(m,
    what_changed=("Re-verified 2026-10-11: still the latest Runway model, no new model "
                  "shipped in 2026; September's news was distribution (other companies' "
                  "models inside Runway's MCP) (versely.studio, Oct 2026)."))

# ---------------------------------------------------------------- NEW: vivago R1 (HiDream)
d["models"].append({
    "model": "vivago R1",
    "platform": "HiDream.ai",
    "type": "suite",
    "status": "active",
    "strength": ("AI video creation agent: scriptwriting, storyboarding, video generation, "
                 "and editing in a single conversational workflow, with a lead agent plus "
                 "specialized agents (scripts, storyboards, characters, environments, "
                 "audio) keeping characters and settings consistent as a project develops. "
                 "Produces videos of up to five minutes in one production workflow, "
                 "extendable through additional rounds; CLI access for developers and "
                 "compatible AI agents."),
    "est_cost_credits": "not published, verify live",
    "weakness": ("Single-source launch announcement (EZ Newswire syndicate, Oct 9, 2026); "
                 "no published rate card and no independent production evidence yet, "
                 "verify live before planning around it. A workflow product, not a "
                 "shot-generation model, it belongs to the production lane."),
    "best_use": "Long-form AI video assembly (multi-minute projects), agent-driven production",
    "what_changed": ("NEW, made available globally Oct 9, 2026 (HiDream.ai, EZ Newswire). "
                     "The first agent-workflow entry in this guide's suite lane: a "
                     "multi-agent system that takes a natural-language brief through script, "
                     "storyboard, generation, and edit in one workflow."),
    "sources": ["https://lifestyle.nextmentors.com/story/878361/hidream-ai-makes-vivago-r1-available-globally-for-end-to-end-ai-video-production/"],
    "last_verified": TODAY,
})

d = {"cost_basis": d["cost_basis"], "generated": d["generated"],
     "models": d["models"], "unverified": d["unverified"]}
ART.write_text(json.dumps(d, indent=2) + "\n")
print(f"artifact-3-model-comparison.json: 29 -> {len(d['models'])} models, all last_verified={TODAY}")
