---
name: longform-shotlist
description: Write shotlist.md files with verbatim prompts, the source of truth for generation.
---

# Build the per-scene shotlist

## Use when

Breaking a script into generatable units.

## Inputs

- Locked script
- Asset registry
- Target seconds per shot (4–30)

## Procedure

1. One shotlist.md per scene block.
2. Each shot: number, seconds, one-line goal, the ENTIRE prompt verbatim, look:, optional source:.
3. Prompts go out verbatim plus platform additions — the file is the source of truth.
4. Shot numbers are free text (1.10, 73.2B); seconds are whole numbers.

## Worked example

73.2B · 6s · Mara enters the kitchen, morning. Prompt: [full 400-word prompt verbatim] look: anamorphic-kitchen-morning source: previz_73.mp4

## API references

- `api/v1/prompt-templates.json`

## Pitfalls

- Paraphrasing prompts in chat instead of keeping the verbatim file — drift starts here.
