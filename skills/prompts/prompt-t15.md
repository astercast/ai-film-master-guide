---
name: prompt-t15
description: Write a match-cut transition pair prompt (core track) using the guide's template.
---

# Prompt: Match-cut transition pair

## Use when

You are directing a shot that needs: match-cut transition pair. Anatomy: identical motion vector across the cut; lock endpoints. Best for: transitions, transformations.

## Inputs

- `[DOOR A]` — fill per the template's anatomy
- `[DOOR B]` — fill per the template's anatomy
- `[ENV A]` — fill per the template's anatomy
- `[ENV B]` — fill per the template's anatomy
- `[REVEAL]` — fill per the template's anatomy
- `[STYLE]` — your style-bible line, verbatim
- `[SUBJECT]` — locked identity label or @ reference

## Procedure

1. Gather one value per placeholder. Keep [STYLE] identical to every other prompt in the project.
2. Fill the template verbatim — do not paraphrase its camera language:
3.   `[SUBJECT] opens [DOOR A] in [ENV A], swings toward camera. Match-cut motion. [STYLE].
Same swing continues as [DOOR B] opens in [ENV B], revealing [REVEAL]. [STYLE].`
4. Confirm exactly ONE primary motion and ONE camera move in the final prompt.
5. Separate identity from motion: appearance descriptors in the Identity Block, action in the Motion Block — never pronouns alone as the subject anchor.
6. Add native-audio direction (quoted, attributed dialogue; named SFX) when the model supports it.
7. Generate a 720p draft first; approve the select before any 1080p/4K render.

## Worked example

Filled draft:
`MARA opens [DOOR A] in [ENV A], swings toward camera. Match-cut motion. 1970s anamorphic 35mm, warm tungsten, halation, fine grain.
Same swing continues as [DOOR B] opens in [ENV B], revealing [REVEAL]. 1970s anamorphic 35mm, warm tungsten, halation, fine grain.`

## API references

- `api/v1/prompt-templates.json`
- `api/v1/camera-movements.json`

## Pitfalls

- Stacking two motions or two camera moves in one prompt — the model will split the difference and ruin both.
- Changing the [STYLE] line between shots — the fastest route to a recast-looking cast.
