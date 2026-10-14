/* Model-picker quiz, 5 questions -> ranked top-3 from models.json, data-driven.
   No hardcoded picks: scoring reads best_use/strength/weakness keywords + parsed cost. */
(function () {
  "use strict";

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var form = document.getElementById("quiz-form");
  var results = document.getElementById("quiz-results");
  if (!form || !results) return;

  var USE_CASES = {
    dialogue:  { label: "Dialogue with synced speech", keys: ["dialog", "speech", "lip", "voice", "talk", "audio", "say"] },
    photoreal:  { label: "Photoreal humans / drama",   keys: ["photoreal", "realis", "drama", "cinematic", "human", "narrative"] },
    stylized:   { label: "Stylized / animated",        keys: ["styl", "anim", "cartoon", "anime", "illustrat"] },
    drafts:     { label: "Cheap drafts & fast iteration", keys: ["draft", "cheap", "fast", "iterat", "budget", "b-roll"] },
    longform:   { label: "Long-form / multi-shot narrative", keys: ["multi-shot", "narrative", "continuity", "long", "sequence"] },
    presenter:  { label: "Talking presenter / ads",     keys: ["presenter", "talk", "ad", "speech"] }
  };
  var LOOKS = {
    realism:  { keys: ["photoreal", "realis", "cinematic", "film"] },
    balanced: { keys: ["versatile", "cinematic", "narrative"] },
    stylized: { keys: ["styl", "anim", "aesthetic"] }
  };

  function hay(m) {
    return ((m.best_use || "") + " " + (m.strength || "") + " " + (m.weakness || "")).toLowerCase();
  }
  function hit(h, keys) {
    return keys.some(function (k) { return h.indexOf(k) !== -1; });
  }

  /* Parse "720p ~22/5s" -> 4.4 credits/sec (first N/Ms pattern). Null if unverified. */
  function costPerSec(m) {
    var s = m.est_cost_credits || "";
    var mt = s.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+)\s*s/);
    if (!mt) return null;
    return parseFloat(mt[1]) / parseFloat(mt[2]);
  }

  function score(m, ans, costRank) {
    var h = hay(m), s = 0;
    var uc = USE_CASES[ans.usecase];
    if (uc && hit(h, uc.keys)) s += 3;
    if (uc && hit((m.weakness || "").toLowerCase(), uc.keys)) s -= 2;
    var lk = LOOKS[ans.look];
    if (lk && hit(h, lk.keys)) s += 2;
    if (ans.audio === "must" && /native audio|dialog|speech|lip-sync|voice/.test(h)) s += 3;
    else if (ans.audio === "nice" && /native audio|dialog|speech|lip-sync|voice/.test(h)) s += 1;
    if (ans.budget === "shoestring") {
      if (costRank === 0) s += 3; else if (costRank === 1) s += 1; else s -= 2;
    } else if (ans.budget === "balanced" && costRank === 1) {
      s += 1;
    }
    return s;
  }

  function whyLines(m, ans) {
    var lines = [];
    var uc = USE_CASES[ans.usecase];
    if (m.status && m.status !== "active") {
      var lbl = m.status === "reported" ? "reported, unconfirmed"
        : m.status === "announced" ? "announced, not yet generally available" : m.status;
      lines.push("Status: " + lbl + " (verified " + (m.last_verified || "…") + "). Don't plan a production around it yet.");
    }
    if (uc && hit(hay(m), uc.keys)) lines.push("Fits your use case, " + uc.label.toLowerCase() + " is in its wheelhouse.");
    if (ans.audio === "must" && /native audio|dialog|speech|lip-sync|voice/.test(hay(m)))
      lines.push("Handles dialogue/speech natively.");
    if (m.strength) lines.push("Strength: " + m.strength.slice(0, 140) + (m.strength.length > 140 ? "…" : ""));
    if (m.weakness) lines.push("Watch out: " + m.weakness.slice(0, 140) + (m.weakness.length > 140 ? "…" : ""));
    return lines.slice(0, 4);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var data = new FormData(form);
    var ans = {
      usecase: data.get("usecase"),
      budget: data.get("budget"),
      look: data.get("look"),
      audio: data.get("audio"),
      seconds: Math.max(1, parseFloat(data.get("seconds")) || 60),
      takes: Math.max(1, parseFloat(data.get("takes")) || 5)
    };
    if (!ans.usecase || !ans.budget || !ans.look || !ans.audio) {
      results.innerHTML = '<div class="empty-state"><span class="es-slate">No footage</span><p>Answer all four questions first.</p></div>';
      return;
    }

    fetch("models.json")
      .then(function (r) { if (!r.ok) throw new Error("models failed"); return r.json(); })
      .then(function (d) {
        var models = ((d && d.models) || []).filter(function (m) { return m.type === "video" && m.status !== "discontinued"; });
        var withCost = models.map(function (m) { return { m: m, cps: costPerSec(m) }; });
        var priced = withCost.filter(function (x) { return x.cps !== null; })
          .sort(function (a, b) { return a.cps - b.cps; });
        function rank(x) {
          if (x.cps === null) return 1;
          var i = priced.indexOf(x);
          var t = i / Math.max(1, priced.length - 1);
          return t < 0.34 ? 0 : (t < 0.67 ? 1 : 2);
        }
        var scored = withCost.map(function (x) {
          return { x: x, s: score(x.m, ans, rank(x)) };
        }).sort(function (a, b) { return b.s - a.s; });

        var top = scored.slice(0, 3);
        var html = top.map(function (r2, i) {
          var m = r2.x.m, cps = r2.x.cps;
          var cost = cps === null
            ? '<span class="quiz-cost-na">Cost unverified, check the live pricing before budgeting.</span>'
            : "Est. <strong>" + Math.round(cps * ans.seconds * ans.takes) + " credits</strong> " +
              '<span class="quiz-cost-sub">(' + cps.toFixed(2) + "/sec × " + ans.seconds + "s × " + ans.takes + " takes)</span>";
          var whys = whyLines(m, ans).map(function (w) {
            return "<li>" + esc(w) + "</li>";
          }).join("");
          return '<article class="card quiz-card">' +
            '<div class="quiz-rank" aria-hidden="true">#' + (i + 1) + "</div>" +
            "<h3>" + esc(m.model) + "</h3>" +
            '<p class="quiz-meta">' + esc(m.platform) + " · " + esc(m.best_use || "") + "</p>" +
            '<p class="quiz-cost">' + cost + "</p>" +
            '<ul class="quiz-why">' + whys + "</ul>" +
            '<div class="btn-row"><a class="btn btn-sm" href="workshop.html?model=' +
            encodeURIComponent(m.model) + '">Use in workshop →</a></div>' +
            "</article>";
        }).join("");

        results.innerHTML =
          '<h2 id="quiz-results-h" tabindex="-1">Your top 3</h2>' +
          '<p class="section-lede">Ranked from <code>models.json</code>, update the data, not the article. Costs are third-party estimates; verify live.</p>' +
          '<div class="quiz-grid">' + html + "</div>";
        document.getElementById("quiz-results-h").focus();
      })
      .catch(function () {
        results.innerHTML = '<div class="empty-state"><p>Could not load models.json.</p></div>';
      });
  });
})();
