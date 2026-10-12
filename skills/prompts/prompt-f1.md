---
name: prompt-f1
description: Write a restraint pass — subtle acting prompt (performance track) using the guide's template.
---

# Prompt: Restraint pass — subtle acting

## Use when

You are directing a shot that needs: restraint pass — subtle acting. Anatomy: one tactic, one micro-action — the restraint pass tames AI over-acting. Best for: dialogue scenes, emotional beats.

## Inputs

- `[STYLE]` — your style-bible line, verbatim
- `[SUBJECT]` — locked identity label or @ reference

## Procedure

1. Gather one value per placeholder. Keep [STYLE] identical to every other prompt in the project.
2. Fill the template verbatim — do not paraphrase its camera language:
3.   `Medium close-up of [SUBJECT], [LIGHT: soft natural key]. [SUBJECT] performs [MICRO-ACTION: small and restrained — a glance away, a held breath], tactic: [TACTIC: to deflect]. Eyes track the scene partner, blink naturally...`
4. Confirm exactly ONE primary motion and ONE camera move in the final prompt.
5. Separate identity from motion: appearance descriptors in the Identity Block, action in the Motion Block — never pronouns alone as the subject anchor.
6. Add native-audio direction (quoted, attributed dialogue; named SFX) when the model supports it.
7. Generate a 720p draft first; approve the select before any 1080p/4K render.

## Worked example

Filled draft:
`Medium close-up of MARA, [LIGHT: soft natural key]. MARA performs [MICRO-ACTION: small and restrained — a glance away, a held breath], tactic: [TACTIC: to deflect]. Eyes track the scene partner, blink naturally, never stare into the lens. 1970s anamorphic 35mm, warm tungsten, halation, fine grain. [AUDIO: room tone.]`

## API references

- `data/v1/prompt-templates.json`
- `data/v1/camera-movements.json`

## Pitfalls

- Stacking two motions or two camera moves in one prompt — the model will split the difference and ruin both.
- Changing the [STYLE] line between shots — the fastest route to a recast-looking cast.
