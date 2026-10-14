---
name: prompt-r2
description: Write an identity-drift repair prompt (repair track) using the guide's template.
---

# Prompt: Identity-drift repair

## What this gets you

You will have a finished prompt for an identity-drift repair — the shot used for multi-shot consistency — ready to paste into a video model: fill the bracketed blanks, generate a cheap draft first, and keep the take that works.

## Use when

You are directing a shot that needs: identity-drift repair. Anatomy: the approved frame IS the identity; everything regenerates from it. Best for: multi-shot consistency.

## Inputs

- `[REFERENCE]` — fill per the template's anatomy

## Procedure

1. Gather one value per placeholder. Keep [STYLE] identical to every other prompt in the project.
2. Fill the template verbatim — do not paraphrase its camera language:
3.   `RESCUE for identity drift: rebuild from the approved-frame library — start frame [REFERENCE], [SUBJECT: three locked traits restated]. One action, uncrowded frame. Compare output to the reference before accepting; reject...`
4. Confirm exactly ONE primary motion and ONE camera move in the final prompt.
5. Separate identity from motion: appearance descriptors in the Identity Block, action in the Motion Block — never pronouns alone as the subject anchor.
6. Add native-audio direction (quoted, attributed dialogue; named SFX) when the model supports it.
7. Generate a 720p draft first; approve the select before any 1080p/4K render.

## Worked example

Filled draft:
`RESCUE for identity drift: rebuild from the approved-frame library — start frame [REFERENCE], [SUBJECT: three locked traits restated]. One action, uncrowded frame. Compare output to the reference before accepting; reject on any trait change.`

## API references

- `data/v1/prompt-templates.json`
- `data/v1/camera-movements.json`

## Pitfalls

- Stacking two motions or two camera moves in one prompt — the model will split the difference and ruin both.
- Changing the [STYLE] line between shots — the fastest route to a recast-looking cast.
