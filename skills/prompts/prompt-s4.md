---
name: prompt-s4
description: Write a foley pass, three-layer sound design prompt (audio track) using the guide's template.
---

# Prompt: Foley pass, three-layer sound design

## What this gets you

You will have a finished prompt for a foley pass, three-layer sound design, the shot used for sound-design passes, ready to paste into a video model: fill the bracketed blanks, generate a cheap draft first, and keep the take that works.

## Use when

You are directing a shot that needs: foley pass, three-layer sound design. Anatomy: three layers spotted to picture, production, foley, design. Best for: sound-design passes.

## Inputs

- `[DIALOGUE / ROOM TONE]`, fill per the template's anatomy
- `[SCENE]`, fill per the template's anatomy
- `[WHOOSHES / IMPACTS]`, fill per the template's anatomy

## Procedure

1. Gather one value per placeholder. Keep [STYLE] identical to every other prompt in the project.
2. Fill the template verbatim, do not paraphrase its camera language:
3.   `Scene [SCENE]: layer 1, production sound [DIALOGUE / ROOM TONE]; layer 2, foley [FOOTSTEPS / CLOTH / PROPS performed to picture]; layer 3, designed [WHOOSHES / IMPACTS]. Spot every effect to the frame it lands on; nothin...`
4. Confirm exactly ONE primary motion and ONE camera move in the final prompt.
5. Separate identity from motion: appearance descriptors in the Identity Block, action in the Motion Block, never pronouns alone as the subject anchor.
6. Handle audio in post (this template's models don't do native audio well).
7. Generate a 720p draft first; approve the select before any 1080p/4K render.

## Worked example

Filled draft:
`Scene [SCENE]: layer 1, production sound [DIALOGUE / ROOM TONE]; layer 2, foley [FOOTSTEPS / CLOTH / PROPS performed to picture]; layer 3, designed [WHOOSHES / IMPACTS]. Spot every effect to the frame it lands on; nothing floats.`

## API references

- `data/v1/prompt-templates.json`
- `data/v1/camera-movements.json`

## Pitfalls

- Stacking two motions or two camera moves in one prompt, the model will split the difference and ruin both.
- Changing the [STYLE] line between shots, the fastest route to a recast-looking cast.
