---
name: audio-lip-sync-route
description: Native quotes vs post lip-sync, decided per scene.
---

# Choose the lip-sync route

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

Scene with 14 lines: lines 1–3 native test failed → full scene routed to post lip-sync.

## API references

- `api/v1/models.json`
- `api/v1/competitions.json`

## Pitfalls

- Mixing routes mid-scene — pick one per scene.
