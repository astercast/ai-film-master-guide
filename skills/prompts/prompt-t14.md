---
name: prompt-t14
description: Write a car commercial prompt (core track) using the guide's template.
---

# Prompt: Car commercial

## Use when

You are directing a shot that needs: car commercial. Anatomy: low angle = power; smooth move = luxury. Models: Kling 3.0, Veo 3.1.

## Inputs

- `[CAR]` — fill per the template's anatomy
- `[ROAD]` — fill per the template's anatomy
- `[STYLE]` — your style-bible line, verbatim

## Procedure

1. Gather one value per placeholder. Keep [STYLE] identical to every other prompt in the project.
2. Fill the template verbatim — do not paraphrase its camera language:
3.   `Low-angle tracking shot of [CAR] on [ROAD] at blue hour, [LIGHT: headlight bloom, city glow]. Smooth gimbal. [STYLE].`
4. Confirm exactly ONE primary motion and ONE camera move in the final prompt.
5. Separate identity from motion: appearance descriptors in the Identity Block, action in the Motion Block — never pronouns alone as the subject anchor.
6. Add native-audio direction (quoted, attributed dialogue; named SFX) when the model supports it.
7. Generate a 720p draft first; approve the select before any 1080p/4K render.

## Worked example

Filled draft:
`Low-angle tracking shot of [CAR] on [ROAD] at blue hour, [LIGHT: headlight bloom, city glow]. Smooth gimbal. 1970s anamorphic 35mm, warm tungsten, halation, fine grain.`

## API references

- `api/v1/prompt-templates.json`
- `api/v1/camera-movements.json`

## Pitfalls

- Stacking two motions or two camera moves in one prompt — the model will split the difference and ruin both.
- Changing the [STYLE] line between shots — the fastest route to a recast-looking cast.
