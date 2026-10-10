# Higgsfield Prompt Engineering

## The anatomy of a prompt that works

Treat the prompt as a directing system, not a description. Every generation should specify, in order:

1. **Subject** — who/what, locked identity
2. **Micro-action** — one believable action, not three
3. **Environment** — where, with subtle motion in it
4. **Camera behavior** — one intentional move (see below)
5. **Lighting design** — explicit and physical ("golden-hour side light, long shadows")
6. **Visual style** — cinematic, anamorphic, film grain, era
7. **Emotional tone** — the feeling of the shot
8. **Physics & motion details** — how things move (cloth in breeze, steam rising)
9. **Rendering quality modifiers** — 4K, shallow depth of field, stable architecture

Missing layers = randomness. "Slow dolly push-in" beats "zoom in." Explicit lighting beats "nice lighting."

## Camera phrasing that the models obey

- **Push-in / reveal:** "the camera slowly dollies toward the subject with smooth stabilized movement"
- **Pull-back / scale:** "the camera slowly pulls backward, gradually revealing the enormous environment surrounding the subject"
- **Orbit:** "camera orbits 360° around the subject"
- **Pan:** "slow camera pan across the scene"
- **Stacked moves:** Higgsfield's Cinema Studio supports several moves in one shot — but one motivated move beats two unmotivated ones.

Rule: every movement needs a purpose. Ask what the move reveals or withholds.

## The Soul ID prompting rule

When a Soul ID character is active, **do not re-describe the face or core features** — the Soul ID handles that. Describe only what changes: wardrobe, setting, action, expression, camera, light, style.

Good: "The Soul ID character now wears a formal black suit, standing at a podium addressing a conference room. Camera: dolly in toward her face. Style: cinematic, cool corporate lighting."

## The exclusion block

Always exclude what breaks cinematic output: morphing faces, extra limbs, melting hands, warping architecture, flicker, watermark-like artifacts, text in frame (unless wanted). Put it in every prompt, not just the risky ones.

## Per-shot discipline

- One shot = one fully self-contained prompt. Restate the full premise every time — the model has no memory of your last clip.
- Don't ask for too many actions in five seconds. One action per clip.
- Keep the frame uncrowded. Fewer subjects = fewer failure modes.
- Image-to-video (start frame first) beats text-to-video for control. Generate the still, approve it, then animate.

## Common failure modes and fixes

| Failure | Fix |
|---|---|
| Face morphs mid-shot | Shorter clip; Soul ID or reference image; re-generate from a locked start frame |
| Melting hands | Keep hands out of frame or still; exclude "deformed hands"; crop in post |
| Camera drift (unmotivated) | Pin an end frame; name one explicit camera move; shorten duration |
| Identity drift across shots | Soul ID; same seed discipline; approved-frame library as start frames |
| Flicker / texture boil | Regenerate; avoid overly busy backgrounds; stabilize in post |
| Plasticky faces in wide shots | Shoot closer; composite a close-shot face in post |

## Sources
- https://higgsfield.ai/creator-hub/help-center/ai-models/how-do-i-create-and-use-a-soul-id-character
- https://github.com/ianfr13/higgsfield-ai-prompt-skill/blob/HEAD/mnt/user-data/outputs/higgsfield/skills/higgsfield-soul/SKILL.md
- https://github.com/servanter/ai-magic/blob/HEAD/content/blog/best-ai-video-generators-2026-sora-runway-kling-pika-comparison.mdx
- https://medium.com/@gencaycubuk/i-tested-dozens-of-runway-prompts-this-framework-creates-cinematic-ai-videos-every-time-e171658033e1
- http://answerbeam.blogspot.com/2026/10/how-to-generate-video-from-image-with.html
