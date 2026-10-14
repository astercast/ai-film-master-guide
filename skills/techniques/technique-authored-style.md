---
name: technique-authored-style
description: Choose a visual style that hides AI's mistakes instead of exposing them, the right style makes small flaws invisible.
---

# Commit to an authored style

## What this gets you

You will have picked a look that hides AI's small mistakes instead of exposing them, the single cheapest quality upgrade a first film can make.

## Use when

Choosing the visual lane for a film or competition entry, before generating anything.

## Inputs

- Candidate styles
- The drift-tolerance test

## Procedure

1. Ask of each style: 'what breaks when this drifts 5%?' If nothing visible, it's a good judged-category style.
2. Lock the style in one sentence, verbatim in every prompt.
3. Add texture in a separate post pass (grain, paper, brushstrokes) to unify models.
4. Use the animated prompt register, no lens/DOF language.

## Worked example

Le Drip: living oil paintings, dense brushstrokes hide every seam photorealism would expose.

## API references

- `data/v1/prompt-templates.json`

## Pitfalls

- Chasing photorealism without the discipline budget, style is cheaper than perfection.
