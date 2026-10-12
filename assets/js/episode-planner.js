/* Episode planner — series setup → episode-block planner → arc tracker.
   Grounded in craft/episodic-shortform.md (the AI mini-drama pipeline).
   Storage: localStorage "afg-episode-series" (one saved series + its blocks + log). */
(function () {
  "use strict";

  var STORE_KEY = "afg-episode-series";
  var BRIDGE_KEY = "afg-studio-bridge";

  function load() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || "null") || null; }
    catch (e) { return null; }
  }
  function save(state) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* private mode: no persistence */ }
  }
  function blankState() {
    return {
      title: "", logline: "", hashtag: "",
      cast: [{ name: "", voice: "", anchor: "" }],
      blocks: {},       /* episodeNumber -> block */
      log: [],          /* episode log entries */
      nextEpisode: 1
    };
  }

  /* Format presets (wave 17): per-format episode-block skeletons + runtime band.
     Bands are genre-plastic craft guidance, not platform settings. */
  var FORMAT_PRESETS = {
    minidrama: {
      label: "Mini-drama", band: [60, 150], spb: 15,
      emotion: "longing",
      stake: "Mia took a taxi alone to find her daddy",
      hook: "Toddler alone in the back of a night taxi, city lights",
      beats: [
        "Hook: Mia alone in the taxi at night",
        "The driver asks where to",
        "Flashback: why she is going",
        "Turn: the driver realizes she is not lost — she is determined"
      ],
      turn: "Beat 4: the driver realizes she's not lost — she's determined",
      cliff: "The taxi stops at the wrong address — headlights, cut",
      scenes: "taxi night exterior; Mia clutching coat; driver sees her; wrong-address stop"
    },
    pov: {
      label: "POV series", band: [30, 90], spb: 12,
      emotion: "dread",
      stake: "You borrowed your roommate's jacket — the stain won't come out",
      hook: "Your hands scrubbing fabric in a bathroom sink, coffee spreading",
      beats: [
        "Hook: the spill, frozen mid-panic",
        "Flashback: the roommate lending it this morning",
        "The knock at the door — she's home early",
        "Turn: the designer label — it cost four figures"
      ],
      turn: "Beat 4: the designer label — it cost four figures",
      cliff: "The bathroom door handle turns — freeze on your face",
      scenes: "sink scrub close-up; flashback handoff; designer label macro; door handle mid-turn"
    },
    daylife: {
      label: "Day-in-the-life", band: [15, 60], spb: 10,
      emotion: "comfort",
      stake: "Rin the night-shift barista makes the 2 AM regular's drink before he orders",
      hook: "Espresso machine steaming in a dark shop window, rain on glass",
      beats: [
        "Hook: rain on the window, empty café",
        "The regular's shadow at the door",
        "Turn: Rin is already steaming the milk — she remembered"
      ],
      turn: "Beat 3: Rin is already steaming the milk — she remembered",
      cliff: "He slides a folded note across the counter — freeze before it opens",
      scenes: "rainy window; door shadow; steaming milk close-up; folded note mid-slide"
    },
    revenge: {
      label: "Revenge arc", band: [60, 150], spb: 15,
      emotion: "triumph",
      stake: "Nadia exposes the partner who stole her designs — at his own launch event",
      hook: "A runway spotlight swinging onto a garment that is unmistakably hers",
      beats: [
        "Hook: the crowd gasps at her stolen collection",
        "Nadia in the back row, phone raised, recording",
        "Turn: she live-posts the original sketches — timestamped two years earlier",
        "The audience's phones light up, one by one"
      ],
      turn: "Beat 3: she live-posts the original sketches — timestamped two years earlier",
      cliff: "The partner spots her in the crowd — freeze on his face",
      scenes: "spotlight garment; back-row recording; timestamped sketches on phone; his frozen face"
    },
    interactive: {
      label: "Interactive", band: [60, 150], spb: 15,
      emotion: "suspense",
      stake: "Lena finds a door in her apartment that was not there yesterday",
      hook: "A door where a wall should be, light leaking underneath",
      beats: [
        "Hook: the impossible door",
        "The vote: she knocks — or walks away (the decision beat, freeze on her hand; the TikTok comment poll asks — up to 5 options)",
        "She follows the winning choice — the consequence plays out",
        "Turn: what is behind the door reframes the question"
      ],
      turn: "Beat 4: what is behind the door reframes the question",
      cliff: "The next decision point — freeze before the poll deadline",
      scenes: "impossible door close-up; decision-beat freeze (native poll UI asks, no burned text); consequence beat; decision-point cliffhanger"
    }
  };
  var DEFAULT_FORMAT = "minidrama";
  /* "custom" is a real format choice — it just has no preset skeleton. */
  var ALL_FORMATS = ["minidrama", "pov", "daylife", "revenge", "interactive", "custom"];

  var els = {
    title: document.getElementById("ep-title"),
    logline: document.getElementById("ep-logline"),
    hashtag: document.getElementById("ep-hashtag"),
    castList: document.getElementById("ep-cast-list"),
    addCast: document.getElementById("ep-cast-add"),
    seriesMsg: document.getElementById("ep-series-msg"),
    saveSeries: document.getElementById("ep-save-series"),
    clearSeries: document.getElementById("ep-clear-series"),
    epNum: document.getElementById("epb-num"),
    emotion: document.getElementById("epb-emotion"),
    stake: document.getElementById("epb-stake"),
    hook: document.getElementById("epb-hook"),
    beats: document.getElementById("epb-beats"),
    beatAdd: document.getElementById("epb-beat-add"),
    turn: document.getElementById("epb-turn"),
    cliff: document.getElementById("epb-cliff"),
    cliffTpl: document.getElementById("epb-cliff-tpl"),
    cliffTplApply: document.getElementById("epb-cliff-apply"),
    scenes: document.getElementById("epb-scenes"),
    blockMsg: document.getElementById("epb-msg"),
    saveBlock: document.getElementById("epb-save"),
    newBlock: document.getElementById("epb-new"),
    blocksList: document.getElementById("epb-blocks"),
    blocksEmpty: document.getElementById("epb-blocks-empty"),
    sendSeries: document.getElementById("epb-send-series"),
    sendRun: document.getElementById("epb-send-run"),
    formatRadios: document.querySelectorAll('input[name="epf-format"]'),
    applyFormat: document.getElementById("epf-apply"),
    spb: document.getElementById("epf-spb"),
    runtime: document.getElementById("epf-runtime"),
    captionDraft: document.getElementById("epb-caption-draft"),
    captionOut: document.getElementById("epb-caption-out"),
    captionRow: document.getElementById("epb-caption-row"),
    captionCopy: document.getElementById("epb-caption-copy"),
    logList: document.getElementById("epl-list"),
    logEmpty: document.getElementById("epl-empty"),
    logEp: document.getElementById("epl-ep"),
    logTitle: document.getElementById("epl-title"),
    logLesson: document.getElementById("epl-lesson"),
    logAdd: document.getElementById("epl-add")
  };
  if (!els.title) return; /* not on this page */

  var state = load() || blankState();

  /* ---------------- series setup ---------------- */

  function castRow(i, c) {
    var row = document.createElement("div");
    row.className = "cast-row";
    row.innerHTML =
      '<div class="field"><label for="ep-cast-name-' + i + '">Character ' + (i + 1) + ' name</label>' +
      '<input class="input" type="text" id="ep-cast-name-' + i + '" value="' + esc(c.name) + '" placeholder="e.g. Mia"></div>' +
      '<div class="field"><label for="ep-cast-voice-' + i + '">Voice ID</label>' +
      '<input class="input" type="text" id="ep-cast-voice-' + i + '" value="' + esc(c.voice) + '" placeholder="e.g. avocado_v2:MAI_03"></div>' +
      '<div class="field"><label for="ep-cast-anchor-' + i + '">Anchor (one line)</label>' +
      '<input class="input" type="text" id="ep-cast-anchor-' + i + '" value="' + esc(c.anchor) + '" placeholder="fixed visual description"></div>' +
      '<div class="field field-actions"><button type="button" class="btn btn-ghost btn-sm ep-cast-del" data-i="' + i + '">Remove</button></div>';
    return row;
  }
  function renderCast() {
    els.castList.innerHTML = "";
    state.cast.forEach(function (c, i) { els.castList.appendChild(castRow(i, c)); });
    els.castList.querySelectorAll(".ep-cast-del").forEach(function (b) {
      b.addEventListener("click", function () {
        readCast();
        state.cast.splice(parseInt(b.dataset.i, 10), 1);
        if (state.cast.length === 0) state.cast = [{ name: "", voice: "", anchor: "" }];
        renderCast();
      });
    });
  }
  function readCast() {
    var cast = [];
    els.castList.querySelectorAll(".cast-row").forEach(function (row) {
      var inputs = row.querySelectorAll("input");
      if (inputs.length < 3) return;
      cast.push({ name: inputs[0].value.trim(), voice: inputs[1].value.trim(), anchor: inputs[2].value.trim() });
    });
    state.cast = cast.length ? cast : [{ name: "", voice: "", anchor: "" }];
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function renderSeries() {
    els.title.value = state.title;
    els.logline.value = state.logline;
    els.hashtag.value = state.hashtag;
    renderCast();
  }

  function msg(el, text, ok) {
    el.hidden = false;
    el.textContent = text;
    el.className = "calc-note" + (ok === false ? " td-error" : "");
  }

  els.addCast.addEventListener("click", function () {
    readCast();
    state.cast.push({ name: "", voice: "", anchor: "" });
    renderCast();
    var rows = els.castList.querySelectorAll(".cast-row");
    var last = rows[rows.length - 1].querySelector("input");
    if (last) last.focus();
  });
  els.saveSeries.addEventListener("click", function () {
    state.title = els.title.value.trim();
    state.logline = els.logline.value.trim();
    state.hashtag = els.hashtag.value.trim().replace(/^#?/, "#");
    readCast();
    var locked = state.cast.filter(function (c) { return c.name && c.voice && c.anchor; });
    save(state);
    if (!state.title) { msg(els.seriesMsg, "Series saved — give it a title when you have one.", true); return; }
    if (locked.length === 0) {
      msg(els.seriesMsg, "Series saved — but no character is fully locked yet (name + voice + anchor). Gate G0 needs at least one.", false);
    } else {
      msg(els.seriesMsg, "Series locked: " + locked.length + " character" + (locked.length === 1 ? "" : "s") + " with anchor + voice. (G0: bible)", true);
    }
  });
  els.clearSeries.addEventListener("click", function () {
    if (confirm("Delete the saved series, all episode blocks, and the arc log from this browser?")) {
      state = blankState();
      save(state);
      renderSeries();
      renderBlockForm(state.nextEpisode);
      renderBlocks();
      renderLog();
      msg(els.seriesMsg, "Cleared. Fresh slate.", true);
    }
  });

  /* ---------------- episode-block planner ---------------- */

  function beatInputs() {
    var beats = [];
    els.beats.querySelectorAll("input").forEach(function (inp) {
      beats.push(inp.value.trim());
    });
    return beats;
  }
  function renderBeatInputs(list) {
    els.beats.innerHTML = "";
    (list && list.length ? list : [""]).forEach(function (b, i) {
      var div = document.createElement("div");
      div.className = "field";
      var label = document.createElement("label");
      label.htmlFor = "epb-beat-" + i;
      label.textContent = "Beat " + (i + 1);
      var inp = document.createElement("input");
      inp.className = "input";
      inp.type = "text";
      inp.id = "epb-beat-" + i;
      inp.value = b;
      inp.placeholder = i === 0 ? "e.g. Hook: Mia alone in the taxi at night" : "e.g. The driver asks where to";
      div.appendChild(label);
      div.appendChild(inp);
      els.beats.appendChild(div);
    });
  }
  /* ---------------- format presets + runtime estimator ---------------- */

  function currentFormat() {
    var sel = document.querySelector('input[name="epf-format"]:checked');
    var v = sel && sel.value;
    return ALL_FORMATS.indexOf(v) >= 0 ? v : DEFAULT_FORMAT;
  }
  function formatBand() {
    var p = FORMAT_PRESETS[currentFormat()];
    return p ? p.band : [60, 150];
  }
  function applyPreset(key) {
    var p = FORMAT_PRESETS[key];
    if (!p) {
      /* custom: blank the block skeleton, keep the format + estimator */
      els.emotion.value = ""; els.stake.value = ""; els.hook.value = "";
      renderBeatInputs([]);
      els.turn.value = ""; els.cliff.value = ""; els.scenes.value = "";
      els.spb.value = 15;
      estimate();
      msg(els.blockMsg, "Custom format — blank block, runtime band is the 60–150s mini-drama default.", true);
      return;
    }
    els.emotion.value = p.emotion;
    els.stake.value = p.stake;
    els.hook.value = p.hook;
    renderBeatInputs(p.beats);
    els.turn.value = p.turn;
    els.cliff.value = p.cliff;
    els.scenes.value = p.scenes;
    els.spb.value = p.spb;
    estimate();
    msg(els.blockMsg, "Format template applied: " + p.label + " — edit every line to make it yours, then save.", true);
  }
  /* Runtime estimator: beats × seconds-per-beat vs the format's runtime band.
     This is the dialogue-budget rule applied at planning time: voice must
     total the estimate ±10% before any frame is generated (the golden rule). */
  function estimate() {
    var beats = beatInputs().filter(Boolean).length;
    var spb = Math.max(1, parseInt(els.spb.value, 10) || 15);
    var band = formatBand();
    if (!beats) {
      els.runtime.textContent = "Add beats above to estimate the runtime.";
      els.runtime.className = "calc-note";
      return;
    }
    var est = beats * spb;
    var verdict, cls = "calc-note";
    if (est < band[0]) {
      verdict = " Too short for this format: add beats or widen seconds-per-beat — or the emotion has no room to land.";
      cls += " td-error";
    } else if (est > band[1]) {
      verdict = " Too long for one emotion: split the episode (the two-emotions rule).";
      cls += " td-error";
    } else {
      verdict = " Inside the " + band[0] + "–" + band[1] + "s band. Now lock voice at ≈" + est + "s ±10% before generating a frame (the golden rule).";
    }
    els.runtime.textContent = "≈" + est + "s (" + beats + " beats × " + spb + "s). " + verdict;
    els.runtime.className = cls;
  }
  /* ---------------- one-emotion discipline (wave 38) ---------------- */

  /* Curated one-word emotion vocabulary for the one-emotion-per-episode rule.
     The emotion input is free text with a datalist of suggestions; the save
     gate below scans the block's other fields for a SECOND emotion word and
     refuses the save, naming the word and the field it was found in. */
  var EMOTIONS = ["longing", "dread", "grief", "relief", "triumph", "suspense",
    "comfort", "heartbreak", "defiance", "tenderness", "guilt", "joy"];
  var EMOTION_PATTERNS = {
    longing: /\blonging\b|\blonged\b/i,
    dread: /\bdread\w*\b/i,
    grief: /\bgrief\b|\bgrieving\b|\bgrieved\b/i,
    relief: /\brelief\b|\brelieved\b|\brelieving\b/i,
    triumph: /\btriumph\w*\b|\btriumphant\b/i,
    suspense: /\bsuspense\w*\b/i,
    comfort: /\bcomfort\w*\b/i,
    heartbreak: /\bheartbreak\b|\bheartbroken\b/i,
    defiance: /\bdefian\w*\b/i,
    tenderness: /\btender\w*\b|\btenderness\b/i,
    guilt: /\bguilt\b|\bguilty\b/i,
    joy: /\bjoy\w*\b/i
  };
  /* Scan the block (everything except the emotion declaration itself) for a
     second emotion word. Returns [{emotion, field}] hits. */
  function findSecondEmotion(declared) {
    var fields = [
      ["stake", els.stake.value],
      ["hook", els.hook.value],
      ["beats", beatInputs().join(" ")],
      ["turn", els.turn.value],
      ["cliffhanger", els.cliff.value]
    ];
    var hits = [];
    EMOTIONS.forEach(function (emo) {
      if (emo === declared) return;
      fields.forEach(function (f) {
        if (f[1] && EMOTION_PATTERNS[emo].test(f[1])) hits.push({ emotion: emo, field: f[0] });
      });
    });
    return hits;
  }

  /* ---------------- cliffhanger templates (wave 38) ---------------- */

  /* Per-format cliffhanger templates. {name} fills from the first cast
     character's name ("the lead" when the bible has no name yet). Templates
     are starting points — the field stays editable after applying. */
  var CLIFF_TEMPLATES = {
    minidrama: [
      "Freeze on {name}'s face as the headlights swing toward them — cut.",
      "{name} hears the one sound that changes everything — cut."
    ],
    pov: [
      "The door handle turns — freeze on your face.",
      "Your phone lights up with a name you never expected — cut."
    ],
    daylife: [
      "Freeze on the folded note mid-slide — it stays unopened.",
      "The regular's smile fades. Cut on the unasked question."
    ],
    revenge: [
      "The partner spots {name} in the crowd — freeze on his face.",
      "{name} presses send — cut on the loading screen."
    ],
    interactive: [
      "Freeze on the decision: knock or walk away — the poll decides tomorrow.",
      "The clock is running. The comments choose — cut before it hits zero."
    ],
    any: [
      "Freeze on {name}'s face — the unanswered question.",
      "Cut on the knock at the door."
    ]
  };
  function castName() {
    return (state.cast[0] && state.cast[0].name) || "the lead";
  }
  function renderCliffTemplates() {
    if (!els.cliffTpl) return;
    var fmt = currentFormat();
    var label = (FORMAT_PRESETS[fmt] && FORMAT_PRESETS[fmt].label) || "This format";
    var html = '<option value="">Start from a template…</option>' +
      '<optgroup label="' + esc(label) + '">';
    (CLIFF_TEMPLATES[fmt] || []).forEach(function (t, i) {
      html += '<option value="' + fmt + ':' + i + '">' + esc(t) + '</option>';
    });
    html += '</optgroup><optgroup label="Any format">';
    CLIFF_TEMPLATES.any.forEach(function (t, i) {
      html += '<option value="any:' + i + '">' + esc(t) + '</option>';
    });
    els.cliffTpl.innerHTML = html + '</optgroup>';
  }
  if (els.cliffTplApply) {
    els.cliffTplApply.addEventListener("click", function () {
      var v = els.cliffTpl.value;
      if (!v) { msg(els.blockMsg, "Pick a cliffhanger template first — or write your own above.", false); return; }
      var parts = v.split(":");
      var tpl = (CLIFF_TEMPLATES[parts[0]] || [])[parseInt(parts[1], 10)];
      if (tpl == null) return;
      readCast();
      els.cliff.value = tpl.split("{name}").join(castName());
      msg(els.blockMsg, "Template applied — edit it to make it yours. The cliffhanger is never the resolution.", true);
      els.cliff.focus();
    });
  }

  /* ---------------- caption draft from block (wave 38) ---------------- */

  /* Hook-title caption drafted straight from the episode block: the observed
     formula [Episode N] + [one-line emotional stake] + [CTA]. The emoji table
     mirrors the hook-title generator's EMOJI_FOR (keep the two in sync). */
  var CAPTION_EMOJI = [
    { test: /daddy|father|mom|mother|dada|mama|parents/i, emoji: "💔" },
    { test: /wait|waiting|still|years/i, emoji: "🕯️" },
    { test: /alone|lost|left behind/i, emoji: "😔" },
    { test: /door|wall|room|hallway|behind/i, emoji: "🚪" },
    { test: /secret|hidden|nobody knows|didn't tell/i, emoji: "🤫" },
    { test: /reunion|found|home|returned/i, emoji: "🥹" },
    { test: /surprise|twist|shocked|didn't expect/i, emoji: "😳" }
  ];
  function captionEmoji(text) {
    for (var i = 0; i < CAPTION_EMOJI.length; i++) {
      if (CAPTION_EMOJI[i].test.test(text)) return CAPTION_EMOJI[i].emoji;
    }
    return "🥺";
  }
  function pCap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function pUncap(s) { return s.charAt(0).toLowerCase() + s.slice(1); }
  function escReg(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
  /* The preset stakes already include the character name ("Lena finds a
     door…") — don't double it when drafting the hook. */
  function nameFirst(name, stake) {
    return !!name && new RegExp("^" + escReg(name) + "\\b", "i").test(stake);
  }
  function copyTextPlain(text, done) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
      return;
    }
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    done(ok);
  }
  var lastCaption = "";
  if (els.captionDraft) {
    els.captionDraft.addEventListener("click", function () {
      var n = parseInt(els.epNum.value, 10) || state.nextEpisode;
      var stake = els.stake.value.trim();
      if (!stake) { msg(els.blockMsg, "Write the one-line stake first — the caption IS the hook.", false); els.stake.focus(); return; }
      readCast();
      var name = state.cast[0] && state.cast[0].name;
      var hook = (name && !nameFirst(name, stake)) ? name + " " + pUncap(stake) : pCap(stake);
      var emoji = captionEmoji(els.emotion.value + " " + stake);
      var tag = state.hashtag ? " " + state.hashtag : " #aiminidrama";
      lastCaption = "Episode " + n + " — " + hook + " " + emoji + "\n" +
        tag + " #aianimation #fyp #emotionalstory\npart " + (n + 1) + " tomorrow ⏳";
      els.captionOut.textContent = lastCaption;
      els.captionOut.hidden = false;
      els.captionRow.hidden = false;
      msg(els.blockMsg, "Caption drafted from the block — the observed hook formula. Take it to the Hook-title generator for the six variants.", true);
    });
    els.captionCopy.addEventListener("click", function () {
      var btn = els.captionCopy;
      copyTextPlain(lastCaption, function (ok) {
        btn.textContent = ok ? "Copied ✓" : "Copy failed";
        setTimeout(function () { btn.textContent = "Copy caption"; }, 1600);
      });
    });
  }

  function renderBlockForm(n) {
    var b = state.blocks[String(n)] || {};
    els.epNum.value = n;
    var fmt = (b.format && ALL_FORMATS.indexOf(b.format) >= 0) ? b.format : currentFormat();
    els.formatRadios.forEach(function (r) { r.checked = (r.value === fmt); });
    els.spb.value = b.spb || (FORMAT_PRESETS[fmt] ? FORMAT_PRESETS[fmt].spb : 15);
    els.emotion.value = b.emotion || "";
    els.stake.value = b.stake || "";
    els.hook.value = b.hook || "";
    renderBeatInputs(b.beats || []);
    els.turn.value = b.turn || "";
    els.cliff.value = b.cliff || "";
    els.scenes.value = b.scenes || "";
    estimate();
    renderCliffTemplates();
    msg(els.blockMsg, state.blocks[String(n)] ? "Loaded saved block for episode " + n + " — edit and re-save to overwrite." : "Planning episode " + n + ".", true);
  }

  els.beatAdd.addEventListener("click", function () {
    var cur = beatInputs();
    if (cur.length >= 6) { msg(els.blockMsg, "Genre rule: 3–5 beats. Six inputs is already generous — trim, don't add.", false); return; }
    cur.push("");
    renderBeatInputs(cur);
    estimate();
    var last = els.beats.querySelectorAll("input");
    last[last.length - 1].focus();
  });

  /* format picker + estimator wiring */
  els.applyFormat.addEventListener("click", function () { applyPreset(currentFormat()); renderCliffTemplates(); });
  els.formatRadios.forEach(function (r) {
    r.addEventListener("change", function () {
      var p = FORMAT_PRESETS[currentFormat()];
      if (p) els.spb.value = p.spb;
      estimate();
      renderCliffTemplates();
    });
  });
  els.spb.addEventListener("input", estimate);
  els.beats.addEventListener("input", estimate);

  els.saveBlock.addEventListener("click", function () {
    var n = parseInt(els.epNum.value, 10) || state.nextEpisode;
    var beats = beatInputs().filter(Boolean);
    var errs = [];
    if (!els.emotion.value.trim()) errs.push("one-word emotion");
    if (els.emotion.value.trim().split(/\s+/).length > 2) errs.push("one emotion — pick a single word");
    if (beats.length < 3) errs.push("at least 3 beats");
    if (!els.cliff.value.trim()) errs.push("a cliffhanger (never the resolution)");
    if (errs.length) {
      msg(els.blockMsg, "Gate check before save: missing " + errs.join(", ") + ".", false);
      return;
    }
    /* wave 38 — one-emotion discipline: a second emotion word anywhere in the
       block is two episodes stapled together. Name the word and the field. */
    var secondHits = findSecondEmotion(els.emotion.value.trim().toLowerCase());
    if (secondHits.length) {
      var hit = secondHits[0];
      msg(els.blockMsg, "Two-emotion block: \u201c" + hit.emotion + "\u201d in the " + hit.field +
        " reads as a second emotion beside \u201c" + els.emotion.value.trim() +
        "\u201d. The one-emotion rule — split the episode, or rewrite the " + hit.field + ".", false);
      return;
    }
    state.blocks[String(n)] = {
      n: n,
      format: currentFormat(),
      spb: Math.max(1, parseInt(els.spb.value, 10) || 15),
      emotion: els.emotion.value.trim(),
      stake: els.stake.value.trim(),
      hook: els.hook.value.trim(),
      beats: beats,
      turn: els.turn.value.trim(),
      cliff: els.cliff.value.trim(),
      scenes: els.scenes.value.trim()
    };
    if (n >= state.nextEpisode) state.nextEpisode = n + 1;
    save(state);
    renderBlocks();
    renderLog();
    msg(els.blockMsg, "Episode " + n + " block saved — one emotion, " + beats.length + " beats, cliffhanger set. G1 ready.", true);
    renderBlockForm(state.nextEpisode);
  });
  els.newBlock.addEventListener("click", function () { renderBlockForm(state.nextEpisode); });

  /* ---------------- saved blocks + Studio bridge ---------------- */

  /* One-click "Send series to Studio": the whole saved series — title,
     logline, cast anchors, every block with its format/runtime/beats —
     lands in the Studio as a pre-filled series plan. The Studio consumes
     the payload once (localStorage "afg-studio-bridge") and shows its own
     message; nothing is posted anywhere. */
  function blockRuntime(b) {
    return (b.beats || []).length * (b.spb || 15);
  }
  function renderBlocks() {
    var nums = Object.keys(state.blocks).map(Number).sort(function (a, b) { return a - b; });
    if (!nums.length) {
      els.blocksEmpty.hidden = false;
      els.blocksList.innerHTML = "";
      els.sendSeries.disabled = true;
      els.sendRun.disabled = true;
      return;
    }
    els.blocksEmpty.hidden = true;
    els.sendSeries.disabled = false;
    els.sendRun.disabled = false;
    els.blocksList.innerHTML = nums.map(function (n) {
      var b = state.blocks[String(n)];
      var fmt = FORMAT_PRESETS[b.format];
      return '<li class="log-entry"><span class="log-label">Ep ' + n + "</span> " +
        '<span class="log-meta">' + esc(fmt ? fmt.label : b.format) + " · " +
        esc(b.emotion || "no emotion") + " · " + b.beats.length + " beats · ~" +
        blockRuntime(b) + "s</span></li>";
    }).join("");
  }
  els.sendSeries.addEventListener("click", function () {
    var nums = Object.keys(state.blocks).map(Number).sort(function (a, b) { return a - b; });
    if (!nums.length) { msg(els.blockMsg, "No saved blocks yet — save an episode block first.", false); return; }
    var payload = {
      v: 1,
      kind: "series",
      sentAt: new Date().toISOString(),
      seriesTitle: state.title,
      logline: state.logline,
      hashtag: state.hashtag,
      cast: state.cast.filter(function (c) { return c.name || c.anchor; }),
      format: state.blocks[String(nums[0])].format || DEFAULT_FORMAT,
      blocks: nums.map(function (n) { return state.blocks[String(n)]; })
    };
    try {
      localStorage.setItem(BRIDGE_KEY, JSON.stringify(payload));
    } catch (e) {
      msg(els.blockMsg, "Could not stage the Studio payload — browser storage is unavailable.", false);
      return;
    }
    location.href = "studio.html?from=planner";
  });

  /* ---------------- "Send run to Studio": microdrama-mode bridge ------------
     Stages the saved series' episode count and median per-episode runtime
     into the Studio's microdrama economics planner (kind "microdrama").
     The Studio's series consumer ignores non-"series" payloads, so this
     never collides with "Send series to Studio". */
  els.sendRun.addEventListener("click", function () {
    var nums = Object.keys(state.blocks).map(Number).sort(function (a, b) { return a - b; });
    if (!nums.length) { msg(els.blockMsg, "No saved blocks yet — save an episode block first.", false); return; }
    var runtimes = nums.map(function (n) {
      return blockRuntime(state.blocks[String(n)]);
    }).sort(function (a, b) { return a - b; });
    var median = runtimes[Math.floor(runtimes.length / 2)];
    /* snap to the microdrama planner's 0.5–3 min input band */
    var minPerEp = Math.max(0.5, Math.min(3, Math.round((median / 60) * 2) / 2));
    var payload = {
      v: 1,
      kind: "microdrama",
      sentAt: new Date().toISOString(),
      seriesTitle: state.title,
      logline: state.logline,
      episodes: nums.length,
      minPerEpisode: minPerEp,
      regensPerEp: 5
    };
    try {
      localStorage.setItem(BRIDGE_KEY, JSON.stringify(payload));
    } catch (e) {
      msg(els.blockMsg, "Could not stage the Studio payload — browser storage is unavailable.", false);
      return;
    }
    location.href = "studio.html?from=planner";
  });

  /* ---------------- arc tracker ---------------- */

  function renderLog() {
    els.logEp.value = state.nextEpisode - 1 || 1;
    els.logList.innerHTML = "";
    if (!state.log.length) {
      els.logEmpty.hidden = false;
      return;
    }
    els.logEmpty.hidden = true;
    state.log.slice().reverse().forEach(function (e) {
      var li = document.createElement("li");
      li.className = "log-entry";
      var head = document.createElement("strong");
      head.textContent = "Ep " + e.n + (e.title ? " — " + e.title : "");
      li.appendChild(head);
      var less = document.createElement("p");
      less.innerHTML = "<span class=\"log-label\">Lesson:</span> " + esc(e.lesson);
      li.appendChild(less);
      if (e.when) {
        var meta = document.createElement("p");
        meta.className = "log-meta";
        meta.textContent = "logged " + e.when;
        li.appendChild(meta);
      }
      els.logList.appendChild(li);
    });
  }

  els.logAdd.addEventListener("click", function () {
    var n = parseInt(els.logEp.value, 10);
    var lesson = els.logLesson.value.trim();
    if (!n || !lesson) {
      msg(els.blockMsg, "Arc tracker: pick an episode number and write the lesson (story, timing, or production).", false);
      return;
    }
    var blk = state.blocks[String(n)] || {};
    state.log.push({
      n: n,
      title: els.logTitle.value.trim() || blk.title || "",
      lesson: lesson,
      when: new Date().toISOString().slice(0, 10)
    });
    if (n >= state.nextEpisode) state.nextEpisode = n + 1;
    els.logTitle.value = "";
    els.logLesson.value = "";
    save(state);
    renderLog();
  });

  /* ---------------- init ---------------- */
  renderSeries();
  renderBlockForm(state.nextEpisode);
  renderBlocks();
  renderLog();
})();
