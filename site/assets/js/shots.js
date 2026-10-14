/* Shot-list builder, pre-production planner.
   Add shots (type, description, model, seconds, takes) -> live cost table
   from models.json, totals with 5x/20x envelopes, localStorage lists,
   JSON export, and a handoff to the budget optimizer.
   Storage: localStorage "afg-shot-lists" (named lists of shot arrays). */
(function () {
  "use strict";

  var STORE_KEY = "afg-shot-lists";
  var USD_PER_CREDIT = 0.0392; /* models.json cost_basis, Oct 2026, verify live */

  function esc(s) {
    return String(s == null ? "" : "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var els = {
    type: document.getElementById("sh-type"),
    desc: document.getElementById("sh-desc"),
    model: document.getElementById("sh-model"),
    seconds: document.getElementById("sh-seconds"),
    takes: document.getElementById("sh-takes"),
    add: document.getElementById("sh-add"),
    table: document.getElementById("sh-table"),
    tbody: document.getElementById("sh-tbody"),
    empty: document.getElementById("sh-empty"),
    totals: document.getElementById("sh-totals"),
    error: document.getElementById("sh-error"),
    listName: document.getElementById("sh-list-name"),
    saveList: document.getElementById("sh-save-list"),
    loadList: document.getElementById("sh-load-list"),
    deleteList: document.getElementById("sh-delete-list"),
    exportBtn: document.getElementById("sh-export"),
    importFile: document.getElementById("sh-import-file"),
    toOptimizer: document.getElementById("sh-to-optimizer"),
    clear: document.getElementById("sh-clear")
  };
  if (!els.add || !els.tbody) return;

  var models = [];   /* [{m, cps}] priced video models, sorted */
  var unpriced = []; /* model names without a published rate */
  var shots = [];    /* [{type, desc, model, seconds, takes}] */

  function fail(msg) {
    els.error.hidden = false;
    els.error.textContent = msg;
  }

  function costPerSec(m) {
    var s = m.est_cost_credits || "";
    var mt = s.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+)\s*s/);
    if (!mt) return null;
    return parseFloat(mt[1]) / parseFloat(mt[2]);
  }

  function fmtUSD(n) {
    if (n == null || isNaN(n)) return "…";
    if (n >= 1000) return "$" + Math.round(n).toLocaleString("en-US");
    if (n >= 10) return "$" + n.toFixed(0);
    return "$" + n.toFixed(2);
  }

  function cpsFor(name) {
    for (var i = 0; i < models.length; i++) {
      if (models[i].m.model === name) return models[i].cps;
    }
    return null;
  }

  function shotCost(sh) {
    var cps = cpsFor(sh.model);
    if (cps === null) return null;
    return sh.seconds * sh.takes * cps * USD_PER_CREDIT;
  }

  function render() {
    els.tbody.innerHTML = "";
    var totalSec = 0, totalGens = 0, totalUSD = 0, pricedUSD = 0, unpricedCount = 0;

    shots.forEach(function (sh, idx) {
      var cost = shotCost(sh);
      var gens = sh.takes;
      totalSec += sh.seconds * sh.takes;
      totalGens += gens;
      if (cost === null) { unpricedCount++; } else { pricedUSD += cost; }
      totalUSD = pricedUSD;

      var tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" + (idx + 1) + "</td>" +
        "<td><strong>" + esc(sh.type) + "</strong><br><span class=\"quiz-cost-sub\">" + esc(sh.desc || "…") + "</span></td>" +
        "<td>" + esc(sh.model) + "</td>" +
        "<td>" + sh.seconds + "s × " + sh.takes + "</td>" +
        "<td><strong>" + (cost === null ? '<span class="quiz-cost-na">unpriced</span>' : fmtUSD(cost)) + "</strong></td>" +
        '<td><button type="button" class="btn btn-sm btn-ghost" data-del="' + idx + '">Remove</button></td>';
      els.tbody.appendChild(tr);
    });

    els.tbody.querySelectorAll("[data-del]").forEach(function (b) {
      b.addEventListener("click", function () {
        shots.splice(parseInt(b.getAttribute("data-del"), 10), 1);
        render();
      });
    });

    var has = shots.length > 0;
    els.empty.hidden = has;
    els.table.hidden = !has;
    els.totals.hidden = !has;

    if (has) {
      var avgTakes = shots.reduce(function (n, s) { return n + s.takes; }, 0) / shots.length;
      els.totals.innerHTML =
        '<div class="calc-stat"><div class="calc-value">' + shots.length + '</div><div class="calc-label">Shots</div></div>' +
        '<div class="calc-stat"><div class="calc-value">' + totalGens + '</div><div class="calc-label">Generations</div></div>' +
        '<div class="calc-stat"><div class="calc-value">' + Math.round(totalSec) + 's</div><div class="calc-label">Generated footage</div></div>' +
        '<div class="calc-stat highlight"><div class="calc-value">' + fmtUSD(pricedUSD) + '</div><div class="calc-label">Clean cost</div></div>' +
        '<div class="calc-stat highlight"><div class="calc-value">' + fmtUSD(pricedUSD * 5) + '</div><div class="calc-label">5× envelope</div></div>' +
        '<div class="calc-stat highlight"><div class="calc-value">' + fmtUSD(pricedUSD * 20) + '</div><div class="calc-label">20× envelope</div></div>' +
        (unpricedCount
          ? '<p class="calc-note">' + unpricedCount + ' shot' + (unpricedCount === 1 ? '' : 's') +
            ' use' + (unpricedCount === 1 ? 's' : '') + ' an unpriced model, excluded from totals. Verify live before budgeting.</p>'
          : "") +
        '<p class="calc-note">Envelopes from the <a href="craft/longform-pipelines.html">long-form pipelines</a> chapter: rejections, re-grades, and consistency fixes multiply the clean cost 5 to 20×. Budget the envelope, not the clean run.</p>';

      /* Optimizer handoff: total runtime in minutes + average takes. */
      var mins = Math.max(0.5, totalSec / 60).toFixed(1);
      els.toOptimizer.href = "optimizer.html?runtime=" + mins + "&takes=" + Math.round(avgTakes);
      els.toOptimizer.hidden = false;
    } else {
      els.toOptimizer.hidden = true;
    }
    refreshListSelect();
  }

  /* ---------- storage ---------- */

  function readStore() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || "{}") || {}; }
    catch (e) { return {}; }
  }
  function writeStore(o) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(o)); } catch (e) { /* ignore */ }
  }

  function refreshListSelect() {
    var store = readStore();
    var names = Object.keys(store).sort();
    els.loadList.innerHTML = "";
    if (!names.length) {
      var o = document.createElement("option");
      o.textContent = "No saved lists";
      els.loadList.appendChild(o);
      els.loadList.disabled = true;
      els.deleteList.disabled = true;
      return;
    }
    els.loadList.disabled = false;
    els.deleteList.disabled = false;
    names.forEach(function (n) {
      var o = document.createElement("option");
      o.value = n;
      o.textContent = n + " (" + store[n].length + " shots)";
      els.loadList.appendChild(o);
    });
  }

  /* ---------- events ---------- */

  els.add.addEventListener("click", function () {
    var sh = {
      type: els.type.value,
      desc: els.desc.value.trim(),
      model: els.model.value,
      seconds: Math.max(1, parseInt(els.seconds.value, 10) || 4),
      takes: Math.max(1, parseInt(els.takes.value, 10) || 5)
    };
    if (!sh.model) { fail("Pick a model for the shot first, model data is still loading."); return; }
    els.error.hidden = true;
    shots.push(sh);
    els.desc.value = "";
    render();
  });

  els.clear.addEventListener("click", function () {
    shots = [];
    render();
  });

  els.saveList.addEventListener("click", function () {
    var name = (els.listName.value || "").trim();
    if (!name) { fail("Name the list before saving."); return; }
    if (!shots.length) { fail("Nothing to save, add shots first."); return; }
    var store = readStore();
    store[name] = shots;
    writeStore(store);
    els.error.hidden = true;
    els.listName.value = "";
    render();
  });

  els.loadList.addEventListener("change", function () {
    var store = readStore();
    var arr = store[els.loadList.value];
    if (Array.isArray(arr)) { shots = arr; render(); }
  });

  els.deleteList.addEventListener("click", function () {
    var store = readStore();
    delete store[els.loadList.value];
    writeStore(store);
    render();
  });

  els.exportBtn.addEventListener("click", function () {
    var blob = new Blob([JSON.stringify({ exported: new Date().toISOString(), shots: shots }, null, 2)],
      { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "shot-list.json";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 100);
  });

  els.importFile.addEventListener("change", function () {
    var f = els.importFile.files && els.importFile.files[0];
    if (!f) return;
    var r = new FileReader();
    r.onload = function () {
      try {
        var d = JSON.parse(r.result);
        var arr = Array.isArray(d) ? d : d.shots;
        if (!Array.isArray(arr)) throw new Error("bad shape");
        shots = arr.filter(function (s) {
          return s && s.model && s.seconds > 0 && s.takes > 0;
        }).map(function (s) {
          return { type: String(s.type || "Wide"), desc: String(s.desc || ""), model: String(s.model),
                   seconds: Math.max(1, parseInt(s.seconds, 10) || 4), takes: Math.max(1, parseInt(s.takes, 10) || 5) };
        });
        els.error.hidden = true;
        render();
      } catch (e) { fail("Could not import that file, expected the shot-list JSON this page exports."); }
    };
    r.readAsText(f);
    els.importFile.value = "";
  });

  /* ---------- init ---------- */

  fetch("models.json")
    .then(function (r) { if (!r.ok) throw new Error("models failed"); return r.json(); })
    .then(function (d) {
      var all = ((d && d.models) || []).filter(function (m) { return m.type === "video" && m.status !== "discontinued"; });
      if (!all.length) { fail("No video models found in models.json."); return; }
      all.forEach(function (m) {
        var cps = costPerSec(m);
        if (cps === null) { unpriced.push(m.model); }
        else { models.push({ m: m, cps: cps }); }
      });
      models.sort(function (a, b) { return a.cps - b.cps; });
      models.forEach(function (x) {
        var o = document.createElement("option");
        o.value = x.m.model;
        o.textContent = x.m.model + ", " + x.cps.toFixed(2) + " cr/s";
        els.model.appendChild(o);
      });
      if (unpriced.length) {
        var g = document.createElement("optgroup");
        g.label = "No published rate (unpriced)";
        unpriced.forEach(function (n) {
          var o = document.createElement("option");
          o.value = n;
          o.textContent = n;
          g.appendChild(o);
        });
        els.model.appendChild(g);
      }
      render();
    })
    .catch(function () { fail("Could not load models.json. The shot-list builder needs the built site data."); });

  render();
})();
