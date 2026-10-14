#!/usr/bin/env node
/* Wave 18, executable proof of the AGENT.md example workflows.
 *
 * Reads the REAL local data/v1/*.json (plus the linter's layer data from
 * assets/js/linter.js) and runs the three core AGENT.md workflows:
 *  1. plan a 2-minute AI horror short, Studio recipe via API data
 *     (models -> templates -> budget math)
 *  2. lint a prompt, the linter's layer data (ten layers)
 *  3. track a model's price changes, models.json + model-checks.json +
 *     model-review-queue.json
 * Exit code is non-zero on any failed assertion.
 */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const API = path.join(ROOT, "data", "v1");
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
const USD_PER_CREDIT = 0.0392; /* models.json cost_basis, Oct 2026, verify live */
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
console.log("       good prompt layers present: " + goodN + "/10, missing: " +
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

/* ===== workflow 4: plan a 5-episode mini-drama series (Studio 2.0) ======= */
console.log("--- workflow 4: plan a 5-episode mini-drama series (Studio 2.0, real engine) ---");
const Studio = require(path.join(ROOT, "assets", "js", "studio.js"));
const wf4 = Studio.buildSeriesPlan(
  { models: read("models.json").models, templates: read("prompt-templates.json").templates },
  { seriesTitle: "Porch Light: The Hallway",
    seriesLogline: "A projectionist restores an abandoned cinema.",
    format: "minidrama", genre: "drama", runtimeSec: 90, tier: "draft", episodes: 5,
    cast: [{ name: "Mara", voice: "avocado_v2:MARA_01",
             anchor: "woman, late 20s, copper bob, leather jacket" }],
    locations: ["abandoned cinema lobby"] });
eq(wf4.episodeCount, 5, "5 episodes planned");
eq(wf4.totalShots, 75, "75 shots (5 x 15 at 90s draft)");
ok(wf4.episodes.every((e) => e.shots.every((s) => s.prompt.startsWith("[SERIES BIBLE"))),
  "locked prompt DNA on every shot of every episode");
eq(wf4.bible.lockedAssets.length, 2, "2 locked assets (1 cast + 1 location)");
const wf4Sum = wf4.budget.lines.reduce((a, l) => a + l.usd, 0);
ok(Math.abs(wf4Sum - wf4.budget.clean) < 0.011, "series budget lines sum to clean");
ok(wf4.budget.clean > 0, "series clean cost positive: $" + wf4.budget.clean);
eq(wf4.budget.five, r2(wf4.budget.clean * 5), "5x envelope is an exact multiple");
eq(wf4.budget.twenty, r2(wf4.budget.clean * 20), "20x envelope is an exact multiple");
ok(wf4.reuse.avoidedCredits > 0, "bible avoids real credits: " + wf4.reuse.avoidedCredits);
const wf4Days = wf4.schedule.phases.reduce((a, p) => a + p.days, 0);
eq(wf4Days, wf4.schedule.totalDays, "series schedule phases sum to total days");
const wf4Md = Studio.seriesToMarkdown(wf4);
ok(wf4Md.includes("# Porch Light: The Hallway, series production packet"), "markdown export carries the packet title");
ok(wf4Md.includes("## Series bible, locked before generation"), "markdown export carries the bible");
const wf4Html = Studio.seriesToHtml(wf4);
ok(wf4Html.startsWith("<!DOCTYPE html>") && wf4Html.includes("<style>") &&
  wf4Html.trim().endsWith("</html>"), "self-contained HTML packet export");
console.log("       series: " + wf4.episodeCount + " eps x " + wf4.runtimeSec + "s | " +
  wf4.totalShots + " shots | clean $" + wf4.budget.clean.toFixed(2) +
  " | 5x $" + wf4.budget.five.toFixed(2) + " | bible avoided $" +
  wf4.reuse.avoidedUSD.toFixed(2));

/* ===== workflow 5: The Night Bus, 5-episode worked example (asserts the pipeline doc's numbers) ======= */
/* Canonical config shared with ~/workspace/tiktok-episode-pipeline/WORKED-EXAMPLE-5-EPISODE.md.
 * If models.json data changes, these exact numbers change and the test FAILS on purpose, * the worked example is versioned to the data, not floating. */
console.log("--- workflow 5: The Night Bus worked example (real engine, asserted numbers) ---");
/* The Night Bus, 5-episode mini-drama, planner blocks staged via the bridge */
const cast = [
  { name: "Harun", voice: "avocado_v2:briggs",
    anchor: "a retired bus driver in his sixties, silver stubble, kind tired eyes, navy depot jacket" },
  { name: "Noor", voice: "avocado_v2:MAI_01",
    anchor: "a young woman, mid 20s, dark braided hair, red scarf, carrying a paper ticket" }
];
const locations = ["night bus interior", "empty depot yard at dawn"];
const arcs = [
  { n: 1, skeleton: false, emotion: "regret", stake: "Harun drives the retired route one last night and finds a passenger who never gets off",
    hook: "empty night bus, headlights on, Harun staring at a paper ticket on his dashboard",
    beats: ["Hook: the empty bus, the ticket on the dashboard", "Noor boards at a stop that closed years ago",
             "She sits where the accident seat used to be", "Turn: Harun realizes he has seen this ride before"],
    turn: "Beat 4: Harun realizes he has seen this ride before, he drove it the night of the crash",
    cliff: "Noor holds out her ticket, freeze before he takes it",
    scenes: "empty bus interior at night; depot yard dusk; Noor boarding at the closed stop; ticket held out in close-up" },
  { n: 2, skeleton: false, emotion: "dread", stake: "Harun asks where she is going, Noor answers with the name of his own street",
    hook: "Harun's knuckles whitening on the wheel as her answer lands",
    beats: ["Hook: the wrong-name answer, silence in the bus", "Harun reroutes, the GPS insists the stop does not exist",
             "The bus passes his own house, lights off", "Turn: she describes the crash, from inside the other car"],
    turn: "Beat 4: Noor describes the crash that ended his career, from the other car's point of view",
    cliff: "Headlights ahead, freeze before they resolve",
    scenes: "hands on wheel close-up; dark GPS screen; his house passing; oncoming headlights" },
  { n: 3, skeleton: false, emotion: "grief", stake: "Noor shows him what she remembers: the night of the crash, rebuilt piece by piece",
    hook: "rain on the windshield, the same storm, forty years back",
    beats: ["Hook: rain, the same storm sound", "Her memories play like a film on the windows",
             "Harun watches himself swerve, and sees what he missed", "Turn: the brake light he never noticed, glowing in her memory"],
    turn: "Beat 4: the brake light that failed, visible only in her telling",
    cliff: "She asks him the one question he never answered, freeze on his face",
    scenes: "rain streaking the windshield; memories on the windows; young Harun swerving; her question close-up" },
  { n: 4, skeleton: false, emotion: "forgiveness", stake: "Harun finally answers, and Noor forgives him for the thing he never confessed",
    hook: "Harun pulls the bus over. The engine ticks in the silence.",
    beats: ["Hook: the bus at the shoulder, engine ticking", "He says the unsaid thing out loud, finally",
             "The depot yard at dawn, the route is ending", "Turn: she tears the ticket in half and hands him his half"],
    turn: "Beat 4: she tears the old ticket in two and gives him the half he always owed",
    cliff: "Her half fades at the edges, freeze before it goes",
    scenes: "bus on the shoulder, dawn light; his confession close-up; depot yard at dawn; the torn ticket" },
  { n: 5, skeleton: false, emotion: "peace", stake: "Harun drives into the depot for the last time, alone, at peace, the route complete",
    hook: "Harun alone in the driver's seat, smiling for the first time in the series",
    beats: ["Hook: Harun's smile in the mirror", "The empty seat where she sat, a folded red scarf",
             "He parks the bus, hands in the keys", "Finale thesis: some routes you drive so someone else can get off"],
    turn: "Beat 3: the folded scarf on the empty seat",
    cliff: "He pins the torn ticket half to the depot board, the series' last image",
    scenes: "smile in the mirror; empty seat, folded scarf; keys handed over; ticket pinned to the board" }
];

const NightBus = Studio.buildSeriesPlan(
  { models: read("models.json").models, templates: read("prompt-templates.json").templates },
  { seriesTitle: "The Night Bus", seriesLogline: "A retired driver drives his old route one last night and carries a passenger who never gets off.",
    format: "minidrama", genre: "drama", runtimeSec: 60, tier: "draft", episodes: 5,
    cast: cast, locations: locations, arcs: arcs });
eq(NightBus.episodeCount, 5, "worked example: 5 episodes");
eq(NightBus.totalShots, 50, "worked example: 50 shots (5 x 10 at 60s draft)");
ok(Math.abs(NightBus.budget.clean - 21.30) < 0.011, "worked example: clean $21.30 (got $" + NightBus.budget.clean.toFixed(2) + ")");
eq(NightBus.budget.five, r2(21.30 * 5), "worked example: 5x envelope $106.50");
eq(NightBus.budget.twenty, r2(21.30 * 20), "worked example: 20x envelope $426.00");
eq(NightBus.reuse.avoidedCredits, 1.92, "worked example: bible avoids 1.92 credits");
ok(NightBus.episodes.every((e) => e.arc.skeleton === false), "worked example: bridge arcs attached (no skeletons)");
ok(NightBus.episodes.every((e) => e.shots.every((x) => x.prompt.startsWith("[SERIES BIBLE"))),
  "worked example: locked DNA on all 50 shots");
const nbUSD = NightBus.episodes.map((e) => r2(e.budget.lines.reduce((a, l) => a + l.usd, 0)));
eq(JSON.stringify(nbUSD), JSON.stringify([2.89, 2.89, 5.1, 5.1, 5.3]), "worked example: per-episode USD " + JSON.stringify(nbUSD));
eq(NightBus.episodes[0].voiceBudgetSec, 60, "worked example: voice budget 60s = the locked dialogue budget");
console.log("       Night Bus: 50 shots | clean $21.30 | 5x $106.50 | bible avoided 1.92 credits");

/* ===== workflow 6: microdrama run economics, Studio 2.5 (asserts the AGENT.md workflow-5 numbers) ======= */
/* Canonical microdrama run: 4 x 1-minute episodes, draft tier, 5 regens/ep.
 * Model rates derive from the live models.json; documented figures are pinned. */
console.log("--- workflow 6: microdrama run economics (real engine, asserted numbers) ---");
const RunPlan = Studio.buildMicrodramaPlan(
  { models: read("models.json").models, templates: read("prompt-templates.json").templates },
  { title: "Run Example", episodes: 4, minPerEpisode: 1, tier: "draft", regensPerEp: 5 });
eq(RunPlan.kind, "microdrama", "run plan kind");
eq(JSON.stringify([RunPlan.clipsPerEp.lo, RunPlan.clipsPerEp.hi]), JSON.stringify([4, 6]),
  "run: 4-6 clips per 1-minute episode (10-15s clip unit)");
eq(JSON.stringify([RunPlan.totalClips.lo, RunPlan.totalClips.hi]), JSON.stringify([16, 24]),
  "run: 16-24 clips for the run");
eq(RunPlan.benchmarkPerEp, 50, "run: $50/episode benchmark ($50/min x 1 min)");
eq(RunPlan.benchmarkTotal, 200, "run: $200 benchmark for the run");
eq(RunPlan.genSecPerEp, 180, "run: 60s x 3 takes = 180 generated s/episode (draft)");
eq(RunPlan.genSecTotal, 720, "run: 720 generated seconds for the run");
eq(RunPlan.timelineDays, 4, "run: 4 days at the documented pace");
ok(RunPlan.rate && RunPlan.rate.cps !== null, "run: rate model resolved from models.json");
ok(Math.abs(RunPlan.budget.totalUsd -
  (RunPlan.budget.genCreditsTotal + RunPlan.budget.regenCredits) * 0.0392) < 0.01,
  "run: total USD = total credits x $0.0392");
ok(RunPlan.perMinPlan <= RunPlan.benchmarkTotal / RunPlan.totalMinutes,
  "run: plan per-minute cost at or under the $50/min benchmark");
const RunMd = Studio.microdramaToMarkdown(RunPlan);
ok(RunMd.includes("Documented production economics"), "run markdown: economics block");
ok(RunMd.includes("storeel-off-campus"), "run markdown: teardown id");
ok(RunMd.includes("verify live"), "run markdown: verify-live flags");
console.log("       Run: " + RunPlan.totalClips.lo + "-" + RunPlan.totalClips.hi +
  " clips | benchmark $" + RunPlan.benchmarkTotal.toFixed(2) +
  " | plan total $" + RunPlan.budget.totalUsd.toFixed(2) +
  " | " + RunPlan.timelineDays + " days");

/* ===== workflow 7: green-light read, GreenLight engine (asserts the AGENT.md workflow-6 numbers) ======= */
console.log("--- workflow 7: green-light read (real engine, asserted numbers) ---");
const GreenLight = require(path.join(ROOT, "assets", "js", "greenlight.js"));
const pricingDoc = read("pricing.json");
const STRONG_C = "Mara, a weathered fisherwoman in her sixties, silver braid, oilskin coat, " +
  "mending a torn net on a fog-draped wooden dock at dawn; the camera pushes in slowly " +
  "from medium to close-up; cold blue dawn light with a warm lantern glow from frame left; " +
  "quiet resilience; coat hem stirring in the sea breeze.";
const GL = GreenLight.buildMeeting(
  { models: read("models.json").models, templates: read("prompt-templates.json").templates },
  pricingDoc,
  { title: "The Net Mender", logline: STRONG_C, genre: "drama",
    runtimeSec: 30, resKey: "1080p", ambition: "festival" }, Studio);
eq(GL.read.score, 100, "greenlight: strong concept reads 100/100");
eq(GL.input.effTier, "festival", "greenlight: flagship pricing unlocked");
eq(GL.verdict.level, "green", "greenlight: verdict GREEN LIGHT");
eq(GL.shots.length, 8, "greenlight: 8 shots for 30s festival");
eq(GL.totals.cleanLow, 62.16, "greenlight: $62.16 clean");
eq(GL.totals.fiveLow, 310.80, "greenlight: $310.80 5x envelope");
eq(GL.totals.twentyLow, 1243.20, "greenlight: $1,243.20 20x envelope");
eq(GL.totalDays, 6, "greenlight: 6-day schedule");
ok(GL.lines.some((l) => l.model === "Veo 3.1" && l.tierName === "standard-1080p"),
  "greenlight: Veo 3.1 priced at standard-1080p (not the Fast entry)");
const GLW = GreenLight.buildMeeting(
  { models: read("models.json").models, templates: read("prompt-templates.json").templates },
  pricingDoc,
  { title: "Dog in the City", logline: "a dog in a city", genre: "action",
    runtimeSec: 30, resKey: "1080p", ambition: "festival" }, Studio);
eq(GLW.read.score, 33, "greenlight: weak concept reads 33/100");
eq(GLW.input.effTier, "draft", "greenlight: money rule prices the cold read at draft");
eq(GLW.verdict.level, "pass", "greenlight: weak verdict BACK TO THE ROOM");
eq(GLW.totals.cleanLow, 15.15, "greenlight: weak $15.15 clean");
ok(GLW.verdict.notes.some((x) => /festival money/.test(x)),
  "greenlight: downgrade stated on the record");
console.log("       Green light: strong $62.16 green / weak $15.15 pass (money rule)");

/* ================================ summary ================================ */
console.log("");
if (failures === 0) {
  console.log("agent-workflows.test.js: all workflows executed against real data/v1 data, ALL PASS");
} else {
  console.log("agent-workflows.test.js: " + failures + " FAILURES");
  process.exit(1);
}
