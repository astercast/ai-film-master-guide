---
name: prompt-f4
description: Write a scene-locked ensemble prompt (performance track) using the guide's template.
---

# Prompt: Scene-locked ensemble

## What this gets you

You will have a finished prompt for a scene-locked ensemble, the shot used for multi-character scenes, ready to paste into a video model: fill the bracketed blanks, generate a cheap draft first, and keep the take that works.

## Use when

You are directing a shot that needs: scene-locked ensemble. Anatomy: spatial locks stop the model merging or teleporting performers. Best for: multi-character scenes.

## Inputs

- `[ENV]`, environment description
- `[LIGHT]`, lighting direction
- `[STYLE]`, your style-bible line, verbatim
- `[SUBJECT A]`, fill per the template's anatomy
- `[SUBJECT B]`, fill per the template's anatomy

## Procedure

1. Gather one value per placeholder. Keep [STYLE] identical to every other prompt in the project.
2. Fill the template verbatim, do not paraphrase its camera language:
3.   `Wide shot of [ENV], [LIGHT]. [SUBJECT A] [ACTION A: tending the fire, stage left], [SUBJECT B] [ACTION B: watching, stage right], each performer holds one spatial zone and one action, no crossing. Static camera. [STYLE].`
4. Confirm exactly ONE primary motion and ONE camera move in the final prompt.
5. Separate identity from motion: appearance descriptors in the Identity Block, action in the Motion Block, never pronouns alone as the subject anchor.
6. Add native-audio direction (quoted, attributed dialogue; named SFX) when the model supports it.
7. Generate a 720p draft first; approve the select before any 1080p/4K render.

## Worked example

Filled draft:
`Wide shot of rain-slick alley, neon reflections. [SUBJECT A] [ACTION A: tending the fire, stage left], [SUBJECT B] [ACTION B: watching, stage right], each performer holds one spatial zone and one action, no crossing. Static camera. 1970s anamorphic 35mm, warm tungsten, halation, fine grain.`

## API references

- `data/v1/prompt-templates.json`
- `data/v1/camera-movements.json`

## Pitfalls

- Stacking two motions or two camera moves in one prompt, the model will split the difference and ruin both.
- Changing the [STYLE] line between shots, the fastest route to a recast-looking cast.
