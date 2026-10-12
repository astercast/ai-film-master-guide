---
name: episode-interactive-format
description: Run the interactive serialized format: one decision per episode, a poll/comment beat that freezes on the choice, and a cliffhanger at the next decision — with viewer comments shaping the following episode's block.
---

# Plan comment-driven interactive episodes

## Use when

When the series concept is a story the audience can vote on or argue about. The engine is participation, not just emotion.

## Inputs

- Locked series bible
- One decision the episode hinges on
- Where the poll/comment prompt sits (beat 2)

## Procedure

1. Structure the block: hook (the decision point as a visual in the first 3s) -> the stakes -> the decision beat (freeze on the choice; a TikTok comment poll asks the vote — up to 5 options, creator-set timeframe, real-time in-thread results) -> the consequence -> the turn -> cliffhanger at the NEXT choice, never the resolution.
2. Generate a freeze-frame-friendly keyframe for the decision beat (clean composition, no burned text — the native comment poll does the asking).
3. Post with the decision in the caption and the vote as a TikTok comment poll (global since Sept 3, 2026 — TechCrunch / USA Today); the poll's timeframe IS the real deadline ('the winning choice plays out tomorrow').
4. After the episode lands, harvest the comments: the winning vote and the strongest minority theories become episode N+1's block inputs (stakes, hook, beats). Log the decision in the arc tracker with the poll's in-thread tally. (The Sept 2026 comment overhaul also brought voice comments — transcribe audio theories before harvesting.)
5. Keep one decision per episode (the interactive analogue of the two-emotions rule): two votes splits the comment section and kills the funnel.

## Worked example

Ep 3 of 'The Impossible Door': Lena finds a door that wasn't there. Decision beat: she knocks or walks away — freeze on her hand. Caption asks the vote; 12,000 comments choose 'knock'. Ep 4 opens with her knocking.

## API references

- `api/v1/checklists.json`

## Pitfalls

- Asking the vote without a deadline — open votes feel like homework, closed votes feel like a game (the comment poll's timeframe enforces this).
- Burning the poll into the video — the native comment poll does the asking, stays editable, tallies itself, and enforces the deadline.
- Rigging or ignoring the result — the format's contract is that the vote wins; faking it reads instantly in the comments.
