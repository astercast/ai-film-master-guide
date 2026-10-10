---
name: craft-flf-transitions
description: Interpolate between composed start and end images.
---

# Build first/last-frame transitions

## Use when

Match cuts, time jumps, impossible transitions.

## Inputs

- Start frame image
- End frame image

## Procedure

1. Compose both frames as stills first — the transition is only as good as its endpoints.
2. Use FLF-capable generation between them.
3. Match one strong element (shape, color, eyeline) across the cut.
4. The audience reads the match, not the morph.

## Worked example

Coffee cup → crater: matched circular shape, FLF interpolation, 3 seconds.

## API references

- `api/v1/models.json`

## Pitfalls

- Weak endpoints — FLF can't save uncomposed frames.
