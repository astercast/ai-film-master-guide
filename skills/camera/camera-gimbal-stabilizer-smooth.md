---
name: camera-gimbal-stabilizer-smooth
description: Direct a gimbal / stabilizer smooth camera move with exact prompt phrasing.
---

# Direct: Gimbal / Stabilizer smooth

## Use when

Use when the shot needs what this move does: Luxury/commercial feel; car spots; fashion; when handheld would read as error.

## Inputs

- Subject label or @ reference the move is motivated by
- Speed and stability (slow/majestic, energetic/handheld, locked)
- The story purpose of the move in one sentence

## Procedure

1. Start from the guide's phrasing: `"Smooth gimbal glide" / "Stabilized tracking"`
2. State the move, the speed, AND the purpose — models obey motivated camera better than decorative camera.
3. Keep it the only move in the prompt. One move per shot.
4. Pair with a matching subject pace (tracking a runner = camera pace matches runner).
5. Draft at 720p; check the move reads before committing to hero resolution.

## Worked example

`"Smooth gimbal glide" / "Stabilized tracking"`

## API references

- `data/v1/camera-movements.json`

## Pitfalls

- Naming the move without speed/stability — 'dolly in' alone gives you a random dolly.
- Combining with a second move — pick one.
