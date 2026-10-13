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
| `GET /api/models-status` | `api/models-status.js` | 31 models, status enum |
| `GET /api/models-pricing` | `api/models-pricing.js` | 31-model pricing, `?model_id=` filter |
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
  Current state: 48 history events, queue at 6 (5 standing watches + 1 fresh flag).
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
