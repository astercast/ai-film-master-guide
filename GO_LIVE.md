# GO_LIVE.md — AI Film Master Guide: The Watchtower on Vercel

**Status: LIVE-READY, NOT DEPLOYED. Do not connect Vercel until the user
approves.** No Vercel project exists for this repo yet; nothing has been
deployed anywhere. (Standing rule: GitHub-only until the user says go.)

Spec: `~/workspace/server-program/ARCHITECTURE.md` ("The Watchtower" =
film-watchtower, §7.1). Where this file and the spec disagree, the spec wins.

**One-time deploy model (user's order 2026-10-11):** this repo is NEVER
deployed to Vercel — it is the build engine. A one-time release snapshot
lives in the separate private repo `astercast/ai-film-master-guide-live`
(prebuilt static frontend at repo root + the Watchtower functions under
`api/` + `vercel.json` with functions/crons config; `outputDirectory: "."`,
no build step). Import the -live repo into Vercel (the user connects it in
the browser); the deploy happens via CLI with no git integration; after the
single deploy, the -live repo is never pushed again unless the user
explicitly says "push"/"ship it" in chat. Future work stays GitHub-only in
THIS repo. Build machine on the Vercel project: Standard. Never Turbo.

## 1. What deploys

One Vercel project containing a static frontend plus serverless functions:

- **Static frontend** — `site/` (built by `python3 scripts/build_site.py`,
  timed 0.6s; `outputDirectory: site`). The Cutting Room identity, all
  chapters, tools, and the pre-rendered model-watch / budget pages.
- **6 functions** under `site/api/` (sources live at repo-root `server/api/`,
  copied into `site/` at build time — `build_site.py` wipes `site/` first,
  so function sources must never live only under `site/`):
  - `GET /api/health` — service status, function roster, data-freshness SLAs
  - `GET /api/models-status` — 22-model freshness join (model-checks × pricing)
  - `GET /api/models-pricing` — the curated 31-model pricing table
    (`?model_id=` filter; unknown id → 404)
  - `GET /api/models-changes` — Watchtower 2.0: events since `?since=`,
    the mechanical pricing diff against the 2026-10-11 baseline stored in
    `model-history.json`, and per-model drift alerts (`server/lib/drift.js`)
  - `POST /api/calc-cost` — `{model_id, seconds, resolution_tier, clips}`
    → `{cost_low, cost_high, breakdown[]}`; full 400/404 validation
  - `GET /api/cron/watchtower` — daily incremental freshness refresh
    (Bearer `CRON_SECRET`; see §8)
- **Shared lib** `site/lib/` (from repo-root `server/lib/`): envelope,
  fetchx, ratelimit, cronauth, github, drift (Watchtower 2.0's pure
  pricing-diff / events-window / drift engine) — zero npm dependencies.
- **1 daily cron** — `/api/cron/watchtower` at `0 14 * * *` UTC (see §8).
- **Static fallback data** — `site/data/v1/*.json` (models, pricing,
  model-checks, review queue, …). The frontend calls `/api/*` first and
  falls back to these files; the site never renders an error state because
  the backend was cold or down (ARCHITECTURE.md §3).

## 2. Prerequisites

1. This repo pushed to GitHub (private repo, GitHub-only).
2. Access to the user's Vercel account (Hobby).
3. Secrets generated (see §4):
   - `CRON_SECRET` — random 32+ bytes, e.g. `openssl rand -hex 32`.
   - `GITHUB_REPO_TOKEN` — **pending the user's decision** (spec §14.1):
     either a fine-grained PAT (`contents:write`, this repo only) so the
     daily cron can commit refreshed check data back to the repo, **or**
     deliberately omitted — then the cron is read-only (it still computes
     fresh data and returns it in its response envelope) and static JSON
     updates only via the wave engine's pushes. Zero code change either way.
4. Build machine set to **Standard** (see §4 step 4 and §10 — the $38.64 rule).

## 3. Hookup steps (exact clicks)

1. **vercel.com/new** → Import Git Repository → select
   `astercast/ai-film-master-guide` (private).
2. Framework Preset: **Other**.
   - Build Command: `python3 scripts/build_site.py`
   - Output Directory: `site`
   - Install Command: `echo 'no dependencies'`
3. Environment Variables (Production):
   - `CRON_SECRET` = `<random 32+ bytes>`
   - `GITHUB_REPO` = `astercast/ai-film-master-guide`
   - `REPO_STATIC_PREFIX` = `site/data/v1`
   - `GITHUB_REPO_TOKEN` = `<fine-grained PAT, contents:write, this repo only>`
     — or omit it deliberately (see §2.3); do not leave a placeholder value.
4. **Build machine: Standard.** Project → Settings → Build & Deployment →
   Build Machine → **Standard**. **Never Turbo** — September 2026 Turbo CPU
   billed **$38.64** (invoice 1ZU1WJJS-0012). Turbo buys nothing on a static
   site; builds take under a second.
5. **Deploy.** Open `/api/health` — assert `"status":"ok"` and the `functions`
   list equals `["health","models-status","models-pricing","models-changes","calc-cost",
   "cron/watchtower"]`.
6. Dashboard → **Cron Jobs** — assert `/api/cron/watchtower` is listed at
   `0 14 * * *`. Trigger it once manually (Functions → ⋯ → Test) with
   `Authorization: Bearer <CRON_SECRET>`; check the function logs for
   `[cron] watchtower start` / `[cron] watchtower done …` lines.
7. `curl` the roster and assert the envelope schema (`tests/api.test.sh`
   does this; run it with `BASE=https://<project>.vercel.app`):
   - `GET /api/health` → 200, `ok:true`
   - `GET /api/models-status` → 200, 22 models, statuses in
     `stable|changed|error|unwatched`
   - `GET /api/models-pricing` → 200, 31 models; `?model_id=bogus` → 404
  - `GET /api/models-changes?since=2026-10-01` → 200, October events +
    5 pricing-diff rows; `?since=banana` → 400
   - `POST /api/calc-cost` with `{}` → 400 `BAD_INPUT`
   - `GET /api/cron/watchtower` without secret → 401
8. **Disable test** (§12.3): block `/api/*` (or stop the functions) → reload
   `model-watch.html` and `budget.html` → assert every widget shows its
   pre-rendered/static data with honest `cached · updated HH:MM` badges and
   zero blank widgets or console errors from `api-client.js`.

## 4. Env var table

| name | required? | where set | rotation notes |
|---|---|---|---|
| `CRON_SECRET` | yes | Vercel → Project → Settings → Environment Variables (Production) | Rotate any time: update Vercel, no code change. The cron 401s fail closed on a wrong value. |
| `GITHUB_REPO_TOKEN` | no (pending §14.1 decision) | same as above | Fine-grained PAT, `contents:write`, this repo only. Without it the cron degrades gracefully to read-only (`{committed:false, reason:'no-token'}`). Never commit the token to the repo. |
| `GITHUB_REPO` | yes (used by cron when committing) | same as above | `astercast/ai-film-master-guide`. Only read when `GITHUB_REPO_TOKEN` is set. |
| `REPO_STATIC_PREFIX` | yes (used by cron when committing) | same as above | `site/data/v1` — where the cron writes refreshed check JSON. |

## 5. Hobby limits table

| resource | Hobby limit | our usage |
|---|---|---|
| Bandwidth | 100 GB/mo | static + small JSON; personal-use sites ≈ MBs |
| Build minutes | 6,000/mo | seconds per deploy; daily cron redeploys ≈ negligible |
| Function invocations | 100k/mo | edge cache absorbs reads (§1.6); ~1 cron + trickle |
| Function duration | 10s default (Hobby) | all functions designed ≤10s; no `maxDuration` overrides |
| Cron jobs | daily minimum cadence, UTC, ±60min window, prod only | 1 job, `0 14 * * *` UTC |
| Overage billing | **none — usage pauses instead of charging** | design stays far under limits; a pause is a visible signal, not a bill |

If any site approaches 80% of any Hobby limit, the wave report flags it and
the fix is *less* work (longer edge TTL, smaller payloads) — never a plan
upgrade without the user's explicit word.

## 6. Cold-start behavior

- First hit on a cold function: typically **1–3s** on Hobby. The client
  timeout is **7s** (`LIVE_TIMEOUT_MS` in `assets/js/api-client.js`), so a
  normal cold start still wins the race and the badge flips `waking → live`.
- A cold start that misses 7s loses cleanly: the badge shows
  `cached · updated HH:MM` and the user keeps reading the complete
  pre-rendered page. **First paint never waits for `/api/*`.**
- Local harness measurements (fresh node process, not a true Vercel cold
  start — true cold start is only measurable on a preview deploy):
  first-hit 18ms / warm-hit 2.3ms on `/api/health`; 7.5ms warm on
  `/api/models-pricing`. All far under the 7s budget.
- If first hits ever approach 10s, the 7s client timeout always loses —
  investigate the function (upstream hangs), don't raise the timeout.

## 7. Cron behavior

- **Schedule:** `0 14 * * *` UTC daily (Vercel Cron minimum cadence;
  more frequent schedules fail the deploy). ±60min execution window,
  production only, best-effort.
- **What it does:** bounded incremental refresh of the model-check URLs —
  day-keyed rotation, max 8 URLs/run, 4s per-source timeout, ≤1 request/5s
  per provider domain, sequential for HTML, all inside the 10s function
  budget. Signature-change detection via the repo's clean-text+sha256
  technique. On a moved signature it **flags** the model and appends a
  review-queue item — it **never auto-edits** `models.json`/`pricing.json`
  (repo promotion rule: fetched pages are unreliable signals; a human or the
  wave engine verifies and promotes). Commits only on change
  (`writeJsonIfChanged`), only when `GITHUB_REPO_TOKEN` is set.
- **Idempotent:** 60s duplicate-delivery cooldown; re-running the same day
  re-checks the same rotation slice without duplicating queue items.
- **Alerting:** logs only, `[cron]` prefix. **No log lines in 48h** means the
  cron isn't firing — check Vercel → Cron Jobs (paused? secret rotated?).
- **The weekly deep refresh still exists:** `scripts/refresh/refresh.sh`
  (Monday 09:00 UTC on any always-on machine) runs the full 22-model check
  with Google News RSS passive signals and the noise-control lists; see
  Appendix A. The Vercel cron is the daily incremental layer on top.

## 8. Custom domain notes

- Add the domain in the Vercel dashboard → Domains; the `/api/*` paths move
  with the domain automatically.
- If a domain is assigned later, sweep absolute URLs: `llms.txt`,
  `sitemap.xml`, and the `$id` in `data/v1/schema/envelope.json` (currently
  the planned `ai-film-master-guide.vercel.app` hostname) — spec §14.4.

## 9. Rollback

- `git revert` the offending commit → push → Vercel redeploys the previous
  good state. Functions are stateless; there is no data migration.
- If a bad **static data** file shipped (e.g. a bad `pricing.json`), revert
  that file's commit; the frontend's static fallback immediately serves the
  reverted copy on the next deploy.
- If a bad **function** shipped but static data is good, the site keeps
  working on the fallback path while you revert — the badge shows `cached`,
  nothing looks broken.

## 10. Cost rules (the $38.64 lesson)

September 2026 invoice 1ZU1WJJS-0012: **$38.64** of Turbo build CPU across the
user's projects. Standing rule:

- **Build machine: Standard. Never Turbo.** Vercel dashboard → Project →
  Settings → Build & Deployment → Build Machine → **Standard**. Turbo is what
  billed $38.64; these are static sites with near-instant builds (this repo's
  build: **0.6s**) — Turbo buys nothing.
- `installCommand`: `echo 'no dependencies'` — zero npm packages, nothing to
  install, builds stay seconds-long.
- Static builds are the only builds. Function bundling is part of the static
  build (no separate build minutes).
- Hobby limits table: see §5 (verbatim from the spec).
- If any site approaches 80% of any Hobby limit, the wave report flags it
  and the fix is *less* work — never a plan upgrade without the user's
  explicit word.

## Appendix A — the weekly refresh pipeline (unchanged)

`scripts/refresh/check_models.py` (stdlib only, urllib) + `refresh.sh`
remain the deep-refresh path. Per model: fetches `sources` + per-model
`extra_urls`, strips HTML, sha256 signature per source, compares **per-URL**
against the previous run (a URL counts as moved only if it has a signature
in both runs and they differ — URLs flapping ok↔failed don't drive
`changed`). Optional `extract` regexes for version/price signals. One dead
URL is recorded per-model, never fatal. Exit 0 on partial success; 2 only
if inputs won't load.

- **Google News RSS layer** (public, no-key): each model may carry a
  `news_query`; the checker pulls `news.google.com/rss/search` into
  `news_headlines` (`news_status` ok/failed/skipped/empty). PASSIVE SIGNAL —
  headlines never feed the change signature.
- **Noise control**: verified-noisy rotating marketing pages go in the
  per-model `exclude_from_signature` list (verified 2026-10-11 by
  double-fetch: higgsfield.ai, deepmind.google/technologies/veo/,
  higgsfield.ai/blog/*, marktechpost.com, lumalabs.ai, hailuoai.video, the
  yzrkbys GitHub commit page). Fetched and recorded, never driving `changed`.
- **The checker never auto-mutates `data/v1/models.json`.** A signature diff
  is a *review signal*, not a confirmed fact. Weekly routine: run
  `refresh.sh` → check `logs/refresh.log` + `model-review-queue.json`
  `pending` count → verify each flagged URL by hand → on confirmation edit the
  research artifact
  (`~/workspace/research_notes/ai-film-mega-research-20261010-0311/artifacts/artifact-3-model-comparison.json`
  — generator-owns-output: `data/v1/models.json` is REGENERATED from it and a
  direct edit is wiped), run `build_api.py` + `build_skills.py` + `build_site.py`
  + `build_llms.py`, commit, push.
- **Generator gotcha (fixed 2026-10-11):** `build_api.py` wipes `data/v1/`
  and restores only its `preserved` list — `pricing.json`,
  `schema/envelope.json`, `model-checks.json`, `model-review-queue.json`,
  `diagnoses.json` + schemas are all on that list now. Any new
  hand-maintained `data/v1/` file must be added there or the next rebuild
  deletes it.
- **Build gotcha (fixed Wave B):** `build_site.py` wipes `site/` first —
  the Watchtower function sources live at repo-root `server/api/` +
  `server/lib/` and are copied into `site/` at build time. Never place
  function sources only under `site/`.
- No keys needed: the pipeline fetches public pages only.
