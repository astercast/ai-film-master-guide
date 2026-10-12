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

  /* ---- Studio 2.0: serialized format presets --------------------------------
     Mirrors the episode planner's FORMAT_PRESETS (assets/js/episode-planner.js):
     same bands, same seconds-per-beat. The beat counts, hook styles, and the
     voice-budget rule come from craft/episodic-shortform.md (the mini-drama
     pipeline). Keep the two files' bands in sync — scripts/studio.test.js
     asserts it. */
  var SERIES_FORMATS = {
    minidrama: { label: "Mini-drama", band: [60, 150], spb: 15, beats: 4,
      hookStyle: "the gut-punch emotion as a visual in the first 3 seconds",
      arcStyle: "one emotion per episode; gut-punch → reversal → cliffhanger (never the resolution)",
      voiceRule: "Lock voice/dialogue at ≈beats × 15s ±10% BEFORE any frame is generated (the golden rule)." },
    pov: { label: "POV micro-series", band: [30, 90], spb: 12, beats: 4,
      hookStyle: "your hands / your POV — immediate second-person stakes in the first 3 seconds",
      arcStyle: "one encounter, one power reversal per episode; the cliffhanger is always social",
      voiceRule: "Lock voice/dialogue at ≈beats × 12s ±10% BEFORE any frame is generated (the golden rule)." },
    daylife: { label: "Day-in-the-life", band: [15, 60], spb: 10, beats: 3,
      hookStyle: "the recurring character in their familiar setting, one small event",
      arcStyle: "one small event per episode; the recurring character IS the cliffhanger",
      voiceRule: "Lock voice/dialogue at ≈beats × 10s ±10% BEFORE any frame is generated (the golden rule)." },
    revenge: { label: "Revenge arc", band: [60, 150], spb: 15, beats: 4,
      hookStyle: "the injustice + the first retaliatory move, inside 3 seconds",
      arcStyle: "betrayal → discovery → the plan → the takedown → the reveal; one justice-ladder rung per episode",
      voiceRule: "Lock voice/dialogue at ≈beats × 15s ±10% BEFORE any frame is generated (the golden rule)." },
    interactive: { label: "Interactive series", band: [60, 150], spb: 15, beats: 4,
      hookStyle: "the decision point as a visual in the first 3 seconds — a choice the viewer can see",
      arcStyle: "one decision per episode: hook → the stakes → the decision beat (poll/comment prompt) → the consequence → freeze before the next choice; viewer comments shape the next episode's block",
      voiceRule: "Lock voice/dialogue at ≈beats × 15s ±10% BEFORE any frame is generated (the golden rule)." }
  };

  /* The series consistency checklist — every item is a rule from the
     episodic-shortform chapter or the episode planner's gates, restated. */
  var SERIES_CHECKLIST = [
    "Bible locked before generation: the prompt DNA block is identical in every episode's shots — never edit mid-series.",
    "Face anchors never re-run: the locked character stills below are generated ONCE and reused across all episodes.",
    "One emotion per episode (the two-emotions rule) — completion rate dies when the episode can't decide.",
    "Voice/dialogue locked at ±10% before any frame (the golden rule); picture is cut TO the locked track, never the reverse.",
    "The cliffhanger is a freeze, never the resolution.",
    "Gate G8: an episode ships only after its lesson is logged — the arc tracker is the series memory."
  ];

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
  /* allowAnyRuntime is internal: buildSeriesPlan passes true so per-episode
     runtimes can live anywhere inside the format's band (60s, 90s, ...).
     The public buildPlan keeps the strict runtime menu. */
  function _buildPlan(data, input, allowAnyRuntime) {
    var genre = GENRES[input.genre];
    if (!genre) throw new Error("unknown genre: " + input.genre);
    var tier = TIERS[input.tier];
    if (!tier) throw new Error("unknown tier: " + input.tier);
    var runtimeSec = input.runtimeSec;
    if (!allowAnyRuntime && !RUNTIMES[runtimeSec]) throw new Error("unknown runtime: " + runtimeSec);
    if (allowAnyRuntime &&
        (!Number.isInteger(runtimeSec) || runtimeSec < 10 || runtimeSec > 3600)) {
      throw new Error("unknown runtime: " + runtimeSec);
    }

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
        runtimeLabel: RUNTIMES[runtimeSec] || (runtimeSec + " seconds"), tier: input.tier, tierLabel: tier.label
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

  function buildPlan(data, input) {
    return _buildPlan(data, input, false);
  }

  /* ---- Studio 2.0: series mode ----------------------------------------------
     Plan a mini-drama season in one pass. Every episode is a full _buildPlan
     (shot list, prompts, model picks, budget, schedule); the series wraps them
     in a bible that enforces consistency: the same locked prompt-DNA block is
     prepended to EVERY shot prompt, and character/location anchor stills are
     generated ONCE (the asset-registry rule: face anchors never re-run).

     input: { seriesTitle, seriesLogline, format, genre, runtimeSec (per ep,
              inside the format band), tier, episodes (3-10),
              cast: [{name, voice, anchor}], locations: [names],
              arcs: [ {n, emotion, beats[], hook, turn, cliff, scenes} ] }
     arcs usually arrive from the episode planner via the Studio bridge; when
     absent the engine builds deterministic skeleton arcs from the format
     preset (labeled as skeletons — the filmmaker writes the real lines). */
  function seriesBible(input) {
    var fmt = SERIES_FORMATS[input.format];
    var genre = GENRES[input.genre];
    var cast = (input.cast || []).filter(function (c) { return c.name || c.anchor; });
    var locations = (input.locations || []).filter(function (l) { return l; });
    var dna = [
      "[SERIES BIBLE — locked, identical in every episode's shots]",
      "Characters: " + (cast.length
        ? cast.map(function (c) { return c.name + " — " + (c.anchor || "no anchor set"); }).join(" | ")
        : "none locked — lock the cast before generating"),
      "Locations: " + (locations.length ? locations.join(" | ") : genre.env),
      "Style: " + genre.style + " · Light: " + genre.light +
        " · Grade: locked at the still stage — match the anchor plates.",
      "Voice: " + fmt.voiceRule
    ];
    var lockedAssets = cast.map(function (c) {
      return { kind: "character", name: c.name, anchor: c.anchor || "", voice: c.voice || "" };
    }).concat(locations.map(function (l) {
      return { kind: "location", name: l, anchor: "", voice: "" };
    }));
    return {
      title: input.seriesTitle, logline: input.seriesLogline,
      format: input.format, formatLabel: fmt.label,
      episodes: input.episodes, runtimeSec: input.runtimeSec,
      genre: input.genre, genreLabel: genre.label, tier: input.tier,
      tierLabel: TIERS[input.tier].label,
      cast: cast, locations: locations,
      dnaLines: dna, lockedAssets: lockedAssets,
      hookStyle: fmt.hookStyle, arcStyle: fmt.arcStyle, voiceRule: fmt.voiceRule,
      checklist: SERIES_CHECKLIST
    };
  }

  function skeletonArc(n, fmt, seriesLogline) {
    var roles = ["Hook — the first 3 seconds",
      "Development — raise the stake of this episode's single emotion",
      "Turn — what changes", "Cliffhanger — freeze, never the resolution"];
    var beats = [];
    for (var i = 0; i < fmt.beats; i++) {
      beats.push("SKELETON beat " + (i + 1) + " (" + roles[Math.min(i, roles.length - 1)] + ")");
    }
    return {
      n: n, skeleton: true,
      emotion: "SKELETON — one emotion for episode " + n,
      stake: "SKELETON — one-line emotional stake (series: " + seriesLogline + ")",
      hook: "SKELETON — hook visual (" + fmt.hookStyle + ")",
      beats: beats,
      turn: "SKELETON — the emotional turn",
      cliff: "SKELETON — the unanswered beat. Never the resolution.",
      scenes: "SKELETON — keyframe scenes (hook / beat / turn / cliffhanger)"
    };
  }

  function buildSeriesPlan(data, input) {
    var fmt = SERIES_FORMATS[input.format];
    if (!fmt) throw new Error("unknown series format: " + input.format);
    if (!GENRES[input.genre]) throw new Error("unknown genre: " + input.genre);
    if (!TIERS[input.tier]) throw new Error("unknown tier: " + input.tier);
    var episodes = parseInt(input.episodes, 10);
    if (!(episodes >= 3 && episodes <= 10)) {
      throw new Error("episode count must be 3–10, got " + input.episodes);
    }
    var runtimeSec = parseInt(input.runtimeSec, 10);
    if (!(runtimeSec >= fmt.band[0] && runtimeSec <= fmt.band[1])) {
      throw new Error("runtime " + runtimeSec + "s is outside the " + fmt.label +
        " band (" + fmt.band[0] + "–" + fmt.band[1] + "s)");
    }
    if (!input.seriesTitle) throw new Error("series needs a title");
    if (!input.seriesLogline) throw new Error("series needs a logline");

    var bible = seriesBible({
      seriesTitle: input.seriesTitle, seriesLogline: input.seriesLogline,
      format: input.format, genre: input.genre, runtimeSec: runtimeSec,
      tier: input.tier, episodes: episodes,
      cast: input.cast || [], locations: input.locations || []
    });
    var dnaBlock = bible.dnaLines.join("\n");
    var shotSec = TIERS[input.tier].secsPerShot;
    var nShotsEp = shotCountFor(runtimeSec, input.tier);

    /* episode arcs: bridge blocks when supplied, else deterministic skeletons */
    var byN = {};
    (input.arcs || []).forEach(function (a) { byN[a.n] = a; });
    var epList = [];
    for (var n = 1; n <= episodes; n++) {
      var arc = byN[n] || skeletonArc(n, fmt, input.seriesLogline);
      var ep = _buildPlan(data, {
        title: input.seriesTitle + " — E" + n,
        logline: input.seriesLogline,
        genre: input.genre, runtimeSec: runtimeSec, tier: input.tier
      }, true);
      ep.episode = n;
      ep.arc = arc;
      ep.voiceBudgetSec = (arc.beats || []).length * fmt.spb;
      ep.shots.forEach(function (s) {
        s.prompt = dnaBlock + "\n\n" + s.prompt;
        s.episode = n;
      });
      epList.push(ep);
    }

    /* ---- series budget: per-episode subtotals + the once-only bible line --
       The locked anchor plates are generated ONCE, not per episode (face
       anchors never re-run). `reuse.avoided` is the stated saving vs. a
       naive per-episode regeneration — shown in the packet, not subtracted. */
    var cheapestImage = null, cheapestCpi = null;
    (data.models || []).filter(function (m) {
      return m.type === "image" && m.status !== "discontinued";
    }).forEach(function (m) {
      var cpi = costPerImage(m);
      if (cpi !== null && (cheapestCpi === null || cpi < cheapestCpi)) {
        cheapestCpi = cpi; cheapestImage = m;
      }
    });
    var assetPlates = bible.lockedAssets.length;
    var bibleStillsCredits = cheapestImage ? assetPlates * cheapestCpi : 0;
    var lines = [];
    if (cheapestImage) {
      lines.push({
        item: "Series bible — locked anchor plates, generated ONCE (" + assetPlates +
          " assets: " + bible.lockedAssets.map(function (a) {
            return a.kind + ":" + (a.name || "unnamed");
          }).join(", ") + ")",
        math: assetPlates + " × " + cheapestCpi + " credits/image (" + cheapestImage.model + ")",
        credits: bibleStillsCredits, usd: r2(bibleStillsCredits * USD_PER_CREDIT),
        verifyLive: false
      });
    } else {
      lines.push({
        item: "Series bible — locked anchor plates (" + assetPlates + " assets)",
        math: "no published image rate", credits: 0, usd: 0, verifyLive: true
      });
    }
    var sumEpCredits = 0;
    epList.forEach(function (ep, i) {
      var epCredits = ep.budget.lines.reduce(function (a, l) { return a + l.credits; }, 0);
      var epUSD = ep.budget.lines.reduce(function (a, l) { return a + l.usd; }, 0);
      sumEpCredits += epCredits;
      lines.push({
        item: "Episode " + (i + 1) + " — " + ep.shotCount + " shots × " + ep.tierSpec.takes +
          " takes (" + ep.budget.verifyLive.length + " model(s) verify-live)",
        math: ep.shotCount + " × " + ep.tierSpec.takes + " takes × " + ep.shotSec + "s + stills",
        credits: r2(epCredits), usd: r2(epUSD), verifyLive: false
      });
    });
    var clean = r2(lines.reduce(function (a, l) { return a + l.usd; }, 0));
    var avoidedCredits = assetPlates * (episodes - 1) * (cheapestCpi || 0);
    var budget = {
      lines: lines, clean: clean,
      five: r2(clean * 5), twenty: r2(clean * 20),
      takes: TIERS[input.tier].takes, usdPerCredit: USD_PER_CREDIT,
      verifyLive: Array.from(new Set(epList.reduce(function (a, ep) {
        return a.concat(ep.budget.verifyLive);
      }, []))),
      episodes: episodes
    };

    /* ---- series schedule: bible plates first, then per-episode pipelines -- */
    var epSchedules = epList.map(function (ep) { return ep.schedule; });
    var phases = [{
      phase: "Series bible — locked anchor stills",
      days: Math.max(1, Math.ceil(assetPlates / 60)),
      basis: assetPlates + " plates ÷ 60/day (generated ONCE for all " + episodes + " episodes)"
    }];
    var merge = {};
    epSchedules.forEach(function (sched, i) {
      sched.phases.forEach(function (p) {
        merge[p.phase] = merge[p.phase] || { phase: p.phase, days: 0, per: [] };
        merge[p.phase].days += p.days;
        merge[p.phase].per.push("Ep " + (i + 1) + ": " + p.days + "d");
      });
    });
    Object.keys(merge).forEach(function (k) {
      phases.push({ phase: merge[k].phase + " — all " + episodes + " episodes",
        days: merge[k].days, basis: merge[k].per.join(" · ") });
    });
    var totalDays = phases.reduce(function (a, p) { return a + p.days; }, 0);

    var seed = fnv1a([input.seriesTitle, input.seriesLogline, input.format,
      input.genre, runtimeSec, input.tier, episodes].join("|")).toString(16);

    return {
      kind: "series",
      bible: bible,
      seed: seed,
      episodes: epList,
      episodeCount: episodes,
      runtimeSec: runtimeSec,
      shotSec: shotSec,
      shotsPerEpisode: nShotsEp,
      totalShots: epList.reduce(function (a, ep) { return a + ep.shotCount; }, 0),
      budget: budget,
      reuse: {
        lockedAssets: assetPlates,
        avoidedCredits: r2(avoidedCredits),
        avoidedUSD: r2(avoidedCredits * USD_PER_CREDIT),
        rule: "Face anchors / location plates generated once, not per episode."
      },
      schedule: { phases: phases, totalDays: totalDays },
      dataMeta: epList[0].dataMeta
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

  /* Series packet: markdown. Self-contained: bible, per-episode arcs + shot
     lists with per-shot prompts, model picks, budget, schedule, checklist. */
  function seriesToMarkdown(plan) {
    var L = [];
    var b = plan.bible;
    L.push("# " + b.title + " — series production packet");
    L.push("");
    L.push("_Logline:_ " + b.logline);
    L.push("");
    L.push(b.formatLabel + " · " + b.episodes + " episodes × " + plan.runtimeSec +
      "s · " + b.genreLabel + " · " + b.tierLabel + " tier · " + plan.totalShots +
      " total shots · series seed `" + plan.seed + "`");
    L.push("");
    L.push("Planned by Studio 2.0 (AI Film Master Guide) from `api/v1/models.json` and " +
      "`api/v1/prompt-templates.json`. Rates are third-party estimates at " +
      "$0.0392/credit — verify live before spending. Deterministic: same concept, same packet.");
    L.push("");
    L.push("## Series bible — locked before generation");
    L.push("");
    L.push("The prompt DNA below is prepended verbatim to EVERY shot prompt in EVERY " +
      "episode. It never changes mid-series — that is the consistency engine.");
    L.push("");
    L.push("```");
    L = L.concat(b.dnaLines);
    L.push("```");
    L.push("");
    L.push("Locked assets (" + b.lockedAssets.length + ", plates generated ONCE):");
    L.push("");
    b.lockedAssets.forEach(function (a) {
      L.push("- " + a.kind + ": **" + (a.name || "unnamed") + "**" +
        (a.anchor ? " — " + a.anchor : "") + (a.voice ? " (voice: " + a.voice + ")" : ""));
    });
    L.push("");
    L.push("Format rules — " + b.formatLabel + ": " + b.arcStyle);
    L.push("Hook style: " + b.hookStyle);
    L.push("Voice rule: " + b.voiceRule);
    L.push("");
    L.push("## Episode arcs");
    L.push("");
    plan.episodes.forEach(function (ep) {
      var a = ep.arc;
      L.push("### Episode " + ep.episode + " — " + ep.shotCount + " shots, ~" +
        ep.voiceBudgetSec + "s voice budget" + (a.skeleton ? " [SKELETON — edit before generating]" : ""));
      L.push("");
      L.push("- Emotion: " + a.emotion);
      L.push("- Stake: " + a.stake);
      L.push("- Hook: " + a.hook);
      a.beats.forEach(function (bt, i) { L.push("- Beat " + (i + 1) + ": " + bt); });
      L.push("- Turn: " + a.turn);
      L.push("- Cliffhanger: " + a.cliff);
      L.push("- Keyframe scenes: " + a.scenes);
      L.push("");
    });
    L.push("## Shot lists — per-shot prompts (with locked DNA)");
    L.push("");
    plan.episodes.forEach(function (ep) {
      L.push("### Episode " + ep.episode);
      L.push("");
      ep.shots.forEach(function (s) {
        L.push("#### Shot E" + ep.episode + "." + s.n + " — " + s.act + " · " +
          s.templateTitle + " (" + s.templateId + ") · " + s.duration + "s");
        L.push("");
        L.push("Model: " + (s.model || "unpriced — verify live") +
          (s.platform ? " (" + s.platform + ")" : "") +
          (s.cps !== null ? " — " + s.cps.toFixed(2) + " credits/s" : ""));
        L.push("");
        L.push("```");
        L.push(s.prompt);
        L.push("```");
        L.push("");
      });
    });
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
      "20× envelope (worst case): " + fmtUSD(plan.budget.twenty));
    L.push("");
    L.push("Saved by the bible: " + plan.reuse.lockedAssets + " locked plates generated once " +
      "instead of per episode — ≈" + r2(plan.reuse.avoidedCredits) + " credits (≈" +
      fmtUSD(plan.reuse.avoidedUSD) + ") not spent. " + plan.reuse.rule);
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
    L.push("## Series consistency checklist");
    L.push("");
    b.checklist.forEach(function (c) { L.push("- [ ] " + c); });
    L.push("");
    return L.join("\n");
  }

  /* Self-contained HTML packet: inline CSS, no external requests — a single
     file the filmmaker can print or hand to a collaborator. */
  function escHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function seriesToHtml(plan) {
    var b = plan.bible;
    var H = [];
    H.push("<!DOCTYPE html>");
    H.push('<html lang="en">');
    H.push("<head>");
    H.push('<meta charset="utf-8">');
    H.push('<meta name="viewport" content="width=device-width, initial-scale=1">');
    H.push("<title>" + escHtml(b.title) + " — series production packet</title>");
    H.push("<style>");
    H.push("body{font-family:Georgia,'Times New Roman',serif;max-width:62rem;margin:0 auto;padding:2rem 1.5rem;color:#1a1a1a;background:#fff;line-height:1.55}");
    H.push("h1{font-size:1.9rem;border-bottom:3px solid #c9a227;padding-bottom:.4rem}");
    H.push("h2{font-size:1.4rem;margin-top:2.2rem;border-bottom:1px solid #ddd;padding-bottom:.3rem}");
    H.push("h3{font-size:1.15rem;margin-top:1.6rem}h4{font-size:1rem}");
    H.push(".lede{font-style:italic;color:#333}.meta{color:#555;font-size:.9rem}");
    H.push("pre{background:#f6f4ec;border:1px solid #ddd;border-radius:6px;padding:.9rem;white-space:pre-wrap;word-break:break-word;font-size:.88rem}");
    H.push("table{border-collapse:collapse;width:100%;font-size:.9rem}");
    H.push("th,td{border:1px solid #ccc;padding:.45rem .6rem;text-align:left;vertical-align:top}");
    H.push("th{background:#f6f4ec}ul.check{list-style:none;padding:0}ul.check li{margin:.4rem 0}");
    H.push(".badge{display:inline-block;border:1px solid #c9a227;color:#7a5c00;border-radius:999px;padding:.05em .7em;font-size:.78rem}");
    H.push(".shot{break-inside:avoid;border:1px solid #e2e2e2;border-radius:8px;padding:1rem;margin-bottom:1rem}");
    H.push("@media print{.no-print{display:none}}");
    H.push("</style>");
    H.push("</head>");
    H.push("<body>");
    H.push('<p class="no-print meta"><a href="studio.html">← back to the Studio</a></p>');
    H.push("<h1>" + escHtml(b.title) + " — series production packet</h1>");
    H.push('<p class="lede">' + escHtml(b.logline) + "</p>");
    H.push('<p class="meta">' + escHtml(b.formatLabel) + " · " + b.episodes + " episodes × " +
      plan.runtimeSec + "s · " + escHtml(b.genreLabel) + " · " + escHtml(b.tierLabel) +
      " tier · " + plan.totalShots + " total shots · seed <code>" + escHtml(plan.seed) +
      "</code></p>");
    H.push('<p class="meta">Planned by Studio 2.0 (AI Film Master Guide). Rates are third-party estimates at $0.0392/credit — verify live before spending.</p>');
    H.push("<h2>Series bible — locked before generation</h2>");
    H.push("<p>The prompt DNA below is prepended verbatim to every shot prompt in every episode. It never changes mid-series.</p>");
    H.push("<pre>" + escHtml(b.dnaLines.join("\n")) + "</pre>");
    H.push("<h3>Locked assets (" + b.lockedAssets.length + ", plates generated ONCE)</h3>");
    H.push("<ul>");
    b.lockedAssets.forEach(function (a) {
      H.push("<li><strong>" + escHtml(a.kind) + ":</strong> " + escHtml(a.name || "unnamed") +
        (a.anchor ? " — " + escHtml(a.anchor) : "") +
        (a.voice ? " <span class=\"badge\">voice: " + escHtml(a.voice) + "</span>" : "") + "</li>");
    });
    H.push("</ul>");
    H.push("<h2>Episode arcs</h2>");
    plan.episodes.forEach(function (ep) {
      var a = ep.arc;
      H.push('<div class="shot"><h3>Episode ' + ep.episode + " — " + ep.shotCount +
        " shots, ~" + ep.voiceBudgetSec + "s voice budget" +
        (a.skeleton ? ' <span class="badge">skeleton — edit before generating</span>' : "") + "</h3>");
      H.push("<ul><li><strong>Emotion:</strong> " + escHtml(a.emotion) + "</li>");
      H.push("<li><strong>Stake:</strong> " + escHtml(a.stake) + "</li>");
      H.push("<li><strong>Hook:</strong> " + escHtml(a.hook) + "</li>");
      a.beats.forEach(function (bt, i) {
        H.push("<li><strong>Beat " + (i + 1) + ":</strong> " + escHtml(bt) + "</li>");
      });
      H.push("<li><strong>Turn:</strong> " + escHtml(a.turn) + "</li>");
      H.push("<li><strong>Cliffhanger:</strong> " + escHtml(a.cliff) + "</li></ul></div>");
    });
    H.push("<h2>Budget</h2>");
    H.push("<table><thead><tr><th scope=\"col\">Line item</th><th scope=\"col\">Math</th><th scope=\"col\">Cost</th></tr></thead><tbody>");
    plan.budget.lines.forEach(function (l) {
      H.push("<tr><td>" + escHtml(l.item) + "</td><td>" + escHtml(l.math) + "</td><td><strong>" +
        (l.verifyLive ? "verify live" : escHtml(fmtUSD(l.usd))) + "</strong></td></tr>");
    });
    H.push("</tbody></table>");
    H.push("<p><strong>Clean run: " + escHtml(fmtUSD(plan.budget.clean)) + "</strong> · 5× envelope (realistic): " +
      escHtml(fmtUSD(plan.budget.five)) + " · 20× envelope (worst case): " +
      escHtml(fmtUSD(plan.budget.twenty)) + "</p>");
    H.push("<p>Saved by the bible: " + plan.reuse.lockedAssets + " locked plates generated once — ≈" +
      r2(plan.reuse.avoidedCredits) + " credits (≈" + escHtml(fmtUSD(plan.reuse.avoidedUSD)) +
      ") not spent. " + escHtml(plan.reuse.rule) + "</p>");
    H.push("<h2>Schedule</h2>");
    H.push("<table><thead><tr><th scope=\"col\">Phase</th><th scope=\"col\">Days</th><th scope=\"col\">Basis</th></tr></thead><tbody>");
    plan.schedule.phases.forEach(function (p) {
      H.push("<tr><td>" + escHtml(p.phase) + "</td><td>" + p.days + "</td><td>" +
        escHtml(p.basis) + "</td></tr>");
    });
    H.push("</tbody></table>");
    H.push("<p><strong>Total: " + plan.schedule.totalDays + " shooting days.</strong></p>");
    H.push("<h2>Series consistency checklist</h2>");
    H.push('<ul class="check">');
    b.checklist.forEach(function (c) { H.push("<li>☐ " + escHtml(c) + "</li>"); });
    H.push("</ul>");
    H.push('<p class="meta">Every number traces back to api/v1/models.json or a template id. Same concept → same packet (deterministic).</p>');
    H.push('<p class="no-print"><button type="button" onclick="window.print()">Print / save PDF</button></p>');
    H.push("</body>");
    H.push("</html>");
    return H.join("\n");
  }

  var StudioEngine = {
    USD_PER_CREDIT: USD_PER_CREDIT,
    GENRES: GENRES, RUNTIMES: RUNTIMES, TIERS: TIERS,
    SERIES_FORMATS: SERIES_FORMATS, SERIES_CHECKLIST: SERIES_CHECKLIST,
    fnv1a: fnv1a, mulberry32: mulberry32, seededShuffle: seededShuffle,
    costPerSec: costPerSec, costPerImage: costPerImage, normName: normName,
    resolveModel: resolveModel,
    shotCountFor: shotCountFor, chooseTemplates: chooseTemplates,
    fillPrompt: fillPrompt, pickModel: pickModel,
    buildPlan: buildPlan, planToMarkdown: planToMarkdown,
    seriesBible: seriesBible, buildSeriesPlan: buildSeriesPlan,
    seriesToMarkdown: seriesToMarkdown, seriesToHtml: seriesToHtml, fmtUSD: fmtUSD
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
  var BRIDGE_KEY = "afg-studio-bridge";

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
      msg: document.getElementById("st-msg"),
      generate: document.getElementById("st-generate"),
      seriesPanel: document.getElementById("st-series-panel"),
      runtimeFieldset: document.getElementById("st-runtime-fs"),
      eps: document.getElementById("st-eps"),
      epRuntime: document.getElementById("st-epruntime"),
      castList: document.getElementById("st-cast-list"),
      castAdd: document.getElementById("st-cast-add"),
      locations: document.getElementById("st-locations"),
      presetNote: document.getElementById("st-preset-note"),
      dlMd: document.getElementById("st-dl-md"),
      dlHtml: document.getElementById("st-dl-html"),
      importMsg: document.getElementById("st-import-msg")
    };
  }

  var DATA = null, CURRENT = null, BRIDGE_ARCS = null;

  function runtimeSec() {
    var v = document.querySelector('input[name="st-runtime"]:checked');
    return v ? parseInt(v.value, 10) : 120;
  }

  function projectKind() {
    var v = document.querySelector('input[name="st-kind"]:checked');
    return v ? v.value : "film";
  }

  /* ---------------- series-mode cast rows (mirrors the episode planner) --- */
  function stCastRows() {
    var rows = [];
    els().castList.querySelectorAll(".st-cast-row").forEach(function (row) {
      var ins = row.querySelectorAll("input");
      rows.push({ name: ins[0].value.trim(), voice: ins[1].value.trim(), anchor: ins[2].value.trim() });
    });
    return rows;
  }

  function addCastRow(c, focus) {
    c = c || { name: "", voice: "", anchor: "" };
    var div = document.createElement("div");
    div.className = "st-cast-row";
    div.innerHTML =
      '<div class="field"><label>Character name</label><input class="input" type="text" value="' + esc(c.name) + '" placeholder="e.g. Mara"></div>' +
      '<div class="field"><label>Voice ID</label><input class="input" type="text" value="' + esc(c.voice) + '" placeholder="e.g. avocado_v2:MARA_01"></div>' +
      '<div class="field"><label>Anchor (one fixed visual line)</label><input class="input" type="text" value="' + esc(c.anchor) + '" placeholder="e.g. woman, late 20s, copper bob"></div>' +
      '<div class="field field-actions"><button type="button" class="btn btn-ghost btn-sm st-cast-del">Remove</button></div>';
    div.querySelector(".st-cast-del").addEventListener("click", function () {
      div.remove();
      if (!els().castList.querySelector(".st-cast-row")) addCastRow();
    });
    els().castList.appendChild(div);
    if (focus) div.querySelector("input").focus();
  }

  function setCastRows(cast) {
    els().castList.innerHTML = "";
    (cast && cast.length ? cast : [null]).forEach(function (c) { addCastRow(c, false); });
  }

  /* ---------------- series preset note + runtime options ------------------- */
  function presetRuntimeOptions(fmtKey) {
    var f = SERIES_FORMATS[fmtKey];
    var opts = [];
    for (var s = f.band[0]; s <= f.band[1]; s += 15) opts.push(s);
    if (opts[opts.length - 1] !== f.band[1]) opts.push(f.band[1]);
    return opts;
  }

  function refreshKindUI() {
    var e = els();
    var kind = projectKind();
    var isSeries = SERIES_FORMATS[kind] != null;
    e.seriesPanel.hidden = !isSeries;
    e.runtimeFieldset.hidden = isSeries;
    e.dlHtml.hidden = !(CURRENT && CURRENT.kind === "series");
    if (isSeries) {
      var f = SERIES_FORMATS[kind];
      e.epRuntime.innerHTML = "";
      presetRuntimeOptions(kind).forEach(function (s) {
        var o = document.createElement("option");
        o.value = s;
        o.textContent = s + "s per episode";
        if (s === 90 || (s > 90 && !e.epRuntime.querySelector("option[selected]"))) o.selected = true;
        e.epRuntime.appendChild(o);
      });
      /* select the option nearest the band midpoint */
      var mid = (f.band[0] + f.band[1]) / 2, best = null, bestD = 1e9;
      e.epRuntime.querySelectorAll("option").forEach(function (o) {
        var d = Math.abs(parseInt(o.value, 10) - mid);
        if (d < bestD) { bestD = d; best = o; }
      });
      if (best) e.epRuntime.value = best.value;
      e.presetNote.textContent = f.label + ": " + f.band[0] + "–" + f.band[1] +
        "s per episode · " + f.beats + " beats/episode · hook: " + f.hookStyle + ". " + f.voiceRule;
      e.generate.textContent = "Build my series packet";
    } else {
      e.generate.textContent = "Build my production packet";
    }
  }

  function readSeriesInput(bridgeArcs) {
    var e = els();
    var cast = stCastRows().filter(function (c) { return c.name || c.anchor; });
    var locations = e.locations.value.split(/[,;\n]/).map(function (s) { return s.trim(); })
      .filter(function (s) { return s; });
    return {
      seriesTitle: e.title.value.trim(),
      seriesLogline: e.logline.value.trim(),
      format: projectKind(),
      genre: e.genre.value,
      runtimeSec: parseInt(e.epRuntime.value, 10),
      tier: tier(),
      episodes: Math.max(3, Math.min(10, parseInt(e.eps.value, 10) || 5)),
      cast: cast,
      locations: locations,
      arcs: bridgeArcs || null
    };
  }

  /* Episode planner → Studio bridge: consume the payload (once) and pre-fill. */
  function consumeBridge() {
    var raw = null;
    try { raw = localStorage.getItem(BRIDGE_KEY); } catch (err) { /* ignore */ }
    if (!raw) return null;
    try { localStorage.removeItem(BRIDGE_KEY); } catch (err) { /* ignore */ }
    try {
      var b = JSON.parse(raw);
      if (!b || b.v !== 1 || b.kind !== "series") return null;
      return b;
    } catch (err) { return null; }
  }

  function applyBridge(b) {
    var e = els();
    e.title.value = b.seriesTitle || "";
    e.logline.value = b.logline || "";
    var fmt = SERIES_FORMATS[b.format] ? b.format : "minidrama";
    var radio = document.querySelector('input[name="st-kind"][value="' + fmt + '"]');
    if (radio) radio.checked = true;
    refreshKindUI();
    var n = Math.max(3, Math.min(10, (b.blocks || []).length || 5));
    e.eps.value = n;
    /* runtime: median of beats×spb across blocks, snapped into the band */
    var ests = (b.blocks || []).map(function (x) {
      return ((x.beats || []).length || 4) * (x.spb || 15);
    }).sort(function (x, y) { return x - y; });
    if (ests.length) {
      var med = ests[Math.floor(ests.length / 2)];
      var opts = Array.prototype.map.call(
        e.epRuntime.querySelectorAll("option"), function (o) { return parseInt(o.value, 10); });
      var nearest = opts[0], d0 = 1e9;
      opts.forEach(function (s) {
        var d = Math.abs(s - med);
        if (d < d0) { d0 = d; nearest = s; }
      });
      e.epRuntime.value = nearest;
    }
    setCastRows(b.cast || []);
    /* hand the block arcs back to the generate handler via the payload */
    var arcs = (b.blocks || []).map(function (x) {
      return { n: x.n, skeleton: false, emotion: x.emotion, stake: x.stake, hook: x.hook,
        beats: x.beats, turn: x.turn, cliff: x.cliff, scenes: x.scenes };
    });
    var msg = "Imported “" + (b.seriesTitle || "your series") + "” from the episode planner: " +
      (b.blocks || []).length + " episode block(s), format " + SERIES_FORMATS[fmt].label +
      ", cast anchors locked into the bible. Edit below, then build the series packet.";
    e.importMsg.hidden = false;
    e.importMsg.textContent = msg;
    return arcs;
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
    e.dlHtml.hidden = true;
    document.getElementById("st-packet-h").focus({ preventScroll: false });
    var smooth = typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    e.results.scrollIntoView({ block: "start", behavior: smooth });
  }

  /* ---------------- series packet renderer --------------------------------- */
  function renderSeries(plan) {
    var e = els();
    var b = plan.bible;
    var bibleHtml =
      '<article class="card" aria-label="Series bible">' +
      "<h3>Series bible — locked before generation</h3>" +
      '<p class="st-note">The prompt DNA below is prepended verbatim to every shot prompt ' +
      "in every episode. It never changes mid-series — this is the consistency engine.</p>" +
      '<pre class="st-prompt" tabindex="0">' + esc(b.dnaLines.join("\n")) + "</pre>" +
      "<h4>Locked assets (" + b.lockedAssets.length + " — plates generated ONCE)</h4>" +
      "<ul>" + b.lockedAssets.map(function (a) {
        return "<li><strong>" + esc(a.kind) + ":</strong> " + esc(a.name || "unnamed") +
          (a.anchor ? " — " + esc(a.anchor) : "") +
          (a.voice ? ' <span class="st-badge">voice: ' + esc(a.voice) + "</span>" : "") + "</li>";
      }).join("") + "</ul>" +
      '<p class="st-note"><strong>Format rules — ' + esc(b.formatLabel) + ":</strong> " +
      esc(b.arcStyle) + ". Hook: " + esc(b.hookStyle) + ".<br>" + esc(b.voiceRule) + "</p>" +
      "</article>";

    var epsHtml = plan.episodes.map(function (ep) {
      var a = ep.arc;
      var arcHtml =
        '<div class="st-anatomy"><strong>Emotion:</strong> ' + esc(a.emotion) +
        ' <span class="st-track">(~' + ep.voiceBudgetSec + "s voice budget" +
        (a.skeleton ? ' · skeleton — edit before generating' : "") + ")</span><br>" +
        "<strong>Stake:</strong> " + esc(a.stake) + "<br>" +
        "<strong>Hook:</strong> " + esc(a.hook) + "<br>" +
        "<strong>Turn:</strong> " + esc(a.turn) + "<br>" +
        "<strong>Cliffhanger:</strong> " + esc(a.cliff) + "</div>";
      var shotsHtml = ep.shots.map(shotCard).join("");
      return "<section aria-label=\"Episode " + ep.episode + "\">" +
        "<h3>Episode " + ep.episode + " — " + ep.shotCount + " shots × " +
        ep.shotSec + "s, " + ep.tierSpec.takes + " takes/keeper</h3>" + arcHtml +
        '<div class="st-meta" style="margin:var(--space-3) 0;">Episode seed <code>' +
        esc(ep.seed) + "</code></div>" + shotsHtml + "</section>";
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

    var checklistHtml = "<ul>" + b.checklist.map(function (c) {
      return "<li>" + esc(c) + "</li>";
    }).join("") + "</ul>";

    e.results.innerHTML =
      '<section aria-labelledby="st-packet-h">' +
      '<p class="st-kicker">Series packet · ' + esc(b.formatLabel) + " · " + b.episodes +
      " episodes × " + plan.runtimeSec + "s · series seed <code>" + esc(plan.seed) +
      "</code> · deterministic: same concept, same packet</p>" +
      '<h2 id="st-packet-h" tabindex="-1">' + esc(b.title) + "</h2>" +
      '<p class="lede">' + esc(b.logline) + "</p>" +
      '<p class="calc-note">' + esc(b.genreLabel) + " · " + esc(b.tierLabel) + " tier · " +
      plan.totalShots + " total shots · " + plan.schedule.totalDays + " shooting days. " +
      "Computed live from <code>models.json</code> and <code>prompt-templates.json</code> — " +
      "update the data, not this page.</p>" +
      bibleHtml +
      "<h3>Episodes</h3>" + epsHtml +
      "<h3>Series budget</h3>" +
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
      '<p class="calc-note">Saved by the bible: ' + plan.reuse.lockedAssets + " locked plates " +
      "generated once instead of per episode — ≈" + plan.reuse.avoidedCredits + " credits (≈" +
      fmtUSD(plan.reuse.avoidedUSD) + ") not spent. " + esc(plan.reuse.rule) + "</p>" +
      (plan.budget.verifyLive.length
        ? '<p class="calc-note"><strong>Verify live</strong> (no published rate): ' +
          plan.budget.verifyLive.map(esc).join(", ") + ".</p>" : "") +
      "</div></div>" +
      "<h3>Series schedule</h3>" +
      '<div class="table-scroll"><table><caption>' + plan.schedule.totalDays +
      " shooting days, ordered phases.</caption>" +
      "<thead><tr><th scope=\"col\">Phase</th><th scope=\"col\">Days</th>" +
      "<th scope=\"col\">Basis</th></tr></thead><tbody>" + schedRows + "</tbody></table></div>" +
      "<h3>Series consistency checklist</h3>" + checklistHtml +
      "</section>";
    e.actions.hidden = false;
    e.dlHtml.hidden = false;
    document.getElementById("st-packet-h").focus({ preventScroll: false });
    var smooth = typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    e.results.scrollIntoView({ block: "start", behavior: smooth });
  }

  function getPlans() {
    try { return JSON.parse(localStorage.getItem(SAVE_KEY) || "[]"); }
    catch (e) { return []; }
  }

  /* LocalStorage plans: names, kind badge, Load (continue planning),
     Duplicate, Delete — all real buttons, keyboard-operable. Old wave-15
     entries (no kind) are treated as films. */
  function planKind(p) { return p.kind === "series" ? "series" : "film"; }

  function planMeta(p) {
    var kind = planKind(p);
    if (kind === "series") {
      var b = (p.plan && p.plan.bible) || {};
      return esc(b.formatLabel || "Series") + " · " + (b.episodes || "?") + " episodes · " +
        esc((p.input && p.input.tier) || "") + " · " +
        ((p.plan && p.plan.totalShots) || "?") + " shots";
    }
    var inp = (p.plan && p.plan.input) || {};
    return esc(inp.genreLabel || "") + " · " + esc(inp.runtimeLabel || "") + " · " +
      esc(inp.tierLabel || "") + " · " + ((p.plan && p.plan.shotCount) || "?") + " shots";
  }

  function loadPlan(p) {
    var f = els();
    var kind = planKind(p);
    var inp = p.input || {};
    f.title.value = inp.title || inp.seriesTitle || "";
    f.logline.value = inp.logline || inp.seriesLogline || "";
    f.genre.value = inp.genre || "drama";
    document.querySelector('input[name="st-tier"][value="' + (inp.tier || "draft") + '"]').checked = true;
    if (kind === "series") {
      var radio = document.querySelector('input[name="st-kind"][value="' + (inp.format || "minidrama") + '"]');
      if (radio) radio.checked = true;
      refreshKindUI();
      f.eps.value = inp.episodes || 5;
      if (inp.runtimeSec) f.epRuntime.value = inp.runtimeSec;
      setCastRows(inp.cast || []);
      f.locations.value = (inp.locations || []).join(", ");
      CURRENT = { kind: "series", input: inp, plan: p.plan };
      renderSeries(p.plan);
    } else {
      var fr = document.querySelector('input[name="st-kind"][value="film"]');
      if (fr) fr.checked = true;
      refreshKindUI();
      var rt = document.querySelector('input[name="st-runtime"][value="' + (inp.runtimeSec || 120) + '"]');
      if (rt) rt.checked = true;
      CURRENT = { kind: "film", input: inp, plan: p.plan };
      render(p.plan);
    }
    announce("Plan “" + p.name + "” loaded — continue planning.");
  }

  function renderSaved() {
    var e = els();
    var plans = getPlans();
    e.savedEmpty.hidden = plans.length > 0;
    e.saved.innerHTML = plans.map(function (p, i) {
      var kind = planKind(p);
      return '<li class="log-entry"><span class="log-label">' + esc(p.name) + "</span> " +
        '<span class="st-badge">' + kind + "</span> " +
        '<span class="log-meta">' + planMeta(p) + "</span><br>" +
        '<button type="button" class="btn btn-sm btn-ghost" data-load="' + i + '">Continue planning</button> ' +
        '<button type="button" class="btn btn-sm btn-ghost" data-dup="' + i + '">Duplicate</button> ' +
        '<button type="button" class="btn btn-sm btn-ghost" data-del="' + i + '">Delete</button></li>';
    }).join("");
    function byAttr(sel) { return e.saved.querySelectorAll("[" + sel + "]"); }
    byAttr("data-load").forEach(function (b) {
      b.addEventListener("click", function () {
        var p = getPlans()[parseInt(b.getAttribute("data-load"), 10)];
        if (p) loadPlan(p);
      });
    });
    byAttr("data-dup").forEach(function (b) {
      b.addEventListener("click", function () {
        var plans = getPlans();
        var i = parseInt(b.getAttribute("data-dup"), 10);
        if (!plans[i]) return;
        var copy = JSON.parse(JSON.stringify(plans[i]));
        copy.name = plans[i].name + " (copy)";
        copy.savedAt = new Date().toISOString();
        plans.splice(i + 1, 0, copy);
        try { localStorage.setItem(SAVE_KEY, JSON.stringify(plans)); } catch (err) { /* ignore */ }
        renderSaved();
        announce("Duplicated as “" + copy.name + "”.");
      });
    });
    byAttr("data-del").forEach(function (b) {
      b.addEventListener("click", function () {
        var plans = getPlans();
        var i = parseInt(b.getAttribute("data-del"), 10);
        var name = plans[i] ? plans[i].name : "";
        plans.splice(i, 1);
        try { localStorage.setItem(SAVE_KEY, JSON.stringify(plans)); } catch (err) { /* ignore */ }
        renderSaved();
        if (name) announce("Deleted “" + name + "”.");
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

    /* Project-type radios: film or one of the four serialized format presets. */
    document.querySelectorAll('input[name="st-kind"]').forEach(function (r) {
      r.addEventListener("change", refreshKindUI);
    });
    e.castAdd.addEventListener("click", function () { addCastRow(null, true); });
    setCastRows([]);
    refreshKindUI();

    /* Episode-planner bridge: a planner "Send series to Studio" lands here. */
    var bridge = consumeBridge();
    if (bridge) {
      BRIDGE_ARCS = applyBridge(bridge);
    } else if (/[?&]from=planner/.test(location.search)) {
      e.importMsg.hidden = false;
      e.importMsg.textContent = "The planner sent you here, but no series payload was found in this browser " +
        "(it was already consumed or never saved). Plan manually below — or go back and press “Send series to Studio” again.";
    }

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
      if (!title) { fail("Give the project a title first."); e.title.focus(); return; }
      if (!logline) { fail("Write a one-line logline first."); e.logline.focus(); return; }
      if (!DATA) { fail("Data is still loading — one moment."); return; }
      var kind = projectKind();
      try {
        if (SERIES_FORMATS[kind]) {
          var sin = readSeriesInput(BRIDGE_ARCS);
          CURRENT = { kind: "series", input: sin, plan: buildSeriesPlan(DATA, sin) };
          renderSeries(CURRENT.plan);
        } else {
          var inp = { title: title, logline: logline, genre: e.genre.value,
            runtimeSec: runtimeSec(), tier: tier() };
          CURRENT = { kind: "film", input: inp, plan: buildPlan(DATA, inp) };
          render(CURRENT.plan);
        }
        BRIDGE_ARCS = null;
      } catch (err) {
        fail("Could not build the plan: " + err.message);
      }
    });

    e.copy.addEventListener("click", function () {
      if (!CURRENT) return;
      var md = CURRENT.kind === "series"
        ? seriesToMarkdown(CURRENT.plan)
        : planToMarkdown(CURRENT.plan);
      function done() { announce("Production packet copied as markdown."); }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(md).then(done, function () { fallbackCopy(md, done); });
      } else { fallbackCopy(md, done); }
    });

    /* "Export my plan": download the packet as a file the filmmaker can hand
       to a collaborator. Markdown for both kinds; self-contained HTML for series. */
    function downloadFile(filename, text, mime) {
      var blob = new Blob([text], { type: mime || "text/plain;charset=utf-8" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    }
    function slugify(s) {
      return String(s || "packet").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "packet";
    }
    e.dlMd.addEventListener("click", function () {
      if (!CURRENT) return;
      var md = CURRENT.kind === "series"
        ? seriesToMarkdown(CURRENT.plan)
        : planToMarkdown(CURRENT.plan);
      downloadFile(slugify(CURRENT.input.title || CURRENT.input.seriesTitle) + "-packet.md", md,
        "text/markdown;charset=utf-8");
      announce("Packet downloaded as markdown.");
    });
    e.dlHtml.addEventListener("click", function () {
      if (!CURRENT || CURRENT.kind !== "series") return;
      downloadFile(slugify(CURRENT.plan.bible.title) + "-packet.html",
        seriesToHtml(CURRENT.plan), "text/html;charset=utf-8");
      announce("Self-contained HTML packet downloaded — one file, printable, shareable.");
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
      var defName = CURRENT.kind === "series" ? CURRENT.input.seriesTitle : CURRENT.input.title;
      var name = e.planName.value.trim() || defName;
      var plans = getPlans();
      plans.push({ name: name, savedAt: new Date().toISOString(),
        kind: CURRENT.kind, input: CURRENT.input, plan: CURRENT.plan });
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
