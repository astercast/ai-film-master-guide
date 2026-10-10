---
name: camera-static-locked-off
description: Direct a static locked-off camera move with exact prompt phrasing.
---

# Direct: Static locked-off

## Use when

Use when the shot needs what this move does: Timelapse; dialogue coverage; product stills; letting performance carry the shot.

## Inputs

- Subject label or @ reference the move is motivated by
- Speed and stability (slow/majestic, energetic/handheld, locked)
- The story purpose of the move in one sentence

## Procedure

1. Start from the guide's phrasing: `"Static locked-off shot" / "Static tripod shot" / Hailuo: [Static shot]; never "the camera doesn't move"`
2. State the move, the speed, AND the purpose — models obey motivated camera better than decorative camera.
3. Keep it the only move in the prompt. One move per shot.
4. Pair with a matching subject pace (tracking a runner = camera pace matches runner).
5. Draft at 720p; check the move reads before committing to hero resolution.

## Worked example

`"Static locked-off shot" / "Static tripod shot" / Hailuo: [Static shot]; never "the camera doesn't move"`

## API references

- `api/v1/camera-movements.json`

## Pitfalls

- Naming the move without speed/stability — 'dolly in' alone gives you a random dolly.
- Combining with a second move — pick one.
