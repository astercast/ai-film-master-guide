---
name: prompt-f3
description: Write a tactics-driven dialogue beat prompt (performance track) using the guide's template.
---

# Prompt: Tactics-driven dialogue beat

## What this gets you

You will have a finished prompt for a tactics-driven dialogue beat — the shot used for dialogue coverage — ready to paste into a video model: fill the bracketed blanks, generate a cheap draft first, and keep the take that works.

## Use when

You are directing a shot that needs: tactics-driven dialogue beat. Anatomy: tactic + line + one physical action = playable direction. Best for: dialogue coverage.

## Inputs

- `[ENV]` — environment description
- `[LIGHT]` — lighting direction
- `[LINE]` — fill per the template's anatomy
- `[SHOT]` — shot size
- `[STYLE]` — your style-bible line, verbatim
- `[SUBJECT]` — locked identity label or @ reference

## Procedure

1. Gather one value per placeholder. Keep [STYLE] identical to every other prompt in the project.
2. Fill the template verbatim — do not paraphrase its camera language:
3.   `[SHOT] of [SUBJECT] at [ENV], [LIGHT]. [SUBJECT] says "[LINE]" with tactic [TACTIC: to accuse], physical action [ACTION: leaning in, controlled]. Subtext lives in the body, not the face — no mugging. [STYLE]. [AUDIO: dia...`
4. Confirm exactly ONE primary motion and ONE camera move in the final prompt.
5. Separate identity from motion: appearance descriptors in the Identity Block, action in the Motion Block — never pronouns alone as the subject anchor.
6. Add native-audio direction (quoted, attributed dialogue; named SFX) when the model supports it.
7. Generate a 720p draft first; approve the select before any 1080p/4K render.

## Worked example

Filled draft:
`medium close-up of MARA at rain-slick alley, neon reflections. MARA says "[LINE]" with tactic [TACTIC: to accuse], physical action [ACTION: leaning in, controlled]. Subtext lives in the body, not the face — no mugging. 1970s anamorphic 35mm, warm tungsten, halation, fine grain. [AUDIO: dialogue + room tone.]`

## API references

- `data/v1/prompt-templates.json`
- `data/v1/camera-movements.json`

## Pitfalls

- Stacking two motions or two camera moves in one prompt — the model will split the difference and ruin both.
- Changing the [STYLE] line between shots — the fastest route to a recast-looking cast.
