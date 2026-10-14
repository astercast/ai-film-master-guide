---
name: prompt-a7
description: Write a pixel-art game cinematic prompt (animated track) using the guide's template.
---

# Prompt: Pixel-art game cinematic

## What this gets you

You will have a finished prompt for a pixel-art game cinematic, ready to paste into a video model: fill the bracketed blanks, generate a cheap draft first, and keep the take that works.

## Use when

You are directing a shot that needs: pixel-art game cinematic. 

## Inputs

- `[CHARACTER]`, fill per the template's anatomy
- `[ENV]`, environment description

## Procedure

1. Gather one value per placeholder. Keep [STYLE] identical to every other prompt in the project.
2. Fill the template verbatim, do not paraphrase its camera language:
3.   `Pixel-art cinematic: [CHARACTER] traverses [ENV], parallax layers scroll, limited palette, chunky pixels, chiptune energy. STYLE LOCK: 16-bit pixel art, crisp pixels, retro palette.`
4. Confirm exactly ONE primary motion and ONE camera move in the final prompt.
5. Separate identity from motion: appearance descriptors in the Identity Block, action in the Motion Block, never pronouns alone as the subject anchor.
6. Handle audio in post (this template's models don't do native audio well).
7. Generate a 720p draft first; approve the select before any 1080p/4K render.

## Worked example

Filled draft:
`Pixel-art cinematic: [CHARACTER] traverses rain-slick alley, parallax layers scroll, limited palette, chunky pixels, chiptune energy. STYLE LOCK: 16-bit pixel art, crisp pixels, retro palette.`

## API references

- `data/v1/prompt-templates.json`
- `data/v1/camera-movements.json`

## Pitfalls

- Stacking two motions or two camera moves in one prompt, the model will split the difference and ruin both.
- Changing the [STYLE] line between shots, the fastest route to a recast-looking cast.
