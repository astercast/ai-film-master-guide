---
name: compare-fast-action
description: Motion-strong models for chases, fights, and kinetic sequences.
---

# Choose a model for fast action

## What this gets you

You will know which model keeps chases and fights readable and fast, instead of melting them into blur.

## Use when

Action scenes where motion quality is the whole shot.

## Inputs

- Action complexity
- Need for camera motion vs subject motion

## Procedure

1. Shortlist: Kling 3.0 (motion), Luma (fluid dynamics), Seedance 2.0.
2. Keep shots 2 to 4s, short action shots hide breaks; long ones expose them.
3. Match camera pace to subject pace in the prompt.
4. Budget 5× re-rolls: action is the highest-variance category.

## Worked example

Alley chase: Kling 3.0 tracking shots, 3s each, 5 variations per setup.

## API references

- `data/v1/models.json`

## Pitfalls

- Long action takes, the failure rate climbs with every second.
