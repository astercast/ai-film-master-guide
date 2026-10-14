'use strict';
/* GET /api/models-changes, film-watchtower v2.0.0 (Watchtower 2.0).
 * The "what changed" endpoint. Three answers in one envelope:
 *
 *   events, the hand-authored event log (data/v1/model-history.json)
 *                   filtered to the visitor's window. A change is only listed
 *                   here if the guide's record documents it; nothing is
 *                   inferred from raw page fetches.
 *   price_changes, mechanical diff of the live pricing table against the
 *                   2026-10-11 baseline stored in model-history.json
 *                   (server/lib/drift.js). Catches a rate move even when no
 *                   one wrote an event for it yet.
 *   drift, per-model drift alerts right now: flagged checks, failed
 *                   checks, unwatched models, unpublished rates, stale
 *                   records, moved prices.
 *
 * Query:
 *   ?since=YYYY-MM-DD | ISO timestamp, event window start (default: the
 *     pricing baseline date, i.e. everything the log holds). Invalid → 400.
 *   ?model_id=<id>, restrict events, price changes, and drift to one model.
 *     Unknown id → 404 NOT_FOUND.
 *
 * Static fallback: /data/v1/model-history.json + /data/v1/pricing.json +
 * /data/v1/model-checks.json (the page recomputes the same shapes locally).
 */
var env = require('../lib/envelope.js');
var rl = require('../lib/ratelimit.js');
var drift = require('../lib/drift.js');

var SERVICE = 'film-watchtower';
var VERSION = '2.0.0';

var HISTORY = require('../data/v1/model-history.json');
var PRICING = require('../data/v1/pricing.json');
var CHECKS = require('../data/v1/model-checks.json');
var MODELS = require('../data/v1/models.json');

function knownIds() {
  var ids = {};
  PRICING.entries.forEach(function (e) { ids[e.model_id] = true; });
  (HISTORY.events || []).forEach(function (e) { if (e.model_id) ids[e.model_id] = true; });
  return ids;
}

module.exports = function (req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return env.err(res, SERVICE, VERSION, 405, 'BAD_INPUT', 'Method not allowed. Use GET.', { method: req.method });
  }
  var lim = rl.checkLimit(rl.clientIp(req), 'public');
  if (!lim.allowed) {
    console.log('[ratelimit] ip=' + rl.ipHash(rl.clientIp(req)) + ' bucket=public path=/api/models-changes');
    return env.err(res, SERVICE, VERSION, 429, 'RATE_LIMITED',
      'Too many requests. Slow down and try again.',
      { retry_after_s: lim.retryAfter }, { headers: { 'Retry-After': String(lim.retryAfter) } });
  }

  var q = req.query || {};
  var baselineAt = HISTORY.pricing_baseline.at;
  var sinceMs = drift.parseSince(q.since !== undefined ? q.since : baselineAt.slice(0, 10));
  if (sinceMs === null) {
    return env.err(res, SERVICE, VERSION, 400, 'BAD_INPUT',
      'Query parameter "since" must be a date (YYYY-MM-DD) or ISO timestamp.',
      { fields: { since: 'unparseable date: ' + String(q.since).slice(0, 40) } });
  }
  var sinceDay = new Date(sinceMs).toISOString().slice(0, 10);

  var modelId = null;
  if (q.model_id !== undefined) {
    modelId = String(q.model_id).toLowerCase();
    if (!knownIds()[modelId]) {
      return env.err(res, SERVICE, VERSION, 404, 'NOT_FOUND',
        'Unknown model_id "' + String(q.model_id).slice(0, 80) + '". See /api/models-pricing for the full list.',
        { model_id: String(q.model_id).slice(0, 80) });
    }
  }

  var nowMs = Date.now();
  var all = drift.computeDrift({
    modelsDoc: MODELS, checksDoc: CHECKS, pricingDoc: PRICING,
    historyDoc: HISTORY, nowMs: nowMs
  });

  var events = drift.eventsSince(HISTORY, sinceMs);
  var priceChanges = all.price_changes;
  var driftRows = all.per_model.filter(function (r) { return r.severity !== 'ok'; });
  if (modelId) {
    events = events.filter(function (e) { return e.model_id === modelId; });
    priceChanges = priceChanges.filter(function (c) { return c.model_id === modelId; });
    driftRows = all.per_model.filter(function (r) { return r.model_id === modelId; });
  }

  var payload = {
    since: sinceDay,
    baseline_at: baselineAt,
    counts: drift.countKinds(events),
    events: events,
    price_changes: priceChanges,
    drift_summary: all.summary,
    drift_alerts: driftRows
  };

  var anyError = all.per_model.some(function (r) { return r.check_status === 'error'; });
  env.ok(res, SERVICE, VERSION, payload, {
    source: 'live',
    degraded: anyError,
    stale_since: anyError ? (CHECKS.checked_at || null) : null,
    note: anyError ? 'Some model sources failed their last automated check; drift alerts include them.' : null,
    upstream: [
      { source: 'model-history', ok: true, checked_at: HISTORY.generated_at },
      { source: 'pricing-table', ok: true, checked_at: PRICING.generated_at },
      { source: 'watchtower-state', ok: !anyError, checked_at: CHECKS.checked_at || env.nowIso(),
        error: anyError ? 'one or more model source checks failed' : undefined }
    ]
  });
};
