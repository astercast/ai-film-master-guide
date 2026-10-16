---
name: craft-video-edit-route
description: Change what a finished clip shows, a colour, a sky, a wardrobe, a season, a removed object, by editing the footage instead of regenerating the shot.
---

# Fix footage with video-to-video editing

## What this gets you

You will be able to rescue a take that is 90 percent right by editing the 10 percent that is wrong, instead of paying to regenerate the whole shot and losing the 90.

## Use when

A generated or filmed clip is right except for one changeable thing: a product colour, a background object, the weather, a wardrobe item, or a style pass over the whole shot.

## Inputs

- The finished clip (2 to 30s for Aleph 2.0; check your model's window)
- The one change, stated in one sentence
- A keyframe still you can edit first

## Procedure

1. Name the single change. Video editing models carry ONE instruction well; a list of five changes is five passes.
2. Edit the keyframe first where the tool allows it (Aleph 2.0 previews the edit as an image): approve the still before spending on the full clip.
3. Run the edit on the shortest section that proves it, and watch the target through occlusions and fast motion, where edits drift.
4. Route by tool: Aleph 2.0 for keyframe-led in-context edits, Wan 2.7 videoedit for prompt-guided edits inside the Wan line, Seedance edit modes when the shot already lives in that pipeline.
5. Compare against the regeneration quote honestly: an edit at 28 credits a second beats a hero re-render only when the base take is truly worth keeping.

## Worked example

A watch commercial's dial colour was wrong in an otherwise perfect orbit shot: one keyframe edit, one Aleph pass, and the shot shipped, where regenerating had already failed three times on the orbit.

## API references

- `data/v1/models.json`

## Pitfalls

- Asking an edit model to fix performance or camera work, it changes surfaces, not acting or blocking; regenerate those.
- Stacking edit passes until the clip melts: two passes is a working ceiling before a re-render is cleaner.
