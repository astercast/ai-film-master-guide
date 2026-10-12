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

## Wave 15 — FLAGSHIP: "Studio" + generator-owned llms (2026-10-11)

**Shipped:**

1. **Studio — "Plan my AI film"** (`site/studio.html` + `assets/js/studio.js`) — the flagship interactive production-packet simulator. Concept in (film title, logline, genre/mood select ×8, target runtime 30s/2min/5min/10min, draft/festival tier) → deterministic packet out:
   - **Shot list:** N shots from runtime (draft 1 shot/6s, festival 1 shot/4s — the stated tier assumptions); per-shot prompt BUILT from the 47-template library (genre→track map, seeded FNV-1a + mulberry32 template selection with genre-appropriate opener/payoff beats, [SUBJECT]/[ENV]/[LIGHT]/[STYLE] filled from genre defaults + tier, [LINE]/[AUDIO] honestly left for the filmmaker and listed as "fill before generating"); every shot carries its template id, track, duration, and anatomy coverage note (16 animated/photorealistic templates have no recorded anatomy — the packet says so and points at the anatomy chapter rather than inventing one).
   - **Model selection:** per-shot picks from the template's own suggested models via a normalized + longest-prefix resolver (handles "Veo 3.1 (ingredients)", "Seedance 2.0 multi-shot", "Kling 3.0 image-to-video", the "Veo 3.1)" typo) against `models.json` video models; draft = cheapest priced candidate, festival = quality-flagged (optimizer's convention) else priciest; unresolvable templates fall back to the global tier pick and are FLAGGED, never silent. WHY per pick from the model's own best-use/strength fields, with rate and last-verified date.
   - **Budget table:** every line shows its math — keyframe stills (cheapest priced image model: Soul 2.0 0.12/image; draft 1/shot, festival 2/shot), per-model generation rows (shots × takes × seconds × credits/s), post at $0 (human time, not modeled); clean total + 5×/20× envelopes from the long-form chapter; "verify live" for unpublished rates. USD at $0.0392/credit.
   - **Schedule:** ordered phases (stills → generation → assembly → audio → grade) with stated day-rates (draft 40 shots/day, festival 12; 1 day per finished minute of assembly, 1 day per 2 minutes of audio/grade) and total shooting days.
   - **Export:** one-click copy of the full packet as markdown; print stylesheet; plans save to localStorage (`afg-studio-plans`); every shot deep-links to `workshop.html?template=<id>` for refinement.
   - Pure engine exported for node; **19 unit tests** (`scripts/studio.test.js`) against the REAL data: shot counts per runtime×tier, determinism (byte-identical JSON), seed sensitivity, template/track validity, model resolution across all 8 genres, cost-parser conventions, budget sums (lines == clean, exact 5×/20×), traceable generation math (shots × takes), schedule invariants, markdown export contents, invalid-input throws.
2. **Generator-owned `llms.txt` / `llms-full.txt`** (`scripts/build_llms.py`, wave 14's noted hand-update debt resolved): both files now regenerate deterministically from `CHAPTER_ORDER` + `api/v1/*.json` + `skills/` + chapter sources + a TOOLS registry; remaining prose lives as constants in the script. **Re-baseline notes (deliberate, one-time):** `llms-full.txt` chapter order is now the canonical `SECTION_ORDER` (was a legacy hand order), chapter text refreshed to current sources (6 chapters had drifted), and the hand-appended "wave 9 / wave 11 additions" tools sections replaced by a generated tools appendix. Caught real drift the hand process had missed: the `craft/` chapter list was missing `episodic-shortform`. `validate.sh` stage 6 now regenerates and requires a zero git diff (was chapter-count/marker heuristics); now 7 stages.
3. Build wiring: `STUDIO_TMPL` + build step + search-index entry in `build_site.py`; `site/studio.html` listed in the generated `llms.txt` tool list.

**Design:** cinematic-craft language (hero kicker "Tools · Flagship", production-packet register); semantic HTML, fieldset/legend radios, skip link, aria-live results, role=alert errors, focus management, keyboard-operable pills, `prefers-reduced-motion` handling, mobile-first, print stylesheet that outputs the packet only.

**Validation:** `bash scripts/validate.sh` → ALL STAGES PASS (11 passed, 0 failed); 44 JS files `node --check` clean; 5,936 relative links, 0 broken; studio.test.js 19/19; all 8 genres × 2 tiers build and export clean; every studio.js-referenced element id verified present in studio.html.

**Commit:** `568066080fdd7c4609de2650c3cf55f7bd093f7d` ([view](https://github.com/astercast/ai-film-master-guide/commit/568066080fdd7c4609de2650c3cf55f7bd093f7d)) — 13 files, pushed 2026-10-11, all new files verified present in the remote tree via GitHub API.

## Wave 16 — RESEARCH-FUEL integration (AI video Q4 2026) (2026-10-11)

**Source research:** `~/workspace/research_notes/wave-fuel-2026-20261011-2355/report.md` + `notes/mission-b-models.md`, `notes/mission-b-pricing-open.md` (mission 2, read 2026-10-11, index-level reads). Every spec/price carries its source URL or an explicit "reported — verify live" flag; no invented specs.

**Shipped:**

1. **Model record refresh via the generator path** (never hand-edited `api/v1/models.json`): new script `scripts/wave16_artifact_refresh.py` edits `artifact-3-model-comparison.json`, then `scripts/build_api.py` regenerates `models.json` (assert updated 22 → 27 models). Five new records:
   - **Gemini Omni** (Google DeepMind, active) — Google's actual next play, unveiled at I/O 2026 (May 19–20); Omni Flash shipped day one in the Gemini app, YouTube Shorts, Google Flow; API since June 30, 2026 (~$0.10/s at 720p, token-billed, reported).
   - **Runway Gen-4.5** (Runway, active) — now a first-class record: no new model shipped in 2026 (Gen-4.5 still latest); Sept 2026 news was distribution (MCP) + Sept 30 Summit; $200M ARR → $350M projection (company-claimed); API benchmark $1.20/10s 720p (reported).
   - **LTX-2.5** (Lightricks, active) — Aug 11, 2026: Fast/Pro up to 4K, open weights 22B, multi-shot in one pass; trained on licensed Getty/Shutterstock data (commercial-legal safety; paid license above $10M revenue); API from ~$0.003/s (reported).
   - **Vidu S2** (Vidu, active) — Sept 15, 2026: real-time S2-Avatar (interactive character up to 720p) + S2-Editing (changes a live stream as it plays).
   - **Mirage Tesseract** (Mirage, formerly Captions, active, type `suite`) — Sept 22, 2026: agent-driven editing/motion-graphics suite, free local engine. Typed `suite` (not `video`) so the Studio never treats it as a per-shot generation model.
   - Refreshed: Wan 3.0 (formal release Aug 24, 2026; $0.05/s at 480p, 2–30s with native audio); MiniMax H3 (open weights Aug 3, 2026; optimized inference from $0.01/s); Kling 3.0, Seedance 2.5 (Turbo drafting tier), Luma (16-keyframe support), Veo 3.1 — all with the API benchmarks below.
2. **Pricing table** — API per 10s 720p (REPORTED benchmarks, Sept 2026, Higgsfield API comparison — third-party reported, not vendor-quoted; verify live): MiniMax H3 **$0.80**, Kling 3.0 **$0.84**, Luma Ray 3.2 **$0.90**, Runway Gen-4.5 **$1.20**, Seedance 2.5 **$2.31**, Veo 3.1 **$3.20** (per 8s). Landed in `cost_basis`, the 2026-developments chapter, and `model-updates.md`. Veo 3.1 is the premium API tier; open-model floors keep falling (LTX 2.5 Fast ~$0.003/s); drafting tiers (Seedance 2.5 Turbo, Gemini Omni Flash 360p) are now a workflow.
3. **Explicit corrections** (2026-developments chapter + model records + changelog):
   - **Veo 4 does not exist** — pages titled "Veo 4 release date" ranking on Google are SEO bait; no Google documentation names such a model (verified across three sources: lumeflow.ai, innfactory.ai). Google's actual play is Gemini Omni (I/O 2026).
   - **Kling 4.0 specs at leak-level** — the 30s claim is preview-leak level (GPTProto explicitly cautions unverified); flagged as "REPORTED, NOT CONFIRMED" in the record; Kling 4K is a 3.0 feature (added April 23, 2026), not a 4.0 feature — do not conflate.
4. **Chapter `field/2026-developments.md` additions:** native audio now standard across Kling 3.0 / Seedance 2.5 / MiniMax H3 / Wan 3.0 / Veo 3.1; Adobe's Sept 8 in-Premiere multi-model workbench (Firefly/Veo/Runway/Kling/Luma in the toolbar — the round-trip export loop is over); model-exclusivity is gone (fal, Replicate, Higgsfield, Protoface, Krea carry all frontier models); open-source notes (Wan 2.2 Apache = practical benchmark; HunyuanVideo consistency standout; LTX licensed-data legal safety; license traps: HunyuanVideo excludes EU/UK/SK + 100M MAU cap, CogVideoX 1M visits/mo cap, LTX paid license >$10M revenue); Google long-form research framework (research only, no product); "What to watch next" updated (Veo 4 line replaced by the correction).
5. **Regenerated:** `api/v1/models.json` (27 models), skills/ (5 new `direct-*` skills + 8 updated model skills, index 212 → 217), `llms.txt`/`llms-full.txt` (build_llms.py), `site/` — 5 new model deep-dive pages, search index, quiz copy 18 → 22 video models. Studio's model picks read `models.json` live — `studio.test.js` 19/19 against the refreshed data (model resolution, cheapest-draft invariant, budget sums all hold).

**Validation:** `bash scripts/validate.sh` → ALL STAGES PASS; studio.test.js 19/19; node --check clean; 0 broken relative links.

**Commit:** `d103a625872ed2c58c8783961c086af71ddc0b3b` ([view](https://github.com/astercast/ai-film-master-guide/commit/d103a625872ed2c58c8783961c086af71ddc0b3b)) — 46 files, pushed 2026-10-11, all new files verified present in the remote tree via GitHub API (439 blobs, 0 missing).
