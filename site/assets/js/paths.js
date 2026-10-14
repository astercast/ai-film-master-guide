/* Learning-path progress, localStorage checkmarks on the 6 learning paths.
   Step ids (data-step) are stable across site rebuilds; progress persists per browser. */
(function () {
  "use strict";

  var KEY = "afg-path-progress-v1";
  var boxes = document.querySelectorAll(".path-check");
  if (!boxes.length) return;

  var state = {};
  try { state = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { state = {}; }

  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* private mode: progress just won't persist */ }
  }

  function update() {
    document.querySelectorAll(".path-card[data-path]").forEach(function (card) {
      var cardBoxes = card.querySelectorAll(".path-check");
      var done = 0;
      cardBoxes.forEach(function (b) { if (b.checked) done++; });
      var label = card.querySelector("[data-path-progress]");
      if (label) {
        label.textContent = done + " of " + cardBoxes.length + " complete";
        label.setAttribute("aria-label", "Path progress: " + done + " of " + cardBoxes.length + " steps complete");
      }
      var bar = card.querySelector(".path-bar-fill");
      if (bar) bar.style.width = cardBoxes.length ? (done / cardBoxes.length * 100) + "%" : "0%";
    });
  }

  boxes.forEach(function (box) {
    var id = box.getAttribute("data-step");
    if (state[id]) box.checked = true;
    box.addEventListener("change", function () {
      if (box.checked) { state[id] = true; } else { delete state[id]; }
      persist();
      update();
    });
  });

  document.querySelectorAll("[data-path-reset]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var prefix = btn.getAttribute("data-path-reset") + "-";
      boxes.forEach(function (box) {
        var id = box.getAttribute("data-step");
        if (id.indexOf(prefix) === 0) {
          box.checked = false;
          delete state[id];
        }
      });
      persist();
      update();
    });
  });

  update();
})();
