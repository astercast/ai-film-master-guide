---
name: workflow-shot-list
description: Turn a scene plan into a per-shot list with model assignments, takes, and live costs.
---

# Build the costed shot list

## What this gets you

You will have a shot list with a model and a price attached to every shot, the plan a whole production (and its budget) runs on.

## Use when

Pre-production planning, before spending a single credit on generation.

## Inputs

- Locked scene plan or script
- Target seconds per shot
- Quality bar per shot

## Procedure

1. List every shot: number, type (wide/medium/close-up/insert), one-line description.
2. Assign a model per shot from the guide's model data, drafts on the cheap model, hero shots on the premium one; dialogue shots need native-audio capability.
3. Set takes per keeper (3 = disciplined, 5 = typical, 8 = perfectionist), takes are where the budget actually lives.
4. Coverage check: every scene needs its establishing wide, its dialogue coverage, and its reaction shots, the listener's eyes do half the acting.
5. Shot economy: merge shots that serve the same beat; AI charges per generation, so fewer, better-planned shots beat many hopeful ones.
6. Budget the 5× envelope, not the clean cost, rejections, re-grades, and consistency fixes multiply everything.
7. Hand the list to the budget optimizer for the final model-mix check before generating.

## Worked example

12-shot dialogue scene: 8 dialogue shots on the native-audio model at 5 takes, 4 wides on the cheap draft model, clean cost $18, 5× envelope $90 budgeted.

## API references

- `data/v1/models.json`
- `data/v1/diagnoses.json`

## Pitfalls

- Planning shots without model assignments, the cost surprise arrives after you've generated.
- Budgeting the clean cost instead of the envelope, the envelope is the real budget.
