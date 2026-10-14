/* The Longform Sheet, the long-form pipelines chapter
   (craft/longform-pipelines.md) as a working sheet.
   The chapter's claim sets the stakes: short films are won
   with great prompts, long films are won with systems, drift is cumulative, the asset math is brutal, and a weak
   scene's cost is only discovered after it is generated.
   The sheet invents nothing: it takes a production's own
   scenes, each scene's stress test, its storyboard, its
   reference (a video anchor, a text description, or none
   yet), its dialogue route, its draft tier, its re-roll
   count, and its route (in production, picture-locked, in
   generation supervision, or cut from the film), and
   computes the feature-lock verdict from the chapter's own
   rules, three of them mechanical: a scene generated
   without its stress test reads untested; a scene chained
   off a text description reads drifting, because a text
   description drifts over generations and a video reference
   doesn't; and a scene generated at full resolution before
   its winner is chosen reads wasteful, draft at 720p,
   upscale winners only. Deterministic: the same sheet
   always produces the same verdict and export. */
(function () {
  "use strict";

  /* The chapter's pre-lock gates, verbatim in substance. */
  var GATES = [
    { id: "registry", name: "Asset registry complete before shot one",
      what: "Every character, location, and prop named, versioned, and locked in the registry before the first shot is generated. State changes (scar, haircut, dirt, wardrobe) get a new @-tag, state is an asset, never an overwrite." },
    { id: "stresstest", name: "Every scene stress-tested and storyboarded",
      what: "Goal, Obstacle, Tactic, Reversal, Value Shift, with a verdict and fixes, scene by scene, then storyboarded step by step. Only on the storyboard does it become clear how good a scene really is; a weak scene's cost is discovered after it is generated." },
    { id: "architecture", name: "Architecture chosen: chaining, or sequence assembly with a wrangler",
      what: "Solo or small team: scene-by-scene chaining, each new scene's reference is the previous scene's finished video. Team of five-plus: sequence assembly, but only if someone owns the registry full-time; without a wrangler, parallel generation produces parallel continuities." },
    { id: "dialogue", name: "Dialogue architecture chosen per scene, not per film",
      what: "Native speech, human-recorded and AI-converted, or decoupled TTS, chosen per scene. Budget the continuity and re-roll effort on ordinary rooms, not spectacle: the one-room dialogue scene is the hardest task in the record, harder than the space battle." },
    { id: "lockdiscipline", name: "Lock discipline written: base never re-run, plates carry the look, Voice Bible verbatim",
      what: "The base portrait is never re-run through any model. The look lives in the asset plate, not the video prompt. The Voice Bible is pasted into every generation verbatim, not even a synonym changed. Every prompt is an island: everything re-stated, every time." },
  ];

  var REFS = [
    { id: "video", label: "Video reference, previous finished scene or previz" },
    { id: "text", label: "Text description only" },
    { id: "none", label: "No reference yet" },
  ];
  var REF_IDS = REFS.map(function (s) { return s.id; });

  var DIALOGUES = [
    { id: "native", label: "Native, speech generated with the shot" },
    { id: "converted", label: "Human-recorded, AI-converted" },
    { id: "decoupled", label: "Decoupled, TTS / synthetic, married in the edit" },
    { id: "silent", label: "No dialogue, picture and sound design only" },
  ];
  var DIALOGUE_IDS = DIALOGUES.map(function (s) { return s.id; });

  var TIERS = [
    { id: "draft", label: "720p draft" },
    { id: "winner", label: "Winner, upscaled after lock" },
    { id: "fullres", label: "Full-res generation" },
  ];
  var TIER_IDS = TIERS.map(function (s) { return s.id; });

  var STATUSES = [
    { id: "building", label: "In production" },
    { id: "locked", label: "Picture-Locked" },
    { id: "supervision", label: "In generation supervision, the scheduled post-rough-cut QC pass" },
    { id: "cut", label: "Cut from the film" },
  ];
  var STATUS_IDS = STATUSES.map(function (s) { return s.id; });

  /* The worked example pre-loaded on the sheet: the same
     fictional production the other sheets track ("The Night
     Bus"), built long, a 24-minute film assembled
     scene-by-scene, each scene chained off the previous
     scene's finished video. Five scenes are picture-locked
     clean; the depot-office sequence sits in generation
     supervision, the scheduled QC pass after the rough cut, so the first verdict is the honest hold. Every label is
     invented for the example; no real production is
     described. */
  var DEFAULT_ENTRIES = [
    { scene: "Seq 1, Depot at night, Mara waits", stress: true, board: true,
      ref: "video", dialogue: "decoupled", tier: "winner", rerolls: 6, status: "locked",
      detail: "The opening sequence chains off the previz. Stress test: want (the last bus) against obstacle (the board goes dark), reversal lands on the driver's arrival. Drafted at 720p, winner upscaled after lock; the plate carries the depot's sodium look." },
    { scene: "Seq 2, The window, the hardest line", stress: true, board: true,
      ref: "video", dialogue: "converted", tier: "winner", rerolls: 11, status: "locked",
      detail: "The dialogue-dense sequence, so the performance is human-recorded and converted, timing and breath are human decisions, conversion only changes timbre. Eleven re-rolls, inside the chapter's 5 to 20× envelope, spent here and not on spectacle." },
    { scene: "Seq 3, The rain stop, two-hander", stress: true, board: true,
      ref: "video", dialogue: "native", tier: "winner", rerolls: 8, status: "locked",
      detail: "Sparse dialogue, the acting is the point, native speech, lip-sync and timing born together, the Voice Bible pasted verbatim into every generation. The blocking diagram was attached last among the references, drawn from the camera's side." },
    { scene: "Seq 4, Depot office, the radio news", stress: true, board: true,
      ref: "video", dialogue: "decoupled", tier: "draft", rerolls: 7, status: "supervision",
      detail: "In generation supervision, the scheduled QC/re-generation pass after the rough cut, not continuous re-rolling. Two shots drifted at the seam (the office rearranged itself between generations; the depth map is now in the folder) and are being re-generated against the previous scene's finished video." },
    { scene: "Seq 5, The night road, montage", stress: true, board: true,
      ref: "video", dialogue: "silent", tier: "winner", rerolls: 5, status: "locked",
      detail: "No dialogue, picture and sound design carry it. Cut on the dialogue rule's inverse: J-cuts from the radio carry the seams, because action continuity is exactly what the models are worst at." },
    { scene: "Seq 6, Departure at dawn, the button", stress: true, board: true,
      ref: "video", dialogue: "converted", tier: "winner", rerolls: 9, status: "locked",
      detail: "The closing sequence chains off Seq 5's finished video. The base portraits were never re-run; dawn is a new tagged state on the locked plates, integrated with masks around the base pixels." },
  ];

  /* The chapter's hardest long-form rules, applied
     mechanically, in the order a lock is actually blocked:
     an untested scene hides its cost until after it is
     paid for; a text reference is not an anchor; full-res
     generation before the winner is chosen burns the
     budget the re-rolls needed. A scene cut from the film
     blocks nothing: a killed sequence is a decision, not
     a defect. */
  function effectiveStatus(e) {
    if (!e) return "unchecked";
    var st = STATUS_IDS.indexOf(e.status) >= 0 ? e.status : "building";
    if (st === "cut") return "cutscene";
    if (!e.stress) return "untested";
    if (e.ref === "text") return "drifting";
    if (e.tier === "fullres") return "wasteful";
    if (st === "supervision") return "supervision";
    if (st === "building") return "building";
    if (!e.board || REF_IDS.indexOf(e.ref) < 0 || e.ref === "none") return "unchecked";
    return "clean";
  }

  var EFFECTIVE_LABELS = {
    clean: "Clean, Picture-Locked",
    building: "In production",
    supervision: "In generation supervision, scheduled QC pass",
    unchecked: "Unchecked, storyboard or reference unfinished",
    untested: "Untested, generated without its stress test",
    drifting: "Drifting, a text description is not an anchor",
    wasteful: "Wasteful, full-res before the winner is chosen",
    cutscene: "Cut from the film, a decision, not a defect",
  };

  function evaluate(entries) {
    var list = Array.isArray(entries) ? entries : [];
    var eff = list.map(function (e) { return effectiveStatus(e); });
    var count = function (s) { return eff.filter(function (x) { return x === s; }).length; };
    var clean = count("clean");
    var cut = count("cutscene");
    var held = count("building") + count("supervision") + count("unchecked");
    var stopped = count("untested") + count("drifting") + count("wasteful");
    var ready = list.length > 0 && held === 0 && stopped === 0;
    var verdict;
    if (list.length === 0) {
      verdict = "No longform sheet yet, a feature built on prompts alone drifts by scene three. Log every scene: its stress test, its reference, its dialogue route, its draft tier, and its route.";
    } else if (count("untested") > 0) {
      var m = count("untested");
      verdict = "Feature lock stopped, " + m + " scene" + (m === 1 ? " was" : "s were") +
        " generated without a stress test: Goal, Obstacle, Tactic, Reversal, Value Shift, with a verdict and fixes, then storyboard it. A weak scene's cost is only discovered after it is generated, stress-test it before a single credit is spent.";
    } else if (count("drifting") > 0) {
      var k = count("drifting");
      verdict = "Feature lock stopped, " + k + " scene" + (k === 1 ? " is" : "s are") +
        " chained off a text description: a text description drifts over generations, a video reference doesn't. Chain each scene off the previous scene's finished video or a previz; what you want goes in the reference.";
    } else if (count("wasteful") > 0) {
      var u = count("wasteful");
      verdict = "Feature lock stopped, " + u + " scene" + (u === 1 ? " is" : "s are") +
        " being generated at full resolution before the winner is chosen: draft at 720p and upscale winners only. At feature scale that is the difference between a $3,000 and a $30,000 compute bill, and the re-roll budget belongs to the ordinary rooms.";
    } else if (held > 0) {
      verdict = "Hold feature lock, " + held + " scene" + (held === 1 ? " is" : "s are") +
        " not ready: still in production, in the scheduled generation-supervision pass, or missing its storyboard or video reference. Drift is cumulative, not linear, a seam left unchecked is paid for in every scene after it.";
    } else {
      verdict = "Feature lock clean, every scene stress-tested and storyboarded, every seam chained off a video reference, every winner drafted at 720p and upscaled only after lock. Still owed: picture lock means no new generations except emergencies, with notice to color and sound, and a compute budget carried at the 5 to 20× overhead envelope, never the clean-pass number.";
    }
    return {
      total: list.length, clean: clean, held: held, stopped: stopped, cut: cut,
      ready: ready,
      cleanEntries: list.filter(function (e, i) { return eff[i] === "clean"; }),
      heldEntries: list.filter(function (e, i) { return ["building", "supervision", "unchecked"].indexOf(eff[i]) >= 0; }),
      stoppedEntries: list.filter(function (e, i) { return ["untested", "drifting", "wasteful"].indexOf(eff[i]) >= 0; }),
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
    return "No route recorded ";
  }

  function refLabel(id) {
    for (var i = 0; i < REFS.length; i++) if (REFS[i].id === id) return REFS[i].label;
    return "No reference recorded ";
  }

  function dialogueLabel(id) {
    for (var i = 0; i < DIALOGUES.length; i++) if (DIALOGUES[i].id === id) return DIALOGUES[i].label;
    return "No dialogue route recorded ";
  }

  function tierLabel(id) {
    for (var i = 0; i < TIERS.length; i++) if (TIERS[i].id === id) return TIERS[i].label;
    return "No draft tier recorded ";
  }

  function effectiveLabel(e) {
    return EFFECTIVE_LABELS[effectiveStatus(e)] || "…";
  }

  function sheetToMarkdown(title, entries, doneIds) {
    var r = evaluate(entries);
    var gs = gateState(doneIds);
    var lines = [];
    lines.push("# Longform sheet, " + (title || "Untitled production"));
    lines.push("");
    lines.push("Long-form pipelines in AI video: the asset registry, the stress test, the chaining rule, dialogue at scale, and picture lock (see craft/longform-pipelines.md).");
    lines.push("");
    lines.push("## The pre-lock gates");
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
      lines.push("- " + e.scene + ", " + effectiveLabel(e) + ". Stress test: " + (e.stress ? "done" : "not done") +
        ". Storyboard: " + (e.board ? "done" : "not done") +
        ". Reference: " + refLabel(e.ref) +
        ". Dialogue: " + dialogueLabel(e.dialogue) +
        ". Draft tier: " + tierLabel(e.tier) +
        ". Re-rolls: " + (Number(e.rerolls) || 0) +
        ". Route: " + statusLabel(e.status) + ". " + (e.detail || ""));
    });
    lines.push("");
    lines.push("## Feature-lock verdict");
    lines.push(r.verdict);
    lines.push("");
    lines.push("Clean: " + r.clean + " · held: " + r.held + " · stopped: " + r.stopped + " · cut: " + r.cut + ".");
    return lines.join("\n") + "\n";
  }

  var api = { GATES: GATES, REFS: REFS, DIALOGUES: DIALOGUES, TIERS: TIERS, STATUSES: STATUSES,
    DEFAULT_ENTRIES: DEFAULT_ENTRIES, effectiveStatus: effectiveStatus,
    evaluate: evaluate, gateState: gateState, statusLabel: statusLabel,
    refLabel: refLabel, dialogueLabel: dialogueLabel, tierLabel: tierLabel,
    effectiveLabel: effectiveLabel, sheetToMarkdown: sheetToMarkdown };

  if (typeof module !== "undefined" && module.exports) { module.exports = api; }
  if (typeof window !== "undefined") { window.LongformEngine = api; }

  /* ---- browser wiring (skipped under node) ---- */
  if (typeof document === "undefined") return;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var stageEl = document.getElementById("long-stage");
    if (!stageEl) return;
    var entries = JSON.parse(JSON.stringify(DEFAULT_ENTRIES));
    var done = [];
    var verdictEl = document.getElementById("long-verdict");
    var gatesEl = document.getElementById("long-gates-state");
    var msgEl = document.getElementById("long-msg");

    function render() {
      var r = evaluate(entries);
      var html = "";
      entries.forEach(function (e, idx) {
        var eff = effectiveStatus(e);
        var raw = STATUS_IDS.indexOf(e.status) >= 0 ? e.status : "building";
        html += '<article class="long-entry"><div class="long-entry-head"><h4>' + esc(e.scene) + "</h4>" +
          '<span class="long-tag">' + esc(tierLabel(e.tier)) + "</span></div>" +
          '<p class="long-detail">' + esc(e.detail || "") + "</p>" +
          '<p class="long-checks" role="group" aria-label="Pipeline checks for ' + esc(e.scene) + '">' +
          '<button type="button" class="btn btn-sm' + (e.stress ? "" : " btn-ghost") +
          '" data-long-stress="' + idx + '" aria-pressed="' + !!e.stress + '">Stress test ' +
          (e.stress ? "✓" : "…") + "</button> " +
          '<button type="button" class="btn btn-sm' + (e.board ? "" : " btn-ghost") +
          '" data-long-board="' + idx + '" aria-pressed="' + !!e.board + '">Storyboard ' +
          (e.board ? "✓" : "…") + "</button></p>" +
          '<p class="long-state">State: <strong>' + esc(effectiveLabel(e)) + "</strong>" +
          (eff !== "clean" && eff !== raw && !(eff === "building" && raw === "building") && !(eff === "cutscene" && raw === "cut")
            ? ' <span class="long-note">(by the chapter\u2019s rules, see the verdict)</span>' : "") + "</p>" +
          '<p class="long-ref">Reference: ' +
          REFS.map(function (s) {
            return '<button type="button" class="btn btn-sm' + (e.ref === s.id ? "" : " btn-ghost") +
              '" data-long-ref="' + idx + ":" + s.id + '">' + esc(s.label.split(", ")[0]) + "</button>";
          }).join(" ") + "</p>" +
          '<p class="long-dialogue">Dialogue: ' +
          DIALOGUES.map(function (s) {
            return '<button type="button" class="btn btn-sm' + (e.dialogue === s.id ? "" : " btn-ghost") +
              '" data-long-dial="' + idx + ":" + s.id + '">' + esc(s.label.split(", ")[0]) + "</button>";
          }).join(" ") + "</p>" +
          '<p class="long-tier">Draft tier: ' +
          TIERS.map(function (s) {
            return '<button type="button" class="btn btn-sm' + (e.tier === s.id ? "" : " btn-ghost") +
              '" data-long-tier="' + idx + ":" + s.id + '">' + esc(s.label) + "</button>";
          }).join(" ") + "</p>" +
          '<p class="long-route">Route: ' +
          STATUSES.map(function (s) {
            return '<button type="button" class="btn btn-sm' + (raw === s.id ? "" : " btn-ghost") +
              '" data-long-set="' + idx + ":" + s.id + '">' + esc(s.label.split(", ")[0]) + "</button>";
          }).join(" ") + "</p>" +
          '<p class="long-rerolls">Re-rolls: <strong>' + (Number(e.rerolls) || 0) + "</strong> " +
          '<button type="button" class="btn btn-sm btn-ghost" data-long-att="' + idx + ':-1">−</button> ' +
          '<button type="button" class="btn btn-sm btn-ghost" data-long-att="' + idx + ':1">+</button>' +
          ' <span class="long-note">the documented regime is 5 to 20× overhead, the envelope is the budget</span></p>' +
          '<p><button type="button" class="btn btn-sm btn-ghost" data-long-del="' + idx + '">Remove scene</button></p></article>';
      });
      stageEl.innerHTML = html || '<p class="long-detail">No scenes logged yet.</p>';
      verdictEl.textContent = r.verdict;
      verdictEl.className = "long-verdict " + (r.ready ? "long-clean" : "long-held");
      var gs = gateState(done);
      gatesEl.textContent = "Gates complete: " + gs.done + " of " + gs.total +
        (gs.complete ? ", every pre-lock gate is in place." : ", the gates are the discipline before any scene is judged; finish them first.");
    }

    stageEl.addEventListener("click", function (ev) {
      var b = ev.target.closest("button");
      if (!b) return;
      if (b.dataset.longSet) {
        var parts = b.dataset.longSet.split(":");
        entries[Number(parts[0])].status = parts[1];
      } else if (b.dataset.longRef) {
        var rp = b.dataset.longRef.split(":");
        entries[Number(rp[0])].ref = rp[1];
      } else if (b.dataset.longDial) {
        var dp = b.dataset.longDial.split(":");
        entries[Number(dp[0])].dialogue = dp[1];
      } else if (b.dataset.longTier) {
        var tp = b.dataset.longTier.split(":");
        entries[Number(tp[0])].tier = tp[1];
      } else if (b.dataset.longStress !== undefined && b.dataset.longStress !== "") {
        var sent = entries[Number(b.dataset.longStress)];
        sent.stress = !sent.stress;
      } else if (b.dataset.longBoard !== undefined && b.dataset.longBoard !== "") {
        var bent = entries[Number(b.dataset.longBoard)];
        bent.board = !bent.board;
      } else if (b.dataset.longAtt) {
        var ap = b.dataset.longAtt.split(":");
        var aent = entries[Number(ap[0])];
        aent.rerolls = Math.max(0, Math.min(99, (Number(aent.rerolls) || 0) + Number(ap[1])));
      } else if (b.dataset.longDel !== undefined && b.dataset.longDel !== "") {
        entries.splice(Number(b.dataset.longDel), 1);
      } else { return; }
      render();
    });

    document.querySelectorAll("[data-long-gate]").forEach(function (cb) {
      cb.addEventListener("change", function () {
        done = Array.prototype.slice.call(document.querySelectorAll("[data-long-gate]:checked"))
          .map(function (x) { return x.getAttribute("data-long-gate"); });
        render();
      });
    });

    var addBtn = document.getElementById("long-add");
    if (addBtn) addBtn.addEventListener("click", function () {
      var scene = (document.getElementById("long-new-scene").value || "").trim();
      var detail = (document.getElementById("long-new-detail").value || "").trim();
      if (!scene) { msgEl.hidden = false; msgEl.textContent = "Name the scene, sequence, place, who is in it. The sheet only holds what is written down, scene by scene."; return; }
      entries.push({ scene: scene,
        stress: document.getElementById("long-new-stress").checked,
        board: document.getElementById("long-new-board").checked,
        ref: document.getElementById("long-new-ref").value,
        dialogue: document.getElementById("long-new-dialogue").value,
        tier: document.getElementById("long-new-tier").value,
        rerolls: Number(document.getElementById("long-new-rerolls").value) || 0,
        status: document.getElementById("long-new-status").value,
        detail: detail });
      document.getElementById("long-new-scene").value = "";
      document.getElementById("long-new-detail").value = "";
      msgEl.hidden = true;
      render();
    });

    function exportText() {
      return sheetToMarkdown((document.getElementById("long-title").value || "").trim(), entries, done);
    }
    var copyBtn = document.getElementById("long-copy");
    if (copyBtn) copyBtn.addEventListener("click", function () {
      var doneMsg = function () { msgEl.hidden = false; msgEl.textContent = "Longform sheet copied as markdown."; };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(exportText()).then(doneMsg, doneMsg);
      else doneMsg();
    });
    var dlBtn = document.getElementById("long-download");
    if (dlBtn) dlBtn.addEventListener("click", function () {
      var blob = new Blob([exportText()], { type: "text/markdown" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "longform-sheet.md";
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    });

    render();
  });
})();
