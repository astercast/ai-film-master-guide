---
name: workflow-production-office
description: Set up an agent crew as the film's production office: a SKILL.md pipeline file, a references/ folder (templates, safety memory, style lock, story notes), and a tracking/ folder — so the production survives context death.
---

# Run a file-driven production office

> **Reference skill** — kept for the record, for agents, and for later: not a first-project skill. See SKILLS_AUDIT.md (rotation 20).

## What this gets you

Reference for later: how to run a production through agent-readable files — a pipeline file, a references folder, a tracker — so the film survives long sessions and handoffs.

## Use when

Any solo/small-team production with enough moving parts that memory becomes the bottleneck (multiple characters, multiple scenes, real retakes) — roughly: if you'd hire a coordinator on a conventional shoot, build the file office instead.

## Inputs

- Working folder for the film
- Agent with local folder access (Claude Cowork, or an equivalent agent runtime)
- Final script / outline / source passage
- Target visual style + any existing character art

## Procedure

1. Create the project folder and write SKILL.md: the one instruction file the agent reads on activation. It must define the two-stage workflow explicitly — still image generation first (character reference grids + scene grids), video generation second — plus asset management (sort grids into scene folders, curate best picks, track progress).
2. Build references/: prompt-templates.md (placeholder-based Character Reference Grids, Scene Grids, Video Prompts the agent fills in per project), filter-safety-guide.md (every blocked keyword + its workaround, stored once found), style-guide.md (visual style, color palette, lighting, film stock — locked in writing before generation starts), story-notes.md (the script/outline in; scenes parsed out by the agent).
3. Add tracking/production-tracker.md: one status line per character and scene, updated by the agent as work proceeds — this is what makes handoffs nearly lossless.
4. Install: point the agent project at the folder with SKILL.md uploaded. First instruction: follow the workflow in SKILL.md exactly, starting with Step 0. Upload the script; answer the setup questions (style, existing characters); let the agent populate the folder structure.
5. Role-split the models: the smartest model does brainstorming and prompt writing (judgment work); the cheap model does asset management and folder cleanup (grunt work). Build the skill lean — a ~5k-token footprint leaves working room (documented 4.7k on the reference production).
6. When a long session degrades, have the agent package a handoff prompt saved in the project folder, then open a fresh project against the same folder. Verify every select with human eyes — the office files and tracks; it does not watch the frames.
7. Version the skill per film (v1 -> v2 -> v3): the third production is cheaper than the first because the safety log, style lock, and templates survive. Re-test model bias after every version bump.

## Worked example

Dragon Blue (reference production): SKILL.md two-stage workflow; Nano Banana Pro reference stills (cinematic framing over NB2's sheen); Luma Agent Board scene boards, spray-and-select; Seedance 2.0 via Dreamina for all shots; filter-safety memory for blocked keywords; ~4.7k-token pipeline; Opus-class for prompts, Sonnet/Haiku-class for filing; handoff prompts across sessions.

## API references

- `data/v1/teardowns.json`

## Pitfalls

- Letting the agent rename files while you're editing — it breaks the editor's links (documented failure mode).
- Bloated skill footprint — every token the pipeline eats is working room the session loses; keep it lean.
- Skipping the safety-memory file — the blocked keyword you don't write down gets fought again next week.
- Trusting the office to verify — it tracks progress, it doesn't watch frames; every select needs human eyes.
- Building for the engine instead of the file contract — models churn (the reference author expects a v4 within weeks); the folder structure is the durable part.
