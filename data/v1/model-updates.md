# Model updates — 2026-10-11

The AI video space moved fast in 2026. This is the guide's standing model refresh:
every entry in `models.json` was re-verified against October 2026 coverage, and each
now carries `last_verified`, `status`, `what_changed`, and `sources`. Verify live
pricing before spending — this file is a snapshot, not a rate card.

## 2026-10-11 — Wave 30: Late-Q4 field sweep

29 → **30 models** (one added); no status changes. The headline item is a
pricing correction; everything else is record enrichment with sources.
Third-party or vendor numbers as labeled — verify live before spending.

### Headline correction

- **Vidu Q4 Preview** — the **$0.014/s** launch headline was a promotional
  off-peak floor, not a list rate. The official Oct 7, 2026 rate card
  (GlobeNewswire): **$0.045/s at 540p, $0.12/s at 1080p, $0.39/s at 4K**;
  image-to-video and reference-to-video at a 30% discount through Nov 30;
  off-peak jobs at half. The guide's record now carries the list rates
  (Studio cost math follows them); the episode-pipeline chapter's Stage 5
  tooling note carries the same correction. Also added: 16s max clips,
  I2V + reference-to-video only (no T2V), audio on by default, and the
  Artificial Analysis image-to-video Elo 1,179 on Oct 8 (#3, up from Q3
  Pro's 1,056 — sloptvnews, single-source).

### New model (1)

- **vivago R1** (HiDream.ai) — made available globally Oct 9, 2026 (EZ
  Newswire syndicate — single-source, verify live). An AI video creation
  agent, not a shot-generation model: scriptwriting, storyboarding,
  generation, and editing in one conversational workflow, up to 5-minute
  videos in one production run, extendable through additional rounds, with
  CLI access for developers and agents. Lives in the guide's `suite` lane
  (like Mirage Tesseract) — no published rate card, no independent
  production evidence yet.

### Record changes

- **Kling 4.0** — still not GA as of Oct 11 ("coming this October" is a
  month, not a date — wavespeed Oct-1 evidence review; orcarouter). Status
  stays `announced`. Announced-not-confirmed specs enriched: 3–30s,
  720p/1080p/4K, 21:9 ultrawide, up to 15 combined multimodal references
  (10 images, 5 videos ≤30s, 7 subjects), 10 keyframes; no published price,
  no API model ID (APIMart).
- **Vidu S2** — Sept 15, 2026 official details confirmed (PR Newswire):
  S2-Avatar real-time 720p (up from S1's 540p), mid-session reference-image
  swaps, S2-Editing on live streams. Noted as a different product class from
  rendered clips for budgeting.
- **Mirage Tesseract** — Sept 22, 2026 launch (EZ Newswire) confirmed as an
  agent-driven editing/motion-graphics suite, not a generation model; local
  engine free. Stays in the edit/post lane.
- **Grok Imagine Video 1.5** — Lite-tier pricing confirmed against xAI's own
  API docs (via sloptvnews, Oct 2026): $0.02/s 480p, $0.03/s 720p, $0.14/s
  1080p + $0.01/input image; flagship 1.5: $0.08/$0.14/$0.25. Venice listed
  Lite Sept 30 ($0.04/clip entry).
- **Seedance 3.0** — still unannounced by any vendor as of Oct 1
  (versely.studio). Status stays `reported`. ByteDance's real-time
  world-model project is a separate product, not a Seedance 3 video release.
- **Veo 3.1** — API ladder added (third-party mirror of Google docs, verify
  live): Standard $0.40/s (720p/1080p), $0.60/s 4K; Fast $0.15/s, $0.35/s
  4K; Lite $0.05/s 720p, $0.08/s 1080p. 4/6/8s clips; Vertex us-central1
  only; server deletes generations after 2 days; Veo 2 shut down June 2026.
- **Seedance 2.5** — official BytePlus rates re-read Oct 6, 2026:
  $0.1028/s 480p, $0.2311/s 720p, $0.5686/s 1080p; 4–30s; up to 50 refs
  (30 images/10 videos/10 audio); timestamp edits; US unavailable.
- **Seedance 2.0** — 15 refs (9/3/3), 4–15s, edit + extend (BytePlus docs).
- **Wan 3.0 / 3.0 Prime** — formally released Aug 24 (beta Aug 6); native
  30s at 30fps; 10/5/5 refs; document mode; Model Studio $0.05/$0.10/$0.20.
- **MiniMax H3** — H3 Max native 1080p + Turbo tier per Krea's Sept 9
  changelog (single secondary source — guide figures unchanged pending
  confirmation); open-weights availability still verify-live.
- **LTX-2.5** — Community License (free commercial <$10M ARR), Fast =
  distilled 8-step vs Pro fidelity, automatic duration, audio-to-video
  limits; stays unpriced in the Studio's honest floor.
- **FLUX 3 Video** — GA since Aug 2026; QHD $0.40/s and UHD $0.80/s since
  Sept 10 (v2v $0.65/$0.95); FLUX Video Upscale shipped Aug 20; Elo claims
  still vendor-run.
- **Sora 2 / Pro / Max** — the Sora API is gone (410s — versely.studio,
  Oct 2026). Status stays `discontinued`.
- **Runway Gen-4.5** — still the latest; no new model in 2026 (Sept news
  was distribution/MCP).
- **"Veo 4"** — re-verified as SEO bait (mer.vin, queststudio.io, and an
  independent coverage memo all agree: no announcement, no model card, no
  API ID). The guide's standing correction holds.

## 2026-10-11 — Wave 21: Q4 model refresh

All 29 records re-verified against Oct 2026 coverage. Two models added;
no status changes; pricing updates below are third-party or vendor numbers
as labeled — verify live before spending.

### New models (2)

- **Vidu Q4 Preview** (Vidu / Shengshu Technology) — launched Oct 7, 2026
  (GlobeNewswire). First public preview of Vidu's next-gen flagship:
  lifelike performances, cinematic 4K 10-bit, up to 15 image references,
  3 audio references for voice consistency, stable camera moves, strong
  Chinese text rendering. Launch pricing from **$0.014/s** (preview
  pricing may rise — verify live). The Studio flags it verify-live until a
  stable rate card exists.
- **FLUX 3 Video** (Black Forest Labs) — announced July 23, 2026, public
  Aug 4, 2026 (BFL's first video model). Up to 20s single take, native
  1080p, native multilingual audio + lip-sync, start/end frames and
  ordered keyframes, multi-shot generation, video continuation, strong
  typography. Draft mode: **$0.06/s 720p** draft, **$0.17/s 720p**,
  **$0.29/s 1080p** (~$2.90/10s HD). Arena text-to-video #2 (1496 pts,
  behind Gemini Omni Flash 1512; vendor's preference stats are
  vendor-run, not independent). 4K and open weights promised "coming
  soon". The Studio flags it verify-live until rates stabilize.

### Pricing / record changes

- **MiniMax H3** — API rate card now published: **$0.13/s 2K, $0.08/s
  768p**; H3 Max: $0.08/s 768p, $0.05/s 480p; H3-Max-Turbo and H3 480p
  $0.038/s vendor-confirmed but unpublished. Open weights announced July
  31 "in the coming days" — no public weights repo confirmed as of Oct
  11. H3 is now USD-billed (no platform-credit rate), so the Studio's
  budget treats it as verify-live and falls through to the next-cheapest
  priced model. The Night Bus worked example moved its 25 H3 shots to
  Luma Ray 3.2 (clean $20.48 → **$20.64**; see the pipeline worked
  example, re-versioned).
- **Kling 3.0** — Kling API docs pricing confirmed: 3.0 Turbo $0.112/s
  720p / $0.14/s 1080p (audio included); kling-v3 $0.084/s std, $0.112/s
  pro, $0.126–0.168/s with audio, $0.42/s 4K; kling-2-5-turbo $0.042/s
  std / $0.07/s pro. Correction of a circulating claim: Kling 3.0 ranks
  **12th (not 4th)** on the Artificial Analysis T2V leaderboard
  (techtimes, single-source flag).
- **Hailuo 2.3** — direct API rechecked Oct 10, 2026: 768p $0.28/6s,
  $0.56/10s; 1080p $0.49/6s; Fast $0.19/6s. 2.3 is now MiniMax's LEGACY
  (V1) API generation.
- **Gemini Omni** — gemini-omni-1.1-flash GA Aug 27, 2026 (scene
  extension to 40s in 10s steps, first/last-frame interpolation, 360p–4K
  resolution ladder, 3s video refs, stateful editing). Preview endpoint
  deprecated Sept 30, 2026 (404s, no fallback). Resolution ladder:
  **$0.10/s 720p, $0.03/s 360p draft, $0.15/s 1080p, $0.30/s 4K**
  (reported benchmarks — verify live). Free 1080p in Google Vids since
  Sept 23; replaces Veo 3.1 inside the Gemini app. SynthID watermark on
  all output.
- **Grok Imagine Video 1.5** — NEW Lite tier Oct 1–8, 2026 (xAI):
  1–15s, 480p/720p/1080p, native audio, **$0.02/s 480p to $0.14/s
  1080p**, $0.01/image input. Live on xAI API, Venice, Vercel AI
  Gateway, OpenRouter; in ComfyUI v0.39.0 partner nodes.
- **Seedance 2.5** — reached API resellers ~mid-Aug; BytePlus API
  estimate ~$0.57/s 1080p (third-party estimate — verify live). Arena
  I2V (Sept 21): ~120 pts above Kling 3.0 Pro (single-source flag).
  BytePlus terms (Sept 30): Seedance API not available in the US.
- **Seedance 2.0** — BytePlus API estimate ~$0.37/s 1080p, Mini 720p
  ~$0.08/s (third-party estimates — verify live).
- **Runway Gen-4.5** — no new model; still the latest. Gen-4.5: 12
  credits/s; API $0.12/s; Standard $15/mo / Pro $35/mo / Max $95/mo
  (Max replaced Unlimited for new subscribers). Runway is becoming a
  multi-model aggregator (Veo 3.1, Kling 3.0 Pro, Seedance, FLUX,
  Seedream inside one subscription).
- **Wan 3.0 / 3.0 Prime** — formally released Aug 24, 2026; remains
  current. Prime Singapore list: $0.068/s 480p, $0.14/s 720p, $0.28/s
  1080p (verify live).
- **Pika 2.5** — no Pika 3.0; Pika rebuilt into a routing studio (Sept
  2026) across Seedance 2.5, GPT Image 2.5, Grok Imagine 1.5, Gemini 1.1
  Omni Flash, Nano Banana 2, MiniMax H3. API Club (self-serve,
  multi-provider) launched Aug 5, 2026.
- **Luma App / Ray 3.2** — no 3.5; legacy models retired Oct 5, 2026
  (move to ray-3.2). API standard video $0.06–$1.20/5s (360p–1080p).
- **Soul Cinema** — now the DEFAULT image model in Cinema Studio 3.0 and
  3.5's image-mode picker; 3.5 adds 480p/720p/1080p video tiers (up to
  15s). Per-image cost still unpublished — verify live.
- **Soul Cast** — AI actors confirmed in Cinema Studio 2.5 and 3.0
  Business/Team.
- **LTX-2.5** — open weights confirmed healthy (community running it on
  Intel Arc pairs, AWS L40S bake-offs); hosted rows from ~44/58 credits.

### Status re-checks (no change)

- **Kling 4.0** — STILL not GA as of Oct 11: only Flash early access
  (Ultra Yearly, 20s/720p/8-bit SDR); full model "this October", no
  date; 4K 10-bit HDR still "coming soon"; no API model ID. Status stays
  `announced`.
- **Seedance 3.0** — STILL unconfirmed: ByteDance Seed's public
  directory lists 2.5 as latest. ByteDance's October real-time world
  model (Bloomberg) is a separate product, not a Seedance 3 release.
  Status stays `reported`.
- **Veo 4** — still SEO bait; no Veo 4 in any Google documentation.
- **Sora 2** — still discontinued (API 410s; "does not come back").

## Discontinued

- **Sora 2 / Pro / Max (OpenAI)** — **discontinued**. OpenAI announced the shutdown on
  March 24, 2026; the Sora apps and website closed April 26, 2026, and the Sora 2 API
  (including `/v1/videos`) was shut down September 24, 2026, with no replacement named.
  The entry is kept in `models.json` for historical reference. Do not plan new work on it.
  Sources: OpenAI deprecation notice via dev.to roundup; higgsfield.ai Sora migration guide (Sept 2026).

## New entrants

- **MiniMax H3** (MiniMax, alias Hailuo 3.0) — released July 31, 2026. Omni-modal
  (text, image, video, audio in one context), 2K output, 4–15s clips, native stereo
  audio, instruction-based edits, open weights. Third-party pricing ~$0.073–0.12/sec.
  Successor to Hailuo 2.3. Sources: Hugging Face blog; pixo.video first look; MarkTechPost.
- **Midjourney V1 Video** (Midjourney) — launched June 18, 2025; still current as of
  Oct 2026. Image-to-video only, 5s clips extendable to 21s, 480p/720p, no native audio
  (plan sound separately), ~8x image cost. The pick for stylized/animation shots.
  Sources: CometAPI; krea.ai pricing breakdown.
- **Seedance 3.0** (ByteDance) — **status: reported, unconfirmed**. First appeared in
  third-party indexes in early October 2026; not confirmed on ByteDance's official
  channels as of Oct 11. Verify live before planning around it.
- **Kling 4.0** (Kuaishou) — **status: announced, not GA**. Announced Sept 28, 2026:
  30s native clips, up to 10 keyframes, Omni Reference (15 refs), stereo audio with
  improved lip-sync; 4K 10-bit HDR promised ("coming soon"). Kling 4.0 Flash in limited
  early access for Ultra Yearly subscribers; full model expected Oct 2026, not GA as of
  Oct 11. Re-verified Oct 11, 2026 — still "coming soon" on Kling's own app. Sources:
  techtimes.com, cryptobriefing.com, pakera.pk.

## Renamed / repositioned

- **Dream Machine / Ray 3.2 → Luma App / Ray 3.2** — the "Dream Machine" product name
  is deprecated (redirects to the Luma App); Ray 3.2 is the current model. Text-to-video
  and image-to-video generate no native audio. Luma now also bundles third-party models
  (Veo 3.1, Kling 3.0, Seedance 2.0, ElevenLabs) inside the app. Checked Oct 10, 2026.
- **Grok Video / Video Edit → Grok Imagine Video 1.5** — GA June 16, 2026; the July 31,
  2026 update added 1080p, text-to-video, voice reference, and 7-reference scene control.
  Native audio in one pass; 6–15s clips extendable to 30s; API ~$0.08/sec. Topped the
  image-to-video arena at launch (third-party report).

## Version / status changes

- **Kling 3.0** — still the current GA model. Kling 4.0 announced Sept 28, 2026 (Flash
  early access for Ultra Yearly subscribers; full release expected Oct 2026, not yet GA
  as of Oct 11). 3.0 Omni (kling-o3) confirmed as a distinct first-frame variant.
- **Veo 3.1** — still the latest in the Veo line. There is **no Veo 4** (rumor explicitly
  debunked across multiple outlets); Google's new video surface is Gemini Omni Flash,
  launched at I/O 2026. Veo 3.1 Lite tier added March 2026; Veo 2 shut down June 2026.
- **Wan 3.0 / 3.0 Prime** — launched Aug 24, 2026 (closed weights). Third-party notes
  report a ~38% price cut on base 3.0 and confirm 3.0 Prime (up to 5x faster iteration) —
  verify live pricing.
- **Hailuo 02 / 2.3** — H3 is the new flagship; 2.3 remains available with strong
  independent scores for physics-led motion.
- **Pika 2.5** — no Pika 3.0 as of Oct 2026; 2.5 remains current. Pika now also routes
  third-party models (e.g. Kling 3.0) through its dev API.
- **Runway Gen-4.5** — now in the model table (see Wave 16 section below). Gen-4.5 (Dec 2025)
  is still the current video model; no Gen-5 shipped (rumored Q4 2026). Runway has pivoted
  toward a multi-vendor platform and Media Router.
- **Soul 2.0 / Soul Cinema / Soul Cast / DoP / Marketing Studio** (Higgsfield) — no
  successor announced; Soul Cinema launched as a preview March 4, 2026 with pricing still
  unpublished. All flagged verify-live.

## Wave 16 refresh — 2026-10-11 (Oct 2026 fuel research)

### New entrants

- **Gemini Omni** (Google DeepMind) — the correction that matters: Google's actual next
  play is Gemini Omni (I/O 2026), not a "Veo 4". Omni Flash shipped day one in the Gemini
  app, YouTube Shorts, and Google Flow; API since June 30, 2026 (~$0.10/s at 720p,
  token-billed, reported). "Veo 4" pages ranking on Google are SEO bait — verified across
  three sources.
- **Runway Gen-4.5** (Runway) — now a proper record: Runway shipped NO new model in 2026;
  Sept 2026 news was distribution (MCP) and the Sept 30 Summit. API benchmark ~$1.20/10s
  720p (reported). $200M ARR, $350M projection (company-claimed). Included in Adobe's
  Sept 8 in-Premiere multi-model workbench.
- **LTX-2.5** (Lightricks) — Aug 11, 2026: Fast/Pro up to 4K, open weights 22B,
  multi-shot in one pass. Trained on licensed Getty/Shutterstock imagery — the legal-safe
  open pick; paid license required above $10M revenue. API from ~$0.003/s (reported).
- **Vidu S2** (Vidu) — Sept 15, 2026: real-time S2-Avatar (interactive character up to
  720p) and S2-Editing (changes a live stream as it plays).
- **Mirage Tesseract** (Mirage, formerly Captions) — Sept 22, 2026: agent-driven
  editing/motion-graphics suite with a free local engine. Typed `suite` so the Studio
  never treats it as a per-shot generation model.

### API benchmark table (reported, not vendor-quoted)

Sept 2026 via Higgsfield's AI-video API comparison — per 10s 720p: MiniMax H3 $0.80,
Kling 3.0 $0.84, Luma Ray 3.2 $0.90, Runway Gen-4.5 $1.20, Seedance 2.5 $2.31, Veo 3.1
$3.20 (per 8s). Veo 3.1 is the premium API tier. Verify live before budgeting.

### Other refreshes

- **Wan 3.0** — formal release confirmed Aug 24, 2026; provider-list $0.05/s at 480p,
  2–30s with native audio. **Native audio is now standard** across Kling 3.0, Seedance
  2.5, MiniMax H3, Wan 3.0, Veo 3.1.
- **MiniMax H3** — open weights Aug 3, 2026 (base checkpoint; hosted Context-IR/
  Regenerate-2K separate); optimized third-party inference from $0.01/s.
- **Seedance 2.5** — five modes incl. Turbo drafting tier for cents-level prompt testing.
- **Kling 4.0** — still announced, not GA. Specs (30s) are preview-leak level per
  GPTProto — do not present as confirmed. Kling 4K is a 3.0 feature (Apr 23, 2026).
- **Wan 2.2** (Apache 2.0) remains the practical open-weights quality benchmark.

## Rumors explicitly not treated as fact

- "Veo 4" — does not exist; do not trust third-party "Veo 4 generator" pages.
  Google's actual play is Gemini Omni (I/O 2026) — now its own record.
- "OpenAI Spud" (Sora replacement) — rumored, unconfirmed.
- Runway Gen-5 — rumored Q4 2026, not shipped.
- Kling 4.0 specs (30s) — announced, preview-leak level; not confirmed.
- Seedance 3.0 — reported in third-party indexes, unconfirmed by ByteDance.

## Wave 38 — Episode-pipeline revisit #6 (2026-10-11)

No model-record changes this cycle (all 30 records re-verified Oct 11). Tooling-field
watch notes, mapped to the episode-production pipeline (`craft/episodic-shortform.md`):

- **Adobe multi-model in-Premiere workbench** (announced Sept 8, 2026, IBC; TechTimes)
  — Firefly, Google Veo, Runway, Kling, Luma embedded in Premiere's toolbar; in-timeline
  AI audio/music generation; audio-repair tools; After Effects AI assistant. Pipeline
  mapping: forks Stage 6 (assembly) into build-cut.sh vs in-timeline; forks Stage 3/7
  with audio repair (polishes a locked track, never re-times it) and in-timeline bed
  generation. The gates don't move: name clips by line, cut in the gaps, verify mid-frames.
- **Mirage Tesseract** (launched Sept 22, 2026; EZ Newswire) — agent-driven
  editing/motion-graphics suite, free local engine. Stays in the edit/post lane:
  Stages 6–7 motion graphics, title cards, caption treatments. Not a generation model.
- **Vidu S2** (Sept 15, 2026; PR Newswire) — S2-Avatar real-time 720p, S2-Editing on live
  streams. Different product class from rendered clips: does NOT enter the Stage 5
  budget. Relevance is the interactive format's live-companion lane (off-screen lives).
  Cheapest paid tier ~$0.05/clip reported — verify live.
- **"Brief to the row, not the headline"** (versely.studio, Oct 2026) — vendor headline
  specs ≠ hosted-row specs (Wan 3.0's row renders 15s not the vendor's 30s; H3 Max's row
  is 768p not 1080p). Generalizes the wave-30 headline-price rule: the production
  packet quotes the row actually rendered on. Added as a G5 sub-check in the chapter.
- **Veo 4** — confirmed non-existent (see rumors section above). The chapter's Stage 5
  tooling note now carries the hype-hygiene line: never plan a series around a rumor.
- **Wan 3.0** is the current Stage 5 cost floor ($0.05/s at 480p provider-list, 2–30s
  native audio); **Gemini Omni Flash** is the draft tier (~$0.03/s at 360p, ~$0.10/s at
  720p) — the "draft cheap" half of the Studio 3.0 draft-final optimizer mode.
- **HeyGen Voice** consent lane: Royal Mail/ElevenLabs Christmas-ad episode + the
  Save Our Voices Now performer petition (80+ UK performers, backed by Nicola Coughlan)
  make voice-rights a bible column — own, license, or synthesize; never clone a real
  person without explicit consent. HeyGen's $99/mo Professional Voice Clone tier builds
  consent into the product.

*Next refresh: when a model in the table changes version, price, or status. The
`model-watch.html` page renders this file's data live from `models.json`.*

## Wave 39 — Teardown #10 watch desk (2026-10-11)

No model-record changes this cycle (all 30 records re-verified Oct 11). Status
desk — the two flagged revisit inputs, verified before this wave built on them:

- **Kling 4.0** — still not GA as of Oct 11 (late-night re-verification:
  convly.ai and apimart.ai both show API still 3.0-only; no GA date, no
  pricing, no API, no benchmarks). The guide's "announced, not GA" record and
  the episode-pipeline chapter's line both stand. Do not plan a production
  around it.
- **Higgsfield $1M festival winners** — not announced (first-party site still
  "end week of October 2026 (exact date TBC)"; the Oct 12–18 window is
  any-day territory). No teardown until the winners land and a documented
  workflow exists — the series standard is documented productions, not
  speculation.
- **Drought continues**: no generation-model releases in the 72 hours before
  this wave (EvalMap corroborates). **Sora Azure retirement** (Oct 15) on
  schedule — the last Azure deployment retires this week; the migration
  chapter's 12-step Sora 2 → Veo 3.1 guide (tech-insider.org) stays linked.
- **Festival calendar**: Austin AIFF awards Oct 17; new calls — African AI
  Film Festival (FilmFreeway, through Oct 20; free for Africa-based/student
  filmmakers) and AFRO TV's Cue Film Fest (Christmas-themed AI shorts, Oct
  5–Nov 20, live Dec 12 awards broadcast).

*Next refresh: when a model in the table changes version, price, or status. The
`model-watch.html` page renders this file's data live from `models.json`.*
