---
name: longform-compute-envelope
description: Compute the realistic cost envelope for a 20-min or 90-min AI film.
---

# Budget the compute envelope

## Use when

Before committing to a long-form production.

## Inputs

- Target runtime in seconds
- Model + resolution (per-second rate)
- Expected re-roll multiple (5–20× documented)

## Procedure

1. Clean pass = seconds × per-second rate (≈$89 for 20 min, ≈$400 for 90 min at $0.0738/s).
2. Multiply by 5–20× for the realistic envelope ($500–$8k for 20 min; $2k–$40k for 90 min retail).
3. Images and audio are small next to video — budget them last.
4. Never quote company productions' internal compute ($1M on Cully) as a retail number.

## Worked example

20-min short on Seedance 2.5 API: 1200s × $0.0738 = $88.56 clean; ×10 re-rolls = ~$886 realistic.

## API references

- `api/v1/models.json`

## Pitfalls

- Budgeting the clean pass — the most common long-form budget death.
