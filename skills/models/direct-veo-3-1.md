---
name: direct-veo-3-1
description: Use Veo 3.1 well: costs, strengths, weaknesses, best use.
---

# Direct with Veo 3.1

## Use when

You are generating on Veo 3.1 (Google DeepMind, video). Best use: Controlled narrative production, cinematic realism, dialogue w/ lip-sync.

## Inputs

- Shot list with durations (cost basis: 720p/1080p ~40/4s (~$3.14/8s); Fast ~16/4s (~$1.26/8s))
- Whether you need native audio, lip sync, or long takes
- Your quality bar: draft (720p/fast) vs hero

## Procedure

1. Budget first: 720p/1080p ~40/4s (~$3.14/8s); Fast ~16/4s (~$1.26/8s). Multiply by 3–5× per hero shot for re-rolls.
2. Lean into its strength: Film-grade lighting/prompt adherence, native audio + lip-sync, ingredients (3 refs), first-last frames, scene extension.
3. Design around its weakness — do not fight it: Most expensive per second; 4-8s clips; fine text issues.
4. Draft everything at the cheapest tier that still answers the creative question.
5. Upscale or re-render at hero quality only for approved selects.

## Worked example

10-second hero shot budgeting at 720p/1080p ~40/4s (~$3.14/8s); Fast ~16/4s (~$1.26/8s): estimate the per-second rate, × 2 for duration, × 4 for re-roll headroom.

## API references

- `api/v1/models.json`

## Pitfalls

- Weakness to respect: Most expensive per second; 4-8s clips; fine text issues.
- Costs in models.json were read 2026-10-10 — verify live before spending real money.
