/* Knowledge checks, client-side scoring + localStorage progress.
   Data-driven: questions are rendered server-side from the chapter content;
   this script only handles answering, feedback, and progress. */
(function () {
  "use strict";
  var STORE_KEY = "afmg_checks_v1";

  function load() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || "{}"); }
    catch (e) { return {}; }
  }
  function save(s) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch (e) {}
  }

  function initCheck(root) {
    var slug = root.getAttribute("data-check");
    var form = root.querySelector("form");
    var result = root.querySelector(".check-result");
    var questions = Array.prototype.slice.call(root.querySelectorAll("fieldset[data-answer]"));
    if (!form || !questions.length) return;

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var score = 0, answered = 0;
      questions.forEach(function (fs, i) {
        var correct = parseInt(fs.getAttribute("data-answer"), 10);
        var why = fs.getAttribute("data-why") || "";
        var picked = form.querySelector('input[name="q' + i + '"]:checked');
        var fb = fs.querySelector(".check-feedback");
        fs.classList.remove("is-correct", "is-wrong");
        if (!picked) {
          fb.textContent = "Pick an answer first, then check.";
          fb.hidden = false;
          return;
        }
        answered++;
        var val = parseInt(picked.value, 10);
        var ok = val === correct;
        if (ok) score++;
        fs.classList.add(ok ? "is-correct" : "is-wrong");
        var labels = fs.querySelectorAll("label");
        labels.forEach(function (lb, li) {
          lb.classList.toggle("is-right-answer", li === correct);
        });
        fb.innerHTML = (ok
          ? "<strong>Correct.</strong> "
          : "<strong>Not quite.</strong> ") + escapeHtml(why);
        fb.hidden = false;
      });
      result.hidden = false;
      if (answered < questions.length) {
        result.innerHTML = "<p>Answer every question, then check again, " +
          score + " of " + answered + " answered so far are correct.</p>";
        return;
      }
      var pct = Math.round((score / questions.length) * 100);
      result.innerHTML = "<p><strong>" + score + " of " + questions.length +
        " correct (" + pct + "%).</strong> " +
        (pct === 100 ? "Flawless, this chapter is yours." :
         pct >= 60 ? "Solid. Re-read the explanations you missed, then move on." :
         "Worth re-reading the chapter before this one sticks.") + "</p>";
      var store = load();
      store[slug] = { score: score, total: questions.length, done: true, at: new Date().toISOString().slice(0, 10) };
      save(store);
      renderIndexProgress();
    });

    form.addEventListener("reset", function () {
      questions.forEach(function (fs) {
        fs.classList.remove("is-correct", "is-wrong");
        var labels = fs.querySelectorAll("label");
        labels.forEach(function (lb) { lb.classList.remove("is-right-answer"); });
        var fb = fs.querySelector(".check-feedback");
        if (fb) { fb.hidden = true; fb.textContent = ""; }
      });
      result.hidden = true;
      result.innerHTML = "";
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* Progress strip on the checks index page. */
  function renderIndexProgress() {
    var host = document.getElementById("checks-progress");
    if (!host) return;
    var store = load();
    var cards = host.querySelectorAll("[data-check-card]");
    var done = 0;
    cards.forEach(function (card) {
      var slug = card.getAttribute("data-check-card");
      var rec = store[slug];
      var badge = card.querySelector(".check-status");
      if (rec && rec.done) {
        done++;
        badge.textContent = rec.score + "/" + rec.total + " · " + rec.at;
        badge.classList.add("is-done");
      } else {
        badge.textContent = "Not taken";
        badge.classList.remove("is-done");
      }
    });
    var summary = document.getElementById("checks-summary");
    if (summary) {
      summary.textContent = done + " of " + cards.length + " checks complete.";
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-check]").forEach(initCheck);
    renderIndexProgress();
  });
})();
