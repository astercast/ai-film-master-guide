---
name: direct-wan-2-6
description: Use Wan 2.6 well: costs, strengths, weaknesses, best use.
---

# Direct with Wan 2.6

## Use when

You are generating on Wan 2.6 (Alibaba, video). Best use: Camera-first directing: precise dolly/orbit/crane paths.

## Inputs

- Shot list with durations (cost basis: 480p ~5/5s, 720p ~7/5s, 1080p ~10/5s)
- Whether you need native audio, lip sync, or long takes
- Your quality bar: draft (720p/fast) vs hero

## Procedure

1. Budget first: 480p ~5/5s, 720p ~7/5s, 1080p ~10/5s. Multiply by 3–5× per hero shot for re-rolls.
2. Lean into its strength: Physics-based motion paths, inertia/speed curves; shot-type control.
3. Design around its weakness — do not fight it: No native audio (second pass / LipSync Studio needed).
4. Draft everything at the cheapest tier that still answers the creative question.
5. Upscale or re-render at hero quality only for approved selects.

## Worked example

10-second hero shot budgeting at 480p ~5/5s, 720p ~7/5s, 1080p ~10/5s: estimate the per-second rate, × 2 for duration, × 4 for re-roll headroom.

## API references

- `data/v1/models.json`

## Pitfalls

- Weakness to respect: No native audio (second pass / LipSync Studio needed).
- Costs in models.json were refreshed 2026-10-11 — verify live before spending real money.
