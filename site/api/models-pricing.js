'use strict';
/* GET /api/models-pricing — film-watchtower v1.0.0 (ARCHITECTURE.md §7.1).
 * Real pricing data endpoint. Serves the curated pricing table
 * (api/v1/pricing.json at the repo root — curated from models.json's verified
 * research by the wave engine; copied to site/api/v1/ at build time — the
 * watchtower cron flags pricing-page changes for review but never auto-edits
 * rates: fetched pages are unreliable signals).
 *
 * data: {as_of, currency, disclaimer, models: [{model_id, name, provider,
 *         type, status, pricing_status, tiers: [{tier, unit, usd_low,
 *         usd_high, basis, confidence}], updated_at, source_urls[], note}]}
 *
 * Static fallback: /api/v1/pricing.json itself (same file, §3).
 * Query: ?model_id= filters to one model (unknown id -> 404 NOT_FOUND).
 */
var env = require('../lib/envelope.js');
var rl = require('../lib/ratelimit.js');

var SERVICE = 'film-watchtower';
var VERSION = '1.0.0';

var PRICING = require('./v1/pricing.json');

function findModel(id) {
  var want = String(id).toLowerCase();
  return PRICING.entries.filter(function (e) { return e.model_id === want; })[0] || null;
}

module.exports = function (req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return env.err(res, SERVICE, VERSION, 405, 'BAD_INPUT', 'Method not allowed. Use GET.', { method: req.method });
  }
  var lim = rl.checkLimit(rl.clientIp(req), 'public');
  if (!lim.allowed) {
    console.log('[ratelimit] ip=' + rl.ipHash(rl.clientIp(req)) + ' bucket=public path=/api/models-pricing');
    return env.err(res, SERVICE, VERSION, 429, 'RATE_LIMITED',
      'Too many requests. Slow down and try again.',
      { retry_after_s: lim.retryAfter }, { headers: { 'Retry-After': String(lim.retryAfter) } });
  }

  var q = req.query || {};
  var entries = PRICING.entries;
  if (q.model_id !== undefined) {
    var m = findModel(q.model_id);
    if (!m) {
      return env.err(res, SERVICE, VERSION, 404, 'NOT_FOUND',
        'Unknown model_id "' + String(q.model_id).slice(0, 80) + '". See /api/models-pricing for the full list.',
        { model_id: String(q.model_id).slice(0, 80) });
    }
    entries = [m];
  }

  var payload = {
    as_of: PRICING.generated_at,
    currency: PRICING.currency,
    disclaimer: PRICING.disclaimer,
    credit_basis: PRICING.credit_basis,
    models: entries
  };
  var unpublished = entries.filter(function (e) { return e.pricing_status !== 'live'; }).length;
  env.ok(res, SERVICE, VERSION, payload, {
    source: 'live',
    degraded: false,
    note: unpublished ? unpublished + ' of ' + entries.length + ' models have no published USD rate; their tiers are empty — verify live before budgeting.' : null,
    upstream: [{ source: 'pricing-table', ok: true, checked_at: PRICING.generated_at }]
  });
};
