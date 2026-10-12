---
name: prompt-p3
description: Write a car commercial (photoreal) prompt (photorealistic track) using the guide's template.
---

# Prompt: Car commercial (photoreal)

## Use when

You are directing a shot that needs: car commercial (photoreal). 

## Inputs

- `[CAR]` — fill per the template's anatomy

## Procedure

1. Gather one value per placeholder. Keep [STYLE] identical to every other prompt in the project.
2. Fill the template verbatim — do not paraphrase its camera language:
3.   `Low-angle tracking of [CAR] at blue hour, anamorphic lens flare, wet asphalt reflections, [LIGHT: mixed streetlight temperatures]. STYLE LOCK: automotive commercial, ARRI Alexa, 35mm, teal-orange.`
4. Confirm exactly ONE primary motion and ONE camera move in the final prompt.
5. Separate identity from motion: appearance descriptors in the Identity Block, action in the Motion Block — never pronouns alone as the subject anchor.
6. Handle audio in post (this template's models don't do native audio well).
7. Generate a 720p draft first; approve the select before any 1080p/4K render.

## Worked example

Filled draft:
`Low-angle tracking of [CAR] at blue hour, anamorphic lens flare, wet asphalt reflections, [LIGHT: mixed streetlight temperatures]. STYLE LOCK: automotive commercial, ARRI Alexa, 35mm, teal-orange.`

## API references

- `data/v1/prompt-templates.json`
- `data/v1/camera-movements.json`

## Pitfalls

- Stacking two motions or two camera moves in one prompt — the model will split the difference and ruin both.
- Changing the [STYLE] line between shots — the fastest route to a recast-looking cast.
