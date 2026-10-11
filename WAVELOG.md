# Wave Log — AI Film Master Guide

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
