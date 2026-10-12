---
name: fix-bad-lip-sync
description: Route dialogue through the right sync path.
---

# Fix bad lip sync

## Use when

Talking shots where mouths don't match words.

## Inputs

- The dialogue lines
- Current sync method

## Procedure

1. Short lines: native in-prompt quotes (dialogue quoted + attributed).
2. Long scenes: post lip-sync tools with isolated vocals.
3. Isolate vocals before any lip-sync pass — music beds confuse the tracker.
4. If the mouth is close but soft, it's acceptable; if it's wrong, re-route, don't re-roll.

## Worked example

12-line scene: native quotes failed at line 7 → isolated vocal → post lip-sync → locked.

## API references

- `data/v1/models.json`

## Pitfalls

- Re-rolling video to fix audio — wrong layer, wrong cost.
