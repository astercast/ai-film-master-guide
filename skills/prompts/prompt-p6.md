---
name: prompt-p6
description: Write a sci-fi corridor dolly (photoreal) prompt (photorealistic track) using the guide's template.
---

# Prompt: Sci-fi corridor dolly (photoreal)

## What this gets you

You will have a finished prompt for a sci-fi corridor dolly (photoreal) — the shot used for None — ready to paste into a video model: fill the bracketed blanks, generate a cheap draft first, and keep the take that works.

## Use when

You are directing a shot that needs: sci-fi corridor dolly (photoreal). 

## Inputs

- No placeholders — use the template verbatim, then append your [STYLE] line.

## Procedure

1. Gather one value per placeholder. Keep [STYLE] identical to every other prompt in the project.
2. Fill the template verbatim — do not paraphrase its camera language:
3.   `Slow dolly forward, [LIGHT: cold fluorescents + red alert practicals], volumetric haze, lens breathing. STYLE LOCK: sci-fi realism, anamorphic, cool grade, subtle grain.`
4. Confirm exactly ONE primary motion and ONE camera move in the final prompt.
5. Separate identity from motion: appearance descriptors in the Identity Block, action in the Motion Block — never pronouns alone as the subject anchor.
6. Handle audio in post (this template's models don't do native audio well).
7. Generate a 720p draft first; approve the select before any 1080p/4K render.

## Worked example

Filled draft:
`Slow dolly forward, [LIGHT: cold fluorescents + red alert practicals], volumetric haze, lens breathing. STYLE LOCK: sci-fi realism, anamorphic, cool grade, subtle grain.`

## API references

- `data/v1/prompt-templates.json`
- `data/v1/camera-movements.json`

## Pitfalls

- Stacking two motions or two camera moves in one prompt — the model will split the difference and ruin both.
- Changing the [STYLE] line between shots — the fastest route to a recast-looking cast.
