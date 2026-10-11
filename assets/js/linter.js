/* Prompt linter — paste any prompt, get a structural analysis against the
   ten-layer prompt anatomy. Client-side heuristics: this checks structure,
   not taste. Layer metadata mirrors assets/js/anatomy.js. */
(function () {
  "use strict";

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* Each layer: detection keywords (lowercase, matched as substrings on
     word boundaries) plus the teaching copy from the anatomy explorer. */
  var LAYERS = [
    { id: "subject", num: 1, name: "Subject",
      keys: ["woman", "man", "person", "people", "girl", "boy", "child", "elderly", "figure",
             "fisherwoman", "astronaut", "warrior", "detective", "chef", "dancer", "soldier",
             "king", "queen", "robot", "android", "creature", "wearing", "dressed", "coat",
             "uniform", "dress", "suit", "armor", "aged", "young", "old man", "old woman",
             "sixties", "twenties", "thirties", "protagonist", "character", "subject"],
      why: "Without a locked identity, every regeneration redesigns your character.",
      missing: "Identity drift — a different face in every shot.",
      tip: "Name the subject and lock 2–3 visual traits that never change (age, wardrobe, distinguishing marks)." },
    { id: "action", num: 2, name: "Micro-action",
      keys: ["walking", "running", "turning", "looking", "mending", "pouring", "lifting",
             "reaching", "sitting", "standing", "dancing", "fighting", "driving", "flying",
             "swimming", "climbing", "falling", "smiling", "laughing", "crying", "speaking",
             "whispering", "working", "playing", "chasing", "hiding", "emerging", "gazing",
             "staring", "waving", "pointing", "grabbing", "holding", "carrying", "pushing",
             "pulling", "opening", "closing", "knocking", "mends", "walks", "turns", "looks"],
      why: "Models execute one action well. Stacked actions collapse into mush or morphs.",
      missing: "Muddy motion and half-rendered gestures.",
      tip: "Give the subject exactly one believable verb — fingers working twine, not mending, laughing, and turning." },
    { id: "environment", num: 3, name: "Environment",
      keys: ["room", "street", "dock", "forest", "city", "desert", "beach", "mountain",
             "alley", "rooftop", "kitchen", "office", "station", "bridge", "cave", "castle",
             "village", "harbor", "field", "garden", "interior", "exterior", "landscape",
             "background", "fog", "mist", "rain", "snow", "dawn", "dusk", "night", "sunset",
             "sunrise", "overhead", "around", "behind", "beneath", "gulls", "trees"],
      why: "Dead backgrounds read as fake. Ambient motion sells reality more than detail does.",
      missing: "A stagey void; the subject floats in nothing.",
      tip: "Place the shot somewhere with subtle motion living in it — gulls, water, fog, traffic." },
    { id: "camera", num: 4, name: "Camera behavior",
      keys: ["camera", "push-in", "push in", "pull-back", "pull back", "dolly", "pan",
             "tilt", "tracking", "crane", "aerial", "drone", "handheld", "steadicam",
             "close-up", "closeup", "medium shot", "wide shot", "establishing", "pov",
             "over-the-shoulder", "low angle", "high angle", "dutch angle", "zoom",
             "orbit", "static shot", "locked-off", "slow motion", "timelapse"],
      why: "Every move needs a purpose. Ask what the move reveals or withholds.",
      missing: "Unmotivated drift; the camera wanders.",
      tip: "Direct one intentional camera move and motivate it — a push-in motivated by the subject's hands." },
    { id: "lighting", num: 5, name: "Lighting design",
      keys: ["light", "lighting", "lit", "glow", "glowing", "shadow", "shadows",
             "volumetric", "neon", "sunlight", "moonlight", "candlelight", "lantern",
             "rim light", "backlit", "softbox", "golden hour", "blue hour", "chiaroscuro",
             "silhouette", "lens flare", "practical", "fluorescent", "torchlight"],
      why: "\u201cNice lighting\u201d means nothing to a model. Named sources do.",
      missing: "The flat video look.",
      tip: "Name the sources, their direction, and quality — cold dawn light plus a warm lantern from frame left." },
    { id: "style", num: 6, name: "Visual style",
      keys: ["cinematic", "photorealistic", "photoreal", "film grain", "35mm", "anamorphic",
             "16mm", "70mm", "anime", "stylized", "painterly", "noir", "documentary",
             "vintage", "retro", "cyberpunk", "fantasy", "sci-fi", "horror", "western",
             "art house", "blockbuster", "music video", "commercial", "style"],
      why: "This is the only layer that survives a 90-minute film. Verbatim repetition is the consistency system.",
      missing: "Style drift across scenes.",
      tip: "Write your style bible in one line and repeat it verbatim in every prompt of the project." },
    { id: "tone", num: 7, name: "Emotional tone",
      keys: ["melancholy", "tense", "tension", "joyful", "eerie", "calm", "dramatic",
             "somber", "hopeful", "bleak", "warm", "cold", "ominous", "dreamlike",
             "nostalgic", "anxious", "serene", "haunting", "intimate", "epic", "quiet",
             "melancholic", "bittersweet", "foreboding", "mood"],
      why: "Aligns performance, light, and grade toward a single feeling.",
      missing: "Emotionally blank footage.",
      tip: "Name the feeling of the shot in two words — quiet resilience, not 'emotional'." },
    { id: "physics", num: 8, name: "Physics & motion",
      keys: ["wind", "breeze", "drifting", "flowing", "swaying", "rippling", "steam",
             "dust", "smoke", "waves", "fluttering", "billowing", "splashing", "dripping",
             "swirling", "cloth", "hair", "fabric", "leaves", "petals", "embers", "sparks",
             "rain falling", "snow falling", "stirring", "motion"],
      why: "Models render motion they are told about. Untold motion freezes.",
      missing: "Frozen, plasticky movement.",
      tip: "Say how things move — coat hem stirring in the sea breeze, mist drifting across frame." },
    { id: "render", num: 9, name: "Rendering quality",
      keys: ["4k", "8k", "high resolution", "sharp", "detailed", "detail", "depth of field",
             "shallow depth", "bokeh", "texture", "skin texture", "ray tracing", "octane",
             "unreal engine", "crisp", "clean", "quality", "masterpiece", "intricate"],
      why: "Set the floor before generation, not after in post.",
      missing: "Soft, mushy output.",
      tip: "Set the quality floor: resolution, depth of field, texture — before you generate, not after." },
    { id: "exclusion", num: 10, name: "Exclusion block",
      keys: ["exclude", "excludes", "excluding", "avoid", "no extra", "without",
             "never", "negative prompt", "--no", "do not include", "no text",
             "no watermark", "no blur"],
      why: "Excluding failure modes is cheaper than fixing them in post.",
      missing: "The usual suspects, on screen.",
      tip: "Add the never-list to every prompt: morphing faces, extra limbs, warping, flicker, text in frame." }
  ];

  var WEAK_WORDS = ["nice", "beautiful", "amazing", "awesome", "cool", "good", "great",
    "stunning", "gorgeous", "incredible", "fantastic", "very", "really", "quite",
    "somewhat", "thing", "things", "stuff", "something"];

  var WEAK_VERBS = ["is", "are", "was", "were", "has", "have", "had", "does", "do",
    "makes", "make", "gets", "get", "goes", "go"];

  function wordRe(key) {
    return new RegExp("(^|[^a-z])" + key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "([^a-z]|$)");
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
    var weakVerbHits = WEAK_VERBS.filter(function (w) { return wordRe(w).test(t); });
    // Adjective density: crude proxy — words ending in common adjective suffixes
    var adjRe = /(ful|ous|ive|al|ic|y|ed)$/;
    var adjCount = words.filter(function (w) {
      return adjRe.test(w.toLowerCase()) && w.length > 4;
    }).length;
    var presentCount = layers.filter(function (l) { return l.present; }).length;
    // Score: 70% layers, 20% specificity (length + adjectives, capped), 10% no weak words
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
      weakHits: weakHits, weakVerbHits: weakVerbHits, adjCount: adjCount,
      score: score
    };
  }

  function grade(score) {
    if (score >= 85) return ["Excellent", "This prompt directs all ten layers. Generate with confidence."];
    if (score >= 70) return ["Strong", "Solid structure — fill the remaining gaps for a locked shot."];
    if (score >= 50) return ["Workable", "The bones are here, but missing layers will show on screen."];
    if (score >= 30) return ["Thin", "The model will improvise everything you didn't direct. It will improvise badly."];
    return ["Bare", "This is a wish, not a direction. Build it up layer by layer."];
  }

  var els = {};
  ["lint-input", "lint-run", "lint-clear", "lint-sample", "lint-results",
   "lint-error", "lint-score", "lint-layers", "lint-weak", "lint-fixes"].forEach(function (id) {
    els[id] = document.getElementById(id);
  });

  var SAMPLE = "Mara, a weathered fisherwoman in her sixties — silver braid, oilskin coat, " +
    "mending a torn net on a fog-draped wooden dock at dawn; the camera pushes in slowly " +
    "from medium to close-up; cold blue dawn light with a warm lantern glow from frame left; " +
    "cinematic realism, 35mm film grain; quiet resilience; coat hem stirring in the sea breeze; " +
    "4K, shallow depth of field, natural skin texture. Exclude: morphing faces, extra limbs, flicker.";

  function render(r) {
    var g = grade(r.score);
    els["lint-score"].innerHTML =
      '<div class="lint-grade"><span class="lint-num">' + r.score + '</span>' +
      '<div><strong>' + esc(g[0]) + '</strong><p>' + esc(g[1]) + '</p>' +
      '<p class="calc-note">' + r.words + ' words · ' + r.presentCount + ' of 10 layers present. ' +
      'Heuristic check — it measures structure, not taste.</p></div></div>';

    els["lint-layers"].innerHTML = r.layers.map(function (l) {
      var cls = l.present ? "is-present" : "is-missing";
      var mark = l.present ? "✓" : "✕";
      var inner = '<span class="lint-mark" aria-hidden="true">' + mark + '</span> ' +
        "<strong>Layer " + l.layer.num + " — " + esc(l.layer.name) + "</strong>";
      if (!l.present) {
        inner += '<p class="lint-why"><em>Missing it gives you:</em> ' + esc(l.layer.missing) + "</p>" +
          '<p class="lint-tip">' + esc(l.layer.tip) + "</p>" +
          '<p><button type="button" class="btn btn-sm btn-ghost lint-scaffold" data-layer="' +
          l.layer.id + '">Copy a starter line</button> ' +
          '<a class="btn btn-sm" href="anatomy.html">Fix in the builder →</a></p>';
      } else if (l.hits.length) {
        inner += ' <span class="calc-note">matched: ' + esc(l.hits.slice(0, 4).join(", ")) + "</span>";
      }
      return '<li class="lint-layer ' + cls + '">' + inner + "</li>";
    }).join("");

    var weakHtml = "";
    if (r.weakHits.length) {
      weakHtml += "<h3>Vague words to replace</h3><p>" +
        r.weakHits.map(function (w) { return "<code>" + esc(w) + "</code>"; }).join(" ") +
        "</p><p class=\"calc-note\">\u201cNice lighting\u201d means nothing to a model. " +
        "Swap each for something physical and specific.</p>";
    } else {
      weakHtml += "<h3>Language</h3><p>No vague filler words detected. Good.</p>";
    }
    if (r.weakVerbHits.length > 3) {
      weakHtml += "<p class=\"calc-note\">Heavy on static verbs (" +
        esc(r.weakVerbHits.slice(0, 5).join(", ")) +
        ") — the action layer probably needs one strong verb.</p>";
    }
    els["lint-weak"].innerHTML = weakHtml;

    var missing = r.layers.filter(function (l) { return !l.present; });
    els["lint-fixes"].innerHTML = missing.length ?
      '<p><a class="btn" href="workshop.html">Continue in the prompt workshop →</a> ' +
      '<a class="btn btn-ghost" href="anatomy.html">Build it layer by layer →</a></p>' :
      '<p><a class="btn" href="workshop.html">This one is ready — open the workshop →</a></p>';

    els["lint-results"].hidden = false;
    els["lint-results"].querySelector("h2").setAttribute("tabindex", "-1");
    els["lint-results"].querySelector("h2").focus({ preventScroll: true });
  }

  function scaffoldText(id) {
    var starters = {
      subject: "[Name], a [age] [occupation] — [distinguishing trait], [wardrobe],",
      action: "[one verb]ing [the object], [how] — one action only,",
      environment: "in/on [place] at [time], [ambient motion in the background];",
      camera: "the camera [move] from [framing] to [framing], motivated by [what];",
      lighting: "[quality] [source] light from [direction], [secondary source];",
      style: "[style bible line — repeat verbatim every prompt];",
      tone: "[two-word feeling];",
      physics: "[object] [moving how] in the [wind/light];",
      render: "[resolution], [depth of field], [texture];",
      exclusion: "Exclude: morphing faces, extra limbs, warping, flicker, text in frame."
    };
    return starters[id] || "";
  }

  function run() {
    var text = els["lint-input"].value;
    if (!text.trim()) {
      els["lint-error"].hidden = false;
      els["lint-error"].textContent = "Paste a prompt first — the linter needs something to read.";
      return;
    }
    els["lint-error"].hidden = true;
    render(analyze(text));
  }

  if (!els["lint-input"]) return;

  els["lint-run"].addEventListener("click", run);
  els["lint-sample"].addEventListener("click", function () {
    els["lint-input"].value = SAMPLE;
    run();
  });
  els["lint-clear"].addEventListener("click", function () {
    els["lint-input"].value = "";
    els["lint-results"].hidden = true;
    els["lint-input"].focus();
  });
  document.addEventListener("click", function (e) {
    var b = e.target.closest(".lint-scaffold");
    if (!b) return;
    var txt = scaffoldText(b.getAttribute("data-layer"));
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(function () {
        b.textContent = "Copied — paste it into your prompt";
        setTimeout(function () { b.textContent = "Copy a starter line"; }, 2000);
      });
    } else {
      window.prompt("Copy this starter line:", txt);
    }
  });
})();
