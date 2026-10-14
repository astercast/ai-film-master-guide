/* The Green Light, a studio meeting, playable.
   Pitch a concept to the room. The room reads it cold (six-layer read),
   builds the shot list from the guide's real 47-template prompt library
   (via the Studio engine), prices every shot from the real pricing table
   (data/v1/pricing.json, per-second tiers, low/high ranges), lays out the
   shoot day by day, then votes: GREEN LIGHT, CONDITIONAL, or BACK TO THE
   ROOM. A cold read gets draft-tier money; punch the concept up layer by
   layer and watch the plan, and the budget, improve.

   Data: site/models.json + site/prompt-templates.json (build copies),
   data/v1/pricing.json (static fallback per the data/v1/ rule), live
   Watchtower /api/models-pricing first via ApiClient (honest badge,
   never blocks).

   The pure engine below is exported for node unit tests
   (scripts/greenlight.test.js); the browser UI only runs when `document`
   exists and the page carries #gl-concept. */
(function () {
  "use strict";

  var SE = null; /* StudioEngine, window in browser, require() in node */
  if (typeof module !== "undefined" && module.exports) {
    try { SE = require("./studio.js"); } catch (e) { SE = null; }
  } else if (typeof window !== "undefined" && window.StudioEngine) {
    SE = window.StudioEngine;
  }

  /* ---- small utilities -------------------------------------------------- */
  function fnv1a(str) {
    var h = 0x811c9dc5;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h >>> 0;
  }

  function wordRe(key) {
    return new RegExp("(^|[^a-z])" + key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "([^a-z]|$)");
  }

  function normName(s) {
    return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  }

  function fmtUSD(n) {
    if (n == null || isNaN(n)) return "…";
    if (n >= 1000) return "$" + Math.round(n).toLocaleString("en-US");
    if (n >= 10) return "$" + n.toFixed(0);
    return "$" + n.toFixed(2);
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---- the six-layer read -------------------------------------------------
     The room reads structure, not taste. Six layers, word-boundary keyword
     tables, plus a named-subject check (capitalized words carry names). */
  var LAYERS = [
    { key: "subject", name: "Someone to watch",
      hint: "Name a subject, a person, a creature, a thing the camera cares about. The room can't invent your story for you.",
      keys: ["astronaut", "dog", "cat", "woman", "man", "girl", "boy", "child", "kid", "baby",
        "robot", "alien", "chef", "dancer", "pilot", "driver", "soldier", "king", "queen",
        "witch", "wizard", "detective", "couple", "crowd", "dragon", "ghost", "monster",
        "android", "cyborg", "samurai", "pirate", "clown", "elder", "grandmother", "grandfather",
        "teen", "stranger", "traveler", "warrior", "nurse", "teacher", "musician", "fox",
        "wolf", "bear", "bird", "horse", "whale", "octopus", "father", "mother", "sister",
        "brother", "friend", "neighbor", "lover", "enemy", "hero", "villain", "protagonist",
        "fisherwoman", "fisherman", "astronauts", "dogs", "cats", "robots", "couple"] },
    { key: "action", name: "Something happening",
      hint: "Give it motion, verbs, not adjectives. What does the subject DO?",
      keys: ["run", "runs", "running", "walk", "walks", "walking", "chase", "chases", "chasing",
        "fight", "fights", "fighting", "dance", "dances", "dancing", "fly", "flies", "flying",
        "swim", "swims", "swimming", "climb", "climbs", "climbing", "fall", "falls", "falling",
        "rise", "rises", "rising", "drive", "drives", "driving", "cook", "cooks", "cooking",
        "build", "builds", "building", "explore", "explores", "exploring", "discover", "discovers",
        "escape", "escapes", "escaping", "hide", "hides", "hiding", "seek", "seeks", "seeking",
        "search", "searches", "searching", "rescue", "rescues", "battle", "battles", "kiss",
        "argue", "argues", "laugh", "laughs", "laughing", "cry", "cries", "crying", "sing",
        "sings", "singing", "play", "plays", "playing", "wait", "waits", "waiting", "watch",
        "watches", "watching", "follow", "follows", "following", "meet", "meets", "meeting",
        "leave", "leaves", "leaving", "return", "returns", "returning", "arrive", "arrives",
        "crash", "crashes", "burn", "burns", "burning", "explode", "explodes", "transform",
        "transforms", "mending", "mend", "stirring", "gaining", "turning", "moving", "working",
        "arguing", "racing", "fleeing", "landing", "launching", "sinking", "emerging"] },
    { key: "camera", name: "A camera decision",
      hint: "One camera move or framing choice. 'Cinematic' is not a camera decision.",
      keys: ["dolly", "pan", "tilt", "crane", "aerial", "drone", "close-up", "closeup", "wide shot",
        "tracking", "handheld", "orbit", "push in", "pull back", "pov", "macro", "zoom",
        "dutch", "timelapse", "steadicam", "gimbal", "jib", "slider", "whip pan", "rack focus",
        "shallow focus", "long take", "overhead", "low angle", "high angle", "slow motion",
        "slow-mo", "360", "medium shot", "extreme close", "wide"] },
    { key: "light", name: "Light",
      hint: "One lighting cue. Time of day counts, dawn is a lighting decision.",
      keys: ["golden hour", "neon", "moonlight", "backlight", "backlit", "silhouette",
        "candlelight", "candlelit", "volumetric", "harsh light", "soft light", "dawn",
        "dusk", "twilight", "noir", "chiaroscuro", "practical", "fluorescent", "strobe",
        "lens flare", "god rays", "overcast", "sunrise", "sunset", "blue hour", "firelight",
        "torchlight", "lantern", "moonlit", "sunlit", "low-key", "high-key"] },
    { key: "placetime", name: "Place and time",
      hint: "Where and when. Two words is enough, 'rooftop, midnight' is a place and a time.",
      keys: ["dusk", "dawn", "night", "midnight", "noon", "morning", "evening", "kitchen",
        "bedroom", "rooftop", "alley", "street", "city", "desert", "forest", "beach",
        "ocean", "mountain", "village", "tokyo", "paris", "mars", "space", "underwater",
        "subway", "airport", "hospital", "school", "church", "temple", "castle", "farm",
        "jungle", "arctic", "swamp", "canyon", "waterfall", "bridge", "harbor", "market",
        "cafe", "stadium", "theater", "library", "museum", "graveyard", "winter", "summer",
        "rain", "snow", "storm", "fog", "mist", "1980s", "1990s", "1920s", "1970s",
        "future", "dock", "pier", "lighthouse", "island", "cabin", "warehouse", "rooftops",
        "deserts", "forests", "oceans", "mountains", "streets", "alleys", "villages"] },
    { key: "mood", name: "A feeling",
      hint: "One emotional register for the whole read. The room funds feelings, not adjectives.",
      keys: ["tense", "joyful", "eerie", "melancholic", "frantic", "serene", "ominous",
        "playful", "lonely", "triumphant", "dread", "anxious", "calm", "chaotic",
        "dreamlike", "haunting", "warm", "bleak", "hopeful", "desperate", "tender",
        "violent", "quiet", "melancholy", "nostalgic", "surreal", "gritty", "lush",
        "stark", "intimate", "epic", "claustrophobic", "euphoric", "somber", "whimsical",
        "menacing", "bittersweet", "electric", "resilience", "resilient", "loneliness",
        "dread-filled", "joy", "sorrow", "wonder", "awe"] }
  ];

  /* Punch-up clauses: craft appendages, never story invention. The room will
     add a camera move, a light, a place, a feeling, it will not invent your
     character. Deterministic pick per (text, layer). */
  var PUNCH_UPS = {
    action: [", caught mid-stride", ", turning toward camera as it happens", ", moving left to right through frame"],
    camera: [", slow dolly-in", ", locked-off wide, then a slow push-in", ", handheld and restless"],
    light: [", lit by low golden-hour sun", ", hard neon practicals, deep shadow", ", soft overcast daylight"],
    placetime: [", at dusk", ", in light rain", ", just after midnight"],
    mood: [", quiet and tense", ", with a lonely edge", ", playful, nothing staged"]
  };

  var GRADES = [
    { min: 100, word: "Green-light ready", temp: "green-light ready",
      note: "Directed on every layer. Print it." },
    { min: 83, word: "Leaning in", temp: "warming up",
      note: "The room is leaning forward. One more layer locks it." },
    { min: 67, word: "Warming up", temp: "warming up",
      note: "The bones are here; the missing layers will show on screen." },
    { min: 50, word: "Cold but workable", temp: "cold",
      note: "Half a read. The room will spend draft money, not flagship money." },
    { min: 34, word: "The room is cold", temp: "cold",
      note: "The model will improvise everything you didn't direct." },
    { min: 17, word: "Stone cold", temp: "stone cold",
      note: "A wish, not a direction. Punch it up below." },
    { min: 1, word: "No signal", temp: "no signal",
      note: "Nothing directable in that yet." }
  ];

  function gradeFor(score) {
    for (var i = 0; i < GRADES.length; i++) {
      if (score >= GRADES[i].min) return GRADES[i];
    }
    return GRADES[GRADES.length - 1];
  }

  /* Hype hygiene: names the room refuses to price. */
  var HYPE_CHECKS = [
    { re: /veo\s*4\b/i, model: "Veo 4",
      note: "Veo 4 doesn't exist, verified Oct 2026; the \u201crelease date\u201d pages are SEO bait. Latest official is Veo 3.1, and the plan prices that instead." },
    { re: /kling\s*4(\.0)?\b/i, model: "Kling 4.0",
      note: "Kling 4.0 is announced, not shipped, only 4.0 Flash exists (Ultra Yearly subscribers). Excluded from the budget until it has a price." },
    { re: /\bsora\b/i, model: "Sora",
      note: "Sora is discontinued, OpenAI shut it down; the last Azure deployment retired Oct 15, 2026. The room won't price it." }
  ];

  var STOPWORDS_LANG = {
    "Spanish": [" el ", " la ", " los ", " las ", " de ", " que ", " una ", " para ", " con ", " este ", " esta "],
    "French": [" le ", " la ", " les ", " des ", " une ", " dans ", " pour ", " avec ", " cette ", " sont "],
    "German": [" der ", " die ", " das ", " und ", " den ", " von ", " mit ", " ein ", " eine ", " nicht "],
    "Portuguese": [" o ", " a ", " os ", " as ", " de ", " que ", " para ", " com ", " uma ", " este "],
    "Italian": [" il ", " lo ", " la ", " una ", " per ", " con ", " del ", " che ", " sono "]
  };

  function detectLanguage(text) {
    var t = " " + text.toLowerCase() + " ";
    var nonLatin = (text.match(/[^\u0000-\u024F\u1E00-\u1EFF\s\d.,;:!?'"()\-\u2013\u2014]/g) || []).length;
    var alpha = (text.match(/[A-Za-z\u00C0-\u024F\u1E00-\u1EFF]/g) || []).length;
    if (alpha > 0 && nonLatin / alpha > 0.35) return "a non-Latin script";
    var best = null, bestN = 0;
    Object.keys(STOPWORDS_LANG).forEach(function (lang) {
      var n = STOPWORDS_LANG[lang].filter(function (w) { return t.indexOf(w) !== -1; }).length;
      if (n > bestN) { bestN = n; best = lang; }
    });
    if (best && bestN >= 2) return best;
    return null;
  }

  function looksGibberish(text) {
    var words = text.trim().split(/\s+/).filter(Boolean);
    if (words.length < 2) return false;
    var alpha = (text.match(/[a-zA-Z]/g) || []).length;
    if (alpha / Math.max(1, text.length) < 0.4) return true;
    var consonantRuns = words.filter(function (w) { return /[^aeiouAEIOU\W\d_]{5,}/.test(w); }).length;
    return consonantRuns / words.length > 0.5;
  }

  function readRoom(text) {
    var raw = String(text || "");
    var t = " " + raw.toLowerCase() + " ";
    var words = raw.trim().split(/\s+/).filter(Boolean);
    var gibberish = looksGibberish(raw);
    var lang = detectLanguage(raw);

    var layers = LAYERS.map(function (l) {
      var hits = [];
      l.keys.forEach(function (k) {
        if (wordRe(k).test(t)) hits.push(k);
      });
      /* named subjects: capitalized words carry names ("Mara", "Neo-Tokyo") */
      if (l.key === "subject" && !hits.length) {
        var named = raw.match(/(?:^|[.!?]\s+|\s)([A-Z][a-z]{2,})/g) || [];
        named.forEach(function (m) {
          var w = m.trim().replace(/^[.!?]\s+/, "");
          if (w && hits.indexOf(w.toLowerCase()) === -1) hits.push(w.toLowerCase());
        });
      }
      return { key: l.key, name: l.name, hint: l.hint, present: hits.length > 0, hits: hits.slice(0, 4) };
    });

    var presentCount = layers.filter(function (l) { return l.present; }).length;
    var score = Math.round((presentCount / LAYERS.length) * 100);
    var grade = gradeFor(score);

    var hype = [];
    HYPE_CHECKS.forEach(function (h) {
      if (h.re.test(raw)) hype.push({ model: h.model, note: h.note });
    });

    var unusable = false, unusableReason = null;
    if (!raw.trim()) {
      unusable = true; unusableReason = "empty";
    } else if (gibberish || words.length < 2) {
      unusable = true; unusableReason = "gibberish";
    }

    return {
      words: words.length, layers: layers, presentCount: presentCount,
      score: score, gradeWord: grade.word, gradeNote: grade.note, temp: grade.temp,
      hype: hype, lang: lang, gibberish: gibberish,
      unusable: unusable, unusableReason: unusableReason,
      missing: layers.filter(function (l) { return !l.present; })
    };
  }

  function punchUpClauses(text, missingKeys) {
    var seed = fnv1a(String(text || "") + "|punch");
    return (missingKeys || []).filter(function (k) { return PUNCH_UPS[k]; }).map(function (k, i) {
      var opts = PUNCH_UPS[k];
      var clause = opts[(seed + i * 7) % opts.length];
      var layer = null;
      LAYERS.forEach(function (l) { if (l.key === k) layer = l; });
      return { key: k, name: layer ? layer.name : k, hint: layer ? layer.hint : "", clause: clause };
    });
  }

  function applyPunchUp(text, clause) {
    var t = String(text || "").trim().replace(/[.\s]+$/, "");
    return t + clause;
  }

  /* ---- pricing: the real per-second table ---------------------------------
     pricing.json entries: {model_id, model, status, tiers:[{tier, unit,
     usd_low, usd_high, basis, confidence}]}. Discontinued models are never
     priced; announced-but-unpriced models price as unpriced (stated, not
     invented). */
  function normalizePricing(doc) {
    var entries = (doc && (doc.entries || (doc.data && doc.data.models))) || [];
    return entries.filter(function (e) {
      return e && e.status !== "discontinued";
    }).map(function (e) {
      return {
        id: e.model_id || e.model, name: e.model || e.model_id,
        status: e.status || "active", tiers: e.tiers || [],
        updatedAt: e.updated_at || null
      };
    });
  }

  /* Exact normalized match first (so "Veo 3.1" never resolves to the
     "Veo 3.1 Fast / Veo 3" entry); longest-prefix fallback after, mirroring
     the Studio engine's own resolveModel. Null when nothing resolves. */
  function matchEntry(entries, modelName) {
    if (!modelName) return null;
    var n = normName(modelName);
    var i, e;
    for (i = 0; i < entries.length; i++) {
      e = entries[i];
      if (normName(e.name) === n || normName(e.id) === n) return e;
    }
    var best = null, bestLen = 0;
    entries.forEach(function (en2) {
      [normName(en2.name), normName(en2.id)].forEach(function (pn) {
        if (pn && (n.indexOf(pn) === 0 || pn.indexOf(n) === 0) && pn.length > bestLen) {
          best = en2; bestLen = pn.length;
        }
      });
    });
    return best;
  }

  function usableTiers(entry) {
    return (entry.tiers || []).filter(function (t) {
      return t && (t.unit === "second" || t.unit === "clip") &&
        typeof t.usd_low === "number" && typeof t.usd_high === "number";
    });
  }

  /* Festival money buys the standard tier at the requested resolution;
     draft money buys the cheapest usable tier at that resolution. Fallback
     ladder: requested → 1080p → 720p → first usable. */
  function selectTier(entry, resKey, effTier) {
    var usable = usableTiers(entry);
    if (!usable.length) return null;
    function atRes(q) {
      q = String(q).toLowerCase();
      return usable.filter(function (t) {
        return String(t.tier || "").toLowerCase().indexOf(q) !== -1;
      });
    }
    var ladder = [resKey, "1080p", "720p"];
    var cands = [];
    for (var i = 0; i < ladder.length && !cands.length; i++) {
      if (ladder[i]) cands = atRes(ladder[i]);
    }
    if (!cands.length) cands = usable.slice();
    var pick = null;
    if (effTier === "festival") {
      pick = cands.filter(function (t) {
        return String(t.tier || "").toLowerCase().indexOf("standard") !== -1;
      })[0] || null;
    } else {
      var cheap = cands.filter(function (t) {
        return /fast|lite|turbo/.test(String(t.tier || "").toLowerCase());
      });
      if (cheap.length) {
        pick = cheap.slice().sort(function (a, b) { return a.usd_low - b.usd_low; })[0];
      }
    }
    if (!pick) {
      pick = cands.slice().sort(function (a, b) { return a.usd_low - b.usd_low; })[0];
    }
    return pick;
  }

  function priceShot(entries, modelName, seconds, takes, resKey, effTier) {
    var entry = matchEntry(entries, modelName);
    if (!entry) {
      return { unpriced: true, model: modelName,
        reason: "no pricing record, verify live before budgeting" };
    }
    var tier = selectTier(entry, resKey, effTier);
    if (!tier) {
      var why = entry.status === "announced"
        ? "announced, no published price yet"
        : "no per-second tier published";
      return { unpriced: true, model: entry.name, reason: why };
    }
    var mult = tier.unit === "clip" ? 1 : seconds;
    var low = tier.usd_low * mult * takes;
    var high = tier.usd_high * mult * takes;
    return {
      unpriced: false, model: entry.name, tierName: String(tier.tier),
      perSecLow: tier.usd_low, perSecHigh: tier.usd_high, perClip: tier.unit === "clip",
      seconds: seconds, takes: takes,
      low: Math.round(low * 100) / 100, high: Math.round(high * 100) / 100,
      basis: String(tier.basis || "").split(";")[0],
      confidence: tier.confidence || null,
      math: entry.name + " · " + tier.tier + " · $" + tier.usd_low.toFixed(3) +
        "/s × " + seconds + "s × " + takes + " takes"
    };
  }

  /* ---- the meeting -------------------------------------------------------- */
  /* The room's money rule: festival ambition only unlocks flagship pricing
     when the read is warm enough (score ≥ 55). A cold read gets draft money
     no matter what was asked for, stated on the record, never silent. */
  var TIER_UNLOCK_SCORE = 55;

  function effectiveTier(ambition, score) {
    if (ambition === "festival" && score >= TIER_UNLOCK_SCORE) return "festival";
    return "draft";
  }

  function verdictFor(read, effTier, ambition, stats) {
    var conditions = [];
    read.missing.forEach(function (l) { conditions.push("Missing layer: " + l.name.toLowerCase() + ", " + l.hint); });
    (stats.unpricedModels || []).forEach(function (u) {
      conditions.push("Unpriced: " + u.model + " (" + u.reason + "), price it live before the shoot.");
    });
    var notes = [];
    read.hype.forEach(function (h) { notes.push(h.note); });
    if (ambition === "festival" && effTier === "draft") {
      notes.push("You asked for festival money; the read is cold. The room drafts cheap until the concept earns flagship pricing, punch it up above and watch the money move.");
    }
    var out;
    if (read.score >= 70) {
      out = { level: "green", title: "GREEN LIGHT",
        line: "The room buys it. Shoot the plan as priced, the numbers below are the budget." };
    } else if (read.score >= 45) {
      out = { level: "conditional", title: "GREEN LIGHT, CONDITIONAL",
        line: "The room is interested, with notes. Clear the conditions and it's a yes." };
    } else {
      out = { level: "pass", title: "BACK TO THE ROOM",
        line: "The room passes, for now. The punch-ups above are the fastest way back in." };
    }
    out.conditions = conditions;
    out.notes = notes;
    return out;
  }

  /* input: {title, logline, genre, runtimeSec, resKey, ambition}
     data: {models, templates} (models.json / prompt-templates.json shapes)
     pricingDoc: pricing.json shape (or the /api/models-pricing envelope)
     engine: optional StudioEngine override (tests) */
  function buildMeeting(data, pricingDoc, input, engine) {
    var eng = engine || SE;
    if (!eng) throw new Error("no StudioEngine available");
    var read = readRoom(input.logline);
    if (read.unusable) return { read: read, unusable: true };

    var effTier = effectiveTier(input.ambition, read.score);
    var plan = eng.buildPlan(data, {
      title: input.title, logline: input.logline,
      genre: input.genre, runtimeSec: input.runtimeSec, tier: effTier
    });

    var entries = normalizePricing(pricingDoc);
    var shots = plan.shots.map(function (s) {
      var p = priceShot(entries, s.model, s.duration, plan.tierSpec.takes, input.resKey, effTier);
      return {
        n: s.n, act: s.act, templateId: s.templateId, templateTitle: s.templateTitle,
        prompt: s.prompt, unfilled: s.unfilled, model: s.model, platform: s.platform,
        modelWhy: s.modelWhy, modelFallback: s.modelFallback,
        duration: s.duration, takes: plan.tierSpec.takes, pricing: p
      };
    });

    var byModel = {};
    var unpricedModels = [];
    shots.forEach(function (s) {
      var p = s.pricing;
      if (p.unpriced) {
        if (p.model && unpricedModels.map(function (u) { return u.model; }).indexOf(p.model) === -1) {
          unpricedModels.push({ model: p.model, reason: p.reason });
        }
        return;
      }
      var g = byModel[p.model] || (byModel[p.model] = {
        model: p.model, tierName: p.tierName, shots: 0,
        low: 0, high: 0, perSecLow: p.perSecLow, perSecHigh: p.perSecHigh,
        basis: p.basis, confidence: p.confidence, seconds: p.seconds, takes: p.takes
      });
      g.shots += 1; g.low += p.low; g.high += p.high;
    });
    var lines = Object.keys(byModel).sort().map(function (k) {
      var g = byModel[k];
      g.low = Math.round(g.low * 100) / 100;
      g.high = Math.round(g.high * 100) / 100;
      return g;
    });
    var cleanLow = lines.reduce(function (a, l) { return a + l.low; }, 0);
    var cleanHigh = lines.reduce(function (a, l) { return a + l.high; }, 0);
    var totals = {
      cleanLow: Math.round(cleanLow * 100) / 100,
      cleanHigh: Math.round(cleanHigh * 100) / 100,
      fiveLow: Math.round(cleanLow * 5 * 100) / 100,
      fiveHigh: Math.round(cleanHigh * 5 * 100) / 100,
      twentyLow: Math.round(cleanLow * 20 * 100) / 100,
      twentyHigh: Math.round(cleanHigh * 20 * 100) / 100,
      takes: plan.tierSpec.takes
    };

    /* schedule: the plan's phases laid out as shoot days */
    var days = [];
    var d = 1;
    plan.schedule.phases.forEach(function (ph) {
      for (var i = 0; i < ph.days; i++) {
        days.push({ day: d, phase: ph.phase, basis: ph.basis,
          last: i === ph.days - 1 });
        d++;
      }
    });
    days.push({ day: d, phase: "Lock the cut", basis: "one day to stop touching it", last: true });

    var stats = { unpricedModels: unpricedModels, shotCount: shots.length };
    var verdict = verdictFor(read, effTier, input.ambition, stats);

    var provAt = null;
    entries.forEach(function (e) {
      if (e.updatedAt && (!provAt || e.updatedAt > provAt)) provAt = e.updatedAt;
    });

    return {
      read: read, unusable: false,
      input: {
        title: input.title, logline: input.logline, genre: input.genre,
        genreLabel: (eng.GENRES[input.genre] || {}).label || input.genre,
        runtimeSec: input.runtimeSec, resKey: input.resKey,
        ambition: input.ambition, effTier: effTier,
        tierDowngraded: input.ambition === "festival" && effTier === "draft"
      },
      seed: plan.seed,
      shots: shots, lines: lines, totals: totals,
      unpricedModels: unpricedModels,
      days: days, totalDays: days.length,
      verdict: verdict,
      pricingProvenance: { at: provAt, count: entries.length }
    };
  }

  function meetingToMarkdown(m) {
    var L = [];
    L.push("# Green light, " + (m.input.title || "Untitled"));
    L.push("");
    L.push("_" + m.input.genreLabel + " · " + m.input.runtimeSec + "s · " +
      m.input.resKey + " · ambition: " + m.input.ambition +
      (m.input.tierDowngraded ? " (room priced it at draft, the read was cold)" : " (room priced it at " + m.input.effTier + ")") + "_");
    L.push("");
    L.push("## The read, " + m.read.gradeWord + " (" + m.read.score + "/100)");
    L.push("");
    L.push(m.read.gradeNote);
    L.push("");
    m.read.layers.forEach(function (l) {
      L.push("- " + (l.present ? "[x]" : "[ ]") + " " + l.name +
        (l.hits.length ? ", " + l.hits.join(", ") : ""));
    });
    m.read.hype.forEach(function (h) { L.push("", "> " + h.note); });
    L.push("");
    L.push("## The board, " + m.shots.length + " shots");
    L.push("");
    m.shots.forEach(function (s) {
      L.push("### Shot " + s.n + ", " + s.templateTitle + " (" + s.act + ")");
      L.push("");
      L.push("```");
      L.push(s.prompt);
      L.push("```");
      L.push("");
      if (s.pricing.unpriced) {
        L.push("- Model: " + (s.model || "unresolved") + ", UNPRICED (" + s.pricing.reason + ")");
      } else {
        L.push("- Model: " + s.pricing.model + " (" + (s.platform || "") + ")");
        L.push("- Cost: " + s.pricing.math + " = " +
          fmtUSD(s.pricing.low) + (s.pricing.high !== s.pricing.low ? "" + fmtUSD(s.pricing.high) : ""));
      }
      L.push("");
    });
    L.push("## The money");
    L.push("");
    m.lines.forEach(function (l) {
      L.push("- " + l.model + " (" + l.shots + " shots × " + l.takes + " takes, " +
        l.tierName + "): " + fmtUSD(l.low) +
        (l.high !== l.low ? "" + fmtUSD(l.high) : "") +
        ", basis: " + l.basis);
    });
    if (m.unpricedModels.length) {
      m.unpricedModels.forEach(function (u) {
        L.push("- " + u.model + ": UNPRICED (" + u.reason + ")");
      });
    }
    L.push("");
    L.push("Clean: " + fmtUSD(m.totals.cleanLow) +
      (m.totals.cleanHigh !== m.totals.cleanLow ? "" + fmtUSD(m.totals.cleanHigh) : "") +
      " · 5× envelope: " + fmtUSD(m.totals.fiveLow) +
      (m.totals.fiveHigh !== m.totals.fiveLow ? "" + fmtUSD(m.totals.fiveHigh) : "") +
      " · 20× envelope: " + fmtUSD(m.totals.twentyLow) +
      (m.totals.twentyHigh !== m.totals.twentyLow ? "" + fmtUSD(m.totals.twentyHigh) : ""));
    L.push("");
    L.push("_Post, assembly, audio, grade: human time + software you already own; not modeled._");
    L.push("");
    L.push("## The schedule, " + m.totalDays + " days");
    L.push("");
    m.days.forEach(function (d) {
      L.push("- Day " + d.day + ": " + d.phase + " (" + d.basis + ")");
    });
    L.push("");
    L.push("## The verdict, " + m.verdict.title);
    L.push("");
    L.push(m.verdict.line);
    m.verdict.conditions.forEach(function (c) { L.push("- " + c); });
    m.verdict.notes.forEach(function (n) { L.push("", "> " + n); });
    L.push("");
    L.push("_Priced from pricing.json (" + m.pricingProvenance.count +
      " models" + (m.pricingProvenance.at ? ", updated " + m.pricingProvenance.at.slice(0, 10) : "") +
      "). Ranges, not promises, verify live before spending._");
    return L.join("\n");
  }

  var GreenLight = {
    TIER_UNLOCK_SCORE: TIER_UNLOCK_SCORE,
    LAYERS: LAYERS, GRADES: GRADES,
    fnv1a: fnv1a, wordRe: wordRe, normName: normName, fmtUSD: fmtUSD,
    readRoom: readRoom, gradeFor: gradeFor,
    punchUpClauses: punchUpClauses, applyPunchUp: applyPunchUp,
    normalizePricing: normalizePricing, matchEntry: matchEntry,
    selectTier: selectTier, priceShot: priceShot,
    effectiveTier: effectiveTier, verdictFor: verdictFor,
    buildMeeting: buildMeeting, meetingToMarkdown: meetingToMarkdown
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = GreenLight;
    return;
  }

  /* ---- browser UI --------------------------------------------------------- */
  var BRIDGE_KEY = "afg-studio-bridge";
  var PROV = { kind: "loading", at: null };
  var MEETING = null;

  function badgeHtml() {
    var cls = PROV.kind === "live" ? "api-badge is-live" :
      PROV.kind === "static" ? "api-badge is-cached" : "api-badge is-waking";
    var label = PROV.kind === "live" ? "live" :
      PROV.kind === "static" ? ("cached" + (PROV.at ? " · updated " + PROV.at : "")) : "loading rates…";
    return '<span class="' + cls + '" role="status" tabindex="0" title="Where the rates came from">' +
      esc(label) + "</span>";
  }

  function provLine() {
    if (PROV.kind === "live") return "Rates: Watchtower live API" + (PROV.at ? " · " + PROV.at : "") + ".";
    if (PROV.kind === "static") return "Rates: cached pricing.json" + (PROV.at ? " · updated " + PROV.at : "") + ".";
    return "Rates: loading, the room waits for numbers before it votes.";
  }

  function tempMeter(read) {
    var pct = Math.max(4, read.score);
    var word = read.temp;
    return '<div class="gl-temp" role="status" aria-label="Room temperature: ' + esc(word) + ", " + read.score + ' out of 100">' +
      '<div class="gl-temp-track"><div class="gl-temp-fill" style="width:' + pct + '%"></div></div>' +
      '<p class="gl-temp-word">' + esc(word) + ' <span class="gl-score">' + read.score + '/100</span></p>' +
      "</div>";
  }

  function renderRead(m) {
    var r = m.read;
    var H = [];
    H.push('<h2>The read <span class="tc" aria-hidden="true">00:00:15:00</span></h2>');
    H.push(tempMeter(r));
    H.push('<p class="gl-grade">' + esc(r.gradeNote) + "</p>");
    if (r.lang) {
      H.push('<p class="calc-note">Heads up: that reads as ' + esc(r.lang) +
        ", the room plans in English, and the prompt library is English. Translate the concept for the sharpest read.</p>");
    }
    H.push('<ul class="gl-layers">');
    r.layers.forEach(function (l) {
      H.push('<li class="' + (l.present ? "is-on" : "is-off") + '">' +
        '<span class="gl-lamp" aria-hidden="true">' + (l.present ? "●" : "○") + "</span> " +
        "<strong>" + esc(l.name) + "</strong>" +
        (l.hits.length ? ' <span class="gl-hits">' + esc(l.hits.join(", ")) + "</span>" : "") +
        (l.present ? "" : '<br><span class="gl-hint">' + esc(l.hint) + "</span>") +
        "</li>");
    });
    H.push("</ul>");
    r.hype.forEach(function (h) {
      H.push('<p class="gl-hype"><strong>' + esc(h.model) + " check:</strong> " + esc(h.note) + "</p>");
    });
    if (m.input.tierDowngraded) {
      H.push('<p class="gl-hype"><strong>Money note:</strong> you asked for festival money; the read is cold, ' +
        "so the room priced this at draft. Punch it up past " + TIER_UNLOCK_SCORE +
        "/100 and watch flagship pricing unlock.</p>");
    }
    var missing = r.missing.filter(function (l) { return PUNCH_UPS[l.key]; });
    if (missing.length) {
      H.push('<div class="gl-punch"><h3>Punch it up</h3>' +
        "<p>The room adds craft, never story. One click per layer, then the plan re-runs:</p>" +
        '<div class="btn-row">' +
        missing.map(function (l) {
          return '<button type="button" class="btn btn-sm btn-ghost gl-punch-btn" data-layer="' +
            esc(l.key) + '">+ ' + esc(l.name.toLowerCase()) + "</button>";
        }).join("") + "</div></div>");
    }
    return H.join("\n");
  }

  function shotCard(s) {
    var p = s.pricing;
    var cost = p.unpriced
      ? '<p class="gl-cost is-unpriced"><strong>UNPRICED</strong>, ' + esc(p.reason) + "</p>"
      : '<p class="gl-cost"><strong>' + fmtUSD(p.low) +
        (p.high !== p.low ? "" + fmtUSD(p.high) : "") + "</strong> " +
        '<span class="gl-math">' + esc(p.math) + "</span></p>";
    return '<article class="card gl-shot">' +
      '<h3><span class="gl-shot-n">Shot ' + s.n + "</span> " + esc(s.templateTitle) +
      ' <span class="gl-act">' + esc(s.act) + "</span></h3>" +
      '<pre class="st-prompt" tabindex="0">' + esc(s.prompt) + "</pre>" +
      '<p class="gl-model"><strong>' + esc(p.unpriced ? (s.model || "unresolved") : p.model) + "</strong>" +
      (s.platform && !p.unpriced ? ' <span class="gl-plat">' + esc(s.platform) + "</span>" : "") +
      (s.modelFallback ? ' <span class="gl-flag">tier fallback</span>' : "") + "</p>" +
      (s.modelWhy && !p.unpriced ? '<p class="gl-why">' + esc(s.modelWhy) + "</p>" : "") +
      cost +
      "</article>";
  }

  function renderBoard(m) {
    var H = ['<h2>The board <span class="tc" aria-hidden="true">00:00:45:00</span></h2>',
      '<p class="calc-note">' + m.shots.length + " shots from the guide's 47-template library, " +
      "each priced from the real pricing table at " + esc(m.input.resKey) + ".</p>",
      '<div class="gl-shots">' + m.shots.map(shotCard).join("\n") + "</div>"];
    return H.join("\n");
  }

  function renderMoney(m) {
    var H = ['<h2>The money <span class="tc" aria-hidden="true">00:01:30:00</span></h2>',
      '<p>' + badgeHtml() + '</p><p class="calc-note">' + esc(provLine()) + "</p>",
      '<div class="table-scroll"><table class="gl-table"><caption>Generation budget, per-model subtotals at ' +
      esc(m.input.resKey) + ", " + m.totals.takes + " takes per keeper</caption>",
      "<thead><tr><th scope=\"col\">Model</th><th scope=\"col\">Tier priced</th><th scope=\"col\">Shots</th><th scope=\"col\">Low</th><th scope=\"col\">High</th><th scope=\"col\">Basis</th></tr></thead><tbody>"];
    m.lines.forEach(function (l) {
      H.push("<tr><td>" + esc(l.model) + "</td><td>" + esc(l.tierName) + "</td><td>" +
        l.shots + "</td><td>" + fmtUSD(l.low) + "</td><td>" + fmtUSD(l.high) + "</td><td>" +
        esc(l.basis || "pricing.json") + "</td></tr>");
    });
    H.push("</tbody></table></div>");
    if (m.unpricedModels.length) {
      H.push('<ul class="gl-unpriced">' + m.unpricedModels.map(function (u) {
        return "<li><strong>" + esc(u.model) + ":</strong> unpriced, " + esc(u.reason) + "</li>";
      }).join("") + "</ul>");
    }
    var t = m.totals;
    function range(lo, hi) { return fmtUSD(lo) + (hi !== lo ? "" + fmtUSD(hi) : ""); }
    H.push('<dl class="gl-totals">' +
      "<div><dt>Clean (as priced)</dt><dd>" + range(t.cleanLow, t.cleanHigh) + "</dd></div>" +
      "<div><dt>5× envelope</dt><dd>" + range(t.fiveLow, t.fiveHigh) + "</dd></div>" +
      "<div><dt>20× envelope</dt><dd>" + range(t.twentyLow, t.twentyHigh) + "</dd></div>" +
      "</dl>");
    H.push('<p class="calc-note">Post, assembly, audio, grade: human time + software you already own; not modeled. ' +
      "Ranges, not promises, verify live before spending.</p>");
    return H.join("\n");
  }

  function renderSchedule(m) {
    var H = ['<h2>The schedule <span class="tc" aria-hidden="true">00:02:15:00</span></h2>',
      '<p class="calc-note">' + m.totalDays + " working days, one phase at a time. Generation days assume render queues behave, they don't always.</p>",
      '<ol class="gl-days">'];
    m.days.forEach(function (d) {
      H.push('<li><span class="gl-day">Day ' + d.day + "</span> <strong>" + esc(d.phase) +
        '</strong> <span class="gl-basis">' + esc(d.basis) + "</span></li>");
    });
    H.push("</ol>");
    return H.join("\n");
  }

  function renderVerdict(m) {
    var v = m.verdict;
    var cls = v.level === "green" ? "is-green" : v.level === "conditional" ? "is-cond" : "is-pass";
    var H = ['<h2>The verdict <span class="tc" aria-hidden="true">00:03:00:00</span></h2>',
      '<div class="gl-verdict ' + cls + '" role="status">',
      '<p class="gl-stamp" aria-hidden="true">' + esc(v.title) + "</p>",
      '<p class="gl-vline">' + esc(v.line) + "</p>"];
    if (v.conditions.length) {
      H.push('<h3>The notes</h3><ul>' + v.conditions.map(function (c) {
        return "<li>" + esc(c) + "</li>";
      }).join("") + "</ul>");
    }
    v.notes.forEach(function (n) { H.push('<p class="gl-hype">' + esc(n) + "</p>"); });
    H.push("</div>");
    H.push('<div class="btn-row" id="gl-actions">' +
      '<button type="button" class="btn btn-sm btn-gold" id="gl-copy">Copy the plan</button>' +
      '<button type="button" class="btn btn-sm btn-ghost" id="gl-dl">Download .md</button>' +
      '<button type="button" class="btn btn-sm btn-ghost" id="gl-print">Print</button>' +
      '<a class="btn btn-sm btn-ghost" href="studio.html">Open the full Studio →</a>' +
      "</div>");
    return H.join("\n");
  }

  function noFootage(reason, lang) {
    var msg = reason === "empty"
      ? "No pitch, no meeting, say what the film is, or load the weak sample."
      : "Nothing directable in that. Load the weak sample and punch it up, the room works with words it can shoot.";
    var extra = lang
      ? "<p>The room plans in English; translate the concept for the sharpest read.</p>" : "";
    return '<div class="empty-state"><p><strong>NO FOOTAGE</strong></p><p>' + esc(msg) + "</p>" + extra + "</div>";
  }

  /* ---- page state ---------------------------------------------------------- */
  var DATA = null;      /* {models, templates} */
  var PRICING_DOC = null;

  function els() {
    return {
      title: document.getElementById("gl-title"),
      concept: document.getElementById("gl-concept"),
      genre: document.getElementById("gl-genre"),
      runtime: document.getElementById("gl-runtime"),
      res: document.getElementById("gl-res"),
      pitch: document.getElementById("gl-pitch"),
      weak: document.getElementById("gl-weak"),
      strong: document.getElementById("gl-strong"),
      clear: document.getElementById("gl-clear"),
      bridge: document.getElementById("gl-bridge"),
      error: document.getElementById("gl-error"),
      meeting: document.getElementById("gl-meeting")
    };
  }

  function readForm() {
    var e = els();
    var ambition = "draft";
    var r = document.querySelector('input[name="gl-ambition"]:checked');
    if (r) ambition = r.value;
    return {
      title: e.title.value.trim(),
      logline: e.concept.value,
      genre: e.genre.value,
      runtimeSec: parseInt(e.runtime.value, 10),
      resKey: e.res.value,
      ambition: ambition
    };
  }

  function runMeeting(fromPunch) {
    var e = els();
    e.error.hidden = true;
    var input = readForm();
    var read = readRoom(input.logline);
    if (read.unusable) {
      e.meeting.hidden = false;
      e.meeting.innerHTML = noFootage(read.unusableReason, read.lang);
      if (!fromPunch) e.concept.focus();
      return;
    }
    var m;
    try {
      m = buildMeeting(DATA, PRICING_DOC, input);
    } catch (err) {
      e.error.hidden = false;
      e.error.textContent = "The room couldn't build the plan: " + err.message;
      return;
    }
    MEETING = m;
    e.meeting.hidden = false;
    e.meeting.innerHTML =
      '<section aria-label="The read">' + renderRead(m) + "</section>" +
      '<section aria-label="The board">' + renderBoard(m) + "</section>" +
      '<section aria-label="The money">' + renderMoney(m) + "</section>" +
      '<section aria-label="The schedule">' + renderSchedule(m) + "</section>" +
      '<section aria-label="The verdict">' + renderVerdict(m) + "</section>";
    wireMeetingButtons();
    var h = e.meeting.querySelector("h2");
    if (h && !fromPunch) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
    e.meeting.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function wireMeetingButtons() {
    var e = els();
    e.meeting.querySelectorAll(".gl-punch-btn").forEach(function (b) {
      b.addEventListener("click", function () {
        var layer = b.getAttribute("data-layer");
        var clauses = punchUpClauses(e.concept.value, [layer]);
        if (!clauses.length) return;
        e.concept.value = applyPunchUp(e.concept.value, clauses[0].clause);
        runMeeting(true);
      });
    });
    var copy = document.getElementById("gl-copy");
    if (copy) copy.addEventListener("click", function () {
      var txt = meetingToMarkdown(MEETING);
      function done(label) {
        copy.textContent = label;
        setTimeout(function () { copy.textContent = "Copy the plan"; }, 2000);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(function () { done("Copied"); },
          function () { done("Clipboard blocked, use Download .md"); });
      } else { window.prompt("Copy your plan:", txt); }
    });
    var dl = document.getElementById("gl-dl");
    if (dl) dl.addEventListener("click", function () {
      var blob = new Blob([meetingToMarkdown(MEETING)], { type: "text/markdown" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "green-light-plan.md";
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    });
    var pr = document.getElementById("gl-print");
    if (pr) pr.addEventListener("click", function () { window.print(); });
  }

  function consumeBridge() {
    var raw = null;
    try { raw = localStorage.getItem(BRIDGE_KEY); } catch (err) { /* ignore */ }
    if (!raw) return null;
    var b = null;
    try { b = JSON.parse(raw); } catch (err) { return null; }
    if (!b || b.v !== 1 || b.kind !== "greenlight") return null;
    try { localStorage.removeItem(BRIDGE_KEY); } catch (err) { /* ignore */ }
    return b;
  }

  var WEAK_SAMPLE = "a dog in a city";
  var STRONG_SAMPLE = "Mara, a weathered fisherwoman in her sixties, silver braid, oilskin coat, " +
    "mending a torn net on a fog-draped wooden dock at dawn; the camera pushes in slowly " +
    "from medium to close-up; cold blue dawn light with a warm lantern glow from frame left; " +
    "quiet resilience; coat hem stirring in the sea breeze.";

  function init() {
    var e = els();
    if (!e.concept || !SE) return; /* not on the green-light page, or studio.js absent */

    /* Genre options from the Studio engine's own map, one source of truth. */
    Object.keys(SE.GENRES).forEach(function (k) {
      var o = document.createElement("option");
      o.value = k;
      o.textContent = SE.GENRES[k].label;
      e.genre.appendChild(o);
    });

    /* Cutting Room → Green Light bridge: a take walks in with its grade. */
    var bridge = consumeBridge();
    if (bridge && bridge.prompt) {
      e.concept.value = bridge.prompt;
      e.bridge.hidden = false;
      e.bridge.innerHTML = "<p><strong>A take walked in from the Cutting Room:</strong> " +
        esc(bridge.gradeWord || "") + (bridge.score != null ? " · " + bridge.score + "/100" : "") +
        '. Pitch it when ready, or punch it up first.</p>';
    }

    e.pitch.addEventListener("click", function () { runMeeting(false); });
    e.concept.addEventListener("keydown", function (ev) {
      if ((ev.ctrlKey || ev.metaKey) && ev.key === "Enter") runMeeting(false);
    });
    e.weak.addEventListener("click", function () {
      e.title.value = "Dog in the City";
      e.concept.value = WEAK_SAMPLE;
      runMeeting(false);
    });
    e.strong.addEventListener("click", function () {
      e.title.value = "The Net Mender";
      e.concept.value = STRONG_SAMPLE;
      runMeeting(false);
    });
    e.clear.addEventListener("click", function () {
      e.title.value = ""; e.concept.value = "";
      e.meeting.hidden = true; e.meeting.innerHTML = "";
      e.error.hidden = true; e.concept.focus();
    });

    /* Data: the Studio's models + templates, and the real pricing table. */
    var ready = 0;
    function maybeReady() {
      if (++ready === 2 && DATA && PRICING_DOC) {
        e.pitch.disabled = false;
        e.pitch.textContent = "Pitch it to the room";
      }
    }
    e.pitch.disabled = true;
    e.pitch.textContent = "Loading the room…";
    Promise.all([
      fetch("models.json").then(function (r) { if (!r.ok) throw new Error("models"); return r.json(); }),
      fetch("prompt-templates.json").then(function (r) { if (!r.ok) throw new Error("templates"); return r.json(); })
    ]).then(function (arr) {
      DATA = { models: arr[0].models || [], templates: arr[1].templates || [] };
      maybeReady();
    }).catch(function () {
      e.error.hidden = false;
      e.error.textContent = "The room couldn't load its model data. Check your connection and reload.";
    });

    function pricingReady(doc, kind, at) {
      PRICING_DOC = doc;
      PROV = { kind: kind, at: at || null };
      maybeReady();
    }
    function pricingFailed() {
      e.error.hidden = false;
      e.error.textContent = "The room couldn't load the pricing table. Check your connection and reload.";
    }
    /* fetchWithFallback never rejects: worst case {data: null, source: "none"} */
    function loadPricing() {
      if (window.ApiClient && window.ApiClient.fetchWithFallback) {
        return window.ApiClient.fetchWithFallback("/api/models-pricing", "data/v1/pricing.json")
          .then(function (res) {
            if (res.data) {
              var kind = (res.source === "live" && !res.degraded) ? "live" : "static";
              pricingReady(res.data, kind,
                res.generatedAt ? String(res.generatedAt).slice(0, 10) : null);
            } else {
              pricingFailed();
            }
          });
      }
      return fetch("data/v1/pricing.json").then(function (r) {
        if (!r.ok) throw new Error("pricing");
        return r.json();
      }).then(function (doc) {
        pricingReady(doc, "static", (doc.generated_at || "").slice(0, 10));
      }).catch(pricingFailed);
    }
    loadPricing();
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else { init(); }
  }
})();
