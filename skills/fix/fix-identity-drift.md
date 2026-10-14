---
name: fix-identity-drift
description: Stop a character slowly becoming someone else.
---

# Fix identity drift across scenes

## What this gets you

A character who slowly turns into a stranger across scenes will stay recognisably themselves from first shot to last.

## Use when

Multi-scene productions with recurring characters.

## Inputs

- Registry face anchors
- First-scene and current-scene frames side by side

## Procedure

1. Check: was the base portrait ever re-run? If yes, rebuild from the original anchor.
2. Re-anchor the original references — don't wait for drift to become visible.
3. Chain the previous scene's finished video as reference.
4. Verify wardrobe/palette match the registry, not your memory.

## Worked example

Scene 9 Mara vs scene 1: jawline drifted → rebuilt from mara_face_v1.png, chained scene 8's final.

## Pitfalls

- Describing the character 'from memory' in new prompts — the registry is the memory.
