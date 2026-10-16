---
name: direct-flux-2
description: Use FLUX.2 well: costs, strengths, weaknesses, best use.
---

# Direct with FLUX.2

## What this gets you

You will know whether FLUX.2 is worth your money for the shot you have in mind, what it costs, what it is best at, and the weakness to design around, before you spend on generations.

## Use when

You are generating on FLUX.2 (Black Forest Labs, image). Best use: Photoreal keyframes and plates, multi-reference edits of a locked still, and local or fine-tuned image pipelines.

## Inputs

- Shot list with durations (cost basis: Hosted Pro and Flex tiers are billed per image on the BFL API; this guide captured no rate it can print, verify live. Open weights (dev and klein) run on your own hardware at no per-image fee, license terms apply.)
- Whether you need native audio, lip sync, or long takes
- Your quality bar: draft (720p/fast) vs hero

## Procedure

1. Budget first: Hosted Pro and Flex tiers are billed per image on the BFL API; this guide captured no rate it can print, verify live. Open weights (dev and klein) run on your own hardware at no per-image fee, license terms apply.. Multiply by 3 to 5× per hero shot for re-rolls.
2. Lean into its strength: Black Forest Labs' current image family (Nov 25, 2025): text-to-image plus single and multi-reference editing in one line. FLUX.2 [dev] is a 32B open-weight model; the [klein] family (Jan 2026) adds sub-second distilled models, with klein 4B under Apache 2.0; hosted Pro and Flex tiers top the range. Strong photographic skin and material rendering, the reason FLUX stills feed so many of the video pipelines this guide tracks..
3. Design around its weakness, do not fight it: The license split is real homework: dev and most klein weights sit under the FLUX Non-Commercial License, only klein 4B is Apache 2.0, and the hosted tiers are proprietary; read the terms before commercial work..
4. Draft everything at the cheapest tier that still answers the creative question.
5. Upscale or re-render at hero quality only for approved selects.

## Worked example

10-second hero shot budgeting at Hosted Pro and Flex tiers are billed per image on the BFL API; this guide captured no rate it can print, verify live. Open weights (dev and klein) run on your own hardware at no per-image fee, license terms apply.: estimate the per-second rate, × 2 for duration, × 4 for re-roll headroom.

## API references

- `data/v1/models.json`

## Pitfalls

- Weakness to respect: The license split is real homework: dev and most klein weights sit under the FLUX Non-Commercial License, only klein 4B is Apache 2.0, and the hosted tiers are proprietary; read the terms before commercial work..
- Costs in models.json were refreshed 2026-10-11, verify live before spending real money.
