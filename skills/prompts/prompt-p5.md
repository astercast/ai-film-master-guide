---
name: prompt-p5
description: Write a horror corridor (photoreal) prompt (photorealistic track) using the guide's template.
---

# Prompt: Horror corridor (photoreal)

## Use when

You are directing a shot that needs: horror corridor (photoreal). 

## Inputs

- `[CORRIDOR]` — fill per the template's anatomy

## Procedure

1. Gather one value per placeholder. Keep [STYLE] identical to every other prompt in the project.
2. Fill the template verbatim — do not paraphrase its camera language:
3.   `Slow dolly down [CORRIDOR], practical flickering fluorescents, deep shadows, dust in the air, 16mm grain. STYLE LOCK: horror realism, low-key chiaroscuro, motivated practicals.`
4. Confirm exactly ONE primary motion and ONE camera move in the final prompt.
5. Separate identity from motion: appearance descriptors in the Identity Block, action in the Motion Block — never pronouns alone as the subject anchor.
6. Handle audio in post (this template's models don't do native audio well).
7. Generate a 720p draft first; approve the select before any 1080p/4K render.

## Worked example

Filled draft:
`Slow dolly down [CORRIDOR], practical flickering fluorescents, deep shadows, dust in the air, 16mm grain. STYLE LOCK: horror realism, low-key chiaroscuro, motivated practicals.`

## API references

- `data/v1/prompt-templates.json`
- `data/v1/camera-movements.json`

## Pitfalls

- Stacking two motions or two camera moves in one prompt — the model will split the difference and ruin both.
- Changing the [STYLE] line between shots — the fastest route to a recast-looking cast.
