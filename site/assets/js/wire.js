/* wire.js: The Wire filters + the "Since you were last here" panel.
   The list is server-rendered from data/v1/wire.json; this file only
   filters it in place and renders the since panel from the same data
   file, filtered to the visitor's binder models (binder.js). */
(function () {
  "use strict";
  var modelSel = document.getElementById("wire-model");
  var labelSel = document.getElementById("wire-label");
  var rows = Array.prototype.slice.call(document.querySelectorAll(".wire-item"));
  var count = document.getElementById("wire-count");

  function apply() {
    var m = modelSel ? modelSel.value : "";
    var l = labelSel ? labelSel.value : "";
    var shown = 0;
    rows.forEach(function (r) {
      var ok = (!m || r.getAttribute("data-model") === m) &&
               (!l || r.getAttribute("data-label") === l);
      r.hidden = !ok;
      if (ok) shown += 1;
    });
    if (count) count.textContent = shown + " of " + rows.length + " items";
  }
  if (modelSel) modelSel.addEventListener("change", apply);
  if (labelSel) labelSel.addEventListener("change", apply);
  apply();

  /* Since panel (also used on the home page: [data-since] there). */
  var panel = document.querySelector("[data-since]");
  if (!panel || !window.AFGBinder) return;
  var s = window.AFGBinder.load();
  var prev = s.lastVisit;
  fetch("data/v1/wire.json", { cache: "no-store" })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (doc) {
      var list = panel.querySelector("[data-since-list]");
      var head = panel.querySelector("[data-since-head]");
      if (!doc || !list) return;
      var res = window.AFGBinder.sinceItems(s, doc.items || []);
      if (res.first) {
        if (head) head.textContent = "Since you were last here";
        list.innerHTML = "<li>First visit in this browser. Come back after the next heartbeat and new items land here" +
          (s.models.length ? ", filtered to your binder models." : ". Pick models in the Binder and this list narrows to them.") + "</li>";
      } else {
        if (head) head.textContent = "Since you were last here" + (res.filtered ? " (your binder models)" : "");
        if (!res.items.length) {
          list.innerHTML = "<li>Nothing new on the wire since " + new Date(prev).toLocaleString() + ".</li>";
        } else {
          list.innerHTML = res.items.slice(0, 8).map(function (i) {
            return "<li><span class=\"wire-label wire-label-" + String(i.label || "").toLowerCase() + "\">" +
              i.label + "</span> <strong>" + String(i.model || "") + "</strong> " +
              String(i.title || "").replace(/</g, "&lt;") + "</li>";
          }).join("");
        }
      }
      window.AFGBinder.markVisit(s);
    })
    .catch(function () { /* offline: the server-rendered wire still reads fine */ });
})();
