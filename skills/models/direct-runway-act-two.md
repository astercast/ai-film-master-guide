---
name: direct-runway-act-two
description: Use Runway Act-Two well: costs, strengths, weaknesses, best use.
---

# Direct with Runway Act-Two

## What this gets you

You will know whether Runway Act-Two is worth your money for the shot you have in mind, what it costs, what it is best at, and the weakness to design around, before you spend on generations.

## Use when

You are generating on Runway Act-Two (Runway, video). Best use: Acted scenes with generated characters: direct the performance yourself on camera, then put it on any character. The fastest route to expressive, repeatable acting in AI film, and the standard fix for the dead faces pure text-to-video still produces..

## Inputs

- Shot list with durations (cost basis: About $0.05/s at Runway's API credit price ($0.01 per credit): Act-Two bills 5 credits per second of output, 3s minimum, on Runway plans and Runway Dev. MuAPI lists performance transfer at $0.07 per generation. Verify live.)
- Whether you need native audio, lip sync, or long takes
- Your quality bar: draft (720p/fast) vs hero

## Procedure

1. Budget first: About $0.05/s at Runway's API credit price ($0.01 per credit): Act-Two bills 5 credits per second of output, 3s minimum, on Runway plans and Runway Dev. MuAPI lists performance transfer at $0.07 per generation. Verify live.. Multiply by 3 to 5× per hero shot for re-rolls.
2. Lean into its strength: Performance capture without a stage: shoot a driving performance on any camera, give Act-Two a character image or video, and it transfers the performance onto the character, facial expressions, head rotation, hand gestures and full-body movement. With image inputs a gesture-control setting decides how much hand and body motion carries over, and environmental motion is synthesised so the character sits inside the scene instead of floating on it. Up to 30s at 24 fps, the clip lengths working scenes actually need..
3. Design around its weakness, do not fight it: One performer per pass, and the driving video needs a clearly visible face with no cuts; the performance you get is the performance you shot, it cannot invent acting. Output resolution sits below the current generation flagships, and it is a transfer tool, not a generator: no scene exists until a generator or a camera makes one..
4. Draft everything at the cheapest tier that still answers the creative question.
5. Upscale or re-render at hero quality only for approved selects.

## Worked example

10-second hero shot budgeting at About $0.05/s at Runway's API credit price ($0.01 per credit): Act-Two bills 5 credits per second of output, 3s minimum, on Runway plans and Runway Dev. MuAPI lists performance transfer at $0.07 per generation. Verify live.: estimate the per-second rate, × 2 for duration, × 4 for re-roll headroom.

## API references

- `data/v1/models.json`

## Pitfalls

- Weakness to respect: One performer per pass, and the driving video needs a clearly visible face with no cuts; the performance you get is the performance you shot, it cannot invent acting. Output resolution sits below the current generation flagships, and it is a transfer tool, not a generator: no scene exists until a generator or a camera makes one..
- Costs in models.json were refreshed 2026-10-11, verify live before spending real money.
