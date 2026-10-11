/* Model compare — side-by-side comparison of 2–3 models from models.json.
   Shareable via URL params: compare.html?a=kling-3.0&b=veo-3.1
   Discontinued models are excluded (with a note); everything renders from the data. */
(function () {
  "use strict";

  var els = {
    a: document.getElementById("cmp-a"),
    b: document.getElementById("cmp-b"),
    c: document.getElementById("cmp-c"),
    results: document.getElementById("cmp-results"),
    note: document.getElementById("cmp-note"),
    error: document.getElementById("cmp-error")
  };
  if (!els.a || !els.b) return;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function slug(name) {
    return String(name).toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function nativeAudio(m) {
    var weak = String(m.weakness || "").toLowerCase();
    if (/no native audio/.test(weak)) return "No";
    var hay = (String(m.strength || "") + " " + String(m.best_use || "")).toLowerCase();
    if (/native audio|synced audio|dialog|speech|lip-sync|voice/.test(hay)) return "Yes";
    return "Unclear";
  }

  function statusLabel(status) {
    return { active: "Active", reported: "Reported — unconfirmed",
             announced: "Announced — not GA", discontinued: "Discontinued" }[status] || status;
  }

  function sourcesHtml(m) {
    var urls = (m.sources || []).filter(function (u) { return /^https?:\/\//.test(u); });
    if (!urls.length) return "<p>Vendor page — verify live.</p>";
    return "<ul>" + urls.map(function (u) {
      var host = u.split("/")[2] || u;
      return '<li><a href="' + esc(u) + '" rel="noopener">' + esc(host) + "</a></li>";
    }).join("") + "</ul>";
  }

  function card(m) {
    var st = m.status || "active";
    return '<article class="mw-card">' +
      '<span class="mw-badge mw-badge-' + esc(st) + '">' + esc(statusLabel(st)) + "</span>" +
      "<h3>" + esc(m.model) + "</h3>" +
      '<p class="mw-platform">' + esc(m.platform || "") + " · " + esc(m.type || "") +
      " · verified " + esc(m.last_verified || "—") + "</p>" +
      "<dl>" +
      "<dt>Best use</dt><dd>" + esc(m.best_use || "—") + "</dd>" +
      "<dt>Cost</dt><dd>" + esc(m.est_cost_credits || "—") + "</dd>" +
      "<dt>Native audio</dt><dd>" + esc(nativeAudio(m)) + "</dd>" +
      "<dt>Strength</dt><dd>" + esc(m.strength || "—") + "</dd>" +
      "<dt>Weakness</dt><dd>" + esc(m.weakness || "—") + "</dd>" +
      "<dt>What changed</dt><dd>" + esc(m.what_changed || "—") + "</dd>" +
      "<dt>Sources</dt><dd>" + sourcesHtml(m) + "</dd>" +
      "</dl>" +
      '<div class="btn-row" style="margin-top:var(--space-4);">' +
      '<a class="btn btn-sm" href="workshop.html?model=' + encodeURIComponent(m.model) + '">Use in workshop →</a>' +
      '<a class="btn btn-sm btn-ghost" href="model-watch.html">Model watch</a>' +
      "</div></article>";
  }

  function selectedModels(all) {
    var out = [], seen = {};
    [els.a.value, els.b.value, els.c.value].forEach(function (v) {
      if (!v || seen[v]) return;
      seen[v] = true;
      for (var i = 0; i < all.length; i++) {
        if (all[i].model === v) { out.push(all[i]); break; }
      }
    });
    return out;
  }

  function syncUrl() {
    try {
      var p = new URLSearchParams();
      if (els.a.value) p.set("a", slug(els.a.value));
      if (els.b.value) p.set("b", slug(els.b.value));
      if (els.c.value) p.set("c", slug(els.c.value));
      history.replaceState(null, "", "compare.html?" + p.toString());
    } catch (e) { /* ignore */ }
  }

  function render(all) {
    var picks = selectedModels(all);
    if (picks.length < 2) {
      els.results.innerHTML = "";
      els.note.hidden = false;
      return;
    }
    els.note.hidden = true;
    els.results.innerHTML = '<div class="quiz-grid">' + picks.map(card).join("") + "</div>";
    syncUrl();
  }

  function fillSelect(sel, models, preferredSlug) {
    sel.innerHTML = '<option value="">— pick a model —</option>';
    models.forEach(function (m) {
      var o = document.createElement("option");
      o.value = m.model;
      o.textContent = m.model + " — " + m.platform;
      sel.appendChild(o);
    });
    if (preferredSlug) {
      var want = preferredSlug.toLowerCase();
      for (var i = 0; i < models.length; i++) {
        var s = slug(models[i].model);
        if (s === want || s.indexOf(want) === 0) { sel.value = models[i].model; break; }
      }
    }
  }

  fetch("models.json")
    .then(function (r) { if (!r.ok) throw new Error("models failed"); return r.json(); })
    .then(function (d) {
      var all = (d && d.models) || [];
      var usable = all.filter(function (m) { return m.status !== "discontinued"; });
      var dropped = all.length - usable.length;
      var params = {};
      try { params = Object.fromEntries(new URLSearchParams(window.location.search)); } catch (e) {}
      fillSelect(els.a, usable, params.a || "kling-3.0");
      fillSelect(els.b, usable, params.b || "veo-3.1");
      fillSelect(els.c, usable, params.c || "");
      if (dropped > 0) {
        var p = document.createElement("p");
        p.className = "calc-note";
        p.textContent = dropped + " discontinued model" + (dropped === 1 ? "" : "s") +
          " excluded from comparison (see Model watch for the archive).";
        els.error.parentNode.insertBefore(p, els.error);
      }
      ["a", "b", "c"].forEach(function (k) {
        els[k].addEventListener("change", function () { render(usable); });
      });
      render(usable);
    })
    .catch(function () {
      els.error.hidden = false;
      els.error.textContent = "Could not load models.json.";
    });
})();
