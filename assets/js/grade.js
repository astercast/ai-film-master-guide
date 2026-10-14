/* The Grade Sheet, the color-grading chapter
   (craft/color-grading.md) as a working grade sheet.
   The chapter's opening claim sets the stakes: every AI
   generation arrives with its own built-in grade, so a
   multi-shot production is 40 colorists who never met, and
   the colorist's job is unification. The sheet invents
   nothing: it takes a production's own scenes, the hero
   reference each one is matched to, the source it was shot
   on (one model, or several with different house grades),
   the five matching steps (the unification pass, then the
   de-plasticize stack, skin last), and the scene's state
   today, and computes the grade verdict from the chapter's
   own rules: unification is matching to a reference, so a
   scene with no hero reference reads unmatched whatever its
   owner claims; a scene graded before it is matched stays
   drifting; and a clean sheet still owes the scopes check
   (blacks, the skin-tone line, no clipped channel) before
   delivery. Deterministic: the same sheet always produces
   the same verdict and the same export. */
(function () {
  "use strict";

  /* The chapter's pre-grade gates, verbatim in substance. */
  var GATES = [
    { id: "plategrade", name: "Every element assigned: plate or grade",
      what: "Decide per element which place its color lives. What you bake into the plate, lens character, palette direction, texture, time of day, you don't have to fix; anything the video model keeps dropping belongs in the plate, and anything that must move across the whole film belongs in the grade." },
    { id: "reference", name: "Hero reference chosen for every scene",
      what: "Pick one hero shot per scene as the reference and match every other shot to it, scopes, not eyes. Do the unification pass over the location set before generating where possible: it is cheaper than discovering the mismatch in the grade." },
    { id: "showlook", name: "One show look locked, scene variations only",
      what: "One look for the film, with scene-level variations, not a new look per scene. Work in passes: primary (whole image), then secondaries (skin, sky, key objects), then texture. Restraint wins: halation and bloom flatter AI highlights, which tend to clip harshly." },
    { id: "grain", name: "Grain philosophy decided, one grain, applied last",
      what: "One grain for the film, applied at the end, over everything, it is the final unifier. Decide it before the first scene is graded, not after the last one looks different from the rest." },
    { id: "masters", name: "Pre-grade masters archived",
      what: "Keep the pre-grade masters. When the festival asks for a revision, you re-grade, you don't re-generate. Archive the masters with the project, at delivery resolution, before the creative look goes on." },
  ];

  /* The five matching steps, in the chapter's order: the
     unification pass (exposure, contrast, saturation), then
     the de-plasticize stack (texture, grain, a whisper of
     chromatic aberration, soften don't sharpen), skin last. */
  var STEPS = [
    { id: "exposure", label: "Exposure + white balance" },
    { id: "contrast", label: "Contrast curve" },
    { id: "saturation", label: "Saturation (desat 10 to 20%)" },
    { id: "texture", label: "Texture (grain · CA · soften)" },
    { id: "skin", label: "Skin, last, big screen" },
  ];
  var STEP_IDS = STEPS.map(function (s) { return s.id; });

  var SOURCES = [
    { id: "single", label: "Single model, one house grade" },
    { id: "mixed", label: "Mixed models, house grades differ" },
  ];
  var SOURCE_IDS = SOURCES.map(function (s) { return s.id; });

  var STATUSES = [
    { id: "unified", label: "Unified, matched to the reference" },
    { id: "drifting", label: "Drifting, partly matched" },
    { id: "unmatched", label: "Unmatched, its own built-in grade" },
  ];
  var STATUS_IDS = STATUSES.map(function (s) { return s.id; });

  /* The worked example pre-loaded on the sheet: the same
     small AI short the Continuity Ledger and the Cue Sheet
     track ("The Night Bus"), graded instead of seen or
     heard. Four scenes are unified; the rain stop was shot
     across two models and its saturation is not matched yet,
     so the first verdict is the honest hold, and finishing
     the stack clears it. Every label is invented for the
     example; no real production is described. */
  var DEFAULT_ENTRIES = [
    { scene: "Sc 1, Depot at night, Mara waits", source: "single", reference: true,
      detail: "Hero: the wide under the canopy. Generations matched on scopes, blacks reach black, sodium practicals held off the skin line.",
      steps: { exposure: true, contrast: true, saturation: true, texture: true, skin: true }, status: "unified" },
    { scene: "Sc 2, On the bus, the hardest line", source: "single", reference: true,
      detail: "Hero: her close-up at the window. One model's house grade throughout; desaturated 15%, one grain over the scene, skin checked on the big screen.",
      steps: { exposure: true, contrast: true, saturation: true, texture: true, skin: true }, status: "unified" },
    { scene: "Sc 3, The rain stop", source: "mixed", reference: true,
      detail: "Shot across two models, the walk on one, the shelter two-shot on another, and their house grades disagree on saturation. Exposure and contrast matched to the shelter hero; saturation, texture and the skin pass not done yet.",
      steps: { exposure: true, contrast: true, saturation: false, texture: false, skin: false }, status: "unified" },
    { scene: "Sc 4, Depot office, radio voices", source: "single", reference: true,
      detail: "Hero: the desk two-shot. Fluorescent green pulled off the skin line on the vectorscope before the creative look went on.",
      steps: { exposure: true, contrast: true, saturation: true, texture: true, skin: true }, status: "unified" },
    { scene: "Sc 5, Departure, the button", source: "single", reference: true,
      detail: "Hero: the pull-away wide. The show look's night variation only, same primary, cooler secondaries; grain is the film's one grain, applied last.",
      steps: { exposure: true, contrast: true, saturation: true, texture: true, skin: true }, status: "unified" },
  ];

  /* The chapter's hardest grading rule, applied mechanically:
     unification is matching to a reference, so a scene with
     no hero reference reads unmatched whatever state its
     owner recorded. A scene claimed unified with matching
     steps unfinished reads drifting: the creative look never
     goes on before the match. */
  function effectiveStatus(e) {
    if (!e || !e.reference) return "unmatched";
    var st = STATUS_IDS.indexOf(e.status) >= 0 ? e.status : "drifting";
    if (st === "unified" && stepCount(e) < STEPS.length) return "drifting";
    return st;
  }

  function stepCount(e) {
    if (!e || !e.steps) return 0;
    return STEPS.filter(function (s) { return !!e.steps[s.id]; }).length;
  }

  function evaluate(entries) {
    var list = Array.isArray(entries) ? entries : [];
    var eff = list.map(function (e) { return effectiveStatus(e); });
    var unified = eff.filter(function (s) { return s === "unified"; });
    var drifting = eff.filter(function (s) { return s === "drifting"; });
    var unmatched = eff.filter(function (s) { return s === "unmatched"; });
    var clean = list.length > 0 && drifting.length === 0 && unmatched.length === 0;
    return {
      total: list.length,
      unified: unified.length,
      drifting: drifting.length,
      unmatched: unmatched.length,
      driftingEntries: list.filter(function (e, i) { return eff[i] === "drifting"; }),
      unmatchedEntries: list.filter(function (e, i) { return eff[i] === "unmatched"; }),
      clean: clean,
      verdict: list.length === 0
        ? "No grade sheet yet, every generation is still wearing its own built-in grade, so the film is 40 colorists who never met. Log the scenes first."
        : unmatched.length > 0
          ? "Grade stopped, " + unmatched.length + " scene" + (unmatched.length === 1 ? " has" : "s have") +
            " no hero reference: unification is matching to a reference, and there is nothing to match to. Choose the hero shot first; if two models won't match after that, re-generate the outlier rather than torturing the grade."
          : drifting.length > 0
            ? "Hold the grade, " + drifting.length + " scene" + (drifting.length === 1 ? " is" : "s are") +
              " drifting: the matching steps are unfinished. Finish the unification pass first (exposure and white balance, contrast curve, saturation, scopes, not eyes), then the de-plasticize stack in order, skin last; a creative look laid over an unmatched scene has to be laid again."
            : "Grade clean, every logged scene is matched to its hero reference, all five steps down. Before delivery: the scopes check (blacks actually reach black, skin tones on the skin-tone line, no channel clips), broadcast-safe levels, one grain over everything at the end, and the pre-grade masters stay archived.",
    };
  }

  function gateState(doneIds) {
    var done = GATES.filter(function (s) { return (doneIds || []).indexOf(s.id) >= 0; });
    return {
      done: done.length, total: GATES.length,
      missing: GATES.filter(function (s) { return (doneIds || []).indexOf(s.id) < 0; }),
      complete: done.length === GATES.length,
    };
  }

  function statusLabel(id) {
    for (var i = 0; i < STATUSES.length; i++) if (STATUSES[i].id === id) return STATUSES[i].label;
    return "No state recorded ";
  }

  function sourceLabel(id) {
    for (var i = 0; i < SOURCES.length; i++) if (SOURCES[i].id === id) return SOURCES[i].label;
    return "No source recorded ";
  }

  function stepsLabel(e) {
    return STEPS.map(function (s) {
      return s.label.split(" (")[0] + " " + (e && e.steps && e.steps[s.id] ? "✓" : "…");
    }).join(" · ");
  }

  function sheetToMarkdown(title, entries, doneIds) {
    var r = evaluate(entries);
    var gs = gateState(doneIds);
    var lines = [];
    lines.push("# Grade sheet, " + (title || "Untitled production"));
    lines.push("");
    lines.push("Color grading AI footage: unification to a hero reference, the de-plasticize stack, scopes not eyes (see craft/color-grading.md).");
    lines.push("");
    lines.push("## The pre-grade gates");
    GATES.forEach(function (s) {
      var mark = (doneIds || []).indexOf(s.id) >= 0 ? "x" : " ";
      lines.push("- [" + mark + "] " + s.name);
    });
    lines.push("");
    lines.push("Gates complete: " + gs.done + " of " + gs.total + ".");
    lines.push("");
    lines.push("## Scenes (" + r.total + ")");
    if (!entries.length) lines.push("- (none logged)");
    entries.forEach(function (e) {
      lines.push("- " + e.scene + ", " + statusLabel(effectiveStatus(e)) + ". Source: " + sourceLabel(e.source) +
        ". Reference: " + (e.reference ? "hero chosen" : "none chosen") + ". Steps: " + stepsLabel(e) + ". " + (e.detail || ""));
    });
    lines.push("");
    lines.push("## Grade verdict");
    lines.push(r.verdict);
    lines.push("");
    lines.push("Unified: " + r.unified + " · drifting: " + r.drifting + " · unmatched: " + r.unmatched + ".");
    return lines.join("\n") + "\n";
  }

  var api = { GATES: GATES, STEPS: STEPS, SOURCES: SOURCES, STATUSES: STATUSES,
    DEFAULT_ENTRIES: DEFAULT_ENTRIES, effectiveStatus: effectiveStatus,
    stepCount: stepCount, evaluate: evaluate, gateState: gateState,
    statusLabel: statusLabel, sourceLabel: sourceLabel, stepsLabel: stepsLabel,
    sheetToMarkdown: sheetToMarkdown };

  if (typeof module !== "undefined" && module.exports) { module.exports = api; }
  if (typeof window !== "undefined") { window.GradeEngine = api; }

  /* ---- browser wiring (skipped under node) ---- */
  if (typeof document === "undefined") return;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var stageEl = document.getElementById("gr-stage");
    if (!stageEl) return;
    var entries = JSON.parse(JSON.stringify(DEFAULT_ENTRIES));
    var done = [];
    var verdictEl = document.getElementById("gr-verdict");
    var gatesEl = document.getElementById("gr-gates-state");
    var msgEl = document.getElementById("gr-msg");

    function render() {
      var r = evaluate(entries);
      var html = "";
      entries.forEach(function (e, idx) {
        var eff = effectiveStatus(e);
        html += '<article class="gr-entry"><div class="gr-entry-head"><h4>' + esc(e.scene) + "</h4>" +
          '<span class="gr-tag">' + esc(sourceLabel(e.source).split(", ")[0]) + "</span></div>" +
          '<p class="gr-detail">' + esc(e.detail || "") + "</p>" +
          '<p class="gr-steps" role="group" aria-label="Matching steps done in ' + esc(e.scene) + '">' +
          STEPS.map(function (s) {
            var on = !!(e.steps && e.steps[s.id]);
            return '<button type="button" class="btn btn-sm' + (on ? "" : " btn-ghost") +
              '" data-gr-step="' + idx + ":" + s.id + '" aria-pressed="' + on + '">' +
              esc(s.label) + (on ? " ✓" : " ") + "</button>";
          }).join(" ") + "</p>" +
          '<p class="gr-ref"><button type="button" class="btn btn-sm' + (e.reference ? "" : " btn-ghost") +
          '" data-gr-ref="' + idx + '" aria-pressed="' + !!e.reference + '">Hero reference ' +
          (e.reference ? "✓ chosen" : "not chosen") + "</button></p>" +
          '<p class="gr-state">State: <strong>' + esc(statusLabel(eff)) + "</strong>" +
          (eff !== e.status ? ' <span class="gr-note">(' +
            (!e.reference ? "no hero reference, reads unmatched by the chapter\u2019s rule"
                          : "steps unfinished, reads drifting by the chapter\u2019s rule") + ")</span>" : "") + "</p>" +
          '<p class="gr-states" role="group" aria-label="Set the state for ' + esc(e.scene) + '">' +
          STATUSES.map(function (s) {
            return '<button type="button" class="btn btn-sm' + (e.status === s.id ? "" : " btn-ghost") +
              '" data-gr-set="' + idx + ":" + s.id + '">' + esc(s.label) + "</button>";
          }).join(" ") + "</p>" +
          '<p><button type="button" class="btn btn-sm btn-ghost" data-gr-del="' + idx + '">Remove scene</button></p></article>';
      });
      stageEl.innerHTML = html || '<p class="gr-detail">No scenes logged yet.</p>';
      verdictEl.textContent = r.verdict;
      verdictEl.className = "gr-verdict " + (r.clean ? "gr-clean" : "gr-held");
      var gs = gateState(done);
      gatesEl.textContent = "Gates complete: " + gs.done + " of " + gs.total +
        (gs.complete ? ", every pre-grade gate is in place." : ", the gates are the discipline before any scene is judged; finish them first.");
    }

    stageEl.addEventListener("click", function (ev) {
      var b = ev.target.closest("button");
      if (!b) return;
      if (b.dataset.grSet) {
        var parts = b.dataset.grSet.split(":");
        entries[Number(parts[0])].status = parts[1];
      } else if (b.dataset.grStep) {
        var sp = b.dataset.grStep.split(":");
        var ent = entries[Number(sp[0])];
        ent.steps = ent.steps || {};
        ent.steps[sp[1]] = !ent.steps[sp[1]];
      } else if (b.dataset.grRef !== undefined && b.dataset.grRef !== "") {
        var rent = entries[Number(b.dataset.grRef)];
        rent.reference = !rent.reference;
      } else if (b.dataset.grDel !== undefined && b.dataset.grDel !== "") {
        entries.splice(Number(b.dataset.grDel), 1);
      } else { return; }
      render();
    });

    document.querySelectorAll("[data-gr-gate]").forEach(function (cb) {
      cb.addEventListener("change", function () {
        done = Array.prototype.slice.call(document.querySelectorAll("[data-gr-gate]:checked"))
          .map(function (x) { return x.getAttribute("data-gr-gate"); });
        render();
      });
    });

    var addBtn = document.getElementById("gr-add");
    if (addBtn) addBtn.addEventListener("click", function () {
      var scene = (document.getElementById("gr-new-scene").value || "").trim();
      var detail = (document.getElementById("gr-new-detail").value || "").trim();
      if (!scene) { msgEl.hidden = false; msgEl.textContent = "Name the scene, the sheet only holds what is written down, scene by scene."; return; }
      entries.push({ scene: scene, source: document.getElementById("gr-new-source").value,
        reference: document.getElementById("gr-new-reference").checked,
        detail: detail,
        steps: { exposure: document.getElementById("gr-new-exposure").checked,
                 contrast: document.getElementById("gr-new-contrast").checked,
                 saturation: document.getElementById("gr-new-saturation").checked,
                 texture: document.getElementById("gr-new-texture").checked,
                 skin: document.getElementById("gr-new-skin").checked },
        status: document.getElementById("gr-new-status").value });
      document.getElementById("gr-new-scene").value = "";
      document.getElementById("gr-new-detail").value = "";
      msgEl.hidden = true;
      render();
    });

    function exportText() {
      return sheetToMarkdown((document.getElementById("gr-title").value || "").trim(), entries, done);
    }
    var copyBtn = document.getElementById("gr-copy");
    if (copyBtn) copyBtn.addEventListener("click", function () {
      var doneMsg = function () { msgEl.hidden = false; msgEl.textContent = "Grade sheet copied as markdown."; };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(exportText()).then(doneMsg, doneMsg);
      else doneMsg();
    });
    var dlBtn = document.getElementById("gr-download");
    if (dlBtn) dlBtn.addEventListener("click", function () {
      var blob = new Blob([exportText()], { type: "text/markdown" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "grade-sheet.md";
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    });

    render();
  });
})();
