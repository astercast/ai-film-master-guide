---
name: studio-series-plan
description: Plan 3-10 episodes in one pass: pick one of the 4 serialized format presets, lock the series bible, get per-episode shot lists with prompts, model picks, budget, and schedule.
---

# Plan a mini-drama season with Studio 2.0

## What this gets you

You will have a whole mini-drama season planned in the Studio, every episode's shots, prompts, models, budget and schedule, before generating anything.

## Use when

Pre-production for a serialized short-form series, every number traces to data/v1 data.

## Inputs

- Series title + logline
- Format preset (mini-drama / POV micro-series / day-in-the-life / revenge arc)
- Episodes (3-10)
- Runtime per episode (inside the format's band)
- Genre/mood
- Tier (draft/festival)
- Cast: name + voice ID + one-line anchor
- Recurring locations

## Procedure

1. Pick the format preset: it pre-fills the runtime band, beats per episode, hook style, and the dialogue-budget rule (beats x seconds-per-beat, voice locked at +/-10% before any frame).
2. Lock the cast anchors and locations into the bible, the Studio prepends the identical prompt-DNA block to every shot prompt in every episode; it never changes mid-series.
3. Per episode: shots = ceil(runtime / secsPerShot) (draft 6s, festival 4s); deterministic template picks; model picks from models.json (draft = cheapest priced, festival = priciest quality-flagged); takes x rate math per shot.
4. Anchor plates for cast + locations are costed ONCE in the series budget, not per episode (face anchors never re-run); the packet states the avoided credits vs naive per-episode regeneration.
5. Budget the 5x envelope, not the clean cost; schedule puts bible stills first, then per-episode generation, assembly, audio, grade.
6. Episode arcs: planner blocks arrive via the episode-studio-bridge; without them the Studio generates labeled skeletons (edit before generating).

## Worked example

Mini-drama, 5 episodes x 90s, draft: 15 shots/episode -> 75 shots; bible locks Mara's anchor once; budget lines show per-episode subtotals + one bible-plates line; 5x/20x envelopes on the total. All rates from data/v1/models.json.

## API references

- `data/v1/models.json`
- `data/v1/prompt-templates.json`
- `data/v1/checklists.json`

## Pitfalls

- Editing the bible DNA mid-series, consistency dies in episode 3, not episode 1.
- Planning episodes outside the format's band, completion rate is a runtime discipline.
- Budgeting the clean cost, the 5x envelope is the real number.
