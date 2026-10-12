---
name: workflow-studio-plan
description: Reproduce the Studio's deterministic planning logic from the raw API data: concept in, costed shot list + budget envelopes out.
---

# Plan a production with the Studio recipe

## Use when

Agent-driven pre-production when the Studio UI isn't in the loop — same math, same data, scriptable.

## Inputs

- Title + logline
- Genre (drama/horror/scifi/action/comedy/animation/commercial/documentary)
- Runtime seconds (30/120/300/600)
- Tier (draft: 6s/shot, 3 takes; festival: 4s/shot, 6 takes)

## Procedure

1. Filter models.json: type == 'video' and status != 'discontinued' (Sora is discontinued — never plan on it).
2. Filter prompt-templates.json to the genre's tracks (horror = core + photorealistic; comedy = core + animated; see AGENT.md).
3. Shot count = ceil(runtimeSec / secsPerShot) (min 2). Open with an establishing template, close with a payoff template, cycle development beats.
4. Per shot: resolve template.models names against the model pool; draft tier picks the cheapest priced model, festival the priciest quality-flagged one.
5. Parse 'N / 5s' from est_cost_credits -> credits/sec; USD = credits x 0.0392 (cost_basis, Oct 2026).
6. Budget lines: keyframe stills (cheapest priced image model) + per-model video lines + post (unmodeled). Clean total x 5 = realistic envelope, x 20 = worst case.
7. Shooting schedule: stills at 60/day; video days from tier.shotsPerDay. Deterministic seed: title|logline|genre|runtime|tier.

## Worked example

Horror, 120s, draft: 20 shots x 6s, Kling 3.0 @ 1.4 credits/s -> 504 credits = $19.76 clean, $98.80 at 5x, $395.20 at 20x. Verified live by node scripts/agent-workflows.test.js.

## API references

- `data/v1/index.json`
- `data/v1/models.json`
- `data/v1/prompt-templates.json`

## Pitfalls

- Planning on discontinued models — filter status first, always.
- Forgetting the takes multiplier — takes are where the budget lives (draft x3, festival x6).
- Quoting the clean cost as the budget — the 5x envelope is the real number.
