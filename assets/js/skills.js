/* Skills browser — loads skills-index.json, groups by category, live filter. */
(function () {
  "use strict";

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var els = {
    filter: document.getElementById("skills-filter"),
    count: document.getElementById("skills-count"),
    list: document.getElementById("skills-list"),
    empty: document.getElementById("skills-empty")
  };
  if (!els.list) return;

  var all = [];
  var CAT_NAMES = {
    prompts: "Prompt templates", camera: "Camera moves", models: "Directing models",
    checklists: "Checklists & audits", longform: "Long-form pipeline", techniques: "Winning techniques",
    craft: "Craft techniques", entry: "Competition entry", workflow: "Workflow",
    compare: "Model comparisons", fix: "Fix-it guides", budget: "Budgeting",
    delivery: "Delivery", audio: "Audio", recipes: "Shoot recipes",
    styles: "Style guides", performance: "Directing performance", grading: "Color grading",
    distribution: "Distribution", legal: "Rights & disclosure"
  };

  function catOf(path) { return path.split("/")[1]; }

  function render(q) {
    q = (q || "").trim().toLowerCase();
    var shown = all.filter(function (s) {
      return !q || (s.title + " " + s.description + " " + s.id).toLowerCase().indexOf(q) !== -1;
    });
    var groups = {};
    shown.forEach(function (s) {
      var c = catOf(s.path);
      (groups[c] = groups[c] || []).push(s);
    });
    var html = Object.keys(groups).sort().map(function (c) {
      var cards = groups[c].map(function (s) {
        return '<article class="card skill-card">' +
          "<h3>" + esc(s.title) + "</h3>" +
          "<p>" + esc(s.description) + "</p>" +
          '<p class="skill-id"><code>' + esc(s.id) + "</code></p>" +
          "</article>";
      }).join("");
      return '<h3 class="section-h">' + esc(CAT_NAMES[c] || c) + ' <span class="count">(' + groups[c].length + ")</span></h3>" +
        '<div class="chapter-grid">' + cards + "</div>";
    }).join("");
    els.list.innerHTML = html;
    els.empty.hidden = shown.length > 0;
    els.count.textContent = shown.length + " of " + all.length + " skills";
  }

  fetch("skills-index.json")
    .then(function (r) { if (!r.ok) throw new Error("skills index failed"); return r.json(); })
    .then(function (idx) {
      all = idx.skills || [];
      render("");
      var deb;
      els.filter.addEventListener("input", function () {
        clearTimeout(deb);
        deb = setTimeout(function () { render(els.filter.value); }, 150);
      });
    })
    .catch(function () {
      els.list.innerHTML = '<div class="empty-state"><p>Could not load the skills index.</p></div>';
    });
})();
