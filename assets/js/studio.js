/* Studio, "Plan my AI film": the interactive AI-film studio simulator.
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

  var USD_PER_CREDIT = 0.0392; /* models.json cost_basis, Oct 2026, verify live */
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
    drama: { label: "Drama, intimate", tracks: ["core", "performance", "photorealistic"],
      env: "a quiet interior at dusk", light: "soft window light, low contrast",
      style: "naturalistic and restrained", estab: ["t2", "p1"], payoff: ["t3", "f1", "p1"] },
    horror: { label: "Horror, dread", tracks: ["core", "photorealistic"],
      env: "a darkened house at night", light: "hard practicals, deep shadows",
      style: "dread-filled and minimal", estab: ["t6", "p5"], payoff: ["t6", "p5"] },
    scifi: { label: "Sci-fi, wonder", tracks: ["core", "photorealistic"],
      env: "a vast alien structure", light: "volumetric glow, cool palette",
      style: "awe and scale", estab: ["t1", "t12", "p8", "p6"], payoff: ["t12", "p6"] },
    action: { label: "Action, adrenaline", tracks: ["core", "animated"],
      env: "a city street at night", light: "neon, high contrast",
      style: "kinetic and punchy", estab: ["t1", "t5"], payoff: ["t5", "a1"] },
    comedy: { label: "Comedy, warmth", tracks: ["core", "animated"],
      env: "a sunlit apartment", light: "bright and soft",
      style: "playful and warm", estab: ["a4", "t7"], payoff: ["a5", "a4"] },
    animation: { label: "Animation, whimsy", tracks: ["animated"],
      env: "a handcrafted miniature world", light: "storybook glow",
      style: "animated-feature warmth", estab: ["a2"], payoff: ["a3", "a6"] },
    commercial: { label: "Commercial, product", tracks: ["core", "photorealistic"],
      env: "a clean studio set", light: "crisp product lighting",
      style: "premium commercial polish", estab: ["t4", "t14"], payoff: ["t4", "t10", "p4"] },
    documentary: { label: "Documentary, truthful", tracks: ["photorealistic", "core"],
      env: "real streets, available light", light: "natural available light",
      style: "observational and honest", estab: ["p2", "t9"], payoff: ["p2", "t3"] }
  };

  var RUNTIMES = { 30: "30 seconds", 120: "2 minutes", 300: "5 minutes", 600: "10 minutes" };

  /* Tier assumptions, stated in the packet, not hidden. */
  var TIERS = {
    draft: { label: "Draft", secsPerShot: 6, takes: 3, shotsPerDay: 40, stillsPerShot: 1 },
    festival: { label: "Festival", secsPerShot: 4, takes: 6, shotsPerDay: 12, stillsPerShot: 2 }
  };

  /* ---- Studio 2.0: serialized format presets --------------------------------
     Mirrors the episode planner's FORMAT_PRESETS (assets/js/episode-planner.js):
     same bands, same seconds-per-beat. The beat counts, hook styles, and the
     voice-budget rule come from craft/episodic-shortform.md (the mini-drama
     pipeline). Keep the two files' bands in sync, scripts/studio.test.js
     asserts it. */
  var SERIES_FORMATS = {
    minidrama: { label: "Mini-drama", band: [60, 150], spb: 15, beats: 4,
      hookStyle: "the gut-punch emotion as a visual in the first 3 seconds",
      arcStyle: "one emotion per episode; gut-punch → reversal → cliffhanger (never the resolution)",
      voiceRule: "Lock voice/dialogue at ≈beats × 15s ±10% BEFORE any frame is generated (the golden rule)." },
    pov: { label: "POV micro-series", band: [30, 90], spb: 12, beats: 4,
      hookStyle: "your hands / your POV, immediate second-person stakes in the first 3 seconds",
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
      hookStyle: "the decision point as a visual in the first 3 seconds, a choice the viewer can see",
      arcStyle: "one decision per episode: hook → the stakes → the decision beat (poll/comment prompt) → the consequence → freeze before the next choice; viewer comments shape the next episode's block",
      voiceRule: "Lock voice/dialogue at ≈beats × 15s ±10% BEFORE any frame is generated (the golden rule)." }
  };

  /* The series consistency checklist, every item is a rule from the
     episodic-shortform chapter or the episode planner's gates, restated. */
  var SERIES_CHECKLIST = [
    "Bible locked before generation: the prompt DNA block is identical in every episode's shots, never edit mid-series.",
    "Face anchors never re-run: the locked character stills below are generated ONCE and reused across all episodes.",
    "One emotion per episode (the two-emotions rule), completion rate dies when the episode can't decide.",
    "Voice/dialogue locked at ±10% before any frame (the golden rule); picture is cut TO the locked track, never the reverse.",
    "The cliffhanger is a freeze, never the resolution.",
    "Gate G8: an episode ships only after its lesson is logged, the arc tracker is the series memory."
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

  function fillPrompt(tmpl, genre, tier, overrides) {
    var fills = slotFills(tmpl, genre, tier);
    if (overrides) {
      Object.keys(overrides).forEach(function (k) { fills[k] = overrides[k]; });
    }
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
          "No template-specific anatomy note, apply the nine-layer anatomy from the anatomy chapter.",
        use: tmpl.use || "",
        prompt: filled.text, unfilled: filled.unfilled,
        model: pm.model ? pm.model.model : null,
        platform: pm.model ? pm.model.platform : null,
        cps: pm.model ? costPerSec(pm.model) : null,
        modelFallback: pm.fallback,
        modelUnpriced: pm.unpricedNames,
        modelWhy: pm.model ? whyLine(pm.model) : "No priced video model resolved, verify live."
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
        item: "Generation, " + name + " (" + g.count + " shots × " + tier.takes + " takes)",
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
      item: "Post, assembly, audio, grade",
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
      { phase: "Audio, voice, foley, music",
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
     preset (labeled as skeletons, the filmmaker writes the real lines). */
  function seriesBible(input) {
    var fmt = SERIES_FORMATS[input.format];
    var genre = GENRES[input.genre];
    var cast = (input.cast || []).filter(function (c) { return c.name || c.anchor; });
    var locations = (input.locations || []).filter(function (l) { return l; });
    var dna = [
      "[SERIES BIBLE, locked, identical in every episode's shots]",
      "Characters: " + (cast.length
        ? cast.map(function (c) { return c.name + ", " + (c.anchor || "no anchor set"); }).join(" | ")
        : "none locked, lock the cast before generating"),
      "Locations: " + (locations.length ? locations.join(" | ") : genre.env),
      "Style: " + genre.style + " · Light: " + genre.light +
        " · Grade: locked at the still stage, match the anchor plates.",
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
    var roles = ["Hook, the first 3 seconds",
      "Development, raise the stake of this episode's single emotion",
      "Turn, what changes", "Cliffhanger, freeze, never the resolution"];
    var beats = [];
    for (var i = 0; i < fmt.beats; i++) {
      beats.push("SKELETON beat " + (i + 1) + " (" + roles[Math.min(i, roles.length - 1)] + ")");
    }
    return {
      n: n, skeleton: true,
      emotion: "SKELETON, one emotion for episode " + n,
      stake: "SKELETON, one-line emotional stake (series: " + seriesLogline + ")",
      hook: "SKELETON, hook visual (" + fmt.hookStyle + ")",
      beats: beats,
      turn: "SKELETON, the emotional turn",
      cliff: "SKELETON, the unanswered beat. Never the resolution.",
      scenes: "SKELETON, keyframe scenes (hook / beat / turn / cliffhanger)"
    };
  }

  function buildSeriesPlan(data, input) {
    var fmt = SERIES_FORMATS[input.format];
    if (!fmt) throw new Error("unknown series format: " + input.format);
    if (!GENRES[input.genre]) throw new Error("unknown genre: " + input.genre);
    if (!TIERS[input.tier]) throw new Error("unknown tier: " + input.tier);
    var episodes = parseInt(input.episodes, 10);
    if (!(episodes >= 3 && episodes <= 10)) {
      throw new Error("episode count must be 3 to 10, got " + input.episodes);
    }
    var runtimeSec = parseInt(input.runtimeSec, 10);
    if (!(runtimeSec >= fmt.band[0] && runtimeSec <= fmt.band[1])) {
      throw new Error("runtime " + runtimeSec + "s is outside the " + fmt.label +
        " band (" + fmt.band[0] + "-" + fmt.band[1] + "s)");
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
        title: input.seriesTitle + ", E" + n,
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
       naive per-episode regeneration, shown in the packet, not subtracted. */
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
        item: "Series bible, locked anchor plates, generated ONCE (" + assetPlates +
          " assets: " + bible.lockedAssets.map(function (a) {
            return a.kind + ":" + (a.name || "unnamed");
          }).join(", ") + ")",
        math: assetPlates + " × " + cheapestCpi + " credits/image (" + cheapestImage.model + ")",
        credits: bibleStillsCredits, usd: r2(bibleStillsCredits * USD_PER_CREDIT),
        verifyLive: false
      });
    } else {
      lines.push({
        item: "Series bible, locked anchor plates (" + assetPlates + " assets)",
        math: "no published image rate", credits: 0, usd: 0, verifyLive: true
      });
    }
    var sumEpCredits = 0;
    epList.forEach(function (ep, i) {
      var epCredits = ep.budget.lines.reduce(function (a, l) { return a + l.credits; }, 0);
      var epUSD = ep.budget.lines.reduce(function (a, l) { return a + l.usd; }, 0);
      sumEpCredits += epCredits;
      lines.push({
        item: "Episode " + (i + 1) + ", " + ep.shotCount + " shots × " + ep.tierSpec.takes +
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
      phase: "Series bible, locked anchor stills",
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
      phases.push({ phase: merge[k].phase + ", all " + episodes + " episodes",
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

  /* ---- Studio 2.5: microdrama production planner --------------------------
     An economics planner for serialized AI-microdrama runs, not a shot
     packet. Every figure below is labeled with its documented basis, from
     the wave-27 teardown "The $150 Microdrama" (data/v1/teardowns.json,
     id `storeel-off-campus`, TheWrap, June 2026; Sixth Tone, June 2026):
     - Clip unit 10 to 15s: StoReel Canvas split a 30-episode storyboard into
       146 clips of 10 to 15s, the unit of generation for the whole run.
     - $50/min benchmark: TheWrap's reported per-minute AI series cost
       (~$150 for 4 one-minute episodes ≈ $37.50/ep), vs ~$2,000/min for a
       typical live-action microseries. One platform's rate card, one
       experiment, a benchmark to beat, not a promise.
     - 3 to 5 "drawing cards": Qidian Interactive's retake discipline, 3 to
       5 attempts per usable shot. Draft tier plans the low end (3×),
       festival tier the high end (5×).
     - 1 day/episode: TheWrap's reporter shipped 4 one-minute episodes in
       4 days, script, breakdown, generation, and assembly inside the day;
       free (reporter) labor, scripting cost uncounted.
     - Character regenerations were a real paid cost (faces drifting); no
       per-episode figure was published, the count is the filmmaker's
       input, priced at the cheapest image-model rate.
     Generation rates come from data/v1/models.json (always flagged
     verify-live in this planner); everything else is arithmetic on the
     filmmaker's inputs. Nothing here is a promise about any live price. */
  var MICRO = {
    clipLo: 10, clipHi: 15,
    benchmarkPerMin: 50,
    pugcPerMin: 150,
    liveActionPerMin: 2000,
    paceDaysPerEp: 1,
    takes: { draft: 3, festival: 5 },
    maxEpisodes: 40, minEpMin: 0.5, maxEpMin: 3,
    maxRegensPerEp: 100
  };

  function clipCountFor(minPerEp) {
    var secs = minPerEp * 60;
    return {
      runtimeSec: secs,
      lo: Math.ceil(secs / MICRO.clipHi),
      hi: Math.ceil(secs / MICRO.clipLo)
    };
  }

  /* Cheapest priced video / image model in the data, the planner's rate
     floor, always labeled as such. Null when nothing in the file is priced. */
  function cheapestPricedVideo(data) {
    var best = null, bestCps = null;
    (data.models || []).forEach(function (m) {
      if (m.type !== "video" || m.status === "discontinued") return;
      var cps = costPerSec(m);
      if (cps !== null && (bestCps === null || cps < bestCps)) {
        bestCps = cps; best = m;
      }
    });
    return best ? {
      model: best.model, platform: best.platform, cps: bestCps,
      lastVerified: best.last_verified || null
    } : null;
  }

  function cheapestPricedImage(data) {
    var best = null, bestCpi = null;
    (data.models || []).forEach(function (m) {
      if (m.type !== "image" || m.status === "discontinued") return;
      var cpi = costPerImage(m);
      if (cpi !== null && (bestCpi === null || cpi < bestCpi)) {
        bestCpi = cpi; best = m;
      }
    });
    return best ? {
      model: best.model, platform: best.platform, cpi: bestCpi,
      lastVerified: best.last_verified || null
    } : null;
  }

  /* input: { title, logline? episodes (1 to 40), minPerEpisode (0.5 to 3),
              tier (draft|festival), regensPerEp (0 to 100, your budget guess) }
     Deterministic: same inputs → byte-identical plan. */
  function buildMicrodramaPlan(data, input) {
    var episodes = parseInt(input.episodes, 10);
    if (!(episodes >= 1 && episodes <= MICRO.maxEpisodes)) {
      throw new Error("episode count must be between 1 and " + MICRO.maxEpisodes +
        ", got " + input.episodes);
    }
    var minPerEp = parseFloat(input.minPerEpisode);
    if (!(minPerEp >= MICRO.minEpMin && minPerEp <= MICRO.maxEpMin)) {
      throw new Error("minutes per episode must be between " + MICRO.minEpMin + " and " +
        MICRO.maxEpMin + ", got " + input.minPerEpisode);
    }
    if (!TIERS[input.tier]) throw new Error("unknown tier: " + input.tier);
    var regensPerEp = parseFloat(input.regensPerEp);
    if (!(regensPerEp >= 0 && regensPerEp <= MICRO.maxRegensPerEp)) {
      throw new Error("regenerations per episode must be between 0 and " +
        MICRO.maxRegensPerEp + ", got " + input.regensPerEp);
    }
    if (!input.title) throw new Error("the run needs a title");

    var takes = MICRO.takes[input.tier];
    var clips = clipCountFor(minPerEp);
    var runtimeSec = clips.runtimeSec;
    var totalMinutes = r2(episodes * minPerEp);
    var totalClips = { lo: clips.lo * episodes, hi: clips.hi * episodes };

    var rate = cheapestPricedVideo(data);
    var img = cheapestPricedImage(data);
    var vidu = null;
    (data.models || []).forEach(function (m) {
      if (/vidu q4/i.test(String(m.model || ""))) vidu = m;
    });

    var genSecPerEp = runtimeSec * takes;
    var genSecTotal = genSecPerEp * episodes;
    var genCreditsPerEp = rate ? r2(genSecPerEp * rate.cps) : 0;
    var genCreditsTotal = r2(genCreditsPerEp * episodes);
    var regenCount = regensPerEp * episodes;
    var regenCredits = img ? r2(regenCount * img.cpi) : 0;
    var genUsdPerEp = rate ? r2(genCreditsPerEp * USD_PER_CREDIT) : 0;
    var genUsdTotal = rate ? r2(genCreditsTotal * USD_PER_CREDIT) : 0;
    var regenUsdTotal = img ? r2(regenCredits * USD_PER_CREDIT) : 0;
    var totalUsd = r2(genUsdTotal + regenUsdTotal);
    var perEpUsd = r2(totalUsd / episodes);

    var benchmarkPerEp = r2(MICRO.benchmarkPerMin * minPerEp);
    var benchmarkTotal = r2(MICRO.benchmarkPerMin * totalMinutes);

    var seed = fnv1a(["microdrama", input.title, episodes, minPerEp,
      input.tier, regensPerEp].join("|")).toString(16);

    return {
      kind: "microdrama",
      input: {
        title: input.title, logline: input.logline || "",
        episodes: episodes, minPerEpisode: minPerEp, tier: input.tier,
        tierLabel: TIERS[input.tier].label, regensPerEp: regensPerEp
      },
      seed: seed,
      episodes: episodes, minPerEpisode: minPerEp, tier: input.tier,
      runtimeSec: runtimeSec, totalMinutes: totalMinutes,
      clipsPerEp: { lo: clips.lo, hi: clips.hi },
      totalClips: totalClips,
      storeelClipCheck: "StoReel's actual granularity, 146 clips for a " +
        "30-episode storyboard ≈ " + (146 / 30).toFixed(1) +
        " clips per 60s episode, sits inside this " + clips.lo + "-" +
        clips.hi + " range.",
      takes: takes,
      benchmarkPerEp: benchmarkPerEp, benchmarkTotal: benchmarkTotal,
      pugcRef: r2(MICRO.pugcPerMin * totalMinutes),
      liveActionRef: r2(MICRO.liveActionPerMin * totalMinutes),
      rate: rate, img: img,
      viduRef: vidu ? vidu.est_cost_credits : null,
      genSecPerEp: genSecPerEp, genSecTotal: genSecTotal,
      budget: {
        genCreditsPerEp: genCreditsPerEp, genCreditsTotal: genCreditsTotal,
        genUsdPerEp: genUsdPerEp, genUsdTotal: genUsdTotal,
        regenCount: regenCount, regenCredits: regenCredits,
        regenUsdTotal: regenUsdTotal,
        totalCredits: r2(genCreditsTotal + regenCredits),
        totalUsd: totalUsd, perEpUsd: perEpUsd,
        verifyLive: true
      },
      perMinPlan: totalMinutes ? r2(totalUsd / totalMinutes) : 0,
      timelineDays: episodes * MICRO.paceDaysPerEp,
      paceNote: "1 day per finished episode, StoReel's documented pace " +
        "(4 episodes in 4 days). Script, breakdown, generation, and assembly " +
        "all inside the day; free reporter labor, scripting cost uncounted. " +
        "Festival-tier work runs slower, no documented festival pace exists, " +
        "so adjust from your own runs."
    };
  }

  /* Microdrama run plan: markdown. Economics-only: clip budget, the $50/min
     benchmark, model-rate generation cost, the retake envelope, the regen
     reserve, PUGC revenue context, timeline, every line carrying its
     documented basis. */
  function microdramaToMarkdown(plan) {
    var L = [];
    var inp = plan.input;
    var b = plan.budget;
    L.push("# " + inp.title + ", microdrama run plan");
    L.push("");
    if (inp.logline) { L.push("_Logline:_ " + inp.logline); L.push(""); }
    L.push(inp.episodes + " episodes × " + inp.minPerEpisode + " min/episode (" +
      plan.runtimeSec + "s) · " + inp.tierLabel + " tier (" + plan.takes +
      "× retakes) · plan seed `" + plan.seed + "`");
    L.push("");
    L.push("Planned by the Studio's microdrama mode (AI Film Master Guide, " +
      "Studio 2.5) from the documented economics in the guide's \"The $150 " +
      "Microdrama\" teardown (`data/v1/teardowns.json`, id `storeel-off-campus` " +
      "TheWrap, June 2026; Sixth Tone, June 2026) and live `models.json` " +
      "rates. Every figure below is a benchmark or a range, never a promise; " +
      "model rates are third-party estimates, verify live before spending.");
    L.push("");
    L.push("## Clip budget");
    L.push("");
    L.push("|  | Per episode | Whole run (" + plan.episodes + " eps) |");
    L.push("|---|---|---|");
    L.push("| Runtime | " + plan.runtimeSec + "s | " + plan.totalMinutes +
      " min finished |");
    L.push("| Clips (10 to 15s each) | " + plan.clipsPerEp.lo + "-" +
      plan.clipsPerEp.hi + " | " + plan.totalClips.lo + "-" +
      plan.totalClips.hi + " |");
    L.push("");
    L.push("Basis: 146 clips of 10 to 15s for StoReel's 30-episode storyboard " +
      "(TheWrap), the documented unit of generation. " +
      plan.storeelClipCheck + " One page of dialogue ≈ one minute ≈ one " +
      "episode (TheWrap's industry survey).");
    L.push("");
    L.push("## Run budget");
    L.push("");
    L.push("| Line item | Math | Cost | Documented basis |");
    L.push("|---|---|---|---|");
    L.push("| Documented benchmark | $50/min × " + plan.totalMinutes +
      " min | " + fmtUSD(plan.benchmarkTotal) + " | TheWrap's reported AI " +
      "series rate (~$150 for 4 one-minute episodes ≈ $37.50/ep). One " +
      "platform's rate card, one experiment, the benchmark to beat, not a promise. |");
    L.push("| Generation (" + plan.takes + "× retakes) | " +
      plan.genSecTotal + "s × " +
      (plan.rate ? plan.rate.cps.toFixed(2) + " credits/s (" + plan.rate.model +
        ")" : "no priced video model") + " | " +
      (plan.rate ? fmtUSD(b.genUsdTotal) : "verify live") + " | " +
      plan.takes + "× = the " + inp.tierLabel.toLowerCase() + " end of " +
      "Qidian's 3 to 5 \"drawing cards\" retake range (Sixth Tone). Rate = " +
      "cheapest priced video model in `models.json`, the generation floor, " +
      "verify live. |");
    L.push("| Character-regen reserve | " + b.regenCount + " regens × " +
      (plan.img ? plan.img.cpi + " credits (" + plan.img.model + ")" :
        "no priced image model") + " | " +
      (plan.img ? fmtUSD(b.regenUsdTotal) : "verify live") + " | StoReel " +
      "paid for regenerations when faces drifted; no per-episode figure was " +
      "published, the count (" + inp.regensPerEp + "/ep) is your budget " +
      "guess, priced at the cheapest image-model rate. |");
    L.push("| **Plan total** | generation + regen reserve | **" +
      fmtUSD(b.totalUsd) + "** (" + fmtUSD(b.perEpUsd) + "/episode, " +
      fmtUSD(plan.perMinPlan) + "/min) | Your plan's per-minute cost " +
      "vs the $50/min benchmark. |");
    L.push("| Live-action context | $2,000/min × " + plan.totalMinutes +
      " min | " + fmtUSD(plan.liveActionRef) + " | TheWrap's reported " +
      "typical live-action microseries figure. Context, not a quote. |");
    L.push("| PUGC revenue context | $150/min × " + plan.totalMinutes +
      " min | " + fmtUSD(plan.pugcRef) + " | StoReel's reported payout rate " +
      "for creator series it designates. Platform-specific, not revenue " +
      "you can count on. |");
    L.push("");
    if (plan.viduRef) {
      L.push("Reference pricing (not used in the math): Vidu Q4 Preview, " +
        plan.viduRef + " (PR Newswire, preview pricing, verify live).");
      L.push("");
    }
    L.push("## Documented production economics (benchmarks, not predictions)");
    L.push("");
    L.push("StoReel Canvas 'Off Campus' experiment (TheWrap, June 2026): 4 " +
      "one-minute AI episodes in 4 days for ~$150 in credits (≈$37.50/episode); " +
      "AI series generation ≈$50/min vs live-action ≈$2,000/min; 146 clips " +
      "of 10 to 15s for a 30-episode storyboard; character regenerations paid " +
      "when faces drifted. StoReel's PUGC payout rate: ≈$150/min for creator " +
      "series it designates. Qidian Interactive's AI studio (Sixth Tone, June " +
      "2026): 3 to 5 retakes per usable shot ('drawing cards'). Finishing " +
      "StoReel's full 30-episode storyboard was estimated at 'a few thousand " +
      "dollars more' in credits. Full teardown: `storeel-off-campus`.");
    L.push("");
    L.push("## Timeline");
    L.push("");
    L.push("**" + plan.timelineDays + " day" +
      (plan.timelineDays === 1 ? "" : "s") + " at the documented pace**, " +
      "≈7 episodes/week. " + plan.paceNote);
    L.push("");
    L.push("All model rates are third-party estimates at $0.0392/credit " +
      "(models.json cost_basis, Oct 2026), verify live before spending.");
    return L.join("\n");
  }

  /* ---- markdown export --------------------------------------------------- */
  function planToMarkdown(plan) {
    var L = [];
    var inp = plan.input;
    L.push("# " + inp.title + ", AI-film production packet");
    L.push("");
    L.push("_Logline:_ " + inp.logline);
    L.push("");
    L.push("Concept: " + inp.genreLabel + " · " + inp.runtimeLabel + " · " +
      inp.tierLabel + " tier · " + plan.shotCount + " shots · seed `" + plan.seed + "`");
    L.push("");
    L.push("Generated by the Studio (AI Film Master Guide) from `data/v1/models.json` " +
      "(" + plan.dataMeta.modelCount + " video models) and `data/v1/prompt-templates.json` " +
      "(" + plan.dataMeta.templateCount + " templates). Rates are third-party " +
      "estimates at $0.0392/credit, verify live before spending.");
    L.push("");
    L.push("Tier assumptions (" + inp.tierLabel.toLowerCase() + "): 1 shot per " +
      plan.tierSpec.secsPerShot + "s · " + plan.tierSpec.takes + " takes per keeper · " +
      plan.tierSpec.shotsPerDay + " shots/day · " + plan.tierSpec.stillsPerShot +
      " keyframe still(s) per shot.");
    L.push("");
    L.push("## Shot list");
    L.push("");
    plan.shots.forEach(function (s) {
      L.push("### Shot " + s.n + ", " + s.act + " · " + s.templateTitle +
        " (" + s.templateId + ") · " + s.duration + "s");
      L.push("");
      L.push("Model: " + (s.model || "unpriced, verify live") +
        (s.platform ? " (" + s.platform + ")" : "") +
        (s.cps !== null ? ", " + s.cps.toFixed(2) + " credits/s" : "") +
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
    var refMd = refinementsToMarkdown(plan);
    if (refMd) { L.push(refMd); L.push(""); }
    L.push("## Model picks");
    L.push("");
    plan.modelPicks.forEach(function (p) {
      L.push("- **" + p.model + "** (" + p.platform + "), " + p.shots + " shot" +
        (p.shots === 1 ? "" : "s") +
        (p.cps !== null ? ", " + p.cps.toFixed(2) + " credits/s" : ", rate unpublished, verify live") +
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
      "consistency fixes multiply the clean cost 5 to 20×. Budget the envelope, not the clean run.");
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
    var optMd = optimizeToMarkdown(plan);
    if (optMd) { L.push(optMd); L.push(""); }
    return L.join("\n");
  }

  /* Series packet: markdown. Self-contained: bible, per-episode arcs + shot
     lists with per-shot prompts, model picks, budget, schedule, checklist. */
  function seriesToMarkdown(plan) {
    var L = [];
    var b = plan.bible;
    L.push("# " + b.title + ", series production packet");
    L.push("");
    L.push("_Logline:_ " + b.logline);
    L.push("");
    L.push(b.formatLabel + " · " + b.episodes + " episodes × " + plan.runtimeSec +
      "s · " + b.genreLabel + " · " + b.tierLabel + " tier · " + plan.totalShots +
      " total shots · series seed `" + plan.seed + "`");
    L.push("");
    L.push("Planned by Studio 2.0 (AI Film Master Guide) from `data/v1/models.json` and " +
      "`data/v1/prompt-templates.json`. Rates are third-party estimates at " +
      "$0.0392/credit, verify live before spending. Deterministic: same concept, same packet.");
    L.push("");
    L.push("## Series bible, locked before generation");
    L.push("");
    L.push("The prompt DNA below is prepended verbatim to EVERY shot prompt in EVERY " +
      "episode. It never changes mid-series, that is the consistency engine.");
    L.push("");
    L.push("```");
    L = L.concat(b.dnaLines);
    L.push("```");
    L.push("");
    L.push("Locked assets (" + b.lockedAssets.length + ", plates generated ONCE):");
    L.push("");
    b.lockedAssets.forEach(function (a) {
      L.push("- " + a.kind + ": **" + (a.name || "unnamed") + "**" +
        (a.anchor ? ", " + a.anchor : "") + (a.voice ? " (voice: " + a.voice + ")" : ""));
    });
    L.push("");
    L.push("Format rules, " + b.formatLabel + ": " + b.arcStyle);
    L.push("Hook style: " + b.hookStyle);
    L.push("Voice rule: " + b.voiceRule);
    L.push("");
    L.push("## Episode arcs");
    L.push("");
    plan.episodes.forEach(function (ep) {
      var a = ep.arc;
      L.push("### Episode " + ep.episode + ", " + ep.shotCount + " shots, ~" +
        ep.voiceBudgetSec + "s voice budget" + (a.skeleton ? " [SKELETON, edit before generating]" : ""));
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
    L.push("## Shot lists, per-shot prompts (with locked DNA)");
    L.push("");
    plan.episodes.forEach(function (ep) {
      L.push("### Episode " + ep.episode);
      L.push("");
      ep.shots.forEach(function (s) {
        L.push("#### Shot E" + ep.episode + "." + s.n + ", " + s.act + " · " +
          s.templateTitle + " (" + s.templateId + ") · " + s.duration + "s");
        L.push("");
        L.push("Model: " + (s.model || "unpriced, verify live") +
          (s.platform ? " (" + s.platform + ")" : "") +
          (s.cps !== null ? ", " + s.cps.toFixed(2) + " credits/s" : ""));
        L.push("");
        L.push("```");
        L.push(s.prompt);
        L.push("```");
        L.push("");
      });
    });
    var refMdS = refinementsToMarkdown(plan);
    if (refMdS) { L.push(refMdS); L.push(""); }
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
      "instead of per episode, ≈" + r2(plan.reuse.avoidedCredits) + " credits (≈" +
      fmtUSD(plan.reuse.avoidedUSD) + ") not spent. " + plan.reuse.rule);
    L.push("");
    L.push("### Documented production economics (wave 27, benchmarks, not predictions)");
    L.push("");
    L.push("StoReel Canvas 'Off Campus' experiment (TheWrap, June 2026): 4 one-minute AI episodes in 4 days for ~$150 in credits (≈$37.50/episode); AI series generation ≈$50/min vs live-action ≈$2,000/min; 300 to 400-word stage-direction prompts per 10 to 15s clip; character regenerations paid when faces drifted, full teardown in the guide's teardowns.json (`storeel-off-campus`). StoReel's PUGC payout rate: ≈$150/min for creator series it designates. Qidian Interactive's AI studio (Sixth Tone, June 2026): 3 to 5 retakes per usable shot ('drawing cards'); a 8 to 10M-yuan, 3-year project rebuilt with AI in 2 months for ≈1M yuan. Compare this packet's per-minute generation cost against the $50/min benchmark before generating.");
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
    var optMdS = optimizeToMarkdown(plan);
    if (optMdS) { L.push(optMdS); L.push(""); }
    return L.join("\n");
  }

  /* Self-contained HTML packet: inline CSS, no external requests, a single
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
    H.push("<title>" + escHtml(b.title) + ", series production packet</title>");
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
    H.push("<h1>" + escHtml(b.title) + ", series production packet</h1>");
    H.push('<p class="lede">' + escHtml(b.logline) + "</p>");
    H.push('<p class="meta">' + escHtml(b.formatLabel) + " · " + b.episodes + " episodes × " +
      plan.runtimeSec + "s · " + escHtml(b.genreLabel) + " · " + escHtml(b.tierLabel) +
      " tier · " + plan.totalShots + " total shots · seed <code>" + escHtml(plan.seed) +
      "</code></p>");
    H.push('<p class="meta">Planned by Studio 3.0 (AI Film Master Guide). Rates are third-party estimates at $0.0392/credit, verify live before spending.</p>');
    H.push("<h2>Series bible, locked before generation</h2>");
    H.push("<p>The prompt DNA below is prepended verbatim to every shot prompt in every episode. It never changes mid-series.</p>");
    H.push("<pre>" + escHtml(b.dnaLines.join("\n")) + "</pre>");
    H.push("<h3>Locked assets (" + b.lockedAssets.length + ", plates generated ONCE)</h3>");
    H.push("<ul>");
    b.lockedAssets.forEach(function (a) {
      H.push("<li><strong>" + escHtml(a.kind) + ":</strong> " + escHtml(a.name || "unnamed") +
        (a.anchor ? ", " + escHtml(a.anchor) : "") +
        (a.voice ? " <span class=\"badge\">voice: " + escHtml(a.voice) + "</span>" : "") + "</li>");
    });
    H.push("</ul>");
    H.push("<h2>Episode arcs</h2>");
    plan.episodes.forEach(function (ep) {
      var a = ep.arc;
      H.push('<div class="shot"><h3>Episode ' + ep.episode + ", " + ep.shotCount +
        " shots, ~" + ep.voiceBudgetSec + "s voice budget" +
        (a.skeleton ? ' <span class="badge">skeleton, edit before generating</span>' : "") + "</h3>");
      H.push("<ul><li><strong>Emotion:</strong> " + escHtml(a.emotion) + "</li>");
      H.push("<li><strong>Stake:</strong> " + escHtml(a.stake) + "</li>");
      H.push("<li><strong>Hook:</strong> " + escHtml(a.hook) + "</li>");
      a.beats.forEach(function (bt, i) {
        H.push("<li><strong>Beat " + (i + 1) + ":</strong> " + escHtml(bt) + "</li>");
      });
      H.push("<li><strong>Turn:</strong> " + escHtml(a.turn) + "</li>");
      H.push("<li><strong>Cliffhanger:</strong> " + escHtml(a.cliff) + "</li></ul></div>");
    });
    var refHtml = refinementsToHtml(plan);
    if (refHtml) H.push(refHtml);
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
    H.push("<p>Saved by the bible: " + plan.reuse.lockedAssets + " locked plates generated once, ≈" +
      r2(plan.reuse.avoidedCredits) + " credits (≈" + escHtml(fmtUSD(plan.reuse.avoidedUSD)) +
      ") not spent. " + escHtml(plan.reuse.rule) + "</p>");
    H.push("<h3>Documented production economics (benchmarks, not predictions)</h3>");
    H.push("<p>StoReel Canvas 'Off Campus' experiment (TheWrap, June 2026): 4 one-minute AI episodes in 4 days for ~$150 in credits (≈$37.50/episode); AI series generation ≈$50/min vs live-action ≈$2,000/min; 300 to 400-word stage-direction prompts per 10 to 15s clip; character regenerations paid when faces drifted. StoReel's PUGC payout rate: ≈$150/min for creator series it designates. Qidian Interactive's AI studio (Sixth Tone, June 2026): 3 to 5 retakes per usable shot ('drawing cards'); a 8 to 10M-yuan, 3-year project rebuilt with AI in 2 months for ≈1M yuan. Compare this packet's per-minute generation cost against the $50/min benchmark before generating.</p>");
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
    var optHtml = optimizeToHtml(plan);
    if (optHtml) H.push(optHtml);
    H.push('<p class="meta">Every number traces back to data/v1/models.json or a template id. Same concept → same packet (deterministic).</p>');
    H.push('<p class="no-print"><button type="button" onclick="window.print()">Print / save PDF</button></p>');
    H.push("</body>");
    H.push("</html>");
    return H.join("\n");
  }

  /* ---- Studio cost optimizer (wave 24) --------------------------------------
     Given a built plan (film or series), find the cheapest way to make it.
     Pure engine (no DOM): optimizePlan(data, plan, opts) ->
       { resBar, audioShare, perShot[], modes{cheapest,balanced,bestrated},
         byModel[], byEpisode[], byTakes[], biggest, ineligible[], unpriced[],
         verifyLive[] }.
     Every number comes from data/v1/models.json. The honest floor: a model
     only substitutes when its DOCUMENTED rates clear the shot's requirements
     (resolution at/above the bar, native audio when the shot needs dialogue,
     documented max clip >= shot duration). Models whose strings carry no
     resolution are listed as ineligible, never assumed.
     opts: { resBar: 720|1080|2160 (default 720 draft / 1080 festival),
             audioShare: 0-100 (default 0), share of shots needing native
             audio, spread evenly and deterministically across each group. } */

  var OPT_RES_LABEL = { 360: "360p", 480: "480p", 720: "720p", 768: "768p",
    1080: "1080p", 1440: "2K", 2160: "4K" };

  function optResVal(tok) {
    var m = /^(\d{3,4})p$/.exec(tok);
    if (m) return parseInt(m[1], 10);
    if (tok === "2K") return 1440;
    if (tok === "4K") return 2160;
    return null;
  }

  function optResLabel(v) { return OPT_RES_LABEL[v] || (v + "p"); }

  /* Every (resolution, rate) pair in est_cost_credits. Credit "N/Ms" rates
     win when present (the Studio's own convention); USD "/s" or "$N/Ms"
     rates are used only when no credit rate parses. Each entry:
     { res, usdps, kind: "credit"|"usd", cps, resInferred }. */
  function modelRateOptions(m) {
    var s = m.est_cost_credits || "";
    var resToks = [], rt = /(\d{3,4}p|2K|4K)/g, rtm;
    while ((rtm = rt.exec(s)) !== null) resToks.push({ tok: rtm[1], idx: rtm.index });
    var docMax = 0;
    resToks.forEach(function (t) {
      var v = optResVal(t.tok);
      if (v && v > docMax) docMax = v;
    });
    /* Clauses: split on ; and, so "RATE RES, RATE RES" pairs bind inside
       their own clause ("$0.13/s 2K, $0.08/s 768p" must not cross-bind). */
    var clauses = [], cs = /[^;,]+/g, cm;
    while ((cm = cs.exec(s)) !== null) clauses.push({ text: cm[0], idx: cm.index });
    function clauseAt(idx) {
      for (var i = 0; i < clauses.length; i++) {
        var c = clauses[i];
        if (idx >= c.idx && idx < c.idx + c.text.length) return c;
      }
      return null;
    }
    var rates = [], tmp;
    var rc = /~?(\d+(?:\.\d+)?)\s*\/\s*(\d+)\s*s/g;
    while ((tmp = rc.exec(s)) !== null) {
      var usd = /\$/.test(tmp[0]) || s.charAt(tmp.index - 1) === "$";
      rates.push({ n: parseFloat(tmp[1]), d: parseFloat(tmp[2]), idx: tmp.index, usd: usd });
    }
    var ru = /\$(\d+(?:\.\d+)?)\s*\/\s*s\b/g;
    while ((tmp = ru.exec(s)) !== null) {
      rates.push({ n: parseFloat(tmp[1]), d: 1, idx: tmp.index, usd: true });
    }
    var hasCredit = rates.some(function (r) { return !r.usd; });
    var out = [];
    rates.forEach(function (r) {
      if (hasCredit === r.usd) return;
      var c = clauseAt(r.idx);
      var inClause = c ? resToks.filter(function (t) {
        return t.idx >= c.idx && t.idx < c.idx + c.text.length;
      }) : [];
      var pool = inClause.length ? inClause : resToks;
      var best = null, bd = 1e9, bestAfter = false;
      pool.forEach(function (t) {
        var dd = Math.abs(t.idx - r.idx);
        /* exact tie: prefer the token after the rate ("$0.14/s 1080p") */
        if (dd < bd || (dd === bd && t.idx > r.idx && !bestAfter)) {
          bd = dd; best = t; bestAfter = t.idx > r.idx;
        }
      });
      var res, inferred = false;
      if (best && bd <= 20) {
        res = optResVal(best.tok);
      } else if (docMax > 0) {
        res = docMax; inferred = true;
      } else {
        res = null;
      }
      out.push({
        res: res, resInferred: inferred,
        usdps: r.usd ? r.n / r.d : (r.n / r.d) * USD_PER_CREDIT,
        kind: r.usd ? "usd" : "credit",
        cps: r.usd ? null : r.n / r.d
      });
    });
    return out;
  }

  /* Cheapest documented rate at or above the bar. Null = no documented rate
     clears the bar (the model cannot substitute, honest floor). */
  function rateAtRes(m, bar) {
    var best = null;
    modelRateOptions(m).forEach(function (o) {
      if (o.res === null || o.res < bar) return;
      if (!best || o.usdps < best.usdps) best = o;
    });
    return best;
  }

  function modelDocMaxRes(m) {
    var s = m.est_cost_credits || "", rt = /(\d{3,4}p|2K|4K)/g, rtm, mx = 0;
    while ((rtm = rt.exec(s)) !== null) {
      var v = optResVal(rtm[1]);
      if (v && v > mx) mx = v;
    }
    return mx || null;
  }

  function optAudioCapable(m) {
    return /native audio|dialog|speech|lip-sync|lip sync|voice/.test(hay(m));
  }

  /* Documented max clip length in seconds ("up to 20s", "4-30s", "1-15s
     clips"). Null = undocumented (noted, never assumed against the shot). */
  function modelMaxClipSec(m) {
    var s = [m.est_cost_credits, m.strength, m.what_changed, m.best_use].join(" | ");
    var mt = /up to (\d+(?:\.\d+)?)\s*s\b/i.exec(s);
    if (mt) return parseFloat(mt[1]);
    mt = /(\d+(?:\.\d+)?)\s*[-\u2013\u2014]\s*(\d+(?:\.\d+)?)\s*s\b/.exec(s);
    if (mt) return parseFloat(mt[2]);
    return null;
  }

  /* Documented leaderboard ranks, quoted from the models' own records with
     their caveats. Order spans different boards and dates, indicative,
     not apples-to-apples; every pick carries its rank note. */
  var OPT_RANKS = [
    { name: "Gemini Omni", order: 1,
      note: "Arena text-to-video leader, 1512 pts (documented in the guide's model notes)" },
    { name: "FLUX 3 Video", order: 2,
      note: "Arena text-to-video #2, 1496 pts, behind Gemini Omni Flash" },
    { name: "MiniMax H3", order: 3,
      note: "H3 Max ranks top-3 in earlier reports, verify live" },
    { name: "Seedance 2.5", order: 4,
      note: "Arena image-to-video leader, Sept 21 2026 (~120 pts above Kling 3.0 Pro; single-source flag)" },
    { name: "Grok Imagine Video 1.5", order: 5,
      note: "Topped the image-to-video arena at launch (third-party)" },
    { name: "Kling 3.0", order: 6,
      note: "Artificial Analysis text-to-video #12, Sept 2026 (single-source flag; corrected from a circulating #4 claim)" }
  ];

  function rankOfModel(m) {
    var n = normName(m.model);
    for (var i = 0; i < OPT_RANKS.length; i++) {
      if (normName(OPT_RANKS[i].name) === n) return OPT_RANKS[i];
    }
    return null;
  }

  function optEligiblePool(data, req) {
    var pool = [];
    (data.models || []).forEach(function (m) {
      if (m.type !== "video" || m.status === "discontinued") return;
      var rate = rateAtRes(m, req.res);
      if (!rate) return;
      if (req.audio && !optAudioCapable(m)) return;
      var mc = modelMaxClipSec(m);
      if (mc !== null && mc < req.maxSec) return;
      pool.push({ m: m, rate: rate, rank: rankOfModel(m), maxClip: mc,
        audio: optAudioCapable(m), quality: isQualityFlagged(m) });
    });
    return pool;
  }

  function optEntry(x, duration, takes) {
    if (!x) return null;
    return {
      model: x.m.model, platform: x.m.platform,
      usdps: x.rate.usdps, kind: x.rate.kind,
      res: x.rate.res, resInferred: x.rate.resInferred,
      audio: x.audio, quality: x.quality,
      rank: x.rank ? { order: x.rank.order, note: x.rank.note } : null,
      maxClip: x.maxClip,
      priceMayMove: x.rate.kind === "usd",
      cost: r2(x.rate.usdps * duration * takes)
    };
  }

  /* What the filmmaker gives up moving from the balanced pick to the
     cheapest viable one, facts from the records, never hand-waving. */
  function optGiveUpNotes(bal, cheap, bar) {
    if (!bal || !cheap) return [];
    if (bal.model === cheap.model) return ["Same model, already the cheapest viable pick."];
    var notes = [];
    if (cheap.res < bal.res) {
      notes.push("Documented rate tier drops " + optResLabel(bal.res) + " \u2192 " +
        optResLabel(cheap.res) + " (both clear the " + optResLabel(bar) + " bar).");
    }
    if (bal.audio && !cheap.audio) {
      notes.push("Loses native-audio capability in documented strengths " +
        "(kept only because this shot needs no dialogue).");
    }
    if (bal.quality && !cheap.quality) {
      notes.push("Leaves a quality-flagged model (" + bal.model + ").");
    }
    if (cheap.rank && (!bal.rank || cheap.rank.order < bal.rank.order)) {
      notes.push("Ranked pick: " + cheap.rank.note + ".");
    }
    if (cheap.priceMayMove) {
      notes.push("USD/API billing, price may move; verify live before budgeting.");
    }
    if (cheap.resInferred) {
      notes.push("Cheapest rate's resolution is inferred from the model's documented max, not stated outright.");
    }
    notes.push("Platform changes: " + bal.platform + " \u2192 " + cheap.platform + ".");
    return notes;
  }

  function optimizePlan(data, plan, opts) {
    opts = opts || {};
    var isSeries = plan.kind === "series";
    var groups = [];
    if (isSeries) {
      plan.episodes.forEach(function (ep) {
        groups.push({ label: "E" + ep.episode, shots: ep.shots,
          takes: ep.tierSpec.takes, shotSec: ep.shotSec, tier: plan.bible.tier });
      });
    } else {
      groups.push({ label: "", shots: plan.shots, takes: plan.tierSpec.takes,
        shotSec: plan.shotSec, tier: plan.input.tier });
    }
    var bar = opts.resBar || (groups[0].tier === "festival" ? 1080 : 720);
    var share = Math.min(100, Math.max(0, opts.audioShare || 0));
    var byName = {};
    (data.models || []).forEach(function (m) { byName[normName(m.model)] = m; });

    var modes = {
      cheapest: { key: "cheapest", label: "Cheapest viable", total: 0, complete: true, shots: 0 },
      balanced: { key: "balanced", label: "Balanced (Studio defaults)", total: 0, complete: true, shots: 0 },
      bestrated: { key: "bestrated", label: "Best rated", total: 0, complete: true, shots: 0 },
      draftfinal: { key: "draftfinal", label: "Draft cheap, finish flagship", total: 0, complete: true, shots: 0 }
    };
    var perShot = [], byModel = {}, byEpisode = [];
    var verifyLive = {}, ineligible = [], unpriced = [];
    var biggest = null;

    groups.forEach(function (g) {
      var ep = { label: g.label || "Film", cheapest: 0, balanced: 0, bestrated: 0,
        draftfinal: 0, shots: g.shots.length, unpriced: 0 };
      g.shots.forEach(function (s, i) {
        var needsAudio = share > 0 &&
          Math.floor((i + 1) * share / 100) > Math.floor(i * share / 100);
        var req = { res: bar, audio: needsAudio, maxSec: s.duration };
        var pool = optEligiblePool(data, req);
        var rec = byName[normName(s.model)] || null;
        var balRate = rec ? rateAtRes(rec, bar) : null;
        var balMc = rec ? modelMaxClipSec(rec) : null;
        var shortfalls = [];
        if (rec && !balRate) {
          shortfalls.push("no documented rate at " + optResLabel(bar) + " (documented max: " +
            (modelDocMaxRes(rec) ? optResLabel(modelDocMaxRes(rec)) : "unstated") + ")");
        }
        if (rec && req.audio && !optAudioCapable(rec)) shortfalls.push("not audio-capable in documented strengths");
        if (rec && balMc !== null && balMc < req.maxSec) {
          shortfalls.push("documented max clip " + balMc + "s < " + req.maxSec + "s shot");
        }
        var bal = rec && balRate ? optEntry({ m: rec, rate: balRate, rank: rankOfModel(rec),
          maxClip: balMc, audio: optAudioCapable(rec), quality: isQualityFlagged(rec) },
          s.duration, g.takes) : null;
        if (bal) bal.shortfalls = shortfalls;
        var cheap = optEntry(pool.slice().sort(function (a, b) {
          return a.rate.usdps - b.rate.usdps;
        })[0] || null, s.duration, g.takes);
        var ranked = optEntry(pool.filter(function (x) { return x.rank; })
          .sort(function (a, b) { return a.rank.order - b.rank.order; })[0] || null,
          s.duration, g.takes);

        /* Draft cheap, finish flagship: the first takes-1 takes run at the
           cheapest viable rate, the keeper take at the best-rated model.
           The Oct 2026 pricing reality (AI-video-models research mission,
           2026-10-11): draft/turbo tiers for coverage, flagship rates for
           the takes that ship. */
        var splitCost = null;
        if (cheap && ranked && g.takes >= 1) {
          splitCost = g.takes === 1 ? ranked.cost
            : r2((cheap.cost / g.takes) * (g.takes - 1) + (ranked.cost / g.takes));
        }

        var row = {
          ref: (g.label ? g.label + " \u00B7 " : "") + "Shot " + s.n,
          duration: s.duration, takes: g.takes,
          needsAudio: needsAudio, reqRes: bar,
          balanced: bal, cheapest: cheap, bestrated: ranked,
          saving: (bal && cheap) ? r2(bal.cost - cheap.cost) : null,
          giveUp: optGiveUpNotes(bal, cheap, bar)
        };
        perShot.push(row);

        [["cheapest", cheap], ["balanced", bal], ["bestrated", ranked]].forEach(function (pair) {
          var mk = modes[pair[0]];
          if (pair[1]) { mk.total = r2(mk.total + pair[1].cost); mk.shots++; }
          else { mk.complete = false; }
        });
        if (splitCost !== null) {
          modes.draftfinal.total = r2(modes.draftfinal.total + splitCost);
          modes.draftfinal.shots++;
        } else {
          modes.draftfinal.complete = false;
        }
        if (bal) {
          ep.balanced = r2(ep.balanced + bal.cost);
          if (cheap) ep.cheapest = r2(ep.cheapest + cheap.cost);
          if (ranked) ep.bestrated = r2(ep.bestrated + ranked.cost);
          if (splitCost !== null) ep.draftfinal = r2(ep.draftfinal + splitCost);
          var bm = byModel[bal.model] || { model: bal.model, platform: bal.platform,
            shots: 0, usd: 0, usdps: bal.usdps, kind: bal.kind };
          bm.shots++; bm.usd = r2(bm.usd + bal.cost);
          byModel[bal.model] = bm;
          if (!biggest || bal.cost > biggest.cost) {
            biggest = { ref: row.ref, model: bal.model, platform: bal.platform,
              cost: bal.cost, duration: s.duration, takes: g.takes,
              usdps: bal.usdps, kind: bal.kind,
              alternative: cheap, saving: row.saving };
          }
        } else { ep.unpriced++; }
        [bal, cheap, ranked].forEach(function (e) {
          if (e && e.priceMayMove) verifyLive[e.model] = 1;
        });
      });
      byEpisode.push(ep);
    });

    /* Ineligible (priced but below the bar / resolution undocumented) and
       unpriced (no parseable rate at all), named, never silent. */
    (data.models || []).forEach(function (m) {
      if (m.type !== "video" || m.status === "discontinued") return;
      var opts_ = modelRateOptions(m);
      if (!opts_.length) { unpriced.push(m.model); return; }
      if (!rateAtRes(m, bar)) {
        var mx = modelDocMaxRes(m);
        ineligible.push({ model: m.model,
          reason: mx ? "documented max " + optResLabel(mx) + " is below the " +
            optResLabel(bar) + " bar" : "resolution undocumented in the rate string" });
      }
    });

    var byModelArr = Object.keys(byModel).map(function (k) { return byModel[k]; })
      .sort(function (a, b) { return b.usd - a.usd; });
    var takes = groups[0].takes;
    var perTake = takes ? r2(modes.balanced.total / takes) : 0;
    var byTakes = [];
    [1, 3, takes].forEach(function (t) {
      if (byTakes.some(function (r) { return r.takes === t; })) return;
      byTakes.push({ takes: t, usd: r2(perTake * t) });
    });
    byTakes.sort(function (a, b) { return a.takes - b.takes; });

    return {
      resBar: bar, audioShare: share, takes: takes,
      shotCount: perShot.length, episodes: isSeries ? groups.length : 0,
      modes: modes, perShot: perShot,
      byModel: byModelArr, byEpisode: isSeries ? byEpisode : [],
      byTakes: byTakes, perTake: perTake,
      biggest: biggest,
      ineligible: ineligible, unpriced: unpriced,
      verifyLive: Object.keys(verifyLive).sort(),
      basis: "Rates parsed from models.json est_cost_credits at $0.0392/credit; " +
        "USD-billed models use their stated $/s. Balanced column re-prices each " +
        "shot at the resolution bar (the packet budget above uses the Studio's " +
        "first-quoted-rate convention)."
    };
  }

  /* ---- optimizer packet sections ------------------------------------------
     Appended to the markdown / HTML packet exports when plan.optimizer is set
     by the Studio UI ("Optimize cost" panel). */

  function optModeTableMd(opt) {
    var L = [];
    L.push("| Mode | Generation cost | Delta vs balanced | What changes |");
    L.push("|---|---|---|---|");
    var b = opt.modes.balanced.total, c = opt.modes.cheapest.total, r = opt.modes.bestrated.total;
    function delta(x) {
      if (x === null) return "n/a";
      var d = r2(b - x);
      return (d >= 0 ? "-" : "+") + fmtUSD(Math.abs(d)) + (b ? " (" + Math.round(Math.abs(d) / b * 100) + "%)" : "");
    }
    var changed = opt.perShot.filter(function (s) {
      return s.balanced && s.cheapest && s.balanced.model !== s.cheapest.model;
    }).length;
    var usdPicks = opt.verifyLive.length;
    L.push("| **Cheapest viable** (floor) | " + fmtUSD(c) + " | " + delta(c) + " | " +
      changed + " of " + opt.shotCount + " shots change model" +
      (usdPicks ? "; " + usdPicks + " USD-billed pick(s), price may move" : "") + " |");
    L.push("| **Balanced** (Studio defaults) | " + fmtUSD(b) + " | n/a | the plan's own per-shot picks, re-priced at the " +
      optResLabel(opt.resBar) + " bar |");
    L.push("| **Best rated** | " + (opt.modes.bestrated.complete ? fmtUSD(r) : "incomplete") +
      " | " + delta(opt.modes.bestrated.complete ? r : null) +
      " | top documented arena/leaderboard model per shot (boards differ, see rank notes) |");
    var df = opt.modes.draftfinal;
    L.push("| **Draft cheap, finish flagship** | " + (df.complete ? fmtUSD(df.total) : "incomplete") +
      " | " + delta(df.complete ? df.total : null) +
      " | coverage takes at the cheapest viable rate, the keeper take at the best-rated model, " +
      "the Oct 2026 pricing reality (draft tiers for drafts, flagship rates for finals) |");
    return L;
  }

  function optimizeToMarkdown(plan) {
    var opt = plan.optimizer;
    if (!opt) return "";
    var L = [];
    L.push("## Cost optimizer");
    L.push("");
    L.push("_Basis:_ resolution bar " + optResLabel(opt.resBar) + " · " + opt.audioShare +
      "% of shots need native audio (spread evenly) · " + opt.takes + " takes per keeper. " + opt.basis);
    L.push("");
    L.push("### Four budget modes");
    L.push("");
    L = L.concat(optModeTableMd(opt));
    L.push("");
    L.push("### Where the money goes (balanced mode)");
    L.push("");
    L.push("| Model | Shots | Rate | Cost |");
    L.push("|---|---|---|---|");
    opt.byModel.forEach(function (g) {
      L.push("| " + g.model + " (" + g.platform + ") | " + g.shots + " | " +
        (g.kind === "usd" ? "$" + g.usdps.toFixed(3) + "/s USD" : "$" + g.usdps.toFixed(3) + "/s") +
        " | " + fmtUSD(g.usd) + " |");
    });
    if (opt.byEpisode.length) {
      L.push("");
      L.push("| Episode | Shots | Balanced cost |");
      L.push("|---|---|---|");
      opt.byEpisode.forEach(function (e) {
        L.push("| " + e.label + " | " + e.shots + " | " + fmtUSD(e.balanced) +
          (e.unpriced ? " (" + e.unpriced + " shot(s) unpriced)" : "") + " |");
      });
    }
    L.push("");
    L.push("Take-count leverage: each take costs " + fmtUSD(opt.perTake) + " across the plan, " +
      opt.byTakes.map(function (t) { return t.takes + " take(s): " + fmtUSD(t.usd); }).join(" · ") + ".");
    L.push("");
    if (opt.biggest) {
      var bg = opt.biggest;
      L.push("### Biggest single decision");
      L.push("");
      L.push(bg.ref + " on **" + bg.model + "** (" + bg.platform + ") costs " + fmtUSD(bg.cost) +
        " (" + bg.duration + "s × " + bg.takes + " takes @ $" + bg.usdps.toFixed(3) + "/s" +
        (bg.kind === "usd" ? " USD, price may move" : "") + ").");
      if (bg.alternative && bg.alternative.model !== bg.model) {
        L.push("Cheaper alternative meeting the same requirements: **" + bg.alternative.model + "** (" +
          bg.alternative.platform + ") at $" + bg.alternative.usdps.toFixed(3) + "/s, saves " +
          fmtUSD(bg.saving) + " on this shot alone.");
      } else {
        L.push("No cheaper alternative meets this shot's requirements, it is already the floor.");
      }
      L.push("");
    }
    L.push("### Per-shot substitutions (cheapest viable)");
    L.push("");
    L.push("| Shot | Needs | Balanced pick | Cheapest viable | Saving | Requirement match |");
    L.push("|---|---|---|---|---|---|");
    opt.perShot.forEach(function (s) {
      function cell(e) {
        if (!e) return "…";
        return e.model + " ($" + e.usdps.toFixed(3) + "/s" + (e.kind === "usd" ? " USD" : "") + ")" +
          (e.priceMayMove ? " [price may move]" : "");
      }
      var match = s.cheapest
        ? optResLabel(s.cheapest.res) + (s.cheapest.resInferred ? " (inferred)" : "") +
          " ≥ " + optResLabel(s.reqRes) + "; audio " + (s.needsAudio
            ? (s.cheapest.audio ? "✓ native" : "✗ MISSING")
            : "not needed")
        : "no eligible model";
      L.push("| " + s.ref + " | " + (s.needsAudio ? "dialogue" : "…") + " | " + cell(s.balanced) +
        " | " + cell(s.cheapest) + " | " + (s.saving !== null ? fmtUSD(s.saving) : "…") + " | " + match + " |");
    });
    L.push("");
    if (opt.ineligible.length) {
      L.push("Not eligible at the " + optResLabel(opt.resBar) + " bar (honest floor, never assumed): " +
        opt.ineligible.map(function (x) { return x.model + " (" + x.reason + ")"; }).join("; ") + ".");
      L.push("");
    }
    if (opt.unpriced.length) {
      L.push("No published rate, verify live: " + opt.unpriced.join(", ") + ".");
      L.push("");
    }
    if (opt.verifyLive.length) {
      L.push("Price-may-move picks (USD/API billing, verify live before budgeting): " +
        opt.verifyLive.join(", ") + ".");
      L.push("");
    }
    L.push("Rank notes (best-rated mode): the documented order is Gemini Omni (Arena T2V leader, 1512 pts) → " +
      "FLUX 3 Video (Arena T2V #2, 1496) → MiniMax H3 (top-3 in earlier reports, verify live) → " +
      "Seedance 2.5 (Arena I2V leader Sept 2026, single-source) → Grok Imagine Video 1.5 " +
      "(topped I2V arena at launch, third-party) → Kling 3.0 (Artificial Analysis T2V #12, Sept 2026, single-source). " +
      "Boards and dates differ, indicative, not apples-to-apples.");
    L.push("");
    return L.join("\n");
  }

  function optimizeToHtml(plan) {
    var opt = plan.optimizer;
    if (!opt) return "";
    var H = [];
    H.push("<h2>Cost optimizer</h2>");
    H.push('<p class="meta"><strong>Basis:</strong> resolution bar ' + escHtml(optResLabel(opt.resBar)) +
      " · " + opt.audioShare + "% of shots need native audio (spread evenly) · " + opt.takes +
      " takes per keeper. " + escHtml(opt.basis) + "</p>");
    H.push("<h3>Four budget modes</h3>");
    var b = opt.modes.balanced.total, c = opt.modes.cheapest.total;
    var rOk = opt.modes.bestrated.complete, r = opt.modes.bestrated.total;
    var dfOk = opt.modes.draftfinal.complete, dfT = opt.modes.draftfinal.total;
    function dHtml(x) {
      if (x === null) return "n/a";
      var d = Math.round((b - x) * 100) / 100;
      return (d >= 0 ? "−" : "+") + escHtml(fmtUSD(Math.abs(d))) +
        (b ? " (" + Math.round(Math.abs(d) / b * 100) + "%)" : "");
    }
    var changed = opt.perShot.filter(function (s) {
      return s.balanced && s.cheapest && s.balanced.model !== s.cheapest.model;
    }).length;
    H.push("<table><thead><tr><th scope=\"col\">Mode</th><th scope=\"col\">Generation cost</th>" +
      "<th scope=\"col\">Delta vs balanced</th><th scope=\"col\">What changes</th></tr></thead><tbody>");
    H.push("<tr><td><strong>Cheapest viable</strong> (floor)</td><td><strong>" + escHtml(fmtUSD(c)) +
      "</strong></td><td>" + dHtml(c) + "</td><td>" + changed + " of " + opt.shotCount + " shots change model" +
      (opt.verifyLive.length ? '; <span class="badge">price may move</span> on ' +
        opt.verifyLive.length + " USD-billed pick(s)" : "") + "</td></tr>");
    H.push("<tr><td><strong>Balanced</strong> (Studio defaults)</td><td><strong>" + escHtml(fmtUSD(b)) +
      "</strong></td><td>…</td><td>The plan's own per-shot picks, re-priced at the " +
      escHtml(optResLabel(opt.resBar)) + " bar.</td></tr>");
    H.push("<tr><td><strong>Best rated</strong></td><td><strong>" + (rOk ? escHtml(fmtUSD(r)) : "incomplete") +
      "</strong></td><td>" + dHtml(rOk ? r : null) + "</td><td>Top documented arena/leaderboard model per shot " +
      "(boards differ, see rank notes).</td></tr>");
    H.push("<tr><td><strong>Draft cheap, finish flagship</strong></td><td><strong>" +
      (dfOk ? escHtml(fmtUSD(dfT)) : "incomplete") +
      "</strong></td><td>" + dHtml(dfOk ? dfT : null) + "</td><td>Coverage takes at the cheapest viable rate, " +
      "the keeper take at the best-rated model, the Oct 2026 pricing reality.</td></tr>");
    H.push("</tbody></table>");
    H.push("<h3>Where the money goes (balanced mode)</h3>");
    H.push("<table><thead><tr><th scope=\"col\">Model</th><th scope=\"col\">Shots</th>" +
      "<th scope=\"col\">Rate</th><th scope=\"col\">Cost</th></tr></thead><tbody>");
    opt.byModel.forEach(function (g) {
      H.push("<tr><td><strong>" + escHtml(g.model) + "</strong><br><span class=\"meta\">" +
        escHtml(g.platform) + "</span></td><td>" + g.shots + "</td><td>$" + g.usdps.toFixed(3) +
        "/s" + (g.kind === "usd" ? " USD" : "") + "</td><td><strong>" + escHtml(fmtUSD(g.usd)) +
        "</strong></td></tr>");
    });
    H.push("</tbody></table>");
    if (opt.byEpisode.length) {
      H.push("<table><thead><tr><th scope=\"col\">Episode</th><th scope=\"col\">Shots</th>" +
        "<th scope=\"col\">Balanced cost</th></tr></thead><tbody>");
      opt.byEpisode.forEach(function (e) {
        H.push("<tr><td>" + escHtml(e.label) + "</td><td>" + e.shots + "</td><td><strong>" +
          escHtml(fmtUSD(e.balanced)) + "</strong>" +
          (e.unpriced ? " (" + e.unpriced + " shot(s) unpriced)" : "") + "</td></tr>");
      });
      H.push("</tbody></table>");
    }
    H.push("<p>Take-count leverage: each take costs <strong>" + escHtml(fmtUSD(opt.perTake)) +
      "</strong> across the plan, " + opt.byTakes.map(function (t) {
        return t.takes + " take(s): " + fmtUSD(t.usd);
      }).join(" · ") + ".</p>");
    if (opt.biggest) {
      var bg = opt.biggest;
      H.push("<h3>Biggest single decision</h3>");
      H.push("<p>" + escHtml(bg.ref) + " on <strong>" + escHtml(bg.model) + "</strong> (" +
        escHtml(bg.platform) + ") costs <strong>" + escHtml(fmtUSD(bg.cost)) + "</strong> (" +
        bg.duration + "s × " + bg.takes + " takes @ $" + bg.usdps.toFixed(3) + "/s" +
        (bg.kind === "usd" ? ' USD <span class="badge">price may move</span>' : "") + ").");
      if (bg.alternative && bg.alternative.model !== bg.model) {
        H.push(" Cheaper alternative meeting the same requirements: <strong>" +
          escHtml(bg.alternative.model) + "</strong> (" + escHtml(bg.alternative.platform) +
          ") at $" + bg.alternative.usdps.toFixed(3) + "/s, saves " +
          escHtml(fmtUSD(bg.saving)) + " on this shot alone.</p>");
      } else {
        H.push(" No cheaper alternative meets this shot's requirements, it is already the floor.</p>");
      }
    }
    H.push("<h3>Per-shot substitutions (cheapest viable)</h3>");
    H.push('<div class="table-scroll"><table><caption>Requirement match is explicit per shot.</caption>' +
      "<thead><tr><th scope=\"col\">Shot</th><th scope=\"col\">Needs</th><th scope=\"col\">Balanced pick</th>" +
      "<th scope=\"col\">Cheapest viable</th><th scope=\"col\">Saving</th><th scope=\"col\">Requirement match</th>" +
      "</tr></thead><tbody>");
    opt.perShot.forEach(function (s) {
      function cell(e) {
        if (!e) return "…";
        return "<strong>" + escHtml(e.model) + "</strong><br><span class=\"meta\">$" +
          e.usdps.toFixed(3) + "/s" + (e.kind === "usd" ? " USD" : "") + "</span>" +
          (e.priceMayMove ? ' <span class="badge">price may move</span>' : "");
      }
      var match = s.cheapest
        ? escHtml(optResLabel(s.cheapest.res)) + (s.cheapest.resInferred ? " (inferred)" : "") +
          " ≥ " + escHtml(optResLabel(s.reqRes)) + "; audio " + (s.needsAudio
            ? (s.cheapest.audio ? "✓ native" : "✗ MISSING") : "not needed")
        : "no eligible model";
      H.push("<tr><td>" + escHtml(s.ref) + "</td><td>" + (s.needsAudio ? "dialogue" : "…") +
        "</td><td>" + cell(s.balanced) + "</td><td>" + cell(s.cheapest) + "</td><td><strong>" +
        (s.saving !== null ? escHtml(fmtUSD(s.saving)) : "…") + "</strong></td><td>" + match + "</td></tr>");
    });
    H.push("</tbody></table></div>");
    if (opt.ineligible.length) {
      H.push("<p><strong>Not eligible</strong> at the " + escHtml(optResLabel(opt.resBar)) +
        " bar (honest floor, never assumed): " + opt.ineligible.map(function (x) {
          return escHtml(x.model) + " (" + escHtml(x.reason) + ")";
        }).join("; ") + ".</p>");
    }
    if (opt.unpriced.length) {
      H.push("<p><strong>No published rate, verify live:</strong> " +
        opt.unpriced.map(escHtml).join(", ") + ".</p>");
    }
    if (opt.verifyLive.length) {
      H.push('<p><span class="badge">price may move</span> picks (USD/API billing, verify live before budgeting): ' +
        opt.verifyLive.map(escHtml).join(", ") + ".</p>");
    }
    H.push('<p class="meta">Rank notes (best-rated mode): Gemini Omni (Arena T2V leader, 1512 pts) → ' +
      "FLUX 3 Video (Arena T2V #2, 1496) → MiniMax H3 (top-3 in earlier reports, verify live) → " +
      "Seedance 2.5 (Arena I2V leader Sept 2026, single-source) → Grok Imagine Video 1.5 " +
      "(topped I2V arena at launch, third-party) → Kling 3.0 (Artificial Analysis T2V #12, Sept 2026, single-source). " +
      "Boards and dates differ, indicative, not apples-to-apples.</p>");
    return H.join("\n");
  }

  /* ---- Studio 3.0: the Shot Refinery ---------------------------------------
     Per-shot prompt refinement loop. The five fields are the documented
     five-field shot spec from the Gaudette build (wave-31 teardown
     gaudette-mother-could-love: character design, camera movement, colour
     palette, emotional register, visual grammar), the structure a documented
     solo production used to keep eight minutes of AI footage coherent.
     Refining changes WORDS only: the shot's model, duration, and take count
     never move, so budget and schedule are byte-identical before and after.
     Pure engine (no DOM); the browser dialog lives further below. */

  var REFINERY_FIELDS = [
    { key: "character", label: "Character design",
      help: "Who is in frame, the lockable visual facts (face, hair, costume, distinguishing marks). Overrides the [SUBJECT] slot." },
    { key: "camera", label: "Camera movement", kind: "movement",
      help: "One move from the guide's camera lexicon, the documented build specs exactly one move per shot. Empty keeps the template's move." },
    { key: "palette", label: "Colour palette",
      help: "The grade in words, dominant hues, contrast, temperature. Overrides the [LIGHT] slot." },
    { key: "register", label: "Emotional register",
      help: "What the shot should feel like, one emotion, named plainly." },
    { key: "grammar", label: "Visual grammar",
      help: "Framing and composition, shot size, angle, where the eye lands." }
  ];

  /* The slot map fillPrompt applies, exposed so the refinery can read and
     override the exact values the engine used. */
  function slotFills(tmpl, genre, tier) {
    return {
      SUBJECT: "the protagonist",
      "SUBJECT A": "the lead",
      "SUBJECT B": "the co-lead",
      ENV: genre.env,
      LIGHT: genre.light,
      STYLE: genre.style + ", " + (tier === "draft"
        ? "draft pass, loose, fast, coverage first"
        : "festival grade, color-locked, cinematic")
    };
  }

  /* Initial field values for a shot: what the engine actually put in the
     prompt (character, palette); blanks where the filmmaker decides. */
  function refineryInit(shot, genre, tier) {
    var fills = slotFills(null, genre, tier);
    return {
      character: fills.SUBJECT,
      camera: "",
      palette: fills.LIGHT,
      register: "",
      grammar: ""
    };
  }

  /* Trim + validate. movements = [{id, move}] from camera-movements.json, or
     null when the lexicon hasn't loaded (the camera check is then skipped). */
  function validateRefineryFields(fields, movements) {
    var ids = {};
    (movements || []).forEach(function (m) { ids[m.id] = m.move || m.id; });
    var out = {};
    REFINERY_FIELDS.forEach(function (f) {
      var v = String(fields[f.key] == null ? "" : fields[f.key]).trim();
      if (f.kind === "movement" && v && movements && !ids[v]) {
        throw new Error("unknown camera movement: " + v);
      }
      out[f.key] = v;
    });
    return out;
  }

  /* Rebuild the shot's prompt from its template with the filmmaker's slot
     overrides, then append the five-field spec as an explicit direction
     block. Deterministic: same template + fields -> same prompt. */
  function buildRefinedPrompt(tmpl, genre, tier, fields, movements) {
    var clean = validateRefineryFields(fields, movements);
    var overrides = {};
    if (clean.character) {
      overrides.SUBJECT = clean.character;
      overrides["SUBJECT A"] = clean.character;
    }
    if (clean.palette) overrides.LIGHT = clean.palette;
    var base = fillPrompt(tmpl, genre, tier, overrides);
    var ids = {};
    (movements || []).forEach(function (m) { ids[m.id] = m.move || m.id; });
    var spec = [];
    REFINERY_FIELDS.forEach(function (f) {
      var v = clean[f.key];
      if (!v) return;
      if (f.kind === "movement" && ids[v]) v = ids[v] + " (" + v + ")";
      spec.push(f.label + ": " + v);
    });
    var text = base.text;
    if (spec.length) text += "\n\nRefinement, five-field spec: " + spec.join(" · ");
    return { text: text, unfilled: base.unfilled, fields: clean };
  }

  /* Address a shot inside a built plan. ref = { episode: null|number, index }. */
  function findRefinedShots(plan, ref) {
    var list = plan.shots;
    if (ref.episode != null) {
      var ep = (plan.episodes || []).filter(function (e) { return e.episode === ref.episode; })[0];
      if (!ep) throw new Error("unknown episode: " + ref.episode);
      list = ep.shots;
    }
    if (!list || ref.index < 0 || ref.index >= list.length) {
      throw new Error("unknown shot index: " + ref.index);
    }
    return list[ref.index];
  }

  /* Write a refined prompt back into a built plan. Keeps the full round
     history on the shot; the generated prompt is kept once as
     shot.originalPrompt so "restore original" is always possible. */
  function refineShotInPlan(plan, ref, newPrompt, fields) {
    var shot = findRefinedShots(plan, ref);
    if (!shot.originalPrompt) shot.originalPrompt = shot.prompt;
    var clean = validateRefineryFields(fields, null);
    var entry = {
      round: (shot.refinements || []).length + 1,
      at: new Date().toISOString(),
      fields: clean,
      prompt: String(newPrompt)
    };
    shot.refinements = (shot.refinements || []).concat([entry]);
    shot.prompt = entry.prompt;
    shot.refined = true;
    return entry;
  }

  /* Revert a shot to its generated prompt. History stays on the shot;
     exports only list shots currently marked refined. */
  function revertRefinement(plan, ref) {
    var shot = findRefinedShots(plan, ref);
    if (!shot.originalPrompt) throw new Error("shot was never refined");
    var entry = {
      round: (shot.refinements || []).length + 1,
      at: new Date().toISOString(),
      reverted: true,
      fields: {},
      prompt: shot.originalPrompt
    };
    shot.refinements = (shot.refinements || []).concat([entry]);
    shot.prompt = shot.originalPrompt;
    shot.refined = false;
    return entry;
  }

  /* Every currently-refined shot, for the packet exports. */
  function planRefinements(plan) {
    var out = [];
    function walk(prefix, shots) {
      (shots || []).forEach(function (s) {
        if (s.refined) out.push({ ref: prefix + "Shot " + s.n, shot: s });
      });
    }
    if (plan.episodes) {
      plan.episodes.forEach(function (ep) { walk("E" + ep.episode + " · ", ep.shots); });
    } else {
      walk("", plan.shots);
    }
    return out;
  }

  function refinementsToMarkdown(plan) {
    var refs = planRefinements(plan);
    if (!refs.length) return "";
    var L = ["## Shot refinements", "",
      "Per-shot prompt refinements from the Studio's Shot Refinery. The five-field spec " +
      "(character design, camera movement, colour palette, emotional register, visual grammar) " +
      "is the structure of the documented Gaudette build, see the guide's Teardowns page. " +
      "Refining changes words only: model, duration, and take counts are untouched, so the " +
      "budget and schedule still hold.", ""];
    refs.forEach(function (r) {
      var s = r.shot;
      L.push("### " + r.ref + ", refined ×" + (s.refinements || []).length);
      L.push("");
      (s.refinements || []).forEach(function (e) {
        if (e.reverted) {
          L.push("- Round " + e.round + " (" + e.at + "): reverted to the generated prompt");
          return;
        }
        var bits = [];
        REFINERY_FIELDS.forEach(function (f) {
          if (e.fields[f.key]) bits.push(f.label + ": " + e.fields[f.key]);
        });
        L.push("- Round " + e.round + " (" + e.at + "): " + (bits.join("; ") || "prompt edit"));
      });
      L.push("");
      L.push("Final prompt:");
      L.push("");
      L.push("```");
      L.push(s.prompt);
      L.push("```");
      L.push("");
    });
    return L.join("\n");
  }

  function refinementsToHtml(plan) {
    var refs = planRefinements(plan);
    if (!refs.length) return "";
    var H = ["<h2>Shot refinements</h2>",
      "<p>Per-shot prompt refinements from the Studio's Shot Refinery (five-field spec: " +
      "character design, camera movement, colour palette, emotional register, visual grammar, " +
      "the structure of the documented Gaudette build). Refining changes words only: model, " +
      "duration, and take counts are untouched, so the budget and schedule still hold.</p>"];
    refs.forEach(function (r) {
      var s = r.shot;
      H.push('<div class="shot"><h3>' + escHtml(r.ref) + ", refined ×" +
        (s.refinements || []).length + "</h3><ul>");
      (s.refinements || []).forEach(function (e) {
        if (e.reverted) {
          H.push("<li>Round " + e.round + " (" + escHtml(e.at) + "): reverted to the generated prompt</li>");
          return;
        }
        var bits = [];
        REFINERY_FIELDS.forEach(function (f) {
          if (e.fields[f.key]) bits.push(escHtml(f.label) + ": " + escHtml(e.fields[f.key]));
        });
        H.push("<li>Round " + e.round + " (" + escHtml(e.at) + "): " +
          (bits.join("; ") || "prompt edit") + "</li>");
      });
      H.push("</ul><pre>" + escHtml(s.prompt) + "</pre></div>");
    });
    return H.join("\n");
  }

  /* ---- Studio 3.0: plan sharing ---------------------------------------------
     Export a saved plan as portable JSON; import validates the shape before
     it touches the saved-plan list. Nothing is uploaded anywhere, the file
     is the share mechanism. */

  var PLAN_SHARE_FORMAT = "afg-studio-plan";
  var PLAN_SHARE_V = 1;

  function exportPlanData(saved) {
    return JSON.stringify({
      format: PLAN_SHARE_FORMAT,
      v: PLAN_SHARE_V,
      exportedAt: new Date().toISOString(),
      studio: "3.0",
      name: saved.name,
      kind: saved.kind,
      input: saved.input,
      plan: saved.plan
    }, null, 2);
  }

  function importPlanData(text) {
    var d;
    try { d = JSON.parse(text); }
    catch (e) { return { ok: false, error: "Not valid JSON, paste the complete exported plan." }; }
    if (!d || d.format !== PLAN_SHARE_FORMAT) {
      return { ok: false, error: "Not a Studio plan export (the format tag is missing)." };
    }
    if (d.v !== PLAN_SHARE_V) {
      return { ok: false, error: "Unsupported plan version " + d.v + ", this Studio reads v1." };
    }
    var kind = d.kind === "series" ? "series"
      : d.kind === "microdrama" ? "microdrama"
      : d.kind === "film" ? "film" : null;
    if (!kind) return { ok: false, error: "Unknown plan kind: " + d.kind + "." };
    if (!d.input || typeof d.input !== "object") {
      return { ok: false, error: "The export has no plan input." };
    }
    if (!d.plan || typeof d.plan !== "object") {
      return { ok: false, error: "The export has no plan data." };
    }
    if (kind === "film" && !Array.isArray(d.plan.shots)) {
      return { ok: false, error: "This film export has no shot list." };
    }
    if (kind === "series" && !Array.isArray(d.plan.episodes)) {
      return { ok: false, error: "This series export has no episodes." };
    }
    if (kind === "microdrama" && !d.plan.budget) {
      return { ok: false, error: "This microdrama export has no budget." };
    }
    return {
      ok: true,
      saved: {
        name: String(d.name || "Imported plan"),
        savedAt: new Date().toISOString(),
        kind: kind,
        input: d.input,
        plan: d.plan
      }
    };
  }

  /* DOM addressing for a shot card (pure string, so tests can assert it). */
  function shotRefAttrs(ref) {
    return 'data-st3-ep="' + (ref.episode == null ? "" : ref.episode) +
      '" data-st3-idx="' + ref.index + '"';
  }

  /* The per-shot "Refine shot" button (pure HTML, so tests can assert it). */
  function refineButtonHtml() {
    return '<button type="button" class="btn btn-sm btn-ghost st3-refine">Refine shot</button>';
  }

  var StudioEngine = {
    USD_PER_CREDIT: USD_PER_CREDIT,
    GENRES: GENRES, RUNTIMES: RUNTIMES, TIERS: TIERS,
    SERIES_FORMATS: SERIES_FORMATS, SERIES_CHECKLIST: SERIES_CHECKLIST,
    fnv1a: fnv1a, mulberry32: mulberry32, seededShuffle: seededShuffle,
    costPerSec: costPerSec, costPerImage: costPerImage, normName: normName,
    resolveModel: resolveModel,
    shotCountFor: shotCountFor, chooseTemplates: chooseTemplates,
    slotFills: slotFills, fillPrompt: fillPrompt, pickModel: pickModel,
    REFINERY_FIELDS: REFINERY_FIELDS, refineryInit: refineryInit,
    validateRefineryFields: validateRefineryFields,
    buildRefinedPrompt: buildRefinedPrompt,
    findRefinedShots: findRefinedShots, refineShotInPlan: refineShotInPlan,
    revertRefinement: revertRefinement, planRefinements: planRefinements,
    refinementsToMarkdown: refinementsToMarkdown,
    refinementsToHtml: refinementsToHtml,
    PLAN_SHARE_FORMAT: PLAN_SHARE_FORMAT, PLAN_SHARE_V: PLAN_SHARE_V,
    exportPlanData: exportPlanData, importPlanData: importPlanData,
    shotRefAttrs: shotRefAttrs, refineButtonHtml: refineButtonHtml,
    buildPlan: buildPlan, planToMarkdown: planToMarkdown,
    seriesBible: seriesBible, buildSeriesPlan: buildSeriesPlan,
    seriesToMarkdown: seriesToMarkdown, seriesToHtml: seriesToHtml, fmtUSD: fmtUSD,
    MICRO: MICRO, clipCountFor: clipCountFor,
    cheapestPricedVideo: cheapestPricedVideo,
    cheapestPricedImage: cheapestPricedImage,
    buildMicrodramaPlan: buildMicrodramaPlan,
    microdramaToMarkdown: microdramaToMarkdown,
    modelRateOptions: modelRateOptions, rateAtRes: rateAtRes,
    modelDocMaxRes: modelDocMaxRes, modelMaxClipSec: modelMaxClipSec,
    optAudioCapable: optAudioCapable, rankOfModel: rankOfModel,
    optEligiblePool: optEligiblePool, optimizePlan: optimizePlan,
    optimizeToMarkdown: optimizeToMarkdown, optimizeToHtml: optimizeToHtml
  };

  /* node unit tests (scripts/studio.test.js) */
  if (typeof module !== "undefined" && module.exports) {
    module.exports = StudioEngine;
    return;
  }

  /* ---- browser UI ---------------------------------------------------------
     The engine is exposed on window so sibling tools (the Green Light page)
     can build plans without duplicating logic. init() below still guards on
     #st-title, so loading studio.js on other pages is inert. */
  if (typeof window !== "undefined") window.StudioEngine = StudioEngine;
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
      mdPanel: document.getElementById("st-micro-panel"),
      mdEps: document.getElementById("st-md-eps"),
      mdMin: document.getElementById("st-md-min"),
      mdRegens: document.getElementById("st-md-regens"),
      eps: document.getElementById("st-eps"),
      epRuntime: document.getElementById("st-epruntime"),
      castList: document.getElementById("st-cast-list"),
      castAdd: document.getElementById("st-cast-add"),
      locations: document.getElementById("st-locations"),
      presetNote: document.getElementById("st-preset-note"),
      dlMd: document.getElementById("st-dl-md"),
      dlHtml: document.getElementById("st-dl-html"),
      importMsg: document.getElementById("st-import-msg"),
      optSec: document.getElementById("st-optimize-sec"),
      optRes: document.getElementById("st-opt-res"),
      optAudio: document.getElementById("st-opt-audio"),
      optAudioOut: document.getElementById("st-opt-audio-out"),
      optRun: document.getElementById("st-opt-run"),
      optBody: document.getElementById("st-opt-body")
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
    var isMicro = kind === "microdrama";
    e.seriesPanel.hidden = !isSeries;
    e.runtimeFieldset.hidden = isSeries || isMicro;
    if (e.mdPanel) e.mdPanel.hidden = !isMicro;
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
      e.presetNote.textContent = f.label + ": " + f.band[0] + "-" + f.band[1] +
        "s per episode · " + f.beats + " beats/episode · hook: " + f.hookStyle + ". " + f.voiceRule;
      e.generate.textContent = "Build my series packet";
    } else if (isMicro) {
      e.generate.textContent = "Plan my microdrama run";
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
    var b = null;
    try { b = JSON.parse(raw); } catch (err) { return null; }
    /* only claim the payload when it is actually a series bridge, a prompt
       bridge from the library must survive for consumePromptBridge */
    if (!b || b.v !== 1 || b.kind !== "series") return null;
    try { localStorage.removeItem(BRIDGE_KEY); } catch (err) { /* ignore */ }
    return b;
  }

  /* Prompt library → Studio bridge (wave 25): a "Send to Studio" click stages
     one template as a shot-prompt starting point. The Studio consumes the
     payload once and shows a dismissible banner above the concept form with
     the template text and a copy button, it never overwrites the user's
     own title/logline. Nothing leaves the browser. */
  function consumePromptBridge() {
    var raw = null;
    try { raw = localStorage.getItem(BRIDGE_KEY); } catch (err) { /* ignore */ }
    if (!raw) return null;
    var b = null;
    try { b = JSON.parse(raw); } catch (err) { return null; }
    if (!b || b.v !== 1 || b.kind !== "prompt") return null;
    try { localStorage.removeItem(BRIDGE_KEY); } catch (err) { /* ignore */ }
    return b;
  }

  function applyPromptBridge(b) {
    var e = els();
    var host = document.getElementById("st-prompt-msg");
    if (!host) return;
    var layers = (b.layers || []).map(function (l) { return esc(l); }).join(", ");
    host.innerHTML =
      "<p><strong>Sent from the Prompt library:</strong> " + esc(b.title || b.templateId || "template") +
      (b.templateId ? ' <span class="st-tid">' + esc(b.templateId) + "</span>" : "") + "</p>" +
      (layers ? '<p class="st-note">Anatomy layers demonstrated: ' + layers + "</p>" : "") +
      '<pre class="st-prompt" tabindex="0">' + esc(b.prompt || "") + "</pre>" +
      '<div class="btn-row">' +
      '<button type="button" class="btn btn-sm btn-gold" id="st-prompt-copy">Copy prompt</button>' +
      '<button type="button" class="btn btn-sm btn-ghost" id="st-prompt-dismiss">Dismiss</button>' +
      "</div>" +
      '<p class="st-note">Paste it into your shot list or logline draft below, this is a starting point, not a plan.</p>';
    host.hidden = false;
    var copyBtn = document.getElementById("st-prompt-copy");
    if (copyBtn) copyBtn.addEventListener("click", function () {
      var done = function () {
        copyBtn.textContent = "Copied ✓";
        setTimeout(function () { copyBtn.textContent = "Copy prompt"; }, 1500);
      };
      var txt = b.prompt || "";
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(done, done);
      } else { done(); }
    });
    var dismissBtn = document.getElementById("st-prompt-dismiss");
    if (dismissBtn) dismissBtn.addEventListener("click", function () {
      host.hidden = true;
      host.innerHTML = "";
    });
    announce("Prompt template “" + (b.title || b.templateId || "") +
      "” staged from the library. Copy it or dismiss it above the concept form.");
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

  function shotCard(s, ref) {
    ref = ref || { episode: null, index: 0 };
    var unfilled = s.unfilled.length
      ? '<p class="st-note"><strong>Fill before generating:</strong> ' +
        s.unfilled.map(esc).join(", ") + "</p>"
      : "";
    var fallback = s.modelFallback
      ? ' <span class="st-badge">fallback pick, template\u2019s models unresolved in models.json</span>'
      : "";
    var rbadge = s.refined
      ? ' <span class="st-badge" data-st3-rbadge="1">refined ×' + (s.refinements || []).length + "</span>"
      : "";
    return '<article class="card st-shot" ' + shotRefAttrs(ref) + ' aria-label="Shot ' + s.n + '">' +
      "<h4>Shot " + s.n + ", " + esc(s.act) + " · " + esc(s.templateTitle) +
      ' <span class="st-tid">(' + esc(s.templateId) + ")</span></h4>" +
      '<p class="st-meta">' + s.duration + "s · " +
      "<strong>" + esc(s.model || "unpriced, verify live") + "</strong>" +
      (s.platform ? " · " + esc(s.platform) : "") +
      (s.cps !== null ? " · " + s.cps.toFixed(2) + " credits/s" : "") + fallback + "</p>" +
      '<p class="st-anatomy">Anatomy: ' + esc(s.anatomy) +
      ' <span class="st-track">(' + esc(s.track) + " track)</span></p>" +
      '<pre class="st-prompt" tabindex="0">' + esc(s.prompt) + "</pre>" +
      unfilled +
      '<p>' + refineButtonHtml() + rbadge +
      ' <a class="btn btn-sm btn-ghost" href="workshop.html?template=' +
      encodeURIComponent(s.templateId) + '">Refine in the workshop</a></p>' +
      "</article>";
  }

  function render(plan) {
    var e = els();
    var inp = plan.input;
    var shotsHtml = '<div class="st3-shots">' + plan.shots.map(function (s, i) {
      return shotCard(s, { episode: null, index: i });
    }).join("") + "</div>";

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
      plan.dataMeta.templateCount + " templates), update the data, not this page.</p>" +
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
      "and consistency fixes multiply the clean cost 5 to 20×. Budget the envelope, not the clean run. " +
      "All rates are third-party estimates (Oct 2026) at $0.0392/credit, verify live before spending.</p>" +
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
      " shooting days.</strong> Stills before generation, generation before assembly, " +
      "the long-form chapter's assets-before-shots rule.</p>" +
      "</section>";
    afterPacketRender();
    e.actions.hidden = false;
    e.dlHtml.hidden = true;
    showOptimize();
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
      "<h3>Series bible, locked before generation</h3>" +
      '<p class="st-note">The prompt DNA below is prepended verbatim to every shot prompt ' +
      "in every episode. It never changes mid-series, this is the consistency engine.</p>" +
      '<pre class="st-prompt" tabindex="0">' + esc(b.dnaLines.join("\n")) + "</pre>" +
      "<h4>Locked assets (" + b.lockedAssets.length + ", plates generated ONCE)</h4>" +
      "<ul>" + b.lockedAssets.map(function (a) {
        return "<li><strong>" + esc(a.kind) + ":</strong> " + esc(a.name || "unnamed") +
          (a.anchor ? ", " + esc(a.anchor) : "") +
          (a.voice ? ' <span class="st-badge">voice: ' + esc(a.voice) + "</span>" : "") + "</li>";
      }).join("") + "</ul>" +
      '<p class="st-note"><strong>Format rules, ' + esc(b.formatLabel) + ":</strong> " +
      esc(b.arcStyle) + ". Hook: " + esc(b.hookStyle) + ".<br>" + esc(b.voiceRule) + "</p>" +
      "</article>";

    var epsHtml = plan.episodes.map(function (ep) {
      var a = ep.arc;
      var arcHtml =
        '<div class="st-anatomy"><strong>Emotion:</strong> ' + esc(a.emotion) +
        ' <span class="st-track">(~' + ep.voiceBudgetSec + "s voice budget" +
        (a.skeleton ? ' · skeleton, edit before generating' : "") + ")</span><br>" +
        "<strong>Stake:</strong> " + esc(a.stake) + "<br>" +
        "<strong>Hook:</strong> " + esc(a.hook) + "<br>" +
        "<strong>Turn:</strong> " + esc(a.turn) + "<br>" +
        "<strong>Cliffhanger:</strong> " + esc(a.cliff) + "</div>";
      var shotsHtml = '<div class="st3-shots">' + ep.shots.map(function (s, i) {
        return shotCard(s, { episode: ep.episode, index: i });
      }).join("") + "</div>";
      return "<section aria-label=\"Episode " + ep.episode + "\">" +
        "<h3>Episode " + ep.episode + ", " + ep.shotCount + " shots × " +
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
      "Computed live from <code>models.json</code> and <code>prompt-templates.json</code>, " +
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
      "generated once instead of per episode, ≈" + plan.reuse.avoidedCredits + " credits (≈" +
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
    afterPacketRender();
    e.actions.hidden = false;
    e.dlHtml.hidden = false;
    showOptimize();
    document.getElementById("st-packet-h").focus({ preventScroll: false });
    var smooth = typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    e.results.scrollIntoView({ block: "start", behavior: smooth });
  }

  /* ---------------- cost optimizer panel -----------------------------------
     "Optimize cost", runs optimizePlan against the current packet and
     renders the four budget modes, where-the-money-goes, the biggest
     decision, and per-shot substitutions. Results are stored on the plan so
     the packet exports (markdown / self-contained HTML) carry them. */

  function optResLabelUi(v) {
    return { 720: "720p", 1080: "1080p", 2160: "4K" }[v] || (v + "p");
  }

  function optEntryCell(e) {
    if (!e) return "<span class=\"quiz-cost-na\">no eligible model</span>";
    return "<strong>" + esc(e.model) + "</strong><br><span class=\"quiz-cost-sub\">" +
      esc(e.platform) + " · $" + e.usdps.toFixed(3) + "/s" +
      (e.kind === "usd" ? " USD" : "") + "</span>" +
      (e.priceMayMove ? ' <span class="st-badge">price may move</span>' : "");
  }

  function optModeDelta(b, x) {
    if (x === null || x === undefined) return "n/a";
    var d = Math.round((b - x) * 100) / 100;
    return (d >= 0 ? "−" : "+") + fmtUSD(Math.abs(d)) +
      (b ? " (" + Math.round(Math.abs(d) / b * 100) + "%)" : "");
  }

  function renderOptBody(opt) {
    var e = els();
    var b = opt.modes.balanced.total, c = opt.modes.cheapest.total;
    var rOk = opt.modes.bestrated.complete, r = opt.modes.bestrated.total;
    var dfOk = opt.modes.draftfinal.complete, dfT = opt.modes.draftfinal.total;
    var changed = opt.perShot.filter(function (s) {
      return s.balanced && s.cheapest && s.balanced.model !== s.cheapest.model;
    }).length;

    var modeRows =
      "<tr><td><strong>Cheapest viable</strong> <span class=\"quiz-cost-sub\">(floor)</span></td>" +
      "<td><strong>" + fmtUSD(c) + "</strong></td><td>" + optModeDelta(b, c) + "</td>" +
      "<td>" + changed + " of " + opt.shotCount + " shots change model" +
      (opt.verifyLive.length ? '; <span class="st-badge">price may move</span> on ' +
        opt.verifyLive.length + " USD-billed pick(s)" : "") + "</td></tr>" +
      "<tr><td><strong>Balanced</strong> <span class=\"quiz-cost-sub\">(Studio defaults)</span></td>" +
      "<td><strong>" + fmtUSD(b) + "</strong></td><td>…</td>" +
      "<td>The plan's own per-shot picks, re-priced at the " + optResLabelUi(opt.resBar) + " bar.</td></tr>" +
      "<tr><td><strong>Best rated</strong></td>" +
      "<td><strong>" + (rOk ? fmtUSD(r) : "incomplete") + "</strong></td>" +
      "<td>" + optModeDelta(b, rOk ? r : null) + "</td>" +
      "<td>Top documented arena/leaderboard model per shot (boards differ, see rank notes).</td></tr>" +
      "<tr><td><strong>Draft cheap, finish flagship</strong></td>" +
      "<td><strong>" + (dfOk ? fmtUSD(dfT) : "incomplete") + "</strong></td>" +
      "<td>" + optModeDelta(b, dfOk ? dfT : null) + "</td>" +
      "<td>Coverage takes at the cheapest viable rate, the keeper take at the best-rated model.</td></tr>";

    var modelRows = opt.byModel.map(function (g) {
      return "<tr><td><strong>" + esc(g.model) + "</strong><br><span class=\"quiz-cost-sub\">" +
        esc(g.platform) + "</span></td><td>" + g.shots + "</td>" +
        "<td>$" + g.usdps.toFixed(3) + "/s" + (g.kind === "usd" ? " USD" : "") + "</td>" +
        "<td><strong>" + fmtUSD(g.usd) + "</strong></td></tr>";
    }).join("");

    var epRows = opt.byEpisode.map(function (ep) {
      return "<tr><td>" + esc(ep.label) + "</td><td>" + ep.shots + "</td>" +
        "<td><strong>" + fmtUSD(ep.balanced) + "</strong>" +
        (ep.unpriced ? " <span class=\"quiz-cost-na\">(" + ep.unpriced + " unpriced)</span>" : "") +
        "</td></tr>";
    }).join("");

    var takeRows = opt.byTakes.map(function (t) {
      return "<tr><td>" + t.takes + "</td><td><strong>" + fmtUSD(t.usd) + "</strong></td></tr>";
    }).join("");

    var big = "";
    if (opt.biggest) {
      var bg = opt.biggest;
      big = "<h4>Biggest single decision</h4><p>" + esc(bg.ref) + " on <strong>" +
        esc(bg.model) + "</strong> (" + esc(bg.platform) + ") costs <strong>" +
        fmtUSD(bg.cost) + "</strong> (" + bg.duration + "s × " + bg.takes + " takes @ $" +
        bg.usdps.toFixed(3) + "/s" + (bg.kind === "usd" ? " USD" : "") + ")" +
        (bg.kind === "usd" ? ' <span class="st-badge">price may move</span>' : "") + ". ";
      if (bg.alternative && bg.alternative.model !== bg.model) {
        big += "Cheaper alternative meeting the same requirements: <strong>" +
          esc(bg.alternative.model) + "</strong> (" + esc(bg.alternative.platform) +
          ") at $" + bg.alternative.usdps.toFixed(3) + "/s, saves <strong>" +
          fmtUSD(bg.saving) + "</strong> on this shot alone.</p>";
      } else {
        big += "No cheaper alternative meets this shot's requirements, it is already the floor.</p>";
      }
    }

    var shotRows = opt.perShot.map(function (s) {
      var match = s.cheapest
        ? optResLabelUi(s.cheapest.res) + (s.cheapest.resInferred ? " (inferred)" : "") +
          " ≥ " + optResLabelUi(s.reqRes) + "; audio " +
          (s.needsAudio ? (s.cheapest.audio ? "✓ native" : "✗ MISSING") : "not needed")
        : "no eligible model";
      var giveUp = s.giveUp.length
        ? "<br><span class=\"quiz-cost-sub\">Gives up: " + s.giveUp.map(esc).join(" ") + "</span>" : "";
      return "<tr><td>" + esc(s.ref) + "<br><span class=\"quiz-cost-sub\">" +
        (s.needsAudio ? "dialogue" : s.duration + "s") + "</span></td>" +
        "<td>" + optEntryCell(s.balanced) +
        (s.balanced && s.balanced.shortfalls && s.balanced.shortfalls.length
          ? "<br><span class=\"quiz-cost-na\">" + s.balanced.shortfalls.map(esc).join("; ") + "</span>" : "") +
        "</td>" +
        "<td>" + optEntryCell(s.cheapest) + giveUp + "</td>" +
        "<td><strong>" + (s.saving !== null ? fmtUSD(s.saving) : "…") + "</strong></td>" +
        "<td>" + esc(match) + "</td></tr>";
    }).join("");

    var notes = [];
    if (opt.ineligible.length) {
      notes.push("<p><strong>Not eligible</strong> at the " + optResLabelUi(opt.resBar) +
        " bar (honest floor, never assumed): " +
        opt.ineligible.map(function (x) {
          return esc(x.model) + " (" + esc(x.reason) + ")";
        }).join("; ") + ".</p>");
    }
    if (opt.unpriced.length) {
      notes.push("<p><strong>No published rate, verify live:</strong> " +
        opt.unpriced.map(esc).join(", ") + ".</p>");
    }
    if (opt.verifyLive.length) {
      notes.push('<p><span class="st-badge">price may move</span> picks (USD/API billing, verify live ' +
        "before budgeting): " + opt.verifyLive.map(esc).join(", ") + ".</p>");
    }

    e.optBody.innerHTML =
      "<h3 id=\"st-opt-h\" tabindex=\"-1\">Cost optimizer results</h3>" +
      '<p class="calc-note"><strong>Basis:</strong> resolution bar ' +
      optResLabelUi(opt.resBar) + " · " + opt.audioShare +
      "% of shots need native audio (spread evenly) · " + opt.takes +
      " takes per keeper. " + esc(opt.basis) + "</p>" +
      "<h4>Four budget modes</h4>" +
      '<div class="table-scroll"><table><caption>Same shots, three ways to pay for them.</caption>' +
      "<thead><tr><th scope=\"col\">Mode</th><th scope=\"col\">Generation cost</th>" +
      "<th scope=\"col\">Delta vs balanced</th><th scope=\"col\">What changes</th></tr></thead>" +
      "<tbody>" + modeRows + "</tbody></table></div>" +
      "<h4>Where the money goes (balanced mode)</h4>" +
      '<div class="table-scroll"><table><caption>Cost by model.</caption>' +
      "<thead><tr><th scope=\"col\">Model</th><th scope=\"col\">Shots</th>" +
      "<th scope=\"col\">Rate</th><th scope=\"col\">Cost</th></tr></thead>" +
      "<tbody>" + modelRows + "</tbody></table></div>" +
      (epRows ? '<div class="table-scroll"><table><caption>Cost by episode.</caption>' +
        "<thead><tr><th scope=\"col\">Episode</th><th scope=\"col\">Shots</th>" +
        "<th scope=\"col\">Balanced cost</th></tr></thead>" +
        "<tbody>" + epRows + "</tbody></table></div>" : "") +
      '<div class="table-scroll"><table><caption>Take-count leverage.</caption>' +
      "<thead><tr><th scope=\"col\">Takes per keeper</th><th scope=\"col\">Generation cost</th></tr></thead>" +
      "<tbody>" + takeRows + "</tbody></table></div>" +
      '<p class="calc-note">Each take costs <strong>' + fmtUSD(opt.perTake) +
      "</strong> across the plan, cutting takes is the fastest lever after model choice.</p>" +
      big +
      "<details" + (opt.shotCount <= 30 ? " open" : "") + ">" +
      "<summary><strong>Per-shot substitutions (" + opt.shotCount + ")</strong>, cheapest viable " +
      "for every shot, with the explicit requirement match</summary>" +
      '<div class="table-scroll"><table>' +
      "<thead><tr><th scope=\"col\">Shot</th><th scope=\"col\">Balanced pick</th>" +
      "<th scope=\"col\">Cheapest viable</th><th scope=\"col\">Saving</th>" +
      "<th scope=\"col\">Requirement match</th></tr></thead>" +
      "<tbody>" + shotRows + "</tbody></table></div></details>" +
      notes.join("") +
      '<p class="calc-note"><strong>Rank notes</strong> (best-rated mode): Gemini Omni (Arena T2V leader, 1512 pts) → ' +
      "FLUX 3 Video (Arena T2V #2, 1496) → MiniMax H3 (top-3 in earlier reports, verify live) → " +
      "Seedance 2.5 (Arena I2V leader Sept 2026, single-source) → Grok Imagine Video 1.5 " +
      "(topped I2V arena at launch, third-party) → Kling 3.0 (Artificial Analysis T2V #12, Sept 2026, single-source). " +
      "Boards and dates differ, indicative, not apples-to-apples. The packet export now carries this section.</p>";
    document.getElementById("st-opt-h").focus({ preventScroll: false });
  }

  function showOptimize() {
    var e = els();
    if (!e.optSec || !CURRENT) return;
    var tier = CURRENT.kind === "series" ? CURRENT.plan.bible.tier : CURRENT.plan.input.tier;
    var def = tier === "festival" ? "1080" : "720";
    for (var i = 0; i < e.optRes.options.length; i++) {
      if (e.optRes.options[i].value === def) { e.optRes.selectedIndex = i; break; }
    }
    e.optBody.innerHTML = "";
    e.optSec.hidden = false;
  }

  function runOptimizer() {
    var e = els();
    if (!CURRENT || !DATA) return;
    var share = Math.min(100, Math.max(0, parseInt(e.optAudio.value, 10) || 0));
    e.optAudioOut.textContent = share + "%";
    try {
      var opt = optimizePlan(DATA, CURRENT.plan,
        { resBar: parseInt(e.optRes.value, 10), audioShare: share });
      CURRENT.plan.optimizer = opt;
      renderOptBody(opt);
      announce("Cost optimizer done: cheapest viable " + fmtUSD(opt.modes.cheapest.total) +
        " vs balanced " + fmtUSD(opt.modes.balanced.total) + ". The packet export now includes it.");
    } catch (err) {
      e.optBody.innerHTML = '<p class="calc-note" role="alert">Optimizer failed: ' +
        esc(err.message) + "</p>";
    }
  }

  function getPlans() {
    try { return JSON.parse(localStorage.getItem(SAVE_KEY) || "[]"); }
    catch (e) { return []; }
  }

  /* LocalStorage plans: names, kind badge, Load (continue planning),
     Duplicate, Delete, all real buttons, keyboard-operable. Old wave-15
     entries (no kind) are treated as films. */
  function planKind(p) {
    if (p.kind === "microdrama") return "microdrama";
    return p.kind === "series" ? "series" : "film";
  }

  function planMeta(p) {
    var kind = planKind(p);
    if (kind === "microdrama") {
      var i = p.input || {};
      return "Microdrama run · " + (i.episodes || "?") + " eps × " +
        (i.minPerEpisode || "?") + " min · " + (i.tier || "") + " · " +
        ((p.plan && p.plan.budget) ? fmtUSD(p.plan.budget.totalUsd) : "?") + " run";
    }
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
    } else if (kind === "microdrama") {
      var mr = document.querySelector('input[name="st-kind"][value="microdrama"]');
      if (mr) mr.checked = true;
      refreshKindUI();
      f.mdEps.value = inp.episodes || 4;
      f.mdMin.value = inp.minPerEpisode || 1;
      f.mdRegens.value = inp.regensPerEp != null ? inp.regensPerEp : 5;
      CURRENT = { kind: "microdrama", input: inp, plan: p.plan };
      renderMicrodrama(p.plan);
    } else {
      var fr = document.querySelector('input[name="st-kind"][value="film"]');
      if (fr) fr.checked = true;
      refreshKindUI();
      var rt = document.querySelector('input[name="st-runtime"][value="' + (inp.runtimeSec || 120) + '"]');
      if (rt) rt.checked = true;
      CURRENT = { kind: "film", input: inp, plan: p.plan };
      render(p.plan);
    }
    announce("Plan “" + p.name + "” loaded, continue planning.");
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
        '<button type="button" class="btn btn-sm btn-ghost" data-share="' + i + '">Share</button> ' +
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

  /* ---------------- microdrama mode (Studio 2.5) --------------------------- */
  function readMicroInput() {
    var e = els();
    var tier = document.querySelector('input[name="st-tier"]:checked');
    return {
      title: e.title.value.trim(),
      logline: e.logline.value.trim(),
      episodes: Math.max(1, Math.min(MICRO.maxEpisodes,
        parseInt(e.mdEps.value, 10) || 4)),
      minPerEpisode: Math.max(MICRO.minEpMin, Math.min(MICRO.maxEpMin,
        parseFloat(e.mdMin.value) || 1)),
      tier: tier ? tier.value : "draft",
      regensPerEp: Math.max(0, Math.min(MICRO.maxRegensPerEp,
        parseFloat(e.mdRegens.value) || 0))
    };
  }

  /* Episode-planner "Send run to Studio" → Studio microdrama mode. The
     planner stages {v:1, kind:"microdrama", episodes, minPerEpisode,
     seriesTitle, logline} in the same bridge key; the series consumer
     ignores non-"series" payloads, so the two bridges coexist. */
  function consumeMicrodramaBridge() {
    var raw = null;
    try { raw = localStorage.getItem(BRIDGE_KEY); } catch (err) { /* ignore */ }
    if (!raw) return null;
    var b = null;
    try { b = JSON.parse(raw); } catch (err) { return null; }
    if (!b || b.v !== 1 || b.kind !== "microdrama") return null;
    try { localStorage.removeItem(BRIDGE_KEY); } catch (err) { /* ignore */ }
    return b;
  }

  function applyMicrodramaBridge(b) {
    var e = els();
    var radio = document.querySelector('input[name="st-kind"][value="microdrama"]');
    if (radio) radio.checked = true;
    refreshKindUI();
    if (b.seriesTitle) e.title.value = b.seriesTitle;
    if (b.logline) e.logline.value = b.logline;
    if (b.episodes) {
      e.mdEps.value = Math.max(1, Math.min(MICRO.maxEpisodes,
        parseInt(b.episodes, 10) || 4));
    }
    if (b.minPerEpisode) {
      e.mdMin.value = Math.max(MICRO.minEpMin, Math.min(MICRO.maxEpMin,
        parseFloat(b.minPerEpisode) || 1));
    }
    announce("Planner run staged into microdrama mode: " +
      (b.episodes || "?") + " episodes × " + (b.minPerEpisode || "?") +
      " min/episode. Review the inputs, then press “Plan my microdrama run”.");
  }

  function renderMicrodrama(plan) {
    var e = els();
    var inp = plan.input;
    var b = plan.budget;

    var rateCell = plan.rate
      ? plan.rate.cps.toFixed(2) + " credits/s (" + esc(plan.rate.model) + ")"
      : "no priced video model";
    var imgCell = plan.img
      ? plan.img.cpi + " credits/regen (" + esc(plan.img.model) + ")"
      : "no priced image model";

    e.results.innerHTML =
      '<section aria-labelledby="st-run-h">' +
      '<p class="st-kicker">Microdrama run plan · Studio 2.5 · plan seed <code>' +
      esc(plan.seed) + "</code> · deterministic: same inputs, same plan</p>" +
      '<h2 id="st-run-h" tabindex="-1">' + esc(inp.title) + "</h2>" +
      (inp.logline ? '<p class="lede">' + esc(inp.logline) + "</p>" : "") +
      '<p class="calc-note"><strong>Economics-only planner</strong>, no shot ' +
      "list, no per-shot model picks. The run's clip budget, cost envelope, " +
      "and timeline from the documented $150-microdrama figures (TheWrap / " +
      "Sixth Tone, June 2026). Every number carries its documented basis " +
      "below; model rates are third-party estimates, <strong>verify live</strong> " +
      "before spending.</p>" +
      "<h3>Clip budget</h3>" +
      '<div class="table-scroll"><table><caption>Generation happens in 10 to 15s ' +
      "clips, StoReel Canvas's documented unit.</caption>" +
      "<thead><tr><th scope=\"col\"></th><th scope=\"col\">Per episode</th>" +
      "<th scope=\"col\">Whole run (" + plan.episodes + " episodes)</th></tr></thead><tbody>" +
      "<tr><td>Runtime</td><td>" + plan.runtimeSec + "s</td><td>" +
      plan.totalMinutes + " min finished</td></tr>" +
      "<tr><td>Clips (10 to 15s each)</td><td><strong>" + plan.clipsPerEp.lo +
      "" + plan.clipsPerEp.hi + "</strong></td><td><strong>" +
      plan.totalClips.lo + "-" + plan.totalClips.hi + "</strong></td></tr>" +
      "</tbody></table></div>" +
      '<p class="calc-note">' + esc(plan.storeelClipCheck) +
      " One page of dialogue ≈ one minute ≈ one episode (TheWrap's industry survey).</p>" +
      "<h3>Run budget</h3>" +
      '<div class="table-scroll"><table><caption>Every line shows its math and its documented basis.</caption>' +
      "<thead><tr><th scope=\"col\">Line item</th><th scope=\"col\">Math</th>" +
      "<th scope=\"col\">Cost</th><th scope=\"col\">Documented basis</th></tr></thead><tbody>" +
      "<tr><td>Documented benchmark</td><td class=\"st-math\">$50/min × " +
      plan.totalMinutes + " min</td><td><strong>" + fmtUSD(plan.benchmarkTotal) +
      "</strong></td><td class=\"st-note\">TheWrap's reported AI-series rate " +
      "(~$150 for 4 one-minute episodes ≈ $37.50/ep). One platform's rate " +
      "card, one experiment, the benchmark to beat, not a promise.</td></tr>" +
      "<tr><td>Generation (" + plan.takes + "× retakes)</td><td class=\"st-math\">" +
      plan.genSecTotal + "s × " + esc(rateCell) + "</td><td><strong>" +
      (plan.rate ? fmtUSD(b.genUsdTotal) : "verify live") + "</strong></td>" +
      "<td class=\"st-note\">" + plan.takes + "× = the " +
      esc(inp.tierLabel.toLowerCase()) + " end of Qidian's 3 to 5 “drawing cards” " +
      "retake range (Sixth Tone). Rate = the cheapest priced video model in " +
      "`models.json`, the generation floor, verify live.</td></tr>" +
      "<tr><td>Character-regen reserve</td><td class=\"st-math\">" +
      b.regenCount + " regens × " + esc(imgCell) + "</td><td><strong>" +
      (plan.img ? fmtUSD(b.regenUsdTotal) : "verify live") + "</strong></td>" +
      "<td class=\"st-note\">StoReel paid for regenerations when faces drifted; " +
      "no per-episode figure was published, the count (" + inp.regensPerEp +
      "/ep) is your budget guess, priced at the cheapest image-model rate.</td></tr>" +
      "<tr><td><strong>Plan total</strong></td><td class=\"st-math\">generation + " +
      "regen reserve</td><td><strong>" + fmtUSD(b.totalUsd) + "</strong> (" +
      fmtUSD(b.perEpUsd) + "/ep, " + fmtUSD(plan.perMinPlan) + "/min)</td>" +
      "<td class=\"st-note\">Your plan's per-minute cost vs the $50/min benchmark.</td></tr>" +
      "<tr><td>Live-action context</td><td class=\"st-math\">$2,000/min × " +
      plan.totalMinutes + " min</td><td>" + fmtUSD(plan.liveActionRef) +
      "</td><td class=\"st-note\">TheWrap's reported typical live-action " +
      "microseries figure. Context, not a quote.</td></tr>" +
      "<tr><td>PUGC revenue context</td><td class=\"st-math\">$150/min × " +
      plan.totalMinutes + " min</td><td>" + fmtUSD(plan.pugcRef) +
      "</td><td class=\"st-note\">StoReel's reported payout rate for creator " +
      "series it designates. Platform-specific, not revenue you can count on.</td></tr>" +
      "</tbody></table></div>" +
      (plan.viduRef
        ? '<p class="calc-note">Reference pricing (not used in the math): <strong>Vidu Q4 Preview</strong>, ' +
          esc(plan.viduRef) + " (PR Newswire, preview pricing, verify live).</p>"
        : "") +
      "<h3>Timeline</h3>" +
      '<p class="calc-note"><strong>' + plan.timelineDays + " day" +
      (plan.timelineDays === 1 ? "" : "s") +
      "</strong> at the documented pace, ≈7 episodes/week. " +
      esc(plan.paceNote) + "</p>" +
      "<h3>Documented production economics (benchmarks, not predictions)</h3>" +
      '<p class="calc-note">StoReel Canvas “Off Campus” experiment (TheWrap, June 2026): ' +
      "4 one-minute AI episodes in 4 days for ~$150 in credits (≈$37.50/episode); " +
      "AI series generation ≈$50/min vs live-action ≈$2,000/min; 146 clips of " +
      "10 to 15s for a 30-episode storyboard; character regenerations paid when " +
      "faces drifted. StoReel's PUGC payout rate: ≈$150/min for creator series it " +
      "designates. Qidian Interactive's AI studio (Sixth Tone, June 2026): 3 to 5 " +
      "retakes per usable shot (“drawing cards”). Full teardown: " +
      "`storeel-off-campus`, <a href=\"teardown.html\">read it shot by shot →</a>.</p>" +
      "</section>";
    afterPacketRender();
    e.actions.hidden = false;
    e.dlHtml.hidden = true;
    e.optSec.hidden = true;
    document.getElementById("st-run-h").focus({ preventScroll: false });
    var smooth = typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    e.results.scrollIntoView({ block: "start", behavior: smooth });
  }

  /* ---------------- Studio 3.0: Refinery + sharing UI ---------------------------
     Per-shot refinement dialog, packet wayfinding nav, scroll progress,
     plan share/import. Progressive enhancement throughout: every piece
     feature-detects and honors prefers-reduced-motion. Styles (.st3-*) live
     statically in STUDIO_TMPL's <style> block, namespaced and built only
     from the site's token variables, no new visual language. */

  var ST3_MOVEMENTS = null;
  var ST3_DLG_REF = null;
  var ST3_DLG_INVOKER = null;
  var ST3_SHARE_NAME = "studio-plan";

  function st3ReducedMotion() {
    return typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* Packet wayfinding: sticky section nav built from the rendered h3s, with
     scroll-spy. Rebuilt on every packet render (innerHTML is replaced). */
  function st3PacketNav() {
    var res = document.getElementById("st-results");
    if (!res) return;
    var heads = res.querySelectorAll("h3");
    if (heads.length < 2) return;
    var ul = document.createElement("ul");
    var links = {};
    Array.prototype.forEach.call(heads, function (h, i) {
      if (!h.id) h.id = "st3-sec-" + i;
      var label = h.textContent.trim().replace(/\s+/g, " ");
      if (label.length > 34) label = label.slice(0, 32) + "…";
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = "#" + h.id;
      a.textContent = label;
      a.setAttribute("data-st3-sec", h.id);
      li.appendChild(a);
      ul.appendChild(li);
      links[h.id] = a;
    });
    var nav = document.createElement("nav");
    nav.className = "st3-pnav";
    nav.setAttribute("aria-label", "Packet sections");
    nav.appendChild(ul);
    res.insertBefore(nav, res.firstChild);
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          Object.keys(links).forEach(function (k) { links[k].removeAttribute("aria-current"); });
          var a = links[en.target.id];
          if (a) a.setAttribute("aria-current", "true");
        });
      }, { rootMargin: "-30% 0px -60% 0px" });
      Array.prototype.forEach.call(heads, function (h) { io.observe(h); });
    }
  }

  function afterPacketRender() {
    st3PacketNav();
  }

  /* ---------------- the Refinery dialog ------------------------------------ */

  function st3FieldHtml(f) {
    var label = '<label for="st3-f-' + f.key + '">' + esc(f.label) +
      '<span class="st-hint">' + esc(f.help) + "</span></label>";
    var control;
    if (f.kind === "movement") {
      if (ST3_MOVEMENTS && ST3_MOVEMENTS.length) {
        var opts = '<option value="">Keep the template\u2019s move</option>' +
          ST3_MOVEMENTS.map(function (m) {
            return '<option value="' + esc(m.id) + '">' + esc(m.move || m.id) + "</option>";
          }).join("");
        control = '<select id="st3-f-' + f.key + '" data-st3-field="' + f.key + '">' + opts + "</select>";
      } else {
        control = '<input type="text" id="st3-f-' + f.key + '" data-st3-field="' + f.key + '"' +
          ' placeholder="Camera lexicon still loading, describe the move in words">';
      }
    } else {
      control = '<textarea id="st3-f-' + f.key + '" data-st3-field="' + f.key + '" rows="2"></textarea>';
    }
    return '<div class="st3-field">' + label + control + "</div>";
  }

  function st3BuildDialogs() {
    if (document.getElementById("st3-dialog")) return;
    var dlg = document.createElement("dialog");
    dlg.className = "st3-dialog";
    dlg.id = "st3-dialog";
    dlg.setAttribute("aria-labelledby", "st3-dlg-title");
    dlg.innerHTML =
      '<div class="st3-dlg-wrap">' +
      '<div class="st3-dlg-head">' +
      '<h3 id="st3-dlg-title">Refine shot</h3>' +
      '<p class="st-note" id="st3-dlg-sub"></p>' +
      '<p class="st-note">Five-field spec, the structure of the documented Gaudette build ' +
      '(<a href="teardown.html">Teardowns</a>). Refining changes words only: the shot\u2019s ' +
      "model, duration, and take count never move.</p>" +
      "</div>" +
      '<div class="st3-dlg-body">' +
      '<div id="st3-fields"></div>' +
      "<h4>Preview</h4>" +
      '<pre class="st3-preview" id="st3-preview" tabindex="0"></pre>' +
      "<h4>Refinement history</h4>" +
      '<ul class="st3-history" id="st3-history"></ul>' +
      "</div>" +
      '<div class="st3-dlg-foot">' +
      '<button type="button" class="btn btn-sm btn-ghost" id="st3-preview-btn">Preview</button>' +
      '<button type="button" class="btn btn-sm" id="st3-use-btn">Use this version</button>' +
      '<button type="button" class="btn btn-sm btn-ghost" id="st3-restore-btn">Restore original</button>' +
      '<button type="button" class="btn btn-sm btn-ghost" id="st3-close-btn">Close</button>' +
      "</div>" +
      "</div>";
    document.body.appendChild(dlg);
    /* Native <dialog> restores focus to the trigger on close() by itself
       (Baseline since ~Mar 2022), no manual re-focus (web-craft round 2,
       Angle 4: don't re-implement what the platform handles). */
    dlg.addEventListener("close", function () {
      ST3_DLG_INVOKER = null;
      ST3_DLG_REF = null;
    });
    document.getElementById("st3-preview-btn").addEventListener("click", st3Preview);
    document.getElementById("st3-use-btn").addEventListener("click", st3Use);
    document.getElementById("st3-restore-btn").addEventListener("click", st3Restore);
    document.getElementById("st3-close-btn").addEventListener("click", function () { dlg.close(); });
    document.getElementById("st3-fields").addEventListener("input", st3Preview);

    var share = document.createElement("dialog");
    share.className = "st3-dialog";
    share.id = "st3-share";
    share.setAttribute("aria-labelledby", "st3-share-title");
    share.innerHTML =
      '<div class="st3-dlg-wrap">' +
      '<div class="st3-dlg-head">' +
      '<h3 id="st3-share-title">Share plan</h3>' +
      '<p class="st-note">The export is the plan\u2019s full data, anyone with this file and the ' +
      "Studio can import it. Nothing leaves your browser unless you send the file.</p>" +
      "</div>" +
      '<div class="st3-dlg-body">' +
      '<div class="st3-field"><label for="st3-share-json">Plan JSON</label>' +
      '<textarea class="st3-share-json" id="st3-share-json" readonly></textarea></div>' +
      '<p class="st3-err" id="st3-share-err" role="alert" hidden></p>' +
      "<h4>Import a plan</h4>" +
      '<div class="st3-field"><label for="st3-import-file">From a .json file</label>' +
      '<input type="file" id="st3-import-file" accept=".json,application/json"></div>' +
      '<div class="st3-field"><label for="st3-import-text">Or paste plan JSON</label>' +
      '<textarea class="st3-share-json" id="st3-import-text" rows="4"></textarea></div>' +
      "</div>" +
      '<div class="st3-dlg-foot">' +
      '<button type="button" class="btn btn-sm" id="st3-share-dl">Download .json</button>' +
      '<button type="button" class="btn btn-sm btn-ghost" id="st3-share-copy">Copy JSON</button>' +
      '<button type="button" class="btn btn-sm" id="st3-import-btn">Import plan</button>' +
      '<button type="button" class="btn btn-sm btn-ghost" id="st3-share-close">Close</button>' +
      "</div>" +
      "</div>";
    document.body.appendChild(share);
    document.getElementById("st3-share-dl").addEventListener("click", function () {
      var ta = document.getElementById("st3-share-json");
      var blob = new Blob([ta.value], { type: "application/json" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = ST3_SHARE_NAME + ".json";
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 800);
      announce("Plan downloaded as " + ST3_SHARE_NAME + ".json.");
    });
    document.getElementById("st3-share-copy").addEventListener("click", function () {
      var ta = document.getElementById("st3-share-json");
      ta.select();
      var done = function () { announce("Plan JSON copied to the clipboard."); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(ta.value).then(done, function () {
          try { document.execCommand("copy"); done(); }
          catch (e) { announce("Copy failed, select the text manually."); }
        });
      } else {
        try { document.execCommand("copy"); done(); }
        catch (e) { announce("Copy failed, select the text manually."); }
      }
    });
    document.getElementById("st3-import-file").addEventListener("change", function (ev) {
      var f = ev.target.files && ev.target.files[0];
      if (!f) return;
      var rd = new FileReader();
      rd.onload = function () { st3DoImport(String(rd.result || "")); };
      rd.readAsText(f);
      ev.target.value = "";
    });
    document.getElementById("st3-import-btn").addEventListener("click", function () {
      st3DoImport(document.getElementById("st3-import-text").value);
    });
    document.getElementById("st3-share-close").addEventListener("click", function () { share.close(); });
  }

  function st3ReadFields() {
    var out = {};
    StudioEngine.REFINERY_FIELDS.forEach(function (f) {
      var el = document.querySelector('#st3-dialog [data-st3-field="' + f.key + '"]');
      out[f.key] = el ? el.value : "";
    });
    return out;
  }

  function openRefinery(ref, invoker) {
    if (!CURRENT || !CURRENT.plan) return;
    var plan = CURRENT.plan;
    var shot;
    try { shot = StudioEngine.findRefinedShots(plan, ref); }
    catch (e) { announce("Shot not found."); return; }
    var tmpl = null;
    if (DATA && DATA.templates) {
      tmpl = DATA.templates.filter(function (t) { return t.id === shot.templateId; })[0] || null;
    }
    if (!tmpl) { announce("Template data unavailable, reload the page and try again."); return; }
    var genreKey = (CURRENT.input && CURRENT.input.genre) || "drama";
    var genre = StudioEngine.GENRES[genreKey] || StudioEngine.GENRES.drama;
    var tier = (CURRENT.input && CURRENT.input.tier) || "draft";
    var init = StudioEngine.refineryInit(shot, genre, tier);
    if (shot.refined && shot.refinements && shot.refinements.length) {
      var last = shot.refinements[shot.refinements.length - 1];
      if (!last.reverted) {
        Object.keys(init).forEach(function (k) { if (last.fields[k]) init[k] = last.fields[k]; });
      }
    }
    ST3_DLG_REF = { ref: ref, shot: shot, tmpl: tmpl, genre: genre, tier: tier };
    ST3_DLG_INVOKER = invoker || null;
    document.getElementById("st3-dlg-title").textContent =
      "Refine " + (ref.episode == null ? "shot " : "episode " + ref.episode + " · shot ") + shot.n;
    document.getElementById("st3-dlg-sub").textContent =
      shot.templateTitle + " (" + shot.templateId + ") · " + shot.duration + "s · " +
      (shot.model || "unpriced, verify live");
    document.getElementById("st3-fields").innerHTML =
      StudioEngine.REFINERY_FIELDS.map(st3FieldHtml).join("");
    Object.keys(init).forEach(function (k) {
      var el = document.querySelector('#st3-dialog [data-st3-field="' + k + '"]');
      if (el) el.value = init[k];
    });
    st3RenderHistory(shot);
    st3Preview();
    var dlg = document.getElementById("st3-dialog");
    if (!dlg.open) dlg.showModal();
    var first = document.querySelector('#st3-dialog [data-st3-field="character"]');
    if (first) first.focus();
  }

  function st3Preview() {
    if (!ST3_DLG_REF) return;
    var r = ST3_DLG_REF;
    var pre = document.getElementById("st3-preview");
    try {
      var out = StudioEngine.buildRefinedPrompt(r.tmpl, r.genre, r.tier, st3ReadFields(), ST3_MOVEMENTS);
      pre.textContent = out.text;
    } catch (e) {
      pre.textContent = "Can\u2019t preview: " + e.message;
    }
  }

  function st3Use() {
    var r = ST3_DLG_REF;
    if (!r || !CURRENT || !CURRENT.plan) return;
    var out;
    try {
      out = StudioEngine.buildRefinedPrompt(r.tmpl, r.genre, r.tier, st3ReadFields(), ST3_MOVEMENTS);
    } catch (e) {
      announce("Refinement rejected: " + e.message);
      return;
    }
    var entry = StudioEngine.refineShotInPlan(CURRENT.plan, r.ref, out.text, out.fields);
    st3UpdateShotCard(r.ref, r.shot);
    st3RenderHistory(r.shot);
    announce("Shot refined (round " + entry.round + "), words only; budget and schedule unchanged. " +
      "Save the plan to keep it.");
  }

  function st3Restore() {
    var r = ST3_DLG_REF;
    if (!r || !CURRENT || !CURRENT.plan) return;
    try {
      var entry = StudioEngine.revertRefinement(CURRENT.plan, r.ref);
      st3UpdateShotCard(r.ref, r.shot);
      st3RenderHistory(r.shot);
      st3Preview();
      announce("Restored the generated prompt (round " + entry.round + " logged).");
    } catch (e) {
      announce("Nothing to restore, this shot is still on its generated prompt.");
    }
  }

  function st3RenderHistory(shot) {
    var ul = document.getElementById("st3-history");
    var rounds = shot.refinements || [];
    if (!rounds.length) {
      ul.innerHTML = '<li class="st-note">No refinements yet, the preview above starts from the generated prompt.</li>';
      return;
    }
    ul.innerHTML = rounds.map(function (e) {
      if (e.reverted) {
        return "<li><strong>Round " + e.round + "</strong>, reverted to the generated prompt.</li>";
      }
      var bits = [];
      StudioEngine.REFINERY_FIELDS.forEach(function (f) {
        if (e.fields[f.key]) bits.push("<strong>" + esc(f.label) + ":</strong> " + esc(e.fields[f.key]));
      });
      return "<li><strong>Round " + e.round + "</strong> <span class=\"st-track\">" + esc(e.at) + "</span><br>" +
        (bits.join("<br>") || "prompt edit") + "</li>";
    }).join("");
  }

  /* Surgical card update after a refinement, no full re-render, no scroll
     jump. Same-document view transitions are Baseline since Oct 2025
     (web-craft round 1), so document.startViewTransition() ships with only a
     feature check; the prefers-reduced-motion guard is the user's call, not
     a support question. */
  function st3UpdateShotCard(ref, shot) {
    var ep = ref.episode == null ? "" : String(ref.episode);
    var art = document.querySelector(
      'article.st-shot[data-st3-ep="' + ep + '"][data-st3-idx="' + ref.index + '"]');
    if (!art) return;
    var render = function () {
      var pre = art.querySelector(".st-prompt");
      if (pre) pre.textContent = shot.prompt;
      var badge = art.querySelector("[data-st3-rbadge]");
      var n = (shot.refinements || []).length;
      if (shot.refined && n) {
        if (!badge) {
          badge = document.createElement("span");
          badge.className = "st-badge";
          badge.setAttribute("data-st3-rbadge", "1");
          var btn = art.querySelector(".st3-refine");
          if (btn && btn.parentNode) btn.parentNode.insertBefore(badge, btn.nextSibling);
          else art.appendChild(badge);
        }
        badge.textContent = "refined ×" + n;
      } else if (badge) {
        badge.remove();
      }
    };
    if (!st3ReducedMotion() && typeof document.startViewTransition === "function") {
      document.startViewTransition(render);
    } else {
      render();
    }
  }

  /* ---------------- plan sharing UI ---------------------------------------- */

  function openShare(p) {
    var dlg = document.getElementById("st3-share");
    if (!dlg) return;
    ST3_SHARE_NAME = String(p.name || "studio-plan").toLowerCase()
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "studio-plan";
    document.getElementById("st3-share-json").value = StudioEngine.exportPlanData(p);
    document.getElementById("st3-import-text").value = "";
    var err = document.getElementById("st3-share-err");
    err.hidden = true;
    err.textContent = "";
    if (!dlg.open) dlg.showModal();
  }

  function st3DoImport(text) {
    var err = document.getElementById("st3-share-err");
    var res = StudioEngine.importPlanData(text);
    if (!res.ok) {
      err.hidden = false;
      err.textContent = res.error;
      return;
    }
    err.hidden = true;
    var plans = getPlans();
    plans.push(res.saved);
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(plans));
    } catch (e) {
      err.hidden = false;
      err.textContent = "Could not save, browser storage is unavailable.";
      return;
    }
    renderSaved();
    document.getElementById("st3-share").close();
    loadPlan(res.saved);
    announce("Plan imported as \u201c" + res.saved.name + "\u201d, continue planning.");
  }

  function st3Init() {
    /* Camera lexicon for the refinery's movement picker (progressive
       enhancement, the dialog falls back to a text field). */
    fetch("camera-movements.json").then(function (r) {
      if (!r.ok) throw new Error("movements");
      return r.json();
    }).then(function (d) {
      ST3_MOVEMENTS = d.movements || [];
    }).catch(function () { ST3_MOVEMENTS = null; });
    /* Scroll progress hairline (CSS scroll-driven; display:none under
       reduced motion or without animation-timeline support). */
    var prog = document.createElement("div");
    prog.className = "st3-progress";
    prog.setAttribute("aria-hidden", "true");
    document.body.appendChild(prog);
    st3BuildDialogs();
    /* One delegated listener for every Refine button, present and future. */
    var res = document.getElementById("st-results");
    if (res) {
      res.addEventListener("click", function (ev) {
        var btn = ev.target.closest ? ev.target.closest(".st3-refine") : null;
        if (!btn) return;
        var art = btn.closest ? btn.closest("article.st-shot") : null;
        if (!art) return;
        var epRaw = art.getAttribute("data-st3-ep");
        var idxRaw = art.getAttribute("data-st3-idx");
        if (idxRaw === null) return;
        openRefinery({
          episode: (epRaw === null || epRaw === "") ? null : parseInt(epRaw, 10),
          index: parseInt(idxRaw, 10)
        }, btn);
      });
    }
    /* Delegated Share buttons in the saved-plan list. */
    var saved = document.getElementById("st-saved");
    if (saved) {
      saved.addEventListener("click", function (ev) {
        var btn = ev.target.closest ? ev.target.closest("[data-share]") : null;
        if (!btn) return;
        var p = getPlans()[parseInt(btn.getAttribute("data-share"), 10)];
        if (p) openShare(p);
      });
    }
  }

  function init() {
    var e = els();
    if (!e.title) return;
    st3Init();

    /* Genre options from the engine's own map, one source of truth. */
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

    /* Episode-planner bridges: "Send series to Studio" (kind "series") or
       "Send run to Studio" (kind "microdrama") lands here. */
    var bridge = consumeBridge();
    if (bridge) {
      BRIDGE_ARCS = applyBridge(bridge);
    }
    var mdBridge = consumeMicrodramaBridge();
    if (mdBridge) {
      applyMicrodramaBridge(mdBridge);
    }
    if (!bridge && !mdBridge && /[?&]from=planner/.test(location.search)) {
      e.importMsg.hidden = false;
      e.importMsg.textContent = "The planner sent you here, but no series payload was found in this browser " +
        "(it was already consumed or never saved). Plan manually below, or go back and press “Send series to Studio” or “Send run to Studio” again.";
    }

    /* ?mode=microdrama (e.g. from the $150 Microdrama teardown) pre-selects
       the microdrama run planner. */
    if (/[?&]mode=microdrama/.test(location.search)) {
      var microRadio = document.querySelector('input[name="st-kind"][value="microdrama"]');
      if (microRadio) {
        microRadio.checked = true;
        refreshKindUI();
        announce("Microdrama mode selected, plan a serialized run from the documented $150-microdrama economics.");
      }
    }

    /* Prompt-library bridge: a library "Send to Studio" lands here. */
    var promptBridge = consumePromptBridge();
    if (promptBridge) {
      applyPromptBridge(promptBridge);
    } else if (/[?&]from=prompts/.test(location.search)) {
      e.importMsg.hidden = false;
      e.importMsg.textContent = "The prompt library sent you here, but no template payload was found in this browser " +
        "(it was already consumed or never staged). Plan manually below, or go back and press “Send to Studio” again.";
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
      if (!DATA) { fail("Data is still loading, one moment."); return; }
      var kind = projectKind();
      try {
        if (kind === "microdrama") {
          if (!title) { fail("Give the run a title first."); e.title.focus(); return; }
          var minp = readMicroInput();
          minp.title = title;
          minp.logline = logline;
          CURRENT = { kind: "microdrama", input: minp, plan: buildMicrodramaPlan(DATA, minp) };
          renderMicrodrama(CURRENT.plan);
        } else if (SERIES_FORMATS[kind]) {
          if (!title) { fail("Give the project a title first."); e.title.focus(); return; }
          if (!logline) { fail("Write a one-line logline first."); e.logline.focus(); return; }
          var sin = readSeriesInput(BRIDGE_ARCS);
          CURRENT = { kind: "series", input: sin, plan: buildSeriesPlan(DATA, sin) };
          renderSeries(CURRENT.plan);
        } else {
          if (!title) { fail("Give the project a title first."); e.title.focus(); return; }
          if (!logline) { fail("Write a one-line logline first."); e.logline.focus(); return; }
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

    /* "Copy packet as markdown" and downloads follow the current plan kind. */
    function currentMarkdown() {
      if (!CURRENT) return null;
      return CURRENT.kind === "series" ? seriesToMarkdown(CURRENT.plan)
        : CURRENT.kind === "microdrama" ? microdramaToMarkdown(CURRENT.plan)
        : planToMarkdown(CURRENT.plan);
    }

    e.copy.addEventListener("click", function () {
      var md = currentMarkdown();
      if (!md) return;
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
      var md = currentMarkdown();
      if (!md) return;
      downloadFile(slugify(CURRENT.input.title || CURRENT.input.seriesTitle) + "-packet.md", md,
        "text/markdown;charset=utf-8");
      announce("Packet downloaded as markdown.");
    });
    e.dlHtml.addEventListener("click", function () {
      if (!CURRENT || CURRENT.kind !== "series") return;
      downloadFile(slugify(CURRENT.plan.bible.title) + "-packet.html",
        seriesToHtml(CURRENT.plan), "text/html;charset=utf-8");
      announce("Self-contained HTML packet downloaded, one file, printable, shareable.");
    });

    function fallbackCopy(text, done) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "absolute"; ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); done(); }
      catch (err) { fail("Copy failed, select the plan text manually and print to PDF instead."); }
      document.body.removeChild(ta);
    }

    e.print.addEventListener("click", function () { window.print(); });

    /* Cost optimizer panel: resolution bar + dialogue-share controls, then run. */
    if (e.optRun) {
      e.optRun.addEventListener("click", runOptimizer);
      ["input", "change"].forEach(function (ev) {
        e.optAudio.addEventListener(ev, function () {
          e.optAudioOut.textContent =
            Math.min(100, Math.max(0, parseInt(e.optAudio.value, 10) || 0)) + "%";
        });
      });
    }

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
      } catch (err) { fail("Could not save, browser storage is unavailable."); }
    });

    renderSaved();
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else { init(); }
  }
})();
