---
name: longform-depth-map
description: Stop a room rearranging itself between shots: give the model a simple black-and-white map of what's near and what's far, alongside your blocking diagram.
---

# Add depth maps for room-heavy scenes

## What this gets you

Your rooms will stay the same room: furniture, doors and windows hold their places across every shot in the location.

## Use when

Dialogue or ensemble scenes in one location you return to, kitchens, offices, any room with furniture that must stay put.

## Inputs

- Location plate (your locked image of the room)
- Blocking diagram (who stands where, see longform-blocking-diagram)

## Procedure

1. Generate a depth map of the location plate: light = near, dark = far. Most image tools can produce one from the plate; a rough hand-painted version still helps.
2. Attach it alongside the blocking diagram on every generation in that room (diagram = who is where in frame; depth map = how deep the room is).
3. Keep both files with the asset registry and reuse the identical pair for every shot in the room.
4. Without it, locations rearrange themselves every few seconds, counters migrate, doors move, windows change walls.

## Worked example

Kitchen scene: depth map locks counter (near), table (mid), window (far) across 14 shots.

## Pitfalls

- Trusting text prompts to hold room geometry, they won't.
