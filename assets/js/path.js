/* The Path — the guide's sequenced curriculum (rotation 19,
   closing competitor gap T-FILM-5).
   The guide's library held 241 skills and no order to learn
   them in. The Path is that order: data/v1/curriculum.json
   sequences every skill exactly once into six stages in
   production order — the prompt and the camera; the style
   tracks; the models; direction; production; the finish.
   This engine invents nothing: it takes the curriculum and
   the learner's checked-off skills and computes where they
   stand — per-stage progress, the current stage, the next
   skill, and the milestone verdict. Checking a skill off is
   the learner's claim that it was done on a real production;
   the engine counts what is checked, not intentions.
   Not to be confused with the homepage's "Pick your path"
   goal routes, which order a handful of chapters per goal —
   this page orders the skills themselves. Progress persists
   in the browser under its own key (afg-the-path-v1), never
   the goal routes' key. Deterministic: the same curriculum
   and the same check-offs always produce the same standing. */
(function () {
  "use strict";

  var STORAGE_KEY = "afg-the-path-v1";

  function stagesOf(curriculum) {
    return (curriculum && Array.isArray(curriculum.stages)) ? curriculum.stages : [];
  }

  /* The whole walk, flattened in order: each entry carries
     its stage and its 1-based place on the full path. */
  function flatten(curriculum) {
    var out = [];
    stagesOf(curriculum).forEach(function (st) {
      (st.skills || []).forEach(function (id) {
        out.push({ id: id, stageId: st.id, stageTitle: st.title, n: out.length + 1 });
      });
    });
    return out;
  }

  function doneSet(doneIds) {
    var s = {};
    (doneIds || []).forEach(function (id) { s[id] = true; });
    return s;
  }

  function stageProgress(stage, doneIds) {
    var done = doneSet(doneIds);
    var skills = (stage && stage.skills) || [];
    var n = skills.filter(function (id) { return done[id]; }).length;
    return {
      done: n, total: skills.length,
      pct: skills.length ? Math.round((n / skills.length) * 100) : 0,
      complete: skills.length > 0 && n === skills.length,
      next: skills.filter(function (id) { return !done[id]; })[0] || null,
    };
  }

  function progress(curriculum, doneIds) {
    var flat = flatten(curriculum);
    var done = doneSet(doneIds);
    var n = flat.filter(function (e) { return done[e.id]; }).length;
    var stages = stagesOf(curriculum).map(function (st) {
      var sp = stageProgress(st, doneIds);
      return { id: st.id, title: st.title, done: sp.done, total: sp.total,
               pct: sp.pct, complete: sp.complete, next: sp.next };
    });
    var current = null;
    for (var i = 0; i < stages.length; i++) {
      if (!stages[i].complete) { current = stages[i]; break; }
    }
    var nextEntry = null;
    for (var j = 0; j < flat.length; j++) {
      if (!done[flat[j].id]) { nextEntry = flat[j]; break; }
    }
    return {
      done: n, total: flat.length,
      pct: flat.length ? Math.round((n / flat.length) * 100) : 0,
      stages: stages,
      currentStage: current,
      next: nextEntry,
      finished: flat.length > 0 && n === flat.length,
    };
  }

  function verdict(curriculum, doneIds) {
    var p = progress(curriculum, doneIds);
    if (p.total === 0) {
      return "The Path is empty — no curriculum is loaded. The sequence lives in data/v1/curriculum.json; without it there is no order to walk.";
    }
    if (p.done === 0) {
      return "Not started — " + p.total + " skills stand in six stages, in the order to learn them. Begin at Stage 1, skill 1 (" +
        p.next.id + "): the prompt and the camera are the two languages everything else is spoken in. Check a skill off only when it has been done on a real production.";
    }
    if (p.finished) {
      return "The Path is walked — all " + p.total + " skills checked off across the six stages. What remains is the work itself: the stages now exercise each other on every production, and the guide keeps growing at the finish — a new skill joins the stage it belongs to, not the end.";
    }
    var st = p.currentStage;
    return "Stage " + (stagesOf(curriculum).findIndex(function (s) { return s.id === st.id; }) + 1) +
      " — " + st.title + ": " + st.done + " of " + st.total + " skills done. Next on the path: " +
      p.next.id + " (skill " + p.next.n + " of " + p.total + "). A stage is finished when its milestone can be demonstrated on a production, not when its boxes are ticked — the milestone, not the calendar, says when to move on.";
  }

  function progressToMarkdown(curriculum, titles, doneIds) {
    titles = titles || {};
    var done = doneSet(doneIds);
    var p = progress(curriculum, doneIds);
    var lines = [];
    lines.push("# The Path — my walk");
    lines.push("");
    lines.push("The guide's " + p.total + " skills in six stages, in the order to learn them (data/v1/curriculum.json). A skill is checked when it has been done on a real production.");
    lines.push("");
    stagesOf(curriculum).forEach(function (st, i) {
      var sp = stageProgress(st, doneIds);
      lines.push("## Stage " + (i + 1) + " — " + st.title + " (" + sp.done + " of " + sp.total + ")");
      lines.push("");
      lines.push("Milestone: " + st.milestone);
      lines.push("");
      (st.skills || []).forEach(function (id) {
        lines.push("- [" + (done[id] ? "x" : " ") + "] " + (titles[id] || id) + " (`" + id + "`)");
      });
      lines.push("");
    });
    lines.push("## Standing");
    lines.push(verdict(curriculum, doneIds));
    lines.push("");
    lines.push("Done: " + p.done + " of " + p.total + " (" + p.pct + "%).");
    return lines.join("\n") + "\n";
  }

  var api = { STORAGE_KEY: STORAGE_KEY, flatten: flatten, stageProgress: stageProgress,
    progress: progress, verdict: verdict, progressToMarkdown: progressToMarkdown };

  if (typeof module !== "undefined" && module.exports) { module.exports = api; }
  if (typeof window !== "undefined") { window.PathEngine = api; }

  /* ---- browser wiring (skipped under node) ---- */
  if (typeof document === "undefined") return;

  document.addEventListener("DOMContentLoaded", function () {
    var stageEl = document.getElementById("path-stages");
    if (!stageEl) return;
    var island = document.getElementById("path-curriculum");
    var curriculum = null;
    try { curriculum = JSON.parse(island.textContent); } catch (e) { curriculum = null; }
    if (!curriculum) return;
    var verdictEl = document.getElementById("path-verdict");
    var overallEl = document.getElementById("path-overall");
    var msgEl = document.getElementById("path-msg");

    var done = [];
    try {
      var raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (Array.isArray(raw)) done = raw.filter(function (id) { return typeof id === "string"; });
    } catch (e) { done = []; }

    function persist() {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(done)); } catch (e) { /* private mode: progress just won't persist */ }
    }

    function titles() {
      var t = {};
      document.querySelectorAll("[data-path-title]").forEach(function (el) {
        t[el.getAttribute("data-path-title-id")] = el.getAttribute("data-path-title");
      });
      return t;
    }

    function render() {
      var p = progress(curriculum, done);
      document.querySelectorAll("input[data-path-skill]").forEach(function (box) {
        box.checked = done.indexOf(box.getAttribute("data-path-skill")) >= 0;
      });
      document.querySelectorAll("[data-path-stage-progress]").forEach(function (el) {
        var st = p.stages.filter(function (s) { return s.id === el.getAttribute("data-path-stage-progress"); })[0];
        if (st) el.textContent = st.done + " of " + st.total + " complete" + (st.complete ? " — stage complete" : "");
      });
      document.querySelectorAll("[data-path-stage-bar]").forEach(function (el) {
        var st = p.stages.filter(function (s) { return s.id === el.getAttribute("data-path-stage-bar"); })[0];
        if (st) el.style.width = st.pct + "%";
      });
      if (overallEl) overallEl.textContent = p.done + " of " + p.total + " skills done (" + p.pct + "%)";
      if (verdictEl) verdictEl.textContent = verdict(curriculum, done);
    }

    stageEl.addEventListener("change", function (ev) {
      var box = ev.target.closest("[data-path-skill]");
      if (!box) return;
      var id = box.getAttribute("data-path-skill");
      if (box.checked && done.indexOf(id) < 0) done.push(id);
      if (!box.checked) done = done.filter(function (x) { return x !== id; });
      persist();
      render();
    });

    var resetBtn = document.getElementById("path-reset");
    if (resetBtn) resetBtn.addEventListener("click", function () {
      done = [];
      persist();
      render();
      if (msgEl) { msgEl.hidden = false; msgEl.textContent = "Progress cleared — the Path starts again at Stage 1, skill 1."; }
    });

    function exportText() { return progressToMarkdown(curriculum, titles(), done); }
    var copyBtn = document.getElementById("path-copy");
    if (copyBtn) copyBtn.addEventListener("click", function () {
      var doneMsg = function () { if (msgEl) { msgEl.hidden = false; msgEl.textContent = "Your walk copied as markdown."; } };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(exportText()).then(doneMsg, doneMsg);
      else doneMsg();
    });
    var dlBtn = document.getElementById("path-download");
    if (dlBtn) dlBtn.addEventListener("click", function () {
      var blob = new Blob([exportText()], { type: "text/markdown" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "the-path.md";
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    });

    render();
  });
})();
