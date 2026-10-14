---
name: audit-pre-production-checklist
description: Run the guide's pre-production checklist as a pass/fail audit.
---

# Run the Pre-production checklist

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
  - [ ] Logline + one-sentence emotional promise of the film
  - [ ] Beat sheet: hook (0–10s) → setup → escalation → reversal → button image
  - [ ] Shot list with one job per shot (framing + single camera move + action)
  - [ ] Style bible locked (one style line; aspect ratio; grain/grade; lens language)
  - [ ] Character lock: identity method chosen (Soul ID / Cameo / reference sheet / labels); training photos or sheets prepared
  - [ ] Location/world lock: reference images or Soul Location generations saved
  - [ ] Audio plan: music direction (Suno prompts), voice cast (ElevenLabs voices), SFX needs; radio edit script drafted
  - [ ] Budget: credits per clip estimated from live model table; reroll budget (×3–5 per hero shot); plan tier vs. credit math

## Worked example

Per-shot audit on a dialogue close-up: one subject ✓, one action ✓, one camera move ✓, identity/motion separated ✓, style bible appended ✓ → approved for 720p draft.

## API references

- `data/v1/checklists.json`

## Pitfalls

- Treating the audit as paperwork — its job is to catch the $500 mistake before you pay it.
