---
name: deliver-upscale-route
description: Take finished clips to delivery resolution: native re-render, faithful upscale, or creative upscale, chosen per shot.
---

# Run the upscaling route

## What this gets you

Your finished film will reach its delivery resolution shot by shot, heroes faithful, rescues creative, nothing upscaled blind, and you will know what each route costs.

## Use when

Picture is locked and the delivery spec (festival 4K, platform 1080p) sits above the resolution your selects were generated at.

## Inputs

- Locked selects with their native resolutions
- The delivery spec
- Which shots are heroes, which are connective tissue (see workflow-upscale-decision)

## Procedure

1. Sort the selects: heroes get the faithful route, soft or damaged heroes get the creative route, connective tissue stays native if it holds at delivery size.
2. Price the native route first: re-rendering the select at hero resolution on its own model is the cleanest upscale when the model offers it, and the only one that invents nothing.
3. For the faithful upscale, use a precise upscaler (Topaz Astra Precise mode, built on its Starlight model): it sharpens and enlarges without reimagining the shot.
4. For a rescue, use creative upscaling (Astra Creative at subtle strength first, or FLUX Video Upscale inside the FLUX line) and check faces and any in-frame text frame by frame, because creative modes invent detail.
5. Use interpolation last and on purpose: Astra reaches 120fps and 8x slow motion, which is a creative choice about motion feel, not a resolution fix.
6. Spot-check the delivered file at 100 percent on the three busiest frames before calling the film finished.

## Worked example

A 4-minute short locked at 1080p for a 4K festival file: 9 heroes re-rendered natively, 22 shots through Astra Precise, 2 soft shots rescued on Creative subtle, and one frame-by-frame face check caught a changed eye, so that shot fell back to Precise.

## API references

- `data/v1/models.json`

## Pitfalls

- Upscaling the whole timeline in Creative mode because it looks punchier on a phone: invented detail reads as a different film at festival size.
- Upscaling before picture lock: every later re-cut pays the upscale cost again.
