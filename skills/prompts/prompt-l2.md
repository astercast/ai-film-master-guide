---
name: prompt-l2
description: Write a character re-entry (consistency) prompt (longform track) using the guide's template.
---

# Prompt: Character re-entry (consistency)

## What this gets you

You will have a finished prompt for a character re-entry (consistency) — the shot used for features, episodic work — ready to paste into a video model: fill the bracketed blanks, generate a cheap draft first, and keep the take that works.

## Use when

You are directing a shot that needs: character re-entry (consistency). Anatomy: re-entry prompts restate identity; never trust the model to remember. Best for: features, episodic work.

## Inputs

- `[ENV]` — environment description
- `[LIGHT]` — lighting direction
- `[REFERENCE]` — fill per the template's anatomy
- `[SHOT]` — shot size
- `[STYLE]` — your style-bible line, verbatim

## Procedure

1. Gather one value per placeholder. Keep [STYLE] identical to every other prompt in the project.
2. Fill the template verbatim — do not paraphrase its camera language:
3.   `[SHOT] of [SUBJECT: identity label + three locked visual traits], re-entering at [ENV], [LIGHT]. Match the approved reference frame [REFERENCE]: same wardrobe, same hair, same build — no redesigns between scenes. [STYLE]...`
4. Confirm exactly ONE primary motion and ONE camera move in the final prompt.
5. Separate identity from motion: appearance descriptors in the Identity Block, action in the Motion Block — never pronouns alone as the subject anchor.
6. Add native-audio direction (quoted, attributed dialogue; named SFX) when the model supports it.
7. Generate a 720p draft first; approve the select before any 1080p/4K render.

## Worked example

Filled draft:
`medium close-up of [SUBJECT: identity label + three locked visual traits], re-entering at rain-slick alley, neon reflections. Match the approved reference frame [REFERENCE]: same wardrobe, same hair, same build — no redesigns between scenes. 1970s anamorphic 35mm, warm tungsten, halation, fine grain.`

## API references

- `data/v1/prompt-templates.json`
- `data/v1/camera-movements.json`

## Pitfalls

- Stacking two motions or two camera moves in one prompt — the model will split the difference and ruin both.
- Changing the [STYLE] line between shots — the fastest route to a recast-looking cast.
