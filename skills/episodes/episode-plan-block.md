---
name: episode-plan-block
description: Build one episode block (one emotion, 3-5 beats, turn, cliffhanger) and verify it against the format's runtime band.
---

# Plan an episode block with runtime estimate

## What this gets you

You will have one episode fully planned — one emotion, a few beats, a turn and a cliffhanger — at a length you have verified works.

## Use when

Every episode before generation — the block is the shooting script for serialized short-form.

## Inputs

- Locked series bible
- Episode number
- The episode's single emotion
- Format (from episode-format-pick)

## Procedure

1. Write the block: emotion (ONE), stake (one line), hook (first 3 seconds), 3-5 beats, turn, cliffhanger, keyframe scenes.
2. Set seconds-per-beat from the format (mini-drama ~12-15s, POV ~12s, day-in-life ~10s); estimated runtime = beats x seconds-per-beat.
3. Check the band: in-band -> lock the voice/dialogue budget at ~Ns +/-10% BEFORE generating a frame. Too short/long -> cut or add a beat, never stretch beats.
4. Log the block to the arc tracker with its lesson — the arc is the series memory.

## Worked example

Ep 1 (mini-drama): emotion dread, 4 beats x 12s = 48s... too short for the 60-150s band -> add a beat (5 x 12 = 60s, in-band) -> lock voice budget.

## API references

- `data/v1/checklists.json`

## Pitfalls

- Generating before the voice budget is locked — dialogue re-records are the most expensive fix in short-form.
- Cliffhangers that resolve — a cliffhanger is a freeze, not a payoff.
