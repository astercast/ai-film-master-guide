---
name: direct-seedance-2-0
description: Use Seedance 2.0 well: costs, strengths, weaknesses, best use.
---

# Direct with Seedance 2.0

## Use when

You are generating on Seedance 2.0 (ByteDance, video). Best use: Multi-shot narrative, reference-driven continuity, dialogue scenes.

## Inputs

- Shot list with durations (cost basis: 720p ~22/5s, 1080p ~45/5s, 4K ~110/5s, Fast 720p ~12/5s BytePlus API estimate ~$0.37/s at 1080p for 2.0, 2.0 Mini 720p ~$0.08/s (third-party estimates — verify live).)
- Whether you need native audio, lip sync, or long takes
- Your quality bar: draft (720p/fast) vs hero

## Procedure

1. Budget first: 720p ~22/5s, 1080p ~45/5s, 4K ~110/5s, Fast 720p ~12/5s BytePlus API estimate ~$0.37/s at 1080p for 2.0, 2.0 Mini 720p ~$0.08/s (third-party estimates — verify live).. Multiply by 3–5× per hero shot for re-rolls.
2. Lean into its strength: Single-pass multimodal refs (@Image/@Video/@Audio), multi-shot in one call, native synced audio, multilingual lip-sync Reference limits per BytePlus docs: up to 15 references per run (9 images, 3 videos, 3 audio); 4-15s clips; edit and extend supported..
3. Design around its weakness — do not fight it: Facial micro-acting weakest; drift after chained gens; tiny detail degrades; negation summons.
4. Draft everything at the cheapest tier that still answers the creative question.
5. Upscale or re-render at hero quality only for approved selects.

## Worked example

10-second hero shot budgeting at 720p ~22/5s, 1080p ~45/5s, 4K ~110/5s, Fast 720p ~12/5s BytePlus API estimate ~$0.37/s at 1080p for 2.0, 2.0 Mini 720p ~$0.08/s (third-party estimates — verify live).: estimate the per-second rate, × 2 for duration, × 4 for re-roll headroom.

## API references

- `data/v1/models.json`

## Pitfalls

- Weakness to respect: Facial micro-acting weakest; drift after chained gens; tiny detail degrades; negation summons.
- Costs in models.json were refreshed 2026-10-11 — verify live before spending real money.
