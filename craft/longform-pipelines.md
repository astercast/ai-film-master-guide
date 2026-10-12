# Long-Form Pipelines: Making AI Films That Survive 90 Minutes

Short films are won with great prompts. Long films are won with *systems*. This chapter is the guide's definitive treatment of how AI features actually get made — synthesized from the productions that shipped 20+ minutes with open, documented pipelines: The Cully Hill Boys (110 min), ONEIRIC (20 min), Passport Rush (hybrid), Hell Grind (95 min), and Dreams of Violets (75 min). Every number carries a source; everything the research couldn't verify is flagged.

## 1. Two ways to build a feature: scene-by-scene vs. sequence assembly

There are two working architectures in the documented record, and they solve different problems.

**Scene-by-scene (the ONEIRIC model).** One scene is developed to completion, then the *next* scene chains off it: each new scene's reference is the previous scene's finished video, not a text description ("a text description drifts over generations — a video reference doesn't"). Per-scene folders hold that scene's assets; the film assembles in script order. This is the continuity-maximal approach: drift is fought at every seam because every seam carries a video anchor. ONEIRIC generated **41,118 assets for ~20 minutes** (~2,050 per finished minute) working this way.

**Sequence assembly (the Cully model).** Nine directors under two leads worked in parallel across ~100 locations, coordinated through a shared canvas system holding sheets, locations, props, and state. Assets were built first (~1,000 production-ready assets in 4K), shots generated in parallel, and continuity was managed by a **137-entry version log** — version, what changed, verdict, per shot. This is the throughput-maximal approach: it needs a team (25–28 people) and a real asset-management discipline, but it finished a 110-minute feature in about four weeks.

**Which to use:** solo or small team → scene-by-scene; the chaining rule is your continuity department. Team of five-plus → sequence assembly, but only if someone owns the registry full-time; without a wrangler, parallel generation produces parallel continuities.

Both architectures share the same foundation: **assets before shots, always.**

**The third architecture: the agentic production office.** Tim Simmons' *Dragon Blue* (see the wave-33 teardown, "The Production Office") ran a solo short through the same folder-per-film shape with an agent crew instead of a department: Claude Cowork executing a published SKILL.md pipeline — stills first (character reference grids, scene grids), video second — with a references folder (prompt templates, filter-safety memory, style lock, story notes) and a production tracker that survives context death. The file contract is the discipline; the agent is just the labor. The full operating system is documented in the [agentic production office](agentic-production-office.html) chapter. The working shape is one folder per film — `brief.md` (logline, tools, plan), `script.md`, `registry.md` (named looks + one verbatim descriptor per @-tagged asset), one `shotlist.md` per scene (shot number, seconds, one-line goal, the *entire prompt verbatim*, `look:`, optional `source:`), and a per-shot version log.

## 2. The consistency system: what survives 90 minutes

Three interlocking disciplines, all documented in the open briefs:

**Character bibles.** Two-pass identity locking: a close-up face is generated first (maximum identity detail — the anchor), then full-body looks are built from it. The hard rule: **the base portrait is never re-run through any model.** State changes (scar, haircut, dirt, wound, wardrobe) are integrated point-by-point with masks around the base pixels. Re-running a portrait is how a character "slowly stops being the same person." A state change gets a new @-tag (`@char_ON_Rudy_s2_v1`), never an overwrite — state is an asset.

**Style-locked prompts.** Everything the video model keeps dropping — grade, lens character, texture, time of day — belongs in the *asset image*, not the video prompt. The ONEIRIC team's consistent-lens-look trick: generate the location plate with the anamorphic character baked in; the video model reads the optics off the plate. **The plate itself becomes the lens.** Voice identity is locked the same way: a Voice Bible (register, timbre, tempo, manner) pasted into every generation *verbatim — not even a synonym changed*. Prompts follow a fixed block order (the CINEDANCE order: scene context → references → location map → gaze/eyelines → blocking → timed segments → dialogue → audio → physics → lighting → style → positive locks), and **every prompt is an island**: positions, poses, wardrobe, props, optics, and light spelled out from scratch every time, because "same as the previous shot" is an instruction to a model with no "before."

**Reference discipline.** Video references beat text references at every scale: a Blender previz or the previous scene's finished video is sent as a video reference; a daylight kitchen reference overrules an evening prompt, so *what you want goes in the reference*. For multi-character staging, a color-coded blocking diagram is attached *last* among references (so photos win the style vote), drawn from the camera's side — never a top-down plan ("video models think in frames, not blueprints") — with edits addressed by color ("move the BLUE figure"). Room-heavy scenes add a depth map (black-and-white geometry channel); without it, "a location that rearranges itself every few seconds." Visual anchors — a specific chair, a window characters talk by — are planted and repeated across generations, and the whole location set gets a unification pass (color/light/saturation) *before* generating, which is cheaper than discovering mismatch in the grade.

**An honest note on seeds:** the open briefs do not document seed management as a consistency technique — no production in the research record credits seed-locking for holding identity across scenes. The documented levers are the ones above: locked base pixels, video-reference chaining, and plates that carry the look. Don't build your continuity plan on a lever nobody has published results for.

## 3. Dialogue pipeline at scale: three architectures

Dialogue is where long-form AI films live or die, and the record shows three working approaches:

**Native audio (generate speech with the shot).** Seedance 2.0/2.5 supports native speech in the generation; Cully Hill Boys used Seedance 2.5 for video *and* speech, and ONEIRIC's prompt architecture carries DIALOGUE and AUDIO as separate blocks (audio carries voice identity only). Advantage: lip-sync and performance timing are born together. Cost: every dialogue re-roll regenerates the performance; the Voice Bible must be verbatim every time. Best when: dialogue is sparse or the scene's acting is the point.

**Human-recorded, AI-converted.** Ash Koosha (Dreams of Violets, 75 min) voice-acted *every role himself* at a London studio, then converted each character's voice with AI — ~1,000 audio clips across Resolve and Logic, 35 minutes of original music. Advantage: the performance is directed like a film — timing, breath, emphasis are human decisions; conversion only changes timbre. Cost: you need a recordable voice (yours counts) and the conversion step per character. Best when: dialogue is dense and performance quality is the bottleneck — which, at feature length, it usually is.

**Decoupled (TTS / directed synthetic).** Dialogue generated separately as audio and married in the edit — the approach covered in `craft/directing-performance.md`, with TTS direction (pace, breath marks, emphasis notation) as a writable skill. Advantage: iterate performance without re-rendering picture. Cost: sync and emotional believability are on you; the failure gallery's Tilly Norwood lesson applies — synthetic performers belong in edited contexts, never live. Best when: narration, background voices, or rapid iteration.

**The scale rule:** ONEIRIC's brief is explicit that a one-room dialogue scene held across dozens of shots was the hardest technical task of the film — *harder than the space battle*. Budget your continuity and re-roll effort on ordinary rooms, not spectacle.

## 4. The economics: cost per finished minute, by model

Assumptions, labeled: credit costs from the guide's `models.json` (observed 2026-10-10, Higgsfield pricing page; USD at $0.0392/credit on the Plus plan). "Clean pass" = every second generated exactly once — a fiction in practice; the documented regime is **5–20× regeneration overhead** (tens of thousands of assets per finished minute). Rates move monthly; verify live before budgeting.

| Model (720p-ish tier) | Clean $ / finished min | 20-min film, 5–20× overhead | 90-min film, 5–20× overhead |
|---|---|---|---|
| Kling 2.5 Turbo | ~$1.90 | ~$190–$750 | ~$850–$3,400 |
| Hailuo 02 (768p) | ~$2.35 | ~$235–$940 | ~$1,050–$4,200 |
| Kling 3.0 | ~$3.30 | ~$330–$1,300 | ~$1,500–$5,900 |
| Wan 2.6 | ~$3.30 | ~$330–$1,300 | ~$1,500–$5,900 |
| Grok Video | ~$3.30 | ~$330–$1,300 | ~$1,500–$5,900 |
| DoP Standard | ~$5.50 | ~$550–$2,200 | ~$2,500–$9,900 |
| Sora 2 | discontinued Mar 2026 — do not budget on it | — | — |
| Seedance 2.0 | ~$10.35 | ~$1,050–$4,100 | ~$4,650–$18,600 |
| Veo 3 (720p) | ~$17.05 | ~$1,700–$6,800 | ~$7,650–$30,700 |
| Veo 3.1 | ~$23.50 | ~$2,350–$9,400 | ~$10,600–$42,300 |
| Seedance 2.5 | rate not in captured table — verify live | — | — |
| Luma Ray 3.2, Pika 2.5 | not in captured table — verify live | — | — |

Cross-check: at Seedance 2.5's API rate of ~$0.0738/s, a 20-minute clean pass is ~$89 and the 5–20× envelope is ~$440–$1,770 — consistent with the table's order of magnitude.

**Why the company productions cost 100× this.** Hell Grind put ~80% of <$500K into compute; Cully Hill Boys put ~$1M (half of ~$2M) into compute. Those are *internal* infrastructure costs at mid-2026 rates for self-run models — plus licensed celebrity likenesses (with contractual biometric-data purges), 15–28-person teams, 4K delivery, and a four-week parallel overshoot. A LinkedIn analysis notes Cully's ~$1M was "a real number for what the production cost at the time it was made" and that rates "are already down since." **Do not quote the $1M figure as a retail budget.** The disciplined retail envelope for a 90-minute AI feature is low thousands to low tens of thousands of dollars — compute is 50–80% of a professional budget, and the scale of waste (re-rolls), not the per-second price, is the real budget line.

Sanity anchors: Koosha's claimed $2,000 GPU total for 75 minutes (his own unaudited first-person figure, with proprietary tooling he says cuts GPU cost 80–90%); single-source trade reporting of $1,000–$3,000 for 20–30-minute AI microdramas (flagged).

## 5. Pacing and structure for AI features

AI features have a specific structural grammar, and the failures are structural before they're technical:

- **Stress-test every scene before generating it.** Goal, Obstacle, Tactic, Reversal, Value Shift — with a verdict and fixes. A weak scene's cost is only discovered *after* it's generated. Then storyboard step-by-step: "only on the storyboard does it become clear how good a scene really is, as opposed to how good it was in your head."
- **Ration your spectacle.** The re-roll budget goes to ordinary rooms, not set pieces. A production that spends its regeneration budget on the space battle and starves the dialogue scenes has the economics backwards.
- **Ration your close-ups.** Close-ups are the identity risk (every pore is a drift surface) and the acting risk (dead eyes at 4K). The dialogue-scene recipe's rule holds at feature scale: close-ups only at emotional peaks.
- **Cut on the dialogue, not the motion.** J-cuts and L-cuts carry scenes across generations better than matched action, because action continuity is exactly what the models are worst at.
- **Post is five stages, and the third one is the discipline.** Assembly → rough cut → **generation supervision** (a scheduled QC/re-generation pass *after* the rough cut — not continuous re-rolling) → fine cut with cold-viewer screenings → picture lock (no new generations except emergencies, with notice to color and sound). The colorist's job is **unification**: every generation ships its own built-in grade.
- **Draft at 720p, upscale winners.** The field-guides' model reference and the budget calculator both encode this; at feature scale it's the difference between a $3,000 and a $30,000 compute bill.

## 6. Honest limits: what still breaks at 20+ minutes

- **The subtle-acting ceiling.** AI struggles with nuanced performance; even at $2M, reviewers flagged "flat, mis-prompted acting" in Cully Hill Boys. Acting direction must be written as eye-work and tactics, never emotion labels — and some performances simply need the human-recorded pipeline (§3).
- **Drift is cumulative, not linear.** Identity and style decay *across scenes*, which is why the chaining rule and the never-re-run-base-portrait rule exist. There is no documented "set it and forget it" consistency setting.
- **The asset math is brutal.** 41,118 assets for 20 minutes. 16,000+ clips for 253 shots. Anyone selling you a feature for the price of the clean pass is selling the fiction.
- **Single-source flags:** Hell Grind's "16,000 clips → 253 final shots" is reported for the first episode (the film may be episodic — don't quote it as a whole-film ratio); its "3,000-word prompts per 15 seconds" comes via a tabloid-grade outlet; Koosha's $2,000 GPU figure is unaudited; NAGIN S1 / Naga Puspa / RAMAM appear in one blog's table only. The guide states these as flagged, not as facts.
- **What the record doesn't contain:** no documented 2024-era long-form AI feature pipelines surfaced — the documented era starts 2025–2026. Techniques from the short-form era don't automatically transfer; the failure gallery exists for a reason.

## The long-form checklist

- [ ] Asset registry complete before shot one: every character, location, prop named, versioned, locked
- [ ] Every scene stress-tested (Goal/Obstacle/Tactic/Reversal/Value Shift) and storyboarded
- [ ] Architecture chosen: scene-by-scene chaining (small team) or sequence assembly with a registry wrangler (team)
- [ ] Dialogue architecture chosen: native, human-recorded + converted, or decoupled — per scene, not per film
- [ ] Blocking diagrams + depth maps for multi-character and room-heavy scenes
- [ ] Base portraits locked and never re-run; state changes = new tagged assets
- [ ] Look baked into plates; video prompts carry only what changes
- [ ] Voice Bible pasted verbatim into every generation
- [ ] Island prompts: everything re-stated, every time
- [ ] 720p drafts; upscale winners only
- [ ] Generation supervision as a scheduled post-rough-cut pass
- [ ] Compute budget with 5–20× overhead, not the clean-pass number
- [ ] Picture lock means no new generations without notice to color and sound

## Sources

- Full research report: `~/workspace/research_notes/ai-film-longform-pipelines-20261010-0430/report.md`
- Cully Hill Boys: magazine.mindplex.ai, cryptobriefing.com, inc.com, bottlerocketcontent.com, archyde.com, webpronews.com, prnewswire.com (Series B), Mashrabov interview via finance.biggo.com, David Borish LinkedIn ($1M compute analysis)
- ONEIRIC: official YouTube description (verified live fetch — no Cannes mention); project brief via github.com/turapins/svvera (third-party transcription — flagged); Mashrabov LinkedIn announcement; higgsfield.ai/academy (video-reference chaining)
- Passport Rush: official breakdown video (youtube.com), Deykhan Ten LinkedIn pipeline list, completeaitraining.com
- Hell Grind: technode.com (verified live), newkerala.com, walaw.press (Cannes correction), suggest.com (tabloid-grade — flagged)
- Dreams of Violets: en.wikipedia.org, cryptobriefing.com, Ash Koosha LinkedIn (first-person, unaudited), pagesix.com
- Pricing: higgsfield.ai/blog/higgsfield-api, higgsfield.ai/blog/seedance-2-5-on-higgsfield-2026, blotato.com, daily.dev; per-model credit rates from `api/v1/models.json` (observed 2026-10-10)
- Companion chapters: `case-studies/competition-teardowns.md`, `craft/character-consistency.md`, `craft/directing-performance.md`, `craft/editing-pipeline.md`, `craft/failure-gallery.md`, `economics/credit-math.md`
