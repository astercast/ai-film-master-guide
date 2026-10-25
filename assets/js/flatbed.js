/* flatbed.js: drag, swipe or use arrow keys. No scroll hijack: vertical swipes still scroll the page. */
const gate = document.querySelector(".fb-gate");
if (gate) {
  const strip = gate.querySelector(".fb-strip"), frames = [...strip.children], tc = gate.querySelector(".fb-tc");
  const last = frames.length - 1, calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let pos = 0, target = 0, dragging = false, startX = 0, startPos = 0, raf = 0;
  const step = () => frames[0].offsetWidth + 14;
  const draw = () => {
    strip.style.transform = `translateX(${gate.clientWidth / 2 - (pos + .5) * step()}px)`;
    frames.forEach((li, i) => li.style.setProperty("--d", Math.min(1.6, Math.abs(i - pos)).toFixed(3)));
    const s = Math.floor(pos), f = Math.round((pos - s) * 24) % 24, pad = (n) => String(n).padStart(2, "0");
    if (tc) tc.textContent = `00:00:${pad(s)}:${pad(f)}`;
    gate.setAttribute("aria-valuenow", Math.round(pos));
  };
  const tick = () => { pos += (target - pos) * (calm ? 1 : .16); if (Math.abs(target - pos) < .002) pos = target; draw(); raf = pos === target ? 0 : requestAnimationFrame(tick); };
  const go = (t) => { target = Math.max(0, Math.min(last, t)); if (!raf) raf = requestAnimationFrame(tick); };
  gate.addEventListener("pointerdown", (e) => { dragging = true; startX = e.clientX; startPos = target; gate.setPointerCapture(e.pointerId); });
  gate.addEventListener("pointermove", (e) => { if (dragging) go(startPos - (e.clientX - startX) / step()); });
  const end = () => { if (dragging) { dragging = false; go(Math.round(target)); } };
  gate.addEventListener("pointerup", end); gate.addEventListener("pointercancel", end);
  gate.addEventListener("keydown", (e) => { const k = { ArrowRight: 1, ArrowLeft: -1, Home: -99, End: 99 }[e.key]; if (k) { e.preventDefault(); go(Math.round(target) + k); } });
  addEventListener("resize", draw);
  /* it plays itself once so the visitor learns it moves, then stops when touched */
  if (!calm) { let n = 0; const auto = setInterval(() => { if (dragging || ++n > 5) return clearInterval(auto); go(n); }, 900); gate.addEventListener("pointerdown", () => clearInterval(auto), { once: true }); }
  draw();
}
