---
name: workflow-component-separation
description: Architect a generation pipeline as separate character-identity, world, and action components with progressive-change workflows — so any element can be revised without regenerating the others, and late ideas land as parameter changes instead of restarts.
---

# Split the production into separately controllable components

## Use when

Any production where shots must stay revisable until delivery — commercials, music videos, multi-scene shorts; mandatory when choreography or performance must survive art-direction changes.

## Inputs

- Locked character designs (paper/industrial-design first, not prompts)
- World/environment references
- Action/choreography source (human performance, mocap, or reference)
- A workflow environment that keeps components separate (ComfyUI node graphs or equivalent)

## Procedure

1. Split the production into three components before generating anything: IDENTITY (who — trainable, lockable character assets), WORLD (where — the environment as its own trainable component), ACTION (what they do — choreography/performance as a swappable input). Train or lock each independently.
2. Lock identity designs on paper first (industrial design, not prompts) — training targets must be decisions, not explorations. Train only on likeness/IP you own or have cleared (own-or-clear).
3. Build progressive-change workflows: engineer every workflow so a new idea lands as a parameter change (re-time the action, swap the routine, relight the set), never as a restart of the generation chain. Checkpoint each component independently and keep the inputs that produced every approved state.
4. Run the nothing-locked review contract: strategy, creative, and production in parallel; review cycles on a tight loop with real decision authority. Staff it with a tight, trusted team — clarity of intent is the doctrine, because when anything is an option, revision without intent is churn.
5. Schedule a dedicated final pass for hallucination cleanup after the last generation and before the grade — generation is never the last step. Decide per artifact: repair in post or re-roll.
6. Keep the human gates explicit: story by humans, choreography/performance from human sources, design before training, QC with human eyes on every select.

## Worked example

Shake Your Bots Off (reference production): Fembot/BroBot redesigned on paper by industrial designers; three parallel tracks — character models trained, world models trained, candidate stories developed; component-based ComfyUI workflows (characters/world/choreography separately controllable, progressive-change engineering); crowdsourced TikTok dance ($10,000 open call, winner Jessica Rizzardi) choreographed into the robots in hours after main scenes were built; dedicated final hallucination-cleanup pass; spot production under one month vs. a historical half-year benchmark.

## API references

- `api/v1/teardowns.json`

## Pitfalls

- Single-prompt generation at production scale — changing one thing changes everything; choreography density collapses.
- Skipping the paper-first design lock — training on explorations instead of decisions burns the longest-lead component.
- Nothing-locked without the discipline — infinite revision with no convergence when nobody is empowered to stop; budget the decision load, not just the render load.
- No independent checkpoints per component — a late idea forces a full restart instead of a parameter change.
- Treating generation as the last step — schedule the hallucination-cleanup pass or ship the model's small lies.
- Training on likeness/IP you don't own — a lost asset you own is a rebuild job; one you don't own is a lawsuit.
