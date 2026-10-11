/* Shot-by-shot teardown viewer — "learn to see".
   Data: teardowns.json (built from api/v1/teardowns.json).
   Prompt reconstructions are analytical, not the productions' real prompts. */
(function () {
  "use strict";

  var app = document.getElementById("teardown-app");
  if (!app) return;

  var state = { data: null, film: 0, shot: 0 };

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function renderTabs() {
    var items = state.data.teardowns.map(function (t, i) {
      var sel = i === state.film;
      return '<button type="button" role="tab" id="td-tab-' + i + '"'
        + ' aria-selected="' + sel + '" aria-controls="td-panel"'
        + ' tabindex="' + (sel ? "0" : "-1") + '"'
        + ' class="td-tab' + (sel ? " is-active" : "") + '" data-film="' + i + '">'
        + esc(t.title) + "</button>";
    }).join("");
    return '<div role="tablist" aria-label="Films" class="td-tabs">' + items + "</div>";
  }

  function shotCard(film, i) {
    var s = film.shots[i];
    var recon = s.prompt_reconstruction
      ? '<details class="td-recon"><summary>Likely prompt <span class="td-recon-tag">reconstruction — not the actual prompt</span></summary>'
        + "<pre><code>" + esc(s.prompt_reconstruction) + "</code></pre></details>"
      : "";
    return '<article class="td-card" aria-live="polite">'
      + '<p class="td-shotno">Shot ' + (i + 1) + " of " + film.shots.length + "</p>"
      + "<h3>" + esc(s.title) + "</h3>"
      + '<dl class="td-fields">'
      + "<div><dt>The setup</dt><dd>" + esc(s.setup) + "</dd></div>"
      + "<div><dt>What works</dt><dd>" + esc(s.works) + "</dd></div>"
      + "<div><dt>What breaks</dt><dd>" + esc(s.breaks) + "</dd></div>"
      + '<div class="td-lesson"><dt>The craft lesson</dt><dd>' + esc(s.lesson) + "</dd></div>"
      + "</dl>" + recon + "</article>";
  }

  function render() {
    var t = state.data.teardowns[state.film];
    var sources = (t.sources || []).map(function (u) {
      return '<li><a href="' + esc(u) + '" rel="noopener">' + esc(u) + "</a></li>";
    }).join("");
    var pct = Math.round(((state.shot + 1) / t.shots.length) * 100);
    app.innerHTML =
      renderTabs()
      + '<div id="td-panel" role="tabpanel" aria-labelledby="td-tab-' + state.film + '" class="td-panel">'
      + '<p class="td-sub">' + esc(t.subtitle) + "</p>"
      + '<p class="td-context">' + esc(t.context) + "</p>"
      + '<div class="td-stepper">'
      + '<button type="button" class="btn btn-sm td-prev" data-d="-1" aria-label="Previous shot"' + (state.shot === 0 ? " disabled" : "") + ">← Prev</button>"
      + '<div class="td-progress" role="progressbar" aria-valuemin="1" aria-valuemax="' + t.shots.length + '" aria-valuenow="' + (state.shot + 1) + '" aria-label="Shot progress"><span style="width:' + pct + '%"></span></div>'
      + '<button type="button" class="btn btn-sm td-next" data-d="1" aria-label="Next shot"' + (state.shot === t.shots.length - 1 ? " disabled" : "") + ">Next →</button>"
      + "</div>"
      + shotCard(t, state.shot)
      + '<details class="td-sources"><summary>Sources for this teardown</summary><ul>' + sources + "</ul></details>"
      + "</div>"
      + '<p class="td-note">Prompt reconstructions are analytical reconstructions for study — not the productions\u2019 actual prompts. Production facts carry their sources above.</p>';
  }

  function selectFilm(i) {
    state.film = i; state.shot = 0; render();
    var tab = app.querySelector("#td-tab-" + i);
    if (tab) tab.focus();
  }

  app.addEventListener("click", function (e) {
    var tab = e.target.closest("[data-film]");
    if (tab) { selectFilm(parseInt(tab.getAttribute("data-film"), 10)); return; }
    var step = e.target.closest("[data-d]");
    if (step && !step.disabled) {
      var t = state.data.teardowns[state.film];
      var n = state.shot + parseInt(step.getAttribute("data-d"), 10);
      if (n >= 0 && n < t.shots.length) { state.shot = n; render(); }
    }
  });

  app.addEventListener("keydown", function (e) {
    var tab = e.target.closest('[role="tab"]');
    if (tab) {
      var n = state.data.teardowns.length;
      var i = state.film;
      if (e.key === "ArrowRight") { e.preventDefault(); selectFilm((i + 1) % n); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); selectFilm((i - 1 + n) % n); }
      else if (e.key === "Home") { e.preventDefault(); selectFilm(0); }
      else if (e.key === "End") { e.preventDefault(); selectFilm(n - 1); }
      return;
    }
    if (e.target.closest(".td-stepper") || e.target.closest(".td-card")) {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        var t = state.data.teardowns[state.film];
        var d = e.key === "ArrowRight" ? 1 : -1;
        var m = state.shot + d;
        if (m >= 0 && m < t.shots.length) { e.preventDefault(); state.shot = m; render(); }
      }
    }
  });

  fetch("teardowns.json", { credentials: "same-origin" })
    .then(function (r) { if (!r.ok) throw new Error("http " + r.status); return r.json(); })
    .then(function (data) {
      if (!data.teardowns || !data.teardowns.length) throw new Error("empty");
      state.data = data;
      render();
    })
    .catch(function () {
      app.innerHTML = '<p class="td-error" role="alert">The teardown data could not be loaded. Check that <code>teardowns.json</code> sits next to this page and reload.</p>';
    });
})();
