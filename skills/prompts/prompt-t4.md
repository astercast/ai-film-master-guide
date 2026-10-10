---
name: prompt-t4
description: Write a product macro orbit prompt (core track) using the guide's template.
---

# Prompt: Product macro orbit

## Use when

You are directing a shot that needs: product macro orbit. Anatomy: one move (orbit) + one focus event. Best for: commercials.

## Inputs

- `[PRODUCT]` — fill per the template's anatomy
- `[STYLE]` — your style-bible line, verbatim

## Procedure

1. Gather one value per placeholder. Keep [STYLE] identical to every other prompt in the project.
2. Fill the template verbatim — do not paraphrase its camera language:
3.   `Macro shot of [PRODUCT], [LIGHT: warm rim light, dark studio]. Slow 180-degree orbit, focus pull from reflections to label. [STYLE].`
4. Confirm exactly ONE primary motion and ONE camera move in the final prompt.
5. Separate identity from motion: appearance descriptors in the Identity Block, action in the Motion Block — never pronouns alone as the subject anchor.
6. Add native-audio direction (quoted, attributed dialogue; named SFX) when the model supports it.
7. Generate a 720p draft first; approve the select before any 1080p/4K render.

## Worked example

Filled draft:
`Macro shot of [PRODUCT], [LIGHT: warm rim light, dark studio]. Slow 180-degree orbit, focus pull from reflections to label. 1970s anamorphic 35mm, warm tungsten, halation, fine grain.`

## API references

- `api/v1/prompt-templates.json`
- `api/v1/camera-movements.json`

## Pitfalls

- Stacking two motions or two camera moves in one prompt — the model will split the difference and ruin both.
- Changing the [STYLE] line between shots — the fastest route to a recast-looking cast.
