# AGENT.md — How an agent uses the AI Film Master Guide

This repo is built to be driven by agents, not just read by humans. Two
interfaces: **skills** (task procedures — the primary interface for *doing*
work) and the **JSON API** (the data layer behind them). `llms.txt` is the
index, `llms-full.txt` the full guide text, `API.md` the human-readable API
reference. This file is the operator's manual.

## Base URL pattern

Base: **`data/v1/`** relative to the repo root or the deployed site root.
Static files — **no auth, no keys, no rate limits**. Works on any static host.

- Start at **`data/v1/index.json`** — the self-describing manifest: every
  endpoint with its description, schema URL (`data/v1/schema/*.json`),
  `updated` timestamp, record counts, and deprecation notes.
- For task procedures: **`skills/index.json`** → load the skill file whose
  task matches the request. Each skill is: Use when, Inputs, Procedure,
  Worked example, API references, Pitfalls.
- Shared conventions (timestamps, versions, errors, pagination, freshness):
  the "Shared API conventions" block in `API.md`.

## Key endpoints

| Endpoint | Contents | Count |
|---|---|---|
| `data/v1/index.json` | Manifest — start here | 12 endpoints |
| `data/v1/models.json` | 30 models: platform, type, credit cost, strengths/weaknesses/best use, `last_verified`, `status`, `what_changed`, `sources`, `unverified` list | 30 |
| `data/v1/prompt-templates.json` | 47 templates: id, title, track, prompt, anatomy, use, models | 47 |
| `data/v1/camera-movements.json` | 22-move camera lexicon: id, move, prompt_phrasing, when_to_use | 22 |
| `data/v1/checklists.json` | 5 checklists: pre-production, per-shot, continuity, audio, delivery | 5 |
| `data/v1/glossary.json` | AI film / production terms | 79 |
| `data/v1/competitions.json` | 2 judged competitions as craft records (no prizes/deadlines) | 2 |
| `data/v1/teardowns.json` | 10 shot-by-shot teardowns; prompt reconstructions are analytical | 8 |
| `data/v1/diagnoses.json` | 12 failure diagnoses: symptom → diagnosis, fixes, repair template | 12 |
| `data/v1/model-checks.json` | Model-watch freshness feed: per-model last check, source diffs, headlines | 31 checked |
| `data/v1/model-history.json` | Watchtower 2.0 event log: dated status/price/tier/release/verification/coverage events + the 2026-10-11 pricing baseline the drift engine diffs against | 39 events |
| `data/v1/model-review-queue.json` | Pending model-watch review items (empty = nothing pending) | 13 pending |
| `data/v1/model-updates.md` | Human-readable model changelog (Markdown, no schema) | — |

Example requests (Node; swap `fs` for `fetch` in a browser):

```js
const models = JSON.parse(require("fs").readFileSync("data/v1/models.json", "utf8"));
// cheapest active video model, excluding discontinued (the Studio does this too):
const priced = models.models
  .filter(m => m.type === "video" && m.status !== "discontinued")
  .map(m => ({ m, cps: parseFloat(m.est_cost_credits) / 5 })) // "N / 5s" pattern
  .filter(x => !isNaN(x.cps)).sort((a, b) => a.cps - b.cps);
// horror templates = core + photorealistic tracks:
const tpl = JSON.parse(require("fs").readFileSync("data/v1/prompt-templates.json", "utf8"));
const horror = tpl.templates.filter(t => ["core", "photorealistic"].includes(t.track));
```

## Example workflow 1 — plan a 2-minute AI horror short (Studio recipe)

The Studio tool (`site/studio.html`, logic in `assets/js/studio.js`) is
deterministic: same inputs → same packet. Reproduce it from the API:

1. **Input shape** (this is the contract — `assets/js/studio.js` `buildPlan`):
   ```json
   { "title": "...", "logline": "...",
     "genre": "horror", "runtimeSec": 120, "tier": "draft" }
   ```
   `genre` ∈ drama, horror, scifi, action, comedy, animation, commercial,
   documentary. `runtimeSec` ∈ 30, 120, 300, 600. `tier` ∈ draft, festival.
   draft = 6s/shot, 3 takes; festival = 4s/shot, 6 takes.
2. **Template pool**: filter `prompt-templates.json` to the genre's tracks
   (horror → `core` + `photorealistic`: 23 templates). Open with an
   establishing template, close with a payoff template, cycle development
   beats between.
3. **Model pool**: `models.json` where `type === "video"` and
   `status !== "discontinued"` (Sora is discontinued — excluded here and in
   the compare tool, kept in the data for the historical record).
4. **Cost math**: parse `"N / 5s"` from `est_cost_credits` → credits/sec;
   USD = credits × 0.0392 (`models.json` cost_basis, Oct 2026).
5. **Budget envelopes**: clean cost × 5 (realistic) and × 20 (worst case).
   Budget the envelope, never the clean run.

Worked result for `{title, logline, genre: "horror", runtimeSec: 120,
tier: "draft"}` against the real data (verified by
`node scripts/agent-workflows.test.js`): 20 shots × 6s; model pick
**Kling 3.0** @ 1.4 credits/s; **504 credits = $19.76** clean;
**5× envelope $98.80**, 20× envelope $395.20.

## Example workflow 2 — lint a prompt

The linter's layer data lives in `assets/js/linter.js` (`LAYERS` — the
ten-layer anatomy: Subject, Micro-action, Environment, Camera behavior,
Lighting design, Visual style, Emotional tone, Physics & motion, Rendering
quality, Exclusion block). Each layer has keyword lists, a why, a missing
symptom, and a fix tip. The ten-layer anatomy is also taught in the anatomy
chapter (`llms-full.txt`); per-template anatomy notes live in
`prompt-templates.json` → `anatomy`.

1. Load the layer definitions from `assets/js/linter.js`.
2. Case-insensitive keyword presence per layer → present/missing.
3. For each missing layer, surface its `tip` as the concrete fix.

Well-formed prompts cover 8–10 layers; a prompt like "cool video of a guy"
covers 0. The test script proves both against the real layer data.

## Example workflow 3 — track a model's price changes (Watchtower 2.0)

1. `models.json` → the model's `est_cost_credits`, `last_verified`,
   `status`, `what_changed`, `sources`.
2. `model-history.json` → the model's dated events (`kind: "price"` ones
   carry `before_usd`/`after_usd` only where the record documents both
   numbers) **and** the pricing baseline: diff
   `pricing.json` against `pricing_baseline.entries` tier by tier — a
   moved, added, or removed tier is a pricing change even when no event
   was written for it yet. (The live site does exactly this in
   `GET /api/models-changes`; `server/lib/drift.js` is the reference
   implementation, unit-tested in `scripts/watchtower.test.js`.)
3. `model-checks.json` → the model's check record: `last_checked`,
   `changed`, `source_status`, plus fresh `news_headlines`. Read the
   per-model records, not the header summary — the Oct 12 feed's header
   reports `with_errors: 0`, but that counter only counts models whose
   *every* source failed; 13 models carry at least one failed source
   (`source_status: "partial"`), which the drift engine correctly
   surfaces as alerts. Since Watchtower 2.1 (2026-10-12) every one of
   the 31 models has a check record — there is no unwatched model left.
4. `model-review-queue.json` → `pending` items: changed source signatures
   awaiting human promotion, plus standing hand-authored watch items
   (a `status`, no `detected_at` — the checker preserves those across
   runs). A `changed: true` flag is a **review signal**, not a confirmed
   model change — never auto-mutate on it.

Worked result for Kling 3.0 (real data): `est_cost_credits` "720p ~7/5s",
`status: "active"`, `last_verified: "2026-10-11"`; check record
`last_checked: "2026-10-12T22:49:39+00:00"`, `changed: true` — the
klingai.com homepage signature moved. That page is a rotating marketing
surface (it flagged all three Kling models in the same run), so it is
excluded from the signature from the next run; the flag stands in this
feed as a review signal, not a Kling 3.0 change. Review queue
`pending: 13` — five standing watch items (Seedance 3.0 confirmation,
Kling 4.0 GA, the Wan 2.7 gap, MiniMax H3 weights, Soul Cinema pricing)
plus eight changed-source items from the Oct 12 run. Latest history
event: `2026-06-17-kling-30-turbo-ga` (tier). Drift severity: `alert`
(the flagged check; the record itself is unchanged).
Worked pricing result for Vidu Q4 Preview: history event
`2026-10-07-vidu-q4-rate-card` — the $0.014/s launch headline was a
promotional off-peak floor; the official card lists $0.045/s at 540p
(+221.4%), $0.12/s at 1080p, $0.39/s at 4K.

## Example workflow 4 — lock a mini-drama series (episode planner input)

The episode planner (`site/episode-planner.html`, `assets/js/episode-planner.js`)
persists one series + blocks + log to localStorage key `afg-episode-series`.
Input shape:

```json
{ "title": "...", "logline": "...", "hashtag": "...",
  "cast": [{ "name": "Mia", "voice": "avocado_v2:MAI_03",
             "anchor": "one-line fixed visual description" }],
  "blocks": { "1": { "emotion": "dread", "stake": "...", "hook": "...",
                     "beats": ["..."], "turn": "...", "cliff": "...",
                     "scenes": "...", "secondsPerBeat": 12,
                     "format": "minidrama" } },
  "log": [] }
```

`format` ∈ minidrama (60–150s), pov (30–90s), daylife (15–60s),
revenge (60–150s), custom. One emotion per episode; beats × seconds-per-beat
must land inside the format's band (the runtime estimator enforces this).

## Example workflow 5 — plan a microdrama run's economics (Studio 2.5)

The Studio's microdrama mode (`site/studio.html`, `assets/js/studio.js`
`buildMicrodramaPlan`) is an **economics planner**, not a shot packet: it
turns a run shape into a clip budget, a benchmark comparison, and a
timeline from the documented $150-microdrama figures
(`data/v1/teardowns.json`, id `storeel-off-campus`).

Input shape:

```json
{ "title": "...", "logline": "...",
  "episodes": 4, "minPerEpisode": 1, "tier": "draft", "regensPerEp": 5 }
```

- `episodes` 1–40 · `minPerEpisode` 0.5–3 (1 page of dialogue ≈ 1 minute ≈ 1 episode) · `tier` ∈ draft, festival.
- **Clip budget:** ceil(runtime/15)–ceil(runtime/10) clips per episode (the documented 10–15s clip unit; StoReel's actual 146 clips / 30 storyboarded episodes ≈ 4.9 per 60s episode sits inside the 4–6 range).
- **Benchmark:** $50/min × total minutes (TheWrap's reported AI-series rate — the benchmark to beat, not a promise).
- **Generation cost:** runtime × takes × cheapest priced video model rate from `models.json` (the floor, verify live); takes = 3 (draft) or 5 (festival) — the ends of Qidian's documented 3–5 "drawing cards" range.
- **Regen reserve:** regens/episode (your budget guess — StoReel paid for regenerations, no per-episode figure published) × cheapest image-model rate.
- **Timeline:** 1 day per finished episode (the documented 4-days-for-4-episodes pace).
- Export: `microdramaToMarkdown(plan)` — copy/download; save named runs in the browser.
- Bridge: the episode planner's "Send run to Studio →" stages `{v:1, kind:"microdrama", episodes, minPerEpisode}` in the `afg-studio-bridge` localStorage key; the Studio pre-fills microdrama mode.

Worked result for `{title, episodes: 4, minPerEpisode: 1, tier: "draft", regensPerEp: 5}` against the real data (verified by `node scripts/agent-workflows.test.js`): 4–6 clips/episode (16–24 for the run); $200 benchmark ($50/min × 4 min); generation 180s/episode × 3 takes at the cheapest video-model rate; regen reserve 20 regens at the cheapest image-model rate; 4 days at the documented pace; plan total vs benchmark in the run-budget table with every line's documented basis.

## Example workflow 6 — run a green-light read on a concept

The Green Light (`site/greenlight.html`, logic in `assets/js/greenlight.js`)
is the Studio engine plus a room: it reads the concept cold, builds the
plan, prices it from `data/v1/pricing.json`, and votes. Reproduce it:

1. **Input shape** (this is the contract — `assets/js/greenlight.js`
   `buildMeeting`):
   ```json
   { "title": "...", "logline": "...",
     "genre": "drama", "runtimeSec": 30,
     "resKey": "1080p", "ambition": "festival" }
   ```
   `genre` ∈ drama, horror, scifi, action, comedy, animation, commercial,
   documentary. `runtimeSec` ∈ 30, 120, 300. `resKey` ∈ 720p, 1080p, 4k.
   `ambition` ∈ draft, festival.
2. **The six-layer read** (`readRoom`): keyword presence per layer —
   someone to watch, something happening, a camera decision, light, place
   and time, a feeling — scored 0–100 (present layers / 6). Empty,
   keysmash, and sub-2-word concepts are unusable (honest NO FOOTAGE, not
   a guess). Non-English is flagged, not rejected.
3. **The money rule** (`effectiveTier`): festival ambition unlocks flagship
   pricing only when the read scores ≥ 55. A cold read gets draft money
   no matter what was asked for — stated in the verdict notes, never
   silent.
4. **Pricing** (`priceShot`): resolve each shot's model to a
   `pricing.json` entry (exact normalized match first, longest-prefix
   fallback — so "Veo 3.1" never resolves to the "Veo 3.1 Fast" entry);
   festival picks the `standard` tier at the requested resolution, draft
   picks the cheapest usable tier; fallback ladder 1080p → 720p → first
   usable. Cost = usd_low/high × seconds × takes. Models with no
   per-second tier (announced-but-unpriced like Kling 4.0) are unpriced,
   stated, never invented.
5. **Hype hygiene**: "Veo 4" → doesn't exist (verified Oct 2026 — the
   "release date" pages are SEO bait); "Kling 4.0" → announced, not
   shipped; "Sora" → discontinued. Named and corrected, never priced.
6. **Verdict**: score ≥ 70 → GREEN LIGHT; 45–69 → CONDITIONAL (missing
   layers listed as conditions); < 45 → BACK TO THE ROOM.

Worked result for the strong concept ("Mara, a weathered fisherwoman…",
genre drama, 30s, 1080p, festival ambition) against the real data
(verified by `node scripts/agent-workflows.test.js`): read **100/100**,
flagship pricing unlocked, **8 shots**, budget lines Kling 3.0 1080p ×1
$3.36 + Seedance 2.0 1080p ×5 $44.40 + Veo 3.1 standard-1080p ×2 $19.20 =
**$66.96 clean**, 5× envelope **$334.80**, 20× **$1,339.20**, 6-day
schedule, verdict **GREEN LIGHT**. The weak concept ("a dog in a city",
festival ambition): read **33/100**, priced at **draft** by the money
rule, **$15.15 clean**, verdict **BACK TO THE ROOM**.
- Punch-ups (`punchUpClauses`/`applyPunchUp`): deterministic craft
  clauses per missing layer (camera/light/place-time/mood/action) — the
  room adds craft, never story (no clause for a missing subject).
- Bridge: the Cutting Room's "Green light →" button stages
  `{v:1, kind:"greenlight", prompt, score, gradeWord}` in the
  `afg-studio-bridge` localStorage key; the Green Light pre-fills the
  pitch from the take's final prompt.

## Rate and expectation notes

- **Static JSON.** No rate limits, no pagination — payloads are complete
  snapshots sized for client-side filtering.
- **Freshness.** Every payload carries `observed` (date) or `updated`
  (ISO-8601 UTC). Treat undated numbers as stale. Model costs were read live
  2026-10-10 — **verify live before budgeting**; the `unverified` array in
  `models.json` lists costs that could not be confirmed.
- **Money math.** Costs are Higgsfield credits unless noted; the guide uses
  $0.0392/credit (Oct 2026) as the USD conversion — an estimate, stated in
  `models.json` → `cost_basis`.
- **Errors.** Static files can't return error bodies. A missing endpoint
  means a wrong path — re-read `index.json`. Empty results are `[]`.
- **Versions.** Manifest `meta.version` is semver (`1.1.0`); breaking changes
  ship as a new `v2/` path, never a silent shape change.
