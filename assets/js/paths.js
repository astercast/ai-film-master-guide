/* Learning-path progress, localStorage checkmarks on the 7 learning paths.
   Step ids (data-step) are stable across site rebuilds; progress persists per browser.

   Round 2 changes:
   - Progress is shared between paths. The same chapter step appears in
     several paths under different checkbox ids (for example Directing
     performance in the photoreal, competition and longform paths).
     Boxes are grouped by their step key, the chapter link plus its
     label, and ticking one ticks every box in the group. The label is
     part of the key on purpose: Reel 01 has seven distinct days that
     all link to the same first-short chapter, and the 90-day path's
     week milestones link to chapters they only partly cover, so a
     bare link would merge steps that are not the same step.
   - The front door remembers you. On load, the first path that is
     started but not finished is opened instead of Reel 01; if none is
     part done, the path you last opened is reopened. Reel 01 is only
     the default for a first visit. */
(function () {
  "use strict";

  var KEY = "afg-path-progress-v1";
  var OPEN_KEY = "afg-open-path-v1";
  var boxes = [].slice.call(document.querySelectorAll(".path-check"));
  if (!boxes.length) return;

  var state = {};
  try { state = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { state = {}; }

  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* private mode: progress just won't persist */ }
  }

  function stepKey(box) {
    var li = box.closest("li");
    var a = li ? li.querySelector("a") : null;
    if (!a) return box.getAttribute("data-step");
    var label = (a.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
    return a.getAttribute("href") + "|" + label;
  }

  /* Group the boxes: every box that is the same chapter step shares a group. */
  var groups = {};
  boxes.forEach(function (box) {
    var k = stepKey(box);
    box.setAttribute("data-step-key", k);
    (groups[k] = groups[k] || []).push(box);
  });

  function setGroup(box, checked) {
    groups[stepKey(box)].forEach(function (peer) {
      peer.checked = checked;
      var id = peer.getAttribute("data-step");
      if (checked) { state[id] = true; } else { delete state[id]; }
    });
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

  /* Restore: a step saved under any one of its ids counts as done in
     every path that carries it, and the saved state is unified to match. */
  var unified = false;
  boxes.forEach(function (box) {
    if (state[box.getAttribute("data-step")]) box.checked = true;
  });
  Object.keys(groups).forEach(function (k) {
    var any = groups[k].some(function (b) { return b.checked; });
    if (any) {
      groups[k].forEach(function (b) {
        if (!b.checked) { b.checked = true; }
        var id = b.getAttribute("data-step");
        if (!state[id]) { state[id] = true; unified = true; }
      });
    }
  });
  if (unified) persist();

  boxes.forEach(function (box) {
    box.addEventListener("change", function () {
      setGroup(box, box.checked);
      persist();
      update();
    });
  });

  document.querySelectorAll("[data-path-reset]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var card = btn.closest(".path-card");
      if (!card) return;
      /* Resetting a path also clears its steps in the other paths:
         they are the same steps, so their ticks are the same ticks. */
      var keys = {};
      card.querySelectorAll(".path-check").forEach(function (b) { keys[stepKey(b)] = true; });
      Object.keys(keys).forEach(function (k) {
        groups[k].forEach(function (b) {
          b.checked = false;
          delete state[b.getAttribute("data-step")];
        });
      });
      persist();
      update();
    });
  });

  update();

  /* Resume: open the path that is started but not finished. Fall back
     to the path last opened by hand. Otherwise leave the printed
     default (Reel 01) exactly as it is. */
  var bills = [].slice.call(document.querySelectorAll(".bill[data-path]"));
  bills.forEach(function (bill) {
    bill.addEventListener("toggle", function () {
      if (bill.open) {
        try { localStorage.setItem(OPEN_KEY, bill.getAttribute("data-path")); } catch (e) { /* private mode */ }
      }
    });
  });

  var target = bills.filter(function (b) {
    var c = [].slice.call(b.querySelectorAll(".path-check"));
    var n = c.filter(function (x) { return x.checked; }).length;
    return n > 0 && n < c.length;
  })[0];

  if (!target) {
    var last = null;
    try { last = localStorage.getItem(OPEN_KEY); } catch (e) { last = null; }
    if (last) {
      target = bills.filter(function (b) { return b.getAttribute("data-path") === last; })[0] || null;
    }
  }

  if (target && !target.open) {
    bills.forEach(function (b) { if (b !== target) b.open = false; });
    target.open = true;
  }
})();
