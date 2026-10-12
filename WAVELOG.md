# Wave Log — AI Film Master Guide

## Standing items (permanent workstreams)

- **Episode pipeline workstream (permanent, from wave 14):** revisit every ~3 waves — new episode formats from what's working, new tools, tighter procedures, worked examples. Goal: best agent-run episode-production system anywhere. (WAVELOG entry each revisit; the research artifact lives at `~/workspace/tiktok-episode-pipeline/PIPELINE.md`.)

## History

- **Waves 1–11:** content/tools build-out — prompt linter, model deep-dives, style-bible builder, style bible, learning paths, teardowns, prompt templates, camera lexicon, checklists, glossary, skills library (212), budget/optimizer/doctor/workshop tools, model-watch freshness pipeline; plus a design overhaul ("cinematic craft" visual system), all completed 2026-10-11.

## Wave 12 — 2026 research integration (2026-10-11)

**Source research:** `~/workspace/research_notes/ai-film-deep-2026-20261011-2154/` (report.md + notes/ai-films-01.md, ai-festivals-01.md, ai-models-01.md). Every claim carries its source or an explicit single-source flag.

**Shipped:**

1. **New section `field/` + chapter `2026-developments.md`** ("2026: The Year AI Film Went Long-Form") — Tribeca premiere of *Dreams of Violets* (75 min, ~$2,000, 3 months; Kling + Claude + Gemini/Nano Banana; businesswire/consequence May 27 2026); 2026 model field (Kling 3.0 GA; Kling 4.0 announced Sept 28, Flash early access, full model not GA; Veo 3.1 current, no Veo 4; Runway Gen-4.5, LTX-2.3 Apache 2.0, Wan 3.0, Seedance 2.5, MiniMax H3, FLUX 3 T2V, Gemini Omni; 10s HD $0.25–$5, entry ~$8/mo); Sora shutdown timeline (Mar 24 announced → Apr 26 app closed → Sept 24 API shut); documented long-form workflow (script → locked stills → shot-by-shot 5–30s I2V → NLE → layered audio → upscale; continuity is THE bottleneck; "fix everything at the still-image stage"; MakeMovie, LTX Director 2.0); India/Pakistan AI cinema (Sardar Sarvai Papanna, The Iskoon Bridge, Ainak Wala Jinn, The Next Salahuddin; Cully Hill Boys, NAGIN); Cannes ban flagged single-source.
2. **New chapter `distribution/festival-landscape-2026.md`** — 2026 festival/competition landscape: Astana AI Film Festival ($2M fund, $450K Grand Prix to *The First Honest Day*, $200K/$100K/$50K tiers, 8,067 entries/125 countries, annual plans) with Grand Prix economics (prizes vs. production cost); Reply AIFF Venice (3,000+ shorts, Salvatores jury, *A Face Only a Mother Could Love*); Runway AIFF 2026; AI Film Festival Tirana (8 category winners); MEGA 2026 (*The Tale of the Peony*); Shimla Best AI Film; Cannes-ban flag; what wins and why.
3. **Kling 4.0 reconciled** — web search (techtimes, Pandaily/aiaffairs, curatedai, rctv, wavespeed, apimart) confirms Kling 4.0 WAS announced Sept 28, 2026 (Kuaishou/@Kling_ai): Flash early access for Ultra Yearly subscribers, full model expected Oct 2026, not GA as of Oct 11. Wave 8's record was correct; versely.studio's "unannounced as of Oct 1" was stale/wrong — noted in the 2026 chapter and source index. Model record, `model-updates.md`, and `direct-kling-4-0` skill all already say "announced, not GA" — no correction needed beyond the reconcile note.
4. **Bug fixes:**
   - `scripts/build_api.py` rmtree preserve list now includes `model-checks.json`, `model-review-queue.json` (task items) **and** `diagnoses.json`, `schema/diagnosis.json` — the rmtree had also wiped these two hand-authored files with no generator to restore them (recovered from git).
   - Kling 4.0 moved INTO `artifact-3-model-comparison.json` as the 22nd model (generator-owns-output: the record was a hand-edit to `models.json` that any rebuild would have wiped); assert corrected 21 → 22; rebuild regenerates `models.json` byte-identical to the hand-maintained version plus the two research updates.
   - "twenty-three chapters" → "twenty-six chapters" (was already stale at 24).
5. **5th teardown: *Dreams of Violets*** — appended to `api/v1/teardowns.json` (6 shots: dawn establishing, the alley, the soldier, the discovery, Amir at the window, Amir acts), built ONLY from documented production coverage (businesswire/consequence/Wikipedia); prompt reconstructions labeled analytical, actual prompts undisclosed. Teardown descriptions updated from "four films" to "five films".
6. **Model record updates** (via artifact, with sources + last-verified 2026-10-11): Seedance 2.5 identity-hold ~30s note; Wan 3.0 budget/fast-drafting note; Kling 4.0 now a first-class generated record. Sora stays `discontinued` (confirmed). OBSERVED bumped to 2026-10-11.
7. **Source index** — new "2026 field developments" section (27 sources) in `sources/source-index.md`.

**Validation:** `node --check` all site/assets JS — pass; 23 JSON files parse — pass; JSON Schema (draft-07) validation for models/teardowns/templates/camera/competitions/diagnoses — pass; internal link check 5,359 links, 0 broken; full rebuilds (build_api, build_site → 26 chapters, build_skills).

**Commit:** `1f0c7804b4e869a41e9fc9e2cbf8a3579192e8d4` ([view](https://github.com/astercast/ai-film-master-guide/commit/1f0c7804b4e869a41e9fc9e2cbf8a3579192e8d4)) — 54 files, pushed 2026-10-11, verified on remote main.

## Wave 13 — validation/hardening (2026-10-11)

**Shipped:**

1. **`scripts/validate.sh`** — one-command validation pipeline (6 stages, non-zero exit on any failure; usage: `bash scripts/validate.sh`):
   - Stage 1: `node --check` every JS under `assets/js` + `site/assets/js` (38 files)
   - Stage 2: JSON parse of all 27 JSON files under `api/`, `site/`, `skills/`, `scripts/`
   - Stage 3: draft-07 schema validation — schemas self-checked via `Draft7Validator.check_schema`; per-record validation for models/templates/camera-movements; doc-level for competitions/teardowns/diagnoses
   - Stage 4: relative-link check over every HTML page (5,656 links, 0 broken; externals and fragments out of scope)
   - Stage 5: generator-owns-output audit — rebuild `skills/` + `git diff` clean (212 files, no hand edits); `prompt-templates.json` == artifact-1 parser output (47 templates); every `api/v1` file either generator-written (11) or in `build_api.py`'s preserve list (7), 0 unaccounted; every skill id generator-sourced and `skills/index.json` count matches files on disk
   - Stage 6: `llms.txt` chapter count (26) == `build_site.CHAPTER_ORDER` total; `llms-full.txt` carries all 26 `<!-- chapter: -->` markers
2. **Fixed 29 broken links** (the validator's first real catch): root `api.html` and `craft-not-buttons.html` were stale duplicates — sha256-identical to `site/api.html` and `site/craft-not-buttons.html`, last touched waves 4–6, referenced by no doc (README points at `site/api.html`), generated by no builder. Deleted via `git rm` (recoverable); the canonical copies at `site/` resolve all links.
3. **Model-watch integration check**: `scripts/refresh/check_models.py` ran clean (exit 0, ~3.7 min live fetch) — 22/22 models checked, 0 errors, 2 no-sources. The live web flagged 3 source-signature diffs (Kling 3.0, Midjourney V1 Video, Kling 4.0) — review signals under the promotion workflow, NOT committed: the run was read-only (pre-run backups of `model-checks.json`/`model-review-queue.json` restored byte-identically; repo keeps the committed changed=0 / empty-queue state). Flag for next wave: verify the 3 flagged sources and promote real changes (Kling 4.0 page movement is plausible — full model expected Oct 2026).

**Validation:** `bash scripts/validate.sh` → ALL STAGES PASS (9 passed, 0 failed), exit 0.

**Commit:** `d4d3f70ae2e83ac1a1f389aeaa03fcf56efe3948` ([view](https://github.com/astercast/ai-film-master-guide/commit/d4d3f70ae2e83ac1a1f389aeaa03fcf56efe3948))

## Wave 14 — EPISODE PIPELINE integration (2026-10-11)

**Source research:** `~/workspace/tiktok-episode-pipeline/PIPELINE.md` (493 lines, read in full) — analysis of TikTok creator @uq6ctqxxc8 / FutureGalaxyStories (358.8K followers, 6.3M likes): serialized AI emotional mini-dramas. Representative Episode 3 ("A 2-Year-Old Girl Took a Taxi Alone Just to Find Her Daddy"): 82s, 128K plays, 3,187 likes, 722 saves, 89 shares, 29 comments. 9 production stages, hard budgets, 8 quality gates — all adapted into guide craft voice. Observed-case figures cited as single-source flags; no invented platform facts.

**Shipped:**

1. **New chapter `craft/episodic-shortform.md`** ("Episodic Short-Form: The AI Mini-Drama Pipeline", 27th chapter) — teach-the-craft treatment: genre anatomy (numbered serialization as the follow mechanic, hook-title caption formula, 60–150s/one-emotion, voice-led, cliffhanger endings, funnel CTA), all 9 stages adapted (series setup → episode prep → script → voice FIRST → keyframes → animation → assembly → caption package → continuity log), the golden rule (picture cuts TO locked dialogue), hard budgets table, the 8 quality gates as a checklist, craft-judgment section (where pipelines break). Added to `CHAPTER_ORDER` after `longform-pipelines`.
2. **Two interactive tools** (vanilla JS, ARIA, keyboard, print styles, cinematic-craft design; functional smoke-tested):
   - `site/episode-planner.html` + `assets/js/episode-planner.js` — series setup (title/logline/hashtag, recurring cast with voice IDs + anchor paragraphs, G0 bible gate), episode-block planner (episode N, one-word emotion, stake, hook visual, 3–5 beats, emotional turn, cliffhanger, keyframe scenes — with gate validation before save), arc tracker (episode log with lessons-learned appends). Persists to localStorage `afg-episode-series`.
   - `site/hook-generator.html` + `assets/js/hook-gen.js` — builds hook-title captions from the observed formula `[Episode N] + [one-line emotional stake] + [CTA]`: 5 worked variants per input (direct stake / question hook / mid-action freeze / identity + ritual / address the viewer), each with a "why this hooks" craft note, emoji auto-pick, CTA styles (next-part tease / funnel / finale thesis), one-click copy.
   - Both added to build_site.py templates, search index (Tools), and llms.txt tool list.
3. **Model-watch follow-up** (wave 13's 3 flagged source-signature diffs, fresh web search): **no promotions** — Kling 4.0 still not GA as of Oct 11, 2026 (monolithdesign, glitterpixely skill, gemini-omni.dev, vibeframe provider notes all confirm: full model expected mid-to-late Oct, Flash early access only); Kling 3.0 unchanged (current GA, pricing confirmed per-second via magichour/shhots); Midjourney V1 Video still the current video model (no V2). All three records already carry `last_verified: 2026-10-11`; left untouched. Human-review-queue pattern kept honest.
4. **Bug fix (builder):** wave 13's `git rm` of root `api.html` + `craft-not-buttons.html` broke `build_site.py` (it copies them into `site/`; they were build *sources*, not stale duplicates — the wave 13 note "generated by no builder" was wrong). Restored from `8ea0d64^`. `validate.sh` stage 4 now skips those two root files explicitly (build sources, not published pages — their served copies at `site/` are still checked).
5. **llms freshness:** `llms.txt` (26 → 27 chapters, +2 tool entries) and `llms-full.txt` (+new chapter marker + full text, 27 markers) updated; the validator's stage-6 checks now hold against them.

**Validation:** `bash scripts/validate.sh` → ALL STAGES PASS (9 passed, 0 failed); 42 JS files `node --check` clean; 5,883 relative links, 0 broken; link IDs of both tools verified against their JS; both tools functionally smoke-tested (5 hook variants, planner gates/save/log).

**Commit:** `d9e78792600e6627c9d7b739d84fef29b293be2b` ([view](https://github.com/astercast/ai-film-master-guide/commit/d9e78792600e6627c9d7b739d84fef29b293be2b)) — 44 files, pushed 2026-10-11, remote confirmed via gh-push `pushed:true` response
