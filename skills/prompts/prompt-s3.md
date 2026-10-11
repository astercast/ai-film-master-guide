---
name: prompt-s3
description: Write an ai music cue brief prompt (audio track) using the guide's template.
---

# Prompt: AI music cue brief

## Use when

You are directing a shot that needs: ai music cue brief. Anatomy: brief the arc and demand stems; never temp-track with a song you cannot clear. Best for: scoring AI films.

## Inputs

- `[BPM]` — fill per the template's anatomy
- `[CUE NAME]` — fill per the template's anatomy
- `[DURATION]` — fill per the template's anatomy
- `[INSTRUMENTS]` — fill per the template's anatomy
- `[KEY]` — fill per the template's anatomy
- `[TIMECODE]` — fill per the template's anatomy

## Procedure

1. Gather one value per placeholder. Keep [STYLE] identical to every other prompt in the project.
2. Fill the template verbatim — do not paraphrase its camera language:
3.   `Cue: [CUE NAME], [DURATION]s, enters at [TIMECODE]. Brief: [REFERENCE FEEL — describe it, never name a track you cannot clear], tempo [BPM], key [KEY], instrumentation [INSTRUMENTS], arc: [ARC: sparse → swell → cut on th...`
4. Confirm exactly ONE primary motion and ONE camera move in the final prompt.
5. Separate identity from motion: appearance descriptors in the Identity Block, action in the Motion Block — never pronouns alone as the subject anchor.
6. Handle audio in post (this template's models don't do native audio well).
7. Generate a 720p draft first; approve the select before any 1080p/4K render.

## Worked example

Filled draft:
`Cue: [CUE NAME], [DURATION]s, enters at [TIMECODE]. Brief: [REFERENCE FEEL — describe it, never name a track you cannot clear], tempo [BPM], key [KEY], instrumentation [INSTRUMENTS], arc: [ARC: sparse → swell → cut on the door slam]. Deliver stems. Rights: licensed or AI-generated per project policy — see the rights chapter.`

## API references

- `api/v1/prompt-templates.json`
- `api/v1/camera-movements.json`

## Pitfalls

- Stacking two motions or two camera moves in one prompt — the model will split the difference and ruin both.
- Changing the [STYLE] line between shots — the fastest route to a recast-looking cast.
