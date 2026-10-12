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

1. Structure the block: hook (the decision point as a visual in the first 3s) -> the stakes -> the decision beat (freeze on the choice; caption + pinned comment ask the vote) -> the consequence -> the turn -> cliffhanger at the NEXT choice, never the resolution.
2. Generate a freeze-frame-friendly keyframe for the decision beat (clean composition, no burned text — the platform's poll/comment UI does the asking).
3. Post with the decision in the caption and the poll in the pinned comment; give the vote a real deadline ('the winning choice plays out tomorrow').
4. After the episode lands, harvest the comments: the winning vote and the strongest minority theories become episode N+1's block inputs (stakes, hook, beats). Log the decision in the arc tracker with the tally.
5. Keep one decision per episode (the interactive analogue of the two-emotions rule): two votes splits the comment section and kills the funnel.

## Worked example

Ep 3 of 'The Impossible Door': Lena finds a door that wasn't there. Decision beat: she knocks or walks away — freeze on her hand. Caption asks the vote; 12,000 comments choose 'knock'. Ep 4 opens with her knocking.

## API references

- `api/v1/checklists.json`

## Pitfalls

- Asking the vote without a deadline — open votes feel like homework, closed votes feel like a game.
- Burning the poll into the video — platform poll stickers and pinned comments do it better and stay editable.
- Rigging or ignoring the result — the format's contract is that the vote wins; faking it reads instantly in the comments.
