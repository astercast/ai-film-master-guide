---
name: prompt-r1
description: Write a face-morph rescue prompt (repair track) using the guide's template.
---

# Prompt: Face-morph rescue

## What this gets you

You will have a finished prompt for a face-morph rescue — the shot used for fixing face morphs — ready to paste into a video model: fill the bracketed blanks, generate a cheap draft first, and keep the take that works.

## Use when

You are directing a shot that needs: face-morph rescue. Anatomy: shorter + locked frame + static camera starves the morph. Best for: fixing face morphs.

## Inputs

- `[REFERENCE]` — fill per the template's anatomy
- `[SIMPLE ACTION]` — fill per the template's anatomy
- `[SUBJECT]` — locked identity label or @ reference

## Procedure

1. Gather one value per placeholder. Keep [STYLE] identical to every other prompt in the project.
2. Fill the template verbatim — do not paraphrase its camera language:
3.   `RESCUE for a morphing face: shorten to [DURATION: 3s], lock the start frame [REFERENCE], static camera, [SUBJECT] holds [SIMPLE ACTION]. Exclude: morphing faces, shifting features, extra limbs. If it still morphs, regene...`
4. Confirm exactly ONE primary motion and ONE camera move in the final prompt.
5. Separate identity from motion: appearance descriptors in the Identity Block, action in the Motion Block — never pronouns alone as the subject anchor.
6. Add native-audio direction (quoted, attributed dialogue; named SFX) when the model supports it.
7. Generate a 720p draft first; approve the select before any 1080p/4K render.

## Worked example

Filled draft:
`RESCUE for a morphing face: shorten to [DURATION: 3s], lock the start frame [REFERENCE], static camera, MARA holds [SIMPLE ACTION]. Exclude: morphing faces, shifting features, extra limbs. If it still morphs, regenerate from the locked frame — do not extend.`

## API references

- `data/v1/prompt-templates.json`
- `data/v1/camera-movements.json`

## Pitfalls

- Stacking two motions or two camera moves in one prompt — the model will split the difference and ruin both.
- Changing the [STYLE] line between shots — the fastest route to a recast-looking cast.
