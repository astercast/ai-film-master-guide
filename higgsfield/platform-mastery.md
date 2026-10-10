# Higgsfield Platform Mastery

## The model roster (what to use when)

Higgsfield is model-agnostic — it hosts many engines under one credit pool. Third-party model guides rank them this way (tiers: Free / Low 0.1–2 credits / Mid 2–10 / Premium 10+):

| Need | Model | Tier |
|---|---|---|
| Top-tier cinematic video + native audio | Kling 3.0 | Premium |
| Epic scale / spectacle | Sora 2 | Premium |
| Nature / landscapes + reference images | Veo 3.1 | Premium |
| Artistic / stylized video | Wan 2.6 | Mid |
| Fast iteration | Seedance 2.0 Pro | Mid |
| VFX / fluid motion | Minimax Hailuo 2.3 | Mid |
| Budget-friendly video | Kling 2.5 Turbo / Higgsfield DoP Lite | Free–Low |

Image side: Soul 2.0 (fashion/aesthetic, free), Soul Cinema (cinematic stills with film grain and era-aware styling), Nano Banana Pro (photorealistic, low cost), Soul Cast (AI actor generation).

**Key insight:** a clip made through Higgsfield on the Kling engine is a Kling clip — what differs is how you buy it (shared credit pool) and what you can steer (presets vs raw prompt control). Going to Kling directly exposes controls Higgsfield's preset UI hides: end-frame pinning, multi-reference `elements`, multi-prompt shots, 3–15s durations.

## Cinema Studio — the filmmaking layer

Cinema Studio is Higgsfield's director-mode workspace:

- **Camera movement controls:** static, handheld, zoom, pan, dolly, orbit and more — several moves can be stacked in one shot
- **Genre settings:** Action, Epic, Drama, Comedy, Horror — the whole scene follows the genre's look and pacing
- **Era selection:** regrade to look like the 1960s, 1980s, 1990s, or today
- **AI Cast:** build custom AI actors with chosen look, outfit, era, personality
- **Scene building:** place locations and props, shape the frame
- **Emotions:** choose what each character shows
- **Color grading:** fine-tune color, temperature, contrast, presets
- **Multiple references:** upload many reference images to guide generation
- **Real-time co-directing:** invite teammates onto one project
- **AI assistant:** help with camera angles, lighting, prompts, script-to-shot breakdowns

It isn't tied to one model — pick the best engine per shot.

## Generation controls that matter

- **Start frame:** upload or generate the opening image; the clip grows from it. This is the single biggest quality lever.
- **End frame** (where supported): pin exactly where a camera move finishes — turns drift into intention.
- **Camera movement presets:** faster than prompt engineering; pick the move, don't describe it.
- **Duration:** longer clips cost more and drift more. Short, locked shots chain better than long wandering ones.
- **Aspect ratio:** match your delivery format from the first generation, never crop later.

## Turbo vs Standard thinking

- **Standard / Premium models (Kling 3.0 etc.):** hero shots — faces, dialogue, key story beats.
- **Turbo / Lite models:** iteration, B-roll, establishers, tests. Draft cheap, render the winners expensive.
- **One clip at a time, quality-gated:** a failed clip never chains. Re-prompt, don't hope.

## Reliability rules

1. Never spend credits on a guess — pre-check the prompt against the checklists in `prompt-engineering.md`.
2. Failed/NSFW generations aren't billed on the API path; verify billing behavior in the app before a big batch.
3. Credits reset each billing cycle and don't roll over — plan usage so paid credits don't evaporate.
4. Higgsfield open-sourced three of its own AI films with every prompt, camera setting, and asset published — mine those before inventing your own pipeline.

## Sources
- https://higgsfield.ai/creator-hub/help-center/ai-models/how-do-i-create-and-use-a-soul-id-character
- https://www.thehypemagazine.com/2026/10/09/what-is-higgsfield-ai-uses-features-pricing/
- https://www.meltflexai.com/blog/higgsfield-alternatives
- https://github.com/ivan-meer/higgsfield-ai-prompt-skill/blob/HEAD/skills/higgsfield-models/SKILL.md
- http://dev.to/mckennachapman/higgsfield-api-in-practice-prompt-to-editorial-photo-and-the-defaults-that-bite-f0c
