---
name: prompt-t2
description: Write a dialogue two-shot (shot-reverse-shot pair) prompt (core track) using the guide's template.
---

# Prompt: Dialogue two-shot (shot-reverse-shot pair)

## Use when

You are directing a shot that needs: dialogue two-shot (shot-reverse-shot pair). Anatomy: coverage, not chaos. Best for: conversations.

## Inputs

- `[ENV]` — environment description
- `[LIGHT]` — lighting direction
- `[LINE]` — fill per the template's anatomy
- `[STYLE]` — your style-bible line, verbatim
- `[SUBJECT A]` — fill per the template's anatomy
- `[SUBJECT B]` — fill per the template's anatomy

## Procedure

1. Gather one value per placeholder. Keep [STYLE] identical to every other prompt in the project.
2. Fill the template verbatim — do not paraphrase its camera language:
3.   `Medium two-shot of [SUBJECT A] and [SUBJECT B] at [ENV], [LIGHT]. Static locked-off. [SUBJECT A] says, "[LINE]." [STYLE].
Close-up of [SUBJECT B] reacting, shallow depth of field, [LIGHT]. Static. [SUBJECT B] replies, "[...`
4. Confirm exactly ONE primary motion and ONE camera move in the final prompt.
5. Separate identity from motion: appearance descriptors in the Identity Block, action in the Motion Block — never pronouns alone as the subject anchor.
6. Add native-audio direction (quoted, attributed dialogue; named SFX) when the model supports it.
7. Generate a 720p draft first; approve the select before any 1080p/4K render.

## Worked example

Filled draft:
`Medium two-shot of [SUBJECT A] and [SUBJECT B] at rain-slick alley, neon reflections. Static locked-off. [SUBJECT A] says, "[LINE]." 1970s anamorphic 35mm, warm tungsten, halation, fine grain.
Close-up of [SUBJECT B] reacting, shallow depth of field, neon reflections. Static. [SUBJECT B] replies, "[LINE]." 1970s anamorphic 35mm, warm tungsten, halation, fine grain.`

## API references

- `api/v1/prompt-templates.json`
- `api/v1/camera-movements.json`

## Pitfalls

- Stacking two motions or two camera moves in one prompt — the model will split the difference and ruin both.
- Changing the [STYLE] line between shots — the fastest route to a recast-looking cast.
