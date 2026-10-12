'use strict';
/* envelope.js — shared lib, film-watchtower.
 * Copied per ARCHITECTURE.md §1.11 (identical logic in every repo; do not fork).
 * Every function returns ONLY through these helpers. No raw res.json() shapes.
 */
var crypto = require('crypto');

var PUBLIC_CACHE = 'public, s-maxage=600, stale-while-revalidate=86400';

function newRequestId() {
  return 'req_' + crypto.randomBytes(3).toString('hex');
}

// RFC 3339 UTC, second precision, Z suffix (§1.3).
function nowIso() {
  return new Date().toISOString().replace(/\.\d+Z$/, 'Z');
}

function send(res, status, body, cacheControl, extraHeaders) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', cacheControl);
  if (extraHeaders) {
    for (var k in extraHeaders) res.setHeader(k, extraHeaders[k]);
  }
  res.end(JSON.stringify(body));
}

// Success envelope (§1.1). opts: source, degraded, stale_since, upstream,
// note, noCache (POST/cron), cacheControl (override the default GET cache),
// httpStatus, request_id (reuse across retries).
function ok(res, service, version, data, opts) {
  opts = opts || {};
  var body = {
    ok: true,
    data: data,
    meta: {
      service: service,
      version: version,
      generated_at: nowIso(),
      source: opts.source || 'live',
      degraded: !!opts.degraded,
      stale_since: opts.stale_since || null,
      upstream: opts.upstream || [],
      note: opts.note || null,
      request_id: opts.request_id || newRequestId()
    }
  };
  send(res, opts.httpStatus || 200, body,
    opts.noCache ? 'no-store' : (opts.cacheControl || PUBLIC_CACHE));
}

// Error envelope (§1.1, §1.2). 4xx and 5xx both use the envelope; frontend
// treats any non-ok as "use static fallback". opts.headers for Retry-After etc.
function err(res, service, version, httpStatus, code, message, details, opts) {
  opts = opts || {};
  var body = {
    ok: false,
    data: null,
    meta: {
      service: service,
      version: version,
      generated_at: nowIso(),
      request_id: newRequestId()
    },
    error: { code: code, message: message }
  };
  if (details !== undefined) body.error.details = details;
  send(res, httpStatus, body, 'no-store', opts.headers);
}

module.exports = { ok: ok, err: err, newRequestId: newRequestId, nowIso: nowIso, PUBLIC_CACHE: PUBLIC_CACHE };
