---
name: prompt-t8
description: Write a dream sequence prompt (core track) using the guide's template.
---

# Prompt: Dream sequence

## What this gets you

You will have a finished prompt for a dream sequence — the shot used for fantasy, transitions — ready to paste into a video model: fill the bracketed blanks, generate a cheap draft first, and keep the take that works.

## Use when

You are directing a shot that needs: dream sequence. Anatomy: orbit + atmosphere carry the effect. Best for: fantasy, transitions.

## Inputs

- `[STYLE]` — your style-bible line, verbatim
- `[SUBJECT]` — locked identity label or @ reference

## Procedure

1. Gather one value per placeholder. Keep [STYLE] identical to every other prompt in the project.
2. Fill the template verbatim — do not paraphrase its camera language:
3.   `Slow 360-degree orbit around [SUBJECT] in [ENV: surreal floating landscape], [LIGHT: bioluminescent glow, haze]. Weightless drift, soft focus. [STYLE]. [AUDIO: reversed piano, sub-bass swell.]`
4. Confirm exactly ONE primary motion and ONE camera move in the final prompt.
5. Separate identity from motion: appearance descriptors in the Identity Block, action in the Motion Block — never pronouns alone as the subject anchor.
6. Handle audio in post (this template's models don't do native audio well).
7. Generate a 720p draft first; approve the select before any 1080p/4K render.

## Worked example

Filled draft:
`Slow 360-degree orbit around MARA in [ENV: surreal floating landscape], [LIGHT: bioluminescent glow, haze]. Weightless drift, soft focus. 1970s anamorphic 35mm, warm tungsten, halation, fine grain. [AUDIO: reversed piano, sub-bass swell.]`

## API references

- `data/v1/prompt-templates.json`
- `data/v1/camera-movements.json`

## Pitfalls

- Stacking two motions or two camera moves in one prompt — the model will split the difference and ruin both.
- Changing the [STYLE] line between shots — the fastest route to a recast-looking cast.
