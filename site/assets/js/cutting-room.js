/* cutting-room.js, The Cutting Room, playable (wow wave 1).
   Type a weak prompt, roll the camera: the prompt gets a real structural
   analysis against the guide's ten-layer anatomy, the page "shoots" it, a shot-by-shot breakdown built from the REAL prompt library
   (prompt-templates.json, 47 templates), and the cost desk runs REAL math
   on the REAL pricing table (Watchtower /api/models-pricing, static
   fallback to data/v1/pricing.json, built-in estimates last).
   Guided fix-bay suggestions quote real library technique (placeholder
   hints and craft lines from actual templates, cited by id). Heuristic
   throughout, honest about it, like the linter. */
(function () {
  "use strict";

  var MOTION_OK = typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: no-preference)").matches;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function wordRe(key) {
    return new RegExp("(^|[^a-z])" + key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "([^a-z]|$)");
  }

  /*  The ten layers: the guide's prompt-anatomy knowledge, same tables
     the linter checks against. Detection keywords are lowercase, matched
     on word boundaries.  */
  var LAYERS = [
    { id: "subject", num: 1, name: "Subject", token: "SUBJECT",
      keys: ["woman", "man", "person", "people", "girl", "boy", "child", "elderly", "figure",
             "fisherwoman", "astronaut", "warrior", "detective", "chef", "dancer", "soldier",
             "king", "queen", "robot", "android", "creature", "wearing", "dressed", "coat",
             "uniform", "dress", "suit", "armor", "aged", "young", "old man", "old woman",
             "sixties", "twenties", "thirties", "protagonist", "character", "subject", "dog",
             "cat", "horse", "bird", "fisherman", "sailor", "mother", "father"],
      why: "Without a locked identity, every regeneration redesigns your character.",
      missing: "Identity drift, a different face in every shot.",
      tip: "Name the subject and lock 2 to 3 visual traits that never change." },
    { id: "action", num: 2, name: "Micro-action", token: "ACTION",
      keys: ["walking", "running", "turning", "looking", "mending", "pouring", "lifting",
             "reaching", "sitting", "standing", "dancing", "fighting", "driving", "flying",
             "swimming", "climbing", "falling", "smiling", "laughing", "crying", "speaking",
             "whispering", "working", "playing", "chasing", "hiding", "emerging", "gazing",
             "staring", "waving", "pointing", "grabbing", "holding", "carrying", "pushing",
             "pulling", "opening", "closing", "knocking", "mends", "walks", "turns", "looks",
             "sprinting", "sprints", "sprint"],
      why: "Models execute one action well. Stacked actions collapse into mush or morphs.",
      missing: "Muddy motion and half-rendered gestures.",
      tip: "Give the subject exactly one believable verb." },
    { id: "environment", num: 3, name: "Environment", token: "ENV",
      keys: ["room", "street", "dock", "forest", "city", "desert", "beach", "mountain",
             "alley", "rooftop", "kitchen", "office", "station", "bridge", "cave", "castle",
             "village", "harbor", "field", "garden", "interior", "exterior", "landscape",
             "background", "fog", "mist", "rain", "snow", "dawn", "dusk", "night", "sunset",
             "sunrise", "overhead", "around", "behind", "beneath", "gulls", "trees", "hallway",
             "corridor", "studio"],
      why: "Dead backgrounds read as fake. Ambient motion sells reality more than detail does.",
      missing: "A stagey void; the subject floats in nothing.",
      tip: "Place the shot somewhere with subtle motion living in it." },
    { id: "camera", num: 4, name: "Camera behavior", token: null,
      keys: ["camera", "push-in", "push in", "pull-back", "pull back", "dolly", "pan",
             "tilt", "tracking", "crane", "aerial", "drone", "handheld", "steadicam",
             "close-up", "closeup", "medium shot", "wide shot", "establishing", "pov",
             "over-the-shoulder", "low angle", "high angle", "dutch angle", "zoom",
             "orbit", "static shot", "locked-off", "slow motion", "timelapse", "macro shot"],
      why: "Every move needs a purpose. Ask what the move reveals or withholds.",
      missing: "Unmotivated drift; the camera wanders.",
      tip: "Direct one intentional camera move and motivate it." },
    { id: "lighting", num: 5, name: "Lighting design", token: "LIGHT",
      keys: ["light", "lighting", "lit", "glow", "glowing", "shadow", "shadows",
             "volumetric", "neon", "sunlight", "moonlight", "candlelight", "lantern",
             "rim light", "backlit", "softbox", "golden hour", "blue hour", "chiaroscuro",
             "silhouette", "lens flare", "practical", "fluorescent", "torchlight"],
      why: "\u201cNice lighting\u201d means nothing to a model. Named sources do.",
      missing: "The flat video look.",
      tip: "Name the sources, their direction, and quality." },
    { id: "style", num: 6, name: "Visual style", token: "STYLE",
      keys: ["cinematic", "photorealistic", "photoreal", "film grain", "35mm", "anamorphic",
             "16mm", "70mm", "anime", "stylized", "painterly", "noir", "documentary",
             "vintage", "retro", "cyberpunk", "fantasy", "sci-fi", "horror", "western",
             "art house", "blockbuster", "music video", "commercial", "style"],
      why: "This is the only layer that survives a 90-minute film. Verbatim repetition is the consistency system.",
      missing: "Style drift across scenes.",
      tip: "Write your style bible in one line and repeat it verbatim in every prompt." },
    { id: "tone", num: 7, name: "Emotional tone", token: "EMOTION",
      keys: ["melancholy", "tense", "tension", "joyful", "eerie", "calm", "dramatic",
             "somber", "hopeful", "bleak", "warm", "cold", "ominous", "dreamlike",
             "nostalgic", "anxious", "serene", "haunting", "intimate", "epic", "quiet",
             "melancholic", "bittersweet", "foreboding", "mood", "grief", "resilience"],
      why: "Aligns performance, light, and grade toward a single feeling.",
      missing: "Emotionally blank footage.",
      tip: "Name the feeling of the shot in two words." },
    { id: "physics", num: 8, name: "Physics & motion", token: null,
      keys: ["wind", "breeze", "drifting", "flowing", "swaying", "rippling", "steam",
             "dust", "smoke", "waves", "fluttering", "billowing", "splashing", "dripping",
             "swirling", "cloth", "hair", "fabric", "leaves", "petals", "embers", "sparks",
             "rain falling", "snow falling", "stirring", "motion", "mist lifting"],
      why: "Models render motion they are told about. Untold motion freezes.",
      missing: "Frozen, plasticky movement.",
      tip: "Say how things move, coat hem stirring in the sea breeze." },
    { id: "render", num: 9, name: "Rendering quality", token: null,
      keys: ["4k", "8k", "high resolution", "sharp", "detailed", "detail", "depth of field",
             "shallow depth", "bokeh", "texture", "skin texture", "ray tracing", "octane",
             "unreal engine", "crisp", "clean", "quality", "masterpiece", "intricate",
             "1080p", "720p"],
      why: "Set the floor before generation, not after in post.",
      missing: "Soft, mushy output.",
      tip: "Set the quality floor: resolution, depth of field, texture." },
    { id: "exclusion", num: 10, name: "Exclusion block", token: null,
      keys: ["exclude", "excludes", "excluding", "avoid", "no extra", "without",
             "never", "negative prompt", "--no", "do not include", "no text",
             "no watermark", "no blur"],
      why: "Excluding failure modes is cheaper than fixing them in post.",
      missing: "The usual suspects, on screen.",
      tip: "Add the never-list to every prompt: morphing faces, extra limbs, flicker." }
  ];

  var WEAK_WORDS = ["nice", "beautiful", "amazing", "awesome", "cool", "good", "great",
    "stunning", "gorgeous", "incredible", "fantastic", "very", "really", "quite",
    "somewhat", "thing", "things", "stuff", "something"];

  /*  Language + gibberish detection (honest handling, not fake support)  */
  var STOPWORDS = {
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
    Object.keys(STOPWORDS).forEach(function (lang) {
      var n = STOPWORDS[lang].filter(function (w) { return t.indexOf(w) !== -1; }).length;
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

  function analyze(text) {
    var t = " " + text.toLowerCase() + " ";
    var words = text.trim().split(/\s+/).filter(Boolean);
    var layers = LAYERS.map(function (l) {
      var hits = [];
      l.keys.forEach(function (k) {
        if (wordRe(k).test(t)) hits.push(k);
      });
      return { layer: l, present: hits.length > 0, hits: hits };
    });
    var weakHits = WEAK_WORDS.filter(function (w) { return wordRe(w).test(t); });
    var adjRe = /(ful|ous|ive|al|ic|y|ed)$/;
    var adjCount = words.filter(function (w) {
      return adjRe.test(w.toLowerCase()) && w.length > 4;
    }).length;
    var presentCount = layers.filter(function (l) { return l.present; }).length;
    var specScore = Math.min(1, (words.length / 60) * 0.6 + (adjCount / Math.max(1, words.length)) * 2 * 0.4);
    var weakPenalty = Math.min(0.5, weakHits.length * 0.1);
    var score = Math.round(
      (presentCount / layers.length) * 70 +
      specScore * 20 +
      (10 - weakPenalty * 20)
    );
    score = Math.max(0, Math.min(100, score));
    return {
      words: words.length, layers: layers, presentCount: presentCount,
      weakHits: weakHits, adjCount: adjCount, score: score
    };
  }

  function grade(score) {
    if (score >= 85) return ["Excellent", "Every layer directed. Print it."];
    if (score >= 70) return ["Strong", "Solid structure, fill the remaining gaps for a locked shot."];
    if (score >= 50) return ["Workable", "The bones are here, but missing layers will show on screen."];
    if (score >= 30) return ["Thin", "The model will improvise everything you didn't direct."];
    return ["Bare", "This is a wish, not a direction. Build it up layer by layer."];
  }

  /*  State  */
  var TEMPLATES = null;      // the 47-library
  var PRICING = null;        // normalized video entries [{name, rateLow, rateHigh, tierName, basis}]
  var PROV = { kind: "builtin", at: null };
  var takes = [];
  var takeN = 0;

  var els = {};
  ["cr-prompt", "cr-roll", "cr-sample-weak", "cr-sample-strong", "cr-clear",
   "cr-error", "cr-note", "cr-results", "cr-grade", "cr-layers", "cr-shoot",
   "cr-cost", "cr-fix", "cr-takes", "cr-timeline", "cr-tl-fill", "cr-tl-shots",
   "cr-seconds", "cr-takes-per", "cr-badge", "cr-prov", "cr-copy"].forEach(function (id) {
    els[id] = document.getElementById(id);
  });

  if (!els["cr-prompt"]) return; // not on the cutting-room page

  /*  Pricing: Watchtower live → static pricing.json → built-in estimates  */
  function normName(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }

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

  function normalizePricing(doc) {
    var entries = (doc && (doc.entries || doc.models)) || [];
    var out = [];
    entries.forEach(function (e) {
      if (!e || e.type !== "video" || e.status === "discontinued") return;
      var tier = pickTier(e.tiers);
      if (!tier) return;
      out.push({
        name: e.model || e.model_id,
        rateLow: tier.usd_low, rateHigh: tier.usd_high,
        perSecond: tier.unit === "second",
        tierName: String(tier.tier || tier.unit),
        basis: String(tier.basis || "pricing.json").split(";")[0]
      });
    });
    return out;
  }

  function builtinPricing() {
    // Last-resort estimates, always labeled as such. Real numbers land
    // via the Watchtower or the static pricing.json copy.
    return [
      { name: "Kling 3.0", rateLow: 0.14, rateHigh: 0.14, perSecond: true, tierName: "1080p (estimate)", basis: "built-in estimate" },
      { name: "Veo 3.1", rateLow: 0.20, rateHigh: 0.20, perSecond: true, tierName: "1080p (estimate)", basis: "built-in estimate" },
      { name: "Seedance 2.0", rateLow: 0.08, rateHigh: 0.08, perSecond: true, tierName: "1080p (estimate)", basis: "built-in estimate" }
    ];
  }

  function cheapestVideo() {
    var best = null;
    PRICING.forEach(function (p) {
      if (!best || p.rateLow < best.rateLow) best = p;
    });
    return best;
  }

  function matchPricing(modelName) {
    if (!modelName) return null;
    var n = normName(modelName);
    var best = null, bestLen = 0;
    PRICING.forEach(function (p) {
      var pn = normName(p.name);
      if ((pn.indexOf(n) !== -1 || n.indexOf(pn) !== -1) && pn.length > bestLen) {
        best = p; bestLen = pn.length;
      }
    });
    return best;
  }

  function money(v) {
    return "$" + (v < 10 ? v.toFixed(2) : v.toFixed(v < 100 ? 1 : 0));
  }

  function provLine() {
    if (PROV.kind === "live") return "Rates: Watchtower live API" + (PROV.at ? " · " + PROV.at : "") + ".";
    if (PROV.kind === "static") return "Rates: cached pricing.json" + (PROV.at ? " · updated " + PROV.at : "") + ".";
    return "Rates: built-in estimates (Oct 2026), the Watchtower and pricing.json are unreachable from here.";
  }

  /*  Template selection: coverage roles, relevance-ranked, deterministic  */
  var ROLE_ORDER = [
    { role: "establishing", label: "Establishing", test: /establish|drone|aerial|wide|reveal|geograph|landscape|cityscape/i },
    { role: "action", label: "Action", test: /action|tracking|chase|fight|movement|sprint|run|dance/i },
    { role: "insert", label: "Insert", test: /macro|insert|detail|product|object|texture/i },
    { role: "closeup", label: "Close-up", test: /close.?up|reaction|emotional|face|eyes|two.?shot|dialogue/i },
    { role: "payoff", label: "Payoff", test: /payoff|finale|climax|reveal|transition|match.?cut/i },
    { role: "alt", label: "Alt angle", test: /orbit|crane|pov|over.?the.?shoulder|dutch|timelapse/i }
  ];

  function shotCount(score) {
    if (score >= 90) return 6;
    if (score >= 80) return 5;
    if (score >= 65) return 4;
    if (score >= 50) return 3;
    if (score >= 30) return 2;
    return 1;
  }

  function templateRelevance(tpl, kwSet) {
    var hay = (tpl.title + " " + (tpl.anatomy || "") + " " + tpl.prompt).toLowerCase();
    var n = 0;
    Object.keys(kwSet).forEach(function (k) { if (hay.indexOf(k) !== -1) n++; });
    return n;
  }

  function selectTemplates(score, kwSet) {
    var n = shotCount(score);
    var roles = ROLE_ORDER.slice(0, Math.min(n, ROLE_ORDER.length));
    var used = {};
    var picks = [];
    roles.forEach(function (r) {
      var cands = TEMPLATES.filter(function (t) {
        if (used[t.id]) return false;
        return r.test.test(t.title + " " + (t.anatomy || ""));
      });
      if (!cands.length) return;
      cands.sort(function (a, b) {
        var ra = templateRelevance(a, kwSet), rb = templateRelevance(b, kwSet);
        if (rb !== ra) return rb - ra;
        return a.id < b.id ? -1 : 1;
      });
      used[cands[0].id] = true;
      picks.push({ role: r, template: cands[0] });
    });
    // Weak prompts can still under-fill if no role matches: top up with
    // the highest-relevance unused templates so the shoot never stalls.
    if (picks.length < n) {
      var rest = TEMPLATES.filter(function (t) { return !used[t.id]; });
      rest.sort(function (a, b) {
        var ra = templateRelevance(a, kwSet), rb = templateRelevance(b, kwSet);
        if (rb !== ra) return rb - ra;
        return a.id < b.id ? -1 : 1;
      });
      for (var i = 0; i < rest.length && picks.length < n; i++) {
        used[rest[i].id] = true;
        picks.push({ role: { role: "coverage", label: "Coverage" }, template: rest[i] });
      }
    }
    return picks;
  }

  /*  Placeholder filling: user terms first, library hints second,
     honest [PLACEHOLDER] flags last  */
  function extractTerms(analysis) {
    var terms = {};
    analysis.layers.forEach(function (l) {
      var hits = l.hits.slice().sort(function (a, b) { return b.length - a.length; }).slice(0, 3);
      if (hits.length) terms[l.layer.id] = hits;
    });
    return terms;
  }

  var TOKEN_TO_LAYER = { SUBJECT: "subject", ACTION: "action", ENV: "environment",
    LIGHT: "lighting", STYLE: "style", EMOTION: "tone", AUDIO: "physics" };

  function fillPrompt(tpl, terms) {
    var usedLibrary = [];
    var unfilled = [];
    var text = tpl.prompt.replace(/\[([A-Z ]+?)(?::\s*([^\]]+))?\]/g, function (m, token, hint) {
      var base = token.trim().split(" ")[0];
      var layerId = TOKEN_TO_LAYER[base];
      var words = layerId && terms[layerId] ? terms[layerId] : null;
      if (words && words.length) return words.join(", ");
      if (hint) { usedLibrary.push(hint.trim()); return hint.trim(); }
      unfilled.push(base);
      return "[" + base + "]";
    });
    return { text: text, usedLibrary: usedLibrary.slice(0, 3), unfilled: unfilled.slice(0, 4) };
  }

  function tc(sec) {
    var s = Math.floor(sec), f = Math.round((sec - s) * 24);
    var hh = String(Math.floor(s / 3600)).padStart(2, "0");
    var mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    var ss = String(s % 60).padStart(2, "0");
    return hh + ":" + mm + ":" + ss + ":" + String(f).padStart(2, "0");
  }

  /*  Fix bay: real technique quotes from the library, cited by id  */
  function firstHint(token) {
    for (var i = 0; i < TEMPLATES.length; i++) {
      var m = TEMPLATES[i].prompt.match(new RegExp("\\[" + token + ":\\s*([^\\]]+)\\]"));
      if (m) return { template: TEMPLATES[i], hint: m[1].trim() };
    }
    return null;
  }

  function firstMoveClause() {
    var moveRe = /(push-in|pull-back|dolly|tracking shot|crane|orbit|pan|tilt|handheld|locked-off|aerial|slow push-in)/i;
    for (var i = 0; i < TEMPLATES.length; i++) {
      var sentences = TEMPLATES[i].prompt.split(/(?<=[.!?])\s+/);
      for (var j = 0; j < sentences.length; j++) {
        if (moveRe.test(sentences[j])) return { template: TEMPLATES[i], clause: sentences[j].trim() };
      }
    }
    return null;
  }

  function firstMotionClause() {
    var motRe = /(mist|wind|dust|smoke|rain|fabric|hair|leaves|embers|steam|waves|petals)\b[^.!?]*\b(lifting|drifting|stirring|billowing|swaying|rippling|fluttering|swirling|falling)\b[^.!?]*/i;
    for (var i = 0; i < TEMPLATES.length; i++) {
      var m = TEMPLATES[i].prompt.match(motRe);
      if (m) return { template: TEMPLATES[i], clause: m[0].trim() };
    }
    return null;
  }

  function techniqueFor(layerId) {
    var h, c;
    switch (layerId) {
      case "subject":
        h = firstHint("SUBJECT");
        return h ? {
          cite: h.template.id, title: h.template.title,
          quote: h.hint,
          note: "The library's subject convention: an identity label plus locked visual traits.",
          apply: "Subject: [name], [trait 1], [trait 2], [trait 3]."
        } : null;
      case "action":
        h = firstHint("ACTION");
        return h ? {
          cite: h.template.id, title: h.template.title,
          quote: h.hint,
          note: "One primary motion per prompt, the library's rule. Adapt the specifics to your scene.",
          apply: "Action: " + h.hint + "."
        } : null;
      case "environment":
        h = firstHint("ENV");
        return h ? {
          cite: h.template.id, title: h.template.title,
          quote: h.hint,
          note: "Place it somewhere with ambient motion living in it. Adapt to your scene.",
          apply: "Environment: " + h.hint + "."
        } : null;
      case "camera":
        c = firstMoveClause();
        return c ? {
          cite: c.template.id, title: c.template.title,
          quote: c.clause,
          note: "Direct one intentional move and motivate it. Quoted verbatim from the template.",
          apply: "Camera: " + c.clause
        } : null;
      case "lighting":
        h = firstHint("LIGHT");
        return h ? {
          cite: h.template.id, title: h.template.title,
          quote: h.hint,
          note: "Named sources, not \u201cnice lighting\u201d. Quoted from the template.",
          apply: "Lighting: " + h.hint + "."
        } : null;
      case "style":
        return {
          cite: "library rule", title: "Prompt-template conventions",
          quote: "Keep [STYLE] identical across a project.",
          note: "The only layer that survives a 90-minute film. Write one line, repeat it verbatim.",
          apply: "Style: cinematic realism, 35mm film grain. [Repeat this exact line in every prompt.]"
        };
      case "tone":
        h = firstHint("EMOTION");
        return h ? {
          cite: h.template.id, title: h.template.title,
          quote: h.hint,
          note: "Two words of feeling, not \u201cemotional\u201d. Quoted from the template.",
          apply: "Tone: " + h.hint + "."
        } : null;
      case "physics":
        c = firstMotionClause();
        return c ? {
          cite: c.template.id, title: c.template.title,
          quote: c.clause,
          note: "Models render motion they are told about. Quoted verbatim from the template.",
          apply: "Motion: " + c.clause + "."
        } : null;
      case "render":
        return {
          cite: "starter", title: "Quality-floor scaffold",
          quote: "[resolution], [depth of field], [texture]",
          note: "A starter scaffold, not a library quote, fill it before you generate.",
          apply: "Render: 4K, shallow depth of field, natural skin texture."
        };
      case "exclusion":
        return {
          cite: "guide sample", title: "The linter's worked example",
          quote: "Exclude: morphing faces, extra limbs, flicker.",
          note: "The never-list from the guide's own worked prompt. Excluding is cheaper than fixing.",
          apply: "Exclude: morphing faces, extra limbs, warping, flicker, text in frame."
        };
    }
    return null;
  }

  /*  Rendering  */
  function renderGrade(a, langFlag, gibberish) {
    var g = grade(a.score);
    var notes = "";
    if (gibberish) {
      notes = '<p class="cr-flag" role="note"><strong>Keysmash detected.</strong> ' +
        'The camera can\'t shoot randomness, the analysis below will be thin. ' +
        'Load the weak sample and build from there.</p>';
    } else if (langFlag) {
      notes = '<p class="cr-flag" role="note"><strong>This reads like ' + esc(langFlag) + '.</strong> ' +
        'The detectors below read English, so the analysis will be thin. ' +
        'Translate the direction into English for a real read.</p>';
    }
    els["cr-grade"].innerHTML =
      '<div class="cr-grade-row">' +
        '<div class="cr-score" aria-label="Prompt score ' + a.score + ' out of 100">' +
          '<span class="cr-score-num">' + a.score + '</span><span class="cr-score-den">/100</span></div>' +
        '<div><strong class="cr-grade-word">' + esc(g[0]) + '</strong>' +
        '<p>' + esc(g[1]) + '</p>' +
        '<p class="calc-note">' + a.words + ' words · ' + a.presentCount + ' of 10 layers present. ' +
        'Heuristic check, structure, not taste.</p></div>' +
      '</div>' + notes;
  }

  function renderLayers(a) {
    els["cr-layers"].innerHTML = a.layers.map(function (l) {
      var cls = l.present ? "is-present" : "is-missing";
      var mark = l.present ? "✓" : "✕";
      var tip = l.present
        ? (l.hits.length ? '<span class="calc-note">heard: ' + esc(l.hits.slice(0, 3).join(", ")) + '</span>' : "")
        : '<span class="calc-note">' + esc(l.layer.tip) + '</span>';
      return '<li class="cr-layer ' + cls + '"><span class="lint-mark" aria-hidden="true">' + mark + '</span> ' +
        '<strong>' + esc(l.layer.name) + '</strong> ' + tip + '</li>';
    }).join("");
  }

  function buildTake(promptText, seconds) {
    var a = analyze(promptText);
    var terms = extractTerms(a);
    var kwSet = {};
    Object.keys(terms).forEach(function (k) {
      terms[k].forEach(function (w) { kwSet[w] = true; });
    });
    var picks = selectTemplates(a.score, kwSet);
    var draftMode = a.score < 50;
    var shots = picks.map(function (p, i) {
      var filled = fillPrompt(p.template, terms);
      var modelEntry;
      var modelNote;
      if (draftMode) {
        modelEntry = cheapestVideo();
        modelNote = "Draft discipline: the prompt isn't worth a flagship render yet, cheapest video tier.";
      } else {
        var named = (p.template.models || [])[0];
        modelEntry = matchPricing(named) || cheapestVideo();
        modelNote = named ? ("Template shortlists " + named + (modelEntry && normName(modelEntry.name) !== normName(named) ? ", not in the pricing table, " + modelEntry.name + " stands in" : "") + ".") : "No model shortlisted, cheapest video tier stands in.";
      }
      var low = modelEntry.perSecond ? modelEntry.rateLow * seconds : modelEntry.rateLow;
      var high = modelEntry.perSecond ? modelEntry.rateHigh * seconds : modelEntry.rateHigh;
      return {
        n: i + 1, tcIn: tc(i * seconds), role: p.role.label, template: p.template,
        text: filled.text, usedLibrary: filled.usedLibrary, unfilled: filled.unfilled,
        model: modelEntry, modelNote: modelNote, costLow: low, costHigh: high
      };
    });
    takeN++;
    var take = {
      n: takeN, prompt: promptText, score: a.score, gradeWord: grade(a.score)[0],
      shots: shots, seconds: seconds, draftMode: draftMode, analysis: a
    };
    takes.push(take);
    return take;
  }

  function renderShots(take) {
    var cont = take.analysis.presentCount >= 7 || take.analysis.layers[5].present;
    var html = take.shots.map(function (s) {
      var lib = s.usedLibrary.length ?
        '<p class="calc-note">Library example applied: ' + esc(s.usedLibrary.join("; ")) + ' <span class="cr-libtag">library</span></p>' : "";
      var unf = s.unfilled.length ?
        '<p class="cr-flag"><strong>Still a placeholder:</strong> ' + esc(s.unfilled.map(function (u) { return "[" + u + "]"; }).join(", ")) + ', fill before generating.</p>' : "";
      /* r23 (Paper Mono's lesson): the shot's anatomy, framing,
         move, light, from the template's own facets, printed as
         the shot's slate line. The notation is the art. */
      var anat = "";
      if (s.template.facet) {
        var f = s.template.facet;
        var words = function (v) { return String(v || "").replace(/-/g, " "); };
        anat = '<p class="cr-anatomy"><span><b>Framing</b> ' + esc(words(f.shot_type)) + '</span>' +
          '<span><b>Move</b> ' + esc(words(f.movement)) + '</span>' +
          '<span><b>Light</b> ' + esc(words(f.lighting)) + '</span></p>';
      }
      return '<article class="card cr-shot" aria-label="Shot ' + s.n + ' of ' + take.shots.length + '">' +
        '<div class="cr-shot-head"><span class="cr-shot-tc">' + s.tcIn + '</span>' +
        '<span class="cr-shot-role">' + esc(s.role) + '</span>' +
        '<span class="cr-shot-src">from <a href="prompts.html">' + esc(s.template.title) + '</a> <span class="calc-note">' + esc(s.template.id) + '</span></span></div>' +
        anat +
        '<p class="cr-shot-text">' + esc(s.text) + '</p>' +
        '<p class="calc-note"><strong>Why this shot:</strong> ' + esc(s.template.anatomy || s.template.use || "coverage") + '</p>' +
        '<p class="calc-note"><strong>Model:</strong> ' + esc(s.model.name) + ' · ' + esc(s.model.tierName) + ' · ' +
          money(s.costLow) + (s.costHigh !== s.costLow ? "" + money(s.costHigh) : "") + ' / shot. ' + esc(s.modelNote) + '</p>' +
        lib + unf +
        '</article>';
    }).join("");
    if (cont) {
      var styleTerms = take.analysis.layers[5].hits.slice(0, 3).join(", ");
      var subjTerms = take.analysis.layers[0].hits.slice(0, 3).join(", ");
      html += '<div class="card cr-continuity" role="note">' +
        '<h3>Continuity locked</h3><ul>' +
        (styleTerms ? '<li><strong>Style lock:</strong> \u201c' + esc(styleTerms) + '\u201d, repeat verbatim in every prompt of the project.</li>' : '') +
        (subjTerms ? '<li><strong>Character anchor:</strong> ' + esc(subjTerms) + ', same traits, every shot.</li>' : '') +
        '<li><strong>One motion per prompt</strong>, the library\'s rule; stacked actions morph.</li></ul></div>';
    }
    els["cr-shoot"].innerHTML = html;
    var cards = els["cr-shoot"].querySelectorAll(".cr-shot, .cr-continuity");
    if (MOTION_OK && cards.length) {
      cards.forEach(function (c, i) {
        c.classList.add("cr-will-enter");
        c.style.transitionDelay = (i * 90) + "ms";
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { c.classList.add("cr-entered"); });
        });
      });
      setTimeout(function () {
        cards.forEach(function (c) { c.style.transitionDelay = ""; });
      }, cards.length * 90 + 400);
    }
  }

  function renderTimeline(take) {
    els["cr-tl-shots"].innerHTML = take.shots.map(function (s) {
      return '<li class="cr-tl-shot" aria-label="Shot ' + s.n + ' at ' + s.tcIn + '">' +
        '<span class="cr-tl-n">' + s.n + '</span><span class="cr-tl-tc">' + s.tcIn + '</span></li>';
    }).join("");
    var fill = els["cr-tl-fill"];
    fill.style.transform = "scaleX(0)";
    fill.setAttribute("aria-hidden", "true");
    if (MOTION_OK) {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { fill.style.transform = "scaleX(1)"; });
      });
    } else {
      fill.style.transform = "scaleX(1)";
    }
  }

  function renderCost(take) {
    var takesPer = parseInt(els["cr-takes-per"].value, 10) || 5;
    var low = 0, high = 0;
    take.shots.forEach(function (s) { low += s.costLow; high += s.costHigh; });
    var envLow = low * takesPer, envHigh = high * takesPer;
    var move = "";
    if (takes.length > 1) {
      var prev = takes[takes.length - 2];
      var pl = 0, ph = 0;
      prev.shots.forEach(function (s) { pl += s.costLow; ph += s.costHigh; });
      var d = (low - pl) + (high - ph);
      var mid = d / 2;
      if (Math.abs(mid) > 0.005) {
        move = '<p class="calc-note">Take ' + prev.n + ' → take ' + take.n + ': ' +
          (mid > 0 ? "+" : "\u2212") + money(Math.abs(mid)).slice(1) + ' per take, ' +
          take.shots.length + ' shots vs ' + prev.shots.length + ', ' +
          (take.draftMode ? 'still on the draft tier' : 'flagship picks now that the prompt earns them') + '.</p>';
      }
    }
    els["cr-cost"].innerHTML =
      '<div class="cr-cost-grid">' +
      '<div class="calc-stat"><div class="calc-value">' + take.shots.length + '</div><div class="calc-label">Shots</div></div>' +
      '<div class="calc-stat"><div class="calc-value">' + money(low) + (high !== low ? '' + money(high) : '') + '</div><div class="calc-label">Per take</div></div>' +
      '<div class="calc-stat highlight"><div class="calc-value">' + money(envLow) + (envHigh !== envLow ? '' + money(envHigh) : '') + '</div><div class="calc-label">Envelope × ' + takesPer + ' takes</div></div>' +
      '</div>' + move +
      '<p class="calc-note" id="cr-prov">' + esc(provLine()) + ' Verify live before budgeting.</p>';
  }

  function renderFix(a) {
    var missing = a.layers.filter(function (l) { return !l.present; });
    if (!missing.length) {
      els["cr-fix"].innerHTML =
        '<div class="card"><h3>That\'s a locked prompt.</h3>' +
        '<p>All ten layers are directed. Nothing left to fix, print it.</p>' +
        '<p><button type="button" class="btn" id="cr-copy">Copy the final prompt</button></p></div>';
      wireCopy();
      return;
    }
    els["cr-fix"].innerHTML = missing.map(function (l) {
      var tech = techniqueFor(l.layer.id);
      var techHtml = tech ?
        '<p class="cr-tech"><strong>Library technique</strong>, <em>' + esc(tech.title) + '</em> ' +
        '<span class="calc-note">(' + esc(tech.cite) + ')</span><br>\u201c' + esc(tech.quote) + '\u201d<br>' +
        '<span class="calc-note">' + esc(tech.note) + '</span></p>' +
        '<p><button type="button" class="btn btn-sm cr-apply" data-apply="' + esc(tech.apply) + '">Apply this technique</button></p>'
        : "";
      return '<div class="card cr-fixcard"><h3>Missing: ' + esc(l.layer.name) + '</h3>' +
        '<p><em>Costs you:</em> ' + esc(l.layer.missing) + '</p>' +
        '<p class="calc-note">' + esc(l.layer.why) + '</p>' + techHtml + '</div>';
    }).join("");
  }

  function renderTakeLog() {
    els["cr-takes"].innerHTML = takes.map(function (t) {
      var low = 0, high = 0;
      t.shots.forEach(function (s) { low += s.costLow; high += s.costHigh; });
      var best = takes.length > 1 && t.score === Math.max.apply(null, takes.map(function (x) { return x.score; }));
      return '<li class="cr-take' + (best ? ' is-best' : '') + '">' +
        '<span class="cr-take-n">Take ' + t.n + '</span>' +
        '<span class="cr-take-g">' + esc(t.gradeWord) + ' · ' + t.score + '/100</span>' +
        '<span class="cr-take-s">' + t.shots.length + ' shot' + (t.shots.length === 1 ? '' : 's') + '</span>' +
        '<span class="cr-take-c">' + money(low) + (high !== low ? '' + money(high) : '') + '/take</span>' +
        (best ? '<span class="cr-take-best">best so far</span>' : '') +
        '<button type="button" class="btn btn-sm btn-ghost cr-greenlight" data-take="' + t.n + '">Green light &rarr;</button>' +
        '</li>';
    }).join("");
  }

  function wireCopy() {
    var btn = document.getElementById("cr-copy");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var best = takes.reduce(function (a, b) { return b.score >= a.score ? b : a; }, takes[0]);
      var txt = best ? best.prompt : els["cr-prompt"].value;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(function () {
          btn.textContent = "Copied";
          setTimeout(function () { btn.textContent = "Copy the final prompt"; }, 2000);
        });
      } else {
        window.prompt("Copy your final prompt:", txt);
      }
    });
  }

  /*  The roll: validate → analyze → shoot → cost → fix → log  */
  function roll(fromApply) {
    var text = els["cr-prompt"].value;
    if (!text.trim()) {
      els["cr-error"].hidden = false;
      els["cr-error"].textContent = "No prompt, no scene, type something, or load the weak sample.";
      els["cr-prompt"].focus();
      return;
    }
    els["cr-error"].hidden = true;
    var seconds = Math.min(10, Math.max(2, parseInt(els["cr-seconds"].value, 10) || 4));
    els["cr-seconds"].value = String(seconds);

    var a = analyze(text);
    var langFlag = detectLanguage(text);
    var gibberish = looksGibberish(text);
    renderGrade(a, langFlag, gibberish);
    renderLayers(a);

    if (gibberish || a.words < 2) {
      els["cr-shoot"].innerHTML =
        '<div class="empty-state"><p><strong>NO FOOTAGE</strong></p>' +
        '<p>Nothing directable in that. Load the weak sample and build it up in the fix bay.</p></div>';
      els["cr-cost"].innerHTML = '<p class="calc-note">No shots, no cost.</p>';
      renderFix(a);
    } else {
      var take = buildTake(text, seconds);
      renderShots(take);
      renderTimeline(take);
      renderCost(take);
      renderFix(a);
      renderTakeLog();
    }

    els["cr-results"].hidden = false;
    var h = els["cr-results"].querySelector("h2");
    h.setAttribute("tabindex", "-1");
    if (!fromApply) h.focus({ preventScroll: true });
  }

  /*  Scroll framing: reveals + hairline (decorative, enhancement-only)  */
  function initScroll() {
    var prog = document.createElement("div");
    prog.className = "cr-progress";
    prog.setAttribute("aria-hidden", "true");
    document.body.appendChild(prog);
    var st = document.createElement("style");
    st.textContent =
      ".cr-progress{position:fixed;top:0;left:0;z-index:60;height:3px;width:100%;" +
      "background:linear-gradient(90deg,var(--gold),var(--tungsten));transform-origin:0 50%;transform:scaleX(0);}" +
      "@media (prefers-reduced-motion:reduce){.cr-progress{display:none}}" +
      "@supports (animation-timeline:scroll()){" +
      ".cr-progress{animation:cr-progressbar linear both;animation-timeline:scroll()}}" +
      "@keyframes cr-progressbar{to{transform:scaleX(1)}}";
    document.head.appendChild(st);

    if (!MOTION_OK || !("IntersectionObserver" in window)) return;
    var els2 = document.querySelectorAll(".cr-reveal");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("cr-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    els2.forEach(function (el) { el.classList.add("cr-will-reveal"); io.observe(el); });
  }

  /*  Events  */
  var WEAK_SAMPLE = "a dog in a city";
  var STRONG_SAMPLE = "Mara, a weathered fisherwoman in her sixties, silver braid, oilskin coat, " +
    "mending a torn net on a fog-draped wooden dock at dawn; the camera pushes in slowly " +
    "from medium to close-up; cold blue dawn light with a warm lantern glow from frame left; " +
    "cinematic realism, 35mm film grain; quiet resilience; coat hem stirring in the sea breeze; " +
    "4K, shallow depth of field, natural skin texture. Exclude: morphing faces, extra limbs, flicker.";

  els["cr-roll"].addEventListener("click", function () { roll(false); });
  els["cr-sample-weak"].addEventListener("click", function () {
    els["cr-prompt"].value = WEAK_SAMPLE;
    roll(false);
  });
  els["cr-sample-strong"].addEventListener("click", function () {
    els["cr-prompt"].value = STRONG_SAMPLE;
    roll(false);
  });
  els["cr-clear"].addEventListener("click", function () {
    els["cr-prompt"].value = "";
    els["cr-results"].hidden = true;
    els["cr-prompt"].focus();
  });
  els["cr-takes-per"].addEventListener("change", function () {
    if (takes.length) renderCost(takes[takes.length - 1]);
  });
  els["cr-seconds"].addEventListener("change", function () { roll(true); });
  document.addEventListener("click", function (e) {
    var g = e.target.closest ? e.target.closest(".cr-greenlight") : null;
    if (g) {
      var tn = parseInt(g.getAttribute("data-take"), 10);
      var take = takes.filter(function (t) { return t.n === tn; })[0];
      if (take) {
        /* Cutting Room → Green Light bridge (wow wave 2): the take walks in
           with its final prompt and grade. Same bridge key as the Studio's;
           the kind tag keeps the payloads from colliding. */
        try {
          localStorage.setItem("afg-studio-bridge", JSON.stringify({
            v: 1, kind: "greenlight",
            prompt: take.prompt, score: take.score, gradeWord: take.gradeWord
          }));
        } catch (err) { /* storage unavailable, the page still opens */ }
        window.location.href = "greenlight.html";
      }
      return;
    }
    var b = e.target.closest ? e.target.closest(".cr-apply") : null;
    if (!b) return;
    var cur = els["cr-prompt"].value.trim();
    els["cr-prompt"].value = (cur ? cur.replace(/\s+$/, "") + " " : "") + b.getAttribute("data-apply");
    roll(true);
  });
  els["cr-prompt"].addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") roll(false);
  });

  /*  Boot: templates, then pricing, then the opening take  */
  PRICING = builtinPricing();

  function boot() {
    initScroll();
    var tplP = (typeof fetch === "function")
      ? fetch("prompt-templates.json").then(function (r) {
          if (!r.ok) throw new Error("templates " + r.status);
          return r.json();
        }).then(function (j) { return j.templates || []; })
      : Promise.resolve([]);
    /* r23: the facets file (the library's own shot data: framing,
       move, light per template) rides along so each shot can print
       its anatomy as a slate line. Optional by design: without it
       the shoot renders exactly as before, minus the anatomy line. */
    var facetP = (typeof fetch === "function")
      ? fetch("prompts-facets.json").then(function (r) {
          if (!r.ok) throw new Error("facets " + r.status);
          return r.json();
        }).then(function (j) { return j.facets || {}; })
        .catch(function () { return {}; })
      : Promise.resolve({});
    tplP.then(function (tpls) {
      return facetP.then(function (facets) {
        tpls.forEach(function (t) { if (facets[t.id]) t.facet = facets[t.id]; });
        return tpls;
      });
    }).then(function (tpls) {
      TEMPLATES = tpls.length ? tpls : [];
      if (!TEMPLATES.length) {
        els["cr-note"].innerHTML = '<p class="cr-flag" role="note"><strong>The prompt library didn\'t load.</strong> ' +
          'The shoot needs <code>prompt-templates.json</code>, check the connection and reload.</p>';
        return;
      }
      var badge = els["cr-badge"];
      if (window.ApiClient && typeof fetch === "function") {
        window.ApiClient.fetchWithFallback("/api/models-pricing", "data/v1/pricing.json", { badgeEl: badge })
          .then(function (res) {
            if ((res.source === "live" || res.source === "static") && res.data) {
              var next = normalizePricing(res.data);
              if (next.length) {
                PRICING = next;
                PROV = { kind: res.source === "live" ? "live" : "static", at: res.generatedAt };
              }
            } else if (badge) {
              badge.dataset.apiState = "none";
            }
            roll(true); // the opening take: the weak sample, shot as-is
          });
      } else {
        if (badge) badge.dataset.apiState = "none";
        roll(true);
      }
    }).catch(function () {
      els["cr-note"].innerHTML = '<p class="cr-flag" role="note"><strong>The prompt library didn\'t load.</strong> ' +
        'The shoot needs <code>prompt-templates.json</code>, check the connection and reload.</p>';
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
