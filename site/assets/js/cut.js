/* The Cut Sheet — the editing chapters
   (craft/editing-pipeline.md + craft/editing-ai-footage.md)
   as a working cut sheet. The chapters' claim sets the
   stakes: synthetic footage has no rest state — it shimmers,
   breathes, and drifts at the pixel level — so the cut is
   where an AI film is actually made or lost. The sheet
   invents nothing: it takes a production's own shots — each
   shot's duration, its three inspection passes (story,
   background, motion at half speed), the frame-by-frame
   check a long hold owes, what the inspection found (no
   defect, a local defect, a structural one), the route the
   shot is on (in the cut, in repair on the ladder, sent
   back to regenerate, cut from the film), and its failed
   repair attempts — and computes the picture-lock verdict
   from the chapters' own rules, three of them mechanical:
   a shot held longer than five seconds without the
   frame-by-frame check reads uninspected; a structural
   defect routed anywhere but regeneration reads misrouted;
   and a repair that has failed twice reads struck — the
   two-strike rule sends it back. Deterministic: the same
   sheet always produces the same verdict and export. */
(function () {
  "use strict";

  /* The chapters' pre-lock gates, verbatim in substance. */
  var GATES = [
    { id: "selects", name: "Selects discipline held: 2–4 takes, one keeper",
      what: "Generate 2–4 takes per shot and keep the best one — the first generation is a draft, and takes 2–4 are where the model settles. Past four takes you are usually prompting the wrong thing: go back to the prompt, not the generate button. Only keeps enter the edit; alts live in a separate bin." },
    { id: "receipts", name: "Generation receipts kept for every kept take",
      what: "For every take you keep, record the model, the prompt (or prompt ID), the seed if the tool exposes one, and the generation date. When a shot needs a re-render three weeks later, the receipt is the difference between matching it and starting over." },
    { id: "naming", name: "Takes named like an editor, not a prompter",
      what: "Scene, shot, version, verdict: sc03_sh02_v3_keep.mov beats kling_dreamy_final_FINAL2.mp4. The verdict suffix (_keep, _alt, _fix) is the whole system — at 2am you should be able to read the selects bin without opening anything." },
    { id: "soundled", name: "Cut to sound early: temp score in, J/L-cuts placed",
      what: "Even a rough music bed gives synthetic footage a pulse to cut against; editors who cut AI footage silent tend to cut it metronomically. Let audio lead or lag the picture cut — J-cuts and L-cuts are free professionalism, and they cost nothing." },
    { id: "lockorder", name: "Lock order respected: picture before grade and mix, upscale last",
      what: "Picture lock comes before color and mix — the grade and the cue sheet both start from the locked cut. One grain goes over the locked timeline, and the upscale is of the final timeline only: never upscale individual clips and re-edit; you pay for pixels you cut." },
  ];

  /* The inspection pass: watch every clip three times with
     three different eyes before it earns a place in the
     timeline. */
  var PASSES = [
    { id: "story", label: "Story pass" },
    { id: "background", label: "Background scan" },
    { id: "motion", label: "Motion pass (half speed)" },
  ];
  var PASS_IDS = PASSES.map(function (s) { return s.id; });

  var DEFECTS = [
    { id: "none", label: "No defect found" },
    { id: "local", label: "Local — bad frames, one element, jitter" },
    { id: "structural", label: "Structural — action, composition, identity" },
  ];
  var DEFECT_IDS = DEFECTS.map(function (s) { return s.id; });

  var STATUSES = [
    { id: "in", label: "In the cut" },
    { id: "repair", label: "In repair — on the ladder" },
    { id: "regen", label: "Sent back — regenerate" },
    { id: "cut", label: "Cut from the film" },
  ];
  var STATUS_IDS = STATUSES.map(function (s) { return s.id; });

  /* The worked example pre-loaded on the sheet: the same
     small AI short the Ledger, the Cue Sheet, and the Grade
     Sheet track ("The Night Bus"), cut instead of seen,
     heard, or graded. Five shots are clean in the cut; the
     rain stop's hand shot is on the repair ladder — a local
     jitter defect, one failed attempt — so the first
     verdict is the honest hold, and finishing the repair
     clears it. The long shelter hold is frame-checked, as
     the 5-second rule demands. Every label is invented for
     the example; no real production is described. */
  var DEFAULT_ENTRIES = [
    { shot: "Sc 1 · Sh 01 — Depot wide, Mara waits", duration: 3.5, framecheck: false,
      detail: "Take 2 of 3, the keeper. Story pass: the wait reads. Background: canopy signs hold. Half speed: no swim in the wet concrete.",
      passes: { story: true, background: true, motion: true }, defect: "none", status: "in", attempts: 0 },
    { shot: "Sc 2 · Sh 04 — Window close-up, the hardest line", duration: 4.2, framecheck: false,
      detail: "The performance shot — held under five seconds on purpose; an AI face held longer invites the audience to study the render instead of the line.",
      passes: { story: true, background: true, motion: true }, defect: "none", status: "in", attempts: 0 },
    { shot: "Sc 3 · Sh 02 — The rain stop, shelter two-shot hold", duration: 6.8, framecheck: true,
      detail: "The film's one long hold, and its cleanest take — earned in the inspection pass and frame-checked at start, middle, and end: no drift past forgiveness.",
      passes: { story: true, background: true, motion: true }, defect: "none", status: "in", attempts: 0 },
    { shot: "Sc 3 · Sh 05 — Hands on the shelter rail", duration: 2.4, framecheck: false,
      detail: "Micro-jitter on the rail at half speed — a local defect. On the ladder at rung 2 (re-time at 90%): one attempt smoothed the hands but warped the rail; the next attempt works the trim first, rung 1, before climbing.",
      passes: { story: true, background: true, motion: true }, defect: "local", status: "repair", attempts: 1 },
    { shot: "Sc 4 · Sh 03 — Office pan, radio voices", duration: 3.1, framecheck: false,
      detail: "Cut on the pan's motion vector — the match-cut carries the eye past the join. J-cut: the radio voice leads the picture by six frames.",
      passes: { story: true, background: true, motion: true }, defect: "none", status: "in", attempts: 0 },
    { shot: "Sc 5 · Sh 01 — Departure pull-away", duration: 4.6, framecheck: false,
      detail: "The button. Background scan caught a warping timetable board in take 1; take 3's board holds. L-cut: the depot ambience lags the cut to black.",
      passes: { story: true, background: true, motion: true }, defect: "none", status: "in", attempts: 0 },
  ];

  function passesComplete(e) {
    if (!e || !e.passes) return false;
    return PASSES.every(function (s) { return !!e.passes[s.id]; });
  }

  function passCount(e) {
    if (!e || !e.passes) return 0;
    return PASSES.filter(function (s) { return !!e.passes[s.id]; }).length;
  }

  /* The chapters' hardest editing rules, applied
     mechanically, in the order a lock is actually blocked:
     a structural defect in repair is a decision being
     violated; two failed repairs strike a shot out; a long
     hold without the frame check is inspection debt the
     audience will collect. A shot cut from the film is a
     decision, not a defect — it blocks nothing. */
  function effectiveStatus(e) {
    if (!e) return "unchecked";
    var st = STATUS_IDS.indexOf(e.status) >= 0 ? e.status : "in";
    if (st === "cut") return "cut";
    if (e.defect === "structural" && st !== "regen") return "misrouted";
    if (st === "repair" && (Number(e.attempts) || 0) >= 2) return "struck";
    if ((Number(e.duration) || 0) > 5 && !e.framecheck) return "uninspected";
    if (st === "regen") return "sentback";
    if (st === "repair") return "repairing";
    if (!passesComplete(e)) return "unchecked";
    if (e.defect && e.defect !== "none") return "carrying";
    return "clean";
  }

  var EFFECTIVE_LABELS = {
    clean: "Clean — in the cut",
    repairing: "In repair — on the ladder",
    sentback: "Sent back — regenerate",
    unchecked: "Unchecked — inspection unfinished",
    carrying: "Carrying a defect in the cut",
    uninspected: "Uninspected long hold — frame check owed",
    misrouted: "Misrouted — structural defect in repair",
    struck: "Struck out — two failed repairs",
    cut: "Cut from the film",
  };

  function evaluate(entries) {
    var list = Array.isArray(entries) ? entries : [];
    var eff = list.map(function (e) { return effectiveStatus(e); });
    var count = function (s) { return eff.filter(function (x) { return x === s; }).length; };
    var clean = count("clean");
    var cut = count("cut");
    var held = count("repairing") + count("sentback") + count("unchecked") + count("carrying");
    var stopped = count("misrouted") + count("struck") + count("uninspected");
    var inCut = clean + held + stopped;
    var ready = list.length > 0 && held === 0 && stopped === 0;
    var verdict;
    if (list.length === 0) {
      verdict = "No cut sheet yet — the timeline is a pile of generations until the selects are logged. Log every shot in the cut: its duration, its three inspection passes, and what the inspection found.";
    } else if (count("misrouted") > 0) {
      var m = count("misrouted");
      verdict = "Picture lock stopped — " + m + " shot" + (m === 1 ? " carries" : "s carry") +
        " a structural defect routed to repair: wrong action, wrong composition, or identity drift through the whole clip is not a repair job. Regenerate — and if the same defect appears in three takes, the problem is upstream: fix the prompt, not the frames.";
    } else if (count("struck") > 0) {
      var k = count("struck");
      verdict = "Picture lock stopped — " + k + " shot" + (k === 1 ? " has" : "s have") +
        " burned two repair attempts: the two-strike rule sends them back to regenerate. A third attempt at fixing a morph almost never works, and it now costs more than a fresh generation.";
    } else if (count("uninspected") > 0) {
      var u = count("uninspected");
      verdict = "Picture lock stopped — " + u + " shot" + (u === 1 ? " holds" : "s hold") +
        " longer than five seconds without the frame-by-frame check: long holds are where drift accumulates past the audience's forgiveness. Inspect the start, middle, and end — or trim the hold under five seconds.";
    } else if (held > 0) {
      verdict = "Hold picture lock — " + held + " shot" + (held === 1 ? " is" : "s are") +
        " not ready: a repair still on the ladder, a shot sent back for regeneration, an inspection unfinished, or a local defect still carried in the cut. Work the ladder bottom-up — cut around it, re-time, stabilize, composite — and stop at the first rung that works.";
    } else {
      verdict = "Picture lock clean — every shot in the cut passed the three-eyed inspection, every hold over five seconds is frame-checked, and no defect is being carried or repaired past its second strike. Still owed before delivery: the 24-hour rule — lock it, sleep, watch it fresh — the watch on three screens (phone, laptop, TV), one grain over the locked timeline, and the upscale, last, of the final timeline only.";
    }
    return {
      total: list.length, clean: clean, held: held, stopped: stopped, cut: cut,
      inCut: inCut, ready: ready,
      cleanEntries: list.filter(function (e, i) { return eff[i] === "clean"; }),
      heldEntries: list.filter(function (e, i) { return ["repairing", "sentback", "unchecked", "carrying"].indexOf(eff[i]) >= 0; }),
      stoppedEntries: list.filter(function (e, i) { return ["misrouted", "struck", "uninspected"].indexOf(eff[i]) >= 0; }),
      verdict: verdict,
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
    return "— no route recorded —";
  }

  function defectLabel(id) {
    for (var i = 0; i < DEFECTS.length; i++) if (DEFECTS[i].id === id) return DEFECTS[i].label;
    return "— no finding recorded —";
  }

  function effectiveLabel(e) {
    return EFFECTIVE_LABELS[effectiveStatus(e)] || "—";
  }

  function passesLabel(e) {
    return PASSES.map(function (s) {
      return s.label.split(" (")[0] + " " + (e && e.passes && e.passes[s.id] ? "✓" : "—");
    }).join(" · ");
  }

  function sheetToMarkdown(title, entries, doneIds) {
    var r = evaluate(entries);
    var gs = gateState(doneIds);
    var lines = [];
    lines.push("# Cut sheet — " + (title || "Untitled production"));
    lines.push("");
    lines.push("Editing AI footage: the selects discipline, the three-eyed inspection pass, the fix-it ladder, and the regenerate-vs-repair decision (see craft/editing-ai-footage.md and craft/editing-pipeline.md).");
    lines.push("");
    lines.push("## The pre-lock gates");
    GATES.forEach(function (s) {
      var mark = (doneIds || []).indexOf(s.id) >= 0 ? "x" : " ";
      lines.push("- [" + mark + "] " + s.name);
    });
    lines.push("");
    lines.push("Gates complete: " + gs.done + " of " + gs.total + ".");
    lines.push("");
    lines.push("## Shots (" + r.total + ")");
    if (!entries.length) lines.push("- (none logged)");
    entries.forEach(function (e) {
      lines.push("- " + e.shot + " — " + effectiveLabel(e) + ". Duration: " + (Number(e.duration) || 0) + "s" +
        ". Passes: " + passesLabel(e) + ". Frame check: " + (e.framecheck ? "done" : "not done") +
        ". Finding: " + defectLabel(e.defect) + ". Route: " + statusLabel(e.status) +
        ". Repair attempts: " + (Number(e.attempts) || 0) + ". " + (e.detail || ""));
    });
    lines.push("");
    lines.push("## Picture-lock verdict");
    lines.push(r.verdict);
    lines.push("");
    lines.push("Clean: " + r.clean + " · held: " + r.held + " · stopped: " + r.stopped + " · cut from the film: " + r.cut + ".");
    return lines.join("\n") + "\n";
  }

  var api = { GATES: GATES, PASSES: PASSES, DEFECTS: DEFECTS, STATUSES: STATUSES,
    DEFAULT_ENTRIES: DEFAULT_ENTRIES, effectiveStatus: effectiveStatus,
    passesComplete: passesComplete, passCount: passCount, evaluate: evaluate,
    gateState: gateState, statusLabel: statusLabel, defectLabel: defectLabel,
    effectiveLabel: effectiveLabel, passesLabel: passesLabel,
    sheetToMarkdown: sheetToMarkdown };

  if (typeof module !== "undefined" && module.exports) { module.exports = api; }
  if (typeof window !== "undefined") { window.CutEngine = api; }

  /* ---- browser wiring (skipped under node) ---- */
  if (typeof document === "undefined") return;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var stageEl = document.getElementById("cut-stage");
    if (!stageEl) return;
    var entries = JSON.parse(JSON.stringify(DEFAULT_ENTRIES));
    var done = [];
    var verdictEl = document.getElementById("cut-verdict");
    var gatesEl = document.getElementById("cut-gates-state");
    var msgEl = document.getElementById("cut-msg");

    function render() {
      var r = evaluate(entries);
      var html = "";
      entries.forEach(function (e, idx) {
        var eff = effectiveStatus(e);
        var raw = STATUS_IDS.indexOf(e.status) >= 0 ? e.status : "in";
        html += '<article class="cut-entry"><div class="cut-entry-head"><h4>' + esc(e.shot) + "</h4>" +
          '<span class="cut-tag">' + esc((Number(e.duration) || 0) + "s") + "</span></div>" +
          '<p class="cut-detail">' + esc(e.detail || "") + "</p>" +
          '<p class="cut-passes" role="group" aria-label="Inspection passes done for ' + esc(e.shot) + '">' +
          PASSES.map(function (s) {
            var on = !!(e.passes && e.passes[s.id]);
            return '<button type="button" class="btn btn-sm' + (on ? "" : " btn-ghost") +
              '" data-cut-pass="' + idx + ":" + s.id + '" aria-pressed="' + on + '">' +
              esc(s.label) + (on ? " ✓" : " —") + "</button>";
          }).join(" ") +
          ' <button type="button" class="btn btn-sm' + (e.framecheck ? "" : " btn-ghost") +
          '" data-cut-frame="' + idx + '" aria-pressed="' + !!e.framecheck + '">Frame check (holds &gt;5s) ' +
          (e.framecheck ? "✓" : "—") + "</button></p>" +
          '<p class="cut-state">State: <strong>' + esc(effectiveLabel(e)) + "</strong>" +
          (eff !== "clean" && eff !== raw && !(eff === "repairing" && raw === "repair") && !(eff === "sentback" && raw === "regen") && !(eff === "cut" && raw === "cut")
            ? ' <span class="cut-note">(by the chapters\u2019 rules — see the verdict)</span>' : "") + "</p>" +
          '<p class="cut-finding">Finding: ' +
          DEFECTS.map(function (s) {
            return '<button type="button" class="btn btn-sm' + (e.defect === s.id ? "" : " btn-ghost") +
              '" data-cut-defect="' + idx + ":" + s.id + '">' + esc(s.label.split(" — ")[0]) + "</button>";
          }).join(" ") + "</p>" +
          '<p class="cut-route">Route: ' +
          STATUSES.map(function (s) {
            return '<button type="button" class="btn btn-sm' + (raw === s.id ? "" : " btn-ghost") +
              '" data-cut-set="' + idx + ":" + s.id + '">' + esc(s.label) + "</button>";
          }).join(" ") + "</p>" +
          '<p class="cut-attempts">Failed repair attempts: <strong>' + (Number(e.attempts) || 0) + "</strong> " +
          '<button type="button" class="btn btn-sm btn-ghost" data-cut-att="' + idx + ':-1">−</button> ' +
          '<button type="button" class="btn btn-sm btn-ghost" data-cut-att="' + idx + ':1">+</button>' +
          ' <span class="cut-note">two failed repairs strike the shot out — regenerate</span></p>' +
          '<p><button type="button" class="btn btn-sm btn-ghost" data-cut-del="' + idx + '">Remove shot</button></p></article>';
      });
      stageEl.innerHTML = html || '<p class="cut-detail">No shots logged yet.</p>';
      verdictEl.textContent = r.verdict;
      verdictEl.className = "cut-verdict " + (r.ready ? "cut-clean" : "cut-held");
      var gs = gateState(done);
      gatesEl.textContent = "Gates complete: " + gs.done + " of " + gs.total +
        (gs.complete ? " — every pre-lock gate is in place." : " — the gates are the discipline before any shot is judged; finish them first.");
    }

    stageEl.addEventListener("click", function (ev) {
      var b = ev.target.closest("button");
      if (!b) return;
      if (b.dataset.cutSet) {
        var parts = b.dataset.cutSet.split(":");
        entries[Number(parts[0])].status = parts[1];
      } else if (b.dataset.cutPass) {
        var pp = b.dataset.cutPass.split(":");
        var pent = entries[Number(pp[0])];
        pent.passes = pent.passes || {};
        pent.passes[pp[1]] = !pent.passes[pp[1]];
      } else if (b.dataset.cutDefect) {
        var dp = b.dataset.cutDefect.split(":");
        entries[Number(dp[0])].defect = dp[1];
      } else if (b.dataset.cutFrame !== undefined && b.dataset.cutFrame !== "") {
        var fent = entries[Number(b.dataset.cutFrame)];
        fent.framecheck = !fent.framecheck;
      } else if (b.dataset.cutAtt) {
        var ap = b.dataset.cutAtt.split(":");
        var aent = entries[Number(ap[0])];
        aent.attempts = Math.max(0, Math.min(9, (Number(aent.attempts) || 0) + Number(ap[1])));
      } else if (b.dataset.cutDel !== undefined && b.dataset.cutDel !== "") {
        entries.splice(Number(b.dataset.cutDel), 1);
      } else { return; }
      render();
    });

    document.querySelectorAll("[data-cut-gate]").forEach(function (cb) {
      cb.addEventListener("change", function () {
        done = Array.prototype.slice.call(document.querySelectorAll("[data-cut-gate]:checked"))
          .map(function (x) { return x.getAttribute("data-cut-gate"); });
        render();
      });
    });

    var addBtn = document.getElementById("cut-add");
    if (addBtn) addBtn.addEventListener("click", function () {
      var shot = (document.getElementById("cut-new-shot").value || "").trim();
      var detail = (document.getElementById("cut-new-detail").value || "").trim();
      if (!shot) { msgEl.hidden = false; msgEl.textContent = "Name the shot — scene, shot, what it does. The sheet only holds what is written down, shot by shot."; return; }
      entries.push({ shot: shot,
        duration: Number(document.getElementById("cut-new-duration").value) || 0,
        framecheck: document.getElementById("cut-new-framecheck").checked,
        detail: detail,
        passes: { story: document.getElementById("cut-new-story").checked,
                  background: document.getElementById("cut-new-background").checked,
                  motion: document.getElementById("cut-new-motion").checked },
        defect: document.getElementById("cut-new-defect").value,
        status: document.getElementById("cut-new-status").value,
        attempts: Number(document.getElementById("cut-new-attempts").value) || 0 });
      document.getElementById("cut-new-shot").value = "";
      document.getElementById("cut-new-detail").value = "";
      msgEl.hidden = true;
      render();
    });

    function exportText() {
      return sheetToMarkdown((document.getElementById("cut-title").value || "").trim(), entries, done);
    }
    var copyBtn = document.getElementById("cut-copy");
    if (copyBtn) copyBtn.addEventListener("click", function () {
      var doneMsg = function () { msgEl.hidden = false; msgEl.textContent = "Cut sheet copied as markdown."; };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(exportText()).then(doneMsg, doneMsg);
      else doneMsg();
    });
    var dlBtn = document.getElementById("cut-download");
    if (dlBtn) dlBtn.addEventListener("click", function () {
      var blob = new Blob([exportText()], { type: "text/markdown" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "cut-sheet.md";
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    });

    render();
  });
})();
