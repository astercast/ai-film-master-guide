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

## The performance checklist

- [ ] Every emotional beat rewritten as a playable tactic
- [ ] Eyelines named per beat — every pair of eyes has a job
- [ ] One tactic per shot; turns happen in the cut
- [ ] Director's read written: shared event + each character's physical channel
- [ ] Close-ups rationed to emotional peaks
- [ ] Identity locked — no drift between "takes"
- [ ] Dialogue: voice carries, face supports, listener sells
- [ ] Drafts reviewed as rehearsals, re-directed with changed variables
- [ ] The emotional core scenes assessed honestly: AI or hybrid?

## Sources

- ONEIRIC production brief: `tig-acting-task` skill, CINEDANCE block order, closing rules (via community transcription of the open-sourced brief — flagged as third-party)
- Passport Rush breakdown: documented subtle-acting problem (official YouTube breakdown)
- Cully Hill Boys: licensed likeness pipeline, expressions/kinematics from performer reference (cryptobriefing.com, archyde.com)
- The Verge on Cully Hill Boys: "occasionally weak character interactions" (via magazine.mindplex.ai summary)
- Companion: `craft/character-consistency.md`, `craft/long-form-pipeline.md`, skills `craft-gaze-eyelines`, `audio-direct-voiceover`
