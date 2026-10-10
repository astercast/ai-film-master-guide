# AI Film Master Guide — API Reference

Version **1.0.0** · Observed **2026-10-10** · Static JSON, no auth, no rate limits.

Base path: `api/v1/`

## Endpoints

| Endpoint | Contents |
|---|---|
| `index.json` | Manifest: name, version, observation date, provenance, endpoint map |
| `models.json` | 18 models with platform, type, credit cost, strengths, weaknesses, best use; `cost_basis` note; explicit `unverified` list |
| `prompt-templates.json` | 31 templates: id, title, track (`core`/`animated`/`photorealistic`), prompt, anatomy, use, models |
| `camera-movements.json` | 22 camera moves: id, move, prompt_phrasing, when_to_use |
| `checklists.json` | Named checklists (pre-production, per-shot, continuity, audio, delivery) with item arrays |
| `glossary.json` | 79 terms: term + definition |
| `festivals.json` | Festival records: prizes, jury, criteria, timeline, rules, sources, status |
| `schema/` | JSON Schema (draft-07): `model.json`, `prompt-template.json`, `camera-movement.json` |

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

## Festival object

`status` is `"winners_pending"` until winners are announced — do not present
winners as known. Prizes are in USD.

## Regenerating

`python3 scripts/build_api.py` rebuilds `api/v1/` from the research artifacts
under `~/workspace/research_notes/ai-film-mega-research-20261010-0311/artifacts/`
plus the hand-authored festival record. Commit the outputs.
