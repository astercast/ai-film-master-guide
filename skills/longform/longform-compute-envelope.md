---
name: longform-compute-envelope
description: The honest total cost of a 20-minute or 90-minute AI film, including the re-generations every shot needs, not just the perfect first pass.
---

# Work out what a long film really costs

## What this gets you

You will know the honest price range of your long film before you start, including re-generations, so the budget does not die halfway through production.

## Use when

Before committing to a long-form production, so the budget survives contact with real re-roll counts.

## Inputs

- Target runtime in seconds
- Model + resolution (per-second rate)
- Expected re-roll multiple (5 to 20× documented)

## Procedure

1. Clean pass = seconds × per-second rate (≈$89 for 20 min, ≈$400 for 90 min at $0.0738/s).
2. Multiply by 5 to 20× for the realistic envelope ($500 to $8k for 20 min; $2k to $40k for 90 min retail).
3. Images and audio are small next to video, budget them last.
4. Never quote company productions' internal compute ($1M on Cully) as a retail number.

## Worked example

20-min short on Seedance 2.5 API: 1200s × $0.0738 = $88.56 clean; ×10 re-rolls = ~$886 realistic.

## API references

- `data/v1/models.json`

## Pitfalls

- Budgeting the clean pass, the most common long-form budget death.
