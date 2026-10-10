---
name: fix-flicker-boiling
description: Stabilize textures that crawl between frames.
---

# Fix flicker and boiling

## Use when

Generations with shimmering surfaces, boiling backgrounds.

## Inputs

- The flickering clip

## Procedure

1. First: shorten the shot — flicker compounds with length.
2. Lock the background: stronger location plate reference, less prompt freedom there.
3. Reduce fine high-frequency detail in the prompt (lace, gravel, foliage) or bake it into the plate.
4. Deflicker in post as a last resort; it softens the image.

## Worked example

Boiling brick wall → re-generated with the wall baked into the plate, prompt simplified → stable.

## Pitfalls

- Denoising aggressively — kills the texture that made the shot good.
