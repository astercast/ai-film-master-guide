---
name: prompt-l4
description: Write a sequence bridge (match-cut) prompt (longform track) using the guide's template.
---

# Prompt: Sequence bridge (match-cut)

## What this gets you

You will have a finished prompt for a sequence bridge (match-cut), the shot used for sequence assembly, ready to paste into a video model: fill the bracketed blanks, generate a cheap draft first, and keep the take that works.

## Use when

You are directing a shot that needs: sequence bridge (match-cut). Anatomy: design the seam, AI features die in the transitions. Best for: sequence assembly.

## Inputs

- `[STYLE]`, your style-bible line, verbatim

## Procedure

1. Gather one value per placeholder. Keep [STYLE] identical to every other prompt in the project.
2. Fill the template verbatim, do not paraphrase its camera language:
3.   `End of scene [N]: [SHOT A: final-frame description]. Start of scene [N+1]: [SHOT B: opening-frame description], match on [MATCH: shape / color / motion]. Bridge the cut with [TRANSITION: whip-pan / match-cut / sound brid...`
4. Confirm exactly ONE primary motion and ONE camera move in the final prompt.
5. Separate identity from motion: appearance descriptors in the Identity Block, action in the Motion Block, never pronouns alone as the subject anchor.
6. Add native-audio direction (quoted, attributed dialogue; named SFX) when the model supports it.
7. Generate a 720p draft first; approve the select before any 1080p/4K render.

## Worked example

Filled draft:
`End of scene [N]: [SHOT A: final-frame description]. Start of scene [N+1]: [SHOT B: opening-frame description], match on [MATCH: shape / color / motion]. Bridge the cut with [TRANSITION: whip-pan / match-cut / sound bridge]. 1970s anamorphic 35mm, warm tungsten, halation, fine grain.`

## API references

- `data/v1/prompt-templates.json`
- `data/v1/camera-movements.json`

## Pitfalls

- Stacking two motions or two camera moves in one prompt, the model will split the difference and ruin both.
- Changing the [STYLE] line between shots, the fastest route to a recast-looking cast.
