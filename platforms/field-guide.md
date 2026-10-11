# AI Video Platform Field Guide

Every major platform, honestly assessed. Strengths, weaknesses, costs, and what each is actually best at.

## The field

| Platform | Signature strength | Weakness | Cost signal | Best for |
|---|---|---|---|---|
| **Higgsfield** | All-in-one: many engines, Soul ID, Cinema Studio presets, camera moves | Preset UI hides raw controls; shared credit pool obscures per-model price | Basic 120 / Pro 600 / Max 1,800 credits/mo; tiers Free–Premium (10+ credits) | Filmmaking workflow, character-led series |
| **Kling** (direct) | Photoreal physics (water, fire, smoke); end-frame pinning; multi-reference `elements` | Prompt engineering required, no hand-holding | ~0.6 units/sec 720p standard (~$0.084/sec); 0.8 pro; 3.0 native 4K | Hero shots when you want raw control |
| **Runway** (Gen-3/Gen-4) | Reference-image start + Motion Brush for exact motion control; human-centric scenes | Weaker without a strong start image | Paid tiers, full commercial rights | Ads, human scenes, precise motion |
| **Sora** (discontinued Mar 2026) | — | — | — | Migrate to Kling 3.0 or Veo 3.1 |
| **Luma Dream Machine** | Cinematic experimentation, smooth motion | Consistency weaker than leaders | Varies | Dreamlike / experimental passages |
| **Pika** | Lip-sync, character animation, playful effects; most permissive creatively | Less "cinematic" out of the box | Subscription | Dialogue, social, stylized work |
| **Hailuo / MiniMax** | VFX and fluid motion | Prompt nuance | Mid tier | Action, fluid dynamics |
| **Veo** | Nature/landscapes, reference-image fidelity, long coherent passages | Premium cost | Premium tier | Landscapes, documentary feel |
| **Wan** | Artistic / stylized video | Less photoreal | Mid tier | Stylized sequences |
| **Seedance** | Fast iteration speed | Top-end polish trails Kling | Mid tier | Drafting, volume work |

## Platform-specific prompting notes

- **Sora (discontinued Mar 2026):** historical note only — prompts-as-mini-screenplays worked for vast scenes; migrate that thinking to Kling 3.0 or Veo 3.1.
- **Runway:** start with a strong reference image, then Motion Brush for movement. More predictable than text-only.
- **Kling:** keep prompts concise and direct; elaborate prose underperforms. Use motion templates.
- **Pika:** stack creative effects; for lip-sync feed clean audio with minimal background noise.

## Ownership and rights (verify before commercial use)

- Runway: full commercial rights on paid tiers.
- Kling: commercial rights on Pro and above.
- Pika: full ownership on paid tiers; free tier restricts commercial use.

## The honest take

No single platform wins every shot. Festival-grade films are hybrid: pick the engine per shot, match color in post, and nobody will know. See `when-to-use-what.md`.

## Sources
- https://github.com/servanter/ai-magic/blob/HEAD/content/blog/best-ai-video-generators-2026-sora-runway-kling-pika-comparison.mdx
- https://www.meltflexai.com/blog/higgsfield-alternatives
- https://dyerbolical.com/mastering-ai-video-generation-in-2026-runway-pika-and-kling-for-professional-ads/
- https://github.com/ivan-meer/higgsfield-ai-prompt-skill/blob/HEAD/skills/higgsfield-models/SKILL.md
