---
name: audit-consistency-checklist
description: Run the guide's consistency checklist as a pass/fail audit.
---

# Run the Consistency checklist

## Use when

Run this audit at the matching production gate. Every item must pass before moving on.

## Inputs

- The current state of the production (script, prompts, selects, or cut)

## Procedure

1. Go item by item. Mark pass/fail — no partial credit on hero shots.
2. For each fail, write the concrete fix and who owns it.
3. Re-run failed items only; don't redo the whole audit.
4. Key items:
  - [ ] Same character description word-for-word across all prompts (or Soul ID / Cameo / Elements selected)
  - [ ] Character sheet composite available as @Image1 for new angles
  - [ ] Last frame of previous clip = start frame of next (relay chaining) OR explicit FLF pair
  - [ ] Re-anchor original references every few chained generations (don't wait for drift)
  - [ ] Style bible unchanged since shot 1
  - [ ] Wardrobe/props continuity verified per shot (front/rear split sheets for hero props)
  - [ ] Faces: check for drift, merging (multi-person), plasticky wide-shot faces → fix in post
  - [ ] Grade preview: stills from different models compared side-by-side before final renders

## Worked example

Per-shot audit on a dialogue close-up: one subject ✓, one action ✓, one camera move ✓, identity/motion separated ✓, style bible appended ✓ → approved for 720p draft.

## API references

- `data/v1/checklists.json`

## Pitfalls

- Treating the audit as paperwork — its job is to catch the $500 mistake before you pay it.
