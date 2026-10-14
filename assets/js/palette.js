/* Command palette, Ctrl/Cmd+K fuzzy search across the guide.
   Loads site/search-index.json (or ../search-index.json on chapter pages). */
(function () {
  const palette = document.getElementById("palette");
  const input = document.getElementById("palette-input");
  const results = document.getElementById("palette-results");
  const openers = document.querySelectorAll(".palette-open");
  if (!palette || !input) return;

  let index = null;
  let selected = 0;
  const base = location.pathname.includes("/site/") ? "" : "";
  const indexUrl = document.querySelector('script[src$="palette.js"]').src.includes("/site/")
    ? "search-index.json"
    : null;

  async function loadIndex() {
    if (index) return index;
    // chapter pages live at site/<section>/; landing at site/
    const depth = location.pathname.split("/").filter(Boolean).length;
    const url = depth >= 3 ? "../search-index.json" : "search-index.json";
    try {
      const res = await fetch(url);
      index = await res.json();
    } catch (e) {
      index = [];
    }
    return index;
  }

  function open() {
    palette.hidden = false;
    input.value = "";
    results.innerHTML = "";
    selected = 0;
    loadIndex().then(() => render(""));
    input.focus();
  }
  function close() { palette.hidden = true; }

  function score(item, q) {
    const hay = (item.title + " " + item.section + " " + item.headings.join(" ") + " " + item.text).toLowerCase();
    let s = 0, pos = 0;
    for (const ch of q) {
      const i = hay.indexOf(ch, pos);
      if (i < 0) return -1;
      s += 1 / (i + 1);
      pos = i + 1;
    }
    if (item.title.toLowerCase().includes(q)) s += 5;
    return s;
  }

  function snippet(item, q) {
    const t = item.text.toLowerCase();
    const i = t.indexOf(q);
    if (i < 0) return item.headings.slice(0, 3).join(" · ");
    const start = Math.max(0, i - 60);
    return "…" + item.text.slice(start, start + 140).trim() + "…";
  }

  function chapterUrl(url) {
    const depth = location.pathname.split("/").filter(Boolean).length;
    return depth >= 3 ? "../" + url : url;
  }

  function render(q) {
    q = q.trim().toLowerCase();
    const items = (index || [])
      .map((item) => ({ item, s: q ? score(item, q) : 1 }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 9);
    results.innerHTML = "";
    selected = Math.min(selected, Math.max(0, items.length - 1));
    if (!items.length) {
      results.innerHTML = '<div style="padding:var(--space-4) var(--space-5);color:var(--muted);">No matches. Try "prompt", "Soul ID", "festival", "credits".</div>';
      return;
    }
    items.forEach(({ item }, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("role", "option");
      b.setAttribute("aria-selected", String(i === selected));
      b.innerHTML = `<div class="r-title"></div><div class="r-meta"></div><div class="r-snippet"></div>`;
      b.querySelector(".r-title").textContent = item.title;
      b.querySelector(".r-meta").textContent = item.section;
      b.querySelector(".r-snippet").textContent = q ? snippet(item, q) : item.headings.slice(0, 3).join(" · ");
      b.addEventListener("click", () => { location.href = chapterUrl(item.url); });
      b.addEventListener("mousemove", () => { selected = i; paint(); });
      results.appendChild(b);
    });
  }

  function paint() {
    [...results.children].forEach((b, i) => b.setAttribute("aria-selected", String(i === selected)));
  }

  function go() {
    const b = results.children[selected];
    if (b) b.click();
  }

  let debounce;
  input.addEventListener("input", () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => { selected = 0; render(input.value); }, 120);
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); selected = Math.min(selected + 1, results.children.length - 1); paint(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); selected = Math.max(selected - 1, 0); paint(); }
    else if (e.key === "Enter") { go(); }
    else if (e.key === "Escape") { close(); }
  });

  openers.forEach((b) => b.addEventListener("click", open));
  palette.addEventListener("click", (e) => { if (e.target === palette) close(); });
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); palette.hidden ? open() : close(); }
    else if (e.key === "Escape" && !palette.hidden) { close(); }
  });
})();
