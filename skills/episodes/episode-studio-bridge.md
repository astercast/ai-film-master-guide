---
name: episode-studio-bridge
description: One-click bridge: stage the episode planner's saved series (title, logline, cast anchors, every block's format/runtime/beats) into the Studio's series mode for a full costed packet.
---

# Send planner blocks to the Studio

## Use when

When episode blocks are saved and you want per-episode shot budgets, the locked bible, and reuse math before generating.

## Inputs

- Saved planner series (localStorage 'afg-episode-series') with >= 1 episode block

## Procedure

1. In the episode planner, check the 'Saved blocks' list: every block shows format, emotion, beat count, and beats x seconds-per-beat runtime.
2. Press 'Send series to Studio' — the planner stages {title, logline, cast anchors, blocks[]} into localStorage 'afg-studio-bridge' and navigates to studio.html.
3. The Studio consumes the payload once: project type = most common block format, episodes = block count (3-10), per-episode runtime = median beats x spb snapped into the format's band, cast rows pre-filled.
4. Each block's emotion/beats/hook/turn/cliffhanger becomes the episode's arc in the packet (not a skeleton); skeletons are only generated when no blocks exist.
5. Verify the pre-fill (episode count, runtime, cast anchors), then build the series packet.

## Worked example

3 saved mini-drama blocks (5/4/4 beats x 15s = 75/60/60s) -> Studio: 3 episodes, 75s/ep (nearest in-band option to the median), Mara's anchor locked into the bible DNA.

## API references

- `api/v1/checklists.json`

## Pitfalls

- Sending before saving blocks — the bridge reads saved blocks, not the form fields.
- Blocks with mixed formats — the Studio takes the most common; re-format outliers in the planner first.
