---
name: prompt-t13
description: Write an underwater reveal prompt (core track) using the guide's template.
---

# Prompt: Underwater reveal

## Use when

You are directing a shot that needs: underwater reveal. Anatomy: tilt reveals; light does the exposition. Models: Luma (fluid dynamics), Kling 3.0.

## Inputs

- `[STYLE]` — your style-bible line, verbatim
- `[SUBJECT]` — locked identity label or @ reference

## Procedure

1. Gather one value per placeholder. Keep [STYLE] identical to every other prompt in the project.
2. Fill the template verbatim — do not paraphrase its camera language:
3.   `Camera tilts down from surface glare to reveal [SUBJECT] below, [LIGHT: caustic light rays, deep blue]. Slow descent. [STYLE].`
4. Confirm exactly ONE primary motion and ONE camera move in the final prompt.
5. Separate identity from motion: appearance descriptors in the Identity Block, action in the Motion Block — never pronouns alone as the subject anchor.
6. Add native-audio direction (quoted, attributed dialogue; named SFX) when the model supports it.
7. Generate a 720p draft first; approve the select before any 1080p/4K render.

## Worked example

Filled draft:
`Camera tilts down from surface glare to reveal MARA below, [LIGHT: caustic light rays, deep blue]. Slow descent. 1970s anamorphic 35mm, warm tungsten, halation, fine grain.`

## API references

- `api/v1/prompt-templates.json`
- `api/v1/camera-movements.json`

## Pitfalls

- Stacking two motions or two camera moves in one prompt — the model will split the difference and ruin both.
- Changing the [STYLE] line between shots — the fastest route to a recast-looking cast.
