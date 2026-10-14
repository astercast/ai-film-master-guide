/* Continuity Ledger, the character-consistency chapter
   (craft/character-consistency.md) as a working ledger.
   The chapter's own words set the rules: "This is where most
   festival entries die." The ledger invents nothing: it takes a
   production's own locks (subject, kind, the locked wording or
   reference, and the lock's observed state, locked, drifted, or
   broken) and computes the chaining verdict exactly as the
   chapter's rejection rules state it: a clip fails if the face
   drifts, the wardrobe changes, the light flips, or the camera
   moves without motivation, and failed clips don't chain, they
   get re-prompted. Deterministic: the same ledger always produces
   the same verdict and the same export. */
(function () {
  "use strict";

  /* The chapter's pre-generation checklist, verbatim in substance. */
  var LOCKS = [
    { id: "identity", name: "Identity system chosen and trained",
      what: "The identity stack, ranked by reliability: trained identity (Soul ID) first, then the character sheet as reference, then a per-generation reference upload. Text description alone is the weakest, never rely on prose to hold a face across 50 shots." },
    { id: "wardrobe", name: "Wardrobe description locked, verbatim",
      what: "Write the wardrobe once, in exact language, and paste it verbatim into every prompt. A mid-film wardrobe change is a new locked description, never improvised per shot. Props get the same treatment: one description, reused exactly." },
    { id: "locations", name: "Location master stills approved",
      what: "Generate and approve a master still of each location first. Every shot in that location starts from it or references it." },
    { id: "light", name: "Light direction + time of day locked per scene",
      what: "Lock time of day and light direction per scene, \u201cgolden-hour side light from frame left\u201d in every prompt of the scene. Pick the era and colour palette up front; don't grade shot-by-shot and hope." },
    { id: "startframe", name: "Start frame is real, never invented",
      what: "Every clip starts from the last frame of the previous approved clip, or from the approved-frame library. Never fabricate a start frame. One human per start frame on character-led work, crowded frames multiply failure modes." },
  ];

  var KINDS = ["identity", "wardrobe", "prop", "location", "lighting", "era / grade"];

  var STATUSES = [
    { id: "locked", label: "Locked, holds" },
    { id: "drifted", label: "Drifted, off the lock" },
    { id: "broken", label: "Broken, fails the rejection rules" },
  ];
  var STATUS_IDS = STATUSES.map(function (s) { return s.id; });

  /* The worked example pre-loaded on the ledger: a small AI short
     whose locks mostly hold, one wardrobe lock has drifted, and
     nothing is broken yet, so the first verdict is the honest
     hold, and re-locking the drifted item clears it. Every label
     is invented for the example; no real production is described. */
  var DEFAULT_ENTRIES = [
    { subject: "Mara Venn, face", kind: "identity", lock: "Character sheet v3 (front / 3-4 / side) + Soul ID trained on 42 photos", status: "locked" },
    { subject: "Mara Venn, wardrobe, scenes 1 to 6", kind: "wardrobe", lock: "\u201cworn brown leather jacket, white t-shirt, dark jeans, scuffed boots\u201d, pasted verbatim", status: "drifted" },
    { subject: "Ledger prop (hero)", kind: "prop", lock: "One description, reused exactly: \u201cbrass-bound ledger, cracked spine, red ribbon marker\u201d", status: "locked" },
    { subject: "Night-bus interior", kind: "location", lock: "Master still NB-MASTER-02 approved; every interior shot references it", status: "locked" },
    { subject: "Bus scenes, light", kind: "lighting", lock: "Night; sodium practicals from frame right; no daylight plates", status: "locked" },
    { subject: "Era / grade, whole film", kind: "era / grade", lock: "Early-90s palette locked up front; grade applied to the cut, not per shot", status: "locked" },
  ];

  function evaluate(entries) {
    var list = Array.isArray(entries) ? entries : [];
    var locked = list.filter(function (e) { return e && e.status === "locked"; });
    var drifted = list.filter(function (e) { return e && e.status === "drifted"; });
    var broken = list.filter(function (e) { return e && e.status === "broken"; });
    var clean = list.length > 0 && drifted.length === 0 && broken.length === 0;
    return {
      total: list.length,
      locked: locked.length,
      drifted: drifted.length,
      broken: broken.length,
      driftedEntries: drifted,
      brokenEntries: broken,
      clean: clean,
      verdict: list.length === 0
        ? "No ledger yet, nothing is locked, so nothing can hold. Log the production's locks first."
        : broken.length > 0
          ? "Chain stopped, " + broken.length + " broken lock" + (broken.length === 1 ? "" : "s") +
            ". Under the chapter's rejection rules a clip fails if the face drifts, the wardrobe changes, or the light flips; failed clips don't chain, they get re-prompted from the last approved frame."
          : drifted.length > 0
            ? "Hold, " + drifted.length + " lock" + (drifted.length === 1 ? " has" : "s have") +
              " drifted off the locked wording or reference. Re-lock before the next generation: drift compounds shot over shot, and the next clip chains from this one."
            : "Continuity clean, every logged lock holds. Chain from the approved frames and keep logging: a lock that is not in the ledger is not locked.",
    };
  }

  function checklistState(doneIds) {
    var done = LOCKS.filter(function (s) { return (doneIds || []).indexOf(s.id) >= 0; });
    return {
      done: done.length, total: LOCKS.length,
      missing: LOCKS.filter(function (s) { return (doneIds || []).indexOf(s.id) < 0; }),
      complete: done.length === LOCKS.length,
    };
  }

  function statusLabel(id) {
    for (var i = 0; i < STATUSES.length; i++) if (STATUSES[i].id === id) return STATUSES[i].label;
    return "No state recorded ";
  }

  function ledgerToMarkdown(title, entries, doneIds) {
    var r = evaluate(entries);
    var cs = checklistState(doneIds);
    var lines = [];
    lines.push("# Continuity ledger, " + (title || "Untitled production"));
    lines.push("");
    lines.push("Character consistency: the identity stack, the locks, and the chaining discipline (see craft/character-consistency.md).");
    lines.push("");
    lines.push("## The pre-generation checklist");
    LOCKS.forEach(function (s) {
      var mark = (doneIds || []).indexOf(s.id) >= 0 ? "x" : " ";
      lines.push("- [" + mark + "] " + s.name);
    });
    lines.push("");
    lines.push("Checklist complete: " + cs.done + " of " + cs.total + ".");
    lines.push("");
    lines.push("## Locks (" + r.total + ")");
    if (!entries.length) lines.push("- (none logged)");
    entries.forEach(function (e) {
      lines.push("- " + e.subject + " [" + e.kind + "], " + statusLabel(e.status) + ". Lock: " + e.lock);
    });
    lines.push("");
    lines.push("## Chaining verdict");
    lines.push(r.verdict);
    lines.push("");
    lines.push("Locked: " + r.locked + " · drifted: " + r.drifted + " · broken: " + r.broken + ".");
    return lines.join("\n") + "\n";
  }

  var api = { LOCKS: LOCKS, KINDS: KINDS, STATUSES: STATUSES, DEFAULT_ENTRIES: DEFAULT_ENTRIES,
    evaluate: evaluate, checklistState: checklistState, statusLabel: statusLabel,
    ledgerToMarkdown: ledgerToMarkdown };

  if (typeof module !== "undefined" && module.exports) { module.exports = api; }
  if (typeof window !== "undefined") { window.ContinuityEngine = api; }

  /* ---- browser wiring (skipped under node) ---- */
  if (typeof document === "undefined") return;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var stageEl = document.getElementById("ct-stage");
    if (!stageEl) return;
    var entries = JSON.parse(JSON.stringify(DEFAULT_ENTRIES));
    var done = [];
    var verdictEl = document.getElementById("ct-verdict");
    var locksEl = document.getElementById("ct-locks-state");
    var msgEl = document.getElementById("ct-msg");

    function render() {
      var r = evaluate(entries);
      var html = "";
      entries.forEach(function (e, idx) {
        html += '<article class="ct-entry"><div class="ct-entry-head"><h4>' + esc(e.subject) + "</h4>" +
          '<span class="ct-tag">' + esc(e.kind) + "</span></div>" +
          '<p class="ct-lock">Lock: ' + esc(e.lock) + "</p>" +
          '<p class="ct-state">State: <strong>' + esc(statusLabel(e.status)) + "</strong></p>" +
          '<p class="ct-states" role="group" aria-label="Set the state for ' + esc(e.subject) + '">' +
          STATUSES.map(function (s) {
            return '<button type="button" class="btn btn-sm' + (e.status === s.id ? "" : " btn-ghost") +
              '" data-ct-set="' + idx + ":" + s.id + '">' + esc(s.label) + "</button>";
          }).join(" ") + "</p>" +
          '<p><button type="button" class="btn btn-sm btn-ghost" data-ct-del="' + idx + '">Remove lock</button></p></article>';
      });
      stageEl.innerHTML = html || '<p class="ct-lock">No locks logged yet.</p>';
      verdictEl.textContent = r.verdict;
      verdictEl.className = "ct-verdict " + (r.clean ? "ct-clean" : "ct-held");
      var cs = checklistState(done);
      locksEl.textContent = "Checklist complete: " + cs.done + " of " + cs.total +
        (cs.complete ? ", every pre-generation lock is in place." : ", the checklist is the gate before any generation; finish it first.");
    }

    stageEl.addEventListener("click", function (ev) {
      var b = ev.target.closest("button");
      if (!b) return;
      if (b.dataset.ctSet) {
        var parts = b.dataset.ctSet.split(":");
        entries[Number(parts[0])].status = parts[1];
      } else if (b.dataset.ctDel !== undefined && b.dataset.ctDel !== "") {
        entries.splice(Number(b.dataset.ctDel), 1);
      } else { return; }
      render();
    });

    document.querySelectorAll("[data-ct-lock]").forEach(function (cb) {
      cb.addEventListener("change", function () {
        done = Array.prototype.slice.call(document.querySelectorAll("[data-ct-lock]:checked"))
          .map(function (x) { return x.getAttribute("data-ct-lock"); });
        render();
      });
    });

    var addBtn = document.getElementById("ct-add");
    if (addBtn) addBtn.addEventListener("click", function () {
      var subject = (document.getElementById("ct-new-subject").value || "").trim();
      var lock = (document.getElementById("ct-new-lock").value || "").trim();
      if (!subject || !lock) { msgEl.hidden = false; msgEl.textContent = "Name the subject and write the lock, the ledger only holds what is written down, verbatim."; return; }
      entries.push({ subject: subject, kind: document.getElementById("ct-new-kind").value,
        lock: lock, status: document.getElementById("ct-new-status").value });
      document.getElementById("ct-new-subject").value = "";
      document.getElementById("ct-new-lock").value = "";
      msgEl.hidden = true;
      render();
    });

    function exportText() {
      return ledgerToMarkdown((document.getElementById("ct-title").value || "").trim(), entries, done);
    }
    var copyBtn = document.getElementById("ct-copy");
    if (copyBtn) copyBtn.addEventListener("click", function () {
      var doneMsg = function () { msgEl.hidden = false; msgEl.textContent = "Continuity ledger copied as markdown."; };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(exportText()).then(doneMsg, doneMsg);
      else doneMsg();
    });
    var dlBtn = document.getElementById("ct-download");
    if (dlBtn) dlBtn.addEventListener("click", function () {
      var blob = new Blob([exportText()], { type: "text/markdown" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "continuity-ledger.md";
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    });

    render();
  });
})();
