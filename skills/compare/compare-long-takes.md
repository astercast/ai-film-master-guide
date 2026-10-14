---
name: compare-long-takes
description: Sustained single-shot sequences without cut-stitching.
---

# Choose a model for long takes

## What this gets you

You will know which model can hold one long shot together without you stitching fragments in the edit.

## Use when

Oners, walk-and-talks, sustained reveals.

## Inputs

- Take length
- Camera complexity
- Subject count

## Procedure

1. Prefer models with strong temporal coherence; test at 10s before committing to 30s.
2. One continuous action, one camera path, complexity kills long takes.
3. Budget re-rolls generously: long takes have the highest per-shot variance.

## Worked example

20s oner through a market: single path, one subject, tested at 10s first.

## API references

- `data/v1/models.json`

## Pitfalls

- Cut-stitching to fake a oner, flow solved at generation beats flow faked in post.
