---
name: audio-music-model-route
description: Pick between Suno v5.5, Lyria 3 Pro, and Eleven Music for a score cue, a full song, or a trailer track.
---

# Choose the music model for the job

## What this gets you

You will know which music model writes which cue in your film, a structured score bed, a full song with vocals, or a trailer track, and what each choice means for your rights.

## Use when

Briefing music for a production: score cues, a song a character performs, a trailer track, or temp music you may later need to replace.

## Inputs

- The cue's job: underscore, performed song, or trailer and promo track
- Length and structure the cue needs
- Where the film will play, and how clean the rights paper must be

## Procedure

1. Underscore and structured cues inside Google's ecosystem: Lyria 3 Pro, because the brief can name intro, verse, chorus, and bridge across a 3-minute track, and it sits next to the Gemini and Vids work.
2. A full song with a performed vocal at the centre: Suno v5.5, for the strongest vocal performances, stem separation, and the Studio multitrack to arrange the result; a character's own singing voice can ride on its Voices feature, with the singer's consent recorded.
3. One account for voice, music, and effects together: ElevenLabs, where Eleven Music shares the credit pool and the cue sheet with the dialogue renders.
4. Write the rights line into the cue sheet as you choose: Suno's label settlements changed its terms during 2026, Lyria output carries SynthID, and every route ends with the guide's music-rights check before release.
5. Generate three candidates per cue at draft length, pick one, and only then extend or arrange the winner.

## Worked example

A short's trailer song went to Suno v5.5 for the vocal, its two underscore cues to Lyria 3 Pro with named sections, and the cue sheet records the model, plan, and date for every track.

## API references

- `data/v1/models.json`
- `data/v1/checklists.json`

## Pitfalls

- Scoring the whole film on one model because the first cue worked: underscore, performed songs, and trailer tracks are three different jobs.
- Treating any of these outputs as rights-cleared by default: the model choice is the start of the paper trail, not the end.
