---
name: direct-kling-3-0
description: Use Kling 3.0 well: costs, strengths, weaknesses, best use.
---

# Direct with Kling 3.0

## Use when

You are generating on Kling 3.0 (Kuaishou, video). Best use: Motion-heavy cinematic clips, action, multi-shot, camera direction.

## Inputs

- Shot list with durations (cost basis: 720p ~7/5s (~$0.55/8s), 1080p ~8/5s, 4K ~30/5s; Motion Control 720p ~7, 1080p ~12)
- Whether you need native audio, lip sync, or long takes
- Your quality bar: draft (720p/fast) vs hero

## Procedure

1. Budget first: 720p ~7/5s (~$0.55/8s), 1080p ~8/5s, 4K ~30/5s; Motion Control 720p ~7, 1080p ~12. Multiply by 3–5× per hero shot for re-rolls.
2. Lean into its strength: Best-in-class motion/physics; native audio; Motion Control puppetry; Omni multi-shot; 15s.
3. Design around its weakness — do not fight it: Subtle emotional faces trail Hailuo; fingers/camera drift without control; probabilistic.
4. Draft everything at the cheapest tier that still answers the creative question.
5. Upscale or re-render at hero quality only for approved selects.

## Worked example

10-second hero shot budgeting at 720p ~7/5s (~$0.55/8s), 1080p ~8/5s, 4K ~30/5s; Motion Control 720p ~7, 1080p ~12: estimate the per-second rate, × 2 for duration, × 4 for re-roll headroom.

## API references

- `api/v1/models.json`

## Pitfalls

- Weakness to respect: Subtle emotional faces trail Hailuo; fingers/camera drift without control; probabilistic.
- Costs in models.json were read 2026-10-10 — verify live before spending real money.
