/* In-context glossary — wraps glossary terms in chapter prose with popover definitions.
   Loads glossary.json (copied into site/ at build). First occurrence per term per page only.
   Degrades silently if the JSON fails. */
(function () {
  "use strict";

  var prose = document.querySelector(".prose");
  if (!prose) return;

  /* Base path derived from our own script tag (../ on chapter pages). */
  var scriptSrc = "";
  try {
    var me = document.querySelector('script[src$="glossary.js"]');
    scriptSrc = me ? me.getAttribute("src") : "";
  } catch (e) { /* ignore */ }
  var base = scriptSrc.indexOf("../") === 0 ? "../" : "";

  var defs = null; /* term (lowercased) -> definition */

  function escRe(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /* ---------- popover ---------- */
  var pop = null, openBtn = null, hideTimer = null;

  function ensurePop() {
    if (pop) return pop;
    pop = document.createElement("div");
    pop.className = "gloss-pop";
    pop.id = "gloss-pop";
    pop.setAttribute("role", "tooltip");
    pop.hidden = true;
    document.body.appendChild(pop);
    return pop;
  }

  function show(btn) {
    var term = btn.getAttribute("data-term");
    var def = defs[term];
    if (!def) return;
    clearTimeout(hideTimer);
    var p = ensurePop();
    p.innerHTML = "";
    var strong = document.createElement("strong");
    strong.textContent = btn.textContent;
    var span = document.createElement("span");
    span.textContent = def;
    p.appendChild(strong);
    p.appendChild(document.createTextNode(" — "));
    p.appendChild(span);
    btn.setAttribute("aria-describedby", "gloss-pop");
    btn.setAttribute("aria-expanded", "true");
    p.hidden = false;
    openBtn = btn;
    /* position: below the button, clamped to viewport */
    var r = btn.getBoundingClientRect();
    var top = r.bottom + window.scrollY + 8;
    var left = Math.min(
      Math.max(8, r.left + window.scrollX),
      Math.max(8, document.documentElement.clientWidth - 320)
    );
    p.style.top = top + "px";
    p.style.left = left + "px";
  }

  function hide() {
    if (!pop || pop.hidden) return;
    pop.hidden = true;
    if (openBtn) {
      openBtn.setAttribute("aria-expanded", "false");
      openBtn.removeAttribute("aria-describedby");
      openBtn = null;
    }
  }

  function scheduleHide() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hide, 180);
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && openBtn) {
      var b = openBtn;
      hide();
      b.focus();
    }
  });
  document.addEventListener("click", function (e) {
    if (openBtn && !openBtn.contains(e.target) && !pop.contains(e.target)) hide();
  }, true);
  window.addEventListener("scroll", hide, { passive: true });
  window.addEventListener("resize", hide);

  /* ---------- term wrapping ---------- */
  var SKIP = { PRE: 1, CODE: 1, A: 1, BUTTON: 1, SCRIPT: 1, STYLE: 1,
               H1: 1, H2: 1, H3: 1, H4: 1, H5: 1, H6: 1, TEXTAREA: 1, SELECT: 1 };

  function skippable(node) {
    var el = node.parentElement;
    while (el && el !== prose) {
      if (SKIP[el.tagName] || (el.classList && el.classList.contains("gloss-term"))) return true;
      el = el.parentElement;
    }
    return false;
  }

  function wrapTerms() {
    var terms = Object.keys(defs).sort(function (a, b) { return b.length - a.length; });
    if (!terms.length) return;
    var pattern = terms.map(escRe).join("|");
    var re = new RegExp("(?<![A-Za-z0-9])(" + pattern + ")(?![A-Za-z0-9])", "gi");
    var seen = {};

    var walker = document.createTreeWalker(prose, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        if (skippable(node)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    var nodes = [];
    var n;
    while ((n = walker.nextNode())) nodes.push(n);

    nodes.forEach(function (textNode) {
      /* re-test per node: skip terms already wrapped elsewhere */
      var frag = document.createDocumentFragment();
      var last = 0, m, changed = false;
      re.lastIndex = 0;
      var text = textNode.nodeValue;
      while ((m = re.exec(text)) !== null) {
        var key = m[1].toLowerCase();
        if (seen[key]) continue;
        seen[key] = true;
        changed = true;
        frag.appendChild(document.createTextNode(text.slice(last, m.index)));
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "gloss-term";
        btn.setAttribute("data-term", key);
        btn.setAttribute("aria-expanded", "false");
        btn.textContent = m[1];
        frag.appendChild(btn);
        last = m.index + m[1].length;
      }
      if (changed) {
        frag.appendChild(document.createTextNode(text.slice(last)));
        textNode.parentNode.replaceChild(frag, textNode);
      }
    });

    /* wire events (delegated) */
    prose.addEventListener("mouseover", function (e) {
      var b = e.target.closest ? e.target.closest(".gloss-term") : null;
      if (b && prose.contains(b)) show(b);
    });
    prose.addEventListener("mouseout", function (e) {
      var b = e.target.closest ? e.target.closest(".gloss-term") : null;
      if (b && openBtn === b) scheduleHide();
    });
    prose.addEventListener("focusin", function (e) {
      var b = e.target.closest ? e.target.closest(".gloss-term") : null;
      if (b && prose.contains(b)) show(b);
    });
    prose.addEventListener("focusout", function (e) {
      if (openBtn && !prose.contains(document.activeElement)) scheduleHide();
    });
    prose.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest(".gloss-term") : null;
      if (!b || !prose.contains(b)) return;
      if (openBtn === b) { hide(); } else { show(b); }
    });
    /* keep popover alive while hovering it */
    document.addEventListener("mouseover", function (e) {
      if (pop && !pop.hidden && pop.contains(e.target)) clearTimeout(hideTimer);
    });
    document.addEventListener("mouseout", function (e) {
      if (pop && !pop.hidden && pop.contains(e.target)) scheduleHide();
    });
  }

  fetch(base + "glossary.json")
    .then(function (r) { if (!r.ok) throw new Error("glossary failed"); return r.json(); })
    .then(function (data) {
      var terms = (data && data.terms) || [];
      defs = {};
      terms.forEach(function (t) {
        if (t.term && t.definition) defs[String(t.term).toLowerCase()] = String(t.definition);
      });
      if (Object.keys(defs).length) wrapTerms();
    })
    .catch(function () { /* degrade silently — prose stays plain */ });
})();
