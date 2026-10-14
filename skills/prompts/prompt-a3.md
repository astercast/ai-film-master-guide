---
name: prompt-a3
description: Write a pixar-style 3d character beat prompt (animated track) using the guide's template.
---

# Prompt: Pixar-style 3D character beat

## What this gets you

You will have a finished prompt for a pixar-style 3d character beat, ready to paste into a video model: fill the bracketed blanks, generate a cheap draft first, and keep the take that works.

## Use when

You are directing a shot that needs: pixar-style 3d character beat. 

## Inputs

- No placeholders, use the template verbatim, then append your [STYLE] line.

## Procedure

1. Gather one value per placeholder. Keep [STYLE] identical to every other prompt in the project.
2. Fill the template verbatim, do not paraphrase its camera language:
3.   `Stylized 3D animation: [CHARACTER: big expressive eyes, soft rounded forms] reacts with surprise, squash-and-stretch. Warm key light, soft bounce. STYLE LOCK: modern 3D animated film, subsurface warmth, clean shapes.`
4. Confirm exactly ONE primary motion and ONE camera move in the final prompt.
5. Separate identity from motion: appearance descriptors in the Identity Block, action in the Motion Block, never pronouns alone as the subject anchor.
6. Handle audio in post (this template's models don't do native audio well).
7. Generate a 720p draft first; approve the select before any 1080p/4K render.

## Worked example

Filled draft:
`Stylized 3D animation: [CHARACTER: big expressive eyes, soft rounded forms] reacts with surprise, squash-and-stretch. Warm key light, soft bounce. STYLE LOCK: modern 3D animated film, subsurface warmth, clean shapes.`

## API references

- `data/v1/prompt-templates.json`
- `data/v1/camera-movements.json`

## Pitfalls

- Stacking two motions or two camera moves in one prompt, the model will split the difference and ruin both.
- Changing the [STYLE] line between shots, the fastest route to a recast-looking cast.
