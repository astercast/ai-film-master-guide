# Model updates — 2026-10-11

The AI video space moved fast in 2026. This is the guide's standing model refresh:
every entry in `models.json` was re-verified against October 2026 coverage, and each
now carries `last_verified`, `status`, `what_changed`, and `sources`. Verify live
pricing before spending — this file is a snapshot, not a rate card.

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

*Next refresh: when a model in the table changes version, price, or status. The
`model-watch.html` page renders this file's data live from `models.json`.*
