---
name: prompt-s1
description: Write a tts dialogue line with direction tags prompt (audio track) using the guide's template.
---

# Prompt: TTS dialogue line with direction tags

## Use when

You are directing a shot that needs: tts dialogue line with direction tags. Anatomy: bracketed tags and punctuation are the TTS director's camera moves. Best for: decoupled dialogue, narration.

## Inputs

- `[EMOTION]` — fill per the template's anatomy
- `[LINE]` — fill per the template's anatomy
- `[SUBJECT]` — locked identity label or @ reference

## Procedure

1. Gather one value per placeholder. Keep [STYLE] identical to every other prompt in the project.
2. Fill the template verbatim — do not paraphrase its camera language:
3.   `[VOICE: voice-bible descriptor — age, texture, pace]. [SUBJECT] says: "[LINE]" [pause 0.5s] "[LINE 2, quieter]". Direction: [EMOTION] rising to [EMOTION]; do not rush the last word.`
4. Confirm exactly ONE primary motion and ONE camera move in the final prompt.
5. Separate identity from motion: appearance descriptors in the Identity Block, action in the Motion Block — never pronouns alone as the subject anchor.
6. Handle audio in post (this template's models don't do native audio well).
7. Generate a 720p draft first; approve the select before any 1080p/4K render.

## Worked example

Filled draft:
`[VOICE: voice-bible descriptor — age, texture, pace]. MARA says: "[LINE]" [pause 0.5s] "[LINE 2, quieter]". Direction: [EMOTION] rising to [EMOTION]; do not rush the last word.`

## API references

- `data/v1/prompt-templates.json`
- `data/v1/camera-movements.json`

## Pitfalls

- Stacking two motions or two camera moves in one prompt — the model will split the difference and ruin both.
- Changing the [STYLE] line between shots — the fastest route to a recast-looking cast.
