---
name: longform-island-prompts
description: Make every prompt self-contained: the model has no memory of the last shot.
---

# Write island prompts

## What this gets you

Every prompt you write will work on its own — the model has no memory of your last shot, and after this, it will not need any.

## Use when

Every generation on a production longer than one scene.

## Inputs

- Asset registry
- Shot goal
- Blocking notes

## Procedure

1. Re-state positions, poses, wardrobe, props, optics, light from scratch — every time.
2. Never write 'same as the previous shot.'
3. Follow the block order: scene context, references, location map, gaze/eyelines, blocking, timed segments, dialogue, audio, physics, lighting, style/format, positive locks.
4. Gaze/eyelines get their own block before blocking.

## Worked example

Bad: 'Mara as before, now angry.' Good: full re-description of Mara, the kitchen, the morning light, her position at the counter, eyeline to the door.

## API references

- `data/v1/prompt-templates.json`

## Pitfalls

- Assuming continuity is the model's job — it's yours.
