# Directing Performance in AI Video

AI models don't act. They render plausible arrangements of pixels that read as acting when the direction is specific enough — and collapse into mannequin theater when it isn't. This chapter is the directing discipline behind believable AI performance, drawn from productions that solved it in public.

## The core problem

Passport Rush's team documented it openly: **AI struggles with subtle character acting.** The failure has a shape:

- Faces average toward neutral — micro-expressions collapse into a pleasant blank
- Emotion labels ("she looks devastated") produce stock expressions, not felt ones
- Dead, glassy eyes — the single fastest tell of an undirected AI performance
- The Verge's review of Cully Hill Boys noted "occasionally weak character interactions" as a visible limit even at $2M

The fix is not a better model. It's direction written the way actors need it — as *tasks*, not adjectives.

## Direct, don't describe

ONEIRIC's acting skill (`tig-acting-task`) replaced emotion labels with acting tasks entirely. The closing rule of that production: **direct, don't describe** — scene event, motive, goal, obstacle, tactic.

| Instead of (description) | Write (direction) |
|---|---|
| She looks devastated | She is trying not to cry in front of him — jaw set, eyes on the door |
| He is furious | He is deciding whether to hit him — weight shifting forward, hands opening and closing |
| They are in love | She keeps finding reasons to stand closer; he keeps noticing and not moving away |
| He is nervous | He is rehearsing what to say — lips moving silently, thumb rubbing the ring |

Every entry on the right is a *playable tactic* — something a body can do. Models can't render "devastated." They can render a jaw set and eyes fixed on a door.

## Give the eyes a job

The single highest-leverage performance note in the research: **"dead, glassy eyes are never fixed with lighting — they're fixed by giving the eyes a job."**

The CINEDANCE prompt architecture gives GAZE/EYELINES its own block *before* blocking. In practice:

- Name the eyeline target per beat: *Mara holds on Vex's hands until "the ledger" — then snaps to his eyes*
- Eyes move between targets; they never "look sad into the middle distance"
- Avert, hold, search, track — eye verbs are direction, not decoration
- In dialogue coverage, the listener's eyes do half the acting — cut to the listener

If a performance feels dead, check the eyes first. Nine times out of ten there's no eyeline written.

## One feeling per shot

AI can't play an arc inside a single clip. It can hold one tactic for 4–8 seconds. So:

- Break emotional turns into separate shots — the turn happens *in the cut*
- The reaction shot is your best friend: AI renders listening better than it renders complex feeling
- Moment-to-moment tactics tied to dialogue words (the `tig-acting-task` block form): each line gets its own tactic, each tactic its own shot if needed

## The director's read

Before generating a scene, ONEIRIC's pipeline produced a "director's read": **the one shared event every character lives through, plus each character's physical channel for it.** Everyone in the scene is experiencing the same event — but grief lives in Mara's hands, in Vex's jaw, in the kid's feet. Write the event once, then assign each character their channel. This is what keeps ensemble scenes from becoming four mannequins emoting at the camera.

## Casting the face

Consistent identity *reads* as good acting. A face that drifts 5% between shots reads as a bad performance even when the "acting" is fine:

- Lock the face anchor; never re-run the base portrait
- State changes (dirt, wounds, tears) are masked integrations, not re-generations
- For recurring characters, identity systems (Soul ID and equivalents) beat per-prompt description

The audience forgives a limited performance from a consistent face. It never forgives a great "take" from a stranger.

## Ration the close-up

Micro-acting is the weakest link in every current model. Spend close-ups at emotional peaks — that's where the audience looks hardest and where the model fails most visibly. Wides and mediums carry the rest; they read as confident filmmaking anyway.

## Dialogue performance

- Short lines per generation; native-audio quotes for the delivery, not the face
- Let the voice carry the acting — don't ask the face to do what the voice already does
- The listener's reaction shot sells the line more than the speaker's mouth
- For long scenes: generate silent, isolate vocals, post lip-sync — the performance lives in the edit

## Rehearsal is drafts

Treat 720p drafts as rehearsal takes. Watch for: does the tactic read? Do the eyes have a job? Does the turn land in the cut? Re-direct with changed variables — a new tactic, a new eyeline — never the same prompt hoping. Three failed rehearsals means simplify the shot, not the actor.

## When to go hybrid

Some performances AI can't give you yet. The documented answer: put a real human at the emotional core and let AI handle everything around them.

- **Get Me Out**: a real performer captured the emotion; AI re-skinned the world around her
- **Dreams of Violets**: the director voice-acted every role himself, then AI-converted each character's voice — the performance was human, the timbre was synthetic
- **Cully Hill Boys**: licensed likenesses with expressions and kinematics mapped from the performers' own photos and voice audio — the "acting" was anchored in real performers from the start

Rule of thumb: if the scene's entire job is one human feeling something complicated, that's the scene to shoot for real — or to voice for real — and transform with AI.

## Restraint by default

A whisper out-acts a shout most of the time. AI models default to theatrical — eyebrow raises, forced tears, the full soap-opera register. Strip it:

- **Negative constraints:** tell the model what *not* to do ("no eyebrow raises, no wide-eyed gasps, no tears")
- **Emotional subtext instead of stated emotion:** write the situation that *produces* the feeling, not the feeling
- **Environmental cues:** let weather, light, and objects carry mood so the face doesn't have to
- **Under-direct to unlock expression:** deliberately leave the face under-specified and let the model find expressions itself — over-specified faces go rigid
- **Wider framing reads more real:** a pushed-in over-directed close-up exposes every flaw; ration close-ups (above) and keep them minimal when they must carry the scene

## Two roads to dialogue

Every talking character goes down one of two roads:

- **Road A — native audio:** the model generates picture plus synced dialogue in one pass (Veo 3.1, Seedance 2.0/2.5, Kling 3.0). "TTS optimizes the voice. Native video models optimize the *moment*" — footsteps, room tone, the pause before the sentence, expression and mouth generated as one believable moment.
- **Road B — decoupled:** silent clip + separately produced voice + a dedicated lip-sync pass that reshapes only the mouth (Wav2Lip lineage: audio maps to mouth shapes directly, not via phoneme→viseme tables).

**Rule of thumb:** the moment a client or an exact script is involved, take Road B — you own the exact voiceover, can revise lines without re-rendering picture, and keep a clean stem.

**Model picks for dialogue** (Sept 2026 hands-on comparisons; verify live): quiet natural dialogue → Seedance 2.0; longer complete audiovisual scenes → Seedance 2.5; multi-speaker dialogue, languages, explicit voice control → Kling 3.0; cinematic ambience + AV sync → Veo 3.1. Caveat: more capability ≠ more believable acting — some users find Seedance 2.0's restraint more film-like than 2.5's more "performed" emotion. Choose the model like a casting decision.

**Dialogue prompting that works:**
- Veo: write the line in quotes and attribute it — *"The girl looks up and says, 'It's real.'"* Unattributed dialogue gets dropped or given to the wrong character.
- Kling 3.0: assign lines to characters explicitly, control speaking order and delivery, multiple languages per character.
- Native limits are real: clip caps are short (roughly 8–15 seconds depending on model), so longer dialogue is still an edit; Google's own docs flag that natural consistent spoken audio remains in active development and incoherent speech can occur. Plan for it.

## Direct TTS voices through text

ElevenLabs models (v3/v4) have no emotion selector for most models — you direct delivery *through the text itself*:

- Ellipsis for hesitation, dashes for interruptions, capitalization for stress
- Bracketed stage directions: `[whispering]`, `[laughs]`, `[said angrily in a French accent]`; v4 adds natural-language audio descriptors including environmental cues (`[light rain]`, `[door slams]`)
- Settings that change performance: Stability 0.4–0.6 for expressive dialogue (higher = flatter), similarity boost 0.7–0.8 for clones, style exaggeration 0–0.3 for normal dialogue
- Write **performance arcs, not flat tones**: shift intentions across a script (open serious → build insistent → close warm)
- Test a voice on your actual dialogue before committing it to a main character; regenerate broken lines, not whole scripts

## The dead-eyes checklist

The uncanny valley has biological markers — the specific things AI faces fail. Check for them:

1. **Microsaccades** — real eyes make 1–2 involuntary movements per second; the AI "predator stare" is mathematical stillness
2. **The Duchenne smile** — real joy contracts the eye muscles (eye crinkle); the AI "Pan Am smile" moves the mouth only while eyes stay static, reading as deceptive
3. **Fluctuating asymmetry** — real faces are subtly asymmetric; generative models average toward hyper-symmetrical faces that read as artificial
4. **Pupillary response** — static pupils read as "soul blindness"

Practical read: **teach the machine to be flawed to be accepted** — prompt imperfection (asymmetry, blemishes, irregular blinking) or fix it in post. Perfect symmetry is the tell.

## Hybrid, done honestly

The estate-approved precedent: *As Deep as the Grave* recreated Val Kilmer with estate permission (children Mercedes and Jack), SAG-AFTRA guidelines followed, estate compensated, voice from pre-tracheotomy recordings. And the producer's framing is the transferable practice — he stopped short of calling it a Val Kilmer performance: **"Val Kilmer influenced this performance."** Honest framing for synthetic performance is itself a craft standard.

The cautionary case: a synthetic performer's live interview froze and veered into 20 seconds of Cantonese — three outlets corroborated. Synthetic performance fails in public in ways human performance doesn't. Keep synthetic performers inside edited, controlled contexts.

## Take workflows: rehearsal as a department

The AI take pipeline: **Idea → Generation → Iteration → Selection → Direction → Editing.** If everyone can generate, the filmmaker's most valuable skill is direction.

- **Hero frame first:** generate the perfect still, then animate it — cast the take visually before it performs, separating the identity decision from the performance decision
- **Scene Lock:** once a take is approved, lock the performance and re-render the camera around it — the instruction changes from "generate this scene from over her shoulder" to **"photograph this exact performance from over her shoulder."** The model must stop reinterpreting dialogue, gestures, pauses, props, and positions after approval. This is the closest thing AI directing has to "we got it, moving on"
- **Scheduled regeneration, not continuous re-rolling:** the generation-supervision pass happens at a fixed point after the rough cut (ONEIRIC); version logs record "version, what changed, verdict" (Cully: 137 entries). Iteration is a scheduled department, not a standing reaction
- **Credit discipline:** price every stage with re-roll allowances, hold a credit floor until picture lock; if spend passes plan by ~15% pre-lock, stop and re-plan

## The performance checklist

- [ ] Every emotional beat rewritten as a playable tactic
- [ ] Eyelines named per beat — every pair of eyes has a job
- [ ] One tactic per shot; turns happen in the cut
- [ ] Director's read written: shared event + each character's physical channel
- [ ] Close-ups rationed to emotional peaks
- [ ] Identity locked — no drift between "takes"
- [ ] Dialogue: voice carries, face supports, listener sells
- [ ] Restraint pass: negative constraints, subtext, under-directed faces
- [ ] Dead-eyes check: microsaccades, Duchenne, asymmetry, pupils
- [ ] Drafts reviewed as rehearsals, re-directed with changed variables
- [ ] Scene Lock after approval — photograph the performance, don't regenerate it
- [ ] The emotional core scenes assessed honestly: AI or hybrid?

## Sources

- ONEIRIC production brief: `tig-acting-task` skill, CINEDANCE block order, closing rules (via community transcription of the open-sourced brief — flagged as third-party)
- Passport Rush breakdown: documented subtle-acting problem (official YouTube breakdown)
- Cully Hill Boys: licensed likeness pipeline, expressions/kinematics from performer reference (cryptobriefing.com, archyde.com)
- The Verge on Cully Hill Boys: "occasionally weak character interactions" (via magazine.mindplex.ai summary)
- Seedance prompt skill (petercjl/story-video-studio, GitHub — read live 2026-10-11): acting formula, restraint rule, eye-work
- AI video voice comparison (aibibimbap.com — read live 2026-10-11): model picks for dialogue, Road A/B framing, restraint observations
- VentureBeat on Runway AIFF: Get Me Out pipeline (read live 2026-10-11)
- ElevenLabs direction mechanics (digitaltoolify, techtimes, divineworks, unite.ai — corroborated across sources)
- Uncanny valley essay (Fernando Andrade, Medium, Feb 2026): hyper-symmetry, dead-eyes markers
- Ken Kemp (LinkedIn): Scene Lock method
- Sibghat Shaikh (Medium, Sept 2026): take-based pipeline
- Val Kilmer / As Deep as the Grave (ew.com, darkhorizons.com, screendaily.com): estate-approved synthetic performance
- Companion: `craft/character-consistency.md`, `craft/long-form-pipeline.md`, skills `craft-gaze-eyelines`, `audio-direct-voiceover`
