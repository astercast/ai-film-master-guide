/* Anatomy of a prompt, interactive explorer.
   Nine layers + exclusion block from the prompt-anatomy field guide.
   Explore mode: hover/tap/focus any highlighted layer for its breakdown.
   Build mode: fill the nine layers, copy a production-ready prompt. */
(function () {
  "use strict";

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var LAYERS = [
    { id: "subject", num: 1, name: "Subject",
      sample: "Mara, a weathered fisherwoman in her sixties, silver braid, oilskin coat, hands scarred from nets,",
      what: "Who or what is in frame, with locked visual traits: age, wardrobe, distinguishing marks.",
      why: "Without a locked identity, every regeneration redesigns your character. Name three traits that never change.",
      missing: "Identity drift, a different face in every shot." },
    { id: "action", num: 2, name: "Micro-action",
      sample: "mending a torn net, fingers working the twine with practiced rhythm, one action only,",
      what: "One believable verb. Not three. Fingers working twine, not mending, laughing, and turning.",
      why: "Models execute one action well. Stacked actions collapse into mush or morphs.",
      missing: "Muddy motion and half-rendered gestures." },
    { id: "environment", num: 3, name: "Environment",
      sample: "on a fog-draped wooden dock at dawn, gulls circling overhead, dark water lapping the pilings, a distant buoy bell;",
      what: "Where, with subtle motion living in it. Gulls, water, fog.",
      why: "Dead backgrounds read as fake. Ambient motion sells reality more than detail does.",
      missing: "A stagey void; the subject floats in nothing." },
    { id: "camera", num: 4, name: "Camera behavior",
      sample: "the camera pushes in slowly from medium to close-up, gently stabilized, the move motivated by her hands;",
      what: "One intentional move, motivated by the scene, a push-in motivated by her hands.",
      why: "Every move needs a purpose. Ask what the move reveals or withholds.",
      missing: "Unmotivated drift; the camera wanders." },
    { id: "lighting", num: 5, name: "Lighting design",
      sample: "cold blue dawn light with a warm lantern glow from frame left, soft volumetric fog, long soft shadows;",
      what: "Explicit and physical: named sources, direction, quality. Not vibes, physics.",
      why: "\u201cNice lighting\u201d means nothing to a model. Named sources do.",
      missing: "The flat video look." },
    { id: "style", num: 6, name: "Visual style",
      sample: "cinematic realism, anamorphic frame, 35mm film grain, coastal drama;",
      what: "The style bible, one line, repeated verbatim in every prompt of the project.",
      why: "This is the only layer that survives a 90-minute film. Verbatim repetition is the consistency system.",
      missing: "Style drift across scenes." },
    { id: "tone", num: 7, name: "Emotional tone",
      sample: "quiet resilience, melancholy hope;",
      what: "The feeling of the shot.",
      why: "Aligns performance, light, and grade toward a single feeling.",
      missing: "Emotionally blank footage." },
    { id: "physics", num: 8, name: "Physics & motion",
      sample: "coat hem stirring in the sea breeze, mist drifting across frame, net fibers catching the lantern light;",
      what: "How things move: cloth, steam, hair, water behavior.",
      why: "Models render motion they are told about. Untold motion freezes.",
      missing: "Frozen, plasticky movement." },
    { id: "render", num: 9, name: "Rendering quality",
      sample: "4K, shallow depth of field, stable architecture, natural skin texture.",
      what: "Finish modifiers that set the quality floor.",
      why: "Set the floor before generation, not after in post.",
      missing: "Soft, mushy output." },
    { id: "exclusion", num: 10, name: "Exclusion block",
      sample: "Exclude: morphing faces, extra limbs, warping wood, flicker, text in frame.",
      what: "The never-list. Put it in every prompt, not just the risky ones.",
      why: "Excluding failure modes is cheaper than fixing them in post.",
      missing: "The usual suspects, on screen." }
  ];

  var els = {
    tabExplore: document.getElementById("anat-tab-explore"),
    tabBuild: document.getElementById("anat-tab-build"),
    explore: document.getElementById("anat-explore"),
    build: document.getElementById("anat-build"),
    sample: document.getElementById("anat-sample"),
    layerNav: document.getElementById("anat-layers"),
    detail: document.getElementById("anat-detail"),
    form: document.getElementById("anat-form"),
    preview: document.getElementById("anat-preview"),
    copy: document.getElementById("anat-copy")
  };
  if (!els.sample || !els.layerNav) return;

  /* ---------- explore mode ---------- */

  function layerById(id) {
    for (var i = 0; i < LAYERS.length; i++) if (LAYERS[i].id === id) return LAYERS[i];
    return null;
  }

  els.sample.innerHTML = LAYERS.map(function (l) {
    return '<button type="button" class="lyr" data-layer="' + l.id + '" aria-describedby="anat-detail">' +
      esc(l.sample) + "</button>";
  }).join(" ");

  els.layerNav.innerHTML = LAYERS.map(function (l) {
    return '<li><button type="button" class="lyr" data-layer="' + l.id + '" aria-describedby="anat-detail">' +
      '<span class="lyr-num">' + l.num + "</span> " + esc(l.name) + "</button></li>";
  }).join("");

  function clearActive() {
    document.querySelectorAll("#anat-explore .lyr.active").forEach(function (b) {
      b.classList.remove("active");
      b.removeAttribute("aria-current");
    });
  }

  function select(id, focusDetail) {
    var l = layerById(id);
    if (!l) return;
    clearActive();
    document.querySelectorAll('#anat-explore .lyr[data-layer="' + id + '"]').forEach(function (b) {
      b.classList.add("active");
      b.setAttribute("aria-current", "true");
    });
    els.detail.innerHTML =
      "<h3>Layer " + l.num + ", " + esc(l.name) + "</h3>" +
      '<dl><dt>What it is</dt><dd>"' + esc(l.sample) + '", ' + esc(l.what) + "</dd>" +
      "<dt>Why it matters</dt><dd>" + esc(l.why) + "</dd>" +
      "<dt>Missing it gives you</dt><dd>" + esc(l.missing) + "</dd></dl>";
    if (focusDetail) {
      els.detail.setAttribute("tabindex", "-1");
      els.detail.focus({ preventScroll: true });
    }
  }

  els.explore.addEventListener("click", function (e) {
    var b = e.target.closest(".lyr");
    if (b) select(b.getAttribute("data-layer"), false);
  });
  els.explore.addEventListener("mouseover", function (e) {
    var b = e.target.closest(".lyr");
    if (b && !b.classList.contains("active")) select(b.getAttribute("data-layer"), false);
  });
  els.explore.addEventListener("focusin", function (e) {
    var b = e.target.closest(".lyr");
    if (b) select(b.getAttribute("data-layer"), false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !els.explore.hidden) {
      clearActive();
      els.detail.innerHTML = '<p class="calc-note">Pick a layer above, in the prompt or the list, to see what it does, why it matters, and what breaks without it.</p>';
    }
  });

  /* ---------- tabs ---------- */

  function showTab(which) {
    var explore = which === "explore";
    els.tabExplore.setAttribute("aria-pressed", explore ? "true" : "false");
    els.tabBuild.setAttribute("aria-pressed", explore ? "false" : "true");
    els.explore.hidden = !explore;
    els.build.hidden = explore;
  }
  els.tabExplore.addEventListener("click", function () { showTab("explore"); });
  els.tabBuild.addEventListener("click", function () { showTab("build"); });

  /* ---------- build mode ---------- */

  var FIELDS = [
    ["subject", "1 · Subject", "e.g. Mara, a weathered fisherwoman in her sixties, silver braid, oilskin coat"],
    ["action", "2 · Micro-action", "e.g. mending a torn net, fingers working the twine"],
    ["environment", "3 · Environment", "e.g. fog-draped wooden dock at dawn, gulls circling"],
    ["camera", "4 · Camera behavior", "e.g. slow push-in from medium to close-up, motivated by her hands"],
    ["lighting", "5 · Lighting design", "e.g. cold blue dawn light, warm lantern glow from frame left"],
    ["style", "6 · Visual style", "e.g. cinematic realism, anamorphic, 35mm film grain, keep identical across the project"],
    ["tone", "7 · Emotional tone", "e.g. quiet resilience, melancholy hope"],
    ["physics", "8 · Physics & motion", "e.g. coat hem stirring in the sea breeze, mist drifting"],
    ["render", "9 · Rendering quality", "e.g. 4K, shallow depth of field, stable architecture"]
  ];

  els.form.innerHTML = FIELDS.map(function (f) {
    return '<div class="field"><label for="anat-f-' + f[0] + '">' + esc(f[1]) + "</label>" +
      '<input class="input" type="text" id="anat-f-' + f[0] + '" data-layer-field="' + f[0] + '" placeholder="' + esc(f[2]) + '"></div>';
  }).join("") +
    '<div class="field"><label><input type="checkbox" id="anat-f-exclude" checked> Include the exclusion block (recommended)</label></div>';

  var EXCLUDE_TEXT = "Exclude: morphing faces, extra limbs, warping architecture, flicker, text in frame.";

  function buildPrompt() {
    var parts = [];
    els.form.querySelectorAll("input[data-layer-field]").forEach(function (inp) {
      var v = inp.value.trim();
      if (v) parts.push(v.replace(/[.\s]+$/, "") + ".");
    });
    var excl = document.getElementById("anat-f-exclude");
    if (excl && excl.checked) parts.push(EXCLUDE_TEXT);
    return parts.join(" ");
  }

  function renderBuild() {
    var p = buildPrompt();
    els.preview.textContent = p || "Fill in the layers above, your prompt assembles here, in order.";
    els.copy.disabled = !p;
  }

  els.form.addEventListener("input", renderBuild);
  els.form.addEventListener("change", renderBuild);

  els.copy.addEventListener("click", function () {
    var p = buildPrompt();
    if (!p || els.copy.disabled) return;
    function done(ok) {
      els.copy.textContent = ok ? "Copied" : "Copy failed";
      setTimeout(function () { els.copy.textContent = "Copy prompt"; }, 1600);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(p).then(function () { done(true); }, function () { done(false); });
    } else { done(false); }
  });

  renderBuild();
})();
