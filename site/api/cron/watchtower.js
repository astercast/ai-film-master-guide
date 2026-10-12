'use strict';
/* GET /api/cron/watchtower — film-watchtower v1.0.0 (ARCHITECTURE.md §7.1).
 * Daily `0 14 * * *` UTC. Cron only: CRON_SECRET bearer, fail closed (§8.3).
 * Cache-Control: no-store. 60s global cooldown (duplicate-delivery guard).
 *
 * Bounded incremental refresh (§4.2), fits the 10s function budget:
 *  1. Load current watch state (model-checks.json + model-review-queue.json)
 *     from GitHub (source of truth) or the deployed bundle when the
 *     commit-back token is not configured yet (spec §14 — read-only mode).
 *  2. Re-fetch a rotating slice of each model's check URLs (max 8/run,
 *     4s per-source timeout, max 1 request/5s per provider domain, sequential
 *     for HTML pages — §7.1 rate limits). Rotation is day-keyed so every
 *     URL gets checked across runs; no stored pointer needed (idempotent).
 *  3. Signature-change detection — the same clean-text + sha256 technique
 *     as the repo's scripts/refresh/check_models.py. A moved signature
 *     flags the model (changed=true) and appends a REVIEW QUEUE item.
 *  4. writeJsonIfChanged back to the repo (commits only on change).
 *
 * HONESTY RULE (repo promotion workflow — check_models.py docstring):
 * fetched pages are unreliable signals, so the job NEVER auto-edits
 * models.json pricing/status. It flags; a human or the wave engine verifies
 * and promotes. Pricing-page changes get flag:"pricing-check".
 *
 * NEVER fake data (§6): every touched source appears in meta.upstream with
 * ok true/false. No usable state at all -> 502 UPSTREAM_UNAVAILABLE.
 */
var crypto = require('crypto');
var env = require('../../lib/envelope.js');
var fetchx = require('../../lib/fetchx.js');
var cronauth = require('../../lib/cronauth.js');
var github = require('../../lib/github.js');

var SERVICE = 'film-watchtower';
var VERSION = '1.0.0';

var CHECKS_PATH = 'api/v1/model-checks.json';
var QUEUE_PATH = 'api/v1/model-review-queue.json';
var MAX_URLS_PER_RUN = 8;
var RUN_BUDGET_MS = 7000;
var DOMAIN_GAP_MS = 5000; // max 1 request/5s per provider domain (§7.1)

var lastRunAt = 0; // 60s duplicate-delivery cooldown (§4.3)

function sha256(s) { return crypto.createHash('sha256').update(s, 'utf8').digest('hex'); }

// Same text normalization as scripts/refresh/check_models.py clean_text().
function cleanText(html) {
  var t = String(html || '');
  t = t.replace(/<(script|style|noscript)[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ');
  t = t.replace(/<!--[\s\S]*?-->/g, ' ');
  t = t.replace(/<[^>]+>/g, ' ');
  return t.replace(/\s+/g, ' ').trim();
}
function signatureOf(text) { return sha256(cleanText(text)); }

function hostOf(url) {
  try { return new URL(url).hostname.toLowerCase(); } catch (e) { return url; }
}
function isPricingUrl(url) {
  return /(pricing|api-docs|developers\/[^/]*\/?(pricing|billing)|billing)/i.test(url);
}
function dayKey() { return Math.floor(Date.now() / 86400000); }
function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

function loadBundle(path) {
  try {
    // cron/ -> ../v1/...  (site/api/v1)
    var j = path === CHECKS_PATH ? require('../v1/model-checks.json') : require('../v1/model-review-queue.json');
    return { ok: true, json: j, from: 'bundle' };
  } catch (e) {
    return { ok: false, error: String((e && e.message) || e) };
  }
}

async function loadState(path) {
  var g = github.cfg();
  if (g.repo && g.token) {
    var r = await github.readJson(path);
    if (r.ok) return { ok: true, json: r.json, from: 'github' };
    // GitHub read failed — fall back to the bundle honestly, don't 502 yet.
    var b = loadBundle(path);
    return b.ok ? { ok: true, json: b.json, from: 'bundle', github_error: r.error } : { ok: false, error: 'github:' + r.error + ' bundle:' + b.error };
  }
  var bb = loadBundle(path);
  return bb.ok ? { ok: true, json: bb.json, from: 'bundle', read_only: true } : { ok: false, error: 'bundle:' + bb.error };
}

module.exports = async function (req, res) {
  var requestId = env.newRequestId();

  if (!cronauth.assertCron(req)) {
    console.log('[cron] watchtower denied (bad or missing CRON_SECRET) request_id=' + requestId);
    return env.err(res, SERVICE, VERSION, 401, 'UNAUTHORIZED',
      'This endpoint runs on Vercel Cron\'s schedule only. It needs the Authorization: Bearer <CRON_SECRET> header.',
      undefined);
  }
  if (Date.now() - lastRunAt < 60000) {
    return env.ok(res, SERVICE, VERSION, { duplicate: true, checked: 0 },
      { source: 'live', noCache: true, request_id: requestId,
        note: 'Duplicate cron delivery inside the 60s cooldown — skipped.' });
  }
  lastRunAt = Date.now();
  console.log('[cron] watchtower start request_id=' + requestId);

  var startedAt = Date.now();
  var upstream = [];
  try {
    var checksState = await loadState(CHECKS_PATH);
    var queueState = await loadState(QUEUE_PATH);
    if (!checksState.ok || !queueState.ok) {
      console.log('[cron] watchtower fail stage=load error=' + (!checksState.ok ? checksState.error : queueState.error) + ' request_id=' + requestId);
      return env.err(res, SERVICE, VERSION, 502, 'UPSTREAM_UNAVAILABLE',
        'Could not load the watch state from GitHub or the deployed bundle; nothing was checked.',
        { stage: 'load' });
    }
    var checks = checksState.json;
    var queue = queueState.json;
    var readOnly = !!(checksState.read_only || queueState.read_only);

    // Collect checkable URLs (non-excluded; excluded ones don't feed signatures).
    var candidates = [];
    (checks.models || []).forEach(function (rec, mi) {
      (rec.source_results || []).forEach(function (s, si) {
        if (s.excluded_from_signature) return;
        if (!s.url) return;
        candidates.push({ modelIdx: mi, srcIdx: si, url: s.url });
      });
    });

    // Day-keyed rotation: a different slice each day, idempotent, no pointer.
    var start = candidates.length ? (dayKey() % candidates.length) : 0;
    var ordered = [];
    for (var i = 0; i < candidates.length; i++) ordered.push(candidates[(start + i) % candidates.length]);
    var todo = ordered.slice(0, MAX_URLS_PER_RUN);

    var lastHit = {};
    var checked = 0, changedModels = [], queueAdded = 0, sourcesOk = 0;

    for (var t = 0; t < todo.length; t++) {
      if (Date.now() - startedAt > RUN_BUDGET_MS) break;
      var item = todo[t];
      var host = hostOf(item.url);
      var gap = DOMAIN_GAP_MS - (Date.now() - (lastHit[host] || 0));
      if (gap > 0) {
        var wait = Math.min(gap, Math.max(0, RUN_BUDGET_MS - (Date.now() - startedAt) - 500));
        if (wait <= 0) continue; // defer to a later run rather than blow the budget
        await sleep(wait);
      }
      var r = await fetchx.fetchTimeout(item.url, { timeoutMs: 4000 });
      lastHit[host] = Date.now();
      checked++;
      upstream.push({ source: item.url, ok: r.ok, checked_at: env.nowIso(),
                      latency_ms: r.ms, error: r.ok ? undefined : r.error });
      var rec = checks.models[item.modelIdx];
      var src = rec.source_results[item.srcIdx];
      src.last_checked_at = env.nowIso();
      if (!r.ok) {
        src.ok = false; src.http_status = r.status; src.error = r.error;
        console.log('[upstream] ' + item.url + ' fail error=' + r.error + ' latency_ms=' + r.ms);
        continue;
      }
      sourcesOk++;
      var sig = signatureOf(r.text);
      src.ok = true; src.http_status = r.status; src.error = null; src.chars = r.text.length;
      if (src.signature && src.signature !== sig) {
        // Signature moved — flag, don't auto-mutate models.json (repo rule).
        src.changed_since_baseline = true;
        src.previous_signature = src.signature;
        src.signature = sig;
        src.signal_excerpt = cleanText(r.text).slice(0, 400);
        rec.changed = true;
        rec.last_checked = env.nowIso();
        if (changedModels.indexOf(rec.model) === -1) changedModels.push(rec.model);
        var already = (queue.items || []).some(function (it) {
          return it.model === rec.model && it.source_url === item.url && it.status === 'review';
        });
        if (!already) {
          queue.items.push({
            model: rec.model,
            status: 'review',
            detected_at: env.nowIso(),
            source_url: item.url,
            flag: isPricingUrl(item.url) ? 'pricing-check' : 'content-change',
            evidence: { old_signature: src.previous_signature, new_signature: sig },
            note: 'Watchtower cron ' + env.nowIso().slice(0, 10) + ': source content signature moved. ' +
              'Review the page before changing models.json or pricing.json — may be marketing-copy noise.'
          });
          queueAdded++;
        }
      } else if (!src.signature) {
        src.signature = sig; // first observation establishes the baseline
      }
    }

    // Refresh per-model rollups.
    var changedCount = 0, errCount = 0;
    (checks.models || []).forEach(function (rec) {
      rec.last_checked = rec.last_checked || env.nowIso();
      var srcs = rec.source_results || [];
      if (rec.changed) changedCount++;
      if (srcs.length && srcs.every(function (s) { return !s.ok; })) { rec.source_status = 'error'; errCount++; }
      else if (srcs.some(function (s) { return !s.ok; })) { rec.source_status = 'partial'; }
      else { rec.source_status = 'ok'; }
    });
    checks.checked_at = env.nowIso();
    checks.summary = {
      models_total: (checks.models || []).length,
      changed: changedCount,
      with_errors: errCount,
      urls_checked_this_run: checked,
      rotation_day: dayKey()
    };
    queue.generated_at = env.nowIso();
    queue.pending = (queue.items || []).filter(function (it) { return it.status === 'review' || it.status === 'pending'; }).length;

    var commitMsg = '[watchtower] model/pricing watch ' + env.nowIso().slice(0, 10) +
      ' — ' + changedModels.length + ' model(s) flagged, ' + queueAdded + ' review item(s)';
    var c1 = await github.writeJsonIfChanged(CHECKS_PATH, checks, commitMsg);
    var c2 = await github.writeJsonIfChanged(QUEUE_PATH, queue, commitMsg);
    var committed = !!(c1.committed || c2.committed);
    var commitSha = c1.sha || c2.sha || null;
    var commitNote = null;
    if (c1.reason === 'no-token' || c2.reason === 'no-token') {
      commitNote = 'Read-only mode: GITHUB_REPO_TOKEN is not configured yet (user decision, spec §14). ' +
        'State was recomputed but not committed; static JSON refreshes via wave-engine pushes. ' +
        'Set the PAT in Vercel (Production env) to enable commit-back — no code change needed.';
    } else if (!committed && (c1.reason || c2.reason)) {
      commitNote = 'Commit skipped: ' + [c1.reason, c2.reason].filter(Boolean).join('; ');
    }

    var data = {
      checked: checked,
      changed: changedModels.length > 0,
      committed: committed,
      commit_sha: commitSha,
      models_changed: changedModels,
      review_queue_added: queueAdded,
      sources_ok: sourcesOk + '/' + checked,
      read_only: readOnly,
      state_from: checksState.from
    };
    console.log('[cron] watchtower done changed=' + data.changed + ' committed=' + (commitSha || false) +
      ' sources_ok=' + data.sources_ok + ' request_id=' + requestId);
    env.ok(res, SERVICE, VERSION, data, {
      source: 'live', noCache: true, request_id: requestId,
      degraded: readOnly || sourcesOk < checked,
      stale_since: readOnly ? checks.checked_at : null,
      note: commitNote || (sourcesOk < checked ? (checked - sourcesOk) + ' source(s) failed this run; their models keep their last-known state.' : null),
      upstream: upstream
    });
  } catch (e) {
    console.log('[cron] watchtower fail stage=run error=' + String((e && e.message) || e) + ' request_id=' + requestId);
    env.err(res, SERVICE, VERSION, 500, 'REFRESH_FAILED',
      'The watchtower run threw an unexpected error. Nothing was committed.',
      { stage: 'run' });
  }
};
