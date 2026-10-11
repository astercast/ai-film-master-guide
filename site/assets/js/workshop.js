/* Interactive prompt workshop — template x model x track -> live-filled prompt.
   Data: prompt-templates.json + models.json (copied into site/ at build time).
   Saves + ratings live in localStorage under afg-workshop-saves. */
(function () {
  "use strict";

  var SAVE_KEY = "afg-workshop-saves";
  var BIBLE_KEY = "afg-style-bibles";
  var TOK = /\[([^\[\]]+)\]/g; /* [PLACEHOLDER] or [PLACEHOLDER: suggested default] */

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var els = {
    track: document.getElementById("ws-track"),
    template: document.getElementById("ws-template"),
    model: document.getElementById("ws-model"),
    styleBible: document.getElementById("ws-stylebible"),
    fields: document.getElementById("ws-fields"),
    fieldsEmpty: document.getElementById("ws-fields-empty"),
    why: document.getElementById("ws-why"),
    preview: document.getElementById("ws-preview"),
    previewEmpty: document.getElementById("ws-preview-empty"),
    copy: document.getElementById("ws-copy"),
    save: document.getElementById("ws-save"),
    saves: document.getElementById("ws-saves"),
    savesEmpty: document.getElementById("ws-saves-empty"),
    error: document.getElementById("ws-error")
  };
  if (!els.template || !els.model) return;

  var templates = [];
  var saves = [];
  try { saves = JSON.parse(localStorage.getItem(SAVE_KEY) || "[]") || []; } catch (e) { saves = []; }

  function currentTemplate() {
    var id = els.template.value;
    for (var i = 0; i < templates.length; i++) {
      if (templates[i].id === id) return templates[i];
    }
    return null;
  }

  /* Split [TOKEN: suggested default] -> {name, suggestion} */
  function parseToken(raw) {
    var parts = raw.split(":");
    return { name: parts[0].trim(), suggestion: parts.slice(1).join(":").trim(), raw: raw };
  }

  function tokensOf(tpl) {
    var out = [], seen = {}, m;
    TOK.lastIndex = 0;
    while ((m = TOK.exec(tpl.prompt)) !== null) {
      var t = parseToken(m[1]);
      if (!seen[t.raw]) { seen[t.raw] = true; out.push(t); }
    }
    return out;
  }

  function fieldValues() {
    var vals = {};
    els.fields.querySelectorAll("input[data-token]").forEach(function (inp) {
      vals[inp.getAttribute("data-token")] = inp.value;
    });
    return vals;
  }

  function fillText(tpl, vals) {
    var body = tpl.prompt.replace(TOK, function (match, raw) {
      var v = (vals[raw] || "").trim();
      return v ? v : match;
    });
    var bible = styleBibleText();
    return bible ? bible + "\n\n" + body : body;
  }

  /* ---------- style bibles (from the style-bible builder) ---------- */

  function loadBibles() {
    try {
      var raw = JSON.parse(localStorage.getItem(BIBLE_KEY) || "[]");
      return Array.isArray(raw) ? raw : [];
    } catch (e) { return []; }
  }

  function renderBibleSelect() {
    if (!els.styleBible) return;
    var bibles = loadBibles();
    var keep = els.styleBible.value;
    els.styleBible.innerHTML = "";
    var none = document.createElement("option");
    none.value = "";
    none.textContent = bibles.length ? "No style bible" : "No style bible (build one)";
    els.styleBible.appendChild(none);
    bibles.forEach(function (b) {
      var o = document.createElement("option");
      o.value = b.id;
      o.textContent = b.name;
      els.styleBible.appendChild(o);
    });
    if (keep) els.styleBible.value = keep;
  }

  function styleBibleText() {
    if (!els.styleBible || !els.styleBible.value) return "";
    var found = "";
    loadBibles().forEach(function (b) { if (b.id === els.styleBible.value) found = b.text || ""; });
    return found;
  }

  /* ---------- render ---------- */

  function renderTemplateSelect() {
    var want = els.track.value;
    var groups = {};
    templates.forEach(function (t) {
      if (want !== "all" && t.track !== want) return;
      (groups[t.track] = groups[t.track] || []).push(t);
    });
    var order = ["core", "animated", "photorealistic", "performance", "audio", "longform", "repair"];
    var names = { core: "Core", animated: "Animated / stylized", photorealistic: "Photorealistic",
      performance: "Performance direction", audio: "Audio & voice", longform: "Long-form craft",
      repair: "Failure repair" };
    els.template.innerHTML = "";
    order.forEach(function (tr) {
      (groups[tr] || []).forEach(function (t) {
        var o = document.createElement("option");
        o.value = t.id;
        o.textContent = "[" + names[tr] + "] " + t.title;
        els.template.appendChild(o);
      });
    });
    if (!els.template.options.length) {
      var o = document.createElement("option");
      o.textContent = "No templates in this track";
      els.template.appendChild(o);
    }
    renderFields();
  }

  function renderFields() {
    var tpl = currentTemplate();
    els.fields.innerHTML = "";
    if (!tpl) {
      els.fieldsEmpty.hidden = false;
      els.why.innerHTML = "";
      els.preview.innerHTML = "";
      els.previewEmpty.hidden = false;
      els.copy.disabled = true;
      els.save.disabled = true;
      return;
    }
    var toks = tokensOf(tpl);
    els.fieldsEmpty.hidden = toks.length > 0;
    toks.forEach(function (t, i) {
      var id = "ws-f-" + tpl.id + "-" + i;
      var wrap = document.createElement("div");
      wrap.className = "field";
      var lab = document.createElement("label");
      lab.setAttribute("for", id);
      lab.textContent = t.name.toLowerCase();
      var inp = document.createElement("input");
      inp.className = "input";
      inp.type = "text";
      inp.id = id;
      inp.setAttribute("data-token", t.raw);
      inp.value = t.suggestion;
      inp.placeholder = t.suggestion ? "" : "leave blank to keep [" + t.name + "]";
      inp.addEventListener("input", renderPreview);
      wrap.appendChild(lab);
      wrap.appendChild(inp);
      els.fields.appendChild(wrap);
    });
    renderWhy(tpl);
    renderPreview();
  }

  function renderWhy(tpl) {
    var models = (tpl.models || []).map(esc).join(", ") || "any video model";
    els.why.innerHTML =
      "<h3>Why this template works</h3>" +
      '<dl class="why-list">' +
      "<dt>Anatomy</dt><dd>" + esc(tpl.anatomy || "—") + "</dd>" +
      "<dt>Use it for</dt><dd>" + esc(tpl.use || "—") + "</dd>" +
      "<dt>Recommended models</dt><dd>" + models + "</dd>" +
      "</dl>";
  }

  function renderPreview() {
    var tpl = currentTemplate();
    if (!tpl) return;
    var vals = fieldValues();
    /* Build highlighted HTML by walking the raw template text. */
    var html = "", last = 0, m, unfilled = 0;
    TOK.lastIndex = 0;
    while ((m = TOK.exec(tpl.prompt)) !== null) {
      html += esc(tpl.prompt.slice(last, m.index));
      var v = (vals[m[1]] || "").trim();
      if (v) {
        html += '<span class="fill">' + esc(v) + "</span>";
      } else {
        unfilled++;
        html += '<mark class="unfilled">[' + esc(m[1]) + "]</mark>";
      }
      last = m.index + m[0].length;
    }
    html += esc(tpl.prompt.slice(last));
    var bible = styleBibleText();
    if (bible) {
      html = '<div class="bible-preview"><p class="bible-label">Style bible</p><p>' +
        esc(bible) + "</p></div>" + html;
    }
    els.preview.innerHTML = html;
    els.previewEmpty.hidden = true;
    var remaining = unfilled;
    els.copy.disabled = false;
    els.save.disabled = false;
    els.copy.setAttribute("aria-label", remaining
      ? "Copy filled prompt to clipboard (" + remaining + " placeholder" + (remaining === 1 ? "" : "s") + " still empty)"
      : "Copy filled prompt to clipboard");
  }

  /* ---------- copy ---------- */

  function copyText(text, done) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
    } else {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "absolute";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      done(ok);
    }
  }

  els.copy.addEventListener("click", function () {
    var tpl = currentTemplate();
    if (!tpl || els.copy.disabled) return;
    var text = fillText(tpl, fieldValues());
    copyText(text, function (ok) {
      els.copy.textContent = ok ? "Copied" : "Copy failed";
      els.copy.classList.toggle("ok", ok);
      setTimeout(function () {
        els.copy.textContent = "Copy prompt";
        els.copy.classList.remove("ok");
      }, 1600);
    });
  });

  /* ---------- saved prompts (localStorage) ---------- */

  function persistSaves() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(saves)); } catch (e) { /* storage full/blocked: saves just don't persist */ }
  }

  function starButtons(s) {
    var html = '<span class="stars" role="group" aria-label="Rate saved prompt">';
    for (var i = 1; i <= 5; i++) {
      html += '<button type="button" class="star' + (i <= s.rating ? " on" : "") + '"' +
        ' data-rate="' + s.id + ":" + i + '" aria-label="Rate ' + i + " of 5 stars" + '"' +
        ' aria-pressed="' + (s.rating === i) + '">★</button>';
    }
    return html + "</span>";
  }

  function renderSaves() {
    els.savesEmpty.hidden = saves.length > 0;
    /* Highest-rated first, then newest. */
    var ordered = saves.slice().sort(function (a, b) {
      return (b.rating - a.rating) || (b.id < a.id ? 1 : -1);
    });
    els.saves.innerHTML = ordered.map(function (s) {
      return '<article class="card save-card" data-save="' + s.id + '">' +
        "<h3>" + esc(s.title) + "</h3>" +
        '<p class="save-meta">' + esc(s.model) + " · saved " + esc(s.savedAt) +
        (s.styleBibleName ? " · bible: " + esc(s.styleBibleName) : "") + "</p>" +
        '<p class="save-text">' + esc(s.prompt.length > 220 ? s.prompt.slice(0, 220) + "…" : s.prompt) + "</p>" +
        '<div class="btn-row save-actions">' + starButtons(s) +
        '<button type="button" class="btn btn-sm" data-load="' + s.id + '">Load</button>' +
        '<button type="button" class="btn btn-sm btn-ghost" data-del="' + s.id + '">Delete</button>' +
        "</div></article>";
    }).join("");
  }

  els.save.addEventListener("click", function () {
    var tpl = currentTemplate();
    if (!tpl || els.save.disabled) return;
    var vals = fieldValues();
    saves.unshift({
      id: "s" + Date.now(),
      templateId: tpl.id,
      title: tpl.title,
      model: els.model.options[els.model.selectedIndex]
        ? els.model.options[els.model.selectedIndex].textContent : "",
      track: tpl.track,
      prompt: fillText(tpl, vals),
      vals: vals,
      styleBibleId: els.styleBible ? els.styleBible.value : "",
      styleBibleName: els.styleBible && els.styleBible.selectedIndex > 0
        ? els.styleBible.options[els.styleBible.selectedIndex].textContent : "",
      rating: 0,
      savedAt: new Date().toISOString().slice(0, 10)
    });
    persistSaves();
    renderSaves();
    els.save.textContent = "Saved";
    setTimeout(function () { els.save.textContent = "Save this prompt"; }, 1600);
  });

  function loadSaveById(loadId) {
    var s = null;
    saves.forEach(function (x) { if (x.id === loadId) s = x; });
    if (!s) return false;
    els.track.value = "all";
    renderTemplateSelect();
    els.template.value = s.templateId;
    renderFields();
    /* restore model by matching the stored option label prefix */
    for (var i = 0; i < els.model.options.length; i++) {
      if (els.model.options[i].textContent === s.model) { els.model.selectedIndex = i; break; }
    }
    /* restore style bible selection */
    if (els.styleBible && s.styleBibleId) {
      renderBibleSelect();
      els.styleBible.value = s.styleBibleId;
    }
    /* restore placeholder values */
    els.fields.querySelectorAll("input[data-token]").forEach(function (inp) {
      var k = inp.getAttribute("data-token");
      if (s.vals && s.vals[k] !== undefined) inp.value = s.vals[k];
    });
    renderPreview();
    var pickers = document.getElementById("ws-pickers");
    if (pickers && pickers.scrollIntoView) pickers.scrollIntoView();
    els.template.focus();
    return true;
  }

  els.saves.addEventListener("click", function (ev) {
    var btn = ev.target.closest("button");
    if (!btn) return;
    var loadId = btn.getAttribute("data-load");
    var delId = btn.getAttribute("data-del");
    var rateSpec = btn.getAttribute("data-rate");
    if (delId) {
      saves = saves.filter(function (s) { return s.id !== delId; });
      persistSaves(); renderSaves();
      return;
    }
    if (rateSpec) {
      var parts = rateSpec.split(":");
      saves.forEach(function (s) { if (s.id === parts[0]) s.rating = parseInt(parts[1], 10); });
      persistSaves(); renderSaves();
      return;
    }
    if (loadId) { loadSaveById(loadId); return; }
  });

  /* ---------- init ---------- */

  function fail(msg) {
    els.error.hidden = false;
    els.error.textContent = msg;
  }

  Promise.all([
    fetch("prompt-templates.json").then(function (r) { if (!r.ok) throw new Error("t"); return r.json(); }),
    fetch("models.json").then(function (r) { if (!r.ok) throw new Error("m"); return r.json(); })
  ]).then(function (both) {
    templates = (both[0] && both[0].templates) || [];
    var models = (both[1] && both[1].models) || [];
    if (!templates.length) { fail("No prompt templates found in prompt-templates.json."); return; }

    models.forEach(function (m) {
      var o = document.createElement("option");
      o.value = m.model;
      o.textContent = m.model + " — " + m.platform + " (" + m.type + ")";
      els.model.appendChild(o);
    });

    /* Preselect model from ?model= query param (quiz handoff). */
    try {
      var qp = new URLSearchParams(window.location.search).get("model");
      if (qp) {
        for (var qi = 0; qi < els.model.options.length; qi++) {
          if (els.model.options[qi].value === qp) { els.model.selectedIndex = qi; break; }
        }
      }
    } catch (e) { /* ignore */ }

    els.track.addEventListener("change", renderTemplateSelect);
    els.template.addEventListener("change", renderFields);
    renderTemplateSelect();
    renderSaves();

    /* Deep link from the failure doctor: ?template=<id> preselects that repair template. */
    try {
      var tp = new URLSearchParams(window.location.search).get("template");
      if (tp) {
        els.track.value = "repair";
        renderTemplateSelect();
        for (var ti = 0; ti < els.template.options.length; ti++) {
          if (els.template.options[ti].value === tp) {
            els.template.selectedIndex = ti;
            renderFields();
            break;
          }
        }
      }
    } catch (e) { /* ignore */ }

    renderBibleSelect();
    if (els.styleBible) {
      els.styleBible.addEventListener("change", renderPreview);
      /* Bibles are managed on style-bible.html; refresh the menu when focused. */
      els.styleBible.addEventListener("focus", renderBibleSelect);
    }

    /* Deep link from the prompt gallery: ?save=<id> loads that saved prompt. */
    try {
      var sp = new URLSearchParams(window.location.search).get("save");
      if (sp) loadSaveById(sp);
    } catch (e) { /* ignore */ }
  }).catch(function () {
    fail("Could not load prompt-templates.json / models.json. The workshop needs the built site data.");
  });
})();
