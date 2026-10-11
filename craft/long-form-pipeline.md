# The Long-Form Pipeline: Making AI Films at 20+ Minutes

Short films are won with great prompts. Long films are won with *systems*. Everything in this chapter comes from productions that actually shipped long-form AI work — most of it open-sourced by Higgsfield — and every number carries its source. Where the research couldn't verify something, it's flagged.

## The core insight

Across every documented long-form AI production, the through-line is the same: **assets before shots, always.** Locked character sheets, locations, and props exist as named, versioned records *before* any video is generated. The working shape is:

- `brief.md` — logline, tools, pre/prod/post plan
- `script.md` — the screenplay
- `registry.md` — the constants: named looks per world, one verbatim descriptor per @-tagged asset
- one `shotlist.md` per scene — each shot: number, seconds, one-line goal, the **entire prompt verbatim**, `look:`, optional `source:`
- `log.md` — version history per shot: version, what changed, takes, verdict

Cully Hill Boys published a **137-entry version log**. ONEIRIC generated **41,118 assets for ~20 minutes**. The scale of waste — not the cost per clip — is the real budget line.

## Case snapshots

### The Cully Hill Boys — 110 min, ~$2M, 4 weeks, 28 people

The first fully AI-generated feature with licensed celebrity likenesses (Israel Adesanya, Quinton "Rampage" Jackson, streamer N3on, Matt "MK" Kiatipis). Seedance 2.5 for video + speech, Claude for prompt crafting, Seedream and Nano Banana for polish. ~1,000 production-ready assets across ~100 locations in 4K. About half the budget (~$1M) went to compute; the rest covered likeness licensing, creative direction, screenplay, and finishing. Forty percent of the crew had no prior AI experience — the roles were directorial and editorial, not ML.

Key mechanics:
- Character sheets built from the licensed talents' photos and audio, locking face, body, clothing, and voice *before* generation began. Talent supplied ~2 minutes of voice audio; biometrics were contractually purged within 30 days.
- A shared canvas system held sheets, locations, props, and state so parallel teams stayed in continuity.
- Average prompt: **over 3,000 words with 10+ image references per scene** (per Higgsfield co-founder Alex Mashrabov).
- Open-sourced: prompts, production logs, workflow docs, character cards, raw assets — via Higgsfield Academy and YouTube.

### ONEIRIC — 20 min, made for Higgsfield's film competition

**Correction:** earlier versions of this guide described a Cannes premiere for ONEIRIC. The research found no source connecting it to Cannes — its official description says it was made on Cinema Studio 4 *for the Higgsfield Global Film Festival*. The Cannes-adjacent AI screening was *Hell Grind's*, and that was a third-party industry showcase, not an official selection.

Four friends, four genres (Troy battle, galactic cruiser chase, griffin flight, dorm-room drama). Open-sourced: every Seedance asset and prompt, plus Claude skills for scripting (`tig-scene-engine`), acting direction (`tig-acting-task`), and shot prompting (`tig-diagram`).

Key mechanics:
- **The blocking diagram:** when a shot needs precise multi-character staging, words stop working. A color-coded schematic outline is attached *last* among references so photos win the style vote; the prompt binds each color to a character tag. Rules: front view from the camera's side (never a top-down plan — "video models think in frames, not blueprints"), letters live in prompt text only, edits address colors not characters ("move the BLUE figure").
- **The consistent-lens-look trick:** asking for an anamorphic look in the video prompt fails — optics drift shot to shot. Fix: bake the optics into the *location image* plate. **The plate itself becomes the lens.**
- **Two-pass character sheets:** Soul Cinema makes the face in close-up (the identity anchor); Soul 2.0 builds full-body looks from it. Hard rule: **the base portrait is never re-run through any model** — variants are integrated with masks around the base pixels. Re-running a portrait is how a character "slowly stops being the same person."
- **State = new asset:** `@char_ON_Rudy_s2_v1` — character + project + scene + version. A state change gets a new tag, never an overwrite.
- **Voice Bible pasted verbatim** into every generation — not even a synonym changed.
- **Every prompt is an island:** positions, poses, wardrobe, props, optics, light spelled out from scratch every time. "Same as the previous shot" is an instruction to a model with no "before."
- Post ran five stages: assembly → rough cut → **generation supervision** (a scheduled QC/re-generation pass *after* the rough cut, not continuous re-rolling) → fine cut with cold viewers → picture lock.

### Passport Rush — hybrid, 18 scenes in 3 days

Hand-drawn 2D storyboards → Soul 2.0 character sheets → Photoshop hand-painted fixes → **Blender previz** (camera, action timing, squash-and-stretch; renders served as video references) → Claude Opus 5.5 scene prompts → Seedance 2.5. "Not a prompt. Not a model. A person with a pencil" — the boards locked story before any generation. The team documented their failures openly, including the subtle-acting problem: AI struggles with nuanced performance.

### Hell Grind — 95 min, 15 people, 14 days, <$500K

Seedance 2.0 via Cinema Studio (~33 aggregated models). **16,000+ clips generated → 253 final shots** (reported for the first episode — the film may be episodic, so don't quote it as a whole-film ratio). ~80% of budget on compute. Prompts averaged ~3,000 words for ~15 seconds of footage (single tabloid-grade source — flagged).

### Dreams of Violets — 75 min, Tribeca official selection

The counter-example to the big-budget approach: director Ash Koosha claims **$2,000 total GPU spend** (his own unaudited figure), covering "8–10 traditional jobs" himself — 786 videos cut in Resolve, ~1,000 audio clips, 35 minutes of original music, and he voice-acted every role himself at a London studio, then AI-converted each character's voice. First fully AI-generated feature in official programming at a major festival.

## The pipeline, step by step

### 1. Script first, then stress-test it

Every scene runs a Goal/Obstacle/Tactic/Reversal/Value-Shift verdict *before* generation — because a weak scene's cost is only discovered after you've generated it. Then a step-by-step storyboard: "only on the storyboard does it become clear how good a scene really is, as opposed to how good it was in your head."

### 2. Build the asset registry

One @-tag per asset, used everywhere. Character sheets (face close-up → full body), locations (with look baked in), props. Descriptors and fixed look/camera blocks live as constants so one edit updates every shot. The registry is the database.

### 3. Draw the blocking

For any multi-character staging: color-coded diagram, attached last, front camera view, edits by color. Add a depth map (black-and-white geometry channel) for room-heavy scenes — without it, "a location that rearranges itself every few seconds." Plant visual anchors (a specific chair, a window) that repeat across generations. Run a unification pass over the location set (color/light/saturation) *before* generating — cheaper than discovering mismatch in the grade.

### 4. Write island prompts

CINEDANCE block order: SCENE CONTEXT · ACTIVE REFERENCES · LOCATION MAP · GAZE/EYELINES · FIRST FRAME AND BLOCKING · SEGMENTS (timed beats) · DIALOGUE · AUDIO · PHYSICS · LIGHTING · STYLE/FORMAT · POSITIVE LOCKS. Gaze/eyelines get their own block before blocking; dialogue and audio are separated (audio carries voice identity only). Negatives policy: say what you want, not what you avoid — bans live at the image stage only, never in video prompts, and renderable nouns are never written even as negations.

### 5. Generate with a re-anchoring cadence

Chain each scene off the previous scene's *finished video* as reference — "a text description drifts over generations; a video reference doesn't." Schedule regeneration as a fixed pass after the rough cut, not a standing reaction. Budget continuity work on ordinary rooms, not spectacle: the research is explicit that a one-room dialogue scene held across dozens of shots was the hardest technical task of ONEIRIC — harder than the space battle.

### 6. Post like a film

Assembly → rough cut → generation supervision → fine cut → picture lock (no new generations except emergencies, with notice to color and sound). The colorist's job is **unification** — every generation ships its own built-in grade. Sound: dialogue generated natively with video where possible, or recorded human then AI-converted character by character.

## Compute budgeting (October 2026 retail rates)

Assumptions labeled: Seedance 2.5 API from ~$0.0738/s. A "clean pass" means every second generated exactly once — fiction in practice; the documented regime is 5–20× regeneration overhead.

| Film | Clean pass | Realistic envelope (5–20× overhead) |
|---|---|---|
| 20 min (1,200 s) | ~$89 | ~$500–$8,000 depending on resolution |
| 90 min (5,400 s) | ~$400 | ~$2,000–$40,000 at retail |

Why the company productions cost 100× that: Hell Grind's ~80% of $500K and Cully's ~$1M compute are *internal* infra costs at mid-2026 rates — plus licensed talent, 25–28-person teams, 4K, and heavy parallel overshoot. Do not quote the $1M figure as a retail budget; rates have already fallen since.

Sanity anchors: Koosha's claimed $2,000 GPU for 75 minutes (unaudited, with proprietary tooling); single-source reporting of $1,000–$3,000 for 20–30-minute microdramas (flagged).

## Team roles for a small AI feature crew

Observed across productions, not prescribed: writer, director(s), asset/continuity manager, prompt writer, editor, color, sound/music. Cully ran 28 with nine directors under two leads; Hell Grind ran 15 pros (directors, DPs, editors); Arena Zero's pilot ran on 4 people and 5,000+ generations; Koosha effectively ran solo. Recurring truth: 40% of Cully's crew had never used AI — the jobs are directorial and editorial.

## Failure modes unique to long-form

- **Drift accumulation** — identity and style decay across scenes. Counter: never re-run the base portrait; state = new asset; video-reference chaining.
- **Style decay** — optics/grade wandering per shot. Counter: bake the look into plates.
- **Blocked-position flips** — screen sides mirror, backgrounds swap. Counter: the color-coded diagram.
- **Memory-less prompting** — "same as the previous shot" silently fails. Counter: every prompt an island.
- **Summoning by negation** — banned words appear anyway. Counter: never write renderable nouns, even as bans.
- **Reference beats prompt** — a daylight kitchen reference overrules an evening prompt. Counter: put what you want in the reference.
- **Budget blowouts** — weak scenes discovered only after generation. Counter: stress-test first, scheduled regeneration passes.
- **The ordinary-scene cost trap** — one-room dialogue costs more than spectacle. Plan the re-roll budget accordingly.
- **The subtle-acting ceiling** — AI struggles with nuanced performance; write acting as eye-work and tactics, never emotion labels.

## What to steal — the long-form checklist

- [ ] Asset registry complete before shot one: every character, location, prop named, versioned, locked
- [ ] Every scene stress-tested (Goal/Obstacle/Tactic/Reversal/Value Shift) and storyboarded
- [ ] Blocking diagrams + depth maps for multi-character and room-heavy scenes
- [ ] Base portraits locked and never re-run; state changes = new tagged assets
- [ ] Look baked into plates; video prompts carry only what changes
- [ ] Voice Bible pasted verbatim into every generation
- [ ] Island prompts: everything re-stated, every time
- [ ] Video-reference chaining scene to scene
- [ ] 720p drafts; upscale winners only
- [ ] Generation supervision as a scheduled post-rough-cut pass
- [ ] Compute budget with 5–20× overhead, not the clean-pass number
- [ ] Picture lock means no new generations without notice to color and sound

## Sources

- Full research report: `~/workspace/research_notes/ai-film-longform-pipelines-20261010-0430/report.md`
- Cully Hill Boys: magazine.mindplex.ai, cryptobriefing.com, inc.com, bottlerocketcontent.com, archyde.com, webpronews.com, prnewswire.com (Series B), Mashrabov interview via finance.biggo.com
- ONEIRIC: official YouTube description (verified live fetch — no Cannes mention); project brief via github.com/turapins/svvera (third-party transcription — flagged); Mashrabov LinkedIn announcement; higgsfield.ai/academy
- Passport Rush: official breakdown video (youtube.com), Deykhan Ten LinkedIn pipeline list, completeaitraining.com
- Hell Grind: technode.com (verified live), newkerala.com, walaw.press (Cannes correction), suggest.com (flagged tabloid-grade)
- Dreams of Violets: en.wikipedia.org, cryptobriefing.com, Ash Koosha LinkedIn (first-person, unaudited), pagesix.com
- Pricing: higgsfield.ai/blog/higgsfield-api, higgsfield.ai/blog/seedance-2-5-on-higgsfield-2026, blotato.com, daily.dev
- Companion chapters: `case-studies/entry-craft-teardowns.md`, `craft/character-consistency.md`, `craft/editing-pipeline.md`, `economics/credit-math.md`
