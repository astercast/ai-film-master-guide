---
name: audit-per-shot-checklist-before-every-generation
description: Run the guide's per-shot checklist (before every generation) as a pass/fail audit.
---

# Run the Per-shot checklist (before every generation)

## What this gets you

You will have checked your work while mistakes are still free to fix: every item marked pass or fail, with the concrete fix written down — instead of finding the problem after paying for generations.

## Use when

Run this audit at the matching production gate. Every item must pass before moving on.

## Inputs

- The current state of the production (script, prompts, selects, or cut)

## Procedure

1. Go item by item. Mark pass/fail — no partial credit on hero shots.
2. For each fail, write the concrete fix and who owns it.
3. Re-run failed items only; don't redo the whole audit.
4. Key items:
  - [ ] One subject, one action, one camera move — nothing more
  - [ ] Identity Block vs Motion Block separated (no appearance in motion, no motion in identity)
  - [ ] Subject anchored with stable label or @ reference (never pronouns alone)
  - [ ] Camera phrasing explicit (move + speed + stability + purpose)
  - [ ] Lighting + style-bible line appended verbatim
  - [ ] Audio direction included if model supports native audio (dialogue quoted + attributed; SFX named)
  - [ ] Negative/exclusion handled per model (Runway: none — state desired; Seedance: exclude compositionally)
  - [ ] Draft at 720p / Fast tier first; hero only after approval

## Worked example

Per-shot audit on a dialogue close-up: one subject ✓, one action ✓, one camera move ✓, identity/motion separated ✓, style bible appended ✓ → approved for 720p draft.

## API references

- `data/v1/checklists.json`

## Pitfalls

- Treating the audit as paperwork — its job is to catch the $500 mistake before you pay it.
