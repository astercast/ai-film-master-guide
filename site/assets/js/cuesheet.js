/* The Cue Sheet — the sound, music & audio chapter
   (craft/sound-music-audio.md) as a working cue sheet.
   The chapter's opening claim sets the stakes: "Sound is half
   the picture. Amateur AI films are silent or slapped together;
   finished ones are designed." The sheet invents nothing: it
   takes a production's own scenes — the three layers each one
   carries (bed, foley, accents), the dialogue route chosen for
   it, and the scene's state today — and computes the mix
   verdict from the chapter's own rules: the bed runs under
   everything and never drops to digital silence, so a scene
   with no bed is dry whatever its owner claims; build order is
   dialogue first, then the SFX bed, then music last; and no
   scene is finished until it survives the three-way listen and
   the silence test. Deterministic: the same sheet always
   produces the same verdict and the same export. */
(function () {
  "use strict";

  /* The chapter's pre-mix gates, verbatim in substance. */
  var GATES = [
    { id: "bible", name: "Voice Bible written for every speaking character",
      what: "Register, timbre, tempo, manner — written per character before generating, and referenced by every generation after. Test the voice on the character's hardest line first, not a demo sentence: a voice that collapses on the hardest scene was never cast." },
    { id: "routes", name: "Dialogue route chosen per scene — never mixed mid-scene",
      what: "Road A, native: the model generates picture plus synced dialogue in one pass — best for short lines and ambient realism. Road B, decoupled: silent clip, separately produced voice, a lip-sync pass that reshapes only the mouth. Rule of thumb: if the words must be exact, take Road B." },
    { id: "lockedcut", name: "Score briefed per cue, cut to the locked cut",
      what: "Brief by emotional function, not genre — genre, tempo, instrumentation, the cue's job, what to avoid — and generate 3–5 variants per cue to comp. Temp-track discipline: cut to a temp score first, then generate the final score to the locked cut. Never score a moving target." },
    { id: "stems", name: "Stems kept for the score and the voices",
      what: "Dialogue ducks badly under a full stereo mix; stems let the mix breathe. Keep the score's stems and every voice take separate until the mix is signed off — a bounced stereo pair is a decision you cannot unmake." },
    { id: "receipts", name: "Generation receipts saved for every AI voice and cue",
      what: "AI-generated music and voices sit in the murkiest rights territory in the guide. Keep the receipts — prompts, dates, tool, terms version — for every generated voice and cue, and read the rights chapter before distributing anything with AI music in it." },
  ];

  var LAYERS = [
    { id: "bed", label: "Bed" },
    { id: "foley", label: "Foley" },
    { id: "accents", label: "Accents" },
  ];

  var ROUTES = [
    { id: "decoupled", label: "Decoupled — voice built separately, lip-sync pass" },
    { id: "native", label: "Native — model generates picture + dialogue" },
    { id: "none", label: "No dialogue — sound design only" },
  ];
  var ROUTE_IDS = ROUTES.map(function (r) { return r.id; });

  var STATUSES = [
    { id: "designed", label: "Designed — built and checked" },
    { id: "thin", label: "Thin — a layer missing or rough" },
    { id: "dry", label: "Dry — drops to digital silence" },
  ];
  var STATUS_IDS = STATUSES.map(function (s) { return s.id; });

  /* The worked example pre-loaded on the sheet: the same small
     AI short the Continuity Ledger tracks ("The Night Bus"),
     heard instead of seen. Four scenes are designed; the rain
     stop has no foley laid yet, so the first verdict is the
     honest hold — and laying the foley clears it. Every label
     is invented for the example; no real production is
     described. */
  var DEFAULT_ENTRIES = [
    { scene: "Sc 1 — Depot at night, Mara waits", route: "decoupled",
      detail: "Bed: depot room tone, rain on the canopy. Foley: boots on wet concrete, bag set down. Accent: the departure-board flip on her line.",
      layers: { bed: true, foley: true, accents: true }, status: "designed" },
    { scene: "Sc 2 — On the bus, the hardest line", route: "decoupled",
      detail: "Voice per the Voice Bible (chest register, unhurried, flat warmth), comped from paragraph takes. Bed: engine idle under everything. Accent: ticket punch on the turn.",
      layers: { bed: true, foley: true, accents: true }, status: "designed" },
    { scene: "Sc 3 — The rain stop", route: "decoupled",
      detail: "Bed: rain on the shelter roof, road hiss. Accents: bus sigh and door chime laid. Foley not laid yet — her walk to the shelter is still silent under the bed.",
      layers: { bed: true, foley: false, accents: true }, status: "thin" },
    { scene: "Sc 4 — Depot office, radio voices", route: "native",
      detail: "Short native lines only — nothing word-exact in this scene. Bed: office tone, fluorescent hum. Foley: mug, keys, chair. Accent: radio squelch into the reveal.",
      layers: { bed: true, foley: true, accents: true }, status: "designed" },
    { scene: "Sc 5 — Departure, the button", route: "none",
      detail: "No dialogue — the scene plays on design alone. Bed: depot tone thinning as the bus pulls out. Foley: steps, door, pull-away. Accent: one brake sigh under the final frame; score enters only after.",
      layers: { bed: true, foley: true, accents: true }, status: "designed" },
  ];

  /* The chapter's hardest audio rule, applied mechanically:
     the bed runs under everything and never drops to digital
     silence — so a scene with no bed reads dry whatever state
     its owner recorded. */
  function effectiveStatus(e) {
    if (!e || !e.layers || !e.layers.bed) return "dry";
    return STATUS_IDS.indexOf(e.status) >= 0 ? e.status : "thin";
  }

  function layerCount(e) {
    if (!e || !e.layers) return 0;
    return LAYERS.filter(function (l) { return !!e.layers[l.id]; }).length;
  }

  function evaluate(entries) {
    var list = Array.isArray(entries) ? entries : [];
    var eff = list.map(function (e) { return effectiveStatus(e); });
    var designed = eff.filter(function (s) { return s === "designed"; });
    var thin = eff.filter(function (s) { return s === "thin"; });
    var dry = eff.filter(function (s) { return s === "dry"; });
    var clean = list.length > 0 && thin.length === 0 && dry.length === 0;
    return {
      total: list.length,
      designed: designed.length,
      thin: thin.length,
      dry: dry.length,
      thinEntries: list.filter(function (e, i) { return eff[i] === "thin"; }),
      dryEntries: list.filter(function (e, i) { return eff[i] === "dry"; }),
      clean: clean,
      verdict: list.length === 0
        ? "No cue sheet yet — nothing is designed, so the film is silent by default. Log the scenes first."
        : dry.length > 0
          ? "Mix stopped — " + dry.length + " scene" + (dry.length === 1 ? " runs" : "s run") +
            " dry: no ambient bed under the scene, so the cut drops to digital silence. The bed runs under everything; build it first — backgrounds first, hard FX second, foley third — before anything else is judged."
          : thin.length > 0
            ? "Hold the mix — " + thin.length + " scene" + (thin.length === 1 ? " is" : "s are") +
              " thin: a layer is missing or rough. Work the build order — dialogue first, then the SFX bed, then music last; a thin scene finished under a full score stays thin."
            : "Mix clean — every logged scene carries its three layers on a bed that never drops out. Before calling it done: the three-way listen (headphones, laptop speakers, phone) and the silence test — mute the music, and the scene must still play on dialogue and SFX alone.",
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
    return "— no state recorded —";
  }

  function routeLabel(id) {
    for (var i = 0; i < ROUTES.length; i++) if (ROUTES[i].id === id) return ROUTES[i].label;
    return "— no route recorded —";
  }

  function layersLabel(e) {
    return LAYERS.map(function (l) {
      return l.label + " " + (e && e.layers && e.layers[l.id] ? "✓" : "—");
    }).join(" · ");
  }

  function sheetToMarkdown(title, entries, doneIds) {
    var r = evaluate(entries);
    var gs = gateState(doneIds);
    var lines = [];
    lines.push("# Cue sheet — " + (title || "Untitled production"));
    lines.push("");
    lines.push("Sound, music & audio: the three layers, the dialogue routes, and the mix discipline (see craft/sound-music-audio.md).");
    lines.push("");
    lines.push("## The pre-mix gates");
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
      lines.push("- " + e.scene + " — " + statusLabel(effectiveStatus(e)) + ". Route: " + routeLabel(e.route) + ". Layers: " + layersLabel(e) + ". " + (e.detail || ""));
    });
    lines.push("");
    lines.push("## Mix verdict");
    lines.push(r.verdict);
    lines.push("");
    lines.push("Designed: " + r.designed + " · thin: " + r.thin + " · dry: " + r.dry + ".");
    return lines.join("\n") + "\n";
  }

  var api = { GATES: GATES, LAYERS: LAYERS, ROUTES: ROUTES, STATUSES: STATUSES,
    DEFAULT_ENTRIES: DEFAULT_ENTRIES, effectiveStatus: effectiveStatus,
    layerCount: layerCount, evaluate: evaluate, gateState: gateState,
    statusLabel: statusLabel, routeLabel: routeLabel, layersLabel: layersLabel,
    sheetToMarkdown: sheetToMarkdown };

  if (typeof module !== "undefined" && module.exports) { module.exports = api; }
  if (typeof window !== "undefined") { window.CueSheetEngine = api; }

  /* ---- browser wiring (skipped under node) ---- */
  if (typeof document === "undefined") return;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var stageEl = document.getElementById("cs-stage");
    if (!stageEl) return;
    var entries = JSON.parse(JSON.stringify(DEFAULT_ENTRIES));
    var done = [];
    var verdictEl = document.getElementById("cs-verdict");
    var gatesEl = document.getElementById("cs-gates-state");
    var msgEl = document.getElementById("cs-msg");

    function render() {
      var r = evaluate(entries);
      var html = "";
      entries.forEach(function (e, idx) {
        var eff = effectiveStatus(e);
        html += '<article class="cs-entry"><div class="cs-entry-head"><h4>' + esc(e.scene) + "</h4>" +
          '<span class="cs-tag">' + esc(routeLabel(e.route).split(" — ")[0]) + "</span></div>" +
          '<p class="cs-detail">' + esc(e.detail || "") + "</p>" +
          '<p class="cs-layers" role="group" aria-label="Layers present in ' + esc(e.scene) + '">' +
          LAYERS.map(function (l) {
            var on = !!(e.layers && e.layers[l.id]);
            return '<button type="button" class="btn btn-sm' + (on ? "" : " btn-ghost") +
              '" data-cs-layer="' + idx + ":" + l.id + '" aria-pressed="' + on + '">' +
              esc(l.label) + (on ? " ✓" : " —") + "</button>";
          }).join(" ") + "</p>" +
          '<p class="cs-state">State: <strong>' + esc(statusLabel(eff)) + "</strong>" +
          (eff !== e.status ? ' <span class="cs-note">(no bed — reads dry by the chapter\u2019s rule)</span>' : "") + "</p>" +
          '<p class="cs-states" role="group" aria-label="Set the state for ' + esc(e.scene) + '">' +
          STATUSES.map(function (s) {
            return '<button type="button" class="btn btn-sm' + (e.status === s.id ? "" : " btn-ghost") +
              '" data-cs-set="' + idx + ":" + s.id + '">' + esc(s.label) + "</button>";
          }).join(" ") + "</p>" +
          '<p><button type="button" class="btn btn-sm btn-ghost" data-cs-del="' + idx + '">Remove scene</button></p></article>';
      });
      stageEl.innerHTML = html || '<p class="cs-detail">No scenes logged yet.</p>';
      verdictEl.textContent = r.verdict;
      verdictEl.className = "cs-verdict " + (r.clean ? "cs-clean" : "cs-held");
      var gs = gateState(done);
      gatesEl.textContent = "Gates complete: " + gs.done + " of " + gs.total +
        (gs.complete ? " — every pre-mix gate is in place." : " — the gates are the discipline before any scene is judged; finish them first.");
    }

    stageEl.addEventListener("click", function (ev) {
      var b = ev.target.closest("button");
      if (!b) return;
      if (b.dataset.csSet) {
        var parts = b.dataset.csSet.split(":");
        entries[Number(parts[0])].status = parts[1];
      } else if (b.dataset.csLayer) {
        var lp = b.dataset.csLayer.split(":");
        var ent = entries[Number(lp[0])];
        ent.layers = ent.layers || {};
        ent.layers[lp[1]] = !ent.layers[lp[1]];
      } else if (b.dataset.csDel !== undefined && b.dataset.csDel !== "") {
        entries.splice(Number(b.dataset.csDel), 1);
      } else { return; }
      render();
    });

    document.querySelectorAll("[data-cs-gate]").forEach(function (cb) {
      cb.addEventListener("change", function () {
        done = Array.prototype.slice.call(document.querySelectorAll("[data-cs-gate]:checked"))
          .map(function (x) { return x.getAttribute("data-cs-gate"); });
        render();
      });
    });

    var addBtn = document.getElementById("cs-add");
    if (addBtn) addBtn.addEventListener("click", function () {
      var scene = (document.getElementById("cs-new-scene").value || "").trim();
      var detail = (document.getElementById("cs-new-detail").value || "").trim();
      if (!scene) { msgEl.hidden = false; msgEl.textContent = "Name the scene — the sheet only holds what is written down, scene by scene."; return; }
      entries.push({ scene: scene, route: document.getElementById("cs-new-route").value,
        detail: detail,
        layers: { bed: document.getElementById("cs-new-bed").checked,
                  foley: document.getElementById("cs-new-foley").checked,
                  accents: document.getElementById("cs-new-accents").checked },
        status: document.getElementById("cs-new-status").value });
      document.getElementById("cs-new-scene").value = "";
      document.getElementById("cs-new-detail").value = "";
      msgEl.hidden = true;
      render();
    });

    function exportText() {
      return sheetToMarkdown((document.getElementById("cs-title").value || "").trim(), entries, done);
    }
    var copyBtn = document.getElementById("cs-copy");
    if (copyBtn) copyBtn.addEventListener("click", function () {
      var doneMsg = function () { msgEl.hidden = false; msgEl.textContent = "Cue sheet copied as markdown."; };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(exportText()).then(doneMsg, doneMsg);
      else doneMsg();
    });
    var dlBtn = document.getElementById("cs-download");
    if (dlBtn) dlBtn.addEventListener("click", function () {
      var blob = new Blob([exportText()], { type: "text/markdown" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "cue-sheet.md";
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    });

    render();
  });
})();
