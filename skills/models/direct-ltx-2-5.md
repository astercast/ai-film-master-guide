---
name: direct-ltx-2-5
description: Use LTX-2.5 well: costs, strengths, weaknesses, best use.
---

# Direct with LTX-2.5

## Use when

You are generating on LTX-2.5 (Lightricks, video). Best use: 4K fast-drafting and multi-shot sequences with commercial-legal safety.

## Inputs

- Shot list with durations (cost basis: Open weights (22B); LTX 2.5 Fast API from ~$0.003/s (reported benchmark — verify live); paid license required above $10M revenue)
- Whether you need native audio, lip sync, or long takes
- Your quality bar: draft (720p/fast) vs hero

## Procedure

1. Budget first: Open weights (22B); LTX 2.5 Fast API from ~$0.003/s (reported benchmark — verify live); paid license required above $10M revenue. Multiply by 3–5× per hero shot for re-rolls.
2. Lean into its strength: Fast/Pro variants up to 4K; open weights 22B; multi-shot in one pass; LTX line trained on licensed Getty/Shutterstock imagery — legal safety for commercial work LTX-2.x Community License: free commercial use under $10M ARR, gated Hugging Face repo; Fast = distilled 8-step schedule, Pro = higher fidelity (Pro tops out at 1080p currently — verify live); native multi-shot scenes in one pass; automatic duration; audio-to-video up to 20s at 720p/1080p (10s at higher resolutions); fine-tuned Gemma 4 12B text encoder; ComfyUI native templates; LTX Desktop for local inference..
3. Design around its weakness — do not fight it: Young evidence base; license traps at revenue scale — read terms before monetizing.
4. Draft everything at the cheapest tier that still answers the creative question.
5. Upscale or re-render at hero quality only for approved selects.

## Worked example

10-second hero shot budgeting at Open weights (22B); LTX 2.5 Fast API from ~$0.003/s (reported benchmark — verify live); paid license required above $10M revenue: estimate the per-second rate, × 2 for duration, × 4 for re-roll headroom.

## API references

- `data/v1/models.json`

## Pitfalls

- Weakness to respect: Young evidence base; license traps at revenue scale — read terms before monetizing.
- Costs in models.json were refreshed 2026-10-11 — verify live before spending real money.
