/* Model showdown, two models on the cutting table, rendered entirely from
   the Watchtower record embedded in the page at build time (models.json +
   pricing.json + model-checks.json + model-history.json, the same data the
   model-watch page renders). Nothing is scored, estimated, or invented:
   every "edge" chip is a direct comparison of two published values, and an
   unpublished rate is shown as unpublished.
   Shareable via URL params: showdown.html?a=veo-3-1&b=kling-3-0 */
(function () {
  "use strict";

  var island = document.getElementById("sd-data");
  var stage = document.getElementById("sd-stage");
  var verdictEl = document.getElementById("sd-verdict");
  var selA = document.getElementById("sd-a");
  var selB = document.getElementById("sd-b");
  var swapBtn = document.getElementById("sd-swap");
  if (!island || !stage || !selA || !selB) return;

  var data;
  try { data = JSON.parse(island.textContent); } catch (e) { return; }
  var byId = {};
  data.models.forEach(function (m) { byId[m.id] = m; });

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>\"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function money(v) {
    if (v === null || v === undefined) return "…";
    if (v < 0.1 && v !== 0) return "$" + v.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
    return "$" + v.toFixed(2);
  }

  function moneyRange(lo, hi) {
    if (lo === null || lo === undefined) return "…";
    return lo === hi ? money(lo) : money(lo) + " to " + money(hi);
  }

  function fmtDay(iso) {
    if (!iso) return "…";
    var d = new Date(String(iso).slice(0, 10) + "T00:00:00Z");
    if (isNaN(d)) return String(iso).slice(0, 10);
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months[d.getUTCMonth()] + " " + d.getUTCDate() + ", " + d.getUTCFullYear();
  }

  /* --- edges: direct comparisons of published values only --- */
  function cheapestByUnit(m) {
    var out = {};
    (m.tiers || []).forEach(function (t) {
      var mid = (t.low + t.high) / 2;
      if (out[t.unit] === undefined || mid < out[t.unit]) out[t.unit] = mid;
    });
    return out;
  }

  function computeEdges(a, b) {
    var e = { rate: {}, sources: null, fresh: null, drift: null };
    var ca = cheapestByUnit(a), cb = cheapestByUnit(b);
    Object.keys(ca).forEach(function (u) {
      if (cb[u] === undefined || ca[u] === cb[u]) return;
      e.rate[u] = ca[u] < cb[u] ? "a" : "b";
    });
    if (a.sources_total && b.sources_total) {
      var fa = a.sources_ok / a.sources_total, fb = b.sources_ok / b.sources_total;
      if (fa !== fb) e.sources = fa > fb ? "a" : "b";
    }
    if (a.last_verified && b.last_verified && a.last_verified !== b.last_verified) {
      e.fresh = a.last_verified > b.last_verified ? "a" : "b";
    }
    if (a.alerts.length !== b.alerts.length) e.drift = a.alerts.length < b.alerts.length ? "a" : "b";
    return e;
  }

  function chip(text) { return ' <span class="sd-edge">' + esc(text) + "</span>"; }

  function rateCell(m, other, side, edges) {
    if (m.pricing_status === "unpublished") {
      return '<p class="sd-unpub">Unpublished, no USD rate on record.</p>' +
        "<p>The guide does not estimate one. Verify live before budgeting.</p>";
    }
    if (m.pricing_status === "missing" || !(m.tiers || []).length) {
      return '<p class="sd-unpub">No pricing record.</p><p>Verify live before budgeting.</p>';
    }
    var cheapest = cheapestByUnit(m);
    var rows = m.tiers.map(function (t) {
      var c = "";
      if (edges.rate[t.unit] === side && (t.low + t.high) / 2 === cheapest[t.unit]) {
        c = chip("lowest " + t.unit + " rate");
      }
      return "<li><strong>" + esc(t.tier) + "</strong>, " + esc(moneyRange(t.low, t.high)) +
        " / " + esc(t.unit) + ' <span class="sd-conf">(' + esc(t.confidence) + ")</span>" + c + "</li>";
    });
    return "<ul class=\"sd-tiers\">" + rows.join("") + "</ul>" +
      (m.cost_line ? "<p>On the record: " + esc(m.cost_line) + "</p>" : "");
  }

  function checkCell(m, side, edges) {
    var word = { stable: "Stable, every watched source answered",
                 changed: "Changed, a watched source moved; queued for review",
                 error: "Check failed, a watched source did not answer",
                 unwatched: "No automated source watch" }[m.check_status] || m.check_status;
    var s = "<p><strong>" + esc(word) + ".</strong></p>";
    if (m.sources_total) {
      s += "<p>Sources answering: " + m.sources_ok + " of " + m.sources_total +
        (edges.sources === side ? chip("more sources answering") : "") + "</p>";
    }
    if (m.last_checked) s += "<p>Last checked " + esc(fmtDay(m.last_checked)) + ".</p>";
    return s;
  }

  function driftCell(m, side, edges) {
    var word = { alert: "Review", watch: "Watch", ok: "Clear" }[m.severity] || m.severity;
    var s = '<p><span class="wt-sev wt-sev-' + esc(m.severity) + '">' + esc(word) + "</span>" +
      (edges.drift === side ? chip("cleaner drift board") : "") + "</p>";
    if (m.alerts.length) {
      s += "<ul class=\"sd-alerts\">" + m.alerts.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>";
    } else {
      s += "<p>No open alerts on the drift board.</p>";
    }
    return s;
  }

  function movesCell(m) {
    if (!m.price_moves.length) return "<p>No movement against the " + esc(fmtDay(data.feed.baseline_day)) + " pricing baseline.</p>";
    return "<ul class=\"sd-alerts\">" + m.price_moves.map(function (mv) {
      return "<li>" + esc(mv.what) + ", was " + esc(mv.was) + ", now " + esc(mv.now) + ".</li>";
    }).join("") + "</ul>";
  }

  function eventCell(m) {
    if (!m.latest_event) return "<p>No events in the Watchtower log yet.</p>";
    return "<p><strong>" + esc(m.latest_event.kind) + "</strong> · " + esc(fmtDay(m.latest_event.date)) +
      "</p><p>" + esc(m.latest_event.summary) + "</p>";
  }

  function reelHead(m, side) {
    return '<div class="sd-reel-head">' +
      '<span class="mw-badge mw-badge-' + esc(m.status) + '">' + esc(m.status_label) + "</span>" +
      "<h3>" + esc(m.name) + "</h3>" +
      '<p class="mw-platform">' + esc(m.platform) + " · " + esc(m.type) + "</p>" +
      '<p class="sd-reel-links"><a href="' + esc(m.deep_dive) + '">Deep dive</a> · ' +
      '<a href="model-watch.html">Model watch</a></p></div>';
  }

  function row(label, aHtml, bHtml) {
    return '<div class="sd-row"><div class="sd-cell sd-cell-a">' + aHtml + '</div>' +
      '<div class="sd-lab">' + esc(label) + '</div>' +
      '<div class="sd-cell sd-cell-b">' + bHtml + "</div></div>";
  }

  function render(a, b) {
    var edges = computeEdges(a, b);
    var html = '<div class="sd-reels"><div class="sd-reel">' + reelHead(a, "a") + '</div>' +
      '<div class="sd-splice" aria-hidden="true">VS</div>' +
      '<div class="sd-reel">' + reelHead(b, "b") + "</div></div>";
    html += '<div class="sd-table">';
    html += row("Status", "<p><strong>" + esc(a.status_label) + "</strong></p>", "<p><strong>" + esc(b.status_label) + "</strong></p>");
    html += row("The rate", rateCell(a, b, "a", edges), rateCell(b, a, "b", edges));
    html += row("Best use", "<p>" + esc(a.best_use || "…") + "</p>", "<p>" + esc(b.best_use || "…") + "</p>");
    html += row("Strength", "<p>" + esc(a.strength || "…") + "</p>", "<p>" + esc(b.strength || "…") + "</p>");
    html += row("Weakness", "<p>" + esc(a.weakness || "…") + "</p>", "<p>" + esc(b.weakness || "…") + "</p>");
    html += row("Source check", checkCell(a, "a", edges), checkCell(b, "b", edges));
    html += row("Drift board", driftCell(a, "a", edges), driftCell(b, "b", edges));
    html += row("Vs the baseline", movesCell(a), movesCell(b));
    html += row("Record verified",
      "<p>" + esc(fmtDay(a.last_verified)) + (edges.fresh === "a" ? chip("verified more recently") : "") + "</p>",
      "<p>" + esc(fmtDay(b.last_verified)) + (edges.fresh === "b" ? chip("verified more recently") : "") + "</p>");
    html += row("Latest event", eventCell(a), eventCell(b));
    html += "</div>";
    stage.innerHTML = html;
    verdictEl.innerHTML = verdict(a, b, edges);
  }

  function verdict(a, b, edges) {
    var lines = [];
    Object.keys(edges.rate).forEach(function (u) {
      var w = edges.rate[u] === "a" ? a : b, l = edges.rate[u] === "a" ? b : a;
      lines.push("<strong>" + esc(w.name) + "</strong> carries the lower entry per-" + esc(u) +
        " rate of the two; <strong>" + esc(l.name) + "</strong> starts higher on that unit.");
    });
    if (a.pricing_status === "unpublished" && b.pricing_status !== "unpublished") {
      lines.push("<strong>" + esc(a.name) + "</strong> has no published USD rate, its cost cannot be compared from the record, and the guide does not guess one.");
    }
    if (b.pricing_status === "unpublished" && a.pricing_status !== "unpublished") {
      lines.push("<strong>" + esc(b.name) + "</strong> has no published USD rate, its cost cannot be compared from the record, and the guide does not guess one.");
    }
    if (edges.sources) {
      var sw = edges.sources === "a" ? a : b;
      lines.push("<strong>" + esc(sw.name) + "</strong> has more of its watched sources answering (" +
        sw.sources_ok + " of " + sw.sources_total + ").");
    }
    if (edges.drift) {
      var dw = edges.drift === "a" ? a : b;
      lines.push("<strong>" + esc(dw.name) + "</strong> sits cleaner on the drift board, fewer open alerts.");
    }
    if (!lines.length) {
      lines.push("On the published record these two are level, no rate, source, or freshness edge separates them. The difference is in the rows.");
    }
    return lines.join(" ");
  }

  function fillSelect(sel, selectedId) {
    if (sel.options.length) { sel.value = selectedId; return; }
    data.models.forEach(function (m) {
      var o = document.createElement("option");
      o.value = m.id; o.textContent = m.name;
      if (m.id === selectedId) o.selected = true;
      sel.appendChild(o);
    });
  }

  function current() {
    return [byId[selA.value] || data.models[0], byId[selB.value] || data.models[1]];
  }

  function sync() {
    var pair = current();
    if (pair[0].id === pair[1].id) {
      stage.innerHTML = '<p class="empty-state">Pick two different models, a reel cannot be spliced against itself.</p>';
      verdictEl.textContent = "";
      return;
    }
    render(pair[0], pair[1]);
    try {
      var url = new URL(window.location.href);
      url.searchParams.set("a", pair[0].id);
      url.searchParams.set("b", pair[1].id);
      window.history.replaceState(null, "", url.toString());
    } catch (e) { /* file://, the table still renders */ }
  }

  var params = new URLSearchParams(window.location.search);
  var startA = byId[params.get("a")] ? params.get("a") : selA.value || data.models[0].id;
  var startB = byId[params.get("b")] ? params.get("b") : selB.value || data.models[1].id;
  fillSelect(selA, startA);
  fillSelect(selB, startB);
  selA.value = startA; selB.value = startB;
  selA.addEventListener("change", sync);
  selB.addEventListener("change", sync);
  if (swapBtn) swapBtn.addEventListener("click", function () {
    var t = selA.value; selA.value = selB.value; selB.value = t; sync();
  });
  sync();
})();
