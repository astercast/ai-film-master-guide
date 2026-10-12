---
name: prompt-a1
description: Write an anime action (sakuga) prompt (animated track) using the guide's template.
---

# Prompt: Anime action (sakuga)

## Use when

You are directing a shot that needs: anime action (sakuga). Anatomy: cel/sakuga/impact frames — NO lens or DOF language. Models: PixVerse (Anime), Vidu Q1, Pika.

## Inputs

- `[CHARACTER]` — fill per the template's anatomy

## Procedure

1. Gather one value per placeholder. Keep [STYLE] identical to every other prompt in the project.
2. Fill the template verbatim — do not paraphrase its camera language:
3.   `Cel-animated action cut: [CHARACTER] dashes forward, speed lines and impact frames, painted background holds still. Sakuga flourish on the strike. STYLE LOCK: bold colors, expressive features, dramatic lighting, hand-dra...`
4. Confirm exactly ONE primary motion and ONE camera move in the final prompt.
5. Separate identity from motion: appearance descriptors in the Identity Block, action in the Motion Block — never pronouns alone as the subject anchor.
6. Handle audio in post (this template's models don't do native audio well).
7. Generate a 720p draft first; approve the select before any 1080p/4K render.

## Worked example

Filled draft:
`Cel-animated action cut: [CHARACTER] dashes forward, speed lines and impact frames, painted background holds still. Sakuga flourish on the strike. STYLE LOCK: bold colors, expressive features, dramatic lighting, hand-drawn anime.`

## API references

- `data/v1/prompt-templates.json`
- `data/v1/camera-movements.json`

## Pitfalls

- Stacking two motions or two camera moves in one prompt — the model will split the difference and ruin both.
- Changing the [STYLE] line between shots — the fastest route to a recast-looking cast.
