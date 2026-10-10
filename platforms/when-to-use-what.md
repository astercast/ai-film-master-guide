# When to Use What

The decision tree for picking the right tool per shot. Festival-grade films are hybrid — nobody will know if you match color in post.

## Decision rules

| Shot need | Reach for | Why |
|---|---|---|
| Character close-up / dialogue | Higgsfield + Soul ID (Kling 3.0 engine) | Identity lock + top-tier faces + native audio |
| Epic scale / impossible environments | Sora 2 | Best vast-scene coherence |
| Nature / landscapes | Veo 3.1 | Reference-image fidelity, natural texture |
| Precise motion control | Runway + Motion Brush | Paint exactly where movement happens |
| Fast action / fluid VFX | Hailuo 2.3 | Fluid dynamics strength |
| Stylized / artistic passages | Wan 2.6 | Style over photorealism |
| Lip-sync dialogue | Pika | Clean-audio-in, synced lips out |
| Drafting / volume / tests | Seedance 2.0 Pro or Kling 2.5 Turbo | Speed and cost |
| Budget hero on a budget | Kling direct (end-frame pinning, elements) | Raw control without preset markup |

## The hybrid pipeline

1. **Plan per shot, not per film.** The shot list gets a model assignment column.
2. **Anchor on one identity system** (Soul ID) so faces survive platform-hopping.
3. **Generate in passes:** all drafts on cheap/fast models → approve → heroes on premium.
4. **Normalize in post:** one color pipeline, one grain overlay, one audio mix. This is what makes mixed sources invisible.
5. **Never switch models mid-scene** unless you have to — consistency is cheaper than correction.

## Cost-aware ordering

- Rough out the whole film on Turbo/Lite first (cheap).
- Identify the 10–15 hero shots that carry the story.
- Spend premium credits only on heroes and dialogue.
- Everything else ships from the draft pass with a good grade.

## Anti-patterns

- Using one platform for everything out of loyalty — you pay in quality somewhere.
- Premium-rendering a shot before the edit is locked — re-edits waste the expensive generation.
- Mixing aspect ratios across shots — pick delivery format on day one.
