---
name: prompt-s2
description: Write a voice-designed narration (voice bible) prompt (audio track) using the guide's template.
---

# Prompt: Voice-designed narration (Voice Bible)

## Use when

You are directing a shot that needs: voice-designed narration (voice bible). Anatomy: cast the voice like an actor; consistency comes from the bible, not the engine. Best for: documentary VO, trailers.

## Inputs

- `[NARRATION]` — fill per the template's anatomy

## Procedure

1. Gather one value per placeholder. Keep [STYLE] identical to every other prompt in the project.
2. Fill the template verbatim — do not paraphrase its camera language:
3.   `Narration, [VOICE BIBLE: 40s, gravel texture, slow deliberate pace, slight regional lilt, never rushed]. Script: "[NARRATION]". Record three passes — neutral, weary, warm — and pick in the edit.`
4. Confirm exactly ONE primary motion and ONE camera move in the final prompt.
5. Separate identity from motion: appearance descriptors in the Identity Block, action in the Motion Block — never pronouns alone as the subject anchor.
6. Handle audio in post (this template's models don't do native audio well).
7. Generate a 720p draft first; approve the select before any 1080p/4K render.

## Worked example

Filled draft:
`Narration, [VOICE BIBLE: 40s, gravel texture, slow deliberate pace, slight regional lilt, never rushed]. Script: "[NARRATION]". Record three passes — neutral, weary, warm — and pick in the edit.`

## API references

- `api/v1/prompt-templates.json`
- `api/v1/camera-movements.json`

## Pitfalls

- Stacking two motions or two camera moves in one prompt — the model will split the difference and ruin both.
- Changing the [STYLE] line between shots — the fastest route to a recast-looking cast.
