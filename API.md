# AI Film Master Guide — API Reference

Version **1.1.0** · Observed **2026-10-11** · Static JSON, no auth, no rate limits.

Base path: `api/v1/`

## Shared API conventions (all sites)
- Base: `api/v1/` relative to the site root. Works on any static host; no auth, no keys, no rate limits.
- Manifest: `api/v1/index.json` lists every endpoint with its schema URL, `updated` timestamp, and notes. Start here.
- Timestamps: ISO-8601 UTC (`2026-10-11T00:00:00Z`). Date-only fields are `YYYY-MM-DD`.
- Versions: `meta.version` semver on the manifest; breaking changes get a new `v2/` path, never a silent shape change.
- Errors: static files can't return error bodies. A missing endpoint means a wrong path — re-read `index.json`. Empty results are `[]`, never `null`. Every record carries its provenance (`source`, `observed`/`updated`).
- Pagination: not needed — payloads are complete snapshots sized for client-side filtering. If a future endpoint paginates, it will use `?page=` and document it here.
- Freshness: every payload states when it was generated and from what snapshot. Treat undated numbers as stale.

## Endpoints

| Endpoint | Contents | Records |
|---|---|---|
| `index.json` | Manifest: version, endpoints (description, schema URL, updated, counts, notes), documents, skills pointer | 11 |
| `models.json` | 30 models with platform, type, credit cost, strengths, weaknesses, best use; per-model `last_verified`, `status`, `what_changed`, `sources`; `cost_basis` note; explicit `unverified` list. Sora = `discontinued` (service shut Mar–Sep 2026) | 30 |
| `prompt-templates.json` | 47 templates: id, title, track (`core`/`animated`/`photorealistic`/`performance`/`audio`/`longform`/`repair`), prompt, anatomy, use, models | 47 |
| `camera-movements.json` | 22 camera moves: id, move, prompt_phrasing, when_to_use | 22 |
| `checklists.json` | Named checklists (pre-production, per-shot, continuity, audio, delivery) with item arrays | 5 |
| `glossary.json` | 79 terms: term + definition | 79 |
| `competitions.json` | Competition craft records: what each judged competition scores, the production constraints its rules teach, craft lessons from judged work. No prizes, deadlines, or promotional material | 2 |
| `teardowns.json` | 8 shot-by-shot teardowns; prompt reconstructions are analytical, not actual prompts | 8 |
| `diagnoses.json` | 12 failure diagnoses: symptom → craft diagnosis, fixes, repair-template link, source chapters | 12 |
| `model-checks.json` | Model-watch freshness feed: per-model last check, source-signature diffs, news headlines | 22 |
| `model-review-queue.json` | Pending model-watch review items (empty = nothing pending) | 0 |
| `model-updates.md` | Human-readable model changelog (Markdown document, no schema) | — |
| `schema/` | JSON Schema (draft-07) for every endpoint: `index`, `model`, `prompt-template`, `camera-movement`, `checklist`, `glossary`, `competition`, `teardown`, `diagnosis`, `model-checks`, `model-review-queue` | 11 |

## Model object

```json
{
  "model": "Kling 3.0",
  "platform": "Higgsfield",
  "type": "video",
  "est_cost_credits": "7 / 5s 720p",
  "strength": "…",
  "weakness": "…",
  "best_use": "…"
}
```

Costs are Higgsfield credits per 5 seconds unless noted, read from the live
pricing page on 2026-10-10. **Verify live before budgeting.** Anything that
could not be confirmed is in the top-level `unverified` array — never invented.

## Prompt template object

```json
{
  "id": "t5",
  "title": "Action tracking shot",
  "track": "core",
  "prompt": "Tracking shot alongside [SUBJECT] …",
  "anatomy": "camera pace matches subject pace",
  "use": "chases, action",
  "models": ["Kling 3.0", "Luma"]
}
```

Ids are stable: `t1`–`t15` core, `a1`–`a8` animated, `p1`–`p8` photorealistic.
Placeholders use `[BRACKETS]`; keep `[STYLE]` identical across a project.

## Camera movement object

```json
{
  "id": "dolly-in-push-in",
  "move": "Dolly in / Push-in",
  "prompt_phrasing": "\"Slow dolly-in toward [subject]\" …",
  "when_to_use": "Building intimacy or tension; …"
}
```

## Competition object

Competitions are craft references, not events coverage: `what_it_judges`,
`production_constraints` (each paired with its transferable lesson), and
`craft_lessons` from judged work. No prizes, deadlines, or promotional material.

## Skills

217 task procedures in `skills/`, indexed by `skills/index.json`
(id, title, description, path). Each skill file has frontmatter
(`name`, `description`) followed by: Use when, Inputs, Procedure,
Worked example, API references, Pitfalls.

Agents: `api/v1/index.json` carries `repository`, `skills` (directory,
index, count, usage), and `for_agents` routing. Load the skill matching
the task; use the JSON endpoints as the data layer behind it.
Repo-level operator's manual: `AGENT.md` — base URL pattern, key endpoints
with example requests, and five end-to-end workflows (Studio planning,
prompt linting, model price tracking, mini-drama series setup,
microdrama run economics), all
executable via `node scripts/agent-workflows.test.js` against the real
`api/v1` data.

## Regenerating

`python3 scripts/build_api.py` rebuilds `api/v1/` from the research artifacts
under `~/workspace/research_notes/ai-film-mega-research-20261010-0311/artifacts/`
plus the hand-authored competition record. Commit the outputs.
`python3 scripts/build_skills.py` rebuilds `skills/` from `api/v1/` data plus
authored procedures. Commit the outputs.
