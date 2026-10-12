'use strict';
/* drift.js — Watchtower 2.0 drift engine (pure functions, no I/O).
 *
 * Three jobs:
 *  1. diffPricing(baseline, current) — mechanical pricing-change detection.
 *     The baseline is the pricing table as curated on 2026-10-11, stored in
 *     data/v1/model-history.json. Any tier that appears, disappears, or moves
 *     price against it is reported. This is how a rate change gets caught by
 *     arithmetic instead of by someone remembering to look.
 *  2. eventsSince(history, sinceMs) — the "what changed since your last
 *     visit" filter over the hand-authored event log.
 *  3. computeDrift(...) — per-model drift: check status vs record status,
 *     verification staleness, pricing coverage, and price movement, rolled
 *     into a severity (alert | watch | ok) with plain-language reasons.
 *
 * The browser mirror (assets/js/watchtower-lib.js) implements the same
 * functions for the static-fallback path; scripts/watchtower.test.js runs
 * both against the real data and asserts identical output.
 */

var DAY_MS = 86400000;

function slugify(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function daysSince(iso, nowMs) {
  if (!iso) return null;
  var t = Date.parse(iso);
  if (isNaN(t)) return null;
  return Math.max(0, Math.floor((nowMs - t) / DAY_MS));
}

/* Accepts YYYY-MM-DD or a full ISO timestamp. Returns ms epoch or null. */
function parseSince(str) {
  if (str === undefined || str === null || str === '') return null;
  var s = String(str).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) s += 'T00:00:00Z';
  var t = Date.parse(s);
  return isNaN(t) ? null : t;
}

/* Same status rule as /api/models-status: changed flag wins, then source
 * failures, then the no-sources case. */
function checkStatusOf(rec) {
  if (!rec) return 'unwatched';
  if (rec.changed) return 'changed';
  var srcs = rec.source_results || [];
  if (srcs.length === 0) return 'unwatched';
  if (rec.source_status === 'error') return 'error';
  if (srcs.some(function (s) { return !s.ok; })) return 'error';
  return 'stable';
}

function tierKey(t) { return t.tier + '|' + t.unit; }

function round2(n) { return Math.round(n * 100) / 100; }

/* baselineEntries / currentEntries: [{model_id, model, pricing_status,
 * tiers: [{tier, unit, usd_low, usd_high}]}] (the baseline's compact shape
 * and pricing.json entries both fit — extra fields are ignored).
 * Returns changes sorted by model then tier:
 *   {model_id, model, tier, unit, kind, before_low, before_high,
 *    after_low, after_high, pct}
 * kind: model-added | model-removed | tier-added | tier-removed |
 *       price-up | price-down. pct is computed on the range midpoint and
 *       is null when either side is missing or the baseline midpoint is 0.
 */
function diffPricing(baselineEntries, currentEntries) {
  var base = {};
  (baselineEntries || []).forEach(function (e) { base[e.model_id] = e; });
  var cur = {};
  (currentEntries || []).forEach(function (e) { cur[e.model_id] = e; });
  var changes = [];

  Object.keys(cur).forEach(function (id) {
    var c = cur[id];
    var b = base[id];
    if (!b) {
      // A new record's "now" is its full rate span — the cheapest to the
      // priciest tier — so the diff table can show a real number instead
      // of a dash. Null when the new record publishes no rate at all.
      var lows = (c.tiers || []).map(function (t) { return t.usd_low; });
      var highs = (c.tiers || []).map(function (t) { return t.usd_high; });
      changes.push({ model_id: id, model: c.model, tier: null, unit: null,
        kind: 'model-added', before_low: null, before_high: null,
        after_low: lows.length ? Math.min.apply(null, lows) : null,
        after_high: highs.length ? Math.max.apply(null, highs) : null, pct: null });
      return;
    }
    var bTiers = {};
    (b.tiers || []).forEach(function (t) { bTiers[tierKey(t)] = t; });
    var cTiers = {};
    (c.tiers || []).forEach(function (t) { cTiers[tierKey(t)] = t; });
    Object.keys(cTiers).forEach(function (k) {
      var ct = cTiers[k];
      var bt = bTiers[k];
      if (!bt) {
        changes.push({ model_id: id, model: c.model, tier: ct.tier, unit: ct.unit,
          kind: 'tier-added', before_low: null, before_high: null,
          after_low: ct.usd_low, after_high: ct.usd_high, pct: null });
        return;
      }
      if (bt.usd_low !== ct.usd_low || bt.usd_high !== ct.usd_high) {
        var bMid = (bt.usd_low + bt.usd_high) / 2;
        var cMid = (ct.usd_low + ct.usd_high) / 2;
        changes.push({ model_id: id, model: c.model, tier: ct.tier, unit: ct.unit,
          kind: cMid > bMid ? 'price-up' : 'price-down',
          before_low: bt.usd_low, before_high: bt.usd_high,
          after_low: ct.usd_low, after_high: ct.usd_high,
          pct: bMid > 0 ? round2(((cMid - bMid) / bMid) * 100) : null });
      }
    });
    Object.keys(bTiers).forEach(function (k) {
      if (cTiers[k]) return;
      var bt = bTiers[k];
      changes.push({ model_id: id, model: c.model, tier: bt.tier, unit: bt.unit,
        kind: 'tier-removed', before_low: bt.usd_low, before_high: bt.usd_high,
        after_low: null, after_high: null, pct: null });
    });
  });
  Object.keys(base).forEach(function (id) {
    if (cur[id]) return;
    changes.push({ model_id: id, model: base[id].model, tier: null, unit: null,
      kind: 'model-removed', before_low: null, before_high: null,
      after_low: null, after_high: null, pct: null });
  });

  changes.sort(function (a, b) {
    if (a.model_id !== b.model_id) return a.model_id < b.model_id ? -1 : 1;
    return String(a.tier || '') < String(b.tier || '') ? -1 : 1;
  });
  return changes;
}

/* Events strictly after sinceMs (an event ON the since date at 00:00 UTC
 * counts when sinceMs is that midnight — dates are day-granular, so the
 * comparison is by calendar day: event date >= since day). Newest first. */
function eventsSince(history, sinceMs) {
  var events = (history && history.events) || [];
  if (sinceMs === null || sinceMs === undefined) return events.slice().sort(byDateDesc);
  var sinceDay = new Date(sinceMs).toISOString().slice(0, 10);
  return events.filter(function (e) { return e.date >= sinceDay; }).sort(byDateDesc);
}

function byDateDesc(a, b) {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1;
  return a.id < b.id ? -1 : 1;
}

function countKinds(events) {
  var counts = { total: events.length, price: 0, status: 0, release: 0,
    tier: 0, verification: 0, coverage: 0 };
  events.forEach(function (e) { if (counts[e.kind] !== undefined) counts[e.kind]++; });
  return counts;
}

/* input: {modelsDoc, checksDoc, pricingDoc, historyDoc, nowMs}
 * modelsDoc: data/v1/models.json shape; checksDoc: model-checks.json;
 * pricingDoc: pricing.json; historyDoc: model-history.json. */
function computeDrift(input) {
  var nowMs = input.nowMs || Date.now();
  var models = (input.modelsDoc && input.modelsDoc.models) || [];
  var checksByName = {};
  ((input.checksDoc && input.checksDoc.models) || []).forEach(function (r) {
    checksByName[r.model] = r;
  });
  var pricingById = {};
  var pricingByName = {};
  ((input.pricingDoc && input.pricingDoc.entries) || []).forEach(function (e) {
    pricingById[e.model_id] = e;
    pricingByName[e.model] = e;
  });
  var baseline = (input.historyDoc && input.historyDoc.pricing_baseline &&
    input.historyDoc.pricing_baseline.entries) || [];
  var priceChanges = diffPricing(baseline, (input.pricingDoc && input.pricingDoc.entries) || []);
  var movedIds = {};
  priceChanges.forEach(function (c) { movedIds[c.model_id] = true; });

  var latestEventByModel = {};
  ((input.historyDoc && input.historyDoc.events) || []).forEach(function (e) {
    if (!e.model_id) return;
    var prev = latestEventByModel[e.model_id];
    if (!prev || e.date > prev.date) latestEventByModel[e.model_id] = e;
  });

  var perModel = models.map(function (m) {
    var entry = pricingByName[m.model] || null;
    var modelId = entry ? entry.model_id : slugify(m.model);
    var check = checksByName[m.model] || null;
    var checkStatus = checkStatusOf(check);
    var staleDays = daysSince(m.last_verified ? m.last_verified + 'T00:00:00Z' : null, nowMs);
    var pricingStatus = entry ? entry.pricing_status : 'missing';
    var priceMoved = !!movedIds[modelId];
    var alerts = [];

    if (checkStatus === 'changed') {
      alerts.push('Source check flagged a change — queued for review. This record still shows the last verified data.');
    } else if (checkStatus === 'error') {
      alerts.push('The last automated source check failed — this record shows the last verified data.');
    } else if (checkStatus === 'unwatched') {
      alerts.push('No automated source watch yet — verified by hand on the wave cadence.');
    }
    if (pricingStatus === 'unpublished' && m.status !== 'discontinued') {
      alerts.push('No published USD rate — verify live before budgeting.');
    }
    if (pricingStatus === 'missing') {
      alerts.push('No pricing record — verify live before budgeting.');
    }
    if (staleDays !== null && staleDays > 14) {
      alerts.push('Record last verified ' + staleDays + ' days ago — re-check before a paid shoot.');
    }
    if (priceMoved) {
      alerts.push('Pricing table moved against the ' +
        ((input.historyDoc && input.historyDoc.pricing_baseline &&
          input.historyDoc.pricing_baseline.at) || 'baseline').slice(0, 10) +
        ' baseline — see the pricing changes.');
    }

    var severity = 'ok';
    if (checkStatus === 'changed' || checkStatus === 'error') severity = 'alert';
    else if (alerts.length > 0) severity = 'watch';

    var latest = latestEventByModel[modelId] || null;
    return {
      model_id: modelId,
      name: m.model,
      provider: m.platform || (entry && entry.provider) || null,
      type: m.type || null,
      record_status: m.status || 'active',
      check_status: checkStatus,
      last_checked: check ? (check.last_checked || null) : null,
      last_verified: m.last_verified || null,
      stale_days: staleDays,
      pricing_status: pricingStatus,
      price_moved: priceMoved,
      severity: severity,
      alerts: alerts,
      latest_event: latest ? { date: latest.date, kind: latest.kind, summary: latest.summary } : null
    };
  });

  var summary = {
    models_total: perModel.length,
    alert: perModel.filter(function (x) { return x.severity === 'alert'; }).length,
    watch: perModel.filter(function (x) { return x.severity === 'watch'; }).length,
    ok: perModel.filter(function (x) { return x.severity === 'ok'; }).length,
    unwatched: perModel.filter(function (x) { return x.check_status === 'unwatched'; }).length,
    pricing_unpublished: perModel.filter(function (x) { return x.pricing_status === 'unpublished'; }).length,
    price_changes_vs_baseline: priceChanges.length
  };
  return { per_model: perModel, summary: summary, price_changes: priceChanges };
}

module.exports = {
  slugify: slugify,
  daysSince: daysSince,
  parseSince: parseSince,
  checkStatusOf: checkStatusOf,
  diffPricing: diffPricing,
  eventsSince: eventsSince,
  countKinds: countKinds,
  computeDrift: computeDrift
};
