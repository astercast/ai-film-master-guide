---
name: longform-blocking-diagram
description: Use a color-coded schematic when words can't stage multi-character shots.
---

# Draw the blocking diagram

## What this gets you

You will have a simple colour-coded map of where every character stands in a complicated shot, so multi-person scenes stop coming out scrambled.

## Use when

Any shot with 2+ characters where positions matter.

## Inputs

- Frame composition intent
- Character @-tags
- Camera position

## Procedure

1. Draw a schematic outline from the camera's front view, never a top-down floor plan.
2. Color-code each character; bind colors to @-tags in the prompt.
3. Attach the diagram LAST among references so photos win the style vote.
4. Address edits by color ('move the BLUE figure'), regenerate from the original frame.

## Worked example

Prompt addendum: 'Blocking per attached diagram: BLUE=@mara_ON_neon_v1 at frame left foreground, RED=@vex_ON_neon_v1 frame right, facing BLUE.'

## Pitfalls

- Rendering letters/labels into the diagram image, they bleed into the shot.
