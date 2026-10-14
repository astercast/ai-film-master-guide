---
name: studio-packet-export
description: Turn any Studio plan into a hand-offable artifact: markdown download, self-contained HTML (series), or print/PDF, with shots, prompts, model math, budget, schedule, bible, and checklist.
---

# Export the production packet for a collaborator

## What this gets you

You will have a document you can hand to a collaborator that contains the whole production, shots, prompts, costs, schedule, rules, in one file.

## Use when

Handing the plan to a collaborator, a director, or your future self at generation time.

## Inputs

- A built Studio plan (film or series), saved or current

## Procedure

1. Build the packet first (film or series mode), export works on the current plan or any saved plan via 'Continue planning'.
2. Copy as markdown: the full packet text for chat/docs (shots, per-shot prompts, model picks with rates, budget table with 5x/20x envelopes, schedule).
3. Download .md: same content as a file, the deterministic seed is printed on the packet so the plan is reproducible.
4. Download .html (series): one self-contained file, inline CSS, no external requests, with the series bible, per-episode arcs and shot prompts, budget, schedule, and the consistency checklist. Printable, shareable.
5. Print / save PDF: the site print stylesheet hides the form and actions; shot cards never break across pages.
6. Save named plans locally (duplicate to branch a variant); loading one is 'continue planning'.

## Worked example

5-episode series -> Download .html: one file with the locked bible, 75 per-shot prompts (DNA prepended), budget lines with traceable math, schedule, checklist, ready for a collaborator who never opens the Studio.

## Pitfalls

- Exporting before checking unfilled [tokens], the packet flags them ('Fill before generating'); resolve them first.
- Handing off the packet without the seed, the seed is the reproducibility proof.
