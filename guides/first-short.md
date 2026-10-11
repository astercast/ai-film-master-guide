# Your First 60-Second Short: A 7-Day Plan

One finished minute. That's the goal — not a masterpiece, a *finished* film. Sixty seconds forces every discipline in this guide into one small, shippable object: story, prompting, generation, selects, sound, grade, export. Follow the days in order. Each day links the exact chapters, skills, and tools to use, and ends with a checkpoint: don't move on until it passes.

**Rules for the week:** one character, one location, no dialogue longer than two short lines (write around talking — visual storytelling wins at this length). Budget: one cheap draft model for days 2–3, your best model only for final hero shots. Track spend in the budget calculator as you go.

## Day 1 — Concept lock

**Do:** write one logline (protagonist + want + obstacle, one sentence), then a 6-beat outline: setup, turn 1, turn 2, midpoint image, turn 3, button. Pick your one location and describe it in three sensory sentences — this description becomes your style anchor for the whole week.

**Use:** `craft/story-structure.md` (beats), the prompt workshop's logline template (`workshop.html`).

**Checkpoint:** you can pitch the film in 20 seconds without notes. If you can't, the concept isn't locked — simplify until you can.

## Day 2 — Prompt workshop session

**Do:** generate your hero frame first — the single perfect still of your character in your location. Lock identity before anything moves (this is the take-casting decision). Then write one full prompt per shot (8–12 shots for 60 seconds) using the nine-layer anatomy: subject, action with tactics, setting, light, camera, lens behavior, texture, negative constraints, audio note.

**Use:** `higgsfield/prompt-engineering.md`, `workshop.html` (save your prompts — you'll iterate on them), the `audio-lip-sync-route` skill if you have any dialogue at all.

**Checkpoint:** every prompt has an exclusion block ("no morphing faces, no extra fingers, no text"). No exclusions, no generation.

## Day 3 — Generation batches

**Do:** generate in cheap drafts first. Batch each shot 3–5 takes on your draft model, then pick selects — don't direct yet, just collect. Price the day before you start (credit math × takes) and hold a credit floor: if spend passes plan by ~15%, stop and re-plan.

**Use:** `platforms/when-to-use-what.md` (or the quiz: `quiz.html`), `economics/credit-math.md`, `budget.html`.

**Checkpoint:** you have selects for every shot — imperfect, but every story beat exists on screen. Gaps get re-prompted tomorrow, not tonight.

## Day 4 — Selects & assembly

**Do:** cut the radio edit — selects in story order, no polish. This is where the film either works or doesn't, and it's cheaper to discover now. If a character drifts between shots, fix it with the consistency tools (reference frames, re-generated hero angles) rather than accepting it. Once a take is approved, lock it: re-render the camera around the performance, never the performance around the camera.

**Use:** `craft/editing-pipeline.md`, `craft/character-consistency.md`, `craft/directing-performance.md` (the Scene Lock rule).

**Checkpoint:** the cut plays start to finish and the story reads with the sound off. If it doesn't read silent, no amount of sound will save it.

## Day 5 — Performance fixes

**Do:** watch like a director, not a generator. For each shot that feels dead: first try restraint (strip adjectives, give the eyes a job, widen the frame), then try one targeted re-generation, then — if it still fails — cut around it. Read the failure gallery before you re-roll anything: most "bad generations" are direction problems with known fixes.

**Use:** `craft/directing-performance.md`, `craft/failure-gallery.md`, the shot teardown viewer (`teardown.html`) for reference.

**Checkpoint:** no shot embarrasses you. "Good enough" is a finishable standard; "perfect" is how films die at 80%.

## Day 6 — Sound

**Do:** build the full audio pass in order: ambient bed under every scene, foley on movement, voice/dialogue on its own track (Road A or B — chosen per scene, never mixed mid-scene), score built cue-by-cue to the locked cut, then the mix (dialogue on top, headroom left, phone-speaker test). Save generation receipts for every AI voice and music cue.

**Use:** `craft/sound-music-audio.md`, the `audio-sfx-bed`, `audio-direct-voiceover`, and `audio-final-mix` skills, the audio checklist at the end of the chapter.

**Checkpoint:** mute the music — the film still plays. Unmute — nothing fights the dialogue.

## Day 7 — Grade, mix QC, export

**Do:** apply one consistent grade across all shots (a single LUT or node tree, adjusted per shot — never a different look per shot). Run the mix QC: three listening environments, loudness sane, no clipping. Export to your delivery spec, watch the export all the way through on a different screen than you edited on, then ship it — upload, submit, or screen it for one human.

**Use:** `craft/color-grading.md`, `distribution/release-paths.md` (delivery specs), `legal/rights-and-disclosure.md` (before anything public — disclosure and rights, not legal advice).

**Checkpoint:** a stranger can watch it end-to-end without you explaining anything. That's a finished film. Everything after this is your second one.

## After the week

Do a 20-minute post-mortem while it's fresh: what broke, what the fix was, what you'd prompt differently. Write it down — that's the seed of your personal playbook, and it's worth more than any tutorial. Then start film two: the same 7 days, twice as fast.
