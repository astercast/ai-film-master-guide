# Character Consistency

The technical discipline of keeping people and worlds stable across shots. This is where most festival entries die.

## The identity stack (ranked by reliability)

1. **Trained identity (Soul ID):** the gold standard. Train once on 20–80 photos; the face holds across every generation. See `higgsfield/soul-id-deep-dive.md`.
2. **Character sheet as reference:** front / 3/4 / side views of the character, used as the reference image whenever drift appears.
3. **Per-generation reference upload:** anchors one generation; drifts across many. Fine for single shots, not films.
4. **Text description alone:** weakest. Never rely on prose to hold a face across 50 shots.

## Wardrobe and props lock

- Write the wardrobe once, in exact language, and paste it verbatim into every prompt: "worn brown leather jacket, white t-shirt, dark jeans, scuffed boots."
- Props get the same treatment: one description, reused exactly.
- If the wardrobe changes mid-film (it should, for story), that's a new locked description — never improvise it per shot.

## World consistency

- **Locations:** generate and approve a master still of each location first. Every shot in that location starts from it or references it.
- **Lighting continuity:** lock time of day and light direction per scene. "Golden-hour side light from frame left" in every prompt of the scene.
- **Era/grade:** pick the era and color palette up front (Higgsfield's era selection helps); don't grade shot-by-shot and hope.

## The chaining discipline

- **Last-frame chaining:** every clip starts from the last frame of the previous approved clip. Never fabricate a start frame.
- **Approved-frame library:** keep every approved still/frame. New shots start from library frames, not fresh generations.
- **Rejection rules:** a clip fails if the face drifts, wardrobe changes, the light flips, or the camera moves without motivation. Failed clips don't chain — they get re-prompted.
- **One human per start frame** (for character-led work): crowded frames multiply failure modes.

## The consistency checklist (before any generation)

- [ ] Identity system chosen and trained (Soul ID for films)
- [ ] Wardrobe description locked, verbatim
- [ ] Location master stills approved
- [ ] Light direction + time of day locked per scene
- [ ] Start frame is real (approved frame or trained identity), never invented
