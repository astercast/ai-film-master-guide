'use strict';
/* tests/local-server.js — Vercel Wave A local function runtime.
 *
 * `vercel dev` isn't available in this sandbox, so this harness executes the
 * real function files with a faithful emulation of Vercel's Node serverless
 * contract: req.{method,url,headers,query,body}, res.{statusCode,setHeader,end}.
 * The functions only use statusCode/setHeader/end (via lib/envelope.js), so
 * what runs here is what Vercel runs.
 *
 * Usage: PORT=31234 CRON_SECRET=test-secret node tests/local-server.js
 * Routes:
 *   /api/health | /api/models-status | /api/models-pricing | /api/models-changes | /api/calc-cost
 *   /api/cron/watchtower  -> site/api/cron/watchtower.js
 *   /data/v1/...          -> static files from site/data/v1/...
 */
var http = require('http');
var fs = require('fs');
var path = require('path');
var url = require('url');

var SITE = path.join(__dirname, '..', 'site');

var ROUTES = {
  '/api/health': 'site/api/health.js',
  '/api/models-status': 'site/api/models-status.js',
  '/api/models-pricing': 'site/api/models-pricing.js',
  '/api/models-changes': 'site/api/models-changes.js',
  '/api/calc-cost': 'site/api/calc-cost.js',
  '/api/cron/watchtower': 'site/api/cron/watchtower.js'
};

var MIME = { '.json': 'application/json; charset=utf-8', '.html': 'text/html; charset=utf-8' };

function readBody(req) {
  return new Promise(function (resolve) {
    var chunks = [];
    req.on('data', function (c) { chunks.push(c); });
    req.on('end', function () {
      var raw = Buffer.concat(chunks).toString('utf8');
      var ct = String(req.headers['content-type'] || '');
      if (raw && ct.indexOf('application/json') !== -1) {
        try { resolve(JSON.parse(raw)); return; } catch (e) { resolve(raw); return; }
      }
      resolve(raw || undefined);
    });
  });
}

var server = http.createServer(async function (nodeReq, nodeRes) {
  var parsed = url.parse(nodeReq.url, true);
  var pathname = parsed.pathname || '/';

  // Static fallback files.
  if (pathname.indexOf('/data/v1/') === 0) {
    var rel = pathname.replace('/data/v1/', '');
    var fp = path.join(SITE, 'data', 'v1', rel.split('/').filter(function (p) { return p && p !== '..'; }).join('/'));
    fs.readFile(fp, function (err, data) {
      if (err) { nodeRes.statusCode = 404; nodeRes.end('not found'); return; }
      nodeRes.statusCode = 200;
      nodeRes.setHeader('Content-Type', MIME[path.extname(fp)] || 'application/octet-stream');
      nodeRes.end(data);
    });
    return;
  }

  var fnFile = ROUTES[pathname];
  if (!fnFile) { nodeRes.statusCode = 404; nodeRes.end('no such route'); return; }

  // Fresh require per request so file edits are picked up between runs.
  var modPath = path.join(__dirname, '..', fnFile);
  delete require.cache[modPath];
  var handler = require(modPath);

  var body = await readBody(nodeReq);
  var req = {
    method: nodeReq.method,
    url: nodeReq.url,
    headers: nodeReq.headers,
    query: parsed.query,
    body: body,
    socket: nodeReq.socket
  };
  try {
    await handler(req, nodeRes);
    if (!nodeRes.writableEnded) nodeRes.end();
  } catch (e) {
    if (!nodeRes.headersSent) {
      nodeRes.statusCode = 500;
      nodeRes.setHeader('Content-Type', 'application/json; charset=utf-8');
      nodeRes.end(JSON.stringify({ ok: false, harness_error: String((e && e.message) || e) }));
    }
  }
});

var PORT = parseInt(process.env.PORT || '31234', 10);
server.listen(PORT, '127.0.0.1', function () {
  console.log('READY port=' + PORT);
});
