---
name: audio-lip-sync-route
description: Native quotes vs post lip-sync, decided per scene.
---

# Choose the lip-sync route

## What this gets you

For every dialogue scene, you will know which lip-sync method to use, the one that fits the words, the budget and the deadline.

## Use when

Any dialogue scene.

## Inputs

- Line count
- Scene length
- Model's native audio quality

## Procedure

1. Short lines (<10s): native in-prompt quotes, dialogue quoted + attributed.
2. Long scenes: generate silent, isolate vocals, post lip-sync tools.
3. Test one line natively before committing the scene's route.
4. Competition check: voice must be AI-generated with rights held.

## Worked example

Scene with 14 lines: lines 1 to 3 native test failed → full scene routed to post lip-sync.

## API references

- `data/v1/models.json`
- `data/v1/competitions.json`

## Pitfalls

- Mixing routes mid-scene, pick one per scene.
