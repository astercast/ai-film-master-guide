---
name: prompt-a5
description: Write a stop-motion claymation gag prompt (animated track) using the guide's template.
---

# Prompt: Stop-motion claymation gag

## What this gets you

You will have a finished prompt for a stop-motion claymation gag, ready to paste into a video model: fill the bracketed blanks, generate a cheap draft first, and keep the take that works.

## Use when

You are directing a shot that needs: stop-motion claymation gag. 

## Inputs

- `[CHARACTER]`, fill per the template's anatomy

## Procedure

1. Gather one value per placeholder. Keep [STYLE] identical to every other prompt in the project.
2. Fill the template verbatim, do not paraphrase its camera language:
3.   `Stop-motion clay: [CHARACTER] slips on a banana peel, limbs flail in stepped poses, visible fingerprints in the clay, miniature set, warm practical lighting. STYLE LOCK: Aardman/Laika stop-motion, handcrafted, stepped mo...`
4. Confirm exactly ONE primary motion and ONE camera move in the final prompt.
5. Separate identity from motion: appearance descriptors in the Identity Block, action in the Motion Block, never pronouns alone as the subject anchor.
6. Handle audio in post (this template's models don't do native audio well).
7. Generate a 720p draft first; approve the select before any 1080p/4K render.

## Worked example

Filled draft:
`Stop-motion clay: [CHARACTER] slips on a banana peel, limbs flail in stepped poses, visible fingerprints in the clay, miniature set, warm practical lighting. STYLE LOCK: Aardman/Laika stop-motion, handcrafted, stepped motion.`

## API references

- `data/v1/prompt-templates.json`
- `data/v1/camera-movements.json`

## Pitfalls

- Stacking two motions or two camera moves in one prompt, the model will split the difference and ruin both.
- Changing the [STYLE] line between shots, the fastest route to a recast-looking cast.
