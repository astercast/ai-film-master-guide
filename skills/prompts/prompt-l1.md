---
name: prompt-l1
description: Write a style-locked scene plate prompt (longform track) using the guide's template.
---

# Prompt: Style-locked scene plate

## What this gets you

You will have a finished prompt for a style-locked scene plate — the shot used for multi-scene projects — ready to paste into a video model: fill the bracketed blanks, generate a cheap draft first, and keep the take that works.

## Use when

You are directing a shot that needs: style-locked scene plate. Anatomy: the style bible repeated verbatim is what survives 90 minutes. Best for: multi-scene projects.

## Inputs

- `[ACTION]` — single motion verb
- `[CAMERA MOVE]` — fill per the template's anatomy
- `[ENV]` — environment description
- `[LIGHT]` — lighting direction
- `[SHOT]` — shot size
- `[SUBJECT]` — locked identity label or @ reference

## Procedure

1. Gather one value per placeholder. Keep [STYLE] identical to every other prompt in the project.
2. Fill the template verbatim — do not paraphrase its camera language:
3.   `STYLE LOCK: [STYLE BIBLE — one line, verbatim in every scene]. Scene [N]: [SHOT] of [SUBJECT] [ACTION] at [ENV], [LIGHT]. [CAMERA MOVE]. [STYLE BIBLE repeated verbatim].`
4. Confirm exactly ONE primary motion and ONE camera move in the final prompt.
5. Separate identity from motion: appearance descriptors in the Identity Block, action in the Motion Block — never pronouns alone as the subject anchor.
6. Add native-audio direction (quoted, attributed dialogue; named SFX) when the model supports it.
7. Generate a 720p draft first; approve the select before any 1080p/4K render.

## Worked example

Filled draft:
`STYLE LOCK: [STYLE BIBLE — one line, verbatim in every scene]. Scene [N]: medium close-up of MARA crosses the room at rain-slick alley, neon reflections. [CAMERA MOVE]. [STYLE BIBLE repeated verbatim].`

## API references

- `data/v1/prompt-templates.json`
- `data/v1/camera-movements.json`

## Pitfalls

- Stacking two motions or two camera moves in one prompt — the model will split the difference and ruin both.
- Changing the [STYLE] line between shots — the fastest route to a recast-looking cast.
