---
name: prompt-p4
description: Write a food macro (photoreal) prompt (photorealistic track) using the guide's template.
---

# Prompt: Food macro (photoreal)

## Use when

You are directing a shot that needs: food macro (photoreal). 

## Inputs

- `[DISH]` — fill per the template's anatomy

## Procedure

1. Gather one value per placeholder. Keep [STYLE] identical to every other prompt in the project.
2. Fill the template verbatim — do not paraphrase its camera language:
3.   `Macro of [DISH], steam, glistening texture, [LIGHT: warm side light, dark background], 100mm macro shallow DOF. Slow dolly-in. STYLE LOCK: food commercial, high detail, warm grade.`
4. Confirm exactly ONE primary motion and ONE camera move in the final prompt.
5. Separate identity from motion: appearance descriptors in the Identity Block, action in the Motion Block — never pronouns alone as the subject anchor.
6. Handle audio in post (this template's models don't do native audio well).
7. Generate a 720p draft first; approve the select before any 1080p/4K render.

## Worked example

Filled draft:
`Macro of [DISH], steam, glistening texture, [LIGHT: warm side light, dark background], 100mm macro shallow DOF. Slow dolly-in. STYLE LOCK: food commercial, high detail, warm grade.`

## API references

- `api/v1/prompt-templates.json`
- `api/v1/camera-movements.json`

## Pitfalls

- Stacking two motions or two camera moves in one prompt — the model will split the difference and ruin both.
- Changing the [STYLE] line between shots — the fastest route to a recast-looking cast.
