/* Style-bible builder — compose a reusable STYLE LOCK block for a production.
   Named bibles live in localStorage under afg-style-bibles; the prompt workshop
   (workshop.js) can prepend any saved bible to filled prompts. */
(function () {
  "use strict";

  var BIBLE_KEY = "afg-style-bibles";
  var EXPORT_VERSION = 1;

  function $(id) { return document.getElementById(id); }

  var els = {
    form: $("sb-form"),
    name: $("sb-name"),
    charName: $("sb-char-name"),
    charAge: $("sb-char-age"),
    charFace: $("sb-char-face"),
    charHair: $("sb-char-hair"),
    charWardrobe: $("sb-char-wardrobe"),
    charBuild: $("sb-char-build"),
    worldEra: $("sb-world-era"),
    worldPalette: $("sb-world-palette"),
    worldLight: $("sb-world-light"),
    worldLens: $("sb-world-lens"),
    worldTexture: $("sb-world-texture"),
    worldMood: $("sb-world-mood"),
    recurring: $("sb-recurring"),
    never: $("sb-never"),
    preview: $("sb-preview"),
    previewEmpty: $("sb-preview-empty"),
    copy: $("sb-copy"),
    save: $("sb-save"),
    error: $("sb-error"),
    savedList: $("sb-saved"),
    savedEmpty: $("sb-saved-empty"),
    exportBtn: $("sb-export"),
    importFile: $("sb-import-file"),
    openWorkshop: $("sb-open-workshop")
  };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function loadBibles() {
    try {
      var raw = JSON.parse(localStorage.getItem(BIBLE_KEY) || "[]");
      return Array.isArray(raw) ? raw : [];
    } catch (e) { return []; }
  }

  function persistBibles(list) {
    try { localStorage.setItem(BIBLE_KEY, JSON.stringify(list)); }
    catch (e) { showError("Could not save — browser storage is unavailable or full."); }
  }

  function showError(msg) {
    els.error.textContent = msg;
    els.error.hidden = false;
  }

  function clearError() { els.error.hidden = true; }

  function val(el) { return (el.value || "").trim(); }

  function lines(text) {
    return text.split(/\n+/).map(function (l) { return l.trim(); }).filter(Boolean);
  }

  /* ---------- build the STYLE LOCK block ---------- */

  function buildBlock() {
    var name = val(els.name) || "UNTITLED PRODUCTION";
    var charBits = [];
    var cn = val(els.charName);
    if (cn) charBits.push(cn);
    ["charAge", "charFace", "charHair", "charWardrobe", "charBuild"].forEach(function (k) {
      var v = val(els[k]);
      if (v) charBits.push(v);
    });
    var worldBits = [];
    ["worldEra", "worldPalette", "worldLight", "worldLens", "worldTexture", "worldMood"].forEach(function (k) {
      var v = val(els[k]);
      if (v) worldBits.push(v);
    });
    var rec = lines(val(els.recurring));
    var nev = lines(val(els.never));

    var out = [];
    out.push("STYLE LOCK \u2014 " + name.toUpperCase());
    if (charBits.length) out.push("CHARACTER \u2014 " + charBits.join("; ") + ".");
    if (worldBits.length) out.push("WORLD \u2014 " + worldBits.join("; ") + ".");
    if (rec.length) out.push("RECURRING \u2014 " + rec.join("; ") + ".");
    if (nev.length) out.push("NEVER \u2014 " + nev.join("; ") + ".");
    out.push("RULE \u2014 Prepend this block verbatim to every generation prompt in this production. Do not paraphrase it. If the model drifts, regenerate the shot \u2014 do not rewrite the lock.");
    return out.join("\n");
  }

  function hasContent() {
    return ["charName", "charAge", "charFace", "charHair", "charWardrobe", "charBuild",
      "worldEra", "worldPalette", "worldLight", "worldLens", "worldTexture", "worldMood",
      "recurring", "never"].some(function (k) { return !!val(els[k]); });
  }

  function renderPreview() {
    clearError();
    if (!hasContent()) {
      els.preview.textContent = "";
      els.previewEmpty.hidden = false;
      els.copy.disabled = true;
      els.save.disabled = true;
      return;
    }
    els.preview.textContent = buildBlock();
    els.previewEmpty.hidden = true;
    els.copy.disabled = false;
    els.save.disabled = false;
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

  function flash(btn, label, okLabel) {
    var orig = btn.textContent;
    btn.textContent = okLabel;
    btn.classList.add("ok");
    setTimeout(function () { btn.textContent = label; btn.classList.remove("ok"); }, 1600);
  }

  els.copy.addEventListener("click", function () {
    if (els.copy.disabled) return;
    copyText(buildBlock(), function (ok) {
      flash(els.copy, "Copy style lock", ok ? "Copied" : "Copy failed");
    });
  });

  /* ---------- saved bibles ---------- */

  function renderSaved() {
    var bibles = loadBibles();
    els.savedEmpty.hidden = bibles.length > 0;
    els.savedList.innerHTML = bibles.map(function (b) {
      return '<article class="card save-card" data-bible="' + esc(b.id) + '">' +
        "<h3>" + esc(b.name) + "</h3>" +
        '<p class="save-meta">updated ' + esc(b.updatedAt || "") + "</p>" +
        '<pre class="save-text bible-text">' + esc(b.text) + "</pre>" +
        '<div class="btn-row save-actions">' +
        '<button type="button" class="btn btn-sm" data-act="load">Load</button>' +
        '<button type="button" class="btn btn-sm btn-ghost" data-act="copy">Copy</button>' +
        '<button type="button" class="btn btn-sm btn-ghost" data-act="del">Delete</button>' +
        "</div></article>";
    }).join("");
  }

  els.save.addEventListener("click", function () {
    if (els.save.disabled) return;
    var name = val(els.name);
    if (!name) {
      showError("Give this bible a production name before saving (top of the form).");
      els.name.focus();
      return;
    }
    var bibles = loadBibles();
    var text = buildBlock();
    var now = new Date().toISOString().slice(0, 10);
    var existing = null;
    bibles.forEach(function (b) { if (b.name === name) existing = b; });
    if (existing) {
      existing.text = text;
      existing.updatedAt = now;
    } else {
      bibles.unshift({ id: "b" + Date.now(), name: name, text: text, updatedAt: now });
    }
    persistBibles(bibles);
    renderSaved();
    flash(els.save, "Save style bible", "Saved");
  });

  els.savedList.addEventListener("click", function (ev) {
    var btn = ev.target.closest("button[data-act]");
    if (!btn) return;
    var card = btn.closest("[data-bible]");
    var id = card.getAttribute("data-bible");
    var bibles = loadBibles();
    var bible = null;
    bibles.forEach(function (b) { if (b.id === id) bible = b; });
    if (!bible) return;
    var act = btn.getAttribute("data-act");
    if (act === "copy") {
      copyText(bible.text, function (ok) { flash(btn, "Copy", ok ? "Copied" : "Failed"); });
    } else if (act === "del") {
      persistBibles(bibles.filter(function (b) { return b.id !== id; }));
      renderSaved();
    } else if (act === "load") {
      /* Loading restores the name and scrolls to the form; field-level
         round-trip is intentionally not attempted (the block is the artifact). */
      els.name.value = bible.name;
      renderPreview();
      els.form.scrollIntoView({ behavior: "smooth", block: "start" });
      try { els.name.focus({ preventScroll: true }); } catch (e) { /* older browsers */ }
    }
  });

  /* ---------- export / import ---------- */

  els.exportBtn.addEventListener("click", function () {
    var payload = { version: EXPORT_VERSION, exportedAt: new Date().toISOString().slice(0, 10), bibles: loadBibles() };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "style-bibles.json";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  });

  els.importFile.addEventListener("change", function () {
    var f = els.importFile.files && els.importFile.files[0];
    if (!f) return;
    var r = new FileReader();
    r.onload = function () {
      try {
        var data = JSON.parse(r.result);
        var incoming = Array.isArray(data) ? data : data.bibles;
        if (!Array.isArray(incoming)) throw new Error("bad file");
        var bibles = loadBibles();
        var seen = {};
        bibles.forEach(function (b) { seen[b.id] = true; });
        var added = 0;
        incoming.forEach(function (b) {
          if (b && b.name && b.text && !seen[b.id]) {
            bibles.push({ id: String(b.id || ("b" + Date.now() + added)), name: String(b.name), text: String(b.text), updatedAt: String(b.updatedAt || "") });
            added++;
          }
        });
        persistBibles(bibles);
        renderSaved();
        showError(""); /* clear */
        els.error.hidden = true;
      } catch (e) {
        showError("That file is not a valid style-bible export.");
      }
      els.importFile.value = "";
    };
    r.readAsText(f);
  });

  /* ---------- live preview ---------- */

  els.form.addEventListener("input", renderPreview);
  els.openWorkshop.addEventListener("click", function () {
    /* The workshop picks up saved bibles automatically; remind the user. */
    if (!loadBibles().length && hasContent()) {
      showError("Tip: save this bible first (above) \u2014 the workshop's style-bible menu lists your saved bibles.");
    }
  });

  renderPreview();
  renderSaved();
})();
