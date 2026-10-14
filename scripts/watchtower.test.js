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
  // Watchtower 2.19 (2026-10-13): the seventeenth review pass
  // ran five completed checker runs plus checker-path probes
  // for every standing watch and flagged source. All 3
  // standing watches stand (review log pass 18); two flags
  // were raised and both ended in calibrations — Soul
  // Cinema's aiforautomation article (flagged runs 1–2 on
  // proven rendering alternation) and Gemini Omni's
  // MarkTechPost article (dismissed in run 3, calibrated
  // after run 4's second flag drew the other known
  // rendering). Kling 4.0's APIMart page held its baseline
  // signature (fc55ce30…) — a fourteenth consecutive pass.
  // BFL's docs pricing page held its 2.16 baseline
  // (f95831ee…) in the completed runs. PixVerse V6's docs
  // source fetched clean at baseline — the ninth clean
  // pass. Seedance 3.0's criteria pages never answered the
  // checker path this pass (IncompleteRead in every run and
  // probe); its watch stands on absence of evidence. The
  // final feed (2026-10-14T00:32Z): changed=0,
  // with_errors=1; its 15 partials are the standing
  // host-gated cohort on a heavily gated night — the alert
  // set is exactly those 15 partial records, so the count
  // rose 11 → 15 against 2.18's close. Pricing diff 7 rows.
  const d = drift.computeDrift({ modelsDoc: models, checksDoc: checks,
    pricingDoc: pricing, historyDoc: history, nowMs: NOW });
  assert.strictEqual(d.summary.models_total, 32);
  assert.strictEqual(d.summary.unwatched, 0, JSON.stringify(d.summary));
  assert.strictEqual(d.summary.pricing_unpublished, 5, JSON.stringify(d.summary));
  assert.strictEqual(d.summary.alert, 15, JSON.stringify(d.per_model.filter((r) => r.severity === 'alert')));
  assert.strictEqual(d.summary.price_changes_vs_baseline, 7);
  const alertIds = d.per_model.filter((r) => r.severity === 'alert').map((r) => r.model_id).sort();
  assert.deepStrictEqual(alertIds, ['grok-imagine-1-5', 'kling-3-0', 'kling-4-0', 'ltx-2-5',
    'luma-ray-3-2', 'mirage-tesseract', 'runway-gen-4-5', 'seedance-2-0', 'seedance-2-5',
    'seedance-3-0', 'sora-2', 'veo-3-1', 'vidu-q4-preview', 'vidu-s2', 'wan-3-0']);
});

ok('computeDrift: spot severities — PixVerse watched (price moved), Sora ok, Soul Cinema watch (own tier moved)', () => {
  const d = drift.computeDrift({ modelsDoc: models, checksDoc: checks,
    pricingDoc: pricing, historyDoc: history, nowMs: NOW });
  const byId = Object.fromEntries(d.per_model.map((r) => [r.model_id, r]));
  // PixVerse V6 recovered in 2.10 (docs source clean at the baseline
  // signature in both runs); in 2.11 it answered only in an
  // inter-run probe. In 2.12 its docs source fetched clean at the
  // baseline signature (95c88c96…) inside both of the pass's first
  // two completed runs — the second clean pass — so the record is
  // stable and its severity is watch only on its own baseline
  // pricing diff — the PixVerse pattern.
  assert.strictEqual(byId['pixverse-v6'].check_status, 'stable');
  assert.strictEqual(byId['pixverse-v6'].severity, 'watch');
  // The two zero-source records of the Oct 11 feed are watched and clean.
  assert.strictEqual(byId['dop'].check_status, 'stable');
  assert.strictEqual(byId['dop'].severity, 'ok');
  assert.strictEqual(byId['marketing-studio-video'].check_status, 'stable');
  // Sora 2 carries a partial in the heavily gated final run
  // of 2.19, so it reads alert this pass (host gate, not a
  // record change — the model is discontinued and unchanged).
  assert.strictEqual(byId['sora-2'].severity, 'alert');
  // Soul Cinema gained its first published rate in 2.3 (Higgsfield's
  // API post, $0.0032/image) — no longer "unpublished"; it sits at
  // watch only because its own new tier is a baseline diff.
  assert.strictEqual(byId['soul-cinema'].severity, 'watch');
  assert(byId['soul-cinema'].alerts.some((a) => a.includes('Pricing table moved')));
  assert(!byId['soul-cinema'].alerts.some((a) => a.includes('No published USD rate')));
  // Wan 2.7's first check is a baseline (stable), and its severity is
  // watch only because its own pricing record is a baseline diff —
  // the PixVerse pattern, one generation on.
  assert.strictEqual(byId['wan-2-7'].check_status, 'stable');
  assert.strictEqual(byId['wan-2-7'].severity, 'watch');
  // Gemini Omni's sources all answered in the final run and
  // its MarkTechPost article is signature-excluded under the
  // 2.19 calibration, so it reads stable/ok this pass; its
  // latest event is the 2.19 verification-kind calibration
  // record. Kling 3.0 carries a partial in the final run
  // (the rotating host-gated cohort — the drift engine
  // labels any record with a failed source 'error'), so it
  // reads alert this pass.
  assert.strictEqual(byId['gemini-omni'].severity, 'ok');
  assert.strictEqual(byId['gemini-omni'].check_status, 'stable');
  assert.strictEqual(byId['gemini-omni'].latest_event.kind, 'verification');
  assert.strictEqual(byId['kling-3-0'].severity, 'alert');
  assert.strictEqual(byId['kling-3-0'].check_status, 'error');
  // FLUX 3 Video's sources all answered in the final run,
  // so it reads stable/watch this pass (watch only on its
  // own pricing diff); its rates stay verified on BFL's own
  // docs page, which held its 2.16 baseline signature in
  // the completed runs of 2.19, and its latest event is the
  // 2.19 verification-kind follow-up.
  assert.strictEqual(byId['flux-3-video'].severity, 'watch');
  assert.strictEqual(byId['flux-3-video'].check_status, 'stable');
  assert.strictEqual(byId['flux-3-video'].latest_event.kind, 'verification');
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
