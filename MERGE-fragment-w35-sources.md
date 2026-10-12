# MERGE FRAGMENT — wave 35 (for the merge worker)

New chapter `craft/documentary-ethics.md` is committed in this push. Fold it into the
site and generated surfaces by applying the staged edits below. Do NOT re-type any of
these; copy verbatim.

## 1. scripts/build_site.py — register the chapter (exact edit)

OLD (single line inside CHAPTER_ORDER):
    "craft": ["story-structure", "cinematic-language", "character-consistency", "directing-performance", "color-grading", "sound-music-audio", "editing-pipeline", "editing-ai-footage", "longform-pipelines", "agentic-production-office", "episodic-shortform", "failure-gallery", "ai-film-business"],

NEW:
    "craft": ["story-structure", "cinematic-language", "character-consistency", "directing-performance", "color-grading", "sound-music-audio", "editing-pipeline", "editing-ai-footage", "longform-pipelines", "agentic-production-office", "episodic-shortform", "documentary-ethics", "failure-gallery", "ai-film-business"],

Change: insert "documentary-ethics" after "episodic-shortform". Prev/next nav, TOC,
search index, chapter grid, llms.txt craft list all derive from this list at build
time — no other manual edits needed for the page.

## 2. sources/source-index.md — append the wave-35 research section

Insert AFTER the "## 9th teardown research (wave 33, 2026-10-11)" section, BEFORE
"## Pending":

---
## Documentary-ethics craft research (wave 35, 2026-10-11)
- https://www.webpronews.com/from-ai-music-experiments-to-generative-blockbusters-ash-koosha-tests-limits-of-machine-creativity/ — webpronews: Koosha's AI film work incl. Dreams of Violets (Fountain 0, ~$2K); real voices and licensed likenesses noted; human authorship kept central
- https://en.wikipedia.org/wiki/Dreams_of_Violets — Wikipedia: 75-min AI docudrama, Tribeca June 10, 2026, based on journalistic reports, photographs, and eyewitness accounts
- https://www.avclub.com/dreams-of-violets-ai-snuff-film-tribeca-film-festival — A.V. Club (June 2026): hostile review — the ethics-attack case (synthetic people, executions that didn't happen, built on real footage/images)
- https://marketchameleon.com/Financial-News/GOOG/16913885/4597494-first-fully-ai-generated-feature-film-to-debt-at-tribeca-film-festival — Seeking Alpha syndication (May 27, 2026): premiere facts — 75 min, ~$2K, ~3 months, Kling/Claude/Gemini/Nano Banana, Amir + five Iranians
- https://www.cinemadrop.com/blog/ai-generated-movie — cinemadrop (Oct 2026): rights basics — USCO AI report Part 2 (Jan 2025), Val Kilmer likeness consent + CA AB 1836, platform disclosure, YouTube fake-trailer monetization losses (2025)
- https://filmustage.com/blog/ai-in-movies-why-audiences-are-searching-for-human-made-films/ — filmustage (Sept 2026): Human Provenance in Film framework (No AI Used / Assistive AI / Generative AI); audience AI-free search data; Academy + guilds' "human" rules
- https://www.builtbyfoundry.io/blog/do-you-have-to-label-ai-content-2026-3-rules-2-laws — builtbyfoundry (~Sept 2026): YouTube/TikTok/Meta disclosure triggers and exemption lists; TikTok auto-label permanence
- https://magichour.ai/blog/ai-video-disclosure-guide — magichour (updated Oct 2026): six-step disclosure workflow — procedural basis for the chapter's Section 2
- https://www.everymoviehasalesson.com/blog/2026/10/when-audiences-learn-an-image-is-ai-what-the-research-says-about-disclosure-and-trust — disclosure-and-trust research synthesis (Oct 2026): sort-assets-by-claim rule; label-is-not-proof
- https://comfy.org/customers/svedka-silverside/ — ComfyUI case study: Svedka "Shake Your Bots Off" (Super Bowl LX, Feb 8, 2026), first primarily AI-generated Super Bowl spot (per ADWEEK), component-based ComfyUI workflows, under one month of production
- https://www.adweek.com/creativity/svedka-bets-on-ai-and-its-fembot-to-make-super-bowl-history/ — Adweek: Fembot 12-year hiatus revival; TikTok choreography open call (Jessica Rizzardi)
- https://techcrunch.com/2026/02/08/super-bowl-60-ai-ads-svedka-anthropic-brands-commercials/ — TechCrunch: WSJ's ~4-month Fembot rebuild/training; humans handled storyline; Silverside = Coca-Cola AI ads team
- https://github.com/laplaceyoung/dsh-directorx/blob/HEAD/knowledge/395-ai-ad-campaign-case/ai-ad-campaign-case.md — dsh-directorx case file: Svedka shot-by-shot case breakdown (HR/Adweek/TechCrunch/WSJ sourcing)
- https://www.digitalapplied.com/blog/ai-content-labeling-rules-advertisers-2026-reference — EU AI Act Article 50 transparency duties apply from Aug 2, 2026; marking grace period to Dec 2026 (single secondary — flagged)
---

## 2b. Research entries checked (NOT for source-index — wave-log provenance)

- Cycle-1 scout notes `~/workspace/research_notes/ai-video-models-20261011-2010/notes/03-filmmaking-workflows.md` (Svedka case, radio-edit/audio-first consensus, AutoMV, DIY AWS music-video pipeline) and `05-editing.md` (Runway Aleph 2.0, Topaz Astra, Pikaswaps) — informed the chapter's tool-mapping table.
- Cycle-1 scout note `07-sora.md` (Sora discontinued, verified) — no chapter edit (migration mapping already in field/2026-developments.md via wave 30).
- `~/workspace/research_notes/ai-film-deep-2026-20261011-2154/report.md` (Dreams of Violets multi-source corroboration: businesswire May 27 2026, consequence.net) — facts cross-checked against the chapter's own source set.
- Existing chapter overlap check: directing-performance.md (synthetic performance), sound-music-audio.md (voice/music/rights gap), editing-ai-footage.md (regenerate-vs-repair) — all already cover their lanes; documentary-ethics is new territory (disclosure, reconstruction, likeness, pre-premiere brief).

## 3. scripts/build_llms.py — optional annotation (apply or skip)

No craft chapter currently has a SECTION_NOTES entry, so this is optional. If adding:

    ("craft", "documentary-ethics"): " (disclosure stack, reconstruction discipline, likeness/consent, verification paper trail, pre-premiere ethics brief — worked examples: Dreams of Violets, Svedka/Fembot)",

Add to the SECTION_NOTES dict.

## 4. Regenerate + validate (after waves 33/34 land, in dependency order)

1. Apply wave 33's + wave 34's + this fragment's shared-file edits first.
2. `python3 scripts/build_site.py` — builds site/craft/documentary-ethics.html, prev/next
   nav, TOC, search index, chapter grid. (Chapter markdown converts clean: 3 tables,
   10-item checklist, 3 blockquotes, 21 headings — verified via md2html.)
3. `python3 scripts/build_llms.py` — llms.txt / llms-full.txt (craft list flows from
   CHAPTER_ORDER automatically).
4. `bash scripts/validate.sh` — expect full green; stage 4 link check covers the new
   page's links: ../legal/rights-and-disclosure.html, ../distribution/festival-landscape-2026.html,
   ../teardown.html, ../field/2026-developments.html, editing-ai-footage.md,
   directing-performance.md, sound-music-audio.md — all resolve to existing files.
5. Note: `site/craft/` page build was deliberately NOT run in wave 35 (parallel-lane
   rule — site/ is shared state with waves 33/34).

## 5. Open design input (web-craft domain)

The research coordinator's "next-level web design & craftsmanship" domain report had
NOT landed as of wave 35's push (`~/workspace/research_notes/web-craft-20261011-2014/notes/`
empty; RESEARCH_LOG: "scout still in flight"). The chapter applies the site's existing
design systems only: semantic heading hierarchy (auto TOC), blockquote pull-quotes,
comparison tables, checklist, "Where this connects" cross-link block, automatic
prev/next nav — all reduced-motion safe by default. Revisit against the web-craft
findings when they land.

## 6. Standing workstream note

WAVELOG's standing items say the EPISODE PIPELINE revisit #6 was due ~wave 35
(last revisited wave 32). Wave 35 was assigned the deep craft chapter instead — the
revisit is still pending and should be picked up in a subsequent wave.

## 7. No-skill rationale (waves 22/27/30/31/32 pattern)

No HAND skill added in wave 35: the disclosure procedure is a compliance/release
checklist inside the chapter, not a reusable agent workflow — and `scripts/build_skills.py`
is owned by wave 33's lane this cycle. If a merge worker wants one later, the
candidate is `documentary-disclosure-checklist` (cat: checklists) built from the
chapter's pre-flight checklist.
