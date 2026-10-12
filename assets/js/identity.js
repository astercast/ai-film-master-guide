/* identity.js — "The Cutting Room" shared motion (wave 36).
   - Header timecode ticker (1fps, tabular mono, decorative)
   - Hero leader-countdown 3-2-1, one pass, frame-advance steps
   - Hero playhead is pure CSS; this file only touches text nodes.
   Everything is reduced-motion gated with a static final state. */
(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function tcFromSeconds(total) {
    var f = Math.floor((total % 1) * 24);
    var s = Math.floor(total) % 60;
    var m = Math.floor(total / 60) % 60;
    var h = Math.floor(total / 3600);
    return pad(h) + ":" + pad(m) + ":" + pad(s) + ":" + pad(f);
  }

  /* Header timecode: starts at 00:59:52:00 and rolls forward. Decorative. */
  var hdrTc = document.querySelector("[data-hdr-tc]");
  if (hdrTc) {
    var base = 59 * 60 + 52;
    var started = Date.now();
    var render = function () {
      var el = (Date.now() - started) / 1000;
      var node = hdrTc.querySelector(".hdr-tc-val");
      if (node) node.textContent = tcFromSeconds(base + el);
    };
    render();
    if (!reduceMotion) {
      /* ~12fps is plenty for a ticker; keeps it off the hot path. */
      window.setInterval(render, 84);
    }
  }

  /* Live hero timecode readout (mirrors the playhead sweep, ~16s loop). */
  var liveTc = document.querySelector("[data-tl-tc]");
  if (liveTc) {
    if (reduceMotion) {
      liveTc.textContent = "00:00:20:10";
    } else {
      var t0 = Date.now();
      window.setInterval(function () {
        var el = ((Date.now() - t0) / 1000) % 16;
        liveTc.textContent = tcFromSeconds(4 + el * 3.6);
      }, 84);
    }
  }

  /* Leader countdown: 3 -> 2 -> 1 with frame-advance steps, then holds.
     Clicking the leader frame rolls it again (a small delight, decorative only).
     Reduced motion: jump straight to the final state. */
  var frame = document.querySelector("[data-leader-frame]");
  if (frame) {
    var num = frame.querySelector("b");
    var label = frame.querySelector(".lf-label");
    var timer = null;
    var runCountdown = function () {
      if (timer) window.clearTimeout(timer);
      if (reduceMotion) {
        if (num) num.textContent = "3";
        if (label) label.textContent = "READY";
        return;
      }
      if (!num) return;
      var seq = ["3", "2", "1"];
      var i = 0;
      num.textContent = seq[0];
      if (label) label.textContent = "LEADER";
      var step = function () {
        i += 1;
        if (i < seq.length) {
          num.textContent = seq[i];
          timer = window.setTimeout(step, 520);
        } else if (label) {
          label.textContent = "ROLLING";
          timer = null;
        }
      };
      timer = window.setTimeout(step, 520);
    };
    runCountdown();
    /* Decorative element (aria-hidden deck): click-only, never keyboard-focusable. */
    frame.setAttribute("title", "Roll it again");
    frame.addEventListener("click", runCountdown);
  }
})();
