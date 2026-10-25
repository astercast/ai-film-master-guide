# LIVE_CHECKLIST.md — ai-film-master-guide live track

**Working repo:** `astercast/ai-film-master-guide` (GitHub-only, never on Vercel).
**Live repo:** `astercast/ai-film-master-guide-live` (private release snapshot;
one-time deploy; push only on user's explicit "push"/"ship it").

Snapshot built 2026-10-11 from working-repo commit `ddddbe8`'s tree
(`site/` as built by `python3 scripts/build_site.py`, timed ~2s).

## Functions wired in the live track (6, ≤12 budget, zero deps)

| route | source in live repo | notes |
|---|---|---|
| `GET /api/health` | `api/health.js` | roster, freshness SLAs; never 5xx |
| `GET /api/models-status` | `api/models-status.js` | 32 models, status enum |
| `GET /api/models-pricing` | `api/models-pricing.js` | 32-model pricing, `?model_id=` filter |
| `GET /api/models-changes` | `api/models-changes.js` | Watchtower 2.0: events since `?since=`, pricing diff vs the 2026-10-11 baseline, drift alerts (`lib/drift.js`) |
| `POST /api/calc-cost` | `api/calc-cost.js` | full 400/404 validation |
Retired 2026-10-24 (fleet-data migration): no GITHUB_REPO_TOKEN is used anywhere. Live data refreshes through the astercast/fleet-data repo; the fleet watchdog does the checking.

Shared lib: `lib/{envelope,cronauth,fetchx,github,ratelimit,drift}.js` (from working `server/lib/`).

## Cron schedules

| path | schedule | what it does |
|---|---|---|
| `/api/cron/watchtower` | `0 14 * * *` UTC (daily) | bounded incremental model-freshness refresh; commits only on change and only when token set |

## Env vars (set on the Vercel project, Production)

- `CRON_SECRET` — required (cron 401s fail-closed without it)
Retired 2026-10-24 (fleet-data migration): no GITHUB_REPO_TOKEN is used anywhere. Live data refreshes through the astercast/fleet-data repo; the fleet watchdog does the checking.
  (`{committed:false, reason:'no-token'}`)
- `GITHUB_REPO` / `REPO_STATIC_PREFIX` — only used with the token

Secrets live only in Vercel, never in either repo.

## Known-good status (2026-10-11)

- Local suite `tests/api.test.sh` (local-server harness running the real
  function files): envelope schema, roster (6 functions), 400/401/404
  gates, static fallback presence, rate limiting, vercel.json lint
  (explicit function paths, `{"maxDuration": 10}` each, no `runtime` key).
- Frontend fallback contract verified: every `/api/*` call falls back to
  static `data/v1/*.json` (force-cache), badge states `live|waking|cached|none`;
  no error state without the API.
- Vercel never serves static files under `api/` — all static data lives in
  `data/v1/`; only real function handlers under `api/` (2026-10-12).
- No static `.js` data files under `api/` — JSONP twins and other static
  script data live in `static/v1/` behind a `rewrites` entry, never under
  `api/` where Vercel would deploy them as functions (2026-10-12).
- Generator scripts emit static data to `data/v1/` only
  (`scripts/build_api.py`); any new hand-maintained `data/v1/` file (e.g.
  `model-history.json`, `model-review-log.json` + its schema, Watchtower
  2.2) must join `build_api.py`'s preserve list or the next rebuild
  deletes it (2026-10-12).
- Watchtower review discipline (2.2): a checker flag is a review signal,
  never a record change. Flags are adjudicated in
  `data/v1/model-review-log.json` (re-fetch, verdict, basis) before the
  queue clears; the checker re-run after a pass sets the new baseline.
  Current state (Watchtower 2.19): 164 history events, review log at
  36 entries (pass 18 + addendum), queue at the 3 standing watches (Seedance 3.0, Kling
  4.0, and Soul Cinema's in-app credit cost re-checked a seventeenth
  pass, unmoved — Kling 4.0's APIMart criteria page is
  signature-identical to its long-standing baseline, fc55ce30…, a
  fourteenth consecutive pass; this pass both probes drew the
  smaller known rendering, criteria text identical). Latest feed
  (2026-10-14T00:32Z, the pass's final confirming run): changed=0,
  with_errors=1, drift 15 alerts / 7 watch / 10 ok, 0 unwatched,
  unpublished rates 5, pricing diff vs the 2026-10-11 baseline
  7 rows. The 15 alerts are exactly the final run's partial
  records — the standing host-gated cohort on a heavily gated
  night (which members fail rotates with the hosts' gates;
  Seedance 3.0's criteria pages never answered the checker path
  this pass — IncompleteRead in every run and probe — so its
  watch stands on absence of evidence, stated plainly in the
  record). The pass raised 2 flags across its five completed
  runs, both ending in calibrations: Soul Cinema's
  aiforautomation article (flagged twice on proven rendering
  alternation; exact-URL signature exclusion — with it, all
  three of Soul Cinema's sources are signature-excluded and its
  watch is carried by per-pass probe reads) and Gemini Omni's
  MarkTechPost article (dismissed on run 3's flag as embed
  variance; calibrated after run 4's second flag drew the other
  known rendering). PixVerse V6's docs source fetched clean at
  its baseline signature in the pass's later runs and both
  probes — a ninth consecutive clean pass. FLUX rate watch:
  BFL's official docs pricing page held its 2.16 baseline
  (f95831ee…, 9,728 chars) in the completed runs this pass —
  the page's three known renderings (cb1e92d1…, f95831ee…,
  3f90e01a…) are all on record, its table verified in full.
- Model Showdown (Watchtower 2.9): `showdown.html` is generated by
  `build_site.py`'s `build_showdown` from the same four Watchtower
  artifacts (models.json, pricing.json, model-checks.json,
  model-history.json) — never hand-edit `site/showdown.html`. The
  page embeds every model's showdown record as a JSON island and
  `assets/js/showdown.js` renders any pairing from it; the default
  pairing is pre-rendered by the builder under the same rules, so
  the page reads identically without JavaScript. Edges are direct
  comparisons of published values only; an unpublished rate renders
  as unpublished. It is wired into the index nav, the footer, the
  search index, and the compare page's link row.
- Continuity Ledger (rotation 13): `continuity.html` is generated by
  `build_site.py`'s `build_continuity` from the character-consistency
  chapter's own checklist and rejection rules — never hand-edit
  `site/continuity.html`. The five locks and verdict rules live in two
  places by design: `CONTINUITY_LOCKS`/`continuity_eval` in
  `build_site.py` (pre-renders the default ledger) and
  `assets/js/continuity.js` (`ContinuityEngine`, the browser copy) —
  `scripts/continuity.test.js` pins the engine, and validate.sh stage 7
  runs it. A drifted lock holds the chain and a broken lock stops it;
  no lock or state is ever invented by the page. Wired into the nav
  index, the footer, and the search index.
- Cut Sheet (rotation 16): `cut.html` is generated by
  `build_site.py`'s `build_cut` from the editing chapters' own
  gates, inspection pass, and mechanical rules — never hand-edit
  `site/cut.html`. The gates/rules live in two places by design:
  `CUT_*`/`cut_effective`/`cut_eval` in `build_site.py`
  (pre-renders the default sheet) and `assets/js/cut.js`
  (`CutEngine`, the browser copy) — `scripts/cut.test.js` pins
  the engine (16 assertions: the 5-second rule, the structural
  rule, the two-strike rule), and validate.sh stage 7 runs it. A
  hold over five seconds without the frame check reads
  uninspected and stops picture lock; a shot cut from the film
  blocks nothing. Wired into the nav index, the footer, the
  search index, and the generated llms tool list; HAND skill
  `editing-cut-sheet` in the delivery family (skills 238 → 239).
- Take Sheet (rotation 17): `take.html` is generated by
  `build_site.py`'s `build_take` from the directing-performance
  chapter's own gates, checklist, and mechanical rules — never
  hand-edit `site/take.html`. The gates/rules live in two places
  by design: `TAKE_*`/`take_effective`/`take_eval` in
  `build_site.py` (pre-renders the default sheet) and
  `assets/js/take.js` (`TakeEngine`, the browser copy) —
  `scripts/take.test.js` pins the engine (15 assertions: the
  label rule, the three-rehearsal rule, the close-up rule), and
  validate.sh stage 7 runs it. An emotion label reads undirected
  and stops performance lock; a hybrid beat blocks nothing.
  Wired into the nav index, the footer, the search index, and
  the generated llms tool list; HAND skill
  `directing-take-sheet` in the craft family (skills 239 → 240).
- Longform Sheet (rotation 18): `longform.html` is generated by
  `build_site.py`'s `build_longform` from the long-form pipelines
  chapter's own gates, checklist, and mechanical rules — never
  hand-edit `site/longform.html`. The gates/rules live in two
  places by design: `LONG_*`/`long_effective`/`long_eval` in
  `build_site.py` (pre-renders the default sheet) and
  `assets/js/longform.js` (`LongformEngine`, the browser copy) —
  `scripts/longform.test.js` pins the engine (15 assertions: the
  stress-test rule, the chaining rule, the draft rule), and
  validate.sh stage 7 runs it. A scene generated without its
  stress test reads untested and stops feature lock; a scene
  cut from the film blocks nothing. Wired into the nav index,
  the footer, the search index, and the generated llms tool
  list; HAND skill `longform-assembly-sheet` in the longform
  family (skills 240 → 241).
- The Path (rotation 19): `path.html` is generated by
  `build_site.py`'s `build_path` from the hand-authored
  `data/v1/curriculum.json` (on `build_api.py`'s preserve list) —
  never hand-edit `site/path.html` or `site/data/v1/curriculum.json`.
  The curriculum sequences all 241 pre-existing skills exactly
  once into six stages in production order (37 / 40 / 41 / 44 /
  43 / 36); `assets/js/path.js` (`PathEngine`) computes the
  walker's standing from the curriculum embedded as a JSON
  island, and check-offs persist under the Path's own
  localStorage key (`afg-the-path-v1`, never the homepage goal
  routes' key). `scripts/path.test.js` pins the coverage law
  (241/241 exactly once) and the engine (15 assertions), and
  validate.sh stage 7 runs it. The page links to, and is not a
  replacement for, the homepage's "Pick your path" goal routes
  (4–5 chapters per goal). HAND companion skill
  `workflow-walk-the-path` in the workflow family (skills
  241 → 242) — it teaches the walk and is deliberately not a
  stop on the path it describes. Minimal-register build
  (2026-10-13 user order): stages render as collapsed
  disclosures, one check-off per row, no per-skill prose on
  the page — all content reachable, nothing on screen that
  does not do a job.
- Skills Usefulness Audit + per-skill pages (rotation 20): every skill
  in `skills/index.json` carries a plain-language `gets_you` line and an
  `audience` (`beginner` | `reference`) — `scripts/build_skills.py`
  refuses to build a skill without one. The audit record is
  `SKILLS_AUDIT.md` + `data/v1/skills-audit.json` (format
  skills-audit/2.0, on `build_api.py`'s preserve list, kept by
  `scripts/audit_skills.py`; verdicts 222 pass / 12 rewrite-to-usable /
  8 demote-to-reference → 234 of 242 beginner-usable). The 8 reference
  skills render banner-marked and grouped separately — never deleted,
  never posing as beginner skills. `build_site.py`'s
  `build_skill_pages()` renders every skill body to
  `site/skills/<id>.html` (front door: what / gets-you / first step /
  needs / effort / level / prerequisite / worked example + plain-words
  jargon glosses); skills-browser cards and Path rows link to them
  (242/242 and 241/241, proven by `scripts/skill-pages.test.js` in
  validate.sh stage 7).
- Graduated techniques (rotation 13): cross-page View Transitions are
  site-wide CSS in `assets/css/base.css` (`@view-transition` under the
  reduced-motion no-preference guard; cut-shaped root animations) —
  there is no JS and no per-page wiring to maintain. The reading
  progress bar is scroll-driven where supported (`motifs.css`:
  `animation-timeline: scroll(root)` under `@supports`); `docs.js`
  detects the same support and keeps only the timecode readout, and
  drives the bar itself where unsupported. Do not remove the JS
  fallback — it is the no-support path, not dead code.
- Episode Forge (Watchtower 2.10): `forge.html` is generated by
  `build_site.py`'s `build_forge` from the guide's own library data
  (prompt-templates.json + prompts-facets.json + teardowns.json) —
  never hand-edit `site/forge.html`. The arc and scoring live in two
  places by design: `FORGE_ARC`/`forge_plan` in `build_site.py`
  (pre-renders the default plan) and `assets/js/forge.js`
  (`ForgeEngine`, the browser copy) — `scripts/forge.test.js` pins
  the engine against the real data, and the pre-rendered default
  plan is screenshot-checked against the JS render. A beat under
  the match bar renders as uncovered; no template is ever invented.
  Wired into the index nav, the footer, and the search index.
- `vercel.json` in live repo: valid JSON, `outputDirectory: "."`,
  `functions` lists the 5 routes as explicit paths with
  `{"maxDuration": 10}`, crons + headers carried over from the working
  config, no build step.
- Vercel functions entries need ≥1 valid property — use
  `{"maxDuration": 10}` per explicit function path; never set runtime
  for Node (omit it); never broad globs (2026-10-12).
- Deployability: 6 functions ≤ 12; each function designed within the 10s
  Hobby timeout (local harness: warm hits ~2ms, cron slice bounded by
  8 URLs × 4s timeout sequential ≈ worst-case design stays inside 10s);
  build machine Standard (never Turbo).

## Free-tier / best-pattern audit (rotation 12, 2026-10-13)

Numbers measured on the working repo's own harness and code, stated
with their assumptions. The live layer must stay inside Vercel Hobby
free tiers with headroom; nothing here may bill.

**Function count: 6 of the 12-function fleet cap** — `health`,
`models-status`, `models-pricing`, `models-changes`, `calc-cost`,
`cron/watchtower`. Zero npm dependencies (cold-start friendly:
handlers are 2.8–12.8 KB of plain CommonJS plus shared lib; the data
they serve is precomputed JSON `require`d from the bundle — no
per-request computation over upstream sources anywhere except the
cron's bounded slice).

**Estimated monthly invocations (traffic assumption stated):**
3,000 pageviews/month site-wide (a niche reference guide), ~40%
landing on API-backed pages (model watch, budget, cutting room,
green light) at ~1.5 live calls per view after the ApiClient's
single-flight fallback behaviour ≈ **1,800 browser-originated calls
gross**. The edge cache (`s-maxage=600, stale-while-revalidate=86400`
on every read endpoint; health `s-maxage=60` + SWR) collapses origin
executions to at most ~1 per endpoint per 10 minutes per PoP, so
**realistic origin invocations ≈ 300–600/month, plus 30 cron runs**
(1/day) — **under 1% of the 100k/month Hobby invocation budget**.
At 10× the assumed traffic the layer is still under ~6% of budget;
bandwidth is dominated by static pages, not functions.

**Worst-case function duration vs the 10s Hobby ceiling:**
- Read endpoints + calc-cost: local-harness warm responses measured
  **13–57 ms** (first local hit ≤184 ms including harness overhead);
  they read only bundled JSON, so production duration is dominated by
  cold start, not work — two orders of magnitude under the ceiling.
- Cron (the only upstream-calling function): **bounded by design
  after this rotation's fix.** Previously a source fetch could start
  at the 7s run-budget deadline and run its full 4s timeout past it
  (≈11s), and GitHub commit-back calls carried 8s timeouts after the
  slice — a token-configured run could exceed 10s and be killed
  mid-commit. Now: a fetch may only start while a full 4s timeout
  fits inside the 7s budget (`FETCH_LATEST_START_MS`), the domain-gap
  sleep re-checks the deadline, GitHub reads/writes from the cron run
  at a 2.5s timeout (`GH_TIMEOUT_MS` in `server/lib/github.js`), and
  commit-back is **skipped with an honest note** when the budget is
  already spent (state recomputed, committed next run). Design worst
  case: state load ≤5s (2 × 2.5s, bundle fallback) is exclusive with
  the slice in practice — the slice budget is measured from function
  start, so slice + response stays ≤ ~7.5s, inside the ceiling.

**What degrades first, in order:** (1) the per-IP rate limiter
(60/min public, 20/min compute, per-instance token bucket) returns
honest 429 envelopes — the frontend treats any non-ok as "use the
static fallback", so the page stays fully readable on `data/v1/*.json`;
(2) edge SWR serves stale-while-revalidate rather than queueing origin
work; (3) the cron defers commit-back (above) instead of failing;
(4) health reports `degraded` (never 5xx) when fallback data is
missing or stale — the surfacing model is the Watchtower board's own
badge states (`live | waking | cached | none`), Trend's Live Wire
pattern. Hobby caps pause rather than bill, and nothing in the layer
scales cost with traffic beyond invocations counted above.

**Static-first alignment:** every page reads identically with the API
down (pre-rendered HTML + static JSON fallback, `force-cache`); the
working `vercel.json` now also puts the same SWR cache header on
`/data/v1/*` static JSON (synced to -live on the next ordered push),
so the fallback path itself is edge-cached. No function computes
what a build step could precompute; the one job that must run live
(the cron) is day-keyed, idempotent, slice-bounded, and never
auto-mutates the model records (it flags; the review desk adjudicates).

**Generator-safety notes (rotation 12 additions):**
- Board correction (research cycle 81): the Artificial Analysis T2V
  board's r82 table lives in `field/2026-developments.md` (chapter
  source — safe to edit); the Kling 3.0 rank correction was made at
  its sources — the research artifact's `what_changed` (which
  `build_api.py` re-reads into `models.json`) and the hand-maintained
  `data/v1/model-updates.md` (on `build_api.py`'s preserve list).
  Never hand-edit `data/v1/models.json` or `site/*` for board copy.
- Script Clearance (rules 1358–1367): `clearance.html` is generated
  by `build_site.py`'s `build_clearance` — never hand-edit
  `site/clearance.html`. The steps/items/verdict logic lives in two
  places by design: `CLEARANCE_*` + `clearance_eval` in
  `build_site.py` (pre-render) and `assets/js/clearance.js`
  (`ClearanceEngine`, the browser copy) — `scripts/clearance.test.js`
  pins the engine (19 assertions) and validate.sh stage 7 checks the
  page, the engine, and the chapter page exist. The chapter source is
  `legal/script-clearance.md` (in `CHAPTER_ORDER["legal"]`); the
  skill is a `build_skills.py` HAND entry (`legal-script-clearance`).

## Open / not yet done

- Vercel project itself not yet created; import the -live repo (not this one).
Retired 2026-10-24 (fleet-data migration): no GITHUB_REPO_TOKEN is used anywhere. Live data refreshes through the astercast/fleet-data repo; the fleet watchdog does the checking.
- Static data fallback paths: frontend `fetchWithFallback` static paths now
  point at `/data/v1/*.json` (Vercel never serves `api/` statics);
  `tests/api.test.sh` §7 and `tests/local-server.js` updated to match.
