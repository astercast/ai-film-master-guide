---
name: camera-dolly-out-pull-back
description: Direct a dolly out / pull-back camera move with exact prompt phrasing.
---

# Direct: Dolly out / Pull-back

## Use when

Use when the shot needs what this move does: Creating distance, reflection, or scale reveals; ending shots.

## Inputs

- Subject label or @ reference the move is motivated by
- Speed and stability (slow/majestic, energetic/handheld, locked)
- The story purpose of the move in one sentence

## Procedure

1. Start from the guide's phrasing: `"Slow pull-back revealing [environment]" / Hailuo: [Pull out]`
2. State the move, the speed, AND the purpose — models obey motivated camera better than decorative camera.
3. Keep it the only move in the prompt. One move per shot.
4. Pair with a matching subject pace (tracking a runner = camera pace matches runner).
5. Draft at 720p; check the move reads before committing to hero resolution.

## Worked example

`"Slow pull-back revealing [environment]" / Hailuo: [Pull out]`

## API references

- `data/v1/camera-movements.json`

## Pitfalls

- Naming the move without speed/stability — 'dolly in' alone gives you a random dolly.
- Combining with a second move — pick one.
