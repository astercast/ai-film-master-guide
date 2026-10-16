---
name: compare-image-keyframes
description: Pick between the keyframe image models for character sheets, plates, and first frames.
---

# Choose an image model for keyframes

## What this gets you

You will know which image model should make your keyframes and character sheets, and why, before you build a whole film on the wrong stills.

## Use when

Choosing where your stills come from, before any video generation. The video models in this guide animate stills; the still is where identity and look are decided.

## Inputs

- What the stills must do: identity across many frames, photoreal skin, text inside the frame, or fast look development
- Whether you need a hosted API, open weights you run yourself, or a subscription surface
- Your rights posture: commercially safe training data, or a fine-tune of your own

## Procedure

1. Shortlist by job: identity across a set (Nano Banana 2 and Pro, Seedream 5.0 Pro), photoreal plates and local pipelines (FLUX.2), exact briefs and text in frame (GPT Image 2, Seedream 5.0 Pro), authored cinematic stills (Midjourney V8.2), platform-native characters (Soul 2.0, Soul Cinema, Soul Cast), commercially safe licensed training data (Adobe Firefly).
2. Generate the SAME character sheet brief on two finalists: face anchor, full body, one costume change. Judge identity hold and hands, not prettiness.
3. Check the edit path, not just generation: every finalist above edits as well as generates, but reference counts and license terms differ per record in models.json.
4. Lock the winner in the asset registry next to the character's @ tag, and generate every later still of that character there.

## Worked example

Mara's sheets ran on Nano Banana Pro for the multi-reference identity hold, while her neon alley plates came from FLUX.2 for the photographic grain; both choices are written in the registry, so shot 40 uses the same split.

## API references

- `data/v1/models.json`

## Pitfalls

- Mixing image models mid-production because one still disappointed you, identity drifts faster between models than inside one.
- Judging on a single beauty still: the test is the tenth still of the same character, not the first.
