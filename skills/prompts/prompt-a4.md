---
name: prompt-a4
description: Write a 2d cartoon dialogue prompt (animated track) using the guide's template.
---

# Prompt: 2D cartoon dialogue

## What this gets you

You will have a finished prompt for a 2d cartoon dialogue — the shot used for None — ready to paste into a video model: fill the bracketed blanks, generate a cheap draft first, and keep the take that works.

## Use when

You are directing a shot that needs: 2d cartoon dialogue. 

## Inputs

- `[CHARACTER A]` — fill per the template's anatomy
- `[CHARACTER B]` — fill per the template's anatomy
- `[LOCATION]` — fill per the template's anatomy

## Procedure

1. Gather one value per placeholder. Keep [STYLE] identical to every other prompt in the project.
2. Fill the template verbatim — do not paraphrase its camera language:
3.   `Flat 2D cartoon: [CHARACTER A] and [CHARACTER B] talk at [LOCATION], simple shapes, bold outlines, limited animation, mouth shapes on dialogue beats. STYLE LOCK: western 2D cartoon, flat colors, thick outlines.`
4. Confirm exactly ONE primary motion and ONE camera move in the final prompt.
5. Separate identity from motion: appearance descriptors in the Identity Block, action in the Motion Block — never pronouns alone as the subject anchor.
6. Handle audio in post (this template's models don't do native audio well).
7. Generate a 720p draft first; approve the select before any 1080p/4K render.

## Worked example

Filled draft:
`Flat 2D cartoon: [CHARACTER A] and [CHARACTER B] talk at [LOCATION], simple shapes, bold outlines, limited animation, mouth shapes on dialogue beats. STYLE LOCK: western 2D cartoon, flat colors, thick outlines.`

## API references

- `data/v1/prompt-templates.json`
- `data/v1/camera-movements.json`

## Pitfalls

- Stacking two motions or two camera moves in one prompt — the model will split the difference and ruin both.
- Changing the [STYLE] line between shots — the fastest route to a recast-looking cast.
