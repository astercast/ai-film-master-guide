---
name: direct-gemini-omni
description: Use Gemini Omni well: costs, strengths, weaknesses, best use.
---

# Direct with Gemini Omni

## Use when

You are generating on Gemini Omni (Google DeepMind, video). Best use: Conversational video generation and prompt-plus-reference clip editing inside Google's ecosystem (Gemini app, YouTube Shorts, Google Flow).

## Inputs

- Shot list with durations (cost basis: Gemini Omni Flash API: ~$0.10/s at 720p, token-billed (reported benchmark — verify live) RESOLUTION LADDER (reported benchmarks, verify live): 720p ~$0.10/s ($17.50/1M video tokens); 360p draft ~$0.03/s (up to 60% faster); 1080p ~$0.15/s; 4K ~$0.30/s. 1080p/4K are upscaled from 720p. English only fully supported for prompts.)
- Whether you need native audio, lip sync, or long takes
- Your quality bar: draft (720p/fast) vs hero

## Procedure

1. Budget first: Gemini Omni Flash API: ~$0.10/s at 720p, token-billed (reported benchmark — verify live) RESOLUTION LADDER (reported benchmarks, verify live): 720p ~$0.10/s ($17.50/1M video tokens); 360p draft ~$0.03/s (up to 60% faster); 1080p ~$0.15/s; 4K ~$0.30/s. 1080p/4K are upscaled from 720p. English only fully supported for prompts.. Multiply by 3–5× per hero shot for re-rolls.
2. Lean into its strength: Unified multimodal creation platform; Omni Flash shipped day one in the Gemini app, YouTube Shorts, and Google Flow; prompt-plus-reference generation and clip editing.
3. Design around its weakness — do not fight it: Token-billed API makes cost math different from per-clip models; verify live before budgeting.
4. Draft everything at the cheapest tier that still answers the creative question.
5. Upscale or re-render at hero quality only for approved selects.

## Worked example

10-second hero shot budgeting at Gemini Omni Flash API: ~$0.10/s at 720p, token-billed (reported benchmark — verify live) RESOLUTION LADDER (reported benchmarks, verify live): 720p ~$0.10/s ($17.50/1M video tokens); 360p draft ~$0.03/s (up to 60% faster); 1080p ~$0.15/s; 4K ~$0.30/s. 1080p/4K are upscaled from 720p. English only fully supported for prompts.: estimate the per-second rate, × 2 for duration, × 4 for re-roll headroom.

## API references

- `data/v1/models.json`

## Pitfalls

- Weakness to respect: Token-billed API makes cost math different from per-clip models; verify live before budgeting.
- Costs in models.json were refreshed 2026-10-11 — verify live before spending real money.
