#!/usr/bin/env python3
"""Regenerate llms.txt and llms-full.txt from the guide's own data.

Generator owns these files (wave 15): hand edits will be clobbered by the
validator, which regenerates and diffs. Every number is computed from
CHAPTER_ORDER, data/v1/*.json, skills/, or the chapter sources themselves;
the remaining prose lives as constants in THIS file so drift is visible in
git, not silent in the text files.

llms-full.txt re-baseline (wave 15): chapter order is now the canonical
CHAPTER_ORDER, chapter text is the current source markdown, and the tools
appendix is generated from TOOLS — replacing the old hand-appended
"wave 9 / wave 11 additions" sections and the legacy chapter order.

FRESHNESS_DATE: bump when models.json is refreshed (mirrors its observed date).
"""

import json
import re
import sys
import textwrap
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
import build_site  # noqa: E402  (CHAPTER_ORDER)

FRESHNESS_DATE = "2026-10-11"

# Display order of chapter sections (the hand-set llms.txt order; differs from
# CHAPTER_ORDER's build order, which is a site-nav concern).
SECTION_ORDER = ["higgsfield", "field", "craft", "distribution", "legal",
                 "platforms", "economics", "case-studies", "sources", "guides"]

HEADER = """# AI Film Master Guide

The master guide to professional AI filmmaking: Higgsfield mastery, pro craft,
animated and photorealistic tracks, competition-entry craft. Static site + API.
Private research repo. Full text: `llms-full.txt`.

## Guide (human-readable site)

Generated static site in `site/` — rebuild with `python3 scripts/build_site.py`
after editing chapters. Open `site/index.html`.
"""

# (site url, one-line blurb) — also feeds the llms-full.txt tools appendix.
# Keep blurbs in sync with build_site.py's search-index tool entries.
TOOLS = [
    ("index.html", "landing: track picker (animated vs photorealistic), chapter grid, learning paths (7: first film, competition, animated, photoreal, long-form, first 60-second short, the 90-day filmmaker)"),
    ("teardown.html", "shot-by-shot teardown viewer: Passport Rush, ONEIRIC, the Grok Odyssey $100K winner, Google DeepMind's Dear Upstairs Neighbors, Fountain 0's Dreams of Violets (75-min Tribeca 2026 AI feature, $2K budget), Nikolay Shestak's The First Honest Day ($450K Astana 2026 Grand Prix winner; tools undisclosed — the teardown is honest about the gap), StoReel's The $150 Microdrama ('Off Campus' experiment: four AI episodes in four days, documented clip by clip), and Robert Gaudette's 'A Face Only a Mother Could Love' (8-minute solo short: $50K Runway AIFF 2026 Grand Prix + Reply AI Film Festival 2026 winner; character sheets before shot one, lip-sync in the prompt, redub for the voice; tool identity reported, not audited), and Tim Simmons' Dragon Blue (hyper-stylized AI action short, solo in two days with Claude Cowork as the production office: reference grids before video, filter-safety memory, token discipline; self-reported, skill published), and Svedka's 'Shake Your Bots Off' (first primarily AI-generated Super Bowl commercial, Super Bowl LX: Silverside AI rebuilt the lost Fembot mascot on component-based ComfyUI workflows — characters, world, choreography as separate controls; crowdsourced TikTok dance integrated in hours; vendor-hosted case study, corroborated by ADWEEK/TechCrunch) broken into shots (setup / what works / what breaks / craft lesson, labeled prompt reconstructions where the stack is documented); data in `data/v1/teardowns.json`"),
    ("manifesto.html", "positioning: a living free reference, not a course; everything sourced; what it won't do"),
    ("field-guides/", "printable one-pagers generated from the guide's own data: model quick-reference (from `models.json`), prompt anatomy cheat sheet, consistency & dead-eyes checklist"),
    ("api.html", "human-readable API docs + a Try-the-API console (endpoint picker, fetch, pretty-printed JSON), and pointers to `AGENT.md`"),
    ("skills.html", "browsable skills library with live filter"),
    ("budget.html", "interactive credit-budget calculator"),
    ("optimizer.html", "budget optimizer: runtime + dialogue share + quality bar → optimal model mix per bucket from `models.json`, with 5×/20× cost envelopes"),
    ("shots.html", "shot-list builder: per-shot type/model/seconds/takes → live cost table from `models.json`, totals with 5×/20× envelopes, localStorage lists, JSON export/import, one-click handoff to the optimizer"),
    ("doctor.html", "failure doctor: pick the symptom (face morph, dead eyes, plasticky skin…) → craft diagnosis + fix + deep link into the workshop's repair templates; 12 diagnoses in `data/v1/diagnoses.json` (+ schema)"),
    ("linter.html", "prompt linter: paste any prompt → structural analysis against the ten-layer anatomy (layers present/missing, vague words flagged, concrete fix per gap); heuristic, honest about it; one-click handoffs to the workshop and anatomy builder (`assets/js/linter.js`)"),
    ("cutting-room.html", "the cutting room, playable: type a weak prompt, roll the camera — a shot-by-shot shoot built from the real 47-template prompt library (`data/v1/prompt-templates.json`), real ten-layer analysis, guided fix-bay techniques quoted from real templates (cited by id), real cost math from the Watchtower pricing API with static fallback; take-by-take improvement loop (`assets/js/cutting-room.js`)"),
    ("models/", "model deep dives: one page per model ({n_models}) + index, generated from `data/v1/models.json` at build time — spec record, worked cost math (USD at $0.0392/credit), use-when/avoid-when from the model's own fields, prompt tips linking the guide's chapters"),
    ("anatomy.html", "anatomy of a prompt: interactive nine-layer annotated example + build-your-own mode"),
    ("workshop.html", "interactive prompt workshop (template × model × track, save/rate, optional style-bible prepend from `site/style-bible.html`)"),
    ("style-bible.html", "style-bible builder: describe character/world once → reusable STYLE LOCK block; named bibles in localStorage (`afg-style-bibles`), copy/save/export/import, workshop integration"),
    ("episode-planner.html", "episode planner: lock a mini-drama series (title, logline, hashtag, cast with voice IDs + anchors), plan episode blocks (one emotion, 3–5 beats, turn, cliffhanger), arc tracker with lessons; saved blocks feed one-click 'Send series to Studio' — the planner stages title/logline/cast anchors/every block's format, runtime, and beats into the Studio's series mode; localStorage (`afg-episode-series`)"),
    ("hook-generator.html", "hook-title generator: `[Episode N] + [one-line emotional stake] + [CTA]` → 5 worked caption variants, each with a why-this-hooks note"),
    ("studio.html", "Studio 2.0 — AI-film studio simulator: a standalone film (title, logline, genre/mood, runtime, draft/festival tier) or a serialized series (3–10 episodes, one of the 5 proven serialized format presets: mini-drama / POV micro-series / day-in-the-life / revenge arc / interactive — each pre-filling runtime band, beat structure, hook style, the dialogue-budget rule) in → deterministic production packet — shot list with per-shot prompts built from the 47-template library, per-shot model picks from `models.json` with cost math, budget table with 5×/20× envelopes, shooting schedule, series bible with locked prompt DNA + locked-anchor asset reuse, self-contained HTML/Markdown packet export (download, print), localStorage plans with names, duplicate, delete, continue-planning; one-click 'Send to Studio' bridge from the episode planner"),
    ("greenlight.html", "the green light — a studio meeting, playable: pitch a film concept (title, logline, genre, runtime, resolution, draft/festival ambition) → a six-layer cold read (someone to watch, something happening, a camera decision, light, place and time, a feeling) with a 0–100 score → the shot list from the real 47-template prompt library via the Studio engine → every shot priced from `data/v1/pricing.json` (per-second tiers, low/high ranges, tier + arithmetic shown per shot) → day-by-day schedule → verdict: GREEN LIGHT / CONDITIONAL / BACK TO THE ROOM. The money rule: festival ambition only unlocks flagship pricing when the read clears 55/100 — a cold read gets draft money, stated on the record. Punch-up buttons add craft layer by layer and re-run the plan (watch the money move). Hype hygiene: Veo 4 doesn't exist (SEO bait — verified Oct 2026), Kling 4.0 is announced-not-shipped, Sora discontinued — named and corrected, never priced. Markdown export, print. Takes from the cutting room walk straight in (`assets/js/greenlight.js`, engine unit-tested in `scripts/greenlight.test.js`)"),
    ("grade.html", "the grade sheet — the color-grading chapter as a working tool: five pre-grade gates (every element assigned to plate or grade, hero reference chosen per scene, one show look locked, one grain applied last, pre-grade masters archived), every scene logged with its hero reference, its source (single / mixed models) and its five matching steps (exposure + white balance, contrast curve, saturation, de-plasticize texture, skin last) and its state (unified / drifting / unmatched); the grade verdict is computed from the chapter's rules — a scene with no hero reference reads unmatched whatever its owner claims, unfinished steps hold the grade, a clean sheet still owes the scopes check; markdown export (`assets/js/grade.js`, engine unit-tested in `scripts/grade.test.js`)"),
    ("cut.html", "the cut sheet — the editing chapters as a working tool: five pre-lock gates (selects discipline — 2–4 takes, one keeper; generation receipts kept for every kept take; takes named like an editor — scene, shot, version, verdict; cut to sound early with the temp score in and J/L-cuts placed; lock order respected — picture before grade and mix, upscale last), every shot logged with its duration, its three inspection passes (story pass, background scan, motion pass at half speed), the frame-by-frame check a hold over five seconds owes, its finding (none / local / structural), its route (in the cut / in repair on the fix-it ladder / sent back to regenerate / cut from the film) and its failed repair attempts; the picture-lock verdict is computed from the chapters' rules — a hold over five seconds without the frame check reads uninspected, a structural defect routed to repair reads misrouted, two failed repairs strike a shot out under the two-strike rule, a clean sheet still owes the 24-hour rule and the three-screen watch; markdown export (`assets/js/cut.js`, engine unit-tested in `scripts/cut.test.js`)"),
    ("longform.html", "the longform sheet — the long-form pipelines chapter as a working tool: five pre-lock gates (asset registry complete before shot one; every scene stress-tested and storyboarded; architecture chosen — scene-by-scene chaining or sequence assembly with a registry wrangler; dialogue architecture chosen per scene, not per film; lock discipline — base portrait never re-run, plates carry the look, Voice Bible verbatim, island prompts), every scene logged with its stress test, its storyboard, its reference (video / text / none), its dialogue route (native / human-recorded and converted / decoupled / silent), its draft tier (720p draft / upscaled winner / full-res generation), its re-rolls and its route (in production / picture-locked / in generation supervision / cut from the film); the feature-lock verdict is computed from the chapter's rules — a scene generated without its stress test reads untested, a scene chained off a text description reads drifting, a scene generated at full resolution before its winner is chosen reads wasteful, a clean sheet still owes picture-lock discipline and the 5–20× overhead envelope; markdown export (`assets/js/longform.js`, engine unit-tested in `scripts/longform.test.js`)"),
    ("take.html", "the take sheet — the directing-performance chapter as a working tool: five pre-lock gates (every beat rewritten as a playable tactic; eyelines named per beat; the director's read — shared event plus a physical channel per character; identity locked, the face anchor never re-run; the restraint pass), every performance beat logged with its direction (tactic / emotion label), its eyeline, its dead-eyes check, its framing and whether it sits on an emotional peak, its failed rehearsals and its route (in rehearsal / Scene-Locked / simplify the shot / hybrid); the performance-lock verdict is computed from the chapter's rules — an emotion label reads undirected, three failed rehearsals read overdue (simplify the shot, not the actor), a close-up away from its peak reads misspent, a clean sheet still owes Scene Lock discipline; markdown export (`assets/js/take.js`, engine unit-tested in `scripts/take.test.js`)"),
    ("cuesheet.html", "the cue sheet — the sound chapter as a working tool: five pre-mix gates (Voice Bible, per-scene dialogue route never mixed mid-scene, score briefed per cue to the locked cut, stems kept, generation receipts saved), every scene logged with its three layers (bed / foley / accents), its dialogue route (decoupled / native / none) and its state (designed / thin / dry); the mix verdict is computed from the chapter's rules — a scene with no bed reads dry whatever its owner claims, a thin scene holds the mix, a clean sheet still owes the three-way listen and the silence test; markdown export (`assets/js/cuesheet.js`, engine unit-tested in `scripts/cuesheet.test.js`)"),
    ("quiz.html", "model-picker quiz: 5 questions → ranked top-3 from `models.json` with cost math, one-click handoff to the workshop"),
    ("compare.html", "model compare: 2–3 models side by side (cost, best use, strengths, weaknesses, native audio, status/last-verified) from `models.json`, shareable via URL params; discontinued excluded"),
    ("gallery.html", "prompt gallery: your workshop-saved prompts (localStorage) browsable, filterable by track/model, sortable by rating, open-in-workshop deep links, JSON export/import"),
    ("model-watch.html", "the Watchtower 2.0 — model status with a memory: all {n_models} models with last-verified dates, status, what changed, sources; a since-your-last-visit panel (the browser remembers your last visit in localStorage; live from `/api/models-changes`, recomputed locally from the static files when the function is down), a drift board (flagged checks, failed checks, unwatched models, unpublished rates — severity per model from the drift engine in `server/lib/drift.js`, mirrored in `assets/js/watchtower-lib.js`), pricing changes diffed mechanically against the 2026-10-11 baseline in `data/v1/model-history.json`, and the full dated event log; \"verify live before spending\" banner; generated from `models.json` + `model-checks.json` + `pricing.json` + `model-history.json` at build time"),
    ("checks/", "knowledge checks: 6 scenario-based quizzes (5 questions each) for prompt engineering, directing performance, character consistency, long-form pipelines, sound/music/audio, rights & disclosure; answers explain why, progress in localStorage (`assets/js/checks.js`, data in `scripts/checks.json`)"),
    ("changelog.html", "dated changelog rebuilt from git history"),
    ("skill-spec.html", "the skill frontmatter+sections format as a spec"),
    ("search-index.json", "client-side search index (Ctrl+K palette)"),
]

# Hand-authored per-chapter annotations, keyed (section, slug).
SECTION_NOTES = {
    ("field", "2026-developments"): " (Tribeca's Dreams of Violets, 2026 model field, Sora shutdown, long-form workflow consensus, India/Pakistan AI cinema)",
    ("distribution", "festival-landscape-2026"): " (Astana's $450K Grand Prix economics, Reply/Runway/Tirana/MEGA, what wins and why)",
    ("guides", "first-short"): " (7-day plan: zero to one finished 60-second short)",
}

MODELS_NOTE = ("Refreshed 2026-10-11: Sora discontinued, Kling 4.0 announced, "
               "MiniMax H3 / Midjourney V1 Video / Seedance 3.0 (reported) added. "
               "See `data/v1/model-updates.md`")

KEY_FACTS = """## Key facts agents should know

- Higgsfield pricing (read live 2026-10-10): Starter $19/mo annual = 270 credits;
  Plus $47/mo annual = 1,200; Ultra $99/mo annual = 3,000. Verify live before budgeting.
- Credit costs in `models.json` are Higgsfield credits per 5s unless noted.
- Long-form rule: 5–20× generation overhead; assets before shots; registry as production database."""

KNOWN_LIMITS = """## Known limitations

- Some per-model costs unverified (Seedance 2.5, Soul Cinema, Luma/Pika on
  Higgsfield) — listed in `models.json` → `unverified`."""

# Category display order (counts computed from skills/ on disk).
CATEGORY_ORDER = ["prompts", "camera", "models", "checklists", "longform",
                  "techniques", "craft", "entry", "workflow", "episodes",
                  "compare", "fix", "budget", "delivery", "audio", "recipes",
                  "styles", "performance", "grading", "distribution", "legal"]

TRACK_ORDER = ["core", "animated", "photorealistic", "performance", "audio",
               "longform", "repair"]

# Teardown display titles that differ from the raw record title.
TEARDOWN_TITLES = {"odyssey-winner": "Grok Odyssey $100K winner",
                   "gaudette-mother-could-love": "Gaudette's 'A Face Only a Mother Could Love'",
                   "dragon-blue-production-office": "Simmons' Dragon Blue — The Production Office",
                   "svedka-lost-fembot": "Svedka's 'Shake Your Bots Off' — The Lost Fembot"}


def natkey(s):
    return [int(p) if p.isdigit() else p for p in re.split(r"(\d+)", s)]


def jload(rel):
    return json.loads((ROOT / rel).read_text())


def chapters():
    return [(sec, slug) for sec in SECTION_ORDER
            for slug in build_site.CHAPTER_ORDER[sec]]


def build_llms_txt():
    models = jload("data/v1/models.json")
    templates = jload("data/v1/prompt-templates.json")["templates"]
    camera = jload("data/v1/camera-movements.json")["movements"]
    glossary = jload("data/v1/glossary.json")
    diagnoses = jload("data/v1/diagnoses.json")["diagnoses"]
    teardowns = jload("data/v1/teardowns.json")["teardowns"]
    n_models = len(models["models"])
    n_skills = sum(1 for _ in (ROOT / "skills").rglob("*.md"))
    n_terms = len(glossary["terms"]) if isinstance(glossary, dict) else len(glossary)

    ch = chapters()
    n_chapters = len(ch)

    out = [HEADER]
    out.append(f"- `site/index.html` — {TOOLS[0][1]}")
    out.append(f"- `site/<section>/<chapter>.html` — {n_chapters} chapters with sidebar nav, table of contents, prev/next; "
               "every chapter shows its honest read time (200 wpm from actual word count) "
               "and prints cleanly via `@media print` (`assets/css/print.css`)")
    for url, blurb in TOOLS[1:]:
        out.append(f"- `site/{url}` — {blurb.format(n_models=n_models)}")
    out.append("")
    out.append(f"Interactive in-context glossary: `assets/js/glossary.js` wraps the {n_terms} `glossary.json` terms "
               "in chapter prose (first occurrence per page) with hover/focus/tap popover definitions.")
    out.append("")
    out.append("Chapters (source Markdown, also the canonical text):")
    for sec in SECTION_ORDER:
        slugs = build_site.CHAPTER_ORDER[sec]
        parts = []
        for slug in slugs:
            note = SECTION_NOTES.get((sec, slug), "")
            parts.append(f"{slug}{note}")
        out.append(f"- `{sec}/` — " + ", ".join(parts))
    out.append("")
    out.append("Note: competitions are covered only as craft teachers (constraints, judging")
    out.append("criteria, delivery discipline). No prizes, deadlines, or promotional material.")
    out.append("")
    out.append("## API (static JSON, versioned)")
    out.append("")
    out.append("Base: `data/v1/` — rebuild with `python3 scripts/build_api.py` (reads the")
    out.append("research artifacts; outputs committed).")
    out.append("")

    # template track breakdown: "15 core (`t1`–`t15`), 8 animated (`a1`–`a8`), ..."
    by_track = {}
    for t in templates:
        by_track.setdefault(t["track"], []).append(t["id"])
    track_bits = []
    for tr in TRACK_ORDER:
        ids = sorted(by_track.get(tr, []), key=natkey)
        track_bits.append(f"{len(ids)} {tr} (`{ids[0]}`–`{ids[-1]}`)")

    teardown_names = ", ".join(TEARDOWN_TITLES.get(t["id"], t["title"]) for t in teardowns)

    out.append("- `data/v1/index.json` — manifest: every endpoint with description, schema URL, `updated` timestamp, record counts, deprecation notes; `meta.version` 1.1.0; repo-level agent guide at `AGENT.md`")
    out.append(f"- `data/v1/models.json` — {n_models} models: platform, type, credit costs, strengths, weaknesses, best use, "
               "plus per-model `last_verified`, `status` (active/reported/announced/discontinued), `what_changed`, `sources`; "
               f"explicit `unverified` list. {MODELS_NOTE}")
    out.append(f"- `data/v1/prompt-templates.json` — {len(templates)} templates: " + ", ".join(track_bits) + "; anatomy, use, models")
    out.append(f"- `data/v1/camera-movements.json` — {len(camera)}-move camera lexicon with prompt phrasing and use cases")
    out.append("- `data/v1/checklists.json` — pre-production, per-shot, continuity, audio, delivery checklists")
    out.append(f"- `data/v1/glossary.json` — {n_terms} AI film / production terms")
    out.append("- `data/v1/competitions.json` — judged competitions as craft records: what they judge, production constraints, craft lessons; no prizes or deadlines")
    out.append(f"- `data/v1/teardowns.json` — shot-by-shot teardowns ({teardown_names}): setup, what works, what breaks, craft lesson per shot; "
               "prompt reconstructions labeled as analytical, not actual prompts")
    out.append(f"- `data/v1/diagnoses.json` — failure-diagnosis map for the Doctor tool: {len(diagnoses)} symptoms → craft diagnosis, fixes, repair-template link, source chapters")
    out.append("- `data/v1/model-checks.json` — model-watch freshness feed: per-model last check, source-signature diffs, news headlines")
    out.append("- `data/v1/model-review-queue.json` — pending model-watch review items (empty = nothing pending)")
    out.append("- `data/v1/model-history.json` — Watchtower 2.0 event log: dated status/price/tier/release/verification/coverage events per model + the 2026-10-11 pricing baseline the drift engine diffs the live pricing table against")
    out.append("- `data/v1/model-review-log.json` — Watchtower review log: the adjudication record for checker flags — every flag re-fetched and given a verdict with its basis before the queue clears (Watchtower 2.2)")
    out.append("- `data/v1/schema/` — JSON Schema (draft-07) for EVERY endpoint: index, model, prompt-template, camera-movement, checklist, glossary, competition, teardown, diagnosis, model-checks, model-review-queue, model-history, model-review-log")
    out.append("- `AGENT.md` — how an agent uses this repo: base URL pattern, example requests, five end-to-end workflows (Studio planning, prompt linting, model price tracking, mini-drama series setup, microdrama run economics) — executable via `node scripts/agent-workflows.test.js`")
    out.append("")
    out.append("## Skills (agentic task procedures)")
    out.append("")
    out.append(f"{n_skills} skills in `skills/` — rebuild with `python3 scripts/build_skills.py`")
    out.append("(generates from `data/v1/` data + authored procedures; outputs committed).")
    out.append("`skills/index.json` is the manifest: id, title, description, path per skill.")
    out.append("")
    out.append("For agents: load the skill whose task matches the request — skills are the")
    out.append("primary interface for *doing* work; the JSON endpoints are the data layer.")
    out.append("`data/v1/index.json` points here (`repository`, `skills`, `for_agents`).")
    out.append("")
    cats = textwrap.fill("Categories: " + ", ".join(
        f"{c} ({sum(1 for _ in (ROOT / 'skills' / c).rglob('*.md'))})"
        for c in CATEGORY_ORDER if (ROOT / "skills" / c).is_dir()) + ".",
        width=72)
    out.append(cats)
    out.append("")
    out.append(KEY_FACTS)
    out.append("")
    out.append(KNOWN_LIMITS)
    out.append("")
    return "\n".join(out)


def build_llms_full():
    n_models = len(jload("data/v1/models.json")["models"])
    out = ["# AI Film Master Guide — full text", "",
           f"Static site: site/index.html. API: data/v1/. Generated {FRESHNESS_DATE}.", ""]
    for sec, slug in chapters():
        name = f"{sec}/{slug}.md"
        text = (ROOT / name).read_text().rstrip("\n")
        out.append(f"<!-- chapter: {name} -->")
        out.append(text)
        out.append("")
    out.append("<!-- tools: generated from build_llms.py TOOLS -->")
    out.append("# Interactive Tools (site/)")
    out.append("")
    for url, blurb in TOOLS:
        if url == "index.html":
            continue
        out.append(f"- `site/{url}` — {blurb.format(n_models=n_models)}")
    out.append("")
    return "\n".join(out)


def main():
    (ROOT / "llms.txt").write_text(build_llms_txt())
    (ROOT / "llms-full.txt").write_text(build_llms_full())
    print("wrote llms.txt + llms-full.txt")


if __name__ == "__main__":
    main()
