---
name: camera-aerial-drone-pull-back
description: Direct an aerial / drone pull-back camera move with exact prompt phrasing.
---

# Direct: Aerial / Drone pull-back

## Use when

Use when the shot needs what this move does: Establishing geography; openings; epic scale.

## Inputs

- Subject label or @ reference the move is motivated by
- Speed and stability (slow/majestic, energetic/handheld, locked)
- The story purpose of the move in one sentence

## Procedure

1. Start from the guide's phrasing: `"Drone pull-back over [landscape]" / "Aerial pan across [city]"`
2. State the move, the speed, AND the purpose — models obey motivated camera better than decorative camera.
3. Keep it the only move in the prompt. One move per shot.
4. Pair with a matching subject pace (tracking a runner = camera pace matches runner).
5. Draft at 720p; check the move reads before committing to hero resolution.

## Worked example

`"Drone pull-back over [landscape]" / "Aerial pan across [city]"`

## API references

- `api/v1/camera-movements.json`

## Pitfalls

- Naming the move without speed/stability — 'dolly in' alone gives you a random dolly.
- Combining with a second move — pick one.
