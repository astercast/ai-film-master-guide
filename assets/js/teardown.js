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

  function pad2(n) { return (n < 10 ? "0" : "") + n; }
  function shotTc(i) { return "00:00:" + pad2((i * 8) % 60) + ":00"; }

  function renderClips(film, active) {
    var items = film.shots.map(function (s, i) {
      return '<button type="button" class="td-clip' + (i === active ? " is-active" : "") + '"'
        + ' data-shot="' + i + '" aria-label="Go to shot ' + (i + 1) + ": " + esc(s.title) + '"'
        + (i === active ? ' aria-current="true"' : "") + ">"
        + "S" + pad2(i + 1)
        + '<span class="td-clip-tc" aria-hidden="true">' + shotTc(i) + "</span></button>";
    }).join("");
    var ruler = '<div class="tl-ruler" aria-hidden="true">'
      + '<span style="left:0%">00:00:00:00</span>'
      + '<span style="left:25%">00:00:15:00</span>'
      + '<span style="left:50%">00:00:30:00</span>'
      + '<span style="left:75%">00:00:45:00</span>'
      + '<span style="left:100%">00:01:00:00</span></div>';
    return '<div class="td-timeline">' + ruler
      + '<div class="td-clips" role="group" aria-label="Shots on the timeline">' + items + "</div></div>";
  }

  function shotCard(film, i) {
    var s = film.shots[i];
    var recon = s.prompt_reconstruction
      ? '<details class="td-recon"><summary>Likely prompt <span class="td-recon-tag">reconstruction — not the actual prompt</span></summary>'
        + "<pre><code>" + esc(s.prompt_reconstruction) + "</code></pre></details>"
      : "";
    return '<article class="td-card" aria-live="polite">'
      + '<div class="td-viewer-head"><span class="rec-dot" aria-hidden="true"></span>'
      + "<span>Shot " + (i + 1) + " / " + film.shots.length + "</span>"
      + '<span class="tc" aria-hidden="true">' + shotTc(i) + "</span>"
      + '<span style="margin-left:auto">' + esc(film.title) + "</span></div>"
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
    var n = state.data.teardowns.length;
    var prevF = (state.film - 1 + n) % n, nextF = (state.film + 1) % n;
    var filmsNav =
      '<nav class="td-films-nav" aria-label="Teardowns">'
      + '<button type="button" class="btn btn-sm btn-ghost" data-film="' + prevF + '">\u2190 ' + esc(state.data.teardowns[prevF].title) + '</button>'
      + '<button type="button" class="btn btn-sm btn-ghost" data-film="' + nextF + '">' + esc(state.data.teardowns[nextF].title) + ' \u2192</button>'
      + "</nav>";
    var sources = (t.sources || []).map(function (u) {
      return '<li><a href="' + esc(u) + '" rel="noopener">' + esc(u) + "</a></li>";
    }).join("");
    var pct = Math.round(((state.shot + 1) / t.shots.length) * 100);
    app.innerHTML =
      renderTabs()
      + '<div id="td-panel" role="tabpanel" aria-labelledby="td-tab-' + state.film + '" class="td-panel">'
      + '<p class="td-sub">' + esc(t.subtitle) + "</p>"
      + '<p class="td-context">' + esc(t.context) + "</p>"
      + renderClips(t, state.shot)
      + '<div class="td-stepper">'
      + '<button type="button" class="btn btn-sm td-prev" data-d="-1" aria-label="Previous shot"' + (state.shot === 0 ? " disabled" : "") + ">← Prev</button>"
      + '<div class="td-progress" role="progressbar" aria-valuemin="1" aria-valuemax="' + t.shots.length + '" aria-valuenow="' + (state.shot + 1) + '" aria-label="Shot progress"><span style="width:' + pct + '%"></span></div>'
      + '<button type="button" class="btn btn-sm td-next" data-d="1" aria-label="Next shot"' + (state.shot === t.shots.length - 1 ? " disabled" : "") + ">Next →</button>"
      + "</div>"
      + shotCard(t, state.shot)
      + '<details class="td-sources"><summary>Sources for this teardown</summary><ul>' + sources + "</ul></details>"
      + (t.id === "storeel-off-campus"
        ? '<div class="card td-cta" style="margin-top:var(--space-4);"><p><strong>' +
          "Turn these economics into a plan.</strong> The Studio's microdrama " +
          "mode plans the clip budget, the $50/min benchmark, the 3–5× retake " +
          "budget, the regen reserve, and the timeline from these same " +
          "documented figures.</p>" +
          '<p><a class="btn" href="studio.html?mode=microdrama">Plan a microdrama run →</a></p></div>'
        : "")
      + "</div>"
      + filmsNav
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
    var clip = e.target.closest("[data-shot]");
    if (clip) {
      var n = parseInt(clip.getAttribute("data-shot"), 10);
      var t = state.data.teardowns[state.film];
      if (n >= 0 && n < t.shots.length) { state.shot = n; render(); }
      return;
    }
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
    if (e.target.closest(".td-stepper") || e.target.closest(".td-card") || e.target.closest(".td-clips")) {
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
