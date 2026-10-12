---
name: studio-microdrama-plan
description: Plan a serialized AI-microdrama run's economics from the documented $150-microdrama figures: clip budget, the $50/min benchmark, the 3-5x retake budget, the character-regen reserve, and the documented-pace timeline.
---

# Plan a microdrama run's economics (Studio 2.5)

## Use when

Pre-production budgeting for a microdrama run (1-40 episodes) — before committing to a shot packet. Every number traces to the storeel-off-campus teardown or data/v1/models.json.

## Inputs

- Run title (+ optional logline)
- Episodes (1-40)
- Minutes per episode (0.5-3; 1 page of dialogue = 1 minute = 1 episode)
- Tier (draft = 3x retakes, festival = 5x)
- Character regenerations per episode (your budget guess, 0-100)

## Procedure

1. Set the run: episodes x minutes per episode. The planner converts runtime into clips at the documented 10-15s clip unit (4-6 clips per 1-minute episode; StoReel's actual 146 clips / 30 storyboarded episodes = ~4.9/ep sits inside the range).
2. Compare against the documented benchmark: $50/min of finished content (~$37.50 per 1-minute episode) — TheWrap's reported AI-series rate, one platform's rate card, one experiment: the benchmark to beat, not a promise.
3. Price generation at the cheapest priced video model in models.json (the generation floor, verify live), multiplied by the tier's retake factor: draft = 3x, festival = 5x — the two ends of Qidian's documented 3-5 'drawing cards' range.
4. Add the character-regen reserve: your regen count x the cheapest image-model rate (StoReel paid for regenerations when faces drifted; no per-episode figure was published, so the count is your input).
5. Read the timeline off the documented pace: 1 day per finished episode (4 episodes in 4 days) — free reporter labor, scripting cost uncounted; festival work runs slower (no documented festival pace).
6. Export: copy or download the run plan as markdown; save named runs in the browser and reload them to continue planning.

## Worked example

4 episodes x 1 min, draft, 5 regens/ep -> 4-6 clips/episode (16-24 for the run); $200 benchmark; generation 180s/ep x 3x at the cheapest video rate; regen reserve 20 regens at the cheapest image rate; 4 days at documented pace. All rates from data/v1/models.json.

## API references

- `data/v1/models.json`
- `data/v1/teardowns.json`

## Pitfalls

- Treating the $50/min benchmark as a quote — it is one experiment's documented figure, not a price.
- Forgetting the regen reserve — faces drift; StoReel paid for regenerations and so will you.
- Planning the clean cost — the 3-5x retake envelope IS the budget.
- Expecting a shot packet — microdrama mode is economics only; use series mode ('Send series to Studio') for per-shot plans.
