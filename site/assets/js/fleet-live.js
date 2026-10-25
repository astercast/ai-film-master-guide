/* fleet-live.js: read a site's live data from the fleet-data repo, fall back to the copy baked into the site, keep whichever is newer,
   and call you back when something newer arrives. No libraries. Works under COEP (plain CORS fetch).
   FleetLive.watch("trend-machine", "board.json", (data, from) => draw(data), { baked: "/data/v1/", every: 300000 })            */
(function () {
  "use strict";
  var BASE = "https://raw.githubusercontent.com/astercast/fleet-data/main/";
  function stamp(d) { return (d && (d.generated_at || d.generatedAt || d.asOf)) || ""; }
  function pull(url, ms) {
    var c = new AbortController(), t = setTimeout(function () { c.abort(); }, ms || 4000);
    return fetch(url + (url.indexOf("?") < 0 ? "?" : "&") + "t=" + Math.floor(Date.now() / 60000), { cache: "no-store", signal: c.signal })
      .then(function (r) { clearTimeout(t); if (!r.ok) throw new Error(r.status); return r.json(); }).catch(function () { clearTimeout(t); return null; });
  }
  function newest(a, b) { if (!a) return b; if (!b) return a; return stamp(a) >= stamp(b) ? a : b; }
  function watch(site, file, cb, o) {
    o = o || {}; var baked = (o.baked || "/data/v1/") + file, live = (o.base || BASE) + site + "/" + file, best = null, from = "";
    function run() {
      return Promise.all([pull(live, o.timeout), pull(baked, o.timeout)]).then(function (r) {
        var pick = newest(r[0], r[1]); if (!pick) return;
        var src = pick === r[0] ? "live" : "baked";
        if (!best || stamp(pick) > stamp(best) || (!stamp(pick) && pick !== best && JSON.stringify(pick) !== JSON.stringify(best))) {
          var first = !best; best = pick; from = src; cb(pick, src, first);
          if (!first) document.dispatchEvent(new CustomEvent("fleet:update", { detail: { site: site, file: file, source: src } }));
        }
      });
    }
    run();
    var id = setInterval(function () { if (!document.hidden) run(); }, o.every || 300000);
    document.addEventListener("visibilitychange", function () { if (!document.hidden) run(); });
    return { stop: function () { clearInterval(id); }, now: function () { return best; }, from: function () { return from; } };
  }
  window.FleetLive = { watch: watch, pull: pull, BASE: BASE };
})();
