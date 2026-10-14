# Entry Craft Teardowns: How the Winning Films Were Actually Made

The companion chapter lists *what placed and why*. This one is the *how*, the production techniques behind judged entries, broken into steps you can copy. Every teardown follows the same shape: **the technique**, **the craft principle**, **copy it** (actionable steps), and the **budget/time footprint** where it's documented.

## 1. The async remote workflow, "GRANDMA vs WASP" ($150K, Higgsfield Action Contest)

**The technique.** Directors Muhannad Nassar and Simon Meyer never met in person. They built the film async across time zones inside Higgsfield's Cinema Studio, one shared project where generations, prompts, and assets were all visible to both collaborators. No studio, no set, no shoot days; the "set" was a shared generation window.

**The craft principle.** Judges (Jason Zada, Buralqy, Jama Jurabaev) said they prioritized storytelling and directorial intent over technical polish, in a field of 8,752 submissions from 139 countries. The remote workflow won because the *directing* was centralized even though the *labor* was distributed: one vision, two executors, zero drift between them.

**Copy it.**
- Write a one-page director's intent doc before generating anything: logline, tone references, the single emotion each act must land.
- Work in a shared project, not DMs, every prompt, generation, and select lives where your collaborator can see and fork it.
- Split by discipline, not by scene: one person owns performance/character, the other owns camera/action. Review each other's selects daily.
- Lock a style bible on day one (one style line, aspect ratio, grain/grade, lens language) so two people can't drift apart.

**Footprint.** Two people, zero travel, consumer AI subscriptions. The budget went to time, not gear.

## 2. The five-day sprint, "SCRATCH" ($50K, Higgsfield Action Contest)

**The technique.** Director/musician Ash Gevorkyan + 3D/VFX generalist Aram Gevorkyan made a trailer-grade action short in five days. Audiences mistook it for a studio-backed theatrical trailer. The weapon was trailer form: sound, cutting, and pacing doing the heavy lifting while the imagery stayed in short, high-energy bursts that never linger long enough to break.

**The craft principle.** Fluency beats time. Five days of fluent execution beats five weeks of hesitant prompting, because the duo already knew their tools cold, every generation was a deliberate choice, not an experiment.

**Copy it.**
- Cut a trailer, not a short: 60 to 90 seconds, three acts (hook / escalation / title card), music-driven pacing.
- Keep shots short (2 to 4 seconds). Short shots hide consistency breaks; long takes expose them.
- Build the sound design first or in parallel, trailer percussion, risers, and hard-hitting SFX sell "studio" more than any pixel does.
- Budget generations per shot: 3 to 5 variations for hero shots, 1 to 2 for connective tissue. Decide selects fast.

**Footprint.** Five days, two specialists, deep tool fluency. The most replicable winning formula in this chapter.

## 3. The hybrid pipeline, "Passport Rush" and "Get Me Out"

**The technique.** "Passport Rush" combined hand-drawn storyboards + Blender previz + AI animation, publishing every prompt and asset. "Get Me Out" (Runway AIFF 2024 Grand Prix) captured a real 3D environment in Luma, shot a real performer, then used Runway video-to-video and ComfyUI to rotoscope and re-skin him as a blood-red muscle figure.

**The craft principle.** Shoot the emotion for real; use AI only for what the budget couldn't do otherwise. Both films put a human performance or human draftsmanship at the center and used AI as the *impossible* layer, never the *entire* layer. Jurors (working artists, in Antebi's case) resonated with the storytelling, not the tool cleverness.

**Copy it.**
- Board on paper or in Blender first. If the story doesn't work as boards, it won't work as generations.
- Capture or shoot anything with a human body in it for real, even a phone previz gives the AI motion something truthful to hold onto.
- Use video-to-video / motion transfer for transformation, not text-to-video for invention. Transforming real motion beats inventing motion.
- Keep one "truth anchor" per scene (a real plate, a real performance, a real drawing) and let AI handle the other 80%.

**Footprint.** "Get Me Out" was a solo-plus-tools production; "Passport Rush" published its full pipeline as a teaching resource. Both prove hybrid beats pure-generation for emotional weight.

## 4. The authored-style strategy, "Le Drip," "The Tale of the Peony," "The Child of the Sea"

**The technique.** "Le Drip" (Reply AIFF 2026 2nd) rendered a fish's final day as living oil paintings, dense textured brushstrokes in motion. "The Tale of the Peony" (MEGA 2026 Best AI Short) used AI keyframe animation + rice-paper texture + manual keyframe refinement. "The Child of the Sea" built a tactile stop-motion universe.

**The craft principle.** A strong, committed art style is a *consistency strategy*. Painterly motion, rice-paper grain, and stop-motion stepping all hide the seams that photorealism exposes. Judges reward authored intent: pick a lane and commit so hard the style becomes the film's identity.

**Copy it.**
- Choose your style for what it *forgives*, not just what it looks like. Ask: "what breaks when this style drifts 5%?" If the answer is "nothing visible," it's a good judged-category style.
- Lock the style in one sentence and put it verbatim in every prompt ([STYLE] block discipline).
- Add the texture in a separate pass: film grain, paper texture, brushstroke overlays in post unify generations from different models.
- For stylized work, use the animated prompt register, no lens or DOF language (see `prompt-engineering.md`).

**Footprint.** Style commitment costs nothing in credits and buys the most consistency per dollar of any technique here.

## 5. The photoreal character piece, "A Face Only a Mother Could Love" (Runway AIFF 2026 Grand Prix + Reply AIFF 2026)

**The technique.** Robert Gaudette started with an old screenplay, a real script about Marcel, a solitary Parisian dancer, and chose Grok, Nano Banana, and Seedance as, in his words, the only viable way to film it without budget, cast, or crew. Tight shots established point of view in a way reviewers don't associate with AI imagery.

**The craft principle.** A real screenplay beats a prompt. Character-first photorealism with locked POV is now a proven winning lane: intimacy and perspective discipline make AI imagery read as *cinema* instead of *demo*.

**Copy it.**
- Write (or adapt) a real script first, dialogue, beats, turns. If it works on the page, the AI only has to execute.
- Hold one POV ruthlessly. Every shot should answer "whose eyes are we in?" before "what does it look like?"
- Favor tight shots over wides for character pieces: close-ups carry performance; wides expose geometry the models can't hold.
- Cast the models to the job: photoreal portrait models for faces, motion-strong models for body movement, don't ask one model to do both.

**Footprint.** One filmmaker, a screenplay, three models. Proof that writing is the cheapest VFX.

## 6. The long-form discipline, "Oneiric" (20 min) and "Total Pixel Space" (9:28, Runway AIFF 2025 Grand Prix)

**The technique.** "Oneiric" ran a 20-minute drama through Cinema Studio with open-sourced everything: every Seedance asset and prompt, Claude skills for scripting/acting/prompting, a color-coded Diagram Skill frame map tracking every shot, and a consistent-lens-look trick for visual unity. (Correction: earlier versions of this guide repeated a "Cannes premiere" claim for Oneiric, dedicated research found no source for it. It was made for Higgsfield's own film festival; the Cannes-adjacent screening was *Hell Grind's*, a third-party industry showcase, not an official selection.) "Total Pixel Space" spent over a year in production generating tens of thousands of images for a 9-minute essay film.

**The craft principle.** Long-form AI filmmaking is *asset management*, not prompting. The winners built production systems, frame maps, skill libraries, lens-look rules, that let hundreds of generations cohere. Time in pre-production and systems pays back exponentially at 10+ minutes.

**Copy it.**
- Build a frame map before generating: every shot on a timeline with its lens, lighting, and character state, color-coded by status.
- Separate identity from motion in every prompt (Identity Block vs Motion Block), at feature length, this is the difference between a cast and a crowd of strangers.
- Validate at 720p, upscale only winners. At long-form scale, rendering everything at max quality first is how budgets die.
- Re-anchor references every few generations, don't wait for drift to become visible.
- Use J/L cuts and a shared ambience bed to mask transitions; sound covers a multitude of visual sins.

**Footprint.** "Oneiric" was a small team with systems; "Total Pixel Space" was a year of iteration. Both show that long-form is a marathon budgeted in *organization*, not just credits. (Full long-form pipelines get their own chapter in `craft/longform-pipelines.md`.)

## 7. The floor, what kills entries

The cautionary case: a hyped contest winner had three-eyed cyclopses, size-shifting characters, and feet-for-hands. Press called it a showcase of AI filmmaking's current limits. **No hype forgives broken continuity.** Across every festival in the companion chapter, judges punish the same things: visible morphing, generic AI slop, tech demos without narrative, and AI that pulls focus from the story.

**Copy it (in reverse).** Before submitting, run the entry-killer audit:
- [ ] No morphing faces, extra limbs, or shifting wardrobe across cuts
- [ ] No shot exists just to show off a model, every shot serves the story
- [ ] Sound designed like a film (custom music, voice, layered foley), not a slideshow
- [ ] One committed POV or style held across the entire runtime
- [ ] A human edit: pacing, turns, and a button image, not a prompt sequence

## Build your entry like a winner, assembly order

1. **Script first.** A real story with a turn. (Teardowns 5, 6)
2. **Pick your consistency strategy.** Authored style, hybrid truth-anchor, or photoreal POV discipline, choose for what it forgives. (Teardowns 3, 4, 5)
3. **Lock the style bible.** One style line, verbatim, in every prompt. (Teardowns 1, 4)
4. **Board or previz.** Paper, Blender, or phone footage, prove the story before spending credits. (Teardown 3)
5. **Generate in the right order.** Keyframes → motion → selects; 720p drafts, upscale winners only. (Teardown 6)
6. **Cut like a trailer editor.** Short shots, music-driven pacing, J/L cuts. (Teardown 2)
7. **Sound is half the film.** Custom music, real or AI voices with rights, layered foley, ambience bed. (Teardowns 2, 6)
8. **Run the entry-killer audit.** Zero morphing, zero demo shots, committed POV throughout. (Teardown 7)

## Sources

- Companion chapter: `case-studies/competition-teardowns.md` (judged-work teardowns + sources)
- Higgsfield film festival rules (production constraints): https://higgsfield.ai/blog/higgsfield-global-film-festival
- Open-source reference projects: Hell Grind, Zephyr, Cully Hill Boys (via festival blog)
- "Oneiric" production notes: Mashrabov LinkedIn frame-map writeup (via mega-research report)
- "Passport Rush" hybrid pipeline: completeaitraining (via mega-research report)
- Craft chapters: `craft/story-structure.md`, `craft/character-consistency.md`, `craft/sound-music-audio.md`, `craft/editing-pipeline.md`, `craft/cinematic-language.md`
- Full research: `~/workspace/research_notes/ai-film-mega-research-20261010-0311/report.md`, `~/workspace/research_notes/festival-winners-20261010-0303/report.md`
