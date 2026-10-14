---
name: camera-zoom-in-zoom-out
description: Direct a zoom in / zoom out camera move with exact prompt phrasing.
---

# Direct: Zoom in / Zoom out

## What this gets you

Your shot will gain what this move is for, slow emphasis without moving the camera body; surveillance/documentary feel, in the exact words models obey, ready to paste into any prompt.

## Use when

Use when the shot needs what this move does: Slow emphasis without moving the camera body; surveillance/documentary feel.

## Inputs

- Subject label or @ reference the move is motivated by
- Speed and stability (slow/majestic, energetic/handheld, locked)
- The story purpose of the move in one sentence

## Procedure

1. Start from the guide's phrasing: `Hailuo: [Zoom in] / [Zoom out]; prose: "gradual zoom"`
2. State the move, the speed, AND the purpose, models obey motivated camera better than decorative camera.
3. Keep it the only move in the prompt. One move per shot.
4. Pair with a matching subject pace (tracking a runner = camera pace matches runner).
5. Draft at 720p; check the move reads before committing to hero resolution.

## Worked example

`Hailuo: [Zoom in] / [Zoom out]; prose: "gradual zoom"`

## API references

- `data/v1/camera-movements.json`

## Pitfalls

- Naming the move without speed/stability, 'dolly in' alone gives you a random dolly.
- Combining with a second move, pick one.
