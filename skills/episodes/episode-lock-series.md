---
name: episode-lock-series
description: Set up the series record the episode planner persists: title, logline, hashtag, and the cast with voice IDs + one-line visual anchors.
---

# Lock a mini-drama series bible

## What this gets you

You will have the written bible for a short episode series — title, premise, cast with voices and looks locked — that every episode is made from.

## Use when

Starting any serialized short-form series — nothing shoots until the bible is locked.

## Inputs

- Series title
- One-line logline
- Hashtag
- Cast: name + TTS voice ID + one-line fixed visual anchor per character

## Procedure

1. Write the series record: title, logline, hashtag — the hashtag is the distribution handle, lock it early.
2. One cast row per character: name, voice ID (e.g. avocado_v2:MAI_03), anchor (one fixed visual line — never changes across episodes).
3. Persist as the planner's state shape (localStorage 'afg-episode-series'): {title, logline, hashtag, cast:[{name,voice,anchor}], blocks:{}, log:[]}.
4. Anchor rule: the anchor is the continuity contract — if it drifts, the character drifts.

## Worked example

Title 'Night Shift', hashtag #nightshift, cast: Rin the night-shift barista, voice avocado_v2:RIN_01, anchor 'woman, late 20s, black bob, green apron'.

## API references

- `data/v1/checklists.json`

## Pitfalls

- Locking episodes before the cast anchors — every later fix costs 10x.
- Vague anchors ('a barista') — the anchor must be a fixed visual description, not a role.
