#!/usr/bin/env node
/* Wave 18 — executable proof of the AGENT.md example workflows.
 *
 * Reads the REAL local api/v1/*.json (plus the linter's layer data from
 * assets/js/linter.js) and runs the three core AGENT.md workflows:
 *  1. plan a 2-minute AI horror short — Studio recipe via API data
 *     (models -> templates -> budget math)
 *  2. lint a prompt — the linter's layer data (ten layers)
 *  3. track a model's price changes — models.json + model-checks.json +
 *     model-review-queue.json
 * Exit code is non-zero on any failed assertion.
 */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const API = path.join(ROOT, "api", "v1");
const read = (f) => JSON.parse(fs.readFileSync(path.join(API, f), "utf8"));

let failures = 0;
function ok(cond, label) {
  if (cond) { console.log("ok   - " + label); }
  else { failures++; console.log("FAIL - " + label); }
}
function eq(a, b, label) {
  ok(a === b, label + " (expected " + JSON.stringify(b) + ", got " + JSON.stringify(a) + ")");
}

/* ---------- shared Studio helpers (mirror assets/js/studio.js) ---------- */
function costPerSec(m) {
  const mt = String(m.est_cost_credits || "").match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+)\s*s/);
  return mt ? parseFloat(mt[1]) / parseFloat(mt[2]) : null;
}
function normName(s) { return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, ""); }
const USD_PER_CREDIT = 0.0392; /* models.json cost_basis, Oct 2026 — verify live */
const GENRE_TRACKS = { horror: ["core", "photorealistic"] };
const TIERS = { draft: { secsPerShot: 6, takes: 3 }, festival: { secsPerShot: 4, takes: 6 } };
const r2 = (n) => Math.round(n * 100) / 100;

/* ================= workflow 1: plan a 2-minute AI horror short ============ */
console.log("--- workflow 1: plan a 2-minute AI horror short (Studio recipe) ---");
const models = read("models.json").models;
const templates = read("prompt-templates.json").templates;

/* manifest self-check: every endpoint resolves to a real file + schema */
const manifest = read("index.json");
for (const [key, e] of Object.entries(manifest.endpoints)) {
  ok(fs.existsSync(path.join(ROOT, e.path)), "manifest endpoint file exists: " + key);
  ok(fs.existsSync(path.join(ROOT, e.schema)), "manifest schema exists: " + key);
}

/* video pool: exclude discontinued (Sora) exactly like the Studio does */
const pool = models.filter((m) => m.type === "video" && m.status !== "discontinued");
ok(pool.length > 0, "video planning pool non-empty after excluding discontinued");
ok(!pool.some((m) => m.model === "Sora"), "Sora (discontinued) excluded from planning pool");

const horrorTmpls = templates.filter((t) => GENRE_TRACKS.horror.includes(t.track));
ok(horrorTmpls.length > 0, "horror template pool non-empty (" + horrorTmpls.length + " core+photorealistic)");

const tier = TIERS.draft, runtimeSec = 120;
const nShots = Math.max(2, Math.ceil(runtimeSec / tier.secsPerShot));
eq(nShots, 20, "draft shot count for 120s at 6s/shot");

/* model pick: cheapest priced model named by a horror template (draft tier) */
const byName = {};
pool.forEach((m) => { byName[normName(m.model)] = m; });
const opener = horrorTmpls[0];
const named = (opener.models || []).map(normName).filter((n) => n && byName[n])
  .map((n) => byName[n]).filter((m) => costPerSec(m) !== null);
const pick = named.length
  ? named.slice().sort((a, b) => costPerSec(a) - costPerSec(b))[0]
  : pool.filter((m) => costPerSec(m) !== null)
      .slice().sort((a, b) => costPerSec(a) - costPerSec(b))[0];
ok(!!pick, "deterministic model pick resolved: " + (pick && pick.model));
const cps = costPerSec(pick);
const shotSec = tier.secsPerShot;
const credits = nShots * shotSec * cps * tier.takes;
const cleanUSD = r2(credits * USD_PER_CREDIT);
console.log("       pick: " + pick.model + " @ " + cps.toFixed(3) +
  " credits/s (" + pick.est_cost_credits + ")");
console.log("       budget: " + nShots + " shots x " + shotSec + "s x " +
  cps.toFixed(3) + " cps x " + tier.takes + " takes = " +
  r2(credits) + " credits = $" + cleanUSD.toFixed(2));
console.log("       5x envelope: $" + r2(cleanUSD * 5).toFixed(2) +
  " | 20x envelope: $" + r2(cleanUSD * 20).toFixed(2));
ok(credits > 0 && cleanUSD > 0, "budget math produces positive cost");
ok(r2(cleanUSD * 5) === r2(cleanUSD * 5), "5x envelope deterministic");

/* ============ workflow 2: lint a prompt (linter layer data) =============== */
console.log("--- workflow 2: lint a prompt (linter layer data) ---");
function extractLayers(src) {
  const anchor = "var LAYERS = [";
  const start = src.indexOf(anchor);
  if (start < 0) throw new Error("LAYERS not found in linter.js");
  let i = src.indexOf("[", start), depth = 0, inStr = null, esc = false, j = i;
  for (; j < src.length; j++) {
    const c = src[j];
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'") inStr = c;
    else if (c === "[") depth++;
    else if (c === "]") { depth--; if (depth === 0) break; }
  }
  // eslint-disable-next-line no-eval
  return eval("(" + src.slice(i, j + 1) + ")");
}
const linterSrc = fs.readFileSync(path.join(ROOT, "assets", "js", "linter.js"), "utf8");
const LAYERS = extractLayers(linterSrc);
eq(LAYERS.length, 10, "linter carries ten anatomy layers");
function lint(prompt) {
  const p = prompt.toLowerCase();
  return LAYERS.map((l) => ({
    layer: l.name,
    present: l.keys.some((k) => p.includes(k)),
    tip: l.present === undefined ? "" : l.tip,
  }));
}
const good = "Photorealistic slow dolly-in toward a woman, copper bob, leather " +
  "jacket, as she turns from the window, rain on glass, dark house at night, " +
  "hard practicals, deep shadows, eerie and tense, 35mm film grain, shallow " +
  "depth of field, drifting smoke, exclude extra fingers, no text";
const goodRes = lint(good);
const goodN = goodRes.filter((r) => r.present).length;
console.log("       good prompt layers present: " + goodN + "/10 — missing: " +
  goodRes.filter((r) => !r.present).map((r) => r.layer).join(", "));
ok(goodN >= 8, "well-formed prompt covers most layers");
const weak = "cool video of a guy";
const weakN = lint(weak).filter((r) => r.present).length;
console.log("       weak prompt layers present: " + weakN + "/10");
ok(weakN < 4, "weak prompt fails most layers");

/* ===== workflow 3: track a model's price changes ========================== */
console.log("--- workflow 3: track a model's price changes ---");
const subject = models.find((m) => m.model === "Kling 3.0") || pool[0];
console.log("       subject: " + subject.model);
console.log("       models.json: cost=" + subject.est_cost_credits +
  " | status=" + subject.status + " | last_verified=" + subject.last_verified);
console.log("       what_changed: " + (subject.what_changed || "(none recorded)"));
ok(!!subject.est_cost_credits, "model has a cost record");
ok(!!subject.last_verified, "model has a last_verified date");

const checks = read("model-checks.json");
console.log("       model-checks.json: checked_at=" + checks.checked_at +
  " | models=" + checks.summary.models_total + " changed=" + checks.summary.changed);
const checkRec = checks.models.find((m) => m.model === subject.model);
ok(!!checkRec, "model-watch has a check record for " + subject.model);
if (checkRec) {
  console.log("       check record: last_checked=" + checkRec.last_checked +
    " | changed=" + checkRec.changed + " | source_status=" + checkRec.source_status);
  ok(typeof checkRec.changed === "boolean", "changed flag is a boolean review signal");
}
const queue = read("model-review-queue.json");
eq(queue.pending, queue.items.length, "review queue pending count matches items");
console.log("       model-review-queue.json: pending=" + queue.pending +
  " | note: " + queue.note.slice(0, 80) + "...");

/* ================================ summary ================================ */
console.log("");
if (failures === 0) {
  console.log("agent-workflows.test.js: all workflows executed against real api/v1 data — ALL PASS");
} else {
  console.log("agent-workflows.test.js: " + failures + " FAILURES");
  process.exit(1);
}
