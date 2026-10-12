/* Prompt gallery — your workshop-saved prompts as a browsable collection.
   Reads the same localStorage the workshop writes: afg-workshop-saves.
   Filter by track/model, sort by rating, open in workshop, export/import JSON. */
(function () {
  "use strict";

  var SAVE_KEY = "afg-workshop-saves";
  var TRACK_NAMES = { core: "Core", animated: "Animated / stylized", photorealistic: "Photorealistic",
    performance: "Performance direction", audio: "Audio & voice", longform: "Long-form craft",
    repair: "Failure repair" };

  var els = {
    track: document.getElementById("gal-track"),
    model: document.getElementById("gal-model"),
    sort: document.getElementById("gal-sort"),
    grid: document.getElementById("gal-grid"),
    empty: document.getElementById("gal-empty"),
    count: document.getElementById("gal-count"),
    exp: document.getElementById("gal-export"),
    imp: document.getElementById("gal-import"),
    error: document.getElementById("gal-error")
  };
  if (!els.grid) return;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function loadSaves() {
    try { return JSON.parse(localStorage.getItem(SAVE_KEY) || "[]") || []; }
    catch (e) { return []; }
  }
  function persist(saves) {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(saves)); }
    catch (e) { /* storage full/blocked */ }
  }

  function stars(r) {
    var out = '<span class="stars gal-stars" aria-label="Rated ' + r + ' of 5">';
    for (var i = 1; i <= 5; i++) out += '<span class="star' + (i <= r ? " on" : "") + '" aria-hidden="true">★</span>';
    return out + "</span>";
  }

  function card(s) {
    var long = s.prompt && s.prompt.length > 240;
    var body = long
      ? "<details><summary>Show full prompt</summary>" +
        '<p class="save-text">' + esc(s.prompt) + "</p></details>" +
        '<p class="save-text">' + esc(s.prompt.slice(0, 240)) + "…</p>"
      : '<p class="save-text">' + esc(s.prompt || "") + "</p>";
    return '<article class="card save-card" data-save="' + esc(s.id) + '">' +
      "<h3>" + esc(s.title || "Untitled prompt") + "</h3>" +
      '<p class="save-meta">' + esc(s.model || "—") + " · " +
      esc(TRACK_NAMES[s.track] || s.track || "—") + " · saved " + esc(s.savedAt || "—") + "</p>" +
      stars(s.rating || 0) + body +
      '<div class="btn-row save-actions">' +
      '<a class="btn btn-sm" href="workshop.html?save=' + encodeURIComponent(s.id) + '">Open in workshop</a>' +
      '<button type="button" class="btn btn-sm btn-ghost" data-copy="' + esc(s.id) + '">Copy</button>' +
      '<button type="button" class="btn btn-sm btn-ghost" data-del="' + esc(s.id) + '">Delete</button>' +
      "</div></article>";
  }

  function current() {
    var saves = loadSaves();
    var t = els.track.value, m = els.model.value;
    var out = saves.filter(function (s) {
      if (t !== "all" && s.track !== t) return false;
      if (m !== "all" && s.model !== m) return false;
      return true;
    });
    var sort = els.sort.value;
    out.sort(function (a, b) {
      if (sort === "rating") return (b.rating || 0) - (a.rating || 0) || (b.id < a.id ? 1 : -1);
      if (sort === "oldest") return a.id < b.id ? -1 : 1;
      return b.id < a.id ? 1 : -1; /* newest */
    });
    return out;
  }

  function fillFilters(saves) {
    els.track.innerHTML = '<option value="all">All tracks</option>';
    els.model.innerHTML = '<option value="all">All models</option>';
    var tracks = {}, models = {};
    saves.forEach(function (s) {
      if (s.track) tracks[s.track] = true;
      if (s.model) models[s.model] = true;
    });
    Object.keys(tracks).sort().forEach(function (t) {
      var o = document.createElement("option");
      o.value = t; o.textContent = TRACK_NAMES[t] || t;
      els.track.appendChild(o);
    });
    Object.keys(models).sort().forEach(function (m) {
      var o = document.createElement("option");
      o.value = m; o.textContent = m;
      els.model.appendChild(o);
    });
  }

  function render() {
    var saves = loadSaves();
    if (!saves.length) {
      els.grid.innerHTML = "";
      els.count.textContent = "";
      els.empty.hidden = false;
      els.exp.disabled = true;
      return;
    }
    els.empty.hidden = true;
    els.exp.disabled = false;
    var out = current();
    els.count.textContent = out.length + " of " + saves.length + " saved prompt" + (saves.length === 1 ? "" : "s");
    els.grid.innerHTML = out.length
      ? out.map(card).join("")
      : '<div class="empty-state"><span class="es-slate">No footage</span><p>No saved prompts match these filters.</p></div>';
  }

  els.grid.addEventListener("click", function (ev) {
    var btn = ev.target.closest("button");
    if (!btn) return;
    var saves = loadSaves();
    var delId = btn.getAttribute("data-del");
    var copyId = btn.getAttribute("data-copy");
    if (delId) {
      persist(saves.filter(function (s) { return s.id !== delId; }));
      render();
      return;
    }
    if (copyId) {
      var s = null;
      saves.forEach(function (x) { if (x.id === copyId) s = x; });
      if (!s || !s.prompt) return;
      var done = function () { btn.textContent = "Copied"; setTimeout(function () { btn.textContent = "Copy"; }, 1400); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(s.prompt).then(done, function () { fallbackCopy(s.prompt, done); });
      } else fallbackCopy(s.prompt, done);
    }
  });

  function fallbackCopy(text, done) {
    var ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); done(); } catch (e) { /* ignore */ }
    document.body.removeChild(ta);
  }

  els.exp.addEventListener("click", function () {
    var saves = loadSaves();
    if (!saves.length) return;
    var blob = new Blob([JSON.stringify({ exported: new Date().toISOString().slice(0, 10), saves: saves }, null, 2)],
      { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "prompt-gallery-" + new Date().toISOString().slice(0, 10) + ".json";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  });

  els.imp.addEventListener("change", function () {
    var f = els.imp.files && els.imp.files[0];
    if (!f) return;
    var rd = new FileReader();
    rd.onload = function () {
      try {
        var data = JSON.parse(rd.result);
        var incoming = Array.isArray(data) ? data : data.saves;
        if (!Array.isArray(incoming)) throw new Error("bad");
        var seen = {};
        loadSaves().forEach(function (s) { seen[s.id] = true; });
        var added = 0;
        var merged = loadSaves();
        incoming.forEach(function (s) {
          if (!s || !s.id || !s.prompt || seen[s.id]) return;
          seen[s.id] = true;
          merged.unshift({ id: String(s.id), templateId: s.templateId || "", title: s.title || "Imported prompt",
            model: s.model || "", track: s.track || "", prompt: String(s.prompt), vals: s.vals || {},
            rating: Math.max(0, Math.min(5, parseInt(s.rating, 10) || 0)), savedAt: s.savedAt || "" });
          added++;
        });
        persist(merged);
        fillFilters(merged);
        render();
        els.error.hidden = false;
        els.error.textContent = added ? "Imported " + added + " prompt" + (added === 1 ? "" : "s") + "." : "Nothing new to import — those prompts are already here.";
      } catch (e) {
        els.error.hidden = false;
        els.error.textContent = "That file isn't a valid gallery export.";
      }
      els.imp.value = "";
    };
    rd.readAsText(f);
  });

  ["track", "model", "sort"].forEach(function (k) {
    els[k].addEventListener("change", render);
  });

  fillFilters(loadSaves());
  render();
})();
