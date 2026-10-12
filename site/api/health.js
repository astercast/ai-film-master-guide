'use strict';
/* GET /api/health — film-watchtower v1.0.0 (ARCHITECTURE.md §1.4).
 * No auth. Edge-cacheable (s-maxage=60 via vercel.json or envelope override).
 * Never returns 5xx: status is "ok" unless a check fails, then "degraded".
 */
var env = require('../lib/envelope.js');

var SERVICE = 'film-watchtower';
var VERSION = '1.0.0';
var STARTED_AT = env.nowIso();
var START_MS = Date.now();

// The §7.1 roster. Wave A test asserts this list matches the spec roster.
var FUNCTIONS = ['health', 'models-status', 'models-pricing', 'calc-cost', 'cron/watchtower'];

function loadJson(path) {
  try { return { ok: true, json: require(path) }; }
  catch (e) { return { ok: false, error: String((e && e.message) || e) }; }
}

function freshnessOf(file, slaS) {
  var r = loadJson(file);
  if (!r.ok) return { generated_at: null, age_s: null, sla_s: slaS, within_sla: false };
  var j = r.json;
  // pricing.json: generated_at; model-checks.json: checked_at; models.json: observed (date only).
  var gen = j.generated_at || j.checked_at || (j.observed ? j.observed + 'T00:00:00Z' : null);
  if (!gen) return { generated_at: null, age_s: null, sla_s: slaS, within_sla: false };
  var ageS = Math.max(0, Math.floor((Date.now() - Date.parse(gen)) / 1000));
  return { generated_at: gen, age_s: ageS, sla_s: slaS, within_sla: ageS <= slaS };
}

module.exports = function (req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return env.err(res, SERVICE, VERSION, 405, 'BAD_INPUT', 'Method not allowed. Use GET.', { method: req.method });
  }

  var checks = {
    static_fallback_present: loadJson('./v1/model-checks.json').ok && loadJson('./v1/pricing.json').ok,
    cron_secret_configured: !!(process.env.CRON_SECRET || ''),
    github_token_configured: !!(process.env.GITHUB_REPO_TOKEN || '')
  };
  var fresh = {
    'model-checks.json': freshnessOf('./v1/model-checks.json', 86400),
    'pricing.json': freshnessOf('./v1/pricing.json', 86400),
    // models.json is a research artifact refreshed by the wave engine (weekly
    // deep-research cadence), not the daily cron — its SLA is 7 days.
    'models.json': freshnessOf('./v1/models.json', 604800)
  };
  var stale = Object.keys(fresh).some(function (k) { return !fresh[k].within_sla; });
  var status = (checks.static_fallback_present && !stale) ? 'ok' : 'degraded';

  env.ok(res, SERVICE, VERSION, {
    status: status,
    service: SERVICE,
    version: VERSION,
    started_at: STARTED_AT,
    uptime_s: Math.floor((Date.now() - START_MS) / 1000),
    node: process.version,
    functions: FUNCTIONS,
    data_freshness: fresh,
    checks: checks
  }, { source: 'live', cacheControl: 'public, s-maxage=60, stale-while-revalidate=86400' });
};
