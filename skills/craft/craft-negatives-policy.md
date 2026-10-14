---
name: craft-negatives-policy
description: Say what you want, not what you avoid.
---

# Apply the negatives policy

## What this gets you

Your prompts will get what you ask for more often, because they say what TO show instead of listing what to avoid (which models often render anyway).

## Use when

Every prompt.

## Inputs

- The shot description

## Procedure

1. Write only what should be in frame.
2. Bans live at the image stage only — never in video prompts, not even as bans.
3. Never write renderable nouns as negations ('no lens flare' summons lens flare).
4. Behavioral blocking ('don't enter from the side door') is fine — it names behavior, not objects.

## Worked example

Bad: 'no blurry hands, no extra fingers.' Good: 'her hands rest flat on the table, fingers still.'

## Pitfalls

- Negative prompts as a crutch — positive description is the fix.
