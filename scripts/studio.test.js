/* Studio math unit tests — run with: node scripts/studio.test.js
   Exercises the pure engine exported by assets/js/studio.js against the
   REAL site data (api/v1/models.json + api/v1/prompt-templates.json). */
"use strict";

const assert = require("assert");
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..");
const S = require(path.join(ROOT, "assets/js/studio.js"));
const models = JSON.parse(fs.readFileSync(path.join(ROOT, "api/v1/models.json"), "utf8")).models;
const templates = JSON.parse(fs.readFileSync(path.join(ROOT, "api/v1/prompt-templates.json"), "utf8")).templates;
const DATA = { models, templates, modelsObserved: "test" };
const TIDS = new Set(templates.map((t) => t.id));

let n = 0;
function test(name, fn) {
  n++;
  try { fn(); console.log("ok " + n + " - " + name); }
  catch (e) { console.error("FAIL " + n + " - " + name + ": " + e.message); process.exitCode = 1; }
}

const INPUT = (o) => Object.assign(
  { title: "Porch Light", logline: "A projectionist restores an abandoned cinema.",
    genre: "drama", runtimeSec: 120, tier: "festival" }, o || {});

/* shot counts per runtime x tier: ceil(runtime / secsPerShot) */
test("shot counts: 30s draft=5, festival=8", () => {
  assert.strictEqual(S.shotCountFor(30, "draft"), 5);
  assert.strictEqual(S.shotCountFor(30, "festival"), 8);
});
test("shot counts: 2min draft=20, festival=30", () => {
  assert.strictEqual(S.shotCountFor(120, "draft"), 20);
  assert.strictEqual(S.shotCountFor(120, "festival"), 30);
});
test("shot counts: 5min draft=50, festival=75", () => {
  assert.strictEqual(S.shotCountFor(300, "draft"), 50);
  assert.strictEqual(S.shotCountFor(300, "festival"), 75);
});
test("shot counts: 10min draft=100, festival=150", () => {
  assert.strictEqual(S.shotCountFor(600, "draft"), 100);
  assert.strictEqual(S.shotCountFor(600, "festival"), 150);
});

/* determinism: same concept -> byte-identical plan */
test("deterministic: identical JSON for identical input", () => {
  const a = JSON.stringify(S.buildPlan(DATA, INPUT()));
  const b = JSON.stringify(S.buildPlan(DATA, INPUT()));
  assert.strictEqual(a, b);
});
test("seed changes with concept", () => {
  const a = S.buildPlan(DATA, INPUT()).seed;
  const b = S.buildPlan(DATA, INPUT({ title: "Other Film" })).seed;
  assert.notStrictEqual(a, b);
});

/* every shot: real template, genre-track match, filled prompt, anatomy note */
test("all shots reference real templates in genre tracks", () => {
  const plan = S.buildPlan(DATA, INPUT({ genre: "scifi", runtimeSec: 30, tier: "draft" }));
  assert.strictEqual(plan.shots.length, 5);
  plan.shots.forEach((s) => {
    assert.ok(TIDS.has(s.templateId), "unknown template " + s.templateId);
    assert.ok(["core", "photorealistic"].includes(s.track), "track " + s.track);
    assert.ok(s.anatomy && s.anatomy.length > 0, "missing anatomy note");
    assert.ok(s.prompt.length > 40, "prompt too short");
    assert.ok(!/\[SUBJECT/i.test(s.prompt), "unfilled [SUBJECT] in: " + s.prompt.slice(0, 80));
    assert.ok(!/\[ENV/i.test(s.prompt), "unfilled [ENV]");
    assert.ok(!/\[STYLE/i.test(s.prompt), "unfilled [STYLE]");
  });
});
test("animation genre draws only animated templates", () => {
  const plan = S.buildPlan(DATA, INPUT({ genre: "animation", runtimeSec: 30, tier: "draft" }));
  plan.shots.forEach((s) => assert.strictEqual(s.track, "animated"));
});
test("opening shot is an establishing beat, closer is a payoff", () => {
  const plan = S.buildPlan(DATA, INPUT({ runtimeSec: 600, tier: "draft" }));
  assert.strictEqual(plan.shots[0].act, "Setup");
  assert.strictEqual(plan.shots[plan.shots.length - 1].act, "Payoff");
});

/* model picks: resolve to models.json or are flagged verify-live */
test("model picks resolve to priced models or are flagged", () => {
  const names = new Set(models.filter((m) => m.type === "video" && m.status !== "discontinued")
    .map((m) => m.model));
  for (const genre of Object.keys(S.GENRES)) {
    const plan = S.buildPlan(DATA, INPUT({ genre, runtimeSec: 30, tier: "draft" }));
    plan.shots.forEach((s) => {
      assert.ok(names.has(s.model), genre + ": unresolved model " + s.model);
      if (s.cps === null) {
        assert.ok(plan.budget.verifyLive.includes(s.model) ||
          s.modelUnpriced.includes(s.model),
          genre + ": unpriced model not flagged");
      } else {
        assert.ok(s.cps > 0, "non-positive rate");
      }
    });
  }
});
test("draft picks the cheapest candidate, festival prefers quality-flagged", () => {
  const d = S.buildPlan(DATA, INPUT({ runtimeSec: 30, tier: "draft" }));
  const f = S.buildPlan(DATA, INPUT({ runtimeSec: 30, tier: "festival" }));
  assert.ok(d.budget.clean <= f.budget.clean,
    `draft $${d.budget.clean} should cost <= festival $${f.budget.clean}`);
});

/* cost parsing honours the optimizer's convention */
test("costPerSec parses first N/Ms pattern", () => {
  assert.strictEqual(S.costPerSec({ est_cost_credits: "720p ~22/5s, 1080p ~45/5s" }), 4.4);
  assert.strictEqual(S.costPerSec({ est_cost_credits: "not in captured table — verify live" }), null);
});
test("costPerImage parses per-image rates", () => {
  assert.strictEqual(S.costPerImage({ est_cost_credits: "0.12 / image" }), 0.12);
  assert.strictEqual(S.costPerImage({ est_cost_credits: "720p ~7/5s" }), null);
});
test("normName + resolveModel bridge template model strings to records", () => {
  assert.strictEqual(S.normName("Veo 3.1 (ingredients)"), "veo 3.1");
  assert.strictEqual(S.normName("Hailuo 02/2.3"), "hailuo 02/2.3");
  const byName = {};
  models.filter((m) => m.type === "video" && m.status !== "discontinued")
    .forEach((m) => { byName[S.normName(m.model)] = m; });
  assert.strictEqual(S.resolveModel(byName, S.normName("Seedance 2.0 multi-shot")).model, "Seedance 2.0");
  assert.strictEqual(S.resolveModel(byName, S.normName("Veo 3.1)")).model, "Veo 3.1");
  assert.strictEqual(S.resolveModel(byName, S.normName("Kling 3.0 image-to-video")).model, "Kling 3.0");
  assert.strictEqual(S.resolveModel(byName, S.normName("Hailuo 02/2.3")).model, "Hailuo 02 / 2.3");
  assert.strictEqual(S.resolveModel(byName, "definitely not a model"), null);
});

/* budget sums: lines add to clean; envelopes are exact multiples */
test("budget lines sum to clean; 5x/20x are exact multiples", () => {
  for (const tier of ["draft", "festival"]) {
    const plan = S.buildPlan(DATA, INPUT({ tier, runtimeSec: 300 }));
    const sum = plan.budget.lines.reduce((a, l) => a + l.usd, 0);
    assert.ok(Math.abs(sum - plan.budget.clean) < 0.011,
      `${tier}: lines sum ${sum} != clean ${plan.budget.clean}`);
    assert.ok(Math.abs(plan.budget.five - plan.budget.clean * 5) < 0.011, "5x off");
    assert.ok(Math.abs(plan.budget.twenty - plan.budget.clean * 20) < 0.011, "20x off");
    assert.ok(plan.budget.five > plan.budget.clean, "envelope must exceed clean");
  }
});
test("generation math is traceable: shots x takes x seconds x rate", () => {
  const plan = S.buildPlan(DATA, INPUT({ runtimeSec: 120, tier: "draft" }));
  const gen = plan.budget.lines.filter((l) => l.item.startsWith("Generation"));
  assert.ok(gen.length > 0, "no generation lines");
  const totalGens = gen.reduce((a, l) => {
    const m = l.math.match(/(\d+) × (\d+) takes × (\d+)s × ([\d.]+) credits\/s/);
    assert.ok(m, "math not traceable: " + l.math);
    return a + parseInt(m[1], 10) * parseInt(m[2], 10);
  }, 0);
  assert.strictEqual(totalGens, plan.shotCount * plan.tierSpec.takes);
});

/* schedule: positive integer days, total = sum of phases */
test("schedule phases are positive ints summing to the total", () => {
  for (const rs of [30, 120, 300, 600]) {
    const plan = S.buildPlan(DATA, INPUT({ runtimeSec: rs, tier: "festival" }));
    let sum = 0;
    plan.schedule.phases.forEach((p) => {
      assert.ok(Number.isInteger(p.days) && p.days >= 1, "bad days: " + p.days);
      assert.ok(p.basis.length > 0, "missing basis");
      sum += p.days;
    });
    assert.strictEqual(sum, plan.schedule.totalDays);
  }
});

/* markdown export carries the packet */
test("markdown export contains title, shots, budget, schedule", () => {
  const plan = S.buildPlan(DATA, INPUT({ runtimeSec: 30, tier: "draft" }));
  const md = S.planToMarkdown(plan);
  assert.ok(md.includes("# Porch Light — AI-film production packet"));
  assert.ok(md.includes("## Shot list"));
  assert.ok(md.includes("## Model picks"));
  assert.ok(md.includes("## Budget"));
  assert.ok(md.includes("## Schedule"));
  assert.ok(md.includes("### Shot 1 — Setup"));
  assert.ok(md.includes("**Clean run:"));
});

/* invalid inputs throw, never silently plan */
test("unknown genre/tier/runtime throws", () => {
  assert.throws(() => S.buildPlan(DATA, INPUT({ genre: "nope" })), /unknown genre/);
  assert.throws(() => S.buildPlan(DATA, INPUT({ tier: "nope" })), /unknown tier/);
  assert.throws(() => S.buildPlan(DATA, INPUT({ runtimeSec: 999 })), /unknown runtime/);
});

/* ================= Studio 2.0: series mode ============================ */
const SIN = (o) => Object.assign(
  { seriesTitle: "Porch Light: The Hallway",
    seriesLogline: "A projectionist restores an abandoned cinema.",
    format: "minidrama", genre: "drama", runtimeSec: 90, tier: "draft",
    episodes: 5,
    cast: [{ name: "Mara", voice: "avocado_v2:MARA_01",
             anchor: "woman, late 20s, copper bob, leather jacket" }],
    locations: ["abandoned cinema lobby"] }, o || {});

test("series: shot math — 90s draft minidrama, 5 eps -> 15/ep, 75 total", () => {
  const p = S.buildSeriesPlan(DATA, SIN());
  assert.strictEqual(p.episodeCount, 5);
  p.episodes.forEach((ep) => assert.strictEqual(ep.shotCount, 15));
  assert.strictEqual(p.totalShots, 75);
  assert.strictEqual(p.shotsPerEpisode, 15);
});
test("series: festival tier tightens shots — 90s -> 23/ep", () => {
  const p = S.buildSeriesPlan(DATA, SIN({ tier: "festival" }));
  p.episodes.forEach((ep) => assert.strictEqual(ep.shotCount, 23));
});
test("series: deterministic — byte-identical JSON, seed moves with title", () => {
  const a = JSON.stringify(S.buildSeriesPlan(DATA, SIN()));
  const b = JSON.stringify(S.buildSeriesPlan(DATA, SIN()));
  assert.strictEqual(a, b);
  assert.notStrictEqual(S.buildSeriesPlan(DATA, SIN()).seed,
    S.buildSeriesPlan(DATA, SIN({ seriesTitle: "Other Series" })).seed);
});
test("series: locked prompt DNA prepended to every shot prompt", () => {
  const p = S.buildSeriesPlan(DATA, SIN());
  p.episodes.forEach((ep) => ep.shots.forEach((s) => {
    assert.ok(s.prompt.startsWith("[SERIES BIBLE"), "DNA missing on shot " + s.n);
    assert.ok(s.prompt.includes("copper bob"), "cast anchor missing from DNA");
  }));
  assert.deepStrictEqual(p.bible.dnaLines, p.bible.dnaLines); // stable
  assert.strictEqual(p.bible.lockedAssets.length, 2); // 1 cast + 1 location
});
test("series: bible-plates line is the cheapest priced image model, generated once", () => {
  const imgs = models.filter((m) => m.type === "image" && m.status !== "discontinued")
    .map((m) => ({ m, cpi: S.costPerImage(m) })).filter((x) => x.cpi !== null);
  const cheapest = imgs.sort((a, b) => a.cpi - b.cpi)[0];
  const p = S.buildSeriesPlan(DATA, SIN());
  const line = p.budget.lines[0];
  assert.ok(line.item.startsWith("Series bible"), "first line should be the bible plates");
  assert.ok(line.math.includes(String(cheapest.cpi)), "line rate != cheapest image rate " + cheapest.cpi);
  const expectedCredits = 2 * cheapest.cpi; // 2 locked assets, once
  assert.ok(Math.abs(line.credits - expectedCredits) < 0.001,
    `bible credits ${line.credits} != ${expectedCredits}`);
});
test("series: reuse avoided = assets x (eps-1) x still rate; lines sum to clean; 5x/20x exact", () => {
  const p = S.buildSeriesPlan(DATA, SIN());
  const imgs = models.filter((m) => m.type === "image" && m.status !== "discontinued")
    .map((m) => S.costPerImage(m)).filter((x) => x !== null);
  const cpi = Math.min.apply(null, imgs);
  assert.ok(Math.abs(p.reuse.avoidedCredits - 2 * 4 * cpi) < 0.001, "avoided math off");
  assert.ok(p.reuse.avoidedUSD > 0, "avoidedUSD should be positive");
  const sum = p.budget.lines.reduce((a, l) => a + l.usd, 0);
  assert.ok(Math.abs(sum - p.budget.clean) < 0.011, "lines don't sum to clean");
  assert.ok(Math.abs(p.budget.five - p.budget.clean * 5) < 0.011, "5x off");
  assert.ok(Math.abs(p.budget.twenty - p.budget.clean * 20) < 0.011, "20x off");
});
test("series: schedule phases are positive ints summing to the total", () => {
  const p = S.buildSeriesPlan(DATA, SIN());
  let sum = 0;
  p.schedule.phases.forEach((ph) => {
    assert.ok(Number.isInteger(ph.days) && ph.days >= 1, "bad days: " + ph.days);
    assert.ok(ph.basis.length > 0, "missing basis");
    sum += ph.days;
  });
  assert.strictEqual(sum, p.schedule.totalDays);
  assert.ok(p.schedule.phases[0].phase.includes("bible"), "bible phase should lead");
});
test("series: format presets carry band, beats, spb from the episode planner", () => {
  assert.deepStrictEqual(S.SERIES_FORMATS.minidrama.band, [60, 150]);
  assert.deepStrictEqual(S.SERIES_FORMATS.pov.band, [30, 90]);
  assert.deepStrictEqual(S.SERIES_FORMATS.daylife.band, [15, 60]);
  assert.deepStrictEqual(S.SERIES_FORMATS.revenge.band, [60, 150]);
  assert.deepStrictEqual(S.SERIES_FORMATS.interactive.band, [60, 150], "interactive band");
  assert.strictEqual(S.SERIES_FORMATS.minidrama.spb, 15);
  assert.strictEqual(S.SERIES_FORMATS.pov.spb, 12);
  assert.strictEqual(S.SERIES_FORMATS.daylife.spb, 10);
  assert.strictEqual(S.SERIES_FORMATS.interactive.spb, 15, "interactive spb");
  assert.ok(S.SERIES_FORMATS.minidrama.voiceRule.includes("golden rule"), "voice rule missing");
  assert.ok(S.SERIES_FORMATS.interactive.arcStyle.includes("decision"), "interactive arc style missing");
});
test("series: studio bands match the episode planner's FORMAT_PRESETS (sync guard)", () => {
  const src = fs.readFileSync(path.join(ROOT, "assets/js/episode-planner.js"), "utf8");
  Object.keys(S.SERIES_FORMATS).forEach((fmt) => {
    const m = src.match(new RegExp(fmt + ":[\\s\\S]*?band:\\s*\\[(\\d+),\\s*(\\d+)\\][\\s\\S]*?spb:\\s*(\\d+)"));
    assert.ok(m, fmt + " preset not found in episode-planner.js");
    assert.deepStrictEqual([+m[1], +m[2]], S.SERIES_FORMATS[fmt].band, fmt + " band mismatch");
    assert.strictEqual(+m[3], S.SERIES_FORMATS[fmt].spb, fmt + " spb mismatch");
  });
});
test("series: skeleton arcs when no bridge arcs; bridge arcs attach when given", () => {
  const p = S.buildSeriesPlan(DATA, SIN());
  p.episodes.forEach((ep) => {
    assert.strictEqual(ep.arc.skeleton, true, "expected skeleton arc");
    assert.strictEqual(ep.arc.beats.length, S.SERIES_FORMATS.minidrama.beats);
    assert.ok(ep.voiceBudgetSec > 0, "voice budget should be beats x spb");
  });
  const block = { n: 2, skeleton: false, emotion: "longing", stake: "she takes the taxi",
    hook: "taxi night", beats: ["a", "b", "c", "d"], turn: "the turn",
    cliff: "the cliff", scenes: "scenes" };
  const q = S.buildSeriesPlan(DATA, SIN({ arcs: [block] }));
  assert.strictEqual(q.episodes[1].arc.emotion, "longing", "bridge arc not attached");
  assert.strictEqual(q.episodes[1].arc.skeleton, false);
  assert.strictEqual(q.episodes[0].arc.skeleton, true, "ep 1 should still be a skeleton");
});
test("series: invalid format/episodes/runtime/title throws", () => {
  assert.throws(() => S.buildSeriesPlan(DATA, SIN({ format: "nope" })), /unknown series format/);
  assert.throws(() => S.buildSeriesPlan(DATA, SIN({ episodes: 2 })), /3–10/);
  assert.throws(() => S.buildSeriesPlan(DATA, SIN({ episodes: 11 })), /3–10/);
  assert.throws(() => S.buildSeriesPlan(DATA, SIN({ runtimeSec: 20 })), /outside the/);
  assert.throws(() => S.buildSeriesPlan(DATA, SIN({ runtimeSec: 200 })), /outside the/);
  assert.throws(() => S.buildSeriesPlan(DATA, SIN({ seriesTitle: "" })), /needs a title/);
  assert.throws(() => S.buildSeriesPlan(DATA, SIN({ genre: "nope" })), /unknown genre/);
});
test("seriesToMarkdown: bible, episodes, budget, schedule, checklist", () => {
  const md = S.seriesToMarkdown(S.buildSeriesPlan(DATA, SIN()));
  assert.ok(md.includes("# Porch Light: The Hallway — series production packet"));
  assert.ok(md.includes("## Series bible — locked before generation"));
  assert.ok(md.includes("[SERIES BIBLE"));
  assert.ok(md.includes("## Episode arcs"));
  assert.ok(md.includes("### Episode 1 — 15 shots"));
  assert.ok(md.includes("## Shot lists — per-shot prompts (with locked DNA)"));
  assert.ok(md.includes("## Budget"));
  assert.ok(md.includes("Saved by the bible:"));
  assert.ok(md.includes("## Schedule"));
  assert.ok(md.includes("## Series consistency checklist"));
  assert.ok(md.includes("- [ ]"));
});
test("seriesToHtml: self-contained, inline CSS, closes cleanly", () => {
  const html = S.seriesToHtml(S.buildSeriesPlan(DATA, SIN({ episodes: 3 })));
  assert.ok(html.startsWith("<!DOCTYPE html>"));
  assert.ok(html.includes("<style>") && html.includes("</style>"), "must carry inline CSS");
  assert.ok(!/fonts\.googleapis|cdn\.|src="http/.test(html), "packet must make no external requests");
  assert.ok(html.includes("Series bible — locked before generation"));
  assert.ok(html.includes("Episode 2"));
  assert.ok(html.includes("Series consistency checklist"));
  assert.ok(html.trim().endsWith("</html>"));
});

/* ---- wave 24: Studio cost optimizer --------------------------------------
   optimizePlan / rate parsing / honest floor / mode math, all against the
   real api/v1/models.json. */
const OPTIN = (o) => Object.assign(
  { title: "Porch Light", logline: "A projectionist restores an abandoned cinema.",
    genre: "drama", runtimeSec: 120, tier: "festival" }, o || {});
function optPlan(o, oo) {
  return S.optimizePlan(DATA, S.buildPlan(DATA, OPTIN(o)), oo || {});
}

test("optimizer: USD/s rates parse from models.json (Vidu Q4, H3, FLUX 3)", () => {
  const byName = {};
  models.forEach((m) => { byName[m.model] = m; });
  const vidu = S.rateAtRes(byName["Vidu Q4 Preview"], 1080);
  assert.ok(vidu, "Vidu Q4 should price at 1080p");
  assert.strictEqual(vidu.kind, "usd");
  assert.ok(Math.abs(vidu.usdps - 0.014) < 1e-9, "Vidu Q4 launch pricing $0.014/s, got " + vidu.usdps);
  const h3 = S.rateAtRes(byName["MiniMax H3"], 1080);
  assert.ok(h3 && h3.kind === "usd" && Math.abs(h3.usdps - 0.13) < 1e-9,
    "MiniMax H3 2K $0.13/s expected, got " + JSON.stringify(h3));
  const flux = S.rateAtRes(byName["FLUX 3 Video"], 1080);
  assert.ok(flux && Math.abs(flux.usdps - 0.29) < 1e-9,
    "FLUX 3 1080p $0.29/s expected, got " + JSON.stringify(flux));
  const wan = S.rateAtRes(byName["Wan 2.6"], 1080);
  assert.ok(wan && wan.kind === "credit" && Math.abs(wan.usdps - 2 * 0.0392) < 1e-9,
    "Wan 2.6 1080p 2 credits/s expected, got " + JSON.stringify(wan));
});

test("optimizer: unpriced models have no rate (honest floor)", () => {
  const byName = {};
  models.forEach((m) => { byName[m.model] = m; });
  ["Pika 2.5", "Midjourney V1 Video", "Kling 4.0", "Vidu S2", "Seedance 3.0"].forEach((n) => {
    assert.strictEqual(S.rateAtRes(byName[n], 720), null, n + " must be unpriced");
  });
});

test("optimizer: floor honesty — nothing below the bar substitutes", () => {
  const opt = optPlan();
  const belowBar = ["DoP (Lite/Standard/Turbo)", "Veo 3.1 Fast / Veo 3", "Luma App / Ray 3.2"];
  const picked = new Set();
  opt.perShot.forEach((s) => {
    [s.balanced, s.cheapest, s.bestrated].forEach((e) => { if (e) picked.add(e.model); });
  });
  belowBar.forEach((n) => assert.ok(!picked.has(n), n + " must never substitute at the 1080p bar"));
  /* resolution-undocumented models are ineligible, never assumed */
  const inel = new Set(opt.ineligible.map((x) => x.model));
  assert.ok(inel.has("LTX-2.5"), "LTX-2.5 (no documented resolution) must be ineligible");
  assert.ok(inel.has("Marketing Studio video"), "Marketing Studio (no documented resolution) must be ineligible");
  assert.ok(!picked.has("LTX-2.5") && !picked.has("Marketing Studio video"));
});

test("optimizer: every pick meets its shot's requirements", () => {
  const opt = optPlan({}, { audioShare: 30 });
  opt.perShot.forEach((s) => {
    [s.cheapest, s.bestrated].forEach((e) => {
      if (!e) return;
      assert.ok(e.res >= opt.resBar,
        s.ref + ": " + e.model + " documents " + e.res + "p, below the " + opt.resBar + "p bar");
      if (s.needsAudio) {
        assert.ok(e.audio, s.ref + ": dialogue shot picked non-audio model " + e.model);
      }
    });
  });
  const audioShots = opt.perShot.filter((s) => s.needsAudio);
  assert.ok(audioShots.length > 0, "audioShare=30 should mark shots");
  assert.ok(audioShots.every((s) => s.cheapest && s.cheapest.audio),
    "every dialogue shot's cheapest pick must be audio-capable");
});

test("optimizer: mode math — cheapest <= balanced, bestrated >= cheapest, deltas reconcile", () => {
  const opt = optPlan();
  const { cheapest, balanced, bestrated } = opt.modes;
  assert.ok(cheapest.total <= balanced.total + 1e-9,
    "cheapest " + cheapest.total + " must not exceed balanced " + balanced.total);
  if (bestrated.complete && cheapest.complete) {
    assert.ok(bestrated.total + 1e-9 >= cheapest.total,
      "best rated " + bestrated.total + " must not undercut the cheapest viable " + cheapest.total);
  }
  /* per-shot savings sum to the mode delta */
  const sumSaving = opt.perShot.reduce((a, s) => a + (s.saving || 0), 0);
  assert.ok(Math.abs(sumSaving - (balanced.total - cheapest.total)) < 0.02,
    "savings sum " + sumSaving + " vs mode delta " + (balanced.total - cheapest.total));
  /* byModel + byEpisode-free film: byModel sums to the balanced total */
  const sumModel = opt.byModel.reduce((a, g) => a + g.usd, 0);
  assert.ok(Math.abs(sumModel - balanced.total) < 0.02,
    "byModel sum " + sumModel + " vs balanced " + balanced.total);
  /* take-count leverage reconciles (r2 rounding: perTake is rounded, so
     compare against the unrounded quotient with a 1-cent tolerance) */
  assert.ok(Math.abs(opt.perTake - balanced.total / opt.takes) < 0.011,
    "perTake must equal balanced total / takes within rounding");
  assert.ok(opt.byTakes.every((t) => Math.abs(t.usd - opt.perTake * t.takes) < 0.011),
    "every take-count row must equal perTake x takes within rounding");
});

test("optimizer: verify-live badges on USD-billed picks", () => {
  const opt = optPlan();
  const usdPicks = new Set();
  opt.perShot.forEach((s) => {
    [s.balanced, s.cheapest, s.bestrated].forEach((e) => {
      if (e && e.priceMayMove) usdPicks.add(e.model);
    });
  });
  assert.ok(usdPicks.size > 0, "expected at least one USD-billed pick");
  usdPicks.forEach((n) => {
    assert.ok(opt.verifyLive.indexOf(n) !== -1, n + " must carry the price-may-move badge");
  });
  const md = S.optimizeToMarkdown({ optimizer: opt });
  assert.ok(md.includes("price may move"), "packet markdown must carry the badge text");
});

test("optimizer: deterministic — same plan + opts, byte-identical output", () => {
  const a = JSON.stringify(optPlan());
  const b = JSON.stringify(optPlan());
  assert.strictEqual(a, b);
});

test("optimizer: unpriced balanced pick degrades honestly, never crashes", () => {
  const plan = S.buildPlan(DATA, OPTIN());
  plan.shots[0].model = null; /* simulate an unresolvable pick */
  const opt = S.optimizePlan(DATA, plan, {});
  assert.strictEqual(opt.modes.balanced.complete, false, "balanced must flag incomplete");
  assert.ok(opt.perShot[0].balanced === null, "shot with no model has no balanced entry");
  assert.ok(opt.perShot[0].cheapest !== null, "cheapest still computed for that shot");
});

test("optimizer: series plans flatten with per-episode breakdown", () => {
  const sp = S.buildSeriesPlan(DATA, SIN({ episodes: 3 }));
  const opt = S.optimizePlan(DATA, sp, {});
  assert.strictEqual(opt.shotCount, sp.totalShots, "every series shot must be optimized");
  assert.strictEqual(opt.byEpisode.length, 3, "one row per episode");
  assert.ok(opt.perShot[0].ref.indexOf("E1") === 0, "series refs carry episode labels, got " + opt.perShot[0].ref);
  const sumEp = opt.byEpisode.reduce((a, e) => a + e.balanced, 0);
  assert.ok(Math.abs(sumEp - opt.modes.balanced.total) < 0.02,
    "episode rows must sum to the balanced total");
  const md = S.seriesToMarkdown(Object.assign({}, sp, { optimizer: opt }));
  assert.ok(md.includes("## Cost optimizer"), "series markdown packet must carry the optimizer section");
  assert.ok(md.includes("Three budget modes"), "series packet must carry the mode comparison");
  assert.ok(md.includes("Documented production economics"), "series markdown packet must carry the wave-27 benchmark block");
  assert.ok(md.includes("$50/min benchmark"), "series markdown benchmark block must name the StoReel $50/min figure");
  assert.ok(md.includes("storeel-off-campus"), "series markdown benchmark block must point at the teardown id");
  const html = S.seriesToHtml(Object.assign({}, sp, { optimizer: opt }));
  assert.ok(html.includes("Cost optimizer"), "series HTML packet must carry the optimizer section");
  assert.ok(html.includes("Biggest single decision"), "series HTML must carry the biggest-decision callout");
  assert.ok(html.includes("Documented production economics"), "series HTML packet must carry the wave-27 benchmark block");
});

test("optimizer: film packet markdown carries the optimizer section only when run", () => {
  const plan = S.buildPlan(DATA, OPTIN({ tier: "draft" }));
  const plain = S.planToMarkdown(plan);
  assert.ok(!plain.includes("## Cost optimizer"), "packet without an optimizer run must not mention it");
  const opt = S.optimizePlan(DATA, plan, {});
  const withOpt = S.planToMarkdown(Object.assign({}, plan, { optimizer: opt }));
  assert.ok(withOpt.includes("## Cost optimizer"), "film packet must carry the optimizer section after a run");
  assert.ok(withOpt.includes("Cheapest viable"), "film packet must carry the mode comparison");
  assert.ok(withOpt.includes("Where the money goes"), "film packet must carry the breakdown");
  assert.ok(withOpt.includes("Biggest single decision"), "film packet must call out the biggest decision");
});

test("optimizer: biggest decision names the priciest shot with a real alternative", () => {
  const opt = optPlan();
  assert.ok(opt.biggest, "biggest decision must exist");
  const maxCost = Math.max.apply(null, opt.perShot.map((s) => (s.balanced ? s.balanced.cost : -1)));
  assert.strictEqual(opt.biggest.cost, maxCost, "biggest must be the priciest balanced shot");
  if (opt.biggest.alternative && opt.biggest.alternative.model !== opt.biggest.model) {
    assert.ok(Math.abs(opt.biggest.saving - (opt.biggest.cost - opt.biggest.alternative.cost)) < 0.02,
      "biggest saving must equal cost minus alternative cost");
  }
});

console.log(`\nstudio.test.js: ${n} tests, ${process.exitCode ? "FAILURES" : "all pass"}`);
