---
name: deliver-festival
description: Master a festival-ready file: spec, watermark, packshot.
---

# Deliver for festivals

## Use when

Final delivery to a festival.

## Inputs

- Locked cut
- Festival spec (ratio, codec, watermark rules)

## Procedure

1. Master 16:9 or 21:9 per the festival (never crop in the festival's player — compose for it).
2. MP4/MOV up to 4K; broadcast-safe levels; -1 dBTP ceiling.
3. Burn in the required watermark; design the packshot as a judging touchpoint.
4. QC on a big screen: morphs invisible on a laptop appear at 4K.

## Worked example

21:9, ProRes master → H.264 delivery, watermark lower-third, packshot with title art + credits.

## API references

- `api/v1/festivals.json`
- `api/v1/checklists.json`

## Pitfalls

- Delivering 16:9 composed for 9:16 — compose for the delivery ratio from shot one.
