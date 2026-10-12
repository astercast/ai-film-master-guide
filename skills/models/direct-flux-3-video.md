---
name: direct-flux-3-video
description: Use FLUX 3 Video well: costs, strengths, weaknesses, best use.
---

# Direct with FLUX 3 Video

## Use when

You are generating on FLUX 3 Video (Black Forest Labs, video). Best use: Dialogue-heavy scenes, multi-shot single takes, typography-in-video; draft-then-finish cost control.

## Inputs

- Shot list with durations (cost basis: API: $0.06/s 720p draft, $0.17/s 720p, $0.29/s 1080p (~$2.90/10s HD) — verify live)
- Whether you need native audio, lip sync, or long takes
- Your quality bar: draft (720p/fast) vs hero

## Procedure

1. Budget first: API: $0.06/s 720p draft, $0.17/s 720p, $0.29/s 1080p (~$2.90/10s HD) — verify live. Multiply by 3–5× per hero shot for re-rolls.
2. Lean into its strength: Up to 20s single take with native 1080p and native multilingual audio + lip-sync; start/end frames and ordered keyframes; multi-shot generation and video continuation in one take; strong typography; draft mode for cheap iteration; Arena text-to-video #2 (1496 pts, behind Gemini Omni Flash 1512).
3. Design around its weakness — do not fight it: Headline preference stats are vendor-run, not independent; native 2K/4K upscale and open weights promised as 'coming soon' — verify live.
4. Draft everything at the cheapest tier that still answers the creative question.
5. Upscale or re-render at hero quality only for approved selects.

## Worked example

10-second hero shot budgeting at API: $0.06/s 720p draft, $0.17/s 720p, $0.29/s 1080p (~$2.90/10s HD) — verify live: estimate the per-second rate, × 2 for duration, × 4 for re-roll headroom.

## API references

- `data/v1/models.json`

## Pitfalls

- Weakness to respect: Headline preference stats are vendor-run, not independent; native 2K/4K upscale and open weights promised as 'coming soon' — verify live.
- Costs in models.json were refreshed 2026-10-11 — verify live before spending real money.
