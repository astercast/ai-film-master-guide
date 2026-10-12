---
name: prompt-f5
description: Write a listening reaction — the other half of dialogue prompt (performance track) using the guide's template.
---

# Prompt: Listening reaction — the other half of dialogue

## Use when

You are directing a shot that needs: listening reaction — the other half of dialogue. Anatomy: listening shots sell dialogue; AI defaults to blank — direct the arc. Best for: shot-reverse-shot coverage.

## Inputs

- `[STYLE]` — your style-bible line, verbatim
- `[SUBJECT]` — locked identity label or @ reference

## Procedure

1. Gather one value per placeholder. Keep [STYLE] identical to every other prompt in the project.
2. Fill the template verbatim — do not paraphrase its camera language:
3.   `Close-up of [SUBJECT] listening, [LIGHT: soft key]. Micro-expression arc: neutral → [EMOTION: dawning concern] across the line. Small head tilt, breath catch, eyes drop then return. [STYLE]. [AUDIO: faint room tone, part...`
4. Confirm exactly ONE primary motion and ONE camera move in the final prompt.
5. Separate identity from motion: appearance descriptors in the Identity Block, action in the Motion Block — never pronouns alone as the subject anchor.
6. Add native-audio direction (quoted, attributed dialogue; named SFX) when the model supports it.
7. Generate a 720p draft first; approve the select before any 1080p/4K render.

## Worked example

Filled draft:
`Close-up of MARA listening, [LIGHT: soft key]. Micro-expression arc: neutral → [EMOTION: dawning concern] across the line. Small head tilt, breath catch, eyes drop then return. 1970s anamorphic 35mm, warm tungsten, halation, fine grain. [AUDIO: faint room tone, partner's muffled line.]`

## API references

- `data/v1/prompt-templates.json`
- `data/v1/camera-movements.json`

## Pitfalls

- Stacking two motions or two camera moves in one prompt — the model will split the difference and ruin both.
- Changing the [STYLE] line between shots — the fastest route to a recast-looking cast.
