/* Budget optimizer — turns the calculator into a planner.
   Data-driven from models.json (copied into site/ at build time): no hardcoded
   model picks. Splits the runtime into dialogue vs non-dialogue buckets and
   assigns the cheapest model that satisfies the quality tier per bucket.
   USD conversion: $0.0392/credit from models.json cost_basis
   (Higgsfield Plus $47/1200cr, observed 2026-10-10) — third-party estimate. */
(function () {
  "use strict";

  var USD_PER_CREDIT = 0.0392; /* models.json cost_basis, Oct 2026 — verify live */

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var els = {
    runtime: document.getElementById("o-runtime"),
    runtimeOut: document.getElementById("o-runtime-out"),
    dialogue: document.getElementById("o-dialogue"),
    dialogueOut: document.getElementById("o-dialogue-out"),
    shotlen: document.getElementById("o-shotlen"),
    tier: document.getElementById("o-tier"),
    takes: document.getElementById("o-takes"),
    results: document.getElementById("o-results"),
    error: document.getElementById("o-error")
  };
  if (!els.runtime || !els.results) return;

  /* Parse "720p ~22/5s" -> 4.4 credits/sec (first N/Ms pattern). Null if unverified. */
  function costPerSec(m) {
    var s = m.est_cost_credits || "";
    var mt = s.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+)\s*s/);
    if (!mt) return null;
    return parseFloat(mt[1]) / parseFloat(mt[2]);
  }

  function hay(m) {
    return ((m.best_use || "") + " " + (m.strength || "") + " " + (m.weakness || "")).toLowerCase();
  }

  function isAudioCapable(m) {
    return /native audio|dialog|speech|lip-sync|lip sync|voice/.test(hay(m));
  }

  function isQualityFlagged(m) {
    return /cinematic|hero|narrative|realism|controlled|premium/.test(hay(m));
  }

  /* Cheapest model in pool satisfying the tier. Pool is [{m, cps}] sorted asc by cps. */
  function tierPick(pool, tier) {
    if (!pool.length) return null;
    if (tier === "draft") return pool[0];
    if (tier === "standard") return pool[Math.floor(pool.length / 2)];
    var flagged = pool.filter(function (x) { return isQualityFlagged(x.m); });
    return flagged.length ? flagged[0] : pool[pool.length - 1];
  }

  function fmtUSD(n) {
    if (n >= 1000) return "$" + Math.round(n).toLocaleString("en-US");
    if (n >= 10) return "$" + n.toFixed(0);
    return "$" + n.toFixed(2);
  }

  function whyLine(x) {
    var m = x.m;
    var bits = [];
    if (m.strength) bits.push("Strength: " + m.strength.slice(0, 120) + (m.strength.length > 120 ? "…" : ""));
    if (m.best_use) bits.push("Best use: " + m.best_use.slice(0, 120) + (m.best_use.length > 120 ? "…" : ""));
    return bits.join(" ");
  }

  function bucketRow(label, share, x, seconds, shotLen, takes) {
    var credits = seconds * takes * x.cps;
    var usd = credits * USD_PER_CREDIT;
    var gens = Math.round((seconds / shotLen) * takes);
    return {
      label: label, share: share, model: x.m.model, platform: x.m.platform,
      cps: x.cps, seconds: seconds, gens: gens, credits: credits, usd: usd,
      why: whyLine(x), audioFallback: false
    };
  }

  function render(plan, unpriced, totals) {
    var rows = plan.map(function (r) {
      return "<tr>" +
        "<td><strong>" + esc(r.label) + "</strong><br><span class=\"quiz-cost-sub\">" +
        Math.round(r.share * 100) + "% of runtime · " + Math.round(r.seconds) + "s · " +
        r.gens.toLocaleString("en-US") + " generations</span></td>" +
        "<td><strong>" + esc(r.model) + "</strong><br><span class=\"quiz-cost-sub\">" + esc(r.platform) + "</span>" +
        (r.audioFallback ? "<br><span class=\"quiz-cost-na\">No priced native-audio model — verify live.</span>" : "") + "</td>" +
        "<td>" + r.cps.toFixed(2) + "/s</td>" +
        "<td><strong>" + fmtUSD(r.usd) + "</strong><br><span class=\"quiz-cost-sub\">" +
        Math.round(r.credits).toLocaleString("en-US") + " credits</span></td>" +
        "</tr>";
    }).join("");

    var whyItems = plan.map(function (r) {
      return "<li><strong>" + esc(r.model) + "</strong> for " + esc(r.label.toLowerCase()) + ": " + esc(r.why) + "</li>";
    }).join("");

    els.results.innerHTML =
      '<h2 id="o-plan-h" tabindex="-1">Your shoot plan</h2>' +
      '<div class="table-scroll"><table>' +
      "<caption>Model mix computed live from <code>models.json</code> — update the data, not this page.</caption>" +
      "<thead><tr><th scope=\"col\">Bucket</th><th scope=\"col\">Model</th>" +
      "<th scope=\"col\">Rate</th><th scope=\"col\">Clean cost</th></tr></thead>" +
      "<tbody>" + rows + "</tbody></table></div>" +
      '<div class="calc-grid" style="margin-top:var(--space-5);">' +
      '<div class="card calc-results">' +
      '<div class="calc-stat highlight"><div class="calc-value">' + fmtUSD(totals.clean) + '</div><div class="calc-label">Clean run</div></div>' +
      '<div class="calc-stat highlight"><div class="calc-value">' + fmtUSD(totals.five) + '</div><div class="calc-label">5× envelope (realistic)</div></div>' +
      '<div class="calc-stat highlight"><div class="calc-value">' + fmtUSD(totals.twenty) + '</div><div class="calc-label">20× envelope (worst case)</div></div>' +
      '<p class="calc-note">Envelopes from the <a href="craft/longform-pipelines.html">long-form pipelines</a> chapter: rejections, re-grades, and consistency fixes multiply the clean cost 5–20×. Budget the envelope, not the clean run.</p>' +
      "</div></div>" +
      "<h3>Why these picks</h3><ul>" + whyItems + "</ul>" +
      (unpriced.length
        ? '<p class="calc-note">' + unpriced.length + " model" + (unpriced.length === 1 ? "" : "s") +
          " excluded — no published rate (" + unpriced.map(esc).join(", ") + "). Verify live before budgeting.</p>"
        : "") +
      '<p class="calc-note">All rates are third-party estimates (Oct 2026) at $0.0392/credit — verify live before spending. ' +
      "Dialogue detection reads each model's documented strengths; it is not a guarantee of lip-sync quality.</p>";
    document.getElementById("o-plan-h").focus({ preventScroll: false });
  }

  function fail(msg) {
    els.error.hidden = false;
    els.error.textContent = msg;
  }

  var videoModels = null, unpriced = [];

  fetch("models.json")
    .then(function (r) { if (!r.ok) throw new Error("models failed"); return r.json(); })
    .then(function (d) {
      var models = ((d && d.models) || []).filter(function (m) { return m.type === "video"; });
      if (!models.length) { fail("No video models found in models.json."); return; }
      videoModels = models.map(function (m) { return { m: m, cps: costPerSec(m) }; });
      unpriced = videoModels.filter(function (x) { return x.cps === null; }).map(function (x) { return x.m.model; });
      videoModels = videoModels.filter(function (x) { return x.cps !== null; })
        .sort(function (a, b) { return a.cps - b.cps; });
      compute();
    })
    .catch(function () { fail("Could not load models.json. The optimizer needs the built site data."); });

  function compute() {
    if (!videoModels) return;
    var minutes = Math.max(0.5, parseFloat(els.runtime.value) || 4);
    var dialoguePct = Math.min(100, Math.max(0, parseFloat(els.dialogue.value) || 0));
    var shotLen = Math.max(2, parseFloat(els.shotlen.value) || 4);
    var tier = els.tier.value;
    var takes = parseInt(els.takes.value, 10) || 5;

    els.runtimeOut.textContent = minutes + " min";
    els.dialogueOut.textContent = dialoguePct + "%";

    var totalSec = minutes * 60;
    var diaSec = totalSec * (dialoguePct / 100);
    var heroSec = totalSec - diaSec;

    var audioPool = videoModels.filter(function (x) { return isAudioCapable(x.m); });
    var plan = [];

    if (diaSec > 0) {
      var diaPick = tierPick(audioPool.length ? audioPool : videoModels, tier);
      var row = bucketRow("Dialogue", dialoguePct / 100, diaPick, diaSec, shotLen, takes);
      if (!audioPool.length) row.audioFallback = true;
      plan.push(row);
    }
    if (heroSec > 0) {
      plan.push(bucketRow(diaSec > 0 ? "Non-dialogue" : "All footage",
        heroSec / totalSec, tierPick(videoModels, tier), heroSec, shotLen, takes));
    }

    var clean = plan.reduce(function (n, r) { return n + r.usd; }, 0);
    render(plan, unpriced, { clean: clean, five: clean * 5, twenty: clean * 20 });
  }

  ["input", "change"].forEach(function (ev) {
    [els.runtime, els.dialogue, els.shotlen, els.tier, els.takes].forEach(function (el) {
      el.addEventListener(ev, compute);
    });
  });
})();
