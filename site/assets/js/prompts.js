/* Prompt library explorer (wave 25), first-class browser for the 47 guide templates.
   Data (fetched at runtime, never forked):
     prompt-templates.json .. the templates themselves (generator-owned, from the
                              research artifact parser, this page only reads them)
     prompts-facets.json .... HAND-maintained browsable facets: shot_type / movement /
                              lighting / mood, the anatomy layers each template
                              demonstrates, teardown cross-links.
     camera-movements.json .. display names for the 22-move lexicon used by the
                              movement filter.
   Features: full-text search, five facet filters, per-card copy, "Send to Studio"
   (localStorage bridge, same pattern as the episode planner), and a Remix helper
   (client-side slot assembly, always labeled as a remix of the source template). */
(function () {
  "use strict";

  var app = document.getElementById("pr-app");
  if (!app) return;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* Display names: the nine layers + exclusion block match anatomy.html's LAYERS. */
  var LAYER_NAMES = {
    subject: "Subject", action: "Micro-action", environment: "Environment",
    camera: "Camera behavior", lighting: "Lighting design", style: "Visual style",
    tone: "Emotional tone", physics: "Physics & motion", render: "Rendering quality",
    exclusion: "Exclusion block"
  };

  function pretty(v) {
    if (v === "none") return "No camera (audio)";
    if (v === "varies") return "Varies";
    return v.split("-").map(function (w) {
      return w.charAt(0).toUpperCase() + w.slice(1);
    }).join(" ");
  }

  var els = {
    q: document.getElementById("pr-q"),
    track: document.getElementById("pr-track"),
    shotType: document.getElementById("pr-shot-type"),
    movement: document.getElementById("pr-movement"),
    lighting: document.getElementById("pr-lighting"),
    mood: document.getElementById("pr-mood"),
    clear: document.getElementById("pr-clear"),
    count: document.getElementById("pr-count"),
    list: document.getElementById("pr-list"),
    empty: document.getElementById("pr-empty"),
    error: document.getElementById("pr-error"),
    provenance: document.getElementById("pr-provenance"),
    remixDialog: document.getElementById("pr-remix-dialog"),
    remixTemplate: document.getElementById("pr-remix-template"),
    remixSubject: document.getElementById("pr-remix-subject"),
    remixSetting: document.getElementById("pr-remix-setting"),
    remixLighting: document.getElementById("pr-remix-lighting"),
    remixOut: document.getElementById("pr-remix-out"),
    remixGenerate: document.getElementById("pr-remix-generate"),
    remixCopy: document.getElementById("pr-remix-copy"),
    remixMsg: document.getElementById("pr-remix-msg"),
    remixLabel: document.getElementById("pr-remix-label")
  };

  var TEMPLATES = [], FACETS = {}, MOV_NAMES = {}, TEARDOWN_TITLES = {};
  var BRIDGE_KEY = "afg-studio-bridge";

  /* Highlight the guide's [BRACKET] placeholders like the workshop does. */
  function highlightPrompt(p) {
    var html = "", last = 0, m;
    var re = /\[([^\]]+)\]/g;
    while ((m = re.exec(p)) !== null) {
      html += esc(p.slice(last, m.index));
      html += '<span class="pr-slot">[' + esc(m[1]) + "]</span>";
      last = m.index + m[0].length;
    }
    return html + esc(p.slice(last));
  }

  function facetOf(t) { return FACETS[t.id] || {}; }

  function cardHtml(t) {
    var f = facetOf(t);
    var layers = (f.layers || []).map(function (l) {
      return '<li class="pr-chip pr-layer" title="Demonstrates the ' +
        esc(LAYER_NAMES[l] || l) + ' layer"><a href="anatomy.html">' +
        esc(LAYER_NAMES[l] || l) + "</a></li>";
    }).join("");
    var facets = [["shot_type", f.shot_type], ["movement", f.movement],
                  ["lighting", f.lighting], ["mood", f.mood]]
      .filter(function (p) { return p[1] && p[1] !== "none"; })
      .map(function (p) {
        var v = p[0] === "movement" ? (MOV_NAMES[p[1]] || pretty(p[1])) : pretty(p[1]);
        return '<li class="pr-chip" title="' + esc(p[0].replace("_", " ")) + '">' + esc(v) + "</li>";
      }).join("");
    var teardowns = (f.teardowns || []).map(function (id) {
      return '<li><a href="teardown.html">' + esc(TEARDOWN_TITLES[id] || id) +
        " teardown →</a></li>";
    }).join("");
    var models = (t.models || []).map(function (m) { return "<li>" + esc(m) + "</li>"; }).join("");
    return '<article class="card pr-card" id="' + esc(t.id) + '" data-tid="' + esc(t.id) + '">' +
      '<div class="pr-card-head"><h3><a href="#' + esc(t.id) + '">' + esc(t.title) + '</a></h3>' +
      '<span class="pr-track">' + esc(t.track) + '</span></div>' +
      '<p class="pr-id">Template ' + esc(t.id) + (t.use ? " · " + esc(t.use) : "") + "</p>" +
      '<pre class="pr-prompt" tabindex="0">' + highlightPrompt(t.prompt) + "</pre>" +
      '<ul class="pr-chips" aria-label="Prompt-anatomy layers this template demonstrates">' +
      layers + "</ul>" +
      '<ul class="pr-chips" aria-label="Shot facets">' + facets + "</ul>" +
      (t.anatomy ? '<p class="pr-note"><strong>Why it works:</strong> ' + esc(t.anatomy) + "</p>" : "") +
      (models ? '<ul class="pr-models" aria-label="Shortlisted models">' + models + "</ul>" : "") +
      (teardowns ? '<ul class="pr-teardowns" aria-label="Matching teardown workflows">' + teardowns + "</ul>" : "") +
      '<div class="btn-row pr-actions">' +
      '<button type="button" class="btn btn-sm pr-copy" data-tid="' + esc(t.id) + '">Copy prompt</button>' +
      '<button type="button" class="btn btn-sm pr-send" data-tid="' + esc(t.id) + '">Send to Studio</button>' +
      '<button type="button" class="btn btn-sm btn-ghost pr-remix" data-tid="' + esc(t.id) + '">Remix</button>' +
      '<a class="btn btn-sm btn-ghost" href="workshop.html">Fill in workshop →</a>' +
      "</div></article>";
  }

  function matches(t, q) {
    var f = facetOf(t);
    if (els.track.value !== "all" && t.track !== els.track.value) return false;
    if (els.shotType.value !== "all" && f.shot_type !== els.shotType.value) return false;
    if (els.movement.value !== "all" && f.movement !== els.movement.value) return false;
    if (els.lighting.value !== "all" && f.lighting !== els.lighting.value) return false;
    if (els.mood.value !== "all" && f.mood !== els.mood.value) return false;
    if (q) {
      var hay = (t.id + " " + t.title + " " + t.prompt + " " +
        (t.use || "") + " " + (t.anatomy || "") + " " +
        (t.models || []).join(" ")).toLowerCase();
      var words = q.toLowerCase().split(/\s+/).filter(Boolean);
      for (var i = 0; i < words.length; i++) {
        if (hay.indexOf(words[i]) === -1) return false;
      }
    }
    return true;
  }

  function render() {
    var q = els.q.value.trim();
    var shown = TEMPLATES.filter(function (t) { return matches(t, q); });
    els.count.textContent = shown.length + " of " + TEMPLATES.length + " templates";
    els.list.innerHTML = shown.map(cardHtml).join("");
    els.empty.hidden = shown.length !== 0;
    els.list.hidden = shown.length === 0;
  }

  function msg(el, text, ok) {
    el.hidden = false;
    el.textContent = text;
    el.classList.toggle("is-ok", !!ok);
    el.classList.toggle("is-err", !ok);
  }

  function copyText(text, button) {
    function done() {
      if (button) {
        var orig = button.textContent;
        button.textContent = "Copied ✓";
        setTimeout(function () { button.textContent = orig; }, 1500);
      }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallback(); });
    } else { fallback(); }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); done(); } catch (e) { /* ignore */ }
      document.body.removeChild(ta);
    }
  }

  function templateById(id) {
    for (var i = 0; i < TEMPLATES.length; i++) {
      if (TEMPLATES[i].id === id) return TEMPLATES[i];
    }
    return null;
  }

  /* "Send to Studio": one click stages the template as a shot-prompt starting
     point. Same bridge pattern as the episode planner: the Studio consumes the
     localStorage payload once and shows its own banner. Nothing leaves the browser. */
  function sendToStudio(id) {
    var t = templateById(id);
    if (!t) return;
    var payload = {
      v: 1, kind: "prompt", sentAt: new Date().toISOString(),
      templateId: t.id, title: t.title, prompt: t.prompt,
      anatomy: t.anatomy || null,
      layers: (FACETS[t.id] || {}).layers || []
    };
    try {
      localStorage.setItem(BRIDGE_KEY, JSON.stringify(payload));
    } catch (e) {
      return;
    }
    location.href = "studio.html?from=prompts";
  }

  /* Remix helper: structured slot assembly, client-side only. Replaces the
     subject / setting / lighting slots of the chosen template and labels the
     output as a remix, never as a guide template. Unfilled slots stay bracketed. */
  function slotFill(prompt, vals) {
    function sub(val) { return function () { return val; }; }
    var out = prompt;
    if (vals.subject) {
      /* Two-subject templates: "Mara and Jun" fills A and B separately. */
      var parts = vals.subject.split(/\s+and\s+|\s*&\s*|,/i)
        .map(function (s) { return s.trim(); }).filter(Boolean);
      if (parts.length >= 2) {
        out = out.replace(/\[(SUBJECT|CHARACTER)\s+A(?:[^\]]*)\]/gi, sub(parts[0]));
        out = out.replace(/\[(SUBJECT|CHARACTER)\s+B(?:[^\]]*)\]/gi, sub(parts[1]));
      }
      out = out.replace(
        /\[(SUBJECT(?:\s+[A-Z])?|CHARACTER(?:\s+[A-Z])?|PRODUCT|DISH|MODEL|CAR)(?:[^\]]*)\]/gi,
        sub(vals.subject));
    }
    if (vals.setting) {
      out = out.replace(
        /\[(ENV(?:\s+[A-Z])?|ENVIRONMENT|LOCATION|CITY|CORRIDOR|LANDSCAPE|ROAD|SCENE|RUNWAY\/LOCATION)(?:[^\]]*)\]/gi,
        sub(vals.setting));
    }
    if (vals.lighting) {
      out = out.replace(/\[(LIGHT(?:ING)?)(?:[^\]]*)\]/gi, sub(vals.lighting));
    }
    return out;
  }

  function openRemix(id) {
    els.remixTemplate.value = id;
    els.remixSubject.value = "";
    els.remixSetting.value = "";
    els.remixLighting.value = "";
    els.remixOut.textContent = "";
    els.remixLabel.textContent = "";
    els.remixMsg.hidden = true;
    els.remixCopy.disabled = true;
    var d = els.remixDialog;
    if (d.showModal) { d.showModal(); } else { d.setAttribute("open", ""); }
    els.remixSubject.focus();
  }

  function generateRemix() {
    var t = templateById(els.remixTemplate.value);
    if (!t) return;
    var out = slotFill(t.prompt, {
      subject: els.remixSubject.value.trim(),
      setting: els.remixSetting.value.trim(),
      lighting: els.remixLighting.value.trim()
    });
    els.remixLabel.textContent = "Remix of " + t.id + ", “" + t.title +
      "”. Assembled from the template's slots; unfilled slots stay as [BRACKETS]. This is a remix, not a guide template.";
    els.remixOut.textContent = out;
    els.remixCopy.disabled = false;
    els.remixMsg.hidden = true;
  }

  /* Populate facet selects from the vocabularies actually used in the data. */
  function fillSelect(el, values, labelFn) {
    values.forEach(function (v) {
      var o = document.createElement("option");
      o.value = v;
      o.textContent = labelFn(v);
      el.appendChild(o);
    });
  }
  function usedValues(key) {
    var seen = {}, out = [];
    TEMPLATES.forEach(function (t) {
      var v = (FACETS[t.id] || {})[key];
      if (v && v !== "none" && !seen[v]) { seen[v] = 1; out.push(v); }
    });
    return out.sort();
  }

  function bindCardActions() {
    els.list.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn) return;
      var id = btn.getAttribute("data-tid");
      var t = templateById(id);
      if (!t) return;
      if (btn.classList.contains("pr-copy")) copyText(t.prompt, btn);
      else if (btn.classList.contains("pr-send")) sendToStudio(id);
      else if (btn.classList.contains("pr-remix")) openRemix(id);
    });
  }

  Promise.all([
    fetch("prompt-templates.json").then(function (r) { if (!r.ok) throw 0; return r.json(); }),
    fetch("prompts-facets.json").then(function (r) { if (!r.ok) throw 0; return r.json(); }),
    fetch("camera-movements.json").then(function (r) { if (!r.ok) throw 0; return r.json(); }),
    fetch("teardowns.json").then(function (r) { if (!r.ok) throw 0; return r.json(); })
  ]).then(function (parts) {
    TEMPLATES = parts[0].templates || [];
    FACETS = parts[1].facets || {};
    (parts[2].movements || []).forEach(function (m) { MOV_NAMES[m.id] = m.move; });
    (parts[3].teardowns || []).forEach(function (t) { TEARDOWN_TITLES[t.id] = t.title; });

    /* Guard the generator-owns-output contract: the UI reads the JSON, so the
       rendered count must match the artifact data exactly. */
    var facetIds = Object.keys(FACETS);
    if (facetIds.length !== TEMPLATES.length) {
      msg(els.error, "Facet data covers " + facetIds.length + " templates but prompt-templates.json has " +
        TEMPLATES.length + ", the library is out of sync. Fix prompts-facets.json.", false);
      return;
    }
    els.provenance.hidden = false;
    els.provenance.innerHTML = "Templates from <code>prompt-templates.json</code> v" +
      esc(parts[0].version || "?") + ", " + TEMPLATES.length +
      " templates, read live from the guide's published API (generator-owned). " +
      "Facets and anatomy tags are the guide's annotations, not template text.";

    fillSelect(els.shotType, usedValues("shot_type"), pretty);
    fillSelect(els.movement, usedValues("movement"), function (v) {
      return v === "varies" ? "Varies" : (MOV_NAMES[v] || pretty(v));
    });
    fillSelect(els.lighting, usedValues("lighting"), pretty);
    fillSelect(els.mood, usedValues("mood"), pretty);

    els.remixTemplate.innerHTML = TEMPLATES.map(function (t) {
      return '<option value="' + esc(t.id) + '">' + esc(t.id) + ", " + esc(t.title) + "</option>";
    }).join("");

    /* Contents list (VP-0044): one anchor link per template, in shelf
       order, so the library can be scanned and deep-linked without
       scrolling the whole shelf. */
    var contents = document.getElementById("pr-contents");
    if (contents) {
      contents.innerHTML = TEMPLATES.map(function (t) {
        return '<li><a href="#' + esc(t.id) + '"><span class="pr-tid">' +
          esc(t.id) + "</span>" + esc(t.title) + "</a></li>";
      }).join("");
    }

    ["q", "track", "shotType", "movement", "lighting", "mood"].forEach(function (k) {
      var el = els[k];
      el.addEventListener(k === "q" ? "input" : "change", render);
    });
    els.clear.addEventListener("click", function () {
      els.q.value = "";
      ["track", "shotType", "movement", "lighting", "mood"].forEach(function (k) {
        els[k].value = "all";
      });
      render();
      els.q.focus();
    });
    els.remixGenerate.addEventListener("click", generateRemix);
    els.remixCopy.addEventListener("click", function () {
      var label = els.remixLabel.textContent;
      copyText(label + "\n\n" + els.remixOut.textContent, els.remixCopy);
    });
    bindCardActions();
    render();

    /* Deep links (VP-0044): prompts.html#t3 lands on template t3's
       card. If the active filters would hide that card, clear them
       first so the anchor always resolves to a visible card. */
    function goToHash() {
      var id = (location.hash || "").replace(/^#/, "");
      if (!id || !templateById(id)) return;
      var card = document.getElementById(id);
      if (!card) {
        els.q.value = "";
        ["track", "shotType", "movement", "lighting", "mood"].forEach(function (k) {
          els[k].value = "all";
        });
        render();
        card = document.getElementById(id);
      }
      if (card) card.scrollIntoView({ block: "start" });
    }
    window.addEventListener("hashchange", goToHash);
    goToHash();
  }).catch(function () {
    msg(els.error, "Could not load the prompt library data (prompt-templates.json / prompts-facets.json). The explorer needs the built site data.", false);
  });
})();
