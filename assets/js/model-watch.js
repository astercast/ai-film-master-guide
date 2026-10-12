/* Model-watch freshness layer — The Watchtower (server-program ARCHITECTURE.md §3).
   The page is pre-rendered from the last published data, so it is fully
   usable with JavaScript disabled. This script live-updates the freshness
   panel and per-card check flags from /api/models-status, falling back to
   the static data/v1/model-checks.json. It never replaces content with an
   error state: on total failure the pre-rendered content simply stays. */
(function () {
  "use strict";

  var panelLine = document.getElementById("mw-freshness-line");
  var badge = document.getElementById("mw-api-badge");
  var grid = document.getElementById("mw-grid");
  if (!panelLine || !grid) return;

  // No client library (or no fetch): hide the badge, keep pre-rendered content.
  if (!window.ApiClient || typeof fetch !== "function") {
    if (badge) badge.dataset.apiState = "none";
    return;
  }

  function fmtWhen(iso) {
    try {
      var d = new Date(iso);
      if (isNaN(d.getTime())) return "unknown time";
      var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      return months[d.getUTCMonth()] + " " + d.getUTCDate() + ", " + d.getUTCFullYear() +
        " " + String(d.getUTCHours()).padStart(2, "0") + ":" + String(d.getUTCMinutes()).padStart(2, "0") + " UTC";
    } catch (e) { return "unknown time"; }
  }

  // Live envelope (/api/models-status) → normalized freshness record.
  function fromLive(data) {
    var per = {};
    (data.models || []).forEach(function (m) {
      if (m && m.name) per[m.name] = { status: m.status || "stable",
        lastChecked: m.last_checked || null, note: m.change_summary || null };
    });
    var s = data.summary || {};
    return { checkedAt: data.checked_at || null,
      total: s.models_total || 0, changed: s.changed || 0,
      errors: s.with_errors || 0, unwatched: s.no_sources || 0, perModel: per };
  }

  // Static fallback (data/v1/model-checks.json) → same normalized shape.
  function fromStatic(doc) {
    var per = {};
    (doc.models || []).forEach(function (m) {
      if (!m || !m.model) return;
      var st = "stable";
      if (m.changed) st = "changed";
      else if (m.source_status === "failed") st = "error";
      else if (!m.source_results || !m.source_results.length) st = "unwatched";
      per[m.model] = { status: st, lastChecked: m.last_checked || null, note: null };
    });
    var s = doc.summary || {};
    return { checkedAt: doc.checked_at || null,
      total: s.models_total || 0, changed: s.changed || 0,
      errors: s.with_errors || 0, unwatched: s.no_sources || 0, perModel: per };
  }

  function render(fresh, isLive, degraded, note) {
    var src = !isLive ? "Last published check"
      : degraded ? "Watchtower · degraded — " + (note || "some sources failed")
      : "Watchtower live";
    panelLine.textContent = src + " · " + fresh.total + " models checked " +
      fmtWhen(fresh.checkedAt) + " — " + fresh.changed + " changed · " +
      fresh.errors + " check errors · " + fresh.unwatched + " unwatched.";

    Array.prototype.forEach.call(grid.querySelectorAll(".mw-card"), function (card) {
      var h3 = card.querySelector("h3");
      var name = h3 ? h3.textContent.trim() : "";
      var rec = name && fresh.perModel[name];
      var flag = card.querySelector(".mw-flag");
      if (!rec || rec.status === "stable" || rec.status === "unwatched") {
        if (flag) flag.remove();
        card.removeAttribute("data-check-status");
        return;
      }
      card.setAttribute("data-check-status", rec.status);
      var msg = rec.status === "changed"
        ? "⚑ Freshness check flagged changes (" + fmtWhen(rec.lastChecked) + ")" +
          (rec.note ? " — " + rec.note : "") +
          ". Queued for review; this card shows the last verified data."
        : "⚠ Freshness check failed (" + fmtWhen(rec.lastChecked) + ")" +
          " — this card shows the last verified data.";
      if (!flag) {
        flag = document.createElement("p");
        flag.className = "mw-flag";
        var anchor = card.querySelector(".mw-changed");
        card.insertBefore(flag, anchor ? anchor.nextSibling : null);
      }
      flag.textContent = msg;
    });
  }

  window.ApiClient.fetchWithFallback("/api/models-status", "data/v1/model-checks.json", { badgeEl: badge })
    .then(function (res) {
      if (res.source === "live" && res.data) render(fromLive(res.data), true, res.degraded, res.note);
      else if (res.source === "static" && res.data) render(fromStatic(res.data), false, false, null);
      // source "none": the badge hides itself; pre-rendered content stays untouched.
    });
})();
