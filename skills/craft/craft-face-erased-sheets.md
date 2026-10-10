---
name: craft-face-erased-sheets
description: Get new angles without re-rolling identity.
---

# Use face-erased sheets for new angles

## Use when

Needing a character angle the sheet doesn't have.

## Inputs

- Locked character sheet

## Procedure

1. Erase/blank the face region on a copy of the sheet.
2. Generate the new angle against the erased sheet + the locked face anchor separately.
3. Composite: new angle body, original face pixels.
4. Never let the model invent the face at a new angle.

## Worked example

Profile angle: erased-sheet body + mara_face_v1.png → seamless profile.

## Pitfalls

- Prompting 'same face, profile view' — the model will invent a new face.
