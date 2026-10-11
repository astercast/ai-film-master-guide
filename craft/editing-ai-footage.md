# Editing AI Footage

Cutting synthetic footage is a different discipline from cutting camera footage. The material lies to you in specific ways, breaks in specific places, and rewards a specific workflow. This chapter is the deep craft behind the `craft/editing-pipeline.md` checklists: selects discipline for generated takes, how to read AI footage, pacing decisions unique to synthetic material, repair techniques in post, and the regenerate-vs-repair decision that controls your budget.

## The selects workflow

Camera editors log footage. AI editors log *generations* — and the generation carries metadata the footage doesn't show.

- **Keep generation receipts.** For every take you keep, record the model, the prompt (or prompt ID from the workshop), seed if the tool exposes one, and generation date. When a shot needs a re-render three weeks later, the receipt is the difference between matching it and starting over. The workshop's saved prompts (`gallery.html`) are a workable receipt system.
- **Name takes like an editor, not a prompter.** `sc03_sh02_v3_keep.mov` beats `kling_dreamy_final_FINAL2.mp4`. Scene, shot, version, verdict. The verdict suffix (`_keep`, `_alt`, `_fix`) is the whole system — at 2am you should be able to read the selects bin without opening anything.
- **Generate 2–4 takes per shot, keep one.** The failure gallery's lesson applies in the bin: the first generation is a draft. Takes 2–4 are where the model settles. Past 4 takes you're usually prompting the wrong thing — go back to the prompt, not the generate button.
- **The selects bin is sacred.** Only keeps enter the edit. Alts live in a separate bin. This sounds bureaucratic until your timeline has 200 clips and you can't remember which face-morph take was "the good one."

## Reading AI footage: the inspection pass

Before a clip earns a place in the timeline, watch it three times with three different eyes:

1. **The story pass.** Does the shot do its job — the action, the framing, the beat? If not, no amount of clean rendering saves it. Kill it now.
2. **The background scan.** Watch everything *except* the subject: hands at frame edges, background faces, text on signs, architecture lines, reflections. AI failures hide in the periphery — the subject gets the model's attention, the background gets its leftovers. This is where three-eyed cyclopses live.
3. **The motion pass.** Watch at half speed. Look for micro-jitter (the tell-tale AI shimmer on still surfaces), morphing (faces and hands drifting between frames), and motion that "swims" — cloth, water, and hair moving without physical cause. Half-speed reveals what full-speed hides.

**The 5-second rule:** any AI clip held longer than ~5 seconds gets inspected frame-by-frame at its start, middle, and end. Long holds are where drift accumulates past the audience's forgiveness threshold.

## Pacing synthetic footage

AI footage cuts differently from camera footage, for one reason: **synthetic motion has no rest state.** A camera shot of a still room is genuinely still; an AI shot of a still room shimmers, breathes, and drifts at the pixel level. The audience feels this as restlessness even when they can't name it.

- **Cut synthetic footage tighter than you think.** The 2–4 second shot is the sweet spot for AI material — long enough to read, short enough that micro-defects don't accumulate. Camera footage can hold 6–8 seconds on a face; AI footage holding that long invites the audience to study the render instead of the performance.
- **Earn your holds.** When you do hold — an emotional beat, a landscape — make sure the shot earned it in the inspection pass. A held AI shot should be your *cleanest* take, not your most convenient one.
- **Vary rhythm deliberately.** The failure mode of AI editing is metronomic cutting: every shot 3 seconds because every generation came out 3 seconds. Re-time clips. Let some breathe, snap others. Monotony reads as "AI-generated" faster than any artifact does.
- **Transitions are confessions.** A dissolve between two AI shots says "I couldn't make these match." Hard cuts are invisible; every effect announces itself. The one exception: match-cut on motion can *hide* a multitude of sins — cutting on a shared movement vector carries the eye past minor inconsistencies.

## Repair in post: the fix-it ladder

Work the ladder bottom-up. Each rung costs more time than the last; stop at the first rung that works.

1. **Cut around it.** The cheapest fix is editorial: trim the morphing frames, cut before the hand enters frame, use the clean 2 seconds and lose the rest. Most AI defects live at clip heads and tails — the model's "warm-up" and "decay" frames.
2. **Re-time it.** Speed ramps hide jitter: a 90% slow-down smooths micro-shimmer; a slight speed-up tightens mushy motion. Optical-flow re-timing is your friend — it interpolates *between* the model's frames, which often look better than the model's own in-betweens.
3. **Stabilize it.** Micro-jitter on "locked" shots responds well to stabilization with minimal smoothing. Don't over-stabilize — the warp artifacts of aggressive stabilization look worse than the jitter.
4. **Composite the fix.** Plasticky wide-shot face? Replace it with a crop from a close-shot frame, tracked on. Warping background element? Patch it with a clean plate from another take. This is standard VFX thinking applied to AI's specific failure modes.
5. **Grain unifies.** A light film-grain overlay across the whole timeline is the cheapest consistency tool in post — it gives every shot, from every model, a shared texture. Do this *after* the edit is locked, on an adjustment layer.
6. **Upscale last.** Finish the edit, lock picture, *then* upscale the final timeline. Never upscale individual clips and re-edit — you'll pay for pixels you cut.

## Regenerate vs repair: the decision

This is the budget decision that separates professionals from hobbyists. The math:

- **Repair wins** when the fix is under ~30 minutes and the defect is local (a few bad frames, one background element, minor jitter). Your time has a cost, but generation has a cost too — and regeneration is a lottery.
- **Regenerate wins** when the defect is structural (wrong action, wrong composition, identity drift through the whole clip) or when you've already spent 30+ minutes repairing. The doctor (`doctor.html`) diagnoses which failures are structural.
- **The two-strike rule:** if a repair attempt fails twice, regenerate. Repair attempts have diminishing returns; the third attempt at fixing a morph almost never works, and you've now spent more than a fresh generation costs.
- **Never repair what you can re-prompt.** A prompt fix (adding the exclusion block, locking the style bible, simplifying the action) compounds across every future generation. A post fix applies once. When the same defect appears in three takes, the problem is upstream.

## Sound-led editing

AI footage is mute until you give it a voice — which makes sound your most powerful editing tool:

- **Cut to the temp score early.** Even a rough music bed gives synthetic footage a pulse to cut against. Editors who cut AI footage silent tend to cut it metronomically.
- **J-cuts and L-cuts are free professionalism.** Letting audio lead or lag the picture cut costs nothing and instantly makes AI footage feel directed rather than assembled.
- **The mute test.** Mute the timeline: the cut should still play. Unmute: nothing should fight the dialogue. If the film only works with music, the edit isn't done.
- **Foley sells the render.** Footsteps, cloth, room tone — the sounds the model never generated are what convince the ear the image is real. The sound chapter (`craft/sound-music-audio.md`) covers the three-layer build.

## Delivery

- **Match the spec exactly.** Resolution, codec, frame rate, file size — festivals and platforms reject on technicalities without watching a frame. The competition-entry craft chapter covers delivery discipline.
- **Watch the export, all of it, on a different screen than you edited on.** Phone if you edited on a monitor, TV if you edited on a laptop. AI artifacts hide at familiar viewing distances.
- **The 24-hour rule.** Lock the cut, sleep, watch fresh. Every flaw you catch now is one the audience won't forgive later.

## Sources & confidence

The selects discipline and naming conventions are standard editorial craft applied to AI's take economics; the 2–4 takes guidance is corroborated across 2026 creator workflows. The inspection pass (background scan, half-speed motion check) synthesizes the failure gallery's documented defects with standard QC practice. Pacing guidance for synthetic footage is editorial judgment grounded in the uncanny-restlessness observation — treat the 2–4 second sweet spot as a starting rule, not a law. The repair ladder and two-strike rule are shop craft; re-timing and stabilization effectiveness varies by tool — test on your footage. The regenerate-vs-repair framework is original to this guide. No single case study is cited because these are cross-cutting practices, not one film's pipeline.
