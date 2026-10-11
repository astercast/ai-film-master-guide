/* Recipes filter — shows/hides server-rendered recipe cards. */
(function () {
  "use strict";
  var input = document.getElementById("recipes-filter");
  var list = document.getElementById("recipes-list");
  var empty = document.getElementById("recipes-empty");
  var count = document.getElementById("recipes-count");
  if (!input || !list) return;
  var cards = Array.prototype.slice.call(list.querySelectorAll(".recipe-card"));
  var total = cards.length;
  function render() {
    var q = input.value.trim().toLowerCase();
    var shown = 0;
    cards.forEach(function (card) {
      var hit = !q || (card.getAttribute("data-search") || "").toLowerCase().indexOf(q) !== -1;
      card.hidden = !hit;
      if (hit) shown += 1;
    });
    if (empty) empty.hidden = shown > 0;
    if (count) count.textContent = shown + " of " + total + " recipes";
  }
  input.addEventListener("input", render);
  render();
})();
