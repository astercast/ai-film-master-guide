/* Chapter-page enhancements: reading progress, TOC scroll-spy, code copy buttons, back-to-top. */
(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Reading progress bar */
  var progress = document.querySelector(".progress-bar span");
  if (progress) {
    var ticking = false;
    var update = function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var p = max > 0 ? h.scrollTop / max : 0;
      progress.style.transform = "scaleX(" + p.toFixed(4) + ")";
      ticking = false;
    };
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* TOC scroll-spy */
  var tocLinks = Array.prototype.slice.call(document.querySelectorAll(".docs-toc a[href^='#']"));
  if (tocLinks.length && "IntersectionObserver" in window) {
    var byId = {};
    tocLinks.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
    var current = null;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var link = byId[e.target.id];
          if (link && link !== current) {
            if (current) current.classList.remove("active");
            link.classList.add("active");
            current = link;
          }
        }
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    Object.keys(byId).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) obs.observe(el);
    });
  }

  /* Copy buttons on code blocks */
  document.querySelectorAll(".prose pre").forEach(function (pre) {
    if (pre.querySelector(".copy-btn")) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "copy-btn";
    btn.textContent = "Copy";
    btn.setAttribute("aria-label", "Copy code block to clipboard");
    btn.addEventListener("click", function () {
      var code = pre.querySelector("code");
      var text = code ? code.innerText : pre.innerText;
      var done = function (ok) {
        btn.textContent = ok ? "Copied" : "Failed";
        btn.classList.toggle("ok", ok);
        setTimeout(function () { btn.textContent = "Copy"; btn.classList.remove("ok"); }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
      } else {
        var ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try { done(document.execCommand("copy")); } catch (e) { done(false); }
        document.body.removeChild(ta);
      }
    });
    pre.appendChild(btn);
  });

  /* Back to top */
  var toTop = document.querySelector(".back-to-top");
  if (toTop) {
    window.addEventListener("scroll", function () {
      toTop.classList.toggle("show", window.scrollY > 900);
    }, { passive: true });
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }
})();
