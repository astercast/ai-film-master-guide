# The Failure Gallery

This is the most trustworthy chapter in the guide. Every failure below is documented — what broke, why it broke, and the fix that works. Nobody in this niche shows their failures. We do, because the fix is the lesson.

## Failure 1: The subtle-acting collapse

**What broke:** Passport Rush's team documented it openly — AI cannot do subtle character acting. Faces average toward neutral, micro-expressions collapse into a pleasant blank, and emotion labels ("she looks devastated") produce stock expressions instead of felt ones. The audience reads the result as mannequin theater.

**The fix:** Stop describing feelings; direct playable tactics. "She looks devastated" becomes "she is trying not to cry in front of him — jaw set, eyes on the door." Models can't render "devastated." They can render a jaw set and eyes fixed on a door. One tactic per shot; the turn happens in the cut.

**Source:** Passport Rush production breakdown (official team documentation); corroborated by ONEIRIC's `tig-acting-task` rule — direct, don't describe.

## Failure 2: The live synthetic-performer glitch

**What broke:** Tilly Norwood — a synthetic performer with ~2,000 character versions developed to "teach her to act" — appeared on Piers Morgan Uncensored. Asked whether her co-stars were real, she froze, then spoke Cantonese for ~20 seconds. Three outlets corroborated. The LA Times argued the visible limitations showed synthetic performers' distance from replacing skilled actors.

**The fix:** Keep synthetic performers inside edited, controlled contexts. Live, unscripted, adversarial settings (interviews, Q&A) expose failure modes no rehearsal catches. If your production needs a synthetic presence, script it, cut it, and never let it improvise in public.

**Source:** kotaku.com, soapcentral.com, filmoria.co.uk (three-outlet corroboration); oliverwillis.com (LA Times assessment via index).

## Failure 3: The three-eyed cyclopses

**What broke:** A hyped contest winner was panned for three-eyed cyclopses, size-shifting characters, and feet-for-hands. Press called it a showcase of AI filmmaking's current limits. The prize and the hype did not forgive broken continuity.

**The fix:** Consistency is the floor, not the ceiling. No concept, no jury goodwill, no prize money survives visible morphing. Run the entry-killer audit before anything ships: no morphing faces, no extra limbs, no shifting wardrobe across cuts. Polish is the entry ticket; everything else is built on top of it.

**Source:** press coverage of the Grok "Odyssey" contest outcome; companion analysis in `case-studies/competition-teardowns.md`.

## Failure 4: Flat acting at $2M

**What broke:** *The Cully Hill Boys* — a $2M AI feature with licensed celebrity likenesses, expressions and kinematics mapped from the performers' own photos and voice audio — still got flagged for "flat, mis-prompted acting" as its weak spot. The Verge's review noted "occasionally weak character interactions." Money and licensed likeness did not buy performance.

**The fix:** Direction is the fix at every budget. Licensed likeness gives you a consistent face; it does not give you acting. The same discipline applies: tactics not emotions, eyelines per beat, restraint by default, the listener's reaction shot selling the line. If the scene's entire job is one human feeling something complicated, shoot or voice it for real and transform with AI — the hybrid answer scales from shorts to features.

**Source:** The Verge review of *The Cully Hill Boys* (via magazine.mindplex.ai summary); Semafor's review (flat acting note); production pipeline via archyde.com / webpronews.com.

## Failure 5: Dead, glassy eyes

**What broke:** The single fastest tell of an undirected AI performance. ONEIRIC's production rule, stated as a law: dead, glassy eyes are never fixed with lighting — they're fixed by giving the eyes a job.

**The fix:** Name the eyeline target per beat. Eyes move between targets; they never "look sad into the middle distance." Avert, hold, search, track — eye verbs are direction, not decoration. In dialogue coverage, the listener's eyes do half the acting — cut to the listener. The deeper checklist: microsaccades (1–2 involuntary eye movements per second), the Duchenne smile (real joy crinkles the eyes; the mouth-only "Pan Am smile" reads as deceptive), natural asymmetry (hyper-symmetrical faces read as averaged and artificial), pupillary response (static pupils read as soul blindness). Teach the machine to be flawed to be accepted.

**Source:** ONEIRIC production brief (`tig-acting-task`, CINEDANCE block order); uncanny-valley research (Fernando Andrade, Medium, Feb 2026 — biological aliveness markers).

## The pattern

Every failure here has the same shape: someone trusted the model to do the directing. The model renders; the director directs. Write the visible, not the feeling. Give the eyes a job. Hold one tactic per shot. Audit before you ship. Keep synthetic performers where editing can save them.

## Sources

- Passport Rush team breakdown (subtle-acting documentation)
- ONEIRIC production brief (tactics rule, dead-eyes rule)
- Tilly Norwood / Piers Morgan Uncensored (kotaku.com, soapcentral.com, filmoria.co.uk)
- Grok "Odyssey" contest press coverage (consistency failure)
- The Verge / Semafor on *The Cully Hill Boys* (flat acting at $2M)
- Uncanny-valley aliveness markers (Fernando Andrade, Medium, Feb 2026)
- Companion: `craft/directing-performance.md`, `case-studies/competition-teardowns.md`
