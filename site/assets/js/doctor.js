/* Failure doctor — interactive troubleshooter.
   Data: diagnoses.json (copied into site/ at build time from api/v1/).
   Pick a symptom -> diagnosis in craft terms -> the fix -> one-click
   deep link into the workshop's repair templates (?template=r1..r3). */
(function () {
  "use strict";

  function esc(s) {
    return String(s == null ? "" : "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var els = {
    grid: document.getElementById("doc-grid"),
    gridEmpty: document.getElementById("doc-grid-empty"),
    panel: document.getElementById("doc-panel"),
    error: document.getElementById("doc-error")
  };
  if (!els.grid || !els.panel) return;

  function fail(msg) {
    els.error.hidden = false;
    els.error.textContent = msg;
  }

  function renderDiagnosis(d) {
    var fixes = d.fix.map(function (f, i) {
      return '<li><span class="doc-step-n" aria-hidden="true">' + (i + 1) + "</span><span>" + esc(f) + "</span></li>";
    }).join("");

    var chapters = d.chapters.map(function (c) {
      return '<li><a href="' + esc(c.url) + "#" + esc(c.anchor) + '">' + esc(c.title) + "</a></li>";
    }).join("");

    var sources = d.sources.map(function (s) {
      return "<li>" + esc(s) + "</li>";
    }).join("");

    var repair = d.repair_template
      ? '<p class="doc-repair"><a class="btn" href="workshop.html?template=' + esc(d.repair_template) + '">Open the repair template in the workshop →</a></p>'
      : "";

    els.panel.innerHTML =
      '<article class="card doc-card" aria-labelledby="doc-d-title">' +
      '<p class="doc-kicker">Diagnosis</p>' +
      '<h2 id="doc-d-title" tabindex="-1">' + esc(d.symptom) + "</h2>" +
      '<p class="doc-see"><strong>What you see:</strong> ' + esc(d.what_you_see) + "</p>" +
      '<p class="doc-dx"><strong>What\u2019s actually wrong:</strong> ' + esc(d.diagnosis) + "</p>" +
      '<h3>The fix</h3><ol class="doc-steps">' + fixes + "</ol>" +
      repair +
      '<h3>Read the source</h3><ul class="doc-links">' + chapters + "</ul>" +
      '<h3>Documented in</h3><ul class="doc-sources">' + sources + "</ul>" +
      "</article>";
    var h = document.getElementById("doc-d-title");
    if (h) h.focus({ preventScroll: false });
  }

  fetch("diagnoses.json")
    .then(function (r) { if (!r.ok) throw new Error("diagnoses failed"); return r.json(); })
    .then(function (data) {
      var list = (data && data.diagnoses) || [];
      if (!list.length) { fail("No diagnoses found in diagnoses.json."); return; }
      els.gridEmpty.hidden = true;
      list.forEach(function (d) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "doc-symptom";
        b.innerHTML = "<span>" + esc(d.symptom) + "</span>";
        b.setAttribute("aria-label", "Diagnose: " + d.symptom);
        b.addEventListener("click", function () {
          var prev = els.grid.querySelector("[aria-pressed='true']");
          if (prev) prev.setAttribute("aria-pressed", "false");
          b.setAttribute("aria-pressed", "true");
          renderDiagnosis(d);
        });
        els.grid.appendChild(b);
      });
      /* Preselect from ?symptom= for shareable links. */
      try {
        var sp = new URLSearchParams(window.location.search).get("symptom");
        if (sp) {
          var btns = els.grid.querySelectorAll(".doc-symptom");
          for (var i = 0; i < btns.length; i++) {
            if (btns[i].textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") === sp) {
              btns[i].click();
              break;
            }
          }
        }
      } catch (e) { /* ignore */ }
    })
    .catch(function () { fail("Could not load diagnoses.json. The doctor needs the built site data."); });
})();
