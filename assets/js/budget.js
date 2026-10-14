/* Interactive budget calculator, The Watchtower edition.
   Rate table loads from /api/models-pricing (live) with fallback to the
   static data/v1/pricing.json; a small built-in estimate table covers the
   case where neither can be read, so the calculator never goes blank.
   Every option names its rate basis; the provenance line under the results
   always says where the numbers came from. */
(function () {
  "use strict";

  /* Built-in fallback, Oct 2026 third-party estimates. Used only when the
     live API and the cached pricing.json are both unreachable, and for
     models the pricing table has no video rate for. */
  var BUILTIN = [
    ["Vidu", 0.05, 0.05],
    ["PixVerse", 0.07, 0.07],
    ["Pika", 0.17, 0.61],
    ["Hailuo (MiniMax)", 0.44, 0.76],
    ["Luma", 0.30, 1.20],
    ["Kling 3.0", 0.40, 0.40],
    ["Veo 3.1 Fast", 0.40, 0.50],
    ["Sora 2", 0.40, 2.00],
    ["Runway Gen-4.5", 1.44, 1.50],
    ["Higgsfield (Seedance 2.5)", 2.48, 2.48]
  ];

  var els = {
    runtime: document.getElementById("b-runtime"),
    runtimeOut: document.getElementById("b-runtime-out"),
    shotLen: document.getElementById("b-shotlen"),
    model: document.getElementById("b-model"),
    takes: document.getElementById("b-takes"),
    shots: document.getElementById("r-shots"),
    gens: document.getElementById("r-gens"),
    low: document.getElementById("r-low"),
    high: document.getElementById("r-high"),
    rule: document.getElementById("r-rule"),
    prov: document.getElementById("b-provenance"),
    badge: document.getElementById("b-api-badge")
  };
  if (!els.runtime) return;

  // Unified rate entry: {name, rateLow, rateHigh, perSecond, tierName, basis}.
  // perSecond → per-clip cost = rate × current shot length.
  var table = [];
  var provenance = { kind: "builtin", at: null };

  function builtinTable() {
    return BUILTIN.map(function (m) {
      return { name: m[0], rateLow: m[1], rateHigh: m[2], perSecond: false,
               tierName: "per-clip estimate", basis: "built-in estimate (Oct 2026)" };
    });
  }

  function normName(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }

  // Pick the representative tier: 1080p first (the calculator's quality bar),
  // then 720p, then the first tier with a usable unit.
  function pickTier(tiers) {
    var usable = (tiers || []).filter(function (t) {
      return t && (t.unit === "second" || t.unit === "clip") &&
        typeof t.usd_low === "number" && typeof t.usd_high === "number";
    });
    if (!usable.length) return null;
    function has(q) {
      for (var i = 0; i < usable.length; i++) {
        if (String(usable[i].tier || "").toLowerCase().indexOf(q) !== -1) return usable[i];
      }
      return null;
    }
    return has("1080p") || has("720p") || usable[0];
  }

  // pricing.json (live envelope uses `models`, static file uses `entries`) →
  // rate table. Built-in rows survive only for models the pricing table has
  // no video rate for.
  function pricingTable(doc) {
    var entries = (doc && (doc.entries || doc.models)) || [];
    var out = [];
    var covered = [];
    entries.forEach(function (e) {
      if (!e || e.type !== "video" || e.status === "discontinued") return;
      var tier = pickTier(e.tiers);
      if (!tier) return;
      var name = e.model || e.model_id;
      covered.push(normName(name));
      out.push({ name: name, rateLow: tier.usd_low, rateHigh: tier.usd_high,
        perSecond: tier.unit === "second", tierName: String(tier.tier || tier.unit),
        basis: (tier.basis || "pricing.json").split(";")[0] });
    });
    builtinTable().forEach(function (b) {
      var n = normName(b.name);
      var hit = covered.some(function (c) { return c.indexOf(n) !== -1 || n.indexOf(c) !== -1; });
      if (!hit) out.push(b);
    });
    return out;
  }

  function money(n) { return "$" + n.toFixed(2); }

  function perClip(entry, shotLen) {
    var k = entry.perSecond ? shotLen : 1;
    return [entry.rateLow * k, entry.rateHigh * k];
  }

  function optionLabel(entry, shotLen) {
    var pc = perClip(entry, shotLen);
    var range = money(pc[0]) + (pc[1] !== pc[0] ? "" + money(pc[1]) : "");
    return entry.name + " (~" + range + "/clip)";
  }

  function optionTitle(entry, shotLen) {
    var span = money(entry.rateLow) + (entry.rateHigh !== entry.rateLow ? "" + money(entry.rateHigh) : "");
    var rate = entry.perSecond ? span + "/s × " + shotLen + "s shots" : span + "/clip";
    return entry.tierName + " tier · " + rate + " · " + entry.basis;
  }

  function renderOptions(keepName) {
    var shotLen = parseFloat(els.shotLen.value) || 4;
    els.model.innerHTML = "";
    table.forEach(function (entry, i) {
      var o = document.createElement("option");
      o.value = String(i);
      o.textContent = optionLabel(entry, shotLen);
      o.title = optionTitle(entry, shotLen);
      els.model.appendChild(o);
    });
    var idx = 0;
    if (keepName) {
      var n = normName(keepName);
      for (var i = 0; i < table.length; i++) {
        var c = normName(table[i].name);
        if (c.indexOf(n) !== -1 || n.indexOf(c) !== -1) { idx = i; break; }
      }
    } else {
      for (var j = 0; j < table.length; j++) {
        if (normName(table[j].name).indexOf("kling 3 0") !== -1) { idx = j; break; }
      }
    }
    els.model.value = String(idx);
  }

  function fmtWhen(iso) {
    try {
      var d = new Date(iso);
      if (isNaN(d.getTime())) return "unknown time";
      return d.toISOString().slice(0, 16).replace("T", " ") + " UTC";
    } catch (e) { return "unknown time"; }
  }

  function provenanceText() {
    var shotLen = parseFloat(els.shotLen.value) || 4;
    var basis = provenance.kind === "live"
      ? "Watchtower live API · " + fmtWhen(provenance.at)
      : provenance.kind === "static"
        ? "cached pricing.json · updated " + fmtWhen(provenance.at)
        : "built-in estimates (Oct 2026), live data unavailable";
    return "Rates: " + basis + ". Per-second rates × your " + shotLen +
      "s shots; hover a model for its basis.";
  }

  function fmt(n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  }

  function selectedName() {
    var e = table[parseInt(els.model.value, 10)];
    return e ? e.name : "";
  }

  function refreshLabels() {
    var shotLen = parseFloat(els.shotLen.value) || 4;
    Array.prototype.forEach.call(els.model.options, function (o, i) {
      if (table[i]) {
        o.textContent = optionLabel(table[i], shotLen);
        o.title = optionTitle(table[i], shotLen);
      }
    });
  }

  function calc() {
    var minutes = parseFloat(els.runtime.value) || 0;
    var shotLen = parseFloat(els.shotLen.value) || 4;
    var entry = table[parseInt(els.model.value, 10)] || table[0];
    if (!entry) return;
    var takes = parseInt(els.takes.value, 10) || 5;
    els.runtimeOut.textContent = minutes + " min";

    var shots = Math.max(1, Math.round((minutes * 60) / shotLen));
    var gens = shots * takes;
    var pc = perClip(entry, shotLen);
    var low = gens * pc[0];
    var high = gens * pc[1];
    var rule = minutes * 80;

    els.shots.textContent = shots.toLocaleString("en-US");
    els.gens.textContent = gens.toLocaleString("en-US");
    els.low.textContent = fmt(low);
    els.high.textContent = fmt(high);
    els.rule.textContent = fmt(rule);
    refreshLabels();
    if (els.prov) els.prov.textContent = provenanceText();
  }

  ["input", "change"].forEach(function (ev) {
    [els.runtime, els.shotLen, els.model, els.takes].forEach(function (el) {
      el.addEventListener(ev, calc);
    });
  });

  // Paint immediately from the built-in table (never a blank calculator),
  // then upgrade to live/cached pricing when the fetch resolves.
  table = builtinTable();
  renderOptions(null);
  calc();

  if (window.ApiClient && typeof fetch === "function") {
    window.ApiClient.fetchWithFallback("/api/models-pricing", "data/v1/pricing.json", { badgeEl: els.badge })
      .then(function (res) {
        if ((res.source !== "live" && res.source !== "static") || !res.data) return;
        var next = pricingTable(res.data);
        if (!next.length) return; // keep built-in rather than an empty table
        var keep = selectedName();
        table = next;
        provenance = { kind: res.source, at: res.generatedAt };
        renderOptions(keep);
        calc();
      });
  } else if (els.badge) {
    els.badge.dataset.apiState = "none";
  }
})();
