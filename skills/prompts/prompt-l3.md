---
name: prompt-l3
description: Write a native-audio dialogue scene prompt (longform track) using the guide's template.
---

# Prompt: Native-audio dialogue scene

## Use when

You are directing a shot that needs: native-audio dialogue scene. Anatomy: native-audio models keep voice and face in one generation — no dub drift. Best for: dialogue-heavy scenes.

## Inputs

- `[ENV]` — environment description
- `[LIGHT]` — lighting direction
- `[LINE]` — fill per the template's anatomy
- `[SHOT]` — shot size
- `[STYLE]` — your style-bible line, verbatim
- `[SUBJECT A]` — fill per the template's anatomy
- `[SUBJECT B]` — fill per the template's anatomy
- `[TACTIC]` — fill per the template's anatomy

## Procedure

1. Gather one value per placeholder. Keep [STYLE] identical to every other prompt in the project.
2. Fill the template verbatim — do not paraphrase its camera language:
3.   `[SHOT] of [SUBJECT A] and [SUBJECT B] at [ENV], [LIGHT]. [SUBJECT A] says "[LINE]" — generate WITH native dialogue audio, lip-sync locked. Performance tactic: [TACTIC]. [STYLE]. [AUDIO: dialogue + room tone, no music.]`
4. Confirm exactly ONE primary motion and ONE camera move in the final prompt.
5. Separate identity from motion: appearance descriptors in the Identity Block, action in the Motion Block — never pronouns alone as the subject anchor.
6. Add native-audio direction (quoted, attributed dialogue; named SFX) when the model supports it.
7. Generate a 720p draft first; approve the select before any 1080p/4K render.

## Worked example

Filled draft:
`medium close-up of [SUBJECT A] and [SUBJECT B] at rain-slick alley, neon reflections. [SUBJECT A] says "[LINE]" — generate WITH native dialogue audio, lip-sync locked. Performance tactic: [TACTIC]. 1970s anamorphic 35mm, warm tungsten, halation, fine grain. [AUDIO: dialogue + room tone, no music.]`

## API references

- `data/v1/prompt-templates.json`
- `data/v1/camera-movements.json`

## Pitfalls

- Stacking two motions or two camera moves in one prompt — the model will split the difference and ruin both.
- Changing the [STYLE] line between shots — the fastest route to a recast-looking cast.
