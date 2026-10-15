'use strict';
/* fetchx.js, shared lib, film-watchtower.
 * Copied per ARCHITECTURE.md §1.11. All upstream calls go through this.
 * fetch with AbortController timeout. Never throws, returns a result object.
 */
var SERVICE_UA = 'film-watchtower/1.0.0 (+https://github.com/astercast/ai-film-master-guide)';

// fetchTimeout(url, {timeoutMs, headers, method, body}) -> {ok, status, text, ms, error}
// Default timeout 4000ms (§4.2). ok=false on network error, timeout, or non-2xx.
// method/body (optional, body-drop fix 2026-10-15, mirroring aster-da-master
// e9830cb): PUT/POST callers pass a request body string. Previously accepted
// nowhere and sent never, which silently emptied the GitHub Contents PUT in
// lib/github.js (putJson built the payload and dropped it; the write went
// out as a body-less GET and writeJsonIfChanged reported committed:true
// while committing nothing).
async function fetchTimeout(url, opts) {
  opts = opts || {};
  var timeoutMs = opts.timeoutMs || 4000;
  var headers = Object.assign({}, opts.headers || {});
  if (!headers['User-Agent'] && !headers['user-agent']) headers['User-Agent'] = SERVICE_UA;

  var ctrl = new AbortController();
  var timer = setTimeout(function () { ctrl.abort(); }, timeoutMs);
  var start = Date.now();
  try {
    var res = await fetch(url, { method: opts.method || 'GET', headers: headers, body: opts.body !== undefined ? opts.body : undefined, signal: ctrl.signal, redirect: 'follow' });
    var text = await res.text();
    return {
      ok: res.ok,
      status: res.status,
      text: text,
      ms: Date.now() - start,
      error: res.ok ? null : ('http ' + res.status)
    };
  } catch (e) {
    var msg = (e && e.name === 'AbortError')
      ? ('timeout after ' + timeoutMs + 'ms')
      : String((e && e.message) || e);
    return { ok: false, status: null, text: '', ms: Date.now() - start, error: msg };
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { fetchTimeout: fetchTimeout, SERVICE_UA: SERVICE_UA };
