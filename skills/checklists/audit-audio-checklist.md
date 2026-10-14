---
name: audit-audio-checklist
description: Run the guide's audio checklist as a pass/fail audit.
---

# Run the Audio checklist

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
  - [ ] Radio edit first: story works with eyes closed (dialogue/VO/music/SFX arc)
  - [ ] Dialogue: clean takes, processing chain (cleanup → high-pass/EQ → compress → de-ess → level)
  - [ ] Lip sync: correct route (native quotes in-video vs post tool); vocals isolated before lip-sync tools
  - [ ] Foley/SFX layers: backgrounds → hard FX → Foley; room tone under everything; J/L cuts on transitions
  - [ ] Music: generated, rights held; structure tags used; 3–4 versions auditioned
  - [ ] Mix: dialogue -16 to -14 LUFS; ambience -28 to -24 under dialogue; music bed -24 ducked -8 to -10 dB
  - [ ] Master: -14 LUFS integrated / -1 dBTP true peak (YouTube); alternate master if broadcast (-24)
  - [ ] QC: earbuds + speakers + mono check; no clipping; no over-denoised "booth" voices

## Worked example

Per-shot audit on a dialogue close-up: one subject ✓, one action ✓, one camera move ✓, identity/motion separated ✓, style bible appended ✓ → approved for 720p draft.

## API references

- `data/v1/checklists.json`

## Pitfalls

- Treating the audit as paperwork — its job is to catch the $500 mistake before you pay it.
