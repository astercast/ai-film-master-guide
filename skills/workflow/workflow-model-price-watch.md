---
name: workflow-model-price-watch
description: Follow one model across models.json, the model-watch freshness feed, and the review queue to answer 'what changed and when'.
---

# Track a model's price and status changes

## Use when

Before budgeting a production on a model, or when a headline says a model changed.

## Inputs

- Model name (exact, e.g. 'Kling 3.0')

## Procedure

1. models.json: read est_cost_credits, status, last_verified, what_changed, sources. Note the unverified list.
2. model-checks.json: find the model's check record — last_checked, changed flag, source_status, fresh news_headlines.
3. model-review-queue.json: check pending items. changed=true is a REVIEW SIGNAL, not a confirmed change — never auto-mutate on it.
4. Report: current cost, last verified date, what's changed since, and whether anything is still awaiting review.

## Worked example

Kling 3.0: '720p ~7/5s', status active, last_verified 2026-10-11; check record last_checked 2026-10-11T22:21:51Z, changed=false; review queue pending=0 — nothing awaiting review.

## API references

- `data/v1/models.json`
- `data/v1/model-checks.json`
- `data/v1/model-review-queue.json`
- `data/v1/model-updates.md`

## Pitfalls

- Treating a source-signature diff as a confirmed price change — the queue exists precisely because landing pages are noisy.
- Budgeting from a stale last_verified — re-verify live before spending.
