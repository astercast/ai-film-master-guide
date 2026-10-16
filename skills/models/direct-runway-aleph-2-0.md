---
name: direct-runway-aleph-2-0
description: Use Runway Aleph 2.0 well: costs, strengths, weaknesses, best use.
---

# Direct with Runway Aleph 2.0

## What this gets you

You will know whether Runway Aleph 2.0 is worth your money for the shot you have in mind, what it costs, what it is best at, and the weakness to design around, before you spend on generations.

## Use when

You are generating on Runway Aleph 2.0 (Runway, video). Best use: Fixing or restyling footage you already have: change a product colour, a sky, a wardrobe, a season, or remove an object across a whole clip instead of regenerating it.

## Inputs

- Shot list with durations (cost basis: Web app 28 credits per edited second (56-credit minimum); API listed at $0.28/s (third-party roundup of Runway pricing, checked Sept 25, 2026, verify live).)
- Whether you need native audio, lip sync, or long takes
- Your quality bar: draft (720p/fast) vs hero

## Procedure

1. Budget first: Web app 28 credits per edited second (56-credit minimum); API listed at $0.28/s (third-party roundup of Runway pricing, checked Sept 25, 2026, verify live).. Multiply by 3 to 5× per hero shot for re-rolls.
2. Lean into its strength: Runway's in-context video editing model (May 21, 2026, launched with Edit Studio): edit one keyframe or describe the change in plain language and the model carries it through the clip, across several shots of the same cut, up to 30s at 1080p, previewing the edit as an image before you spend on the full generation. Inputs: 2 to 30s clips, 480p to 1080p, up to 10 cuts..
3. Design around its weakness, do not fight it: Edits can drift when the target is occluded or moves fast; complex changes take several passes; at 28 credits a second, repeated full-clip iterations are expensive; final timing, sound, and compositing still belong in a conventional editor..
4. Draft everything at the cheapest tier that still answers the creative question.
5. Upscale or re-render at hero quality only for approved selects.

## Worked example

10-second hero shot budgeting at Web app 28 credits per edited second (56-credit minimum); API listed at $0.28/s (third-party roundup of Runway pricing, checked Sept 25, 2026, verify live).: estimate the per-second rate, × 2 for duration, × 4 for re-roll headroom.

## API references

- `data/v1/models.json`

## Pitfalls

- Weakness to respect: Edits can drift when the target is occluded or moves fast; complex changes take several passes; at 28 credits a second, repeated full-clip iterations are expensive; final timing, sound, and compositing still belong in a conventional editor..
- Costs in models.json were refreshed 2026-10-11, verify live before spending real money.
