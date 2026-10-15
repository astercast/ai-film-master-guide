/* Chapter index filter (2026-10-15 rebuild). The chapters page is
   fully readable without this script: every record line is in the
   static HTML. The filter only narrows what is on screen as the
   visitor types, hiding shelf groups that end up empty and keeping
   a live count of what is showing. */
(function () {
  "use strict";
  var input = document.getElementById("chapters-filter");
  if (!input) return;
  var lines = Array.prototype.slice.call(document.querySelectorAll(".shelf-line"));
  var groups = Array.prototype.slice.call(document.querySelectorAll(".shelf-group"));
  var count = document.getElementById("chapters-count");
  var none = document.getElementById("chapters-none");
  var total = lines.length;
  function run() {
    var q = input.value.trim().toLowerCase();
    var shown = 0;
    lines.forEach(function (li) {
      var hit = !q || li.textContent.toLowerCase().indexOf(q) !== -1;
      li.hidden = !hit;
      if (hit) shown += 1;
    });
    groups.forEach(function (g) {
      var any = Array.prototype.some.call(g.querySelectorAll(".shelf-line"), function (li) {
        return !li.hidden;
      });
      g.hidden = !any;
    });
    if (count) count.textContent = shown + " of " + total + " chapters";
    if (none) none.hidden = shown !== 0;
  }
  input.addEventListener("input", run);
})();
