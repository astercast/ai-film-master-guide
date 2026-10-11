---
name: audio-final-mix
description: Dialogue-first balance, loudness QC, and the three-device listen.
---

# Run the final mix pass

## Use when

Picture is locked and all stems exist (dialogue, SFX bed, score).

## Inputs

- Locked picture
- Dialogue stem, SFX stem(s), music stem(s)
- Delivery target (platform spec if known)

## Procedure

1. Balance in build order: dialogue first, then SFX bed, then music last — never start with music.
2. Carve space: EQ a pocket for dialogue, duck music under lines, keep ambience below the story.
3. Set levels with headroom: peaks below 0 dBFS, dialogue in a consistent band, nothing on the limiter.
4. QC pass one — the silence test: mute the music. If the scene collapses, fix the scene, not the score.
5. QC pass two — three devices: headphones, laptop speakers, a phone. Dialogue must survive the phone.
6. Check the delivery spec (loudness, peak, format) before export; don't guess.

## Worked example

60-second short: dialogue peaking −6 dBFS, bed 18 dB under dialogue, music ducked 4 dB under every line — intelligible on a phone speaker first try.

## API references

- `api/v1/checklists.json`

## Pitfalls

- Mastering before the mix is balanced — loudness can't fix a fight between tracks.
