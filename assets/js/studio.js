/* Studio — "Plan my AI film": the interactive AI-film studio simulator.
   Concept in (title, logline, genre/mood, runtime, draft/festival tier) ->
   a deterministic production packet out: shot list with per-shot prompts
   built from the 47-template prompt library, per-shot model picks from
   models.json with real cost math, a budget table with 5x/20x envelopes,
   a shooting schedule, markdown export, and print.

   All data from site/models.json + site/prompt-templates.json (copied into
   site/ at build time). The pure engine below is exported for node unit
   tests (scripts/studio.test.js); the browser UI only runs when `document`
   exists. */
(function () {
  "use strict";

  var USD_PER_CREDIT = 0.0392; /* models.json cost_basis, Oct 2026 — verify live */
  var TOK = /\[([^\[\]]+)\]/g; /* [PLACEHOLDER] or [PLACEHOLDER: default] */

  /* ---- deterministic RNG ------------------------------------------------ */
  function fnv1a(str) {
    var h = 0x811c9dc5;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h >>> 0;
  }

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function seededShuffle(arr, rng) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* ---- cost parsing (same convention as optimizer.js) -------------------- */
  /* "720p ~22/5s" -> 4.4 credits/sec (first N/Ms pattern). Null = unverified. */
  function costPerSec(m) {
    var s = m.est_cost_credits || "";
    var mt = s.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+)\s*s/);
    if (!mt) return null;
    return parseFloat(mt[1]) / parseFloat(mt[2]);
  }

  /* "0.12 / image" -> 0.12 credits/image. Null = unverified. */
  function costPerImage(m) {
    var s = m.est_cost_credits || "";
    var mt = s.match(/~?(\d+(?:\.\d+)?)\s*\/\s*image/);
    if (!mt) return null;
    return parseFloat(mt[1]);
  }

  function normName(s) {
    return String(s || "").replace(/\([^)]*\)/g, " ")
      .replace(/\s+/g, " ").trim().toLowerCase().replace(/\s*\/\s*/g, "/");
  }

  /* Resolve a template's model string to a models.json record. Exact
     normalized match first, then longest-prefix (covers "Veo 3.1
     (ingredients)", "Seedance 2.0 multi-shot", "Kling 3.0 image-to-video",
     and the "Veo 3.1)" typo in t15). Null when nothing resolves. */
  function resolveModel(byName, n) {
    if (!n) return null;
    if (byName[n]) return byName[n];
    var best = null, bestLen = 0;
    Object.keys(byName).forEach(function (k) {
      if ((n.indexOf(k) === 0 || k.indexOf(n) === 0) && k.length > bestLen) {
        best = byName[k]; bestLen = k.length;
      }
    });
    return best;
  }

  function hay(m) {
    return ((m.best_use || "") + " " + (m.strength || "") + " " + (m.weakness || "")).toLowerCase();
  }

  function isQualityFlagged(m) {
    return /cinematic|hero|narrative|realism|controlled|premium/.test(hay(m));
  }

  /* ---- genre/mood map ----------------------------------------------------
     tracks: which template tracks the genre may draw from.
     env/light/style: the generic production defaults used to fill template
     placeholders (labeled as defaults in the packet, never invented facts). */
  var GENRES = {
    drama: { label: "Drama — intimate", tracks: ["core", "performance", "photorealistic"],
      env: "a quiet interior at dusk", light: "soft window light, low contrast",
      style: "naturalistic and restrained", estab: ["t2", "p1"], payoff: ["t3", "f1", "p1"] },
    horror: { label: "Horror — dread", tracks: ["core", "photorealistic"],
      env: "a darkened house at night", light: "hard practicals, deep shadows",
      style: "dread-filled and minimal", estab: ["t6", "p5"], payoff: ["t6", "p5"] },
    scifi: { label: "Sci-fi — wonder", tracks: ["core", "photorealistic"],
      env: "a vast alien structure", light: "volumetric glow, cool palette",
      style: "awe and scale", estab: ["t1", "t12", "p8", "p6"], payoff: ["t12", "p6"] },
    action: { label: "Action — adrenaline", tracks: ["core", "animated"],
      env: "a city street at night", light: "neon, high contrast",
      style: "kinetic and punchy", estab: ["t1", "t5"], payoff: ["t5", "a1"] },
    comedy: { label: "Comedy — warmth", tracks: ["core", "animated"],
      env: "a sunlit apartment", light: "bright and soft",
      style: "playful and warm", estab: ["a4", "t7"], payoff: ["a5", "a4"] },
    animation: { label: "Animation — whimsy", tracks: ["animated"],
      env: "a handcrafted miniature world", light: "storybook glow",
      style: "animated-feature warmth", estab: ["a2"], payoff: ["a3", "a6"] },
    commercial: { label: "Commercial — product", tracks: ["core", "photorealistic"],
      env: "a clean studio set", light: "crisp product lighting",
      style: "premium commercial polish", estab: ["t4", "t14"], payoff: ["t4", "t10", "p4"] },
    documentary: { label: "Documentary — truthful", tracks: ["photorealistic", "core"],
      env: "real streets, available light", light: "natural available light",
      style: "observational and honest", estab: ["p2", "t9"], payoff: ["p2", "t3"] }
  };

  var RUNTIMES = { 30: "30 seconds", 120: "2 minutes", 300: "5 minutes", 600: "10 minutes" };

  /* Tier assumptions — stated in the packet, not hidden. */
  var TIERS = {
    draft: { label: "Draft", secsPerShot: 6, takes: 3, shotsPerDay: 40, stillsPerShot: 1 },
    festival: { label: "Festival", secsPerShot: 4, takes: 6, shotsPerDay: 12, stillsPerShot: 2 }
  };

  function shotCountFor(runtimeSec, tier) {
    return Math.max(2, Math.ceil(runtimeSec / TIERS[tier].secsPerShot));
  }

  function pickFrom(list, pred) {
    for (var i = 0; i < list.length; i++) if (pred(list[i])) return list[i];
    return null;
  }

  /* Choose N templates deterministically: a genre-appropriate opener,
     a payoff closer, and cycled development beats between them. */
  function chooseTemplates(pool, genre, n, rng) {
    var shuffled = seededShuffle(pool, rng);
    var opening = pickFrom(shuffled, function (t) {
      return genre.estab.indexOf(t.id) !== -1 ||
        /establishing|drone|aerial|reveal|landscape/i.test(t.title);
    }) || shuffled[0];
    var rest = shuffled.filter(function (t) { return t.id !== opening.id; });
    var closing = pickFrom(rest, function (t) {
      return genre.payoff.indexOf(t.id) !== -1 ||
        /close-up|match-cut|transition|macro|orbit/i.test(t.title);
    }) || rest[rest.length - 1] || opening;
    var middle = rest.filter(function (t) { return t.id !== closing.id; });
    if (!middle.length) middle = [opening];
    var picks = [opening];
    for (var i = 1; i < n - 1; i++) picks.push(middle[(i - 1) % middle.length]);
    if (n > 1) picks.push(closing);
    return picks;
  }

  function fillPrompt(tmpl, genre, tier) {
    var fills = {
      SUBJECT: "the protagonist",
      "SUBJECT A": "the lead",
      "SUBJECT B": "the co-lead",
      ENV: genre.env,
      LIGHT: genre.light,
      STYLE: genre.style + ", " + (tier === "draft"
        ? "draft pass — loose, fast, coverage first"
        : "festival grade — color-locked, cinematic")
    };
    var unfilled = [];
    var text = String(tmpl.prompt).replace(TOK, function (tok, inner) {
      var name = inner.split(":")[0].trim().toUpperCase();
      if (fills[name]) return fills[name];
      /* [LINE] and [AUDIO ...] are intentionally left for the filmmaker. */
      if (name === "LINE" || name.indexOf("AUDIO") === 0) {
        if (unfilled.indexOf(tok) === -1) unfilled.push(tok);
        return tok;
      }
      if (unfilled.indexOf(tok) === -1) unfilled.push(tok);
      return tok;
    });
    return { text: text, unfilled: unfilled };
  }

  /* Per-shot model pick: from the template's own suggested models when they
     resolve to priced video models in models.json; otherwise a tier-rule
     fallback from the global pool (flagged, never silent). */
  function pickModel(template, byName, globalPool, tier) {
    var names = (template.models || []).map(normName).filter(function (n) { return n; });
    var resolved = [];
    var seen = {};
    names.forEach(function (n) {
      var m = resolveModel(byName, n);
      if (m && !seen[m.model]) { seen[m.model] = 1; resolved.push(m); }
    });
    var priced = resolved.filter(function (m) { return costPerSec(m) !== null; });
    var unpricedNames = resolved.filter(function (m) { return costPerSec(m) === null; })
      .map(function (m) { return m.model; });
    var pick = null, fallback = false;
    if (priced.length) {
      if (tier === "draft") {
        pick = priced.slice().sort(function (a, b) { return costPerSec(a) - costPerSec(b); })[0];
      } else {
        var flagged = priced.filter(isQualityFlagged);
        pick = flagged.length ? flagged[0]
          : priced.slice().sort(function (a, b) { return costPerSec(b) - costPerSec(a); })[0];
      }
    } else {
      fallback = true;
      var gp = globalPool.filter(function (x) { return x.cps !== null; });
      if (tier === "draft") {
        pick = gp.slice().sort(function (a, b) { return a.cps - b.cps; })[0] || null;
      } else {
        var gf = gp.filter(function (x) { return isQualityFlagged(x.m); });
        pick = gf.length ? gf[0]
          : (gp.slice().sort(function (a, b) { return b.cps - a.cps; })[0] || null);
      }
      pick = pick ? pick.m : null;
    }
    return { model: pick, fallback: fallback, unpricedNames: unpricedNames };
  }

  function whyLine(m) {
    var bits = [];
    if (m.best_use) bits.push("Best use: " + m.best_use);
    if (m.strength) bits.push("Strength: " + m.strength);
    return bits.join(" ");
  }

  function fmtUSD(n) {
    if (n >= 1000) return "$" + Math.round(n).toLocaleString("en-US");
    if (n >= 10) return "$" + n.toFixed(0);
    return "$" + n.toFixed(2);
  }

  function r2(n) { return Math.round(n * 100) / 100; }

  /* ---- the plan ---------------------------------------------------------- */
  function buildPlan(data, input) {
    var genre = GENRES[input.genre];
    if (!genre) throw new Error("unknown genre: " + input.genre);
    var tier = TIERS[input.tier];
    if (!tier) throw new Error("unknown tier: " + input.tier);
    var runtimeSec = input.runtimeSec;
    if (!RUNTIMES[runtimeSec]) throw new Error("unknown runtime: " + runtimeSec);

    var models = (data.models || []).filter(function (m) {
      return m.type === "video" && m.status !== "discontinued";
    });
    var imageModels = (data.models || []).filter(function (m) {
      return m.type === "image" && m.status !== "discontinued";
    });
    var byName = {};
    models.forEach(function (m) { byName[normName(m.model)] = m; });
    var globalPool = models.map(function (m) { return { m: m, cps: costPerSec(m) }; });

    var n = shotCountFor(runtimeSec, input.tier);
    var pool = (data.templates || []).filter(function (t) {
      return genre.tracks.indexOf(t.track) !== -1;
    });
    if (!pool.length) throw new Error("no templates for genre tracks");

    var seed = fnv1a([input.title, input.logline, input.genre, runtimeSec, input.tier].join("|"));
    var rng = mulberry32(seed);
    var picks = chooseTemplates(pool, genre, n, rng);
    var shotSec = tier.secsPerShot;

    var shots = picks.map(function (tmpl, i) {
      var act = n === 2 ? (i === 0 ? "Setup" : "Payoff")
        : (i === 0 ? "Setup" : (i === n - 1 ? "Payoff" : "Development"));
      var filled = fillPrompt(tmpl, genre, input.tier);
      var pm = pickModel(tmpl, byName, globalPool, input.tier);
      return {
        n: i + 1, act: act, templateId: tmpl.id, templateTitle: tmpl.title,
        track: tmpl.track, duration: shotSec,
        anatomy: tmpl.anatomy ||
          "No template-specific anatomy note — apply the nine-layer anatomy from the anatomy chapter.",
        use: tmpl.use || "",
        prompt: filled.text, unfilled: filled.unfilled,
        model: pm.model ? pm.model.model : null,
        platform: pm.model ? pm.model.platform : null,
        cps: pm.model ? costPerSec(pm.model) : null,
        modelFallback: pm.fallback,
        modelUnpriced: pm.unpricedNames,
        modelWhy: pm.model ? whyLine(pm.model) : "No priced video model resolved — verify live."
      };
    });

    /* Model picks (unique, with why + rate). */
    var pickMap = {};
    shots.forEach(function (s) {
      if (!s.model || pickMap[s.model]) return;
      pickMap[s.model] = {
        model: s.model, platform: s.platform, cps: s.cps,
        shots: shots.filter(function (x) { return x.model === s.model; }).length,
        why: s.modelWhy,
        verifyLive: s.cps === null,
        lastVerified: (byName[normName(s.model)] || {}).last_verified || null
      };
    });
    var modelPicks = Object.keys(pickMap).map(function (k) { return pickMap[k]; });

    /* Budget. */
    var stillCandidates = imageModels.map(function (m) {
      return { m: m, cpi: costPerImage(m) };
    }).filter(function (x) { return x.cpi !== null; })
      .sort(function (a, b) { return a.cpi - b.cpi; });
    var stillModel = stillCandidates.length ? stillCandidates[0].m : null;
    var stillRate = stillCandidates.length ? stillCandidates[0].cpi : null;
    var stillCount = n * tier.stillsPerShot;
    var lines = [];
    if (stillModel) {
      var stillCredits = stillCount * stillRate;
      lines.push({
        item: "Keyframe stills (" + tier.stillsPerShot + " plate" +
          (tier.stillsPerShot === 1 ? "" : "s") + " per shot, " + stillModel.model + ")",
        math: stillCount + " × " + stillRate + " credits/image",
        credits: stillCredits, usd: stillCredits * USD_PER_CREDIT, verifyLive: false
      });
    } else {
      lines.push({
        item: "Keyframe stills (" + stillCount + " plates)", math: "no published image rate",
        credits: 0, usd: 0, verifyLive: true
      });
    }
    var byModel = {};
    shots.forEach(function (s) {
      if (s.cps === null) return;
      byModel[s.model] = byModel[s.model] || { count: 0, cps: s.cps, platform: s.platform };
      byModel[s.model].count++;
    });
    Object.keys(byModel).sort().forEach(function (name) {
      var g = byModel[name];
      var gens = g.count * tier.takes;
      var credits = gens * g.cps * shotSec;
      lines.push({
        item: "Generation — " + name + " (" + g.count + " shots × " + tier.takes + " takes)",
        math: g.count + " × " + tier.takes + " takes × " + shotSec + "s × " +
          g.cps.toFixed(2) + " credits/s",
        credits: credits, usd: credits * USD_PER_CREDIT, verifyLive: false
      });
    });
    var unpricedUsed = [];
    shots.forEach(function (s) {
      (s.modelUnpriced || []).forEach(function (nm) {
        if (unpricedUsed.indexOf(nm) === -1) unpricedUsed.push(nm);
      });
    });
    shots.forEach(function (s) {
      if (s.cps === null && unpricedUsed.indexOf(s.model) === -1 && s.model) {
        unpricedUsed.push(s.model);
      }
    });
    lines.push({
      item: "Post — assembly, audio, grade",
      math: "human time + software you already own; not modeled",
      credits: 0, usd: 0, verifyLive: false
    });

    var clean = r2(lines.reduce(function (a, l) { return a + l.usd; }, 0));
    var budget = {
      lines: lines, clean: clean,
      five: r2(clean * 5), twenty: r2(clean * 20),
      takes: tier.takes, usdPerCredit: USD_PER_CREDIT,
      verifyLive: unpricedUsed
    };

    /* Schedule. */
    var runtimeMin = runtimeSec / 60;
    var phases = [
      { phase: "Keyframe stills / I2V plates",
        days: Math.max(1, Math.ceil(stillCount / 60)),
        basis: stillCount + " plates ÷ 60/day" },
      { phase: "Generation",
        days: Math.max(1, Math.ceil(n / tier.shotsPerDay)),
        basis: n + " shots ÷ " + tier.shotsPerDay + "/day (" + tier.label.toLowerCase() + " pace)" },
      { phase: "Assembly / edit",
        days: Math.max(1, Math.ceil(runtimeMin)),
        basis: "1 day per finished minute" },
      { phase: "Audio — voice, foley, music",
        days: Math.max(1, Math.ceil(runtimeSec / 120)),
        basis: "1 day per 2 finished minutes" },
      { phase: "Grade / finish",
        days: Math.max(1, Math.ceil(runtimeSec / 120)),
        basis: "1 day per 2 finished minutes" }
    ];
    var totalDays = phases.reduce(function (a, p) { return a + p.days; }, 0);

    return {
      input: {
        title: input.title, logline: input.logline, genre: input.genre,
        genreLabel: genre.label, runtimeSec: runtimeSec,
        runtimeLabel: RUNTIMES[runtimeSec], tier: input.tier, tierLabel: tier.label
      },
      seed: seed.toString(16),
      shotCount: n, shotSec: shotSec,
      tierSpec: { secsPerShot: tier.secsPerShot, takes: tier.takes,
                  shotsPerDay: tier.shotsPerDay, stillsPerShot: tier.stillsPerShot },
      shots: shots,
      modelPicks: modelPicks,
      budget: budget,
      schedule: { phases: phases, totalDays: totalDays },
      dataMeta: {
        modelsObserved: (data.modelsObserved || null),
        templateCount: (data.templates || []).length,
        modelCount: models.length
      }
    };
  }

  /* ---- markdown export --------------------------------------------------- */
  function planToMarkdown(plan) {
    var L = [];
    var inp = plan.input;
    L.push("# " + inp.title + " — AI-film production packet");
    L.push("");
    L.push("_Logline:_ " + inp.logline);
    L.push("");
    L.push("Concept: " + inp.genreLabel + " · " + inp.runtimeLabel + " · " +
      inp.tierLabel + " tier · " + plan.shotCount + " shots · seed `" + plan.seed + "`");
    L.push("");
    L.push("Generated by the Studio (AI Film Master Guide) from `api/v1/models.json` " +
      "(" + plan.dataMeta.modelCount + " video models) and `api/v1/prompt-templates.json` " +
      "(" + plan.dataMeta.templateCount + " templates). Rates are third-party " +
      "estimates at $0.0392/credit — verify live before spending.");
    L.push("");
    L.push("Tier assumptions (" + inp.tierLabel.toLowerCase() + "): 1 shot per " +
      plan.tierSpec.secsPerShot + "s · " + plan.tierSpec.takes + " takes per keeper · " +
      plan.tierSpec.shotsPerDay + " shots/day · " + plan.tierSpec.stillsPerShot +
      " keyframe still(s) per shot.");
    L.push("");
    L.push("## Shot list");
    L.push("");
    plan.shots.forEach(function (s) {
      L.push("### Shot " + s.n + " — " + s.act + " · " + s.templateTitle +
        " (" + s.templateId + ") · " + s.duration + "s");
      L.push("");
      L.push("Model: " + (s.model || "unpriced — verify live") +
        (s.platform ? " (" + s.platform + ")" : "") +
        (s.cps !== null ? " — " + s.cps.toFixed(2) + " credits/s" : "") +
        (s.modelFallback ? " [fallback pick: template's models unresolved]" : ""));
      L.push("Anatomy: " + s.anatomy + " (" + s.track + " track)");
      L.push("");
      L.push("```");
      L.push(s.prompt);
      L.push("```");
      if (s.unfilled.length) {
        L.push("");
        L.push("Fill before generating: " + s.unfilled.join(", "));
      }
      L.push("");
    });
    L.push("## Model picks");
    L.push("");
    plan.modelPicks.forEach(function (p) {
      L.push("- **" + p.model + "** (" + p.platform + ") — " + p.shots + " shot" +
        (p.shots === 1 ? "" : "s") +
        (p.cps !== null ? ", " + p.cps.toFixed(2) + " credits/s" : ", rate unpublished — verify live") +
        (p.lastVerified ? ", last verified " + p.lastVerified : "") + ": " + p.why);
    });
    L.push("");
    L.push("## Budget");
    L.push("");
    L.push("| Line item | Math | Cost |");
    L.push("|---|---|---|");
    plan.budget.lines.forEach(function (l) {
      L.push("| " + l.item + " | " + l.math + " | " +
        (l.verifyLive ? "verify live" : fmtUSD(l.usd)) + " |");
    });
    L.push("");
    L.push("**Clean run: " + fmtUSD(plan.budget.clean) + "** · " +
      "5× envelope (realistic): " + fmtUSD(plan.budget.five) + " · " +
      "20× envelope (worst case): " + fmtUSD(plan.budget.twenty) + "");
    L.push("");
    L.push("Envelopes from the long-form pipelines chapter: rejections, re-grades, and " +
      "consistency fixes multiply the clean cost 5–20×. Budget the envelope, not the clean run.");
    if (plan.budget.verifyLive.length) {
      L.push("");
      L.push("Verify live (no published rate): " + plan.budget.verifyLive.join(", "));
    }
    L.push("");
    L.push("## Schedule");
    L.push("");
    L.push("| Phase | Days | Basis |");
    L.push("|---|---|---|");
    plan.schedule.phases.forEach(function (p) {
      L.push("| " + p.phase + " | " + p.days + " | " + p.basis + " |");
    });
    L.push("");
    L.push("**Total: " + plan.schedule.totalDays + " shooting days.**");
    L.push("");
    return L.join("\n");
  }

  var StudioEngine = {
    USD_PER_CREDIT: USD_PER_CREDIT,
    GENRES: GENRES, RUNTIMES: RUNTIMES, TIERS: TIERS,
    fnv1a: fnv1a, mulberry32: mulberry32, seededShuffle: seededShuffle,
    costPerSec: costPerSec, costPerImage: costPerImage, normName: normName,
    resolveModel: resolveModel,
    shotCountFor: shotCountFor, chooseTemplates: chooseTemplates,
    fillPrompt: fillPrompt, pickModel: pickModel,
    buildPlan: buildPlan, planToMarkdown: planToMarkdown, fmtUSD: fmtUSD
  };

  /* node unit tests (scripts/studio.test.js) */
  if (typeof module !== "undefined" && module.exports) {
    module.exports = StudioEngine;
    return;
  }

  /* ---- browser UI --------------------------------------------------------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var SAVE_KEY = "afg-studio-plans";

  function els() {
    return {
      title: document.getElementById("st-title"),
      logline: document.getElementById("st-logline"),
      genre: document.getElementById("st-genre"),
      results: document.getElementById("st-results"),
      error: document.getElementById("st-error"),
      actions: document.getElementById("st-actions"),
      copy: document.getElementById("st-copy"),
      print: document.getElementById("st-print"),
      save: document.getElementById("st-save"),
      planName: document.getElementById("st-plan-name"),
      saved: document.getElementById("st-saved"),
      savedEmpty: document.getElementById("st-saved-empty"),
      msg: document.getElementById("st-msg")
    };
  }

  var DATA = null, CURRENT = null;

  function runtimeSec() {
    var v = document.querySelector('input[name="st-runtime"]:checked');
    return v ? parseInt(v.value, 10) : 120;
  }

  function tier() {
    var v = document.querySelector('input[name="st-tier"]:checked');
    return v ? v.value : "draft";
  }

  function fail(msg) {
    var e = els();
    e.error.hidden = false;
    e.error.textContent = msg;
    e.error.focus();
  }

  function shotCard(s) {
    var unfilled = s.unfilled.length
      ? '<p class="st-note"><strong>Fill before generating:</strong> ' +
        s.unfilled.map(esc).join(", ") + "</p>"
      : "";
    var fallback = s.modelFallback
      ? ' <span class="st-badge">fallback pick — template\u2019s models unresolved in models.json</span>'
      : "";
    return '<article class="card st-shot" aria-label="Shot ' + s.n + '">' +
      "<h4>Shot " + s.n + " — " + esc(s.act) + " · " + esc(s.templateTitle) +
      ' <span class="st-tid">(' + esc(s.templateId) + ")</span></h4>" +
      '<p class="st-meta">' + s.duration + "s · " +
      "<strong>" + esc(s.model || "unpriced — verify live") + "</strong>" +
      (s.platform ? " · " + esc(s.platform) : "") +
      (s.cps !== null ? " · " + s.cps.toFixed(2) + " credits/s" : "") + fallback + "</p>" +
      '<p class="st-anatomy">Anatomy: ' + esc(s.anatomy) +
      ' <span class="st-track">(' + esc(s.track) + " track)</span></p>" +
      '<pre class="st-prompt" tabindex="0">' + esc(s.prompt) + "</pre>" +
      unfilled +
      '<p><a class="btn btn-sm btn-ghost" href="workshop.html?template=' +
      encodeURIComponent(s.templateId) + '">Refine in the workshop</a></p>' +
      "</article>";
  }

  function render(plan) {
    var e = els();
    var inp = plan.input;
    var shotsHtml = plan.shots.map(shotCard).join("");

    var picksRows = plan.modelPicks.map(function (p) {
      return "<tr><td><strong>" + esc(p.model) + "</strong><br><span class=\"quiz-cost-sub\">" +
        esc(p.platform) + (p.lastVerified ? " · verified " + esc(p.lastVerified) : "") + "</span></td>" +
        "<td>" + p.shots + "</td>" +
        "<td>" + (p.cps !== null ? p.cps.toFixed(2) + "/s" : '<span class="st-badge">verify live</span>') + "</td>" +
        "<td>" + esc(p.why.length > 180 ? p.why.slice(0, 180) + "…" : p.why) + "</td></tr>";
    }).join("");

    var budgetRows = plan.budget.lines.map(function (l) {
      return "<tr><td>" + esc(l.item) + "</td><td class=\"st-math\">" + esc(l.math) +
        "</td><td><strong>" + (l.verifyLive ? "verify live" : fmtUSD(l.usd)) +
        "</strong></td></tr>";
    }).join("");

    var schedRows = plan.schedule.phases.map(function (p) {
      return "<tr><td>" + esc(p.phase) + "</td><td>" + p.days + "</td><td class=\"st-math\">" +
        esc(p.basis) + "</td></tr>";
    }).join("");

    e.results.innerHTML =
      '<section aria-labelledby="st-packet-h">' +
      '<p class="st-kicker">Production packet · seed <code>' + esc(plan.seed) + "</code> · " +
      "deterministic: same concept, same packet</p>" +
      '<h2 id="st-packet-h" tabindex="-1">' + esc(inp.title) + "</h2>" +
      '<p class="lede">' + esc(inp.logline) + "</p>" +
      '<p class="calc-note">' + esc(inp.genreLabel) + " · " + esc(inp.runtimeLabel) + " · " +
      esc(inp.tierLabel) + " tier · " + plan.shotCount + " shots · " + plan.shotSec +
      "s per shot · " + plan.tierSpec.takes + " takes per keeper. " +
      "Computed live from <code>models.json</code> (" + plan.dataMeta.modelCount +
      " video models) and <code>prompt-templates.json</code> (" +
      plan.dataMeta.templateCount + " templates) — update the data, not this page.</p>" +
      "<h3>Shot list</h3>" + shotsHtml +
      "<h3>Model picks</h3>" +
      '<div class="table-scroll"><table><caption>Why each model, with its real rate.</caption>' +
      "<thead><tr><th scope=\"col\">Model</th><th scope=\"col\">Shots</th>" +
      "<th scope=\"col\">Rate</th><th scope=\"col\">Why</th></tr></thead><tbody>" +
      picksRows + "</tbody></table></div>" +
      "<h3>Budget</h3>" +
      '<div class="table-scroll"><table><caption>Every line shows its math.</caption>' +
      "<thead><tr><th scope=\"col\">Line item</th><th scope=\"col\">Math</th>" +
      "<th scope=\"col\">Cost</th></tr></thead><tbody>" + budgetRows + "</tbody></table></div>" +
      '<div class="calc-grid" style="margin-top:var(--space-5);"><div class="card calc-results">' +
      '<div class="calc-stat highlight"><div class="calc-value">' + fmtUSD(plan.budget.clean) +
      '</div><div class="calc-label">Clean run</div></div>' +
      '<div class="calc-stat highlight"><div class="calc-value">' + fmtUSD(plan.budget.five) +
      '</div><div class="calc-label">5× envelope (realistic)</div></div>' +
      '<div class="calc-stat highlight"><div class="calc-value">' + fmtUSD(plan.budget.twenty) +
      '</div><div class="calc-label">20× envelope (worst case)</div></div>' +
      '<p class="calc-note">Envelopes from the long-form pipelines chapter: rejections, re-grades, ' +
      "and consistency fixes multiply the clean cost 5–20×. Budget the envelope, not the clean run. " +
      "All rates are third-party estimates (Oct 2026) at $0.0392/credit — verify live before spending.</p>" +
      (plan.budget.verifyLive.length
        ? '<p class="calc-note"><strong>Verify live</strong> (no published rate): ' +
          plan.budget.verifyLive.map(esc).join(", ") + ".</p>" : "") +
      "</div></div>" +
      "<h3>Schedule</h3>" +
      '<div class="table-scroll"><table><caption>' + plan.schedule.totalDays +
      " shooting days, ordered phases.</caption>" +
      "<thead><tr><th scope=\"col\">Phase</th><th scope=\"col\">Days</th>" +
      "<th scope=\"col\">Basis</th></tr></thead><tbody>" + schedRows + "</tbody></table></div>" +
      '<p class="calc-note"><strong>Total: ' + plan.schedule.totalDays +
      " shooting days.</strong> Stills before generation, generation before assembly — " +
      "the long-form chapter's assets-before-shots rule.</p>" +
      "</section>";
    e.actions.hidden = false;
    document.getElementById("st-packet-h").focus({ preventScroll: false });
    var smooth = typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    e.results.scrollIntoView({ block: "start", behavior: smooth });
  }

  function getPlans() {
    try { return JSON.parse(localStorage.getItem(SAVE_KEY) || "[]"); }
    catch (e) { return []; }
  }

  function renderSaved() {
    var e = els();
    var plans = getPlans();
    e.savedEmpty.hidden = plans.length > 0;
    e.saved.innerHTML = plans.map(function (p, i) {
      return '<li class="log-entry"><span class="log-label">' + esc(p.name) + "</span> " +
        '<span class="log-meta">' + esc(p.plan.input.genreLabel) + " · " +
        esc(p.plan.input.runtimeLabel) + " · " + esc(p.plan.input.tierLabel) + " · " +
        p.plan.shotCount + " shots</span><br>" +
        '<button type="button" class="btn btn-sm btn-ghost" data-load="' + i + '">Load</button> ' +
        '<button type="button" class="btn btn-sm btn-ghost" data-del="' + i + '">Delete</button></li>';
    }).join("");
    e.saved.querySelectorAll("[data-load]").forEach(function (b) {
      b.addEventListener("click", function () {
        var p = getPlans()[parseInt(b.getAttribute("data-load"), 10)];
        if (!p) return;
        var f = els();
        f.title.value = p.plan.input.title;
        f.logline.value = p.plan.input.logline;
        f.genre.value = p.plan.input.genre;
        document.querySelector('input[name="st-runtime"][value="' + p.plan.input.runtimeSec + '"]').checked = true;
        document.querySelector('input[name="st-tier"][value="' + p.plan.input.tier + '"]').checked = true;
        CURRENT = p.plan;
        render(CURRENT);
      });
    });
    e.saved.querySelectorAll("[data-del]").forEach(function (b) {
      b.addEventListener("click", function () {
        var plans = getPlans();
        plans.splice(parseInt(b.getAttribute("data-del"), 10), 1);
        try { localStorage.setItem(SAVE_KEY, JSON.stringify(plans)); } catch (err) { /* ignore */ }
        renderSaved();
      });
    });
  }

  function announce(msg) {
    var e = els();
    e.msg.hidden = false;
    e.msg.textContent = msg;
  }

  function init() {
    var e = els();
    if (!e.title) return;

    /* Genre options from the engine's own map — one source of truth. */
    Object.keys(GENRES).forEach(function (k) {
      var o = document.createElement("option");
      o.value = k;
      o.textContent = GENRES[k].label;
      e.genre.appendChild(o);
    });

    Promise.all([
      fetch("models.json").then(function (r) { if (!r.ok) throw new Error("models"); return r.json(); }),
      fetch("prompt-templates.json").then(function (r) { if (!r.ok) throw new Error("templates"); return r.json(); })
    ]).then(function (parts) {
      DATA = {
        models: parts[0].models,
        templates: parts[1].templates,
        modelsObserved: parts[0].observed || null
      };
      document.getElementById("st-generate").disabled = false;
      announce("Data loaded: " + DATA.models.length + " models, " +
        DATA.templates.length + " templates. Ready to plan.");
    }).catch(function () {
      fail("Could not load models.json / prompt-templates.json. The Studio needs the built site data.");
    });

    document.getElementById("st-generate").addEventListener("click", function () {
      e.error.hidden = true;
      var title = e.title.value.trim();
      var logline = e.logline.value.trim();
      if (!title) { fail("Give the film a title first."); e.title.focus(); return; }
      if (!logline) { fail("Write a one-line logline first."); e.logline.focus(); return; }
      if (!DATA) { fail("Data is still loading — one moment."); return; }
      try {
        CURRENT = buildPlan(DATA, {
          title: title, logline: logline, genre: e.genre.value,
          runtimeSec: runtimeSec(), tier: tier()
        });
        render(CURRENT);
      } catch (err) {
        fail("Could not build the plan: " + err.message);
      }
    });

    e.copy.addEventListener("click", function () {
      if (!CURRENT) return;
      var md = planToMarkdown(CURRENT);
      function done() { announce("Production packet copied as markdown."); }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(md).then(done, function () { fallbackCopy(md, done); });
      } else { fallbackCopy(md, done); }
    });

    function fallbackCopy(text, done) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "absolute"; ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); done(); }
      catch (err) { fail("Copy failed — select the plan text manually and print to PDF instead."); }
      document.body.removeChild(ta);
    }

    e.print.addEventListener("click", function () { window.print(); });

    e.save.addEventListener("click", function () {
      if (!CURRENT) return;
      var name = e.planName.value.trim() || CURRENT.input.title;
      var plans = getPlans();
      plans.push({ name: name, savedAt: new Date().toISOString(), plan: CURRENT });
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(plans));
        announce("Plan saved as \u201c" + name + "\u201d.");
        e.planName.value = "";
        renderSaved();
      } catch (err) { fail("Could not save — browser storage is unavailable."); }
    });

    renderSaved();
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else { init(); }
  }
})();
