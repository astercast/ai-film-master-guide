# Cinematic Language

The shot vocabulary and camera grammar that make AI video read as cinema instead of a screensaver.

## Shot sizes, what each one is for

| Shot | Use |
|---|---|
| Extreme wide | World, scale, isolation |
| Wide | Geography, where the story happens |
| Medium | Action and dialogue, the workhorse |
| Close-up | Emotion, decision, detail |
| Extreme close-up | Texture, eyes, objects that matter |

Festival rule of thumb: earn your close-ups. Wide → medium → close builds pressure; starting close spends it.

## Camera movements, the working lexicon

| Move | Prompt phrasing | Good for |
|---|---|---|
| Dolly in / push-in | "camera slowly dollies toward the subject, smooth stabilized movement" | Portraits, reveals, rising tension |
| Dolly out / pull-back | "camera pulls backward, revealing the environment around the subject" | Scale, aftermath, loneliness |
| Pan | "slow camera pan across the scene" | Surveys, transitions between subjects |
| Orbit | "camera orbits around the subject" | Hero moments, product, dance |
| Crane | "camera rises and pulls back, revealing the scene from above" | Endings, scope |
| Handheld | "subtle handheld shake, documentary feel" | Urgency, realism, use sparingly |
| Static | "locked-off static camera" | Dialogue, tension, confidence |

"Slow dolly push-in" beats "zoom in" every time, name the physical move, not the effect.

**Motivated vs unmotivated:** every move must reveal or withhold something. A drifting camera with no purpose is the #1 tell of amateur AI video. If you can't say why the camera moves, lock it off.

## Lighting, write it like a gaffer

Vague lighting gets vague images. Specify direction, quality, and color:

- **Direction:** side light, backlight/rim, top light, underlight
- **Quality:** hard noon sun, soft overcast, flickering torchlight, neon spill
- **Color/temperature:** golden-hour warmth, cold blue night, sodium-orange street
- **Motivation:** every light needs a source in the world, window, lamp, neon sign

Example: "dramatic golden-hour side lighting with long shadows" will always beat "nice lighting."

## Composition

- **Rule of thirds:** place the subject off-center; give the frame somewhere to breathe
- **Depth staging:** foreground, midground, background all doing something, this is what makes AI shots feel expensive
- **Leading lines:** roads, corridors, light beams pulling the eye to the subject
- **Negative space:** emptiness is a compositional choice, isolation, scale, dread
- **Don't overcrowd:** fewer subjects per frame = fewer failure modes

## The "cinematic" recipe

"Cinematic" is not a word you add, it's five things combined:

1. **Camera**, one intentional movement
2. **Subject**, one believable action
3. **Environment**, subtle motion (dust, smoke, cloth, water)
4. **Lighting**, explicit, motivated, consistent
5. **Texture**, film grain, anamorphic cues, shallow depth of field

Example: "Slow cinematic dolly forward toward an ancient temple entrance. Priests walk calmly up stone steps while torch flames flicker. Thin smoke rises into warm evening air. Cloth banners move gently in the breeze. Stable architecture, realistic human motion, dramatic golden-hour lighting."

Note: every movement has a purpose, and the prompt asks for exactly one action per subject.

## Sources
- http://answerbeam.blogspot.com/2026/10/how-to-generate-video-from-image-with.html
- https://github.com/servanter/ai-magic/blob/HEAD/content/blog/best-ai-video-generators-2026-sora-runway-kling-pika-comparison.mdx
- https://medium.com/@gencaycubuk/i-tested-dozens-of-runway-prompts-this-framework-creates-cinematic-ai-videos-every-time-e171658033e1
- https://www.youtube.com/watch?v=z8IaWHEYfpY
