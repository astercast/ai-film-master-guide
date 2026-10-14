'use strict';
/* ratelimit.js, shared lib, film-watchtower.
 * Copied per ARCHITECTURE.md §1.11 / §1.7.
 * Per-instance in-memory token bucket. Best-effort: resets on cold start
 * (documented, not hidden). Key on x-forwarded-for (first entry), not socket IP.
 *
 * Buckets: 'public' 60 req/min, 'compute' 20 req/min.
 * checkLimit(ip, bucket) -> {allowed:true} | {allowed:false, retryAfter}
 */
var LIMITS = { public: { rate: 60, perMs: 60000 }, compute: { rate: 20, perMs: 60000 } };
var buckets = { public: new Map(), compute: new Map() };

function checkLimit(ip, bucket) {
  var cfg = LIMITS[bucket] || LIMITS.public;
  var now = Date.now();
  var key = String(ip || 'unknown');
  var map = buckets[bucket] || buckets.public;
  var entry = map.get(key);
  if (!entry) {
    entry = { tokens: cfg.rate, last: now };
    map.set(key, entry);
  }
  // Refill.
  var elapsed = now - entry.last;
  if (elapsed > 0) {
    entry.tokens = Math.min(cfg.rate, entry.tokens + (elapsed / cfg.perMs) * cfg.rate);
    entry.last = now;
  }
  if (entry.tokens >= 1) {
    entry.tokens -= 1;
    return { allowed: true };
  }
  var retryAfter = Math.max(1, Math.ceil((1 - entry.tokens) / (cfg.rate / cfg.perMs / 1000)));
  return { allowed: false, retryAfter: retryAfter };
}

// Client IP per §1.7: first entry of x-forwarded-for, else socket address.
function clientIp(req) {
  var fwd = req.headers && (req.headers['x-forwarded-for'] || req.headers['X-Forwarded-For']);
  if (fwd) return String(fwd).split(',')[0].trim();
  if (req.socket && req.socket.remoteAddress) return req.socket.remoteAddress;
  return 'unknown';
}

// Hash an IP for logs, never log the raw IP (§4.5).
var crypto = require('crypto');
function ipHash(ip) {
  return crypto.createHash('sha256').update(String(ip)).digest('hex').slice(0, 12);
}

module.exports = { checkLimit: checkLimit, clientIp: clientIp, ipHash: ipHash };
