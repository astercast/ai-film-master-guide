---
name: fix-morphing-faces
description: Diagnose and fix faces that shift between frames or shots.
---

# Fix morphing faces

## Use when

Any generation where the face won't hold.

## Inputs

- The failing clip
- The face anchor reference

## Procedure

1. Confirm the face anchor is attached and attached LAST (photos win the style vote).
2. Shorten the shot — morphing compounds with duration.
3. Reduce competing faces: one face per shot beats a crowd.
4. For recurring characters, lock identity (Soul ID) instead of describing.
5. Fix in post as last resort: face refinement passes on hero shots only.

## Worked example

Crowd shot morphing → re-cut as three single-face shots → locked.

## Pitfalls

- Re-rolling the same prompt — change the anchor position or the shot length.
