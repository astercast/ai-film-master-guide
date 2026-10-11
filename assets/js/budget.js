/* Interactive budget calculator — grounded in economics/credit-math.md (Oct 2026 third-party estimates). */
(function () {
  "use strict";

  /* [low, high] USD per clip, third-party estimates Oct 2026 — verify live before budgeting. */
  var MODELS = [
    ["Vidu", 0.05, 0.05],
    ["PixVerse", 0.07, 0.07],
    ["Pika", 0.17, 0.61],
    ["Hailuo (MiniMax)", 0.44, 0.76],
    ["Luma", 0.30, 1.20],
    ["Kling 3.0", 0.40, 0.40],
    ["Veo 3.1 Fast", 0.40, 0.50],
    ["Sora 2", 0.40, 2.00],
    ["Runway Gen-4.5", 1.44, 1.50],
    ["Higgsfield (Seedance 2.5)", 2.48, 2.48]
  ];

  var els = {
    runtime: document.getElementById("b-runtime"),
    runtimeOut: document.getElementById("b-runtime-out"),
    shotLen: document.getElementById("b-shotlen"),
    model: document.getElementById("b-model"),
    takes: document.getElementById("b-takes"),
    shots: document.getElementById("r-shots"),
    gens: document.getElementById("r-gens"),
    low: document.getElementById("r-low"),
    high: document.getElementById("r-high"),
    rule: document.getElementById("r-rule")
  };
  if (!els.runtime) return;

  MODELS.forEach(function (m, i) {
    var o = document.createElement("option");
    o.value = i;
    o.textContent = m[0] + " (~$" + m[1].toFixed(2) + (m[2] !== m[1] ? "–$" + m[2].toFixed(2) : "") + "/clip)";
    els.model.appendChild(o);
  });
  els.model.value = "5"; /* Kling 3.0 default */

  function fmt(n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  }

  function calc() {
    var minutes = parseFloat(els.runtime.value) || 0;
    var shotLen = parseFloat(els.shotLen.value) || 4;
    var m = MODELS[parseInt(els.model.value, 10)];
    var takes = parseInt(els.takes.value, 10);

    els.runtimeOut.textContent = minutes + " min";

    var shots = Math.max(1, Math.round((minutes * 60) / shotLen));
    var gens = shots * takes;
    var low = gens * m[1];
    var high = gens * m[2];
    var rule = minutes * 80;

    els.shots.textContent = shots.toLocaleString("en-US");
    els.gens.textContent = gens.toLocaleString("en-US");
    els.low.textContent = fmt(low);
    els.high.textContent = fmt(high);
    els.rule.textContent = fmt(rule);
  }

  ["input", "change"].forEach(function (ev) {
    [els.runtime, els.shotLen, els.model, els.takes].forEach(function (el) {
      el.addEventListener(ev, calc);
    });
  });
  calc();
})();
