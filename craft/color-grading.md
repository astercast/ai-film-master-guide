# Color Grading AI Footage

Every AI generation arrives with its own built-in grade — the model's idea of what "cinematic" looks like, baked into the pixels. On a multi-shot production, that's 40 different colorists who never met. The colorist's job on AI footage is **unification**: bringing neighboring shots to one look.

## The two places color lives

**In the plate (before generation).** Lens character, palette direction, texture, time-of-day — baked into the location/character image plates. What you bake, you don't have to fix. The ONEIRIC rule: *the plate itself becomes the lens.*

**In the grade (after generation).** Shot-to-shot matching, the show look, technical delivery. What the plate couldn't hold.

Decide per element which place it lives. Anything the video model keeps dropping belongs in the plate. Anything that needs to move across the whole film belongs in the grade.

## The unification pass

Before any creative grading, unify. Pick one hero shot per scene as the reference. For every other shot:

1. Match exposure and white balance to the reference (scopes, not eyes)
2. Match contrast curve — AI generations vary wildly in black level
3. Match saturation — see the de-plasticize stack below
4. Only then apply the creative look

Do the unification pass over the location set *before* generating where possible (the ADILIADA production did this) — it's cheaper than discovering mismatch in the grade.

## The de-plasticize stack

AI footage has a recognizable syndrome: over-smooth gradients, over-saturated color, waxy skin, a sheen over everything. The fix, in order:

1. **Desaturate 10–20%.** AI oversaturates by default. This one move does half the work.
2. **Add fine film grain.** 35mm grain breaks up the smooth gradients that scream synthetic. Grain is the fastest anti-plastic pass in existence.
3. **Subtle chromatic aberration** at high-contrast edges. Real lenses have flaws; perfect edges read as rendered.
4. **Soften, don't sharpen.** Plastic + sharp = worse. A whisper of diffusion beats any sharpening pass.
5. **Skin last.** Skin is the hardest surface — if it's waxy, a dedicated skin-refinement pass or slight diffusion on skin tones only.

Check the whole stack on a big screen. Defects invisible on a laptop appear at 4K.

## Matching across models

Different models have different "house grades" — Kling's contrast curve isn't Veo's. When a scene mixes models:

- Unify harder: match to the reference before any creative look
- The plate matters more: shared plates across models do more than any grade can
- If two models won't match, re-generate the outlier rather than torturing the grade

## The show look

Once unified, the creative grade. For AI film, restraint wins:

- One look for the film, with scene-level variations — not a new look per scene
- Work in passes: primary (whole image) → secondaries (skin, sky, key objects) → texture (grain, halation, gate weave if period)
- Halation and bloom flatter AI highlights, which tend to clip harshly
- Decide the grain philosophy early: one grain for the film, applied at the end, over everything — it's the final unifier

## Scopes, not eyes

Grade with waveforms and vectorscopes. AI footage lies to eyes — the "cinematic" built-in grade is designed to flatter on first glance. Check:

- Blacks actually reach black (AI loves milky shadows)
- Skin tones sit on the skin-tone line (vectorscope)
- Saturation doesn't clip in any channel

## Delivery

- Festival masters: 16:9 or 21:9 composed (not cropped) for the ratio, up to 4K
- Broadcast-safe levels; -1 dBTP audio ceiling is the sound department's job, but don't crush the picture to compensate
- Keep the pre-grade masters. When the festival asks for a revision, you re-grade — you don't re-generate.

## The grading checklist

- [ ] Look decided per element: plate vs grade
- [ ] Unification pass before creative grading (reference still per scene)
- [ ] De-plasticize stack applied: desat, grain, CA, soften
- [ ] Skin checked on a big screen
- [ ] Multi-model scenes matched or re-generated
- [ ] One show look, scene variations — not a look per scene
- [ ] Scopes verify blacks, skin line, saturation
- [ ] Pre-grade masters archived

## Sources

- ONEIRIC brief: colorist-as-unification, bake-the-look-into-plates (third-party transcription — flagged)
- ADILIADA: pre-generation unification pass over the location set
- Companion: skills `craft-kill-ai-look`, `fix-plasticky-look`, `craft-bake-look`
