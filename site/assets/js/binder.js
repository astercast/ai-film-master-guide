/* binder.js: One Binder, the shared project state for the guide's tools.
   Single localStorage key: afmg.binder.v1. Every tool keeps its own
   working keys; the Binder is the one project record they share:
   project title/format/logline, the models this film uses, style
   notes, free notes, and the visitor's last-visit stamp (which the
   "Since you were last here" panels read, filtered to binder models).
   Export/import is plain JSON; print renders the production bible.
   Nothing leaves the browser. */
(function () {
  "use strict";
  var KEY = "afmg.binder.v1";

  function blank() {
    return {
      v: 1,
      project: { title: "", format: "", logline: "" },
      models: [],
      style: { palette: "", lens: "", notes: "" },
      notes: "",
      shotListName: "",
      lastVisit: null,
      updatedAt: null
    };
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return blank();
      var s = JSON.parse(raw);
      var b = blank();
      b.project = Object.assign(b.project, s.project || {});
      b.models = Array.isArray(s.models) ? s.models : [];
      b.style = Object.assign(b.style, s.style || {});
      b.notes = s.notes || "";
      b.shotListName = s.shotListName || "";
      b.lastVisit = s.lastVisit || null;
      b.updatedAt = s.updatedAt || null;
      return b;
    } catch (e) { return blank(); }
  }

  function save(s) {
    s.updatedAt = new Date().toISOString();
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* private mode: state lives for the page only */ }
    return s;
  }

  function hasModel(s, name) { return s.models.indexOf(name) !== -1; }

  function toggleModel(s, name, on) {
    var i = s.models.indexOf(name);
    if (on && i === -1) s.models.push(name);
    if (!on && i !== -1) s.models.splice(i, 1);
    return save(s);
  }

  /* Since-you-were-last-here: wire items newer than the previous
     visit, filtered to the binder's models. With no models chosen,
     nothing is filtered out and the panel says so. */
  function sinceItems(s, items) {
    if (!s.lastVisit) return { items: [], first: true, filtered: false };
    var since = Date.parse(s.lastVisit);
    var out = items.filter(function (i) { return Date.parse(i.at) > since; });
    var filtered = s.models.length > 0;
    if (filtered) out = out.filter(function (i) { return !i.model || hasModel(s, i.model); });
    return { items: out, first: false, filtered: filtered };
  }

  function markVisit(s) {
    var prev = s.lastVisit;
    s.lastVisit = new Date().toISOString();
    save(s);
    return prev;
  }

  function exportJSON(s) {
    var blob = new Blob([JSON.stringify(s, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "production-binder.json";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
  }

  function importJSON(file, done) {
    var r = new FileReader();
    r.onload = function () {
      try {
        var s = JSON.parse(String(r.result));
        if (!s || typeof s !== "object" || !("project" in s)) throw new Error("not a binder file");
        var b = blank();
        b.project = Object.assign(b.project, s.project || {});
        b.models = Array.isArray(s.models) ? s.models : [];
        b.style = Object.assign(b.style, s.style || {});
        b.notes = s.notes || ""; b.shotListName = s.shotListName || "";
        b.lastVisit = s.lastVisit || null;
        done(null, save(b));
      } catch (e) { done(e); }
    };
    r.readAsText(file);
  }

  /* The production bible: a print-only rendering of the binder.
     print.css hides the site chrome; this section hides on screen. */
  function printBible(s, extra) {
    var el = document.getElementById("binder-bible");
    if (!el) { el = document.createElement("section"); el.id = "binder-bible"; document.body.appendChild(el); }
    function esc(t) { return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
    el.innerHTML =
      "<h1>Production bible" + (s.project.title ? ": " + esc(s.project.title) : "") + "</h1>" +
      (s.project.format ? "<p><strong>Format:</strong> " + esc(s.project.format) + "</p>" : "") +
      (s.project.logline ? "<p><strong>Logline:</strong> " + esc(s.project.logline) + "</p>" : "") +
      "<h2>Models on this film</h2><p>" + (s.models.length ? s.models.map(esc).join(", ") : "None chosen yet.") + "</p>" +
      "<h2>Style</h2><p>" + [s.style.palette, s.style.lens, s.style.notes].filter(Boolean).map(esc).join(" · ") + "</p>" +
      (s.shotListName ? "<h2>Shot list</h2><p>" + esc(s.shotListName) + (extra && extra.shots ? " (" + extra.shots + " shots, from the shot-list builder)" : "") + "</p>" : "") +
      "<h2>Notes</h2><p>" + esc(s.notes || "") + "</p>";
    document.body.classList.add("binder-printing");
    window.print();
    setTimeout(function () { document.body.classList.remove("binder-printing"); }, 500);
  }

  window.AFGBinder = {
    KEY: KEY, blank: blank, load: load, save: save,
    hasModel: hasModel, toggleModel: toggleModel,
    sinceItems: sinceItems, markVisit: markVisit,
    exportJSON: exportJSON, importJSON: importJSON, printBible: printBible
  };

  /* ---- Binder page wiring (binder.html carries [data-binder]) ---- */
  document.addEventListener("DOMContentLoaded", function () {
    var root = document.querySelector("[data-binder]");
    /* Every page: stamp the visit AFTER readers had their chance is
       the caller's job; binder pages and wire/home do it explicitly. */
    if (!root) return;
    var s = load();
    var q = function (sel) { return root.querySelector(sel); };
    var title = q("[data-b-title]"), format = q("[data-b-format]"), logline = q("[data-b-logline]"),
        notes = q("[data-b-notes]"), pal = q("[data-b-palette]"), lens = q("[data-b-lens]"), snotes = q("[data-b-snotes]");
    if (title) title.value = s.project.title;
    if (format) format.value = s.project.format;
    if (logline) logline.value = s.project.logline;
    if (notes) notes.value = s.notes;
    if (pal) pal.value = s.style.palette;
    if (lens) lens.value = s.style.lens;
    if (snotes) snotes.value = s.style.notes;
    function bind(input, fn) { if (input) input.addEventListener("input", function () { fn(input.value); save(s); }); }
    bind(title, function (v) { s.project.title = v; });
    bind(format, function (v) { s.project.format = v; });
    bind(logline, function (v) { s.project.logline = v; });
    bind(notes, function (v) { s.notes = v; });
    bind(pal, function (v) { s.style.palette = v; });
    bind(lens, function (v) { s.style.lens = v; });
    bind(snotes, function (v) { s.style.notes = v; });

    root.querySelectorAll("[data-b-model]").forEach(function (box) {
      box.checked = hasModel(s, box.getAttribute("data-b-model"));
      box.addEventListener("change", function () {
        toggleModel(s, box.getAttribute("data-b-model"), box.checked);
        renderCount();
      });
    });
    var count = q("[data-b-count]");
    function renderCount() { if (count) count.textContent = s.models.length + " model" + (s.models.length === 1 ? "" : "s") + " on this film"; }
    renderCount();

    /* Shot lists stay in the shot-list builder's own key; the binder
       records which named list belongs to this film. */
    var shotSel = q("[data-b-shotlist]");
    if (shotSel) {
      var lists = {};
      try { lists = JSON.parse(localStorage.getItem("afg-shot-lists") || "{}"); } catch (e) { lists = {}; }
      var names = Object.keys(lists);
      shotSel.innerHTML = '<option value="">None</option>' + names.map(function (n) {
        return '<option value="' + n.replace(/"/g, "&quot;") + '"' + (n === s.shotListName ? " selected" : "") + ">" + n + " (" + (lists[n] || []).length + " shots)</option>";
      }).join("");
      shotSel.addEventListener("change", function () { s.shotListName = shotSel.value; save(s); });
    }

    var exp = q("[data-b-export]"); if (exp) exp.addEventListener("click", function () { exportJSON(load()); });
    var imp = q("[data-b-import]");
    if (imp) imp.addEventListener("change", function () {
      if (!imp.files || !imp.files[0]) return;
      importJSON(imp.files[0], function (err) {
        if (err) { alert("That file is not a binder export."); return; }
        location.reload();
      });
    });
    var prn = q("[data-b-print]");
    if (prn) prn.addEventListener("click", function () {
      var lists2 = {};
      try { lists2 = JSON.parse(localStorage.getItem("afg-shot-lists") || "{}"); } catch (e) { lists2 = {}; }
      var cur = load();
      printBible(cur, { shots: (lists2[cur.shotListName] || []).length });
    });
  });
})();
