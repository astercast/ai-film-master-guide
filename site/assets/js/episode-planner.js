/* Episode planner — series setup → episode-block planner → arc tracker.
   Grounded in craft/episodic-shortform.md (the AI mini-drama pipeline).
   Storage: localStorage "afg-episode-series" (one saved series + its blocks + log). */
(function () {
  "use strict";

  var STORE_KEY = "afg-episode-series";

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
    scenes: document.getElementById("epb-scenes"),
    blockMsg: document.getElementById("epb-msg"),
    saveBlock: document.getElementById("epb-save"),
    newBlock: document.getElementById("epb-new"),
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
  function renderBlockForm(n) {
    var b = state.blocks[String(n)] || {};
    els.epNum.value = n;
    els.emotion.value = b.emotion || "";
    els.stake.value = b.stake || "";
    els.hook.value = b.hook || "";
    renderBeatInputs(b.beats || []);
    els.turn.value = b.turn || "";
    els.cliff.value = b.cliff || "";
    els.scenes.value = b.scenes || "";
    msg(els.blockMsg, state.blocks[String(n)] ? "Loaded saved block for episode " + n + " — edit and re-save to overwrite." : "Planning episode " + n + ".", true);
  }

  els.beatAdd.addEventListener("click", function () {
    var cur = beatInputs();
    if (cur.length >= 6) { msg(els.blockMsg, "Genre rule: 3–5 beats. Six inputs is already generous — trim, don't add.", false); return; }
    cur.push("");
    renderBeatInputs(cur);
    var last = els.beats.querySelectorAll("input");
    last[last.length - 1].focus();
  });

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
    state.blocks[String(n)] = {
      n: n,
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
    renderLog();
    msg(els.blockMsg, "Episode " + n + " block saved — one emotion, " + beats.length + " beats, cliffhanger set. G1 ready.", true);
    renderBlockForm(state.nextEpisode);
  });
  els.newBlock.addEventListener("click", function () { renderBlockForm(state.nextEpisode); });

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
  renderLog();
})();
