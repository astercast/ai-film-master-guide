---
name: craft-relay-chaining
description: Every clip starts on the last frame of the previous approved clip.
---

# Chain with relay frames

## Use when

Multi-clip scenes needing continuity.

## Inputs

- Approved clip N's last frame

## Procedure

1. Export the last frame of the approved clip.
2. Use it as the start frame (or reference) for clip N+1.
3. A clip only continues what's VISIBLE in its start frame.
4. Restate the full premise every clip — the model has no memory.

## Worked example

4-clip dialogue: each clip chained from the last approved frame — zero pops.

## Pitfalls

- Chaining from an unapproved clip — flaws compound down the chain.
