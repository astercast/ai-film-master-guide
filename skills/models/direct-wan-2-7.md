---
name: direct-wan-2-7
description: Use Wan 2.7 well: costs, strengths, weaknesses, best use.
---

# Direct with Wan 2.7

## What this gets you

You will know whether Wan 2.7 is worth your money for the shot you have in mind, what it costs, what it is best at, and the weakness to design around, before you spend on generations.

## Use when

You are generating on Wan 2.7 (Alibaba, video). Best use: Directed mid-budget clips where the prompt is the storyboard: timed multi-shot prompts, reference-held characters and products, lip-synced talking heads from a supplied audio track, and prompt-guided edits of footage you already have, the videoedit endpoint is the one no neighbouring model in this price band matches..

## Inputs

- Shot list with durations (cost basis: Alibaba Cloud Model Studio list (USD): $0.10/s at 720p, $0.15/s at 1080p, the same rate on every wan2.7 video endpoint; fal hosts the same card at $0.10/s (720p) and $0.15/s (1080p). China list: ¥0.6/s at 720p, ¥1.0/s at 1080p. Worked: a 5s clip at 720p runs $0.50; 10s at 1080p runs $1.50; the full 15s at 1080p runs $2.25. Billed per generated second, verify live.)
- Whether you need native audio, lip sync, or long takes
- Your quality bar: draft (720p/fast) vs hero

## Procedure

1. Budget first: Alibaba Cloud Model Studio list (USD): $0.10/s at 720p, $0.15/s at 1080p, the same rate on every wan2.7 video endpoint; fal hosts the same card at $0.10/s (720p) and $0.15/s (1080p). China list: ¥0.6/s at 720p, ¥1.0/s at 1080p. Worked: a 5s clip at 720p runs $0.50; 10s at 1080p runs $1.50; the full 15s at 1080p runs $2.25. Billed per generated second, verify live.. Multiply by 3 to 5× per hero shot for re-rolls.
2. Lean into its strength: Thinking Mode: the model plans the composition before it generates, which shows up as fewer artifacts and steadier multi-shot prompts, a prompt can carry timed shot changes (Shot 1 / Shot 2 / Shot 3 with time ranges) and the model cuts on them. Full four-endpoint suite under official IDs (wan2.7-t2v, wan2.7-i2v, wan2.7-r2v, wan2.7-videoedit): text-to-video, image-to-video with first/last-frame lock and continuation, reference-to-video with up to 5 reference images, and prompt-guided editing of existing footage. 2-15s at 720p/1080p, native audio in the same pass, precise color control (HEX codes and palettes) and strong character consistency across references..
3. Design around its weakness, do not fight it: 1080p ceiling, no 4K; the top rung of the Wan line is 3.0. Closed weights: no local run (the open-weights Wan story still ends at 2.2). Native audio is always on, some hosts offer no silent option. Reference-to-video and videoedit cap shorter than text-to-video on some hosts (2-10s against 2-15s), so the row you rent is not always the spec sheet..
4. Draft everything at the cheapest tier that still answers the creative question.
5. Upscale or re-render at hero quality only for approved selects.

## Worked example

10-second hero shot budgeting at Alibaba Cloud Model Studio list (USD): $0.10/s at 720p, $0.15/s at 1080p, the same rate on every wan2.7 video endpoint; fal hosts the same card at $0.10/s (720p) and $0.15/s (1080p). China list: ¥0.6/s at 720p, ¥1.0/s at 1080p. Worked: a 5s clip at 720p runs $0.50; 10s at 1080p runs $1.50; the full 15s at 1080p runs $2.25. Billed per generated second, verify live.: estimate the per-second rate, × 2 for duration, × 4 for re-roll headroom.

## API references

- `data/v1/models.json`

## Pitfalls

- Weakness to respect: 1080p ceiling, no 4K; the top rung of the Wan line is 3.0. Closed weights: no local run (the open-weights Wan story still ends at 2.2). Native audio is always on, some hosts offer no silent option. Reference-to-video and videoedit cap shorter than text-to-video on some hosts (2-10s against 2-15s), so the row you rent is not always the spec sheet..
- Costs in models.json were refreshed 2026-10-11, verify live before spending real money.
