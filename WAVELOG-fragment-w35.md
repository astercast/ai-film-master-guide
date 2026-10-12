# Wave Log — AI Film Master Guide

## Wave 35 — New deep craft chapter: "Documentary Ethics for AI Footage" (2026-10-11)

**Assignment:** parallel lane — waves 33 (teardown #9: Tim Simmons' Dragon Blue) and 34
(Studio expansion: agentic-production-office chapter) run concurrently. Wave 35 touched
none of their files: only NEW files were written; every shared-file edit is staged in
`MERGE-fragment-w35-sources.md` for the merge worker.

**Topic choice.** The candidate directions were AI-native sound/voice craft, directing
synthetic performers, and documentary-ethics craft. The first two are already deep
chapters (`craft/sound-music-audio.md`, 85 lines with two-pass voice, TTS direction,
rights gap; `craft/directing-performance.md`, 180 lines) — a new chapter there would
duplicate. Documentary ethics had no chapter and genuine fresh material: the *Dreams
of Violets* collision at Tribeca (wave 23's "plan for the ethics question" takeaway was
still unexpanded), a current six-step disclosure workflow (magichour, Oct 2026), and
2026 platform disclosure rules with real exemption detail.

**Research** (3 fresh search batches on 2026-10-11 + the Cycle-1 scout notes +
`~/workspace/research_notes/ai-film-deep-2026-20261011-2154/report.md`):

1. *Dreams of Violets* — corroborated across outlets: 75-min docudrama, Tribeca
   Festival June 10, 2026 (first fully AI-generated live-action film at a major
   festival), dir. Ash Koosha, Fountain 0, ~$2K, ~3 months, Kling AI + Claude +
   Gemini + Nano Banana, built from journalistic reports/photographs/eyewitness
   accounts; January 2026 Tehran protests, five Iranians, Amir (10, cerebral palsy).
   Reception split: Jane Rosenthal's defense (Variety) vs. the A.V. Club's hostile
   review; Guardian framing piece (June 3, 2026); THR on the distributor/festival-rep
   walkout. All paraphrased, zero direct quotes.
2. Disclosure mechanics — YouTube/TikTok/Meta trigger and exemption detail
   (builtbyfoundry.io, ~Sept 2026): realism as trigger; YouTube's exemption list
   (filters, color, upscaling, audio repair, own-voice cloning) and no-penalty-for-
   disclosing line; TikTok's permanent auto-label from Content Credentials; banned-
   even-with-label categories. magichour.ai's six-step disclosure workflow (Oct 2026):
   describe what changed → classify realism/risk → clear inputs/claims → select
   platform control → add human-readable context → verify the published result.
   everymoviehasalesson.com (Oct 2026): sort assets by the claim they make; a label
   is not proof. EU AI Act Art 50 (applies Aug 2, 2026; grace to Dec 2026 —
   single secondary, flagged).
3. Svedka "Shake Your Bots Off" (verified, multiple outlets + ComfyUI case study):
   Super Bowl LX, Feb 8, 2026; first primarily AI-generated Super Bowl spot (per
   ADWEEK); Silverside AI; ~4 months rebuilding the lost Fembot CGI assets; humans
   on storyline; TikTok choreography call won by Jessica Rizzardi ($10,000 prize).
   Used as the clean synthetic-person case: own the likeness, credit and pay the
   human in the loop.
4. filmustage.com (Sept 2026): Human Provenance in Film framework (No AI Used /
   Assistive AI / Generative AI) + audience data (~two-thirds reject an AI lead,
   ~three-quarters want disclosure; Academy + guilds wrote "human" into rules).
5. Checked, no chapter change: Cycle-1 notes 03 (radio-edit/audio-first, AutoMV, DIY
   AWS pipeline) and 05 (Aleph 2.0, Topaz Astra) — informed the tool-mapping table;
   07 (Sora discontinued — already in field/2026-developments.md via wave 30).

**Shipped (new files only):**

1. **`craft/documentary-ethics.md`** (~23.4 KB; converts clean through md2html: 21
   headings, 11 sections, 3 comparison tables, 10-item pre-flight checklist, 3
   pull-quote blockquotes): the disclosure stack (5 layers), platform rules table
   (YouTube/TikTok/Meta), the six-step disclosure workflow, reconstruction
   discipline (source it / label it in the cut / never invent the unknowable), the
   archival-trap warning, synthetic persons (own-or-clear; USCO Part 2 Jan 2025;
   Val Kilmer/AB 1836; Svedka worked example), verification discipline (receipts,
   source dossier, AI-touch map), the pre-premiere ethics brief (4 parts), the
   *Dreams of Violets* worked example, eligibility mapping (Cannes line, HK AI IFF
   2027 redesign — flagged, Human Provenance tiers), an 8-row tool-mapping table
   against real model/platform records (C2PA, Aleph 2.0, Topaz Astra, HeyGen
   explicit-consent clone, likeness-refusal guards), a pre-flight checklist, a
   "Where this connects" cross-link block, and a Sources & confidence section with
   flag discipline.
2. **`MERGE-fragment-w35-sources.md`** — staged shared-file edits (verbatim copy):
   the one-line `CHAPTER_ORDER` addition in `scripts/build_site.py`
   ("documentary-ethics" after "episodic-shortform" — prev/next nav, TOC, search
   index, chapter grid, llms.txt craft list all derive automatically); the wave-35
   research section for `sources/source-index.md`; optional `build_llms.py`
   SECTION_NOTES entry; rebuild + validate instructions (run after waves 33/34
   land); the no-skill rationale; and the standing-workstream note below.
3. **`WAVELOG-fragment-w35.md`** (this file) — do NOT edit `WAVELOG.md`; merge
   worker folds this in.

**Web design & craftsmanship (mandatory input, wave 35).** The research coordinator's
next-level web-design domain report had NOT landed by push time
(`~/workspace/research_notes/web-craft-20261011-2014/notes/` empty; RESEARCH_LOG
says "scout still in flight"). Applied instead the site's own established design
systems, unchanged: semantic heading hierarchy (auto-generated TOC), blockquote
pull-quotes, comparison tables, task checklist, "Where this connects" cross-link
navigation, automatic prev/next chapter nav — all reduced-motion safe by default,
mobile-first by the existing CSS. Revisit against the web-craft findings when they
land (noted in the MERGE fragment §5).

**Deliberately left alone:**

- `site/` NOT rebuilt (shared state with waves 33/34 — the built page lands via the
  merge worker's `build_site.py` run).
- `sources/source-index.md`, `scripts/build_site.py`, `scripts/build_llms.py` —
  untouched; edits staged in the MERGE fragment.
- No HAND skill (waves 22/27/30/31/32 pattern: the disclosure procedure is a
  release checklist inside the chapter, not a reusable agent workflow; and
  `scripts/build_skills.py` is wave 33's lane this cycle).
- `AGENT.md`/`API.md`/`api/v1/`/`skills/` — no count or workflow changes this wave.

**Standing workstream note:** WAVELOG's standing items scheduled the EPISODE PIPELINE
revisit #6 ~wave 35 (last revisited wave 32). Wave 35 was assigned the deep craft
chapter instead — the revisit is still pending for a subsequent wave.

**Validation (honest):** full `bash scripts/validate.sh` deliberately NOT run — waves
33/34 have mid-edit shared state (teardowns.json, build_skills.py, build_site.py,
sources/source-index.md, site/), and stage 5a regenerates `skills/` from wave 33's
HAND list; running it from this lane risks dirtying their files. What was verified:
the chapter converts cleanly through the site's `md2html` (no unclosed tags, tables
render, checklist inputs emit, 21 headings for the TOC); every relative link in the
chapter resolves to an existing file
(`../legal/rights-and-disclosure.html`, `../distribution/festival-landscape-2026.html`,
`../teardown.html`, `../field/2026-developments.html`, `editing-ai-footage.md`,
`directing-performance.md`, `sound-music-audio.md`); the file is new so no generator
owns it. Merge worker runs the full suite after folding the fragment.

**Commit:** local [SHA] (3 files: craft/documentary-ethics.md,
MERGE-fragment-w35-sources.md, WAVELOG-fragment-w35.md) → pushed 2026-10-11 as
remote commit [SHA]; remote `main` HEAD matches; `git add` was scoped to wave-35
files only (not `git add -A`) so waves 33/34's uncommitted work stays in their lanes.
