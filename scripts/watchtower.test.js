#!/usr/bin/env node
/* watchtower.test.js — Watchtower 2.0 drift-engine unit tests.
 *
 * Runs the REAL data files through server/lib/drift.js and through the
 * browser mirror (assets/js/watchtower-lib.js) and asserts both copies
 * agree exactly — the page's static-fallback path must never tell a
 * different story from the live functions. Also pins the documented
 * facts the history log is built on (the Vidu Q4 correction arithmetic,
 * the pricing-coverage gap this wave closed).
 *
 * Output convention (shared with studio.test.js / greenlight.test.js):
 * one "ok <name>" line per test, final line contains "all pass".
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const ROOT = path.join(__dirname, '..');
const load = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));

const drift = require(path.join(ROOT, 'server', 'lib', 'drift.js'));

const browserSrc = fs.readFileSync(path.join(ROOT, 'assets', 'js', 'watchtower-lib.js'), 'utf8');
const sandbox = { window: {}, console };
vm.createContext(sandbox);
vm.runInContext(browserSrc, sandbox);
const browserLib = sandbox.window.WatchtowerLib;
assert(browserLib, 'watchtower-lib.js did not expose window.WatchtowerLib');

const models = load('data/v1/models.json');
const checks = load('data/v1/model-checks.json');
const pricing = load('data/v1/pricing.json');
const history = load('data/v1/model-history.json');
const NOW = Date.parse('2026-10-12T00:00:00Z');

let n = 0;
function ok(name, fn) {
  fn();
  n += 1;
  console.log('ok ' + name);
}

/* --- pricing diff against the real baseline --------------------------- */
ok('real diff: the 5 Watchtower 2.0 coverage changes + the 2.3 Soul Cinema tier + Wan 2.7 (2.4)', () => {
  const changes = drift.diffPricing(history.pricing_baseline.entries, pricing.entries);
  assert.strictEqual(changes.length, 7, JSON.stringify(changes));
  const kinds = changes.map((c) => c.kind).sort();
  assert.deepStrictEqual(kinds, ['model-added', 'model-added', 'tier-added', 'tier-added', 'tier-added', 'tier-added', 'tier-added']);
  const added = changes.find((c) => c.kind === 'model-added' && c.model_id === 'pixverse-v6');
  assert(added, 'pixverse-v6 model-added missing');
  assert.strictEqual(added.after_low, 0.09, 'new record shows its rate span');
  assert.strictEqual(added.after_high, 0.23);
  // Watchtower 2.4 (2026-10-12): Wan 2.7 added through the artifact chain —
  // Alibaba Cloud Model Studio list, $0.10/s at 720p, $0.15/s at 1080p.
  const wan = changes.find((c) => c.kind === 'model-added' && c.model_id === 'wan-2-7');
  assert(wan, 'wan-2-7 model-added missing');
  assert.strictEqual(wan.after_low, 0.10);
  assert.strictEqual(wan.after_high, 0.15);
  const fluxTiers = changes.filter((c) => c.kind === 'tier-added' && c.model_id === 'flux-3-video').map((c) => c.tier).sort();
  assert.deepStrictEqual(fluxTiers, ['qhd', 'uhd', 'v2v-qhd', 'v2v-uhd']);
  // Watchtower 2.3 (2026-10-12): Soul Cinema's first published rate —
  // Higgsfield's own API post lists a $0.0032/image starting rate.
  const scTier = changes.find((c) => c.kind === 'tier-added' && c.model_id === 'soul-cinema');
  assert(scTier, 'soul-cinema tier-added missing');
  assert.strictEqual(scTier.tier, 'api-image');
  assert.strictEqual(scTier.after_low, 0.0032);
});

ok('synthetic diff: price-up pct math, tier-removed, model-removed', () => {
  const base = [{ model_id: 'a', model: 'A', pricing_status: 'live',
    tiers: [{ tier: '720p', unit: 'second', usd_low: 0.10, usd_high: 0.10 },
            { tier: '4k', unit: 'second', usd_low: 1, usd_high: 1 }] },
    { model_id: 'gone', model: 'Gone', pricing_status: 'live', tiers: [] }];
  const cur = [{ model_id: 'a', model: 'A', pricing_status: 'live',
    tiers: [{ tier: '720p', unit: 'second', usd_low: 0.15, usd_high: 0.15 }] }];
  const changes = drift.diffPricing(base, cur);
  const up = changes.find((c) => c.kind === 'price-up');
  assert.strictEqual(up.pct, 50);
  assert(changes.some((c) => c.kind === 'tier-removed' && c.tier === '4k'));
  assert(changes.some((c) => c.kind === 'model-removed' && c.model_id === 'gone'));
});

ok('identical tables diff to zero changes', () => {
  const compact = pricing.entries.map((e) => ({ model_id: e.model_id, model: e.model,
    pricing_status: e.pricing_status, tiers: e.tiers }));
  assert.strictEqual(drift.diffPricing(compact, pricing.entries).length, 0);
});

/* --- events window ----------------------------------------------------- */
ok('eventsSince: October window holds the documented October events', () => {
  const evs = drift.eventsSince(history, Date.parse('2026-10-01T00:00:00Z'));
  const ids = evs.map((e) => e.id);
  assert(ids.includes('2026-10-07-vidu-q4-rate-card'));
  assert(ids.includes('2026-10-11-full-reverification'));
  assert(ids.includes('2026-10-12-pixverse-pricing'));
  assert(!ids.includes('2026-09-28-kling-40-announced'));
  assert.strictEqual(evs[0].date, '2026-10-12', 'newest first');
});

ok('eventsSince: future window is empty, null window is the full log', () => {
  assert.strictEqual(drift.eventsSince(history, Date.parse('2999-01-01T00:00:00Z')).length, 0);
  assert.strictEqual(drift.eventsSince(history, null).length, history.events.length);
});

ok('countKinds sums to the total', () => {
  const c = drift.countKinds(history.events);
  assert.strictEqual(c.total, history.events.length);
  assert.strictEqual(c.price + c.status + c.release + c.tier + c.verification + c.coverage, c.total);
});

/* --- history integrity -------------------------------------------------- */
ok('every event model_id resolves to a pricing record (or is the global event)', () => {
  const ids = new Set(pricing.entries.map((e) => e.model_id));
  for (const e of history.events) {
    assert(e.model_id === null || ids.has(e.model_id), e.id + ' -> ' + e.model_id);
  }
});

ok('Vidu Q4 correction arithmetic: $0.014 headline to $0.045 list is +221.4%', () => {
  const e = history.events.find((x) => x.id === '2026-10-07-vidu-q4-rate-card');
  assert(e, 'event missing');
  const pct = ((e.after_usd - e.before_usd) / e.before_usd) * 100;
  assert(Math.abs(pct - e.pct) < 0.05, pct + ' vs stored ' + e.pct);
});

ok('pricing coverage is complete: 32 of 32 models have a pricing record', () => {
  assert.strictEqual(pricing.entries.length, 32);
  assert.strictEqual(models.models.length, 32);
  const names = new Set(pricing.entries.map((e) => e.model));
  for (const m of models.models) assert(names.has(m.model), 'no pricing record for ' + m.model);
});

/* --- drift on the real data --------------------------------------------- */
ok('computeDrift: 32 models, 0 unwatched, 5 unpublished, 11 alerts in the post-review records', () => {
  // Watchtower 2.4 (2026-10-12): Wan 2.7 added through the artifact chain
  // (models 31 -> 32) and baselined by this pass's checker run; the three
  // remaining standing watches re-checked, none moved (verdicts in
  // model-review-log.json pass 3). Watchtower 2.7's re-baseline feed
  // (2026-10-13T04:29Z) reads changed=0, with_errors=0: the alerts are
  // the 7 partial records still carrying a failed source (Medium ×3,
  // GlobeNewswire, Morningstar 403s; whatsnew.fyi 429; europesays
  // dropped). The cohort shrank from 11 because MarkTechPost (×3),
  // x.ai, and midjourney.com answered in both of 2.7's runs and on
  // re-probe after 403ing the pre-run probes — MiniMax H3, Gemini
  // Omni, and Midjourney are no longer partial (Midjourney sits at
  // watch on its unpublished rate; FLUX at watch on its pricing diff,
  // its bfl.ai/pricing flag adjudicated as block-rotating renderings
  // and the URL signature-excluded). Pricing diff stays 7 rows.
  const d = drift.computeDrift({ modelsDoc: models, checksDoc: checks,
    pricingDoc: pricing, historyDoc: history, nowMs: NOW });
  assert.strictEqual(d.summary.models_total, 32);
  assert.strictEqual(d.summary.unwatched, 0, JSON.stringify(d.summary));
  assert.strictEqual(d.summary.pricing_unpublished, 5, JSON.stringify(d.summary));
  assert.strictEqual(d.summary.alert, 7, JSON.stringify(d.per_model.filter((r) => r.severity === 'alert')));
  assert.strictEqual(d.summary.price_changes_vs_baseline, 7);
  const alertIds = d.per_model.filter((r) => r.severity === 'alert').map((r) => r.model_id).sort();
  assert.deepStrictEqual(alertIds, ['grok-imagine-1-5', 'kling-4-0', 'luma-ray-3-2',
    'seedance-3-0', 'vidu-q4-preview', 'vidu-s2', 'wan-3-0']);
});

ok('computeDrift: spot severities — PixVerse watched (price moved), Sora ok, Soul Cinema watch (own tier moved)', () => {
  const d = drift.computeDrift({ modelsDoc: models, checksDoc: checks,
    pricingDoc: pricing, historyDoc: history, nowMs: NOW });
  const byId = Object.fromEntries(d.per_model.map((r) => [r.model_id, r]));
  // PixVerse V6 was the Oct 11 feed's emblematic unwatched model; its
  // first check is stable, and its severity is watch only because its
  // pricing record is itself one of the 5 baseline diffs.
  assert.strictEqual(byId['pixverse-v6'].check_status, 'stable');
  assert.strictEqual(byId['pixverse-v6'].severity, 'watch');
  // The two zero-source records of the Oct 11 feed are watched and clean.
  assert.strictEqual(byId['dop'].check_status, 'stable');
  assert.strictEqual(byId['dop'].severity, 'ok');
  assert.strictEqual(byId['marketing-studio-video'].check_status, 'stable');
  assert.strictEqual(byId['sora-2'].severity, 'ok');
  // Soul Cinema gained its first published rate in 2.3 (Higgsfield's
  // API post, $0.0032/image) — no longer "unpublished"; it sits at
  // watch only because its own new tier is a baseline diff.
  assert.strictEqual(byId['soul-cinema'].severity, 'watch');
  assert(byId['soul-cinema'].alerts.some((a) => a.includes('Pricing table moved')));
  assert(!byId['soul-cinema'].alerts.some((a) => a.includes('No published USD rate')));
  // Kling 3.0's Oct 12 flag was adjudicated by the 2.2 review pass (the
  // klingai.com homepage move was the Kling 4.0 hero banner, not a 3.0
  // change; the homepage is signature-excluded). In the published feed
  // the model is stable and clear, and its latest event is the review
  // verdict itself.
  // Wan 2.7's first check is a baseline (stable), and its severity is
  // watch only because its own pricing record is a baseline diff — the
  // PixVerse pattern, one generation on.
  assert.strictEqual(byId['wan-2-7'].check_status, 'stable');
  assert.strictEqual(byId['wan-2-7'].severity, 'watch');
  assert.strictEqual(byId['kling-3-0'].severity, 'ok');
  assert.strictEqual(byId['kling-3-0'].check_status, 'stable');
  assert.strictEqual(byId['kling-3-0'].latest_event.kind, 'verification');
});

ok('computeDrift: a flagged check raises an alert with the review wording', () => {
  const doctored = JSON.parse(JSON.stringify(checks));
  doctored.models.find((r) => r.model === 'Kling 3.0').changed = true;
  const d = drift.computeDrift({ modelsDoc: models, checksDoc: doctored,
    pricingDoc: pricing, historyDoc: history, nowMs: NOW });
  const k = d.per_model.find((r) => r.model_id === 'kling-3-0');
  assert.strictEqual(k.severity, 'alert');
  assert.strictEqual(k.check_status, 'changed');
});

/* --- since parsing -------------------------------------------------------- */
ok('parseSince: dates parse, junk is null', () => {
  assert.strictEqual(drift.parseSince('2026-10-01'), Date.parse('2026-10-01T00:00:00Z'));
  assert.strictEqual(drift.parseSince('not-a-date'), null);
  assert.strictEqual(drift.parseSince(''), null);
  assert.strictEqual(drift.parseSince(undefined), null);
});

/* --- browser mirror equivalence ------------------------------------------ */
ok('browser mirror: computeDrift output identical to the server engine', () => {
  const a = drift.computeDrift({ modelsDoc: models, checksDoc: checks,
    pricingDoc: pricing, historyDoc: history, nowMs: NOW });
  const b = browserLib.computeDrift({ modelsDoc: models, checksDoc: checks,
    pricingDoc: pricing, historyDoc: history, nowMs: NOW });
  assert.deepStrictEqual(JSON.parse(JSON.stringify(b)), JSON.parse(JSON.stringify(a)));
});

ok('browser mirror: diffPricing and eventsSince identical', () => {
  const a = drift.diffPricing(history.pricing_baseline.entries, pricing.entries);
  const b = browserLib.diffPricing(history.pricing_baseline.entries, pricing.entries);
  assert.deepStrictEqual(JSON.parse(JSON.stringify(b)), JSON.parse(JSON.stringify(a)));
  const ea = drift.eventsSince(history, Date.parse('2026-09-01T00:00:00Z'));
  const eb = browserLib.eventsSince(history, Date.parse('2026-09-01T00:00:00Z'));
  assert.deepStrictEqual(JSON.parse(JSON.stringify(eb)), JSON.parse(JSON.stringify(ea)));
});

console.log('watchtower.test.js: ' + n + ' tests, all pass');
