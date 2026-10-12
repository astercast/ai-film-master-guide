---
name: episode-studio-bridge
description: One-click bridge: stage the episode planner's saved series (title, logline, cast anchors, every block's format/runtime/beats) into the Studio's series mode for a full costed packet — or into microdrama mode for the run economics.
---

# Send planner blocks to the Studio

## Use when

When episode blocks are saved and you want per-episode shot budgets, the locked bible, and reuse math before generating — or the clip/retake budget and benchmark math for the run.

## Inputs

- Saved planner series (localStorage 'afg-episode-series') with >= 1 episode block

## Procedure

1. In the episode planner, check the 'Saved blocks' list: every block shows format, emotion, beat count, and beats x seconds-per-beat runtime.
2. Press 'Send series to Studio' — the planner stages {title, logline, cast anchors, blocks[]} into localStorage 'afg-studio-bridge' and navigates to studio.html.
3. The Studio consumes the payload once: project type = most common block format, episodes = block count (3-10), per-episode runtime = median beats x spb snapped into the format's band, cast rows pre-filled.
4. Each block's emotion/beats/hook/turn/cliffhanger becomes the episode's arc in the packet (not a skeleton); skeletons are only generated when no blocks exist.
5. Or press 'Send run to Studio' — the planner stages {title, logline, episodes = block count, minPerEpisode = median block runtime in minutes (snapped to 0.5-3)} with kind 'microdrama'; the Studio opens in microdrama mode (Studio 2.5) and plans the run economics: clip budget, $50/min benchmark, 3-5x retake budget, regen reserve, documented-pace timeline.
6. Verify the pre-fill (episode count, runtime, cast anchors), then build the series packet or the run plan.

## Worked example

3 saved mini-drama blocks (5/4/4 beats x 15s = 75/60/60s) -> 'Send series to Studio': 3 episodes, 75s/ep (nearest in-band option to the median), Mara's anchor locked into the bible DNA. 'Send run to Studio': 3 episodes x 1 min -> 4-6 clips/episode, $150 benchmark, 180s generation per episode at the draft 3x rate.

## API references

- `data/v1/checklists.json`

## Pitfalls

- Sending before saving blocks — the bridge reads saved blocks, not the form fields.
- Blocks with mixed formats — the Studio takes the most common; re-format outliers in the planner first.
- Expecting a shot packet from 'Send run to Studio' — microdrama mode is economics only; use 'Send series to Studio' for the per-shot packet.
