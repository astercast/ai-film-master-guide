---
name: performance-dialogue-roads
description: Road A (native audio) vs Road B (decoupled voice + lip-sync).
---

# Choose the dialogue road

## Use when

Any scene with scripted dialogue.

## Inputs

- The script
- Whether a client needs exact lines

## Procedure

1. If a client or exact script is involved: Road B — silent clip, separate voice, dedicated lip-sync pass (Wav2Lip lineage). You own the voiceover and can revise lines without re-rendering picture.
2. If the moment matters more than the words: Road A — native-audio model (Veo 3.1, Seedance, Kling 3.0) generates the believable moment whole.
3. Cast the model: quiet natural dialogue → Seedance 2.0; longer AV scenes → Seedance 2.5; multi-speaker/languages → Kling 3.0; ambience + sync → Veo 3.1.
4. Attribute dialogue in prompts: "The girl looks up and says, 'It's real.'" — unattributed lines get dropped or misassigned.
5. Plan for native limits: short clip caps, longer dialogue is still an edit; incoherent speech happens — budget re-takes.

## Worked example

Client explainer: Road B — voice recorded first, lip-sync pass on silent hero clips. Zero re-rendered picture.

## API references

- `api/v1/models.json`

## Pitfalls

- Road A for exact client copy — one wrong word means re-rendering the shot.
