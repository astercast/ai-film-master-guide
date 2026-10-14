---
name: prompt-p2
description: Write a documentary handheld prompt (photorealistic track) using the guide's template.
---

# Prompt: Documentary handheld

## What this gets you

You will have a finished prompt for a documentary handheld — ready to paste into a video model: fill the bracketed blanks, generate a cheap draft first, and keep the take that works.

## Use when

You are directing a shot that needs: documentary handheld. 

## Inputs

- `[LOCATION]` — fill per the template's anatomy
- `[SUBJECT]` — locked identity label or @ reference

## Procedure

1. Gather one value per placeholder. Keep [STYLE] identical to every other prompt in the project.
2. Fill the template verbatim — do not paraphrase its camera language:
3.   `Handheld follow of [SUBJECT] through [LOCATION], natural daylight, slight motion blur, muted grade, authentic feel. No music. STYLE LOCK: documentary realism, imperfect framing allowed.`
4. Confirm exactly ONE primary motion and ONE camera move in the final prompt.
5. Separate identity from motion: appearance descriptors in the Identity Block, action in the Motion Block — never pronouns alone as the subject anchor.
6. Handle audio in post (this template's models don't do native audio well).
7. Generate a 720p draft first; approve the select before any 1080p/4K render.

## Worked example

Filled draft:
`Handheld follow of MARA through [LOCATION], natural daylight, slight motion blur, muted grade, authentic feel. No music. STYLE LOCK: documentary realism, imperfect framing allowed.`

## API references

- `data/v1/prompt-templates.json`
- `data/v1/camera-movements.json`

## Pitfalls

- Stacking two motions or two camera moves in one prompt — the model will split the difference and ruin both.
- Changing the [STYLE] line between shots — the fastest route to a recast-looking cast.
