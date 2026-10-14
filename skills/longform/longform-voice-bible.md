---
name: longform-voice-bible
description: Paste identical voice direction into every generation, verbatim, no synonyms.
---

# Lock the Voice Bible

## What this gets you

Your character will sound like the same person in every scene, because the exact same voice instructions go into every generation, word for word.

## Use when

Any production with recurring characters who speak.

## Inputs

- Per-character voice spec: register, timbre, tempo, manner

## Procedure

1. Write one Voice Bible block per character.
2. Paste it verbatim into every generation, not even a synonym changed.
3. Keep dialogue and audio as separate prompt blocks (audio carries voice identity only).

## Worked example

VOICE_BIBLE_MARA: register alto, timbre smoky, tempo unhurried, manner dry. [pasted verbatim into all 40 of Mara's generations]

## Pitfalls

- Paraphrasing the voice spec 'for variety', that's how a character gains three voices.
