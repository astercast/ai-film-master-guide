---
name: compare-dialogue-lipsync
description: Pick between native-audio models for talking heads and dialogue scenes.
---

# Choose a model for dialogue + lip sync

## Use when

Any scene with synced dialogue.

## Inputs

- Dialogue length
- Need for multi-shot coverage
- Budget per second

## Procedure

1. Shortlist native-audio models: Seedance 2.0/2.5, Veo 3.1/3.0, Kling 3.0 (sound variants), Grok Imagine Video 1.5 (Sora discontinued Mar 2026).
2. Compare per-second cost at your target resolution (models.json).
3. Dialogue quoted + attributed in-prompt beats post lip-sync for short lines; post tools win for long scenes.
4. Test one line on two models before committing the scene.

## Worked example

8-line dialogue scene: Veo 3.1 native quotes vs Seedance 2.5 — one test line each, pick the cleaner mouth.

## API references

- `data/v1/models.json`

## Pitfalls

- Assuming all 'video models' do audio — WAN 2.6 has NO native audio.
