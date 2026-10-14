'use strict';
/* github.js, shared lib, film-watchtower.
 * Copied per ARCHITECTURE.md §1.11. The repo is the database (§5):
 * cron jobs read/write versioned JSON via the GitHub Contents API.
 *
 * readJson(path) -> {ok, json, sha} | {ok:false, error}
 * writeJsonIfChanged(path, obj, message) -> {committed, changed, sha, reason}
 *
 * Compares SHA-256 of canonical JSON (sorted keys, 2-space indent, trailing
 * newline); PUTs only on change; one retry on SHA conflict (409).
 * All calls carry an 8000ms timeout by default; callers on a hard
 * deadline (the cron, inside Vercel's 10s Hobby ceiling) pass a shorter
 * timeoutMs so a slow GitHub call can never eat the function's budget.
 *
 * PENDING TOKEN (spec §14 open decision 1): GITHUB_REPO_TOKEN is a
 * fine-grained PAT (contents:write, this repo only) the user has not created
 * yet. Until it exists, writeJsonIfChanged degrades gracefully to read-only:
 * it returns {committed:false, reason:'no-token'} instead of throwing, so the
 * cron job still runs, still returns fresh computed data in its envelope, and
 * the static JSON stays fresh via wave-engine pushes. When the token is set
 * in the Vercel dashboard (Production env), commit-back works with no code
 * change.
 */
var crypto = require('crypto');
var fetchx = require('./fetchx');

var API_TIMEOUT_MS = 8000;

function cfg() {
  return {
    repo: process.env.GITHUB_REPO || '',
    prefix: process.env.REPO_STATIC_PREFIX || '', // 'site/' for this repo
    token: process.env.GITHUB_REPO_TOKEN || ''
  };
}

function sha256(s) {
  return crypto.createHash('sha256').update(s, 'utf8').digest('hex');
}

// Recursively sort object keys for canonical comparison.
function sortObj(v) {
  if (Array.isArray(v)) return v.map(sortObj);
  if (v && typeof v === 'object') {
    var out = {};
    Object.keys(v).sort().forEach(function (k) { out[k] = sortObj(v[k]); });
    return out;
  }
  return v;
}

function canonical(obj) {
  return JSON.stringify(sortObj(obj), null, 2) + '\n';
}

async function ghFetch(path, method, bodyObj, token, repo, prefix, timeoutMs) {
  var url = 'https://api.github.com/repos/' + repo + '/contents/' + prefix + path;
  var headers = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Authorization': 'Bearer ' + token,
    'User-Agent': fetchx.SERVICE_UA
  };
  var r = await fetchx.fetchTimeout(url, {
    timeoutMs: timeoutMs || API_TIMEOUT_MS,
    headers: headers
  });
  if (!r.ok) return { ok: false, error: r.error, status: r.status };
  try {
    return { ok: true, json: JSON.parse(r.text), status: r.status };
  } catch (e) {
    return { ok: false, error: 'bad-json', status: r.status };
  }
}

async function readJson(path, timeoutMs) {
  var c = cfg();
  if (!c.repo || !c.token) return { ok: false, error: 'missing-env' };
  var r = await ghFetch(path, 'GET', null, c.token, c.repo, c.prefix, timeoutMs);
  if (!r.ok) return r;
  try {
    var text = Buffer.from(r.json.content || '', 'base64').toString('utf8');
    return { ok: true, json: JSON.parse(text), sha: r.json.sha };
  } catch (e) {
    return { ok: false, error: 'bad-json' };
  }
}

async function putJson(path, obj, message, sha, timeoutMs) {
  var c = cfg();
  var body = {
    message: message,
    content: Buffer.from(canonical(obj), 'utf8').toString('base64')
  };
  if (sha) body.sha = sha;
  var url = 'https://api.github.com/repos/' + c.repo + '/contents/' + c.prefix + path;
  var r = await fetchx.fetchTimeout(url, {
    timeoutMs: timeoutMs || API_TIMEOUT_MS,
    headers: {
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Authorization': 'Bearer ' + c.token,
      'Content-Type': 'application/json',
      'User-Agent': fetchx.SERVICE_UA
    }
  });
  if (!r.ok && r.status === 409) return { ok: false, conflict: true };
  if (!r.ok) return { ok: false, error: r.error, status: r.status };
  try {
    var j = JSON.parse(r.text);
    return { ok: true, sha: j.content && j.content.sha };
  } catch (e) {
    return { ok: false, error: 'bad-json' };
  }
}

async function writeJsonIfChanged(path, obj, message, timeoutMs) {
  var c = cfg();
  if (!c.repo || !c.token) {
    return {
      committed: false,
      changed: null,
      reason: 'no-token',
      note: 'GITHUB_REPO_TOKEN not configured, commit-back disabled (read-only mode). ' +
        'Static JSON refreshes via wave-engine pushes until the user creates the PAT (spec §14).'
    };
  }
  var cur = await readJson(path, timeoutMs);
  if (!cur.ok) return { committed: false, changed: null, reason: 'read-failed:' + cur.error };
  var wantHash = sha256(canonical(obj));
  if (sha256(canonical(cur.json)) === wantHash) {
    return { committed: false, changed: false, sha: cur.sha };
  }
  var attempt = await putJson(path, obj, message, cur.sha, timeoutMs);
  if (attempt.conflict) {
    var reread = await readJson(path, timeoutMs);
    if (!reread.ok) return { committed: false, changed: true, reason: 'conflict-reread-failed' };
    if (sha256(canonical(reread.json)) === wantHash) {
      return { committed: false, changed: false, sha: reread.sha, reason: 'already-applied' };
    }
    attempt = await putJson(path, obj, message, reread.sha, timeoutMs);
    if (attempt.conflict) return { committed: false, changed: true, reason: 'conflict' };
  }
  if (!attempt.ok) return { committed: false, changed: true, reason: 'put-failed:' + (attempt.error || attempt.status) };
  return { committed: true, changed: true, sha: attempt.sha };
}

module.exports = { readJson: readJson, writeJsonIfChanged: writeJsonIfChanged, cfg: cfg, canonical: canonical, sha256: sha256 };
