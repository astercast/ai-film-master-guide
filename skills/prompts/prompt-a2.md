---
name: prompt-a2
description: Write a ghibli-style landscape prompt (animated track) using the guide's template.
---

# Prompt: Ghibli-style landscape

## What this gets you

You will have a finished prompt for a ghibli-style landscape — ready to paste into a video model: fill the bracketed blanks, generate a cheap draft first, and keep the take that works.

## Use when

You are directing a shot that needs: ghibli-style landscape. 

## Inputs

- `[CHARACTER]` — fill per the template's anatomy

## Procedure

1. Gather one value per placeholder. Keep [STYLE] identical to every other prompt in the project.
2. Fill the template verbatim — do not paraphrase its camera language:
3.   `Hand-painted pastoral landscape, drifting clouds, grass swaying; a [CHARACTER] walks a winding path. Gentle, held frames, watercolor skies. STYLE LOCK: Studio Ghibli-inspired hand-drawn, soft light, painterly detail.`
4. Confirm exactly ONE primary motion and ONE camera move in the final prompt.
5. Separate identity from motion: appearance descriptors in the Identity Block, action in the Motion Block — never pronouns alone as the subject anchor.
6. Handle audio in post (this template's models don't do native audio well).
7. Generate a 720p draft first; approve the select before any 1080p/4K render.

## Worked example

Filled draft:
`Hand-painted pastoral landscape, drifting clouds, grass swaying; a [CHARACTER] walks a winding path. Gentle, held frames, watercolor skies. STYLE LOCK: Studio Ghibli-inspired hand-drawn, soft light, painterly detail.`

## API references

- `data/v1/prompt-templates.json`
- `data/v1/camera-movements.json`

## Pitfalls

- Stacking two motions or two camera moves in one prompt — the model will split the difference and ruin both.
- Changing the [STYLE] line between shots — the fastest route to a recast-looking cast.
