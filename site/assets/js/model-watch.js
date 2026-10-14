/* Model-watch, Watchtower 2.0.
 *
 * The page is pre-rendered from the last published data (freshness panel,
 * since-visit panel with a 30-day window, drift board, pricing changes,
 * history timeline, model cards), so it is complete with JavaScript
 * disabled and complete when every function is down. This script then
 * personalizes it:
 *
 *  1. Freshness, live-updates from /api/models-status, falling back to
 *     the static model-checks.json (the Watchtower 1.0 behavior, kept).
 *  2. Since your last visit, the visitor's previous visit timestamp is
 *     kept in localStorage (afg-watchtower-last-visit). The panel re-renders
 *     for that exact window from /api/models-changes, or, when the live
 *     function is unreachable, by recomputing the same shapes locally
 *     from the four static data files with WatchtowerLib (the browser
 *     mirror of the server drift engine). First visit: the window is the
 *     last 30 days and the panel says so. The stored timestamp advances
 *     only after the panel has rendered, so a crashed tab never eats a
 *     change the visitor did not see.
 *  3. Drift board + pricing changes re-render from the same payload.
 *
 * It never replaces content with an error state: on total failure the
 * pre-rendered panels simply stay.
 */
(function () {
  "use strict";

  var VISIT_KEY = "afg-watchtower-last-visit";
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function fmtDay(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "an unknown date";
    return MONTHS[d.getUTCMonth()] + " " + d.getUTCDate() + ", " + d.getUTCFullYear();
  }
  function fmtWhen(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "unknown time";
    return fmtDay(iso) + " " +
      String(d.getUTCHours()).padStart(2, "0") + ":" +
      String(d.getUTCMinutes()).padStart(2, "0") + " UTC";
  }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function money(v) {
    if (v === null || v === undefined) return "…";
    return "$" + (v < 0.1 ? v.toFixed(4).replace(/0+$/, "").replace(/\.$/, ".0") : v.toFixed(2));
  }
  function moneyRange(lo, hi) {
    if (lo === null || lo === undefined) return "…";
    return lo === hi ? money(lo) : money(lo) + " to " + money(hi);
  }

  /* ------------------------------------------------------------------ */
  /* 1. Freshness panel (Watchtower 1.0 behavior, unchanged semantics)  */
  /* ------------------------------------------------------------------ */
  (function freshness() {
    var panelLine = document.getElementById("mw-freshness-line");
    var badge = document.getElementById("mw-api-badge");
    var grid = document.getElementById("mw-grid");
    if (!panelLine || !grid) return;
    if (!window.ApiClient || typeof fetch !== "function") {
      if (badge) badge.dataset.apiState = "none";
      return;
    }

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
    function fromStatic(doc) {
      var per = {};
      (doc.models || []).forEach(function (m) {
        if (!m || !m.model) return;
        var st = "stable";
        if (m.changed) st = "changed";
        else if (m.source_status === "failed" || m.source_status === "error") st = "error";
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
        : degraded ? "Watchtower · degraded, " + (note || "some sources failed")
        : "Watchtower live";
      panelLine.textContent = src + " · " + fresh.total + " models checked " +
        fmtWhen(fresh.checkedAt) + ", " + fresh.changed + " changed · " +
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
            (rec.note ? ", " + rec.note : "") +
            ". Queued for review; this card shows the last verified data."
          : "⚠ Freshness check failed (" + fmtWhen(rec.lastChecked) + ")" +
            ", this card shows the last verified data.";
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
      });
  })();

  /* ------------------------------------------------------------------ */
  /* 2 + 3. Since-visit panel, drift board, pricing changes             */
  /* ------------------------------------------------------------------ */
  (function changes() {
    var sincePanel = document.getElementById("wt-since");
    if (!sincePanel || !window.ApiClient || !window.WatchtowerLib ||
        typeof fetch !== "function") return;
    var L = window.WatchtowerLib;
    var sinceTitle = document.getElementById("wt-since-title");
    var sinceLine = document.getElementById("wt-since-line");
    var sinceList = document.getElementById("wt-since-list");
    var sinceBadge = document.getElementById("wt-api-badge");
    var resetBtn = document.getElementById("wt-reset-visit");
    var driftList = document.getElementById("wt-drift-list");
    var driftLine = document.getElementById("wt-drift-line");
    var priceBody = document.getElementById("wt-price-body");
    var priceLine = document.getElementById("wt-price-line");

    var stored = null;
    try { stored = window.localStorage.getItem(VISIT_KEY); } catch (e) { stored = null; }
    var storedMs = stored ? L.parseSince(stored) : null;
    var firstVisit = storedMs === null;
    var sinceMs = firstVisit ? (Date.now() - 30 * 86400000) : storedMs;
    var sinceDay = new Date(sinceMs).toISOString().slice(0, 10);

    function plural(n, one, many) { return n + " " + (n === 1 ? one : many); }

    function eventRow(e) {
      return "<li class=\"wt-event wt-event-" + esc(e.kind) + "\">" +
        "<span class=\"wt-kind wt-kind-" + esc(e.kind) + "\">" + esc(e.kind) + "</span>" +
        "<span class=\"wt-event-body\"><strong>" + esc(e.model) + "</strong>, " +
        esc(e.summary) + "</span>" +
        "<time class=\"wt-event-date\" datetime=\"" + esc(e.date) + "\">" +
        esc(fmtDay(e.date + "T00:00:00Z")) + "</time></li>";
    }

    function render(payload, sourceLabel) {
      var counts = payload.counts;
      if (sinceTitle) {
        sinceTitle.textContent = firstVisit
          ? "First visit, here's the last 30 days"
          : "Since your last visit, " + fmtDay(sinceDay + "T00:00:00Z");
      }
      if (sinceLine) {
        if (counts.total === 0) {
          sinceLine.textContent = "Nothing in the log since " + fmtDay(sinceDay + "T00:00:00Z") +
            ". No price moved, no status flipped, no model shipped. The pricing table also matches " +
            "the baseline exactly, quiet is a real result, and the Watchtower reports it as one.";
        } else {
          var parts = [];
          if (counts.price) parts.push(plural(counts.price, "price change", "price changes"));
          if (counts.status) parts.push(plural(counts.status, "status change", "status changes"));
          if (counts.release) parts.push(plural(counts.release, "release", "releases"));
          if (counts.tier) parts.push(plural(counts.tier, "tier change", "tier changes"));
          if (counts.coverage) parts.push(plural(counts.coverage, "coverage fix", "coverage fixes"));
          if (counts.verification) parts.push(plural(counts.verification, "verification", "verifications"));
          sinceLine.textContent = (firstVisit
            ? "Your baseline starts today. To catch you up: "
            : "While you were away: ") + parts.join(" · ") + ". (" + sourceLabel + ")";
        }
      }
      if (sinceList) {
        sinceList.innerHTML = payload.events.slice(0, 8).map(eventRow).join("") ||
          "<li class=\"wt-event wt-event-none\">No events in this window.</li>";
      }

      if (driftList && payload.drift_alerts) {
        var alerts = payload.drift_alerts;
        driftList.innerHTML = alerts.map(function (r) {
          var meta = [];
          if (r.last_checked) meta.push("checked " + fmtDay(r.last_checked));
          if (r.last_verified) meta.push("record verified " + fmtDay(r.last_verified + "T00:00:00Z"));
          return "<li class=\"wt-drift-row is-" + esc(r.severity) + "\">" +
            "<span class=\"wt-sev wt-sev-" + esc(r.severity) + "\">" +
            (r.severity === "alert" ? "Review" : "Watch") + "</span>" +
            "<span class=\"wt-drift-body\"><strong>" + esc(r.name) + "</strong>, " +
            esc((r.alerts || []).join(" ")) + "</span>" +
            (meta.length ? "<span class=\"wt-drift-meta\">" + esc(meta.join(" · ")) + "</span>" : "") +
            "</li>";
        }).join("") || "<li class=\"wt-drift-row is-ok\">Nothing needs a human today. " +
          "Every watched source answered, every record is inside its verification window.</li>";
        if (driftLine && payload.drift_summary) {
          var s = payload.drift_summary;
          driftLine.textContent = s.models_total + " models tracked · " + s.alert +
            " need review · " + s.watch + " on watch · " + s.unwatched +
            " without an automated source watch · " + s.pricing_unpublished +
            " without a published rate.";
        }
      }

      if (priceBody && payload.price_changes) {
        if (payload.price_changes.length === 0) {
          priceBody.innerHTML = "<tr><td colspan=\"4\">No movement against the " +
            esc(fmtDay(payload.baseline_at)) + " baseline. Every tier in the live table " +
            "matches the baseline to the cent.</td></tr>";
        } else {
          priceBody.innerHTML = payload.price_changes.map(function (c) {
            var was = c.kind === "tier-added" || c.kind === "model-added" ? "not in the table"
              : moneyRange(c.before_low, c.before_high);
            var now = c.kind === "tier-removed" || c.kind === "model-removed" ? "removed"
              : moneyRange(c.after_low, c.after_high);
            var what = c.kind === "model-added" ? "Model added to the pricing table"
              : c.kind === "model-removed" ? "Model removed from the pricing table"
              : c.kind === "tier-added" ? "Tier added: " + c.tier
              : c.kind === "tier-removed" ? "Tier removed: " + c.tier
              : c.tier + (c.pct !== null && c.pct !== undefined
                  ? " " + (c.pct > 0 ? "+" : "") + c.pct + "%" : "");
            return "<tr><td><strong>" + esc(c.model) + "</strong></td><td>" +
              esc(what) + "</td><td class=\"num\">" + esc(was) + "</td><td class=\"num\">" +
              esc(now) + "</td></tr>";
          }).join("");
        }
        if (priceLine) {
          priceLine.textContent = "Diffed mechanically against the pricing baseline of " +
            fmtDay(payload.baseline_at) + ". The event log below records the documented " +
            "changes the baseline already contains, the Vidu Q4 rate-card correction, " +
            "the FLUX 3 QHD/UHD listing, the Grok Lite rollout.";
        }
      }

      // The visitor has now seen this window. Advance the baseline.
      try { window.localStorage.setItem(VISIT_KEY, new Date().toISOString()); } catch (e) {}
    }

    function payloadFromStatic(history) {
      return Promise.all([
        fetch("data/v1/pricing.json", { cache: "force-cache" }).then(function (r) { return r.json(); }),
        fetch("data/v1/model-checks.json", { cache: "force-cache" }).then(function (r) { return r.json(); }),
        fetch("data/v1/models.json", { cache: "force-cache" }).then(function (r) { return r.json(); })
      ]).then(function (docs) {
        var d = L.computeDrift({ modelsDoc: docs[2], checksDoc: docs[1],
          pricingDoc: docs[0], historyDoc: history, nowMs: Date.now() });
        var events = L.eventsSince(history, sinceMs);
        return {
          since: sinceDay,
          baseline_at: history.pricing_baseline.at,
          counts: L.countKinds(events),
          events: events,
          price_changes: d.price_changes,
          drift_summary: d.summary,
          drift_alerts: d.per_model.filter(function (r) { return r.severity !== "ok"; })
        };
      });
    }

    function load() {
      window.ApiClient.fetchWithFallback(
        "/api/models-changes?since=" + encodeURIComponent(sinceDay),
        "data/v1/model-history.json",
        { badgeEl: sinceBadge }
      ).then(function (res) {
        if (res.source === "live" && res.data && res.data.events) {
          render(res.data, res.degraded ? "live data, degraded, some checks failed"
            : "checked live just now");
        } else if (res.source === "static" && res.data && res.data.events) {
          payloadFromStatic(res.data).then(function (p) {
            render(p, "from the last published data, the live check did not answer");
          }).catch(function () { /* keep the pre-rendered panels */ });
        }
        // source "none": pre-rendered panels stay; badge hides itself.
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        try { window.localStorage.setItem(VISIT_KEY, new Date().toISOString()); } catch (e) {}
        firstVisit = false;
        sinceMs = Date.now();
        sinceDay = new Date(sinceMs).toISOString().slice(0, 10);
        if (sinceTitle) sinceTitle.textContent = "Baseline reset, today";
        if (sinceLine) sinceLine.textContent = "Baseline reset to today. " +
          "Everything in the log from here on counts as new on your next visit.";
        if (sinceList) sinceList.innerHTML = "";
      });
    }

    load();
  })();
})();
