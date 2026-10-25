/* pulse.js: the page quietly checks for newer data and says so. No reload, no popup.
   Needs: <meta name="built" content="2026-10-24T12:00:00Z"> in <head> (the build writes it)
          <script type="module" src="/assets/js/pulse.js"></script> on every page.
   Pages that draw data listen for the event:  addEventListener("pulse:update", e => redraw(e.detail)) */
const built = document.querySelector('meta[name="built"]')?.content || "";
const EVERY = 5 * 60 * 1000;
let shown = "", timer;
const ago = (iso) => { const m = Math.max(0, (Date.now() - Date.parse(iso)) / 60000);
  return m < 2 ? "just now" : m < 90 ? Math.round(m) + " minutes ago" : m < 2880 ? Math.round(m / 60) + " hours ago" : Math.round(m / 1440) + " days ago"; };
function bar(p) {
  let el = document.querySelector(".pulse");
  if (!el) { el = document.createElement("aside"); el.className = "pulse"; el.setAttribute("role", "status");
    document.body.append(el); }
  const n = p.changes.filter((c) => Date.parse(c.at) > Date.parse(built || 0)).length;
  el.innerHTML = `<span class="pulse-dot" aria-hidden="true"></span><span>Updated ${ago(p.generated_at)}${n ? `, ${n} new` : ""}</span>` +
    (n ? ` <button type="button">Show</button>` : "") + (p.healthy ? "" : ` <span class="pulse-warn">${p.sources_total - p.sources_ok} source${p.sources_total - p.sources_ok > 1 ? "s" : ""} not answering, showing last good data</span>`);
  el.querySelector("button")?.addEventListener("click", () => { dispatchEvent(new CustomEvent("pulse:update", { detail: p })); el.querySelector("button").remove(); });
}
async function check() {
  try {
    const r = await fetch("/data/v1/pulse.json", { cache: "no-store" });
    if (!r.ok) return;
    const p = await r.json();
    if (p.generated_at !== shown) { shown = p.generated_at; bar(p); }
  } catch { /* offline: say nothing, keep what is on screen */ }
}
const loop = () => { clearTimeout(timer); if (!document.hidden) { check(); timer = setTimeout(loop, EVERY); } };
document.addEventListener("visibilitychange", loop); loop();
