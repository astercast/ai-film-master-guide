---
name: prompt-t9
description: Write a time-lapse city prompt (core track) using the guide's template.
---

# Prompt: Time-lapse city

## Use when

You are directing a shot that needs: time-lapse city. Anatomy: static camera mandatory for timelapse. Best for: montages, transitions.

## Inputs

- `[CITY]` — fill per the template's anatomy
- `[STYLE]` — your style-bible line, verbatim

## Procedure

1. Gather one value per placeholder. Keep [STYLE] identical to every other prompt in the project.
2. Fill the template verbatim — do not paraphrase its camera language:
3.   `Static wide shot of [CITY], day-to-night timelapse, traffic trails, windows igniting. [STYLE].`
4. Confirm exactly ONE primary motion and ONE camera move in the final prompt.
5. Separate identity from motion: appearance descriptors in the Identity Block, action in the Motion Block — never pronouns alone as the subject anchor.
6. Handle audio in post (this template's models don't do native audio well).
7. Generate a 720p draft first; approve the select before any 1080p/4K render.

## Worked example

Filled draft:
`Static wide shot of [CITY], day-to-night timelapse, traffic trails, windows igniting. 1970s anamorphic 35mm, warm tungsten, halation, fine grain.`

## API references

- `api/v1/prompt-templates.json`
- `api/v1/camera-movements.json`

## Pitfalls

- Stacking two motions or two camera moves in one prompt — the model will split the difference and ruin both.
- Changing the [STYLE] line between shots — the fastest route to a recast-looking cast.
