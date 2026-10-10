---
name: direct-sora-2-pro-max
description: Use Sora 2 / Pro / Max well: costs, strengths, weaknesses, best use.
---

# Direct with Sora 2 / Pro / Max

## Use when

You are generating on Sora 2 / Pro / Max (OpenAI, video). Best use: Smooth camera moves, consistent lighting, talking-head UGC.

## Inputs

- Shot list with durations (cost basis: 720p ~10/4s (~$0.78/8s); Pro 1080p ~50/4s (~$3.92/8s); Max 1080p ~34/4s; Pro Max 1080p ~54/4s)
- Whether you need native audio, lip sync, or long takes
- Your quality bar: draft (720p/fast) vs hero

## Procedure

1. Budget first: 720p ~10/4s (~$0.78/8s); Pro 1080p ~50/4s (~$3.92/8s); Max 1080p ~34/4s; Pro Max 1080p ~54/4s. Multiply by 3–5× per hero shot for re-rolls.
2. Lean into its strength: Scene coherence, Remix consistency branching, Cameo avatars, strong UGC lip-sync.
3. Design around its weakness — do not fight it: Garbled fine text; multi-person face merging; hand poses.
4. Draft everything at the cheapest tier that still answers the creative question.
5. Upscale or re-render at hero quality only for approved selects.

## Worked example

10-second hero shot budgeting at 720p ~10/4s (~$0.78/8s); Pro 1080p ~50/4s (~$3.92/8s); Max 1080p ~34/4s; Pro Max 1080p ~54/4s: estimate the per-second rate, × 2 for duration, × 4 for re-roll headroom.

## API references

- `api/v1/models.json`

## Pitfalls

- Weakness to respect: Garbled fine text; multi-person face merging; hand poses.
- Costs in models.json were read 2026-10-10 — verify live before spending real money.
