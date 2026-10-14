/* Script Clearance desk, the clearance layer from research cycle 81
   (Identity r78, Film script-clearance rules 1358 to 1367), built as a
   working file an AI-film production can actually run.
   The ten steps are the ten rules, verbatim in substance: what each
   document is and when it is required comes from legal/script-clearance.md
   and the six sources it cites. The engine invents nothing: it takes a
   production's own clearance items (label, kind, flagged or not, and the
   recorded decision for anything flagged) and computes the gate exactly
   as rule 1366 states it, an undecided flagged item blocks the element
   it flags, and rule 1367 completes it: no completed clearance, no
   cover and no distribution. Deterministic: the same file always
   produces the same verdict and the same export. */
(function () {
  "use strict";

  var STEPS = [
    { n: 1358, id: "report", name: "The clearance report", stage: "Before the shoot",
      what: "The final shooting script, researched by a professional clearance researcher: every character name, place, address and business checked against its real-world commonality, and the permission contact named for every referenced product, copyright and trademark.",
      when: "Filed before production, on the final shooting script." },
    { n: 1359, id: "annotation", name: "The annotation guide", stage: "Before the shoot",
      what: "The writer labels every character, place and event fictional, real or composite; the work's origins and any similar submission's independent path are documented, and true-life sources are recorded as primary or secondary.",
      when: "At the start, it is the clearance review's input, not its output." },
    { n: 1360, id: "names", name: "Researched names, permitted numbers", stage: "Before the shoot",
      what: "A fictional name, business or address that coincides with a real, identifiable person or entity is changed or released before use, coincidence is a defect, not a defence, and only permitted telephone and plate numbers ever appear.",
      when: "With the report, before any flagged element is shot or rendered." },
    { n: 1361, id: "chain", name: "Chain of title + copyright report", stage: "Before the shoot",
      what: "Ownership proven as an unbroken filed record, origin plus every transfer, work-for-hire or option tested, contributors without releases found, encumbrances quitclaimed, verified by a copyright report covering domestic, foreign and renewal rights.",
      when: "From acquisition onward, and re-run by the distributor at delivery." },
    { n: 1362, id: "title", name: "The title report", stage: "Before the shoot",
      what: "The title is researched before final selection; the report lists prior same and similar uses, a conflict changes the title, and the report is filed for the distributors and insurers who require it.",
      when: "Before the title is final, and again when the title is chosen at the end of the process." },
    { n: 1363, id: "releases", name: "Release coverage", stage: "During production",
      what: "Written releases cover every recognizably depicted person, thinly disguised and deceased included, the latter via representatives or heirs, every performer, recognizable extra and crew member, and every distinctive location.",
      when: "As each person, performance and location enters the production." },
    { n: 1364, id: "objects", name: "The featured-object caution", stage: "During production",
      what: "Props, products, artwork and photographs are cleared one by one under an abundance of caution, prominence in the final form is unknowable in advance, and supplied or previously used items are never assumed already cleared.",
      when: "Item by item, as dressing, props and artwork are placed." },
    { n: 1365, id: "living", name: "The living report", stage: "During production",
      what: "The clearance report is updated whenever new material enters, script versions, boards, schedules, the shoot, post-production, and clearance monitoring runs at all stages, not as a single pass at the start.",
      when: "Continuously, from inception through final cut." },
    { n: 1366, id: "decision", name: "The recorded decision", stage: "Closing the file",
      what: "Every flagged item is closed by a recorded decision, license it, substitute it, change the way it is used, or expressly assume the risk, and an undecided flagged item blocks the element it flags.",
      when: "Per flagged item, before the element it flags can ship." },
    { n: 1367, id: "gate", name: "The final check + the gate", stage: "Closing the file",
      what: "Before exhibition the finished work is reviewed against the clearance file for what the script never contained, trailers and publicity receive their own clearance analysis, and the completed file is the gate, no completed clearance, no cover and no distribution.",
      when: "Before exhibition, on the finished film, not the script." },
  ];

  var KINDS = ["character name", "place / address", "business / signage",
    "product / trademark reference", "depicted person", "performer / extra / crew",
    "distinctive location", "prop / artwork / photograph", "title"];

  var DECISIONS = [
    { id: "license", label: "License it" },
    { id: "substitute", label: "Substitute it" },
    { id: "change-use", label: "Change the use" },
    { id: "assume-risk", label: "Expressly assume the risk" },
  ];
  var DECISION_IDS = DECISIONS.map(function (d) { return d.id; });

  /* The worked example pre-loaded on the desk: a small AI short whose
     file mixes clear items, decided flags, and one open flag, so the
     gate verdict on first load is the honest one (held), and closing
     the open item the way rule 1366 requires opens it. Every label is
     invented for the example; no real production is described. */
  var DEFAULT_ITEMS = [
    { label: "Lead character name, “Mara Venn”", kind: "character name", flagged: false, decision: null },
    { label: "Café signage, “Café Lumen” matches a real café chain", kind: "business / signage", flagged: true, decision: "substitute" },
    { label: "Phone number on a flyer in shot 4", kind: "place / address", flagged: true, decision: "change-use" },
    { label: "Poster artwork on the bedroom wall (generated)", kind: "prop / artwork / photograph", flagged: true, decision: null },
    { label: "Street address spoken in dialogue, checked, no match", kind: "place / address", flagged: false, decision: null },
    { label: "Working title, title report filed, no conflict", kind: "title", flagged: false, decision: null },
    { label: "Neighbour recognisable in a background plate", kind: "depicted person", flagged: true, decision: "license" },
    { label: "Crew member visible in a behind-the-scenes still", kind: "performer / extra / crew", flagged: true, decision: "assume-risk" },
  ];

  function evaluate(items) {
    var list = Array.isArray(items) ? items : [];
    var flagged = list.filter(function (i) { return i && i.flagged; });
    var open = flagged.filter(function (i) { return DECISION_IDS.indexOf(i.decision) < 0; });
    var byDecision = {};
    DECISION_IDS.forEach(function (d) { byDecision[d] = 0; });
    flagged.forEach(function (i) { if (byDecision[i.decision] !== undefined) byDecision[i.decision] += 1; });
    var gateOpen = list.length > 0 && open.length === 0;
    return {
      total: list.length,
      clear: list.length - flagged.length,
      flagged: flagged.length,
      open: open.length,
      openItems: open,
      byDecision: byDecision,
      gateOpen: gateOpen,
      verdict: list.length === 0
        ? "No file yet, the gate cannot be assessed. Log the production's items first."
        : gateOpen
          ? "Gate open, every flagged item carries a recorded decision (rule 1366). The completed file can go forward to the final check (rule 1367)."
          : "Gate held, " + open.length + " flagged item" + (open.length === 1 ? "" : "s") +
            " without a recorded decision. Under rule 1366 an undecided flagged item blocks the element it flags; under rule 1367, no completed clearance, no cover and no distribution.",
    };
  }

  function checklistState(doneIds) {
    var done = STEPS.filter(function (s) { return (doneIds || []).indexOf(s.id) >= 0; });
    return {
      done: done.length, total: STEPS.length,
      missing: STEPS.filter(function (s) { return (doneIds || []).indexOf(s.id) < 0; }),
      complete: done.length === STEPS.length,
    };
  }

  function decisionLabel(id) {
    for (var i = 0; i < DECISIONS.length; i++) if (DECISIONS[i].id === id) return DECISIONS[i].label;
    return "No decision recorded ";
  }

  function fileToMarkdown(title, items, doneIds) {
    var r = evaluate(items);
    var cs = checklistState(doneIds);
    var lines = [];
    lines.push("# Clearance file, " + (title || "Untitled production"));
    lines.push("");
    lines.push("Script-clearance layer: research cycle 81, rules 1358 to 1367 (see legal/script-clearance.md).");
    lines.push("Not legal advice, the file a clearance researcher and an entertainment attorney work from, not a substitute for them.");
    lines.push("");
    lines.push("## The ten steps (rules 1358 to 1367)");
    STEPS.forEach(function (s) {
      var mark = (doneIds || []).indexOf(s.id) >= 0 ? "x" : " ";
      lines.push("- [" + mark + "] Rule " + s.n + ", " + s.name + " (" + s.stage + "). " + s.when);
    });
    lines.push("");
    lines.push("Steps complete: " + cs.done + " of " + cs.total + ".");
    lines.push("");
    lines.push("## Items (" + r.total + ")");
    if (!items.length) lines.push("- (none logged)");
    items.forEach(function (i) {
      lines.push("- " + i.label + " [" + i.kind + "], " +
        (i.flagged ? "FLAGGED, decision: " + decisionLabel(i.decision) : "clear on research"));
    });
    lines.push("");
    lines.push("## Gate verdict (rules 1366 to 1367)");
    lines.push(r.verdict);
    lines.push("");
    lines.push("Flagged: " + r.flagged + " · open: " + r.open + " · clear: " + r.clear + ".");
    return lines.join("\n") + "\n";
  }

  var api = { STEPS: STEPS, KINDS: KINDS, DECISIONS: DECISIONS, DEFAULT_ITEMS: DEFAULT_ITEMS,
    evaluate: evaluate, checklistState: checklistState, decisionLabel: decisionLabel,
    fileToMarkdown: fileToMarkdown };

  if (typeof module !== "undefined" && module.exports) { module.exports = api; }
  if (typeof window !== "undefined") { window.ClearanceEngine = api; }

  /* ---- browser wiring (skipped under node) ---- */
  if (typeof document === "undefined") return;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var stageEl = document.getElementById("cl-stage");
    if (!stageEl) return;
    var items = JSON.parse(JSON.stringify(DEFAULT_ITEMS));
    var done = [];
    var verdictEl = document.getElementById("cl-verdict");
    var stepsEl = document.getElementById("cl-steps-state");
    var msgEl = document.getElementById("cl-msg");

    function render() {
      var r = evaluate(items);
      var html = "";
      items.forEach(function (it, idx) {
        html += '<article class="cl-item"><div class="cl-item-head"><h4>' + esc(it.label) + "</h4>" +
          '<span class="cl-tag">' + esc(it.kind) + "</span></div>" +
          (it.flagged
            ? '<p class="cl-flag">Flagged on research. Recorded decision: <strong>' + esc(decisionLabel(it.decision)) + "</strong></p>" +
              '<p class="cl-decisions" role="group" aria-label="Record a decision for ' + esc(it.label) + '">' +
              DECISIONS.map(function (d) {
                return '<button type="button" class="btn btn-sm' + (it.decision === d.id ? "" : " btn-ghost") +
                  '" data-cl-dec="' + idx + ":" + d.id + '">' + esc(d.label) + "</button>";
              }).join(" ") + "</p>"
            : '<p class="cl-clear">Clear on research, no flag raised.</p>') +
          '<p><button type="button" class="btn btn-sm btn-ghost" data-cl-del="' + idx + '">Remove item</button></p></article>';
      });
      stageEl.innerHTML = html || '<p class="cl-clear">No items logged yet.</p>';
      verdictEl.textContent = r.verdict;
      verdictEl.className = "cl-verdict " + (r.gateOpen ? "cl-open" : "cl-held");
      var cs = checklistState(done);
      stepsEl.textContent = "Steps complete: " + cs.done + " of " + cs.total +
        (cs.complete ? ", the ten-step file is complete." : ", the file is not complete until every step is done.");
    }

    stageEl.addEventListener("click", function (ev) {
      var b = ev.target.closest("button");
      if (!b) return;
      if (b.dataset.clDec) {
        var parts = b.dataset.clDec.split(":");
        items[Number(parts[0])].decision = parts[1];
      } else if (b.dataset.clDel !== undefined && b.dataset.clDel !== "") {
        items.splice(Number(b.dataset.clDel), 1);
      } else { return; }
      render();
    });

    document.querySelectorAll("[data-cl-step]").forEach(function (cb) {
      cb.addEventListener("change", function () {
        done = Array.prototype.slice.call(document.querySelectorAll("[data-cl-step]:checked"))
          .map(function (x) { return x.getAttribute("data-cl-step"); });
        render();
      });
    });

    var addBtn = document.getElementById("cl-add");
    if (addBtn) addBtn.addEventListener("click", function () {
      var label = (document.getElementById("cl-new-label").value || "").trim();
      if (!label) { msgEl.hidden = false; msgEl.textContent = "Name the item first, the file only holds what is written down."; return; }
      items.push({ label: label, kind: document.getElementById("cl-new-kind").value,
        flagged: document.getElementById("cl-new-flagged").checked, decision: null });
      document.getElementById("cl-new-label").value = "";
      msgEl.hidden = true;
      render();
    });

    function exportText() {
      return fileToMarkdown((document.getElementById("cl-title").value || "").trim(), items, done);
    }
    var copyBtn = document.getElementById("cl-copy");
    if (copyBtn) copyBtn.addEventListener("click", function () {
      var doneMsg = function () { msgEl.hidden = false; msgEl.textContent = "Clearance file copied as markdown."; };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(exportText()).then(doneMsg, doneMsg);
      else doneMsg();
    });
    var dlBtn = document.getElementById("cl-download");
    if (dlBtn) dlBtn.addEventListener("click", function () {
      var blob = new Blob([exportText()], { type: "text/markdown" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "clearance-file.md";
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    });

    render();
  });
})();
