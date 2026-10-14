---
name: camera-truck-left-truck-right
description: Direct a truck left / truck right camera move with exact prompt phrasing.
---

# Direct: Truck left / Truck right

## What this gets you

Your shot will gain what this move is for — parallax reveals; following action across a scene; keeping framing constant while shifting viewpoint — in the exact words models obey, ready to paste into any prompt.

## Use when

Use when the shot needs what this move does: Parallax reveals; following action across a scene; keeping framing constant while shifting viewpoint.

## Inputs

- Subject label or @ reference the move is motivated by
- Speed and stability (slow/majestic, energetic/handheld, locked)
- The story purpose of the move in one sentence

## Procedure

1. Start from the guide's phrasing: `Hailuo: [Truck left] / [Truck right]; prose: "camera slides laterally"`
2. State the move, the speed, AND the purpose — models obey motivated camera better than decorative camera.
3. Keep it the only move in the prompt. One move per shot.
4. Pair with a matching subject pace (tracking a runner = camera pace matches runner).
5. Draft at 720p; check the move reads before committing to hero resolution.

## Worked example

`Hailuo: [Truck left] / [Truck right]; prose: "camera slides laterally"`

## API references

- `data/v1/camera-movements.json`

## Pitfalls

- Naming the move without speed/stability — 'dolly in' alone gives you a random dolly.
- Combining with a second move — pick one.
