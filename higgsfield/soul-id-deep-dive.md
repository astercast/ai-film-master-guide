# Soul ID Deep Dive

## What it is

Soul ID is Higgsfield's character-consistency layer: train it once on photos of one person and the same face appears across every generation — any style, pose, lighting, or angle. It's the equivalent of casting the same actor for the entire film.

A reference image anchors a single generation but drifts across many. Soul ID trains a reusable identity once and holds it.

## How to train (official requirements)

From Higgsfield's help center:

1. Open higgsfield.ai → **Soul** → **Train new character**
2. **Prepare photos:** 20 or more of the same person (up to 80 supported)
   - High-quality and well-lit
   - Face from different angles and expressions
   - No sunglasses, no heavy shadows, no cropped faces
   - Include at least one full-height photo
   - Recent photos for the most accurate likeness
   - Only your own face or someone who gave permission
3. Upload and start training — takes a few minutes
4. Name the character
5. Generate — select it in the **Character** tab

## Using it in production

- **Soul ID locks identity; everything else follows your prompt.** Wardrobe, setting, action, camera, light — all prompt-driven.
- **Prompting rule:** never re-describe the face. Describe only what changes from the base character.
- **Works across the Soul family** (Soul 2.0, Soul Cinema, Cinema Studio, Marketing Studio, supported video models).
- **Caveat:** Soul IDs are tied to the model they were trained in — a character trained in Soul 2.0 may need retraining for Soul Cinema. Verify before a big shoot.

## When to use it / when to skip it

Use: multi-shot sequences, short films with a recurring protagonist, series content, AI influencers, brand mascots, action sequences needing the same hero.

Skip: single one-off shots (overkill), or when you want maximum creative variation — consistency limits style range.

## Identity drift: causes and fixes

- **Drift across many generations:** re-anchor with the trained Soul ID selected; don't fall back to per-generation reference uploads.
- **Wide-shot face collapse:** faces go plasticky at distance — shoot closer, or composite a close-shot face in post.
- **Feature drift:** keep a character sheet (front, 3/4, side reference) and use it as the reference image when drift appears.
- **Never fabricate identity frames.** The trained Soul ID is the identity authority — every clip's face must trace back to it, never to an invented start frame.

## Sources
- https://higgsfield.ai/creator-hub/help-center/ai-models/how-do-i-create-and-use-a-soul-id-character
- https://www.thehypemagazine.com/2026/10/09/what-is-higgsfield-ai-uses-features-pricing/
- https://github.com/ianfr13/higgsfield-ai-prompt-skill/blob/HEAD/mnt/user-data/outputs/higgsfield/skills/higgsfield-soul/SKILL.md
- https://github.com/mahshid1378/owner-avatar-higgsfield-ai-prompt-skill/blob/HEAD/skills/higgsfield-soul/SKILL.md
