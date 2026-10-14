---
name: prompt-f2
description: Write a dead-eyes fix, give the eyes a job prompt (performance track) using the guide's template.
---

# Prompt: Dead-eyes fix, give the eyes a job

## What this gets you

You will have a finished prompt for a dead-eyes fix, give the eyes a job, the shot used for reaction shots, listening coverage, ready to paste into a video model: fill the bracketed blanks, generate a cheap draft first, and keep the take that works.

## Use when

You are directing a shot that needs: dead-eyes fix, give the eyes a job. Anatomy: eyes need a job every 2 to 3 seconds or they die on screen. Best for: reaction shots, listening coverage.

## Inputs

- `[BEAT]`, fill per the template's anatomy
- `[FOCUS POINT]`, fill per the template's anatomy
- `[LIGHT]`, lighting direction
- `[STYLE]`, your style-bible line, verbatim
- `[SUBJECT]`, locked identity label or @ reference

## Procedure

1. Gather one value per placeholder. Keep [STYLE] identical to every other prompt in the project.
2. Fill the template verbatim, do not paraphrase its camera language:
3.   `Close-up of [SUBJECT] [ACTION: listening], [LIGHT]. Eyes move with purpose: glance to [FOCUS POINT], blink on the thought change, micro-reaction at [BEAT]. Never hold a glassy stare. [STYLE].`
4. Confirm exactly ONE primary motion and ONE camera move in the final prompt.
5. Separate identity from motion: appearance descriptors in the Identity Block, action in the Motion Block, never pronouns alone as the subject anchor.
6. Add native-audio direction (quoted, attributed dialogue; named SFX) when the model supports it.
7. Generate a 720p draft first; approve the select before any 1080p/4K render.

## Worked example

Filled draft:
`Close-up of MARA [ACTION: listening], neon reflections. Eyes move with purpose: glance to [FOCUS POINT], blink on the thought change, micro-reaction at [BEAT]. Never hold a glassy stare. 1970s anamorphic 35mm, warm tungsten, halation, fine grain.`

## API references

- `data/v1/prompt-templates.json`
- `data/v1/camera-movements.json`

## Pitfalls

- Stacking two motions or two camera moves in one prompt, the model will split the difference and ruin both.
- Changing the [STYLE] line between shots, the fastest route to a recast-looking cast.
