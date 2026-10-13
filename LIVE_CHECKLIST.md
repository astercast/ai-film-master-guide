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
  Current state (Watchtower 2.7): 77 history events, queue at 3 standing
  watches (Seedance 3.0, Kling 4.0, and Soul Cinema's in-app credit
  cost re-checked a fifth pass, unmoved — Kling 4.0's APIMart criteria
  page is signature-identical to the 2.4/2.5/2.6 baseline). Latest feed
  (2026-10-13T04:29Z): changed=0, with_errors=0, 7 drift alerts (the
  partial records still carrying a failed source), 7 on watch incl.
  Wan 2.7 (baseline + own pricing diff). The partial cohort shrank
  this pass: MarkTechPost (×3), x.ai, and midjourney.com answered in
  both runs and on re-probe after 403ing the pre-run probes. One flag
  in 2.7: FLUX 3 Video, on bfl.ai/pricing — the page served three
  renderings in one pass (2,249-char shell / 22,122-char full page /
  4,680-char calculator rendering), rotating in blocks; its full
  rendering's structured rates match the record, so it is now
  signature-excluded as an exact URL, still fetched and recorded.
  FLUX rate watch: BFL's official docs pricing page
  (docs.bfl.ai/quick_start/pricing) is the signature-live rate source
  — it held its 9,875-char rendering at the 2.6 baseline signature in
  every fetch this pass; its FLUX 3 table matches the record exactly,
  noted in model-check-config.json. A VM reboot killed 2.7's first
  checker launch mid-run before it wrote output; all published
  numbers come from single verified post-reboot runs.
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
