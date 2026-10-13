/* The Take Sheet — the directing-performance chapter
   (craft/directing-performance.md) as a working take sheet.
   The chapter's claim sets the stakes: AI models don't act —
   they render plausible pixels that read as acting when the
   direction is specific enough, and collapse into mannequin
   theater when it isn't. The sheet invents nothing: it takes
   a production's own performance beats — each beat's
   direction (a playable tactic or an emotion label), its
   eyeline target, its dead-eyes check, its framing and
   whether that framing sits on an emotional peak, its failed
   rehearsals, and its route (in rehearsal, Scene-Locked, to
   be simplified, or hybrid) — and computes the performance-
   lock verdict from the chapter's own rules, three of them
   mechanical: a beat directed by emotion label reads
   undirected; a beat still re-rolling after three failed
   rehearsals reads overdue — simplify the shot, not the
   actor; and a close-up spent away from an emotional peak
   reads misspent. Deterministic: the same sheet always
   produces the same verdict and export. */
(function () {
  "use strict";

  /* The chapter's pre-lock gates, verbatim in substance. */
  var GATES = [
    { id: "tactics", name: "Every beat rewritten as a playable tactic",
      what: "Direct, don't describe: replace every emotion label with a task a body can do — scene event, motive, goal, obstacle, tactic. Models can't render 'devastated'; they can render a jaw set and eyes fixed on a door." },
    { id: "eyelines", name: "Eyelines named per beat — every pair of eyes has a job",
      what: "Dead, glassy eyes are never fixed with lighting — they're fixed by giving the eyes a job. Name the eyeline target per beat; eyes move between targets (avert, hold, search, track) and never stare into the middle distance." },
    { id: "directorsread", name: "Director's read written: shared event + a channel per character",
      what: "Everyone in the scene lives through the same event, but each character carries it in a different physical channel — grief in her hands, in his jaw, in the kid's feet. Write the event once, then assign each character their channel." },
    { id: "identity", name: "Identity locked — the face anchor is never re-run",
      what: "Consistent identity reads as good acting; a face that drifts 5% reads as a bad performance. Lock the face anchor, never re-run the base portrait, and make state changes (dirt, wounds, tears) masked integrations, not re-generations." },
    { id: "restraint", name: "Restraint pass done: negative constraints, subtext, under-directed faces",
      what: "Models default to theatrical. Strip it: negative constraints (no eyebrow raises, no wide-eyed gasps), subtext instead of stated emotion, environment carrying mood — and deliberately under-direct the face where the model finds expression better itself." },
  ];

  var MODES = [
    { id: "tactic", label: "Playable tactic — a task a body can do" },
    { id: "label", label: "Emotion label — an adjective, not a task" },
  ];
  var MODE_IDS = MODES.map(function (s) { return s.id; });

  var FRAMINGS = [
    { id: "wide", label: "Wide" },
    { id: "medium", label: "Medium" },
    { id: "closeup", label: "Close-up" },
  ];
  var FRAMING_IDS = FRAMINGS.map(function (s) { return s.id; });

  var STATUSES = [
    { id: "rehearsing", label: "In rehearsal — drafts as takes" },
    { id: "locked", label: "Scene-Locked — photograph it, don't regenerate it" },
    { id: "simplify", label: "Simplify the shot" },
    { id: "hybrid", label: "Hybrid — a real performer at the core" },
  ];
  var STATUS_IDS = STATUSES.map(function (s) { return s.id; });

  /* The worked example pre-loaded on the sheet: the same
     small AI short the Ledger, the Cue Sheet, the Grade
     Sheet, and the Cut Sheet track ("The Night Bus"),
     performed instead of seen, heard, graded, or cut. Five
     beats are Scene-Locked clean; the depot-office reaction
     is still in rehearsal — a playable tactic on its second
     draft — so the first verdict is the honest hold. Every
     label is invented for the example; no real production
     is described. */
  var DEFAULT_ENTRIES = [
    { shot: "Sc 1 · Sh 01 — Depot wide, Mara waits", mode: "tactic", eyeline: true, deadeyes: true,
      framing: "wide", peak: false, attempts: 0, status: "locked",
      detail: "Tactic: she is keeping herself ready to leave — coat on, bag zipped, eyes tracking the arrivals board, then the door. Grief lives in her hands: the ticket folded and re-folded." },
    { shot: "Sc 2 · Sh 04 — Window close-up, the hardest line", mode: "tactic", eyeline: true, deadeyes: true,
      framing: "closeup", peak: true, attempts: 0, status: "locked",
      detail: "The film's one close-up, spent on its peak. Tactic: she is trying not to cry in front of him — jaw set, eyes on the window catch until the line lands. The voice carries; the face supports." },
    { shot: "Sc 3 · Sh 02 — The rain stop, shelter two-shot", mode: "tactic", eyeline: true, deadeyes: true,
      framing: "medium", peak: false, attempts: 0, status: "locked",
      detail: "Director's read: the same late bus, two channels — Mara's stillness against the driver's restless weight-shifting. Eyelines cross only once, on the headlights." },
    { shot: "Sc 4 · Sh 02 — Depot office, the driver hears the radio", mode: "tactic", eyeline: true, deadeyes: true,
      framing: "medium", peak: false, attempts: 1, status: "rehearsing",
      detail: "The listener's reaction shot — AI renders listening better than complex feeling, and this one is not there yet: the first 720p rehearsal read blank, the second (eyeline moved to the radio speaker, thumb rubbing the ring) reads rehearsing, not locked. One failed rehearsal; re-direct with a changed variable, never the same prompt hoping." },
    { shot: "Sc 4 · Sh 03 — Office pan, radio voices", mode: "tactic", eyeline: true, deadeyes: true,
      framing: "medium", peak: false, attempts: 0, status: "locked",
      detail: "No face carries this beat — the radio does. Faces under-directed on purpose; the restraint pass stripped two eyebrow raises the model offered on its own." },
    { shot: "Sc 5 · Sh 01 — Departure pull-away", mode: "tactic", eyeline: true, deadeyes: true,
      framing: "wide", peak: false, attempts: 0, status: "locked",
      detail: "The button is a wide: she keeps finding reasons to stand closer to the kerb; he keeps noticing and not moving away. Dead-eyes check passed at distance — no stare, eyeline on the bus until it fills the frame." },
  ];

  /* The chapter's hardest directing rules, applied
     mechanically, in the order a lock is actually blocked:
     an emotion label is not direction; three failed
     rehearsals mean the shot — not the actor — changes; a
     close-up off its peak spends the scarcest currency in
     AI performance. A hybrid beat is a decision, not a
     defect — it blocks nothing. */
  function effectiveStatus(e) {
    if (!e) return "unchecked";
    var st = STATUS_IDS.indexOf(e.status) >= 0 ? e.status : "rehearsing";
    if (st === "hybrid") return "hybrid";
    if (MODE_IDS.indexOf(e.mode) < 0 || e.mode === "label") return "undirected";
    if (st === "rehearsing" && (Number(e.attempts) || 0) >= 3) return "overdue";
    if (e.framing === "closeup" && !e.peak) return "misspent";
    if (st === "simplify") return "simplifying";
    if (st === "rehearsing") return "rehearsing";
    if (!e.eyeline || !e.deadeyes) return "unchecked";
    return "clean";
  }

  var EFFECTIVE_LABELS = {
    clean: "Clean — Scene-Locked",
    rehearsing: "In rehearsal — drafts as takes",
    simplifying: "Simplifying — the shot changes, not the actor",
    unchecked: "Unchecked — eyeline or dead-eyes check unfinished",
    undirected: "Undirected — an emotion label is not a task",
    overdue: "Overdue — three failed rehearsals",
    misspent: "Misspent close-up — no peak under it",
    hybrid: "Hybrid — a real performer at the core",
  };

  function evaluate(entries) {
    var list = Array.isArray(entries) ? entries : [];
    var eff = list.map(function (e) { return effectiveStatus(e); });
    var count = function (s) { return eff.filter(function (x) { return x === s; }).length; };
    var clean = count("clean");
    var hybrid = count("hybrid");
    var held = count("rehearsing") + count("simplifying") + count("unchecked");
    var stopped = count("undirected") + count("overdue") + count("misspent");
    var ready = list.length > 0 && held === 0 && stopped === 0;
    var verdict;
    if (list.length === 0) {
      verdict = "No take sheet yet — undirected generations are mannequin theater until the beats are directed. Log every performance beat: its tactic, its eyeline, its framing, and its route.";
    } else if (count("undirected") > 0) {
      var m = count("undirected");
      verdict = "Performance lock stopped — " + m + " beat" + (m === 1 ? " is" : "s are") +
        " directed by emotion label: models can't render 'devastated' — they can render a jaw set and eyes on a door. Rewrite each label as a playable tactic: scene event, motive, goal, obstacle, tactic.";
    } else if (count("overdue") > 0) {
      var k = count("overdue");
      verdict = "Performance lock stopped — " + k + " beat" + (k === 1 ? " has" : "s have") +
        " burned three rehearsals: the three-rehearsal rule means simplify the shot, not the actor. Change a variable — a new tactic, a new eyeline — or simplify the shot; never re-roll the same prompt hoping.";
    } else if (count("misspent") > 0) {
      var u = count("misspent");
      verdict = "Performance lock stopped — " + u + " close-up" + (u === 1 ? " is" : "s are") +
        " spent away from an emotional peak: micro-acting is the weakest link in every current model, and a pushed-in over-directed close-up exposes every flaw. Ration close-ups to the peaks, or widen the framing.";
    } else if (held > 0) {
      verdict = "Hold performance lock — " + held + " beat" + (held === 1 ? " is" : "s are") +
        " not ready: a take still in rehearsal, a simplification still owed, or the eyeline / dead-eyes check unfinished. Review drafts as rehearsals — does the tactic read, do the eyes have a job, does the turn land in the cut?";
    } else {
      verdict = "Performance lock clean — every beat is a playable tactic, every pair of eyes has a job, every close-up sits on its peak, and every approved take is Scene-Locked. Still owed: photograph the locked performance from new angles, don't regenerate it — the model must stop reinterpreting gestures, pauses, and props after approval — and keep synthetic performers inside edited, controlled contexts.";
    }
    return {
      total: list.length, clean: clean, held: held, stopped: stopped, hybrid: hybrid,
      ready: ready,
      cleanEntries: list.filter(function (e, i) { return eff[i] === "clean"; }),
      heldEntries: list.filter(function (e, i) { return ["rehearsing", "simplifying", "unchecked"].indexOf(eff[i]) >= 0; }),
      stoppedEntries: list.filter(function (e, i) { return ["undirected", "overdue", "misspent"].indexOf(eff[i]) >= 0; }),
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

  function modeLabel(id) {
    for (var i = 0; i < MODES.length; i++) if (MODES[i].id === id) return MODES[i].label;
    return "— no direction recorded —";
  }

  function framingLabel(id) {
    for (var i = 0; i < FRAMINGS.length; i++) if (FRAMINGS[i].id === id) return FRAMINGS[i].label;
    return "— no framing recorded —";
  }

  function effectiveLabel(e) {
    return EFFECTIVE_LABELS[effectiveStatus(e)] || "—";
  }

  function sheetToMarkdown(title, entries, doneIds) {
    var r = evaluate(entries);
    var gs = gateState(doneIds);
    var lines = [];
    lines.push("# Take sheet — " + (title || "Untitled production"));
    lines.push("");
    lines.push("Directing performance in AI video: playable tactics, eyelines, the director's read, rehearsal as a department, and Scene Lock (see craft/directing-performance.md).");
    lines.push("");
    lines.push("## The pre-lock gates");
    GATES.forEach(function (s) {
      var mark = (doneIds || []).indexOf(s.id) >= 0 ? "x" : " ";
      lines.push("- [" + mark + "] " + s.name);
    });
    lines.push("");
    lines.push("Gates complete: " + gs.done + " of " + gs.total + ".");
    lines.push("");
    lines.push("## Performance beats (" + r.total + ")");
    if (!entries.length) lines.push("- (none logged)");
    entries.forEach(function (e) {
      lines.push("- " + e.shot + " — " + effectiveLabel(e) + ". Direction: " + modeLabel(e.mode) +
        ". Eyeline: " + (e.eyeline ? "named" : "not named") +
        ". Dead-eyes check: " + (e.deadeyes ? "done" : "not done") +
        ". Framing: " + framingLabel(e.framing) +
        ". Emotional peak: " + (e.peak ? "yes" : "no") +
        ". Failed rehearsals: " + (Number(e.attempts) || 0) +
        ". Route: " + statusLabel(e.status) + ". " + (e.detail || ""));
    });
    lines.push("");
    lines.push("## Performance-lock verdict");
    lines.push(r.verdict);
    lines.push("");
    lines.push("Clean: " + r.clean + " · held: " + r.held + " · stopped: " + r.stopped + " · hybrid: " + r.hybrid + ".");
    return lines.join("\n") + "\n";
  }

  var api = { GATES: GATES, MODES: MODES, FRAMINGS: FRAMINGS, STATUSES: STATUSES,
    DEFAULT_ENTRIES: DEFAULT_ENTRIES, effectiveStatus: effectiveStatus,
    evaluate: evaluate, gateState: gateState, statusLabel: statusLabel,
    modeLabel: modeLabel, framingLabel: framingLabel,
    effectiveLabel: effectiveLabel, sheetToMarkdown: sheetToMarkdown };

  if (typeof module !== "undefined" && module.exports) { module.exports = api; }
  if (typeof window !== "undefined") { window.TakeEngine = api; }

  /* ---- browser wiring (skipped under node) ---- */
  if (typeof document === "undefined") return;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var stageEl = document.getElementById("take-stage");
    if (!stageEl) return;
    var entries = JSON.parse(JSON.stringify(DEFAULT_ENTRIES));
    var done = [];
    var verdictEl = document.getElementById("take-verdict");
    var gatesEl = document.getElementById("take-gates-state");
    var msgEl = document.getElementById("take-msg");

    function render() {
      var r = evaluate(entries);
      var html = "";
      entries.forEach(function (e, idx) {
        var eff = effectiveStatus(e);
        var raw = STATUS_IDS.indexOf(e.status) >= 0 ? e.status : "rehearsing";
        html += '<article class="take-entry"><div class="take-entry-head"><h4>' + esc(e.shot) + "</h4>" +
          '<span class="take-tag">' + esc(framingLabel(e.framing)) + "</span></div>" +
          '<p class="take-detail">' + esc(e.detail || "") + "</p>" +
          '<p class="take-checks" role="group" aria-label="Performance checks for ' + esc(e.shot) + '">' +
          '<button type="button" class="btn btn-sm' + (e.eyeline ? "" : " btn-ghost") +
          '" data-take-eye="' + idx + '" aria-pressed="' + !!e.eyeline + '">Eyeline named ' +
          (e.eyeline ? "✓" : "—") + "</button> " +
          '<button type="button" class="btn btn-sm' + (e.deadeyes ? "" : " btn-ghost") +
          '" data-take-dead="' + idx + '" aria-pressed="' + !!e.deadeyes + '">Dead-eyes check ' +
          (e.deadeyes ? "✓" : "—") + "</button> " +
          '<button type="button" class="btn btn-sm' + (e.peak ? "" : " btn-ghost") +
          '" data-take-peak="' + idx + '" aria-pressed="' + !!e.peak + '">Emotional peak ' +
          (e.peak ? "✓" : "—") + "</button></p>" +
          '<p class="take-state">State: <strong>' + esc(effectiveLabel(e)) + "</strong>" +
          (eff !== "clean" && eff !== raw && !(eff === "rehearsing" && raw === "rehearsing") && !(eff === "hybrid" && raw === "hybrid")
            ? ' <span class="take-note">(by the chapter\u2019s rules — see the verdict)</span>' : "") + "</p>" +
          '<p class="take-mode">Direction: ' +
          MODES.map(function (s) {
            return '<button type="button" class="btn btn-sm' + (e.mode === s.id ? "" : " btn-ghost") +
              '" data-take-mode="' + idx + ":" + s.id + '">' + esc(s.label.split(" — ")[0]) + "</button>";
          }).join(" ") + "</p>" +
          '<p class="take-framing">Framing: ' +
          FRAMINGS.map(function (s) {
            return '<button type="button" class="btn btn-sm' + (e.framing === s.id ? "" : " btn-ghost") +
              '" data-take-frame="' + idx + ":" + s.id + '">' + esc(s.label) + "</button>";
          }).join(" ") + "</p>" +
          '<p class="take-route">Route: ' +
          STATUSES.map(function (s) {
            return '<button type="button" class="btn btn-sm' + (raw === s.id ? "" : " btn-ghost") +
              '" data-take-set="' + idx + ":" + s.id + '">' + esc(s.label.split(" — ")[0]) + "</button>";
          }).join(" ") + "</p>" +
          '<p class="take-attempts">Failed rehearsals: <strong>' + (Number(e.attempts) || 0) + "</strong> " +
          '<button type="button" class="btn btn-sm btn-ghost" data-take-att="' + idx + ':-1">−</button> ' +
          '<button type="button" class="btn btn-sm btn-ghost" data-take-att="' + idx + ':1">+</button>' +
          ' <span class="take-note">three failed rehearsals simplify the shot — not the actor</span></p>' +
          '<p><button type="button" class="btn btn-sm btn-ghost" data-take-del="' + idx + '">Remove beat</button></p></article>';
      });
      stageEl.innerHTML = html || '<p class="take-detail">No performance beats logged yet.</p>';
      verdictEl.textContent = r.verdict;
      verdictEl.className = "take-verdict " + (r.ready ? "take-clean" : "take-held");
      var gs = gateState(done);
      gatesEl.textContent = "Gates complete: " + gs.done + " of " + gs.total +
        (gs.complete ? " — every pre-lock gate is in place." : " — the gates are the discipline before any beat is judged; finish them first.");
    }

    stageEl.addEventListener("click", function (ev) {
      var b = ev.target.closest("button");
      if (!b) return;
      if (b.dataset.takeSet) {
        var parts = b.dataset.takeSet.split(":");
        entries[Number(parts[0])].status = parts[1];
      } else if (b.dataset.takeMode) {
        var mp = b.dataset.takeMode.split(":");
        entries[Number(mp[0])].mode = mp[1];
      } else if (b.dataset.takeFrame) {
        var fp = b.dataset.takeFrame.split(":");
        entries[Number(fp[0])].framing = fp[1];
      } else if (b.dataset.takeEye !== undefined && b.dataset.takeEye !== "") {
        var eent = entries[Number(b.dataset.takeEye)];
        eent.eyeline = !eent.eyeline;
      } else if (b.dataset.takeDead !== undefined && b.dataset.takeDead !== "") {
        var dent = entries[Number(b.dataset.takeDead)];
        dent.deadeyes = !dent.deadeyes;
      } else if (b.dataset.takePeak !== undefined && b.dataset.takePeak !== "") {
        var pent = entries[Number(b.dataset.takePeak)];
        pent.peak = !pent.peak;
      } else if (b.dataset.takeAtt) {
        var ap = b.dataset.takeAtt.split(":");
        var aent = entries[Number(ap[0])];
        aent.attempts = Math.max(0, Math.min(9, (Number(aent.attempts) || 0) + Number(ap[1])));
      } else if (b.dataset.takeDel !== undefined && b.dataset.takeDel !== "") {
        entries.splice(Number(b.dataset.takeDel), 1);
      } else { return; }
      render();
    });

    document.querySelectorAll("[data-take-gate]").forEach(function (cb) {
      cb.addEventListener("change", function () {
        done = Array.prototype.slice.call(document.querySelectorAll("[data-take-gate]:checked"))
          .map(function (x) { return x.getAttribute("data-take-gate"); });
        render();
      });
    });

    var addBtn = document.getElementById("take-add");
    if (addBtn) addBtn.addEventListener("click", function () {
      var shot = (document.getElementById("take-new-shot").value || "").trim();
      var detail = (document.getElementById("take-new-detail").value || "").trim();
      if (!shot) { msgEl.hidden = false; msgEl.textContent = "Name the beat — scene, shot, who performs it. The sheet only holds what is written down, beat by beat."; return; }
      entries.push({ shot: shot,
        mode: document.getElementById("take-new-mode").value,
        eyeline: document.getElementById("take-new-eyeline").checked,
        deadeyes: document.getElementById("take-new-deadeyes").checked,
        framing: document.getElementById("take-new-framing").value,
        peak: document.getElementById("take-new-peak").checked,
        attempts: Number(document.getElementById("take-new-attempts").value) || 0,
        status: document.getElementById("take-new-status").value,
        detail: detail });
      document.getElementById("take-new-shot").value = "";
      document.getElementById("take-new-detail").value = "";
      msgEl.hidden = true;
      render();
    });

    function exportText() {
      return sheetToMarkdown((document.getElementById("take-title").value || "").trim(), entries, done);
    }
    var copyBtn = document.getElementById("take-copy");
    if (copyBtn) copyBtn.addEventListener("click", function () {
      var doneMsg = function () { msgEl.hidden = false; msgEl.textContent = "Take sheet copied as markdown."; };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(exportText()).then(doneMsg, doneMsg);
      else doneMsg();
    });
    var dlBtn = document.getElementById("take-download");
    if (dlBtn) dlBtn.addEventListener("click", function () {
      var blob = new Blob([exportText()], { type: "text/markdown" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "take-sheet.md";
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    });

    render();
  });
})();
