---
name: longform-assembly-sheet
description: The long-form pipelines chapter as a working sheet: the five pre-lock gates, every scene logged with its stress test, storyboard, reference, dialogue route, draft tier, re-rolls, and route, and the feature-lock verdict from the chapter's rules.
---

# Run the longform sheet

## Use when

On any production past short length, from the registry pass to picture lock — and at every supervision review after, until the sheet reads clean.

## Inputs

- Scene list in film order
- The asset registry (named, versioned, locked)
- Stress-test verdict per scene
- The architecture call: chaining or sequence assembly

## Procedure

1. Work the five pre-lock gates in order: asset registry complete before shot one; every scene stress-tested (Goal/Obstacle/Tactic/Reversal/Value Shift) and storyboarded; architecture chosen — scene-by-scene chaining for small teams, sequence assembly only with a full-time registry wrangler; dialogue architecture chosen per scene, not per film; lock discipline written — base portrait never re-run, plates carry the look, Voice Bible pasted verbatim, island prompts.
2. Log every scene with its stress test and storyboard done or not, its reference — video (previous finished scene or previz), text only, or none yet — its dialogue route: native, human-recorded and AI-converted, decoupled, or silent; its draft tier: 720p draft, upscaled winner, or full-res generation; its re-rolls, and its route: in production, picture-locked, in generation supervision, or cut from the film.
3. Respect the mechanical rules: a scene generated without its stress test reads untested — its cost is discovered after it is paid for; a scene chained off a text description reads drifting — a text description drifts over generations, a video reference doesn't; a scene generated at full resolution before its winner is chosen reads wasteful — draft at 720p, upscale winners only.
4. Run generation supervision as one scheduled pass after the rough cut — a QC/re-generation pass, not continuous re-rolling; budget the re-roll effort on ordinary rooms, not spectacle, and carry the compute budget at the documented 5–20× overhead envelope, never the clean-pass number.
5. At picture lock, freeze it: no new generations except emergencies, with notice to color and sound. A scene cut from the film blocks nothing — a killed sequence is a decision, not a defect.

## Worked example

Worked example on the sheet (longform.html): 'The Night Bus' built long across 6 sequences — 5 picture-locked clean, the depot-office sequence in generation supervision — reads 'Hold feature lock' until supervision clears, then 'Feature lock clean'.

## Pitfalls

- Building a feature on prompts alone — drift is cumulative, not linear; by scene three the film is a different cast.
- Chaining a scene off a text description because the previous scene isn't finished — wait for the video anchor or shoot a previz; 'same as before' is an instruction to a model with no 'before'.
- Generating finals at full resolution to 'save time' — the winners-only upscale rule is the difference between a $3,000 and a $30,000 compute bill.
