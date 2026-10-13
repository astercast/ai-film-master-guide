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
| `GET /api/cron/watchtower` | `api/cron/watchtower.js` | Bearer `CRON_SECRET`; read-only without `GITHUB_REPO_TOKEN` |

Shared lib: `lib/{envelope,cronauth,fetchx,github,ratelimit,drift}.js` (from working `server/lib/`).

## Cron schedules

| path | schedule | what it does |
|---|---|---|
| `/api/cron/watchtower` | `0 14 * * *` UTC (daily) | bounded incremental model-freshness refresh; commits only on change and only when token set |

## Env vars (set on the Vercel project, Production)

- `CRON_SECRET` — required (cron 401s fail-closed without it)
- `GITHUB_REPO_TOKEN` — optional; without it the cron is read-only
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
  Current state (Watchtower 2.9): 86 history events, queue at 3 standing
  watches (Seedance 3.0, Kling 4.0, and Soul Cinema's in-app credit
  cost re-checked a seventh pass, unmoved — Kling 4.0's APIMart criteria
  page is signature-identical to the 2.4–2.8 baseline). Latest
  feed (2026-10-13T06:06Z): changed=0, with_errors=0, 10 drift alerts,
  6 on watch. The 7 standing partial records are unchanged (Medium
  ×3, GlobeNewswire, Morningstar 403; whatsnew.fyi 429; europesays.com
  dropped every try); the sources that recovered in 2.7 (MarkTechPost
  ×3, x.ai, midjourney.com) held through all three runs and on
  re-probe. PixVerse V6's docs source fetched clean at its baseline
  signature in the second run but truncated (IncompleteRead) again
  in the final run, so it stays an eighth partial record, labeled as
  observed — no recovery claimed. The final run's two Veo weather
  failures (a mer.vin timeout, a dev.to drop) recovered on re-probe
  at baseline signatures; their partial stamps stay on the feed
  until the next run. Two fresh flags were raised by this pass's own
  runs and both were adjudicated and dismissed (Veo 3.1's pricing
  roundup, stable at its flagged signature with a matching table;
  FLUX 3 Video on a one-character delta in a third-party news story).
  FLUX rate watch: BFL's official docs pricing page
  (docs.bfl.ai/quick_start/pricing) is the signature-live rate
  source — it held its 9,875-char rendering at the 2.6 baseline
  signature in every fetch for a third pass, and its FLUX 3 table
  matches the record exactly; bfl.ai/pricing is signature-excluded
  as an exact URL (since 2.7), still fetched and recorded, and
  served its 22,122-char full rendering in this pass's probes and
  runs. All three of 2.9's checker runs were single and verified
  under the process rule (none alive before, exactly one after each
  launch).
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

## Open / not yet done

- Vercel project itself not yet created; import the -live repo (not this one).
- `CRON_SECRET` not yet generated; `GITHUB_REPO_TOKEN` pending user's call.
- Static data fallback paths: frontend `fetchWithFallback` static paths now
  point at `/data/v1/*.json` (Vercel never serves `api/` statics);
  `tests/api.test.sh` §7 and `tests/local-server.js` updated to match.
