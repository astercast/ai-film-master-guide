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
  // Watchtower 2.11 (2026-10-13): the ninth review pass ran through a
  // day-long collapse of this machine's egress proxy plus two VM
  // reboots. The final re-baseline feed (2026-10-13T11:03Z) reads
  // changed=0, with_errors=7: the 23 alerts are records carrying at
  // least one failed source, and the failures are infrastructure —
  // the post-run-B sweep of 123 failed URLs found 107 proxy
  // connection-refusals (Errno 111, the proxy refusing, not the
  // hosts) and only 7 answers; the post-run-D sweep corroborates
  // (timeouts dominate; github.com answers). The 3 standing watches
  // were content-verified by checker-path probes and stand (review
  // log pass 10); all 4 flags the pass raised were dismissed (3
  // churn, 1 bad-window artifact). The 2.10 alert set (11) is
  // superseded by this weather-stamped set; pricing diff stays 7.
  const d = drift.computeDrift({ modelsDoc: models, checksDoc: checks,
    pricingDoc: pricing, historyDoc: history, nowMs: NOW });
  assert.strictEqual(d.summary.models_total, 32);
  assert.strictEqual(d.summary.unwatched, 0, JSON.stringify(d.summary));
  assert.strictEqual(d.summary.pricing_unpublished, 5, JSON.stringify(d.summary));
  assert.strictEqual(d.summary.alert, 23, JSON.stringify(d.per_model.filter((r) => r.severity === 'alert')));
  assert.strictEqual(d.summary.price_changes_vs_baseline, 7);
  const alertIds = d.per_model.filter((r) => r.severity === 'alert').map((r) => r.model_id).sort();
  assert.deepStrictEqual(alertIds, ['flux-3-video', 'gemini-omni', 'grok-imagine-1-5', 'hailuo-2-3',
    'kling-4-0', 'ltx-2-5', 'luma-ray-3-2', 'midjourney-v1-video', 'minimax-h3', 'mirage-tesseract',
    'pika-2-5', 'pixverse-v6', 'runway-gen-4-5', 'seedance-3-0', 'sora-2', 'veo-3-1', 'veo-3-1-fast',
    'vidu-q4-preview', 'vidu-s2', 'vivago-r1', 'wan-2-6', 'wan-2-7', 'wan-3-0']);
});

ok('computeDrift: spot severities — weather-stamped 2.11 feed (PixVerse partial, Soul Cinema watch)', () => {
  const d = drift.computeDrift({ modelsDoc: models, checksDoc: checks,
    pricingDoc: pricing, historyDoc: history, nowMs: NOW });
  const byId = Object.fromEntries(d.per_model.map((r) => [r.model_id, r]));
  // PixVerse V6 recovered in 2.10 (docs source clean at the baseline
  // signature in both runs). In 2.11 its docs source answered at the
  // baseline signature (95c88c96…) in an inter-run probe but timed
  // out inside both completed runs, so the published feed honestly
  // carries check_status 'error' / severity 'alert' for it this pass
  // — no second clean run pass is claimed (review log pass 10; the
  // history event 2026-10-13-pixverse-v6-docs-probe-baseline-2-11
  // records the probe evidence). Its record is unchanged.
  assert.strictEqual(byId['pixverse-v6'].check_status, 'error');
  assert.strictEqual(byId['pixverse-v6'].severity, 'alert');
  // The two zero-source records of the Oct 11 feed are watched and clean.
  assert.strictEqual(byId['dop'].check_status, 'stable');
  assert.strictEqual(byId['dop'].severity, 'ok');
  assert.strictEqual(byId['marketing-studio-video'].check_status, 'stable');
  // Sora 2 read ok through 2.10; in 2.11 one of its sources timed out
  // through the collapsed egress in the final run — a weather stamp
  // ('error'), not a content signal.
  assert.strictEqual(byId['sora-2'].check_status, 'error');
  assert.strictEqual(byId['sora-2'].severity, 'alert');
  // Soul Cinema gained its first published rate in 2.3 (Higgsfield's
  // API post, $0.0032/image) — no longer "unpublished"; it sits at
  // watch only because its own new tier is a baseline diff.
  assert.strictEqual(byId['soul-cinema'].severity, 'watch');
  assert(byId['soul-cinema'].alerts.some((a) => a.includes('Pricing table moved')));
  assert(!byId['soul-cinema'].alerts.some((a) => a.includes('No published USD rate')));
  // Wan 2.7 was the PixVerse pattern one generation on (stable, watch
  // on its own pricing diff) through 2.10; in 2.11 its sources timed
  // out in the final run too — 'error' / 'alert', weather again.
  assert.strictEqual(byId['wan-2-7'].check_status, 'error');
  assert.strictEqual(byId['wan-2-7'].severity, 'alert');
  // Kling 3.0 stayed clean through the whole pass (stable / ok); its
  // latest event is this pass's verification-kind calibration record.
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
