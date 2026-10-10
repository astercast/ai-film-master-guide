---
name: longform-depth-map
description: Fix room geometry with a black-and-white depth channel alongside blocking.
---

# Add depth maps for room-heavy scenes

## Use when

Dialogue or ensemble scenes in a persistent location.

## Inputs

- Location plate
- Blocking diagram

## Procedure

1. Generate a depth map: light = near, dark = far.
2. Attach alongside the blocking diagram (diagram = who is where in frame; depth = how deep the room is).
3. Without it, locations rearrange themselves every few seconds.

## Worked example

Kitchen scene: depth map locks counter (near), table (mid), window (far) across 14 shots.

## Pitfalls

- Trusting text prompts to hold room geometry — they won't.
