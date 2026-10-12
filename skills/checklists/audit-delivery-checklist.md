---
name: audit-delivery-checklist
description: Run the guide's delivery checklist as a pass/fail audit.
---

# Run the Delivery checklist

## Use when

Run this audit at the matching production gate. Every item must pass before moving on.

## Inputs

- The current state of the production (script, prompts, selects, or cut)

## Procedure

1. Go item by item. Mark pass/fail — no partial credit on hero shots.
2. For each fail, write the concrete fix and who owns it.
3. Re-run failed items only; don't redo the whole audit.
4. Key items:
  - [ ] Picture lock → color pass (kill AI over-saturation; unified LUT; grain; chromatic aberration)
  - [ ] VFX cleanup: face fixes, artifact removal, shake/motion to sell movement
  - [ ] Upscale ONLY final selects (Topaz to 4K; frame-rate tool if slow-mo needed)
  - [ ] On-screen text/titles added in post (never baked into generation)
  - [ ] Export: MP4/MOV, target resolution, correct ratio, audio master embedded
  - [ ] Festival (Higgsfield): watermark + packshot present; public post live on IG/YouTube/X/Reddit (public, no login); all generation on higgsfield.ai; audio AI-generated with rights
  - [ ] Archive: prompts, seeds, references, project files saved for open-source-style reproducibility

## Worked example

Per-shot audit on a dialogue close-up: one subject ✓, one action ✓, one camera move ✓, identity/motion separated ✓, style bible appended ✓ → approved for 720p draft.

## API references

- `data/v1/checklists.json`

## Pitfalls

- Treating the audit as paperwork — its job is to catch the $500 mistake before you pay it.
