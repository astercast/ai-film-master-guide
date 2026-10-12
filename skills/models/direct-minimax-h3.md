---
name: direct-minimax-h3
description: Use MiniMax H3 well: costs, strengths, weaknesses, best use.
---

# Direct with MiniMax H3

## Use when

You are generating on MiniMax H3 (MiniMax, video). Best use: Native-audio dialogue and multi-shot scenes on a budget; open-weights experimentation.

## Inputs

- Shot list with durations (cost basis: third-party: ~$0.073–0.12/sec; API benchmark $0.80/10s 720p (reported Sept 2026); optimized third-party inference from $0.01/s — verify live)
- Whether you need native audio, lip sync, or long takes
- Your quality bar: draft (720p/fast) vs hero

## Procedure

1. Budget first: third-party: ~$0.073–0.12/sec; API benchmark $0.80/10s 720p (reported Sept 2026); optimized third-party inference from $0.01/s — verify live. Multiply by 3–5× per hero shot for re-rolls.
2. Lean into its strength: Omni-modal (text+image+video+audio in one context); 2K 4-15s; native stereo audio; instruction-based edits; open weights.
3. Design around its weakness — do not fight it: Young evidence base; 15s ceiling; no benchmark table at launch.
4. Draft everything at the cheapest tier that still answers the creative question.
5. Upscale or re-render at hero quality only for approved selects.

## Worked example

10-second hero shot budgeting at third-party: ~$0.073–0.12/sec; API benchmark $0.80/10s 720p (reported Sept 2026); optimized third-party inference from $0.01/s — verify live: estimate the per-second rate, × 2 for duration, × 4 for re-roll headroom.

## API references

- `api/v1/models.json`

## Pitfalls

- Weakness to respect: Young evidence base; 15s ceiling; no benchmark table at launch.
- Costs in models.json were refreshed 2026-10-11 — verify live before spending real money.
