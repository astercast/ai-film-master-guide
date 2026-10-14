---
name: prompt-a8
description: Write a felt-art cozy scene prompt (animated track) using the guide's template.
---

# Prompt: Felt-art cozy scene

## What this gets you

You will have a finished prompt for a felt-art cozy scene — the shot used for None — ready to paste into a video model: fill the bracketed blanks, generate a cheap draft first, and keep the take that works.

## Use when

You are directing a shot that needs: felt-art cozy scene. 

## Inputs

- `[CHARACTER]` — fill per the template's anatomy

## Procedure

1. Gather one value per placeholder. Keep [STYLE] identical to every other prompt in the project.
2. Fill the template verbatim — do not paraphrase its camera language:
3.   `Felt-art stop-motion: [CHARACTER] made of stitched felt sips tea in a cozy room, fibers visible, gentle bobbing motion. STYLE LOCK: felt craft, soft fibers, handmade warmth.`
4. Confirm exactly ONE primary motion and ONE camera move in the final prompt.
5. Separate identity from motion: appearance descriptors in the Identity Block, action in the Motion Block — never pronouns alone as the subject anchor.
6. Handle audio in post (this template's models don't do native audio well).
7. Generate a 720p draft first; approve the select before any 1080p/4K render.

## Worked example

Filled draft:
`Felt-art stop-motion: [CHARACTER] made of stitched felt sips tea in a cozy room, fibers visible, gentle bobbing motion. STYLE LOCK: felt craft, soft fibers, handmade warmth.`

## API references

- `data/v1/prompt-templates.json`
- `data/v1/camera-movements.json`

## Pitfalls

- Stacking two motions or two camera moves in one prompt — the model will split the difference and ruin both.
- Changing the [STYLE] line between shots — the fastest route to a recast-looking cast.
