# Sound, Music & Audio

Sound is half the picture. Amateur AI films are silent or slapped together; finished ones are designed. This chapter is the audio pillar: strategy, voice, music, sound design, and the mix.

## The audio strategy: native vs. designed

Some video models generate audio natively with the clip (Veo 3.1, Seedance 2.0, Kling 3.0). Treat native audio as raw material, never as the mix:

- **Keep it** when it's ambient texture: room tone, wind, rain, crowd murmur, footsteps. Native models generate believable "moments", the pause before a sentence, the room the voice sits in, because picture and sound arrive as one believable event.
- **Strip it** when it's dialogue, music, or anything prominent. Those get built deliberately, on their own tracks, where you control every word and note.
- **Never** let native audio be your only sound layer. It's a bed, not a mix.

The clip caps are short (single-digit to ~15 seconds depending on model), so any dialogue longer than a line or two is an edit anyway. Plan for that from the start.

## Voice design: casting a synthetic voice

A voice is a cast member. Cast it with the same discipline you'd cast an actor:

- **Write a Voice Bible** per character/narrator before generating: register (chest/head), timbre (rough/smooth), tempo (unhurried/clipped), manner (warm, flat, sardonic). Every generation references the same bible, this is what keeps a voice consistent across scenes.
- **Test on your actual dialogue**, not a demo sentence. A voice that sounds great on a demo line can collapse on your character's hardest scene. Test the hardest line first.
- **Generate per paragraph, comp like a session.** Paragraph-level generation gives you edit points; comp the best takes the way a dialogue editor comps a real VO session. Regenerate broken lines, not whole scripts.

### The two roads to a talking character

- **Road A, native:** the model generates picture plus synced dialogue in one pass. Best for short lines, natural delivery, ambient realism.
- **Road B, decoupled:** silent clip + separately produced voice + a dedicated lip-sync pass that reshapes only the mouth. Best the moment a client or an exact script is involved, you own the voiceover, can revise lines without re-rendering picture, and keep a clean stem.

Rule of thumb: if the words must be exact, take Road B. (See the `audio-lip-sync-route` skill for the per-scene decision procedure, and `craft/directing-performance.md` for dialogue performance direction.)

**A documented build.** Robert Gaudette's "A Face Only a Mother Could Love" (8-minute solo short, Runway AIFF 2026 Grand Prix + Reply AI Film Festival 2026 winner) ran a two-pass voice pipeline: dialogue was generated with lip-sync animation integrated into the generation prompts, then redubbed with 11Labs for voice consistency, the mouth performs in pass one, the voice identifies in pass two. The narration was also 11Labs, tuned for tone, rhythm, and the deadpan warmth the script required (the creator's own account; reported, not audited). See the full shot-by-shot teardown ([teardown.html](../teardown.html), "The Character Sheets Came First").

### Directing TTS voices through text

Most TTS models have no emotion selector, you direct delivery through the text itself:

- **Punctuation as direction:** ellipsis for hesitation, capitalization for stress, dashes for interruptions.
- **Bracketed stage directions** on current voice models: `[whispering]`, `[laughs]`, `[said angrily]`, plus environmental cues like `[light rain]` or `[door slams]`.
- **Settings that change performance:** stability around 0.4 to 0.6 for expressive dialogue (higher goes flatter), similarity boost ~0.7 to 0.8 for voice clones, style exaggeration low (0 to 0.3) for normal dialogue.
- **Write performance arcs, not flat tones.** Shift intentions across a script: open serious, build insistent, close warm. A voice that never changes intention sounds synthetic no matter how good the model is.
- **The human-in-the-loop upgrade:** record the acting yourself (even roughly, even on a phone), then AI-convert the voice to the character. The acting survives; the voice matches the cast. This is the highest-quality dialogue pipeline documented in AI film to date.

## AI music: score as a built object

- **Brief per cue, not per film.** Genre, tempo, instrumentation, the cue's emotional job, what to avoid: "ambient synth, 85 BPM, rising tension, no vocals." Generate 3 to 5 variants per cue and comp sections like a real score.
- **Brief by emotional function, not genre.** Gaudette briefed the Suno score for "A Face Only a Mother Could Love" to feel worn-in and melancholic, a consistency strategy disguised as taste: one emotional function, one sonic identity, all the way through, so the score can't change character between scenes (his own account; reported, not audited).
- **Temp-track discipline:** cut to a temp score first, then generate the final score to the locked cut. Never score to a moving target.
- **Keep stems when the tool offers them.** Dialogue ducks under a full stereo mix badly; stems let the mix breathe.
- **No vocals unless the story needs them.** Score serves the story, never shows off.

### The rights gap (read this before you ship)

AI-generated music sits in the murkiest rights territory in the guide. Model terms vary on who owns outputs, training-data provenance is contested, and distributor policies differ. **Keep your generation receipts** (prompts, dates, tool, terms version) and read `legal/rights-and-disclosure.md` before distributing anything with AI music, especially commercially. This is not legal advice; it's the minimum professional hygiene.

## Sound design & foley: the layer that sells reality

Every scene needs three layers:

1. **Bed:** the ambient tone of the location (room, street, forest, wind), runs under everything, never drops to digital silence.
2. **Foley:** footsteps, cloth, object handling, the sounds that make movement feel physical. Performed or layered to picture.
3. **Accents:** designed hits for story beats, the turn, the reveal, the button.

AI SFX tools generate all three from text prompts. Describe sounds the way you describe shots: specifically and physically ("gravel footsteps, slow, approaching" beats "walking sounds"). Build backgrounds first, hard FX second, foley third, and use J/L cuts at transitions so no cut ever goes dry. (See the `audio-sfx-bed` skill for the full layering procedure.)

## The mix: balance, loudness, QC

- **Build order:** dialogue first, then SFX bed, then music last. Music before SFX is the classic amateur mistake, build the world, then score it.
- **Dialogue is king.** If a line matters, it sits on top: carve EQ space for it, duck music under it, never let ambience swallow it.
- **Leave headroom.** Peaks below 0 dBFS, dialogue averaging in a consistent band, nothing slamming the limiter. If you're delivering to a platform, check its loudness spec, don't guess.
- **Listen three ways:** headphones, laptop speakers, a phone. If the dialogue survives the phone, the mix works.
- **The silence test:** mute the music. If the scene still plays on dialogue + SFX alone, the design is sound. If it collapses, the music was doing the acting, fix the scene, not the score.

## The audio checklist

- [ ] Ambient bed under every scene, no digital silence
- [ ] Foley on all physical movement
- [ ] Voice Bible written and referenced for every speaking character
- [ ] Dialogue route chosen per scene (native or decoupled, never mixed mid-scene)
- [ ] Score built cue-by-cue to the locked cut, stems kept
- [ ] Generation receipts saved for all AI music and voices
- [ ] Mix QC: dialogue intelligible on laptop speakers and a phone
- [ ] Legal chapter reviewed before distribution (`legal/rights-and-disclosure.md`)

## Sources & confidence

Voice-direction mechanics (bracketed tags, stability/similarity settings, paragraph-level generation) are corroborated across multiple 2026 creator guides; model-specific tag fidelity is vendor-claimed, verify on your tool's current version. The two-roads dialogue framework and native-audio quality markers come from hands-on editorial comparisons checked against official model docs (Sept 2026). The Gaudette two-pass voice pipeline (in-prompt lip-sync, 11Labs redub) and the worn-in Suno score brief are the creator's own account on the film's escape.ai/YouTube pages, first-hand, self-reported; the tool identity varies across sources (reported, not audited). The AI-music rights gap is documented in this guide's legal chapter. Clip-cap figures change with model updates, verify live before planning around them.
