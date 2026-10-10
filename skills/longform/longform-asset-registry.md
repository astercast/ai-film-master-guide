---
name: longform-asset-registry
description: Build the named, versioned asset registry before generating shot one.
---

# Set up the asset registry

## Use when

Starting any production longer than ~3 minutes. Nothing shoots until the registry is locked.

## Inputs

- Character list with reference photos
- Location list
- Prop list
- Naming convention: @<char>_<project>_<scene>_v<1>

## Procedure

1. Create registry.md: one @-tag per asset, one verbatim descriptor each.
2. Character sheets: close-up face anchor first (never re-run the base portrait), then full-body looks.
3. Locations: bake the lens look and grade into the plate image.
4. Props: front/rear split sheets for hero props.
5. State changes get NEW tags (@char_wet) — never overwrite.

## Worked example

@mara_ON_neon_v1 — woman, late 20s, copper bob, leather jacket, gold hoop. Face anchor: mara_face_v1.png (locked, never re-run).

## API references

- `api/v1/checklists.json`

## Pitfalls

- Generating before the registry exists — every later fix costs 10×.
