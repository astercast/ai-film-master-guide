---
name: fix-muddy-audio
description: Clean up dull, washy, or phasey generated audio.
---

# Fix muddy AI audio

## What this gets you

Dull, washy AI audio will come out clear enough that dialogue is understood the first time.

## Use when

Native-audio generations that sound wrong.

## Inputs

- The audio stem, isolated

## Procedure

1. Isolate the element (dialogue/VO/SFX) from music beds first.
2. Cleanup → high-pass/EQ → compress → de-ess → level: in that order.
3. Don't over-denoise — booth-dead voice means you went too far.
4. Never overwrite originals; keep the raw stem.

## Worked example

Washy dialogue: isolated, high-passed at 90Hz, de-essed, +3dB presence — broadcast-clean.

## Pitfalls

- NR before the premix — noise reduction is a premix decision, not a first step.
