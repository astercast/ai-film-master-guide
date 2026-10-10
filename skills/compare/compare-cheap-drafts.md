---
name: compare-cheap-drafts
description: Minimize spend while answering creative questions.
---

# Choose the cheapest draft model

## Use when

Previz, blocking tests, style experiments.

## Inputs

- What the draft must prove (blocking? style? performance?)

## Procedure

1. Cheapest tiers first: Kling 2.5 Turbo (~4cr/5s 720p), Hailuo 2.3 (~10cr/6s 1080p).
2. Drafts answer questions; they don't need to be pretty.
3. Escalate only the question the draft answered 'yes' to.

## Worked example

Blocking test for 12 shots at Turbo rates: full scene validated for the price of one hero render.

## API references

- `api/v1/models.json`

## Pitfalls

- Drafting at hero quality 'to judge properly' — judge composition at 480p, it works.
