'use strict';
/* GET /api/models-status, film-watchtower v2.0.0 (ARCHITECTURE.md §7.1,
 * Watchtower 2.0). Live per-model release/status watch. Reads the
 * watchtower's committed state (model-checks.json, refreshed daily by
 * /api/cron/watchtower), joins model_id from pricing.json, and wraps it
 * in the §1.1 envelope.
 *
 * data.models[]: {id, name, provider, status, last_checked, change_summary,
 *                 source_urls[]}, the v1 shape, unchanged. Watchtower 2.0
 * adds per-model `drift_severity` + `drift_alerts` (server/lib/drift.js)
 * and a top-level `drift_summary`, computed against models.json,
 * pricing.json, and the model-history event log.
 * status: stable | changed | error | unwatched
 *
 * Static fallback: /data/v1/model-checks.json (§3).
 * SLA 24h (§8 data_freshness in /api/health).
 */
var env = require('../lib/envelope.js');
var rl = require('../lib/ratelimit.js');

var SERVICE = 'film-watchtower';
var VERSION = '2.0.0';

var drift = require('../lib/drift.js');

var CHECKS = require('../data/v1/model-checks.json');
var PRICING = require('../data/v1/pricing.json');
var MODELS = require('../data/v1/models.json');
var HISTORY = require('../data/v1/model-history.json');

var NAME_TO_ID = {};
PRICING.entries.forEach(function (e) { NAME_TO_ID[e.model] = e.model_id; });

function slugify(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function statusOf(rec) {
  if (rec.changed) return 'changed';
  var srcs = rec.source_results || [];
  if (srcs.length === 0) return 'unwatched';
  if (rec.source_status === 'error') return 'error';
  if (srcs.some(function (s) { return !s.ok; })) return 'error';
  return 'stable';
}

function changeSummary(rec) {
  if (!rec.changed) return null;
  var changed = (rec.source_results || []).filter(function (s) { return s.changed_since_baseline; });
  var urls = changed.map(function (s) { return s.url; });
  var where = urls.length ? ' on ' + urls.slice(0, 2).join(', ') + (urls.length > 2 ? ' (+' + (urls.length - 2) + ' more)' : '') : '';
  return 'Content signature moved' + where + ', flagged for human review (may be marketing-copy noise, not a real model change).';
}

function buildPayload() {
  var d = drift.computeDrift({
    modelsDoc: MODELS, checksDoc: CHECKS, pricingDoc: PRICING,
    historyDoc: HISTORY, nowMs: Date.now()
  });
  var driftByName = {};
  d.per_model.forEach(function (r) { driftByName[r.name] = r; });
  var models = CHECKS.models.map(function (rec) {
    var dr = driftByName[rec.model] || null;
    return {
      id: NAME_TO_ID[rec.model] || slugify(rec.model + '-' + rec.platform),
      name: rec.model,
      provider: rec.platform,
      type: rec.type || null,
      status: statusOf(rec),
      last_checked: rec.last_checked || null,
      change_summary: changeSummary(rec),
      source_urls: (rec.source_results || []).map(function (s) { return s.url; }),
      drift_severity: dr ? dr.severity : 'ok',
      drift_alerts: dr ? dr.alerts : []
    };
  });
  return {
    models: models,
    checked_at: CHECKS.checked_at || null,
    summary: CHECKS.summary || null,
    drift_summary: d.summary,
    stale: false
  };
}

module.exports = function (req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return env.err(res, SERVICE, VERSION, 405, 'BAD_INPUT', 'Method not allowed. Use GET.', { method: req.method });
  }
  var lim = rl.checkLimit(rl.clientIp(req), 'public');
  if (!lim.allowed) {
    console.log('[ratelimit] ip=' + rl.ipHash(rl.clientIp(req)) + ' bucket=public path=/api/models-status');
    return env.err(res, SERVICE, VERSION, 429, 'RATE_LIMITED',
      'Too many requests. Slow down and try again.',
      { retry_after_s: lim.retryAfter }, { headers: { 'Retry-After': String(lim.retryAfter) } });
  }

  var payload = buildPayload();
  var degraded = false;
  var note = null;
  var staleSince = null;
  var anyError = payload.models.some(function (m) { return m.status === 'error'; });
  if (anyError) {
    degraded = true;
    staleSince = payload.checked_at;
    note = 'Some model sources failed their last check; showing the last committed watch state.';
  }
  env.ok(res, SERVICE, VERSION, payload, {
    source: 'live',
    degraded: degraded,
    stale_since: staleSince,
    note: note,
    upstream: [{ source: 'watchtower-state', ok: !anyError, checked_at: payload.checked_at || env.nowIso(),
                 error: anyError ? 'one or more model source checks failed' : undefined }]
  });
};
