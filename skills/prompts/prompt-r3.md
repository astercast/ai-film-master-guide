---
name: prompt-r3
description: Write a plasticky wide-shot fix prompt (repair track) using the guide's template.
---

# Prompt: Plasticky wide-shot fix

## What this gets you

You will have a finished prompt for a plasticky wide-shot fix, the shot used for wide-shot face quality, ready to paste into a video model: fill the bracketed blanks, generate a cheap draft first, and keep the take that works.

## Use when

You are directing a shot that needs: plasticky wide-shot fix. Anatomy: AI faces need pixels, shoot closer or composite. Best for: wide-shot face quality.

## Inputs

- `[LIGHT]`, lighting direction
- `[SUBJECT]`, locked identity label or @ reference

## Procedure

1. Gather one value per placeholder. Keep [STYLE] identical to every other prompt in the project.
2. Fill the template verbatim, do not paraphrase its camera language:
3.   `RESCUE for plasticky faces in wides: punch in, regenerate as [SHOT: medium close-up] of [SUBJECT], [LIGHT], natural skin texture, pores, catchlights. If the wide is otherwise good, composite the close face over it in pos...`
4. Confirm exactly ONE primary motion and ONE camera move in the final prompt.
5. Separate identity from motion: appearance descriptors in the Identity Block, action in the Motion Block, never pronouns alone as the subject anchor.
6. Add native-audio direction (quoted, attributed dialogue; named SFX) when the model supports it.
7. Generate a 720p draft first; approve the select before any 1080p/4K render.

## Worked example

Filled draft:
`RESCUE for plasticky faces in wides: punch in, regenerate as [SHOT: medium close-up] of MARA, neon reflections, natural skin texture, pores, catchlights. If the wide is otherwise good, composite the close face over it in post.`

## API references

- `data/v1/prompt-templates.json`
- `data/v1/camera-movements.json`

## Pitfalls

- Stacking two motions or two camera moves in one prompt, the model will split the difference and ruin both.
- Changing the [STYLE] line between shots, the fastest route to a recast-looking cast.
