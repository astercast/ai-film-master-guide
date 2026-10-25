/* fleet-bar.js: the "Updated N minutes ago, N new, Show" bar, fed by fleet-data instead of a deploy.
   <script src="/assets/js/fleet-live.js"></script><script src="/assets/js/fleet-bar.js" data-site="trend-machine"></script>
   Fires "fleet:show" on your page when the visitor presses Show; your page redraws from the data it already holds. */
(function () {
  var s = document.currentScript, site = s.dataset.site, t0 = new Date().toISOString().slice(0, 19) + "Z", seen = 0, last = null;
  var bar = document.createElement("div"); bar.setAttribute("role", "status"); bar.hidden = true;
  bar.style.cssText = "position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:60;background:#17181a;color:#f4f2ec;padding:10px 14px;font:600 14px system-ui;display:flex;gap:14px;align-items:center;max-width:calc(100vw - 24px)";
  var txt = document.createElement("span"), btn = document.createElement("button");
  btn.textContent = "Show"; btn.style.cssText = "font:inherit;background:#f4f2ec;color:#17181a;border:0;padding:6px 12px;cursor:pointer";
  btn.onclick = function () { document.dispatchEvent(new CustomEvent("fleet:show")); bar.hidden = true; seen = fresh().length; };
  bar.append(txt, btn); document.body.append(bar);
  function fresh() { return ((last && last.changes) || []).filter(function (c) { return c.at > t0; }); }
  function ago() { if (!last) return ""; var m = Math.max(0, Math.round((Date.now() - Date.parse(last.generated_at)) / 60000)); return m < 1 ? "just now" : m < 60 ? m + " minutes ago" : Math.round(m / 60) + " hours ago"; }
  FleetLive.watch(site, "pulse.json", function (p) { last = p; var n = fresh().length - seen; if (n > 0) { txt.textContent = "Updated " + ago() + ". " + n + " new."; bar.hidden = false; } });
})();
