'use strict';
/* POST /api/calc-cost — film-watchtower v1.0.0 (ARCHITECTURE.md §7.1).
 * Cost calculator backed by the REAL pricing table (models-pricing), never
 * hardcoded numbers. Arithmetic on declared inputs only (§6 rule 4).
 *
 * Input:  {model_id, seconds, resolution_tier, clips=1}
 * Output: {cost_low, cost_high, currency:'USD', breakdown[], pricing_as_of, note}
 *
 * Per-second models only. Image/per-clip models get a human-readable 400;
 * the free local engine (Mirage Tesseract) computes to $0 honestly.
 * Rate limit: compute bucket (20/min). Cache-Control: no-store.
 */
var env = require('../lib/envelope.js');
var rl = require('../lib/ratelimit.js');

var SERVICE = 'film-watchtower';
var VERSION = '1.0.0';

var PRICING = require('./v1/pricing.json');

var MAX_SECONDS = 86400; // 24h of footage per call — sanity bound
var MAX_CLIPS = 1000;

function findModel(id) {
  var want = String(id).toLowerCase();
  return PRICING.entries.filter(function (e) { return e.model_id === want; })[0] || null;
}

function normTier(s) {
  return String(s).toLowerCase().replace(/[\s_\-]+/g, '');
}

function round4(n) { return Math.round(n * 10000) / 10000; }

module.exports = function (req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return env.err(res, SERVICE, VERSION, 405, 'BAD_INPUT', 'Method not allowed. Use POST with a JSON body.', { method: req.method });
  }
  var lim = rl.checkLimit(rl.clientIp(req), 'compute');
  if (!lim.allowed) {
    console.log('[ratelimit] ip=' + rl.ipHash(rl.clientIp(req)) + ' bucket=compute path=/api/calc-cost');
    return env.err(res, SERVICE, VERSION, 429, 'RATE_LIMITED',
      'Too many calculations. Slow down and try again.',
      { retry_after_s: lim.retryAfter }, { headers: { 'Retry-After': String(lim.retryAfter) } });
  }

  var body = req.body;
  var fields = {};
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return env.err(res, SERVICE, VERSION, 400, 'BAD_INPUT',
      'Send a JSON body like {"model_id":"veo-3-1","seconds":8,"resolution_tier":"standard-720p","clips":1}.',
      { fields: { body: 'must be a JSON object' } });
  }

  if (typeof body.model_id !== 'string' || !body.model_id.trim()) {
    fields.model_id = 'required: a model_id from /api/models-pricing, e.g. "veo-3-1"';
  }
  var seconds = body.seconds;
  if (typeof seconds !== 'number' || !isFinite(seconds) || seconds <= 0 || seconds > MAX_SECONDS) {
    fields.seconds = 'required: a number of seconds per clip, > 0 and <= ' + MAX_SECONDS;
  }
  var clips = body.clips === undefined ? 1 : body.clips;
  if (!Number.isInteger(clips) || clips < 1 || clips > MAX_CLIPS) {
    fields.clips = 'optional: an integer 1–' + MAX_CLIPS + ' (default 1)';
  }
  if (typeof body.resolution_tier !== 'string' || !body.resolution_tier.trim()) {
    fields.resolution_tier = 'required: a tier name from the model\'s pricing entry, e.g. "720p"';
  }
  if (Object.keys(fields).length) {
    return env.err(res, SERVICE, VERSION, 400, 'BAD_INPUT',
      'The cost calculator needs a model, a duration, and a pricing tier. Fix the marked fields and retry.',
      { fields: fields });
  }

  var model = findModel(body.model_id);
  if (!model) {
    return env.err(res, SERVICE, VERSION, 404, 'NOT_FOUND',
      'Unknown model_id "' + String(body.model_id).slice(0, 80) + '". GET /api/models-pricing lists every model_id.',
      { model_id: String(body.model_id).slice(0, 80) });
  }
  if (model.pricing_status === 'discontinued') {
    return env.err(res, SERVICE, VERSION, 400, 'BAD_INPUT',
      model.model + ' is discontinued — there is no current pricing to calculate from.',
      { fields: { model_id: 'model is discontinued' } });
  }

  var wantTier = normTier(body.resolution_tier);
  var tier = model.tiers.filter(function (t) { return normTier(t.tier) === wantTier; })[0] || null;

  if (!tier) {
    var available = model.tiers.map(function (t) { return t.tier; });
    return env.err(res, SERVICE, VERSION, 400, 'BAD_INPUT',
      'No pricing tier "' + String(body.resolution_tier).slice(0, 60) + '" for ' + model.model + '.',
      { fields: { resolution_tier: available.length ? 'pick one of: ' + available.join(', ') : 'this model has no published USD tiers — verify live' } });
  }

  // Free local engine: honestly $0.
  if (tier.unit === 'unlimited' && tier.usd_low === 0 && tier.usd_high === 0) {
    return env.ok(res, SERVICE, VERSION, {
      model_id: model.model_id, model: model.model, tier: tier.tier,
      cost_low: 0, cost_high: 0, currency: 'USD',
      breakdown: [{ tier: tier.tier, unit: tier.unit, usd_per_second_low: 0, usd_per_second_high: 0,
                    seconds: seconds, clips: clips, subtotal_low: 0, subtotal_high: 0 }],
      pricing_as_of: model.updated_at,
      note: tier.basis
    }, { source: 'live', noCache: true });
  }
  if (tier.unit !== 'second') {
    return env.err(res, SERVICE, VERSION, 400, 'BAD_INPUT',
      model.model + ' is priced per ' + tier.unit + ', not per second — this calculator works on per-second video tiers.',
      { fields: { resolution_tier: 'model "' + model.model_id + '" is priced per ' + tier.unit } });
  }

  var subLow = round4(tier.usd_low * seconds * clips);
  var subHigh = round4(tier.usd_high * seconds * clips);
  var confidenceNote = (tier.confidence === 'official' || tier.confidence === 'vendor-confirmed')
    ? 'Rate confidence: ' + tier.confidence + '.'
    : 'Rate confidence: ' + tier.confidence + ' — verify live before budgeting.';
  env.ok(res, SERVICE, VERSION, {
    model_id: model.model_id,
    model: model.model,
    tier: tier.tier,
    cost_low: subLow,
    cost_high: subHigh,
    currency: 'USD',
    breakdown: [{
      tier: tier.tier,
      unit: 'second',
      usd_per_second_low: tier.usd_low,
      usd_per_second_high: tier.usd_high,
      seconds: seconds,
      clips: clips,
      subtotal_low: subLow,
      subtotal_high: subHigh
    }],
    pricing_as_of: model.updated_at,
    note: tier.basis + ' ' + confidenceNote
  }, { source: 'live', noCache: true });
};
