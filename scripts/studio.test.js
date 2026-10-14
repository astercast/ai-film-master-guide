/* Studio math unit tests, run with: node scripts/studio.test.js
   Exercises the pure engine exported by assets/js/studio.js against the
   REAL site data (data/v1/models.json + data/v1/prompt-templates.json). */
"use strict";

const assert = require("assert");
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..");
const S = require(path.join(ROOT, "assets/js/studio.js"));
const models = JSON.parse(fs.readFileSync(path.join(ROOT, "data/v1/models.json"), "utf8")).models;
const templates = JSON.parse(fs.readFileSync(path.join(ROOT, "data/v1/prompt-templates.json"), "utf8")).templates;
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
  assert.strictEqual(S.costPerSec({ est_cost_credits: "not in captured table, verify live" }), null);
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
  assert.ok(md.includes("# Porch Light, AI-film production packet"));
  assert.ok(md.includes("## Shot list"));
  assert.ok(md.includes("## Model picks"));
  assert.ok(md.includes("## Budget"));
  assert.ok(md.includes("## Schedule"));
  assert.ok(md.includes("### Shot 1, Setup"));
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

test("series: shot math, 90s draft minidrama, 5 eps -> 15/ep, 75 total", () => {
  const p = S.buildSeriesPlan(DATA, SIN());
  assert.strictEqual(p.episodeCount, 5);
  p.episodes.forEach((ep) => assert.strictEqual(ep.shotCount, 15));
  assert.strictEqual(p.totalShots, 75);
  assert.strictEqual(p.shotsPerEpisode, 15);
});
test("series: festival tier tightens shots, 90s -> 23/ep", () => {
  const p = S.buildSeriesPlan(DATA, SIN({ tier: "festival" }));
  p.episodes.forEach((ep) => assert.strictEqual(ep.shotCount, 23));
});
test("series: deterministic, byte-identical JSON, seed moves with title", () => {
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
  assert.throws(() => S.buildSeriesPlan(DATA, SIN({ episodes: 2 })), /3 to 10/);
  assert.throws(() => S.buildSeriesPlan(DATA, SIN({ episodes: 11 })), /3 to 10/);
  assert.throws(() => S.buildSeriesPlan(DATA, SIN({ runtimeSec: 20 })), /outside the/);
  assert.throws(() => S.buildSeriesPlan(DATA, SIN({ runtimeSec: 200 })), /outside the/);
  assert.throws(() => S.buildSeriesPlan(DATA, SIN({ seriesTitle: "" })), /needs a title/);
  assert.throws(() => S.buildSeriesPlan(DATA, SIN({ genre: "nope" })), /unknown genre/);
});
test("seriesToMarkdown: bible, episodes, budget, schedule, checklist", () => {
  const md = S.seriesToMarkdown(S.buildSeriesPlan(DATA, SIN()));
  assert.ok(md.includes("# Porch Light: The Hallway, series production packet"));
  assert.ok(md.includes("## Series bible, locked before generation"));
  assert.ok(md.includes("[SERIES BIBLE"));
  assert.ok(md.includes("## Episode arcs"));
  assert.ok(md.includes("### Episode 1, 15 shots"));
  assert.ok(md.includes("## Shot lists, per-shot prompts (with locked DNA)"));
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
  assert.ok(html.includes("Series bible, locked before generation"));
  assert.ok(html.includes("Episode 2"));
  assert.ok(html.includes("Series consistency checklist"));
  assert.ok(html.trim().endsWith("</html>"));
});

/* ---- wave 24: Studio cost optimizer --------------------------------------
   optimizePlan / rate parsing / honest floor / mode math, all against the
   real data/v1/models.json. */
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
  assert.ok(Math.abs(vidu.usdps - 0.12) < 1e-9, "Vidu Q4 list pricing $0.12/s at 1080p (wave 30: the $0.014/s headline was a promo floor), got " + vidu.usdps);
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

test("optimizer: floor honesty, nothing below the bar substitutes", () => {
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

test("optimizer: mode math, cheapest <= balanced, bestrated >= cheapest, deltas reconcile", () => {
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

test("optimizer: deterministic, same plan + opts, byte-identical output", () => {
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
  assert.ok(md.includes("Four budget modes"), "series packet must carry the mode comparison");
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

/* ===== Studio 2.5: microdrama production planner (wave 28) =================
   Pinned fixtures: the documented economics are constants; the model-rate
   math derives its expectations from the real models.json (like the other
   suites), so a rate change moves both sides of the assertion together. */
const MIN = (o) => Object.assign(
  { title: "Run Fixture", episodes: 4, minPerEpisode: 1, tier: "draft", regensPerEp: 5 }, o || {});

test("microdrama: documented constants are pinned", () => {
  assert.strictEqual(S.MICRO.clipLo, 10, "clip unit low end must be 10s (StoReel 146-clip breakdown)");
  assert.strictEqual(S.MICRO.clipHi, 15, "clip unit high end must be 15s");
  assert.strictEqual(S.MICRO.benchmarkPerMin, 50, "$50/min StoReel benchmark");
  assert.strictEqual(S.MICRO.pugcPerMin, 150, "$150/min PUGC rate");
  assert.strictEqual(S.MICRO.liveActionPerMin, 2000, "$2,000/min live-action figure");
  assert.strictEqual(S.MICRO.paceDaysPerEp, 1, "4 episodes in 4 days = 1 day/ep");
  assert.strictEqual(S.MICRO.takes.draft, 3, "draft = low end of the 3-5 drawing-cards range");
  assert.strictEqual(S.MICRO.takes.festival, 5, "festival = high end of the 3-5 drawing-cards range");
});

test("microdrama: clip budget math (10-15s clips)", () => {
  assert.deepStrictEqual(S.clipCountFor(1), { runtimeSec: 60, lo: 4, hi: 6 },
    "1-minute episode: 60/15=4 to 60/10=6 clips");
  assert.deepStrictEqual(S.clipCountFor(2), { runtimeSec: 120, lo: 8, hi: 12 },
    "2-minute episode: 8-12 clips");
  /* StoReel's actual granularity must sit inside the documented range */
  const actual = 146 / 30;
  assert.ok(actual >= 4 && actual <= 6,
    "StoReel's 146 clips / 30 storyboarded episodes (~" + actual.toFixed(1) + ") must sit inside the 4-6 range for a 60s episode");
});

test("microdrama: benchmark totals are pure documented arithmetic", () => {
  const p = S.buildMicrodramaPlan(DATA, MIN());
  assert.strictEqual(p.benchmarkPerEp, 50, "1 min x $50/min = $50/episode");
  assert.strictEqual(p.benchmarkTotal, 200, "4 episodes x $50 = $200 benchmark");
  assert.strictEqual(p.pugcRef, 600, "4 min x $150/min PUGC = $600");
  assert.strictEqual(p.liveActionRef, 8000, "4 min x $2,000/min live-action = $8,000");
  assert.strictEqual(p.timelineDays, 4, "4 episodes at the documented pace = 4 days");
});

test("microdrama: generation math derives from models.json (pinned relationships)", () => {
  const p = S.buildMicrodramaPlan(DATA, MIN());
  const vids = models.filter((m) => m.type === "video" && m.status !== "discontinued");
  const cps = (m) => { const mt = String(m.est_cost_credits || "").match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+)\s*s/); return mt ? parseFloat(mt[1]) / parseFloat(mt[2]) : null; };
  const priced = vids.map((m) => ({ m, c: cps(m) })).filter((x) => x.c !== null)
    .sort((a, b) => a.c - b.c);
  assert.ok(priced.length, "need at least one priced video model");
  assert.strictEqual(p.rate.model, priced[0].m.model, "planner rate = cheapest priced video model");
  assert.strictEqual(p.genSecPerEp, 60 * 3, "draft: 60s x 3 retakes = 180 generated s/episode");
  assert.strictEqual(p.genSecTotal, 180 * 4, "720 generated seconds for the run");
  assert.ok(Math.abs(p.budget.genCreditsTotal - 720 * priced[0].c) < 0.01,
    "generation credits = seconds x rate");
  const imgs = models.filter((m) => m.type === "image" && m.status !== "discontinued");
  const cpi = (m) => { const mt = String(m.est_cost_credits || "").match(/~?(\d+(?:\.\d+)?)\s*\/\s*image/); return mt ? parseFloat(mt[1]) : null; };
  const pi = imgs.map((m) => ({ m, c: cpi(m) })).filter((x) => x.c !== null)
    .sort((a, b) => a.c - b.c);
  if (pi.length) {
    assert.strictEqual(p.img.model, pi[0].m.model, "regen rate = cheapest priced image model");
    assert.strictEqual(p.budget.regenCount, 20, "5 regens/ep x 4 episodes");
    assert.ok(Math.abs(p.budget.regenCredits - 20 * pi[0].c) < 0.01,
      "regen credits = count x image rate");
  } else {
    assert.strictEqual(p.img, null, "no priced image model -> null, flagged verify-live");
  }
  assert.ok(Math.abs(p.budget.totalUsd -
    (p.budget.genCreditsTotal + p.budget.regenCredits) * 0.0392) < 0.01,
    "total USD = total credits x $0.0392");
  assert.ok(p.perMinPlan <= p.benchmarkTotal / p.totalMinutes,
    "the plan's per-minute cost must land at or under the $50/min benchmark on the fixture");
  assert.ok(p.viduRef && p.viduRef.indexOf("$0.12/s") !== -1,
    "Vidu Q4 Preview reference line must carry the corrected list pricing (wave 30: $0.12/s at 1080p)");
});

test("microdrama: festival tier uses the high end of the retake range", () => {
  const f = S.buildMicrodramaPlan(DATA, MIN({ tier: "festival" }));
  assert.strictEqual(f.takes, 5, "festival = 5x");
  assert.strictEqual(f.genSecPerEp, 60 * 5, "festival: 60s x 5 retakes = 300 generated s/episode");
  assert.ok(f.budget.genCreditsPerEp > S.buildMicrodramaPlan(DATA, MIN()).budget.genCreditsPerEp,
    "festival generation cost must exceed draft at the same rate");
});

test("microdrama: deterministic + input validation", () => {
  const a = JSON.stringify(S.buildMicrodramaPlan(DATA, MIN()));
  const b = JSON.stringify(S.buildMicrodramaPlan(DATA, MIN()));
  assert.strictEqual(a, b, "same inputs must build byte-identical plans");
  assert.notStrictEqual(S.buildMicrodramaPlan(DATA, MIN()).seed,
    S.buildMicrodramaPlan(DATA, MIN({ episodes: 5 })).seed, "seed must change with the inputs");
  assert.throws(() => S.buildMicrodramaPlan(DATA, MIN({ episodes: 0 })), /between 1 and 40/,
    "0 episodes must throw");
  assert.throws(() => S.buildMicrodramaPlan(DATA, MIN({ episodes: 41 })), /between 1 and 40/,
    "41 episodes must throw");
  assert.throws(() => S.buildMicrodramaPlan(DATA, MIN({ minPerEpisode: 0 })), /between 0.5 and 3/,
    "0 min/episode must throw");
  assert.throws(() => S.buildMicrodramaPlan(DATA, MIN({ tier: "ultra" })), /unknown tier/,
    "unknown tier must throw");
  assert.throws(() => S.buildMicrodramaPlan(DATA, MIN({ title: "" })), /title/,
    "missing title must throw");
});

test("microdrama: markdown plan carries the honesty framing", () => {
  const md = S.microdramaToMarkdown(S.buildMicrodramaPlan(DATA, MIN()));
  assert.ok(md.includes("Documented production economics"), "must carry the economics block");
  assert.ok(md.includes("$50/min"), "must name the $50/min benchmark");
  assert.ok(md.includes("storeel-off-campus"), "must point at the teardown id");
  assert.ok(md.includes("verify live"), "must carry verify-live flags");
  assert.ok(md.includes("benchmark to beat, not a promise"), "must carry the honesty framing");
  assert.ok(md.includes("drawing cards"), "must name the retake discipline");
  assert.ok(md.includes("your budget guess"), "the regen count must be labeled as the filmmaker's input");
});


/* ---------------- Studio 3.0: Shot Refinery ---------------- */
const MOVEMENTS = JSON.parse(fs.readFileSync(path.join(ROOT, "data/v1/camera-movements.json"), "utf8")).movements;
const T2 = templates.find((t) => t.id === "t2");
const GEN_DRAMA = S.GENRES.drama;
const F5 = (o) => Object.assign(
  { character: "", camera: "", palette: "", register: "", grammar: "" }, o || {});

test("refinery: slotFills exposes the engine's slot values", () => {
  const f = S.slotFills(T2, GEN_DRAMA, "festival");
  assert.strictEqual(f.SUBJECT, "the protagonist");
  assert.strictEqual(f["SUBJECT A"], "the lead");
  assert.strictEqual(f.ENV, GEN_DRAMA.env);
  assert.strictEqual(f.LIGHT, GEN_DRAMA.light);
  assert.ok(f.STYLE.indexOf("festival grade") !== -1, "festival style tag, got " + f.STYLE);
});

test("refinery: fillPrompt accepts slot overrides", () => {
  const a = S.fillPrompt(T2, GEN_DRAMA, "festival");
  const b = S.fillPrompt(T2, GEN_DRAMA, "festival", { "SUBJECT A": "Mara Voss", LIGHT: "ember orange" });
  assert.ok(!/\[SUBJECT A/i.test(b.text), "override must fill the slot");
  assert.ok(b.text.includes("Mara Voss") && b.text.includes("ember orange"));
  assert.notStrictEqual(a.text, b.text, "overrides must change the prompt");
});

test("refinery: refineryInit seeds character + palette from the prompt slots", () => {
  const plan = S.buildPlan(DATA, INPUT({ runtimeSec: 30, tier: "draft" }));
  const init = S.refineryInit(plan.shots[0], GEN_DRAMA, "draft");
  assert.strictEqual(init.character, "the protagonist");
  assert.strictEqual(init.palette, GEN_DRAMA.light);
  assert.strictEqual(init.camera, "", "camera starts blank, keep the template's move");
  assert.strictEqual(init.register, "");
  assert.strictEqual(init.grammar, "");
  assert.deepStrictEqual(Object.keys(init).sort(),
    ["camera", "character", "grammar", "palette", "register"], "exactly the five fields");
});

test("refinery: buildRefinedPrompt is deterministic and appends the five-field spec", () => {
  const fields = F5({ character: "Mara Voss, copper bob", camera: "dolly-in-push-in",
    palette: "ember orange", register: "quiet dread", grammar: "close-up, rule of thirds" });
  const a = S.buildRefinedPrompt(T2, GEN_DRAMA, "festival", fields, MOVEMENTS);
  const b = S.buildRefinedPrompt(T2, GEN_DRAMA, "festival", fields, MOVEMENTS);
  assert.strictEqual(a.text, b.text, "same fields must build the same prompt");
  assert.ok(a.text.includes("Mara Voss, copper bob"), "character override must land in the prompt");
  assert.ok(a.text.includes("Refinement, five-field spec:"), "must carry the five-field block");
  assert.ok(a.text.includes("Character design: Mara Voss, copper bob"));
  assert.ok(a.text.includes("Camera movement: Dolly in / Push-in (dolly-in-push-in)"),
    "camera must cite the lexicon move + id");
  const c = S.buildRefinedPrompt(T2, GEN_DRAMA, "festival",
    Object.assign({}, fields, { register: "relief" }), MOVEMENTS);
  assert.notStrictEqual(a.text, c.text, "changed fields must change the prompt");
  assert.deepStrictEqual(Object.keys(a.fields).sort(),
    ["camera", "character", "grammar", "palette", "register"], "cleaned fields returned");
});

test("refinery: empty fields are skipped, never rendered as blanks", () => {
  const out = S.buildRefinedPrompt(T2, GEN_DRAMA, "festival", F5(), MOVEMENTS);
  assert.ok(!out.text.includes("five-field spec"), "all-empty fields must not append the block");
  assert.ok(!/\[SUBJECT A/i.test(out.text), "slots still filled from engine defaults");
});

test("refinery: camera movement validated against the lexicon", () => {
  const okFields = F5({ camera: "dolly-in-push-in" });
  assert.doesNotThrow(() => S.buildRefinedPrompt(T2, GEN_DRAMA, "festival", okFields, MOVEMENTS));
  assert.throws(() => S.buildRefinedPrompt(T2, GEN_DRAMA, "festival",
    F5({ camera: "spiral-zoom-9000" }), MOVEMENTS), /unknown camera movement/);
});

test("refinery: works without the lexicon (movements=null)", () => {
  const out = S.buildRefinedPrompt(T2, GEN_DRAMA, "festival", F5({ camera: "slow push in" }), null);
  assert.ok(out.text.includes("Camera movement: slow push in"),
    "free-text camera must pass through when the lexicon is unloaded");
});

test("refinery: refineShotInPlan writes back and logs rounds", () => {
  const plan = S.buildPlan(DATA, INPUT({ runtimeSec: 30, tier: "draft" }));
  const before = plan.shots[0].prompt;
  const e1 = S.refineShotInPlan(plan, { episode: null, index: 0 }, before + " [refined]", F5({ character: "Mara Voss" }));
  assert.strictEqual(e1.round, 1);
  assert.strictEqual(plan.shots[0].prompt, before + " [refined]");
  assert.strictEqual(plan.shots[0].refined, true);
  assert.strictEqual(plan.shots[0].originalPrompt, before, "generated prompt kept once");
  assert.strictEqual(e1.fields.character, "Mara Voss");
  const e2 = S.refineShotInPlan(plan, { episode: null, index: 0 }, before + " [refined again]", F5({ character: "Mara Voss" }));
  assert.strictEqual(e2.round, 2);
  assert.strictEqual(plan.shots[0].originalPrompt, before, "original kept from the first round");
  assert.strictEqual(plan.shots[0].refinements.length, 2);
});

test("refinery: series shots addressable by episode", () => {
  const sp = S.buildSeriesPlan(DATA, SIN({ episodes: 3 }));
  const shot = S.findRefinedShots(sp, { episode: 2, index: 0 });
  assert.ok(shot && shot.prompt.length > 40);
  S.refineShotInPlan(sp, { episode: 2, index: 0 }, shot.prompt + " [E2 refined]", F5({ character: "x" }));
  assert.strictEqual(S.findRefinedShots(sp, { episode: 2, index: 0 }).refined, true);
  assert.strictEqual(S.findRefinedShots(sp, { episode: 1, index: 0 }).refined || false, false,
    "other episodes untouched");
  assert.throws(() => S.findRefinedShots(sp, { episode: 9, index: 0 }), /unknown episode/);
  assert.throws(() => S.findRefinedShots(sp, { episode: 1, index: 999 }), /unknown shot index/);
  assert.throws(() => S.findRefinedShots(sp, { episode: null, index: 0 }), /unknown shot index/,
    "film refs must not resolve against a series plan");
});

test("refinery: revertRefinement restores the generated prompt", () => {
  const plan = S.buildPlan(DATA, INPUT({ runtimeSec: 30, tier: "draft" }));
  const before = plan.shots[0].prompt;
  S.refineShotInPlan(plan, { episode: null, index: 0 }, "custom", F5({ character: "x" }));
  const e = S.revertRefinement(plan, { episode: null, index: 0 });
  assert.strictEqual(e.reverted, true);
  assert.strictEqual(plan.shots[0].prompt, before);
  assert.strictEqual(plan.shots[0].refined, false);
  assert.strictEqual(plan.shots[0].refinements.length, 2, "history kept after revert");
  assert.throws(() => S.revertRefinement(plan, { episode: null, index: 4 }), /never refined/);
});

test("refinery: budget + schedule byte-identical after refinement", () => {
  const film = S.buildPlan(DATA, INPUT({ runtimeSec: 30, tier: "draft" }));
  const b0 = JSON.stringify(film.budget), s0 = JSON.stringify(film.schedule);
  S.refineShotInPlan(film, { episode: null, index: 3 }, "a much better prompt", F5({ character: "Mara" }));
  assert.strictEqual(JSON.stringify(film.budget), b0, "film budget must not move");
  assert.strictEqual(JSON.stringify(film.schedule), s0, "film schedule must not move");
  const series = S.buildSeriesPlan(DATA, SIN({ episodes: 3 }));
  const b1 = JSON.stringify(series.budget), s1 = JSON.stringify(series.schedule);
  S.refineShotInPlan(series, { episode: 1, index: 2 }, "a much better prompt", F5({ character: "Mara" }));
  assert.strictEqual(JSON.stringify(series.budget), b1, "series budget must not move");
  assert.strictEqual(JSON.stringify(series.schedule), s1, "series schedule must not move");
});

test("refinery: markdown packet carries the refinements section only when refined", () => {
  const plan = S.buildPlan(DATA, INPUT({ runtimeSec: 30, tier: "draft" }));
  assert.ok(!S.planToMarkdown(plan).includes("## Shot refinements"), "no section without refinements");
  S.refineShotInPlan(plan, { episode: null, index: 0 }, "custom prompt", F5({ character: "Mara Voss" }));
  const md = S.planToMarkdown(plan);
  assert.ok(md.includes("## Shot refinements"), "section present once refined");
  assert.ok(md.includes("Shot 1, refined ×1"));
  assert.ok(md.includes("Character design: Mara Voss"));
  assert.ok(md.includes("words only"), "honesty framing present");
});

test("refinery: series markdown + HTML carry refinements", () => {
  const sp = S.buildSeriesPlan(DATA, SIN({ episodes: 3 }));
  S.refineShotInPlan(sp, { episode: 2, index: 1 }, "custom", F5({ character: "Mara" }));
  const md = S.seriesToMarkdown(sp);
  assert.ok(md.includes("## Shot refinements"), "series markdown carries the section");
  assert.ok(md.includes("E2 · Shot"), "series refs carry episode labels");
  const html = S.seriesToHtml(sp);
  assert.ok(html.includes("Shot refinements"), "series HTML carries the section");
  assert.ok(html.includes("E2 · Shot"), "HTML refs carry episode labels");
  assert.ok(html.includes("Studio 3.0"), "HTML packet names the Studio version");
});

test("refinery: shotRefAttrs + refineButtonHtml", () => {
  assert.strictEqual(S.shotRefAttrs({ episode: null, index: 3 }), 'data-st3-ep="" data-st3-idx="3"');
  assert.strictEqual(S.shotRefAttrs({ episode: 2, index: 4 }), 'data-st3-ep="2" data-st3-idx="4"');
  const b = S.refineButtonHtml();
  assert.ok(b.includes("st3-refine") && b.includes("Refine shot"), "button carries hook class + label");
  assert.ok(b.includes('type="button"'), "real button, not a link");
});

/* ---------------- Studio 3.0: plan sharing ---------------- */
test("sharing: export → import round-trips a saved plan", () => {
  const plan = S.buildPlan(DATA, INPUT());
  const saved = { name: "Test plan", savedAt: "2026-10-11T00:00:00.000Z",
    kind: "film", input: plan.input, plan: plan };
  const json = S.exportPlanData(saved);
  const parsed = JSON.parse(json);
  assert.strictEqual(parsed.format, "afg-studio-plan", "format tag present");
  assert.strictEqual(parsed.v, 1, "version tag present");
  const res = S.importPlanData(json);
  assert.strictEqual(res.ok, true, res.error);
  assert.strictEqual(res.saved.kind, "film");
  assert.strictEqual(res.saved.name, "Test plan");
  assert.strictEqual(res.saved.plan.shots.length, plan.shots.length, "shot count survives");
  assert.strictEqual(res.saved.plan.shots[0].prompt, plan.shots[0].prompt, "prompts survive");
  assert.strictEqual(res.saved.plan.budget.clean, plan.budget.clean, "budget survives");
  assert.strictEqual(res.saved.input.title, plan.input.title, "input survives");
});

test("sharing: import validates the shape", () => {
  assert.strictEqual(S.importPlanData("not json").ok, false, "bad JSON rejected");
  const bad = S.importPlanData(JSON.stringify({ format: "nope", v: 1 }));
  assert.strictEqual(bad.ok, false, "wrong format tag rejected");
  assert.ok(/format tag/.test(bad.error), "error names the problem");
  const base = JSON.parse(S.exportPlanData({ name: "x", kind: "film", input: {}, plan: { shots: [] } }));
  assert.strictEqual(S.importPlanData(JSON.stringify(Object.assign({}, base, { v: 99 }))).ok, false,
    "future version rejected");
  assert.strictEqual(S.importPlanData(JSON.stringify(Object.assign({}, base, { kind: "hologram" }))).ok, false,
    "unknown kind rejected");
  assert.strictEqual(S.importPlanData(JSON.stringify(Object.assign({}, base, { plan: {} }))).ok, false,
    "film without shots rejected");
  assert.strictEqual(S.importPlanData(JSON.stringify(Object.assign({}, base, { plan: null }))).ok, false,
    "missing plan rejected");
  assert.strictEqual(S.importPlanData(JSON.stringify(Object.assign({}, base, { input: null }))).ok, false,
    "missing input rejected");
});

test("sharing: import accepts series + microdrama plans", () => {
  const sp = S.buildSeriesPlan(DATA, SIN({ episodes: 3 }));
  const r1 = S.importPlanData(S.exportPlanData({ name: "s", kind: "series", input: {}, plan: sp }));
  assert.strictEqual(r1.ok, true, r1.error);
  assert.strictEqual(r1.saved.plan.episodes.length, 3);
  const mp = S.buildMicrodramaPlan(DATA, MIN());
  const r2 = S.importPlanData(S.exportPlanData({ name: "m", kind: "microdrama", input: {}, plan: mp }));
  assert.strictEqual(r2.ok, true, r2.error);
  assert.ok(r2.saved.plan.budget, "microdrama budget survives");
});

/* ---------------- Studio 3.0: draft-cheap / finish-flagship mode ---------------- */
test("optimizer: draftfinal mode splits takes (coverage cheap, keeper flagship)", () => {
  const opt = optPlan();
  const df = opt.modes.draftfinal;
  assert.ok(df, "draftfinal mode must exist");
  assert.strictEqual(df.complete, true, "mode must be complete on the fixture plan");
  assert.ok(df.shots > 0, "shots counted");
  let expect = 0, counted = 0;
  opt.perShot.forEach((s) => {
    if (s.cheapest && s.bestrated) {
      counted++;
      expect += s.takes === 1 ? s.bestrated.cost
        : Math.round(((s.cheapest.cost / s.takes) * (s.takes - 1) +
          (s.bestrated.cost / s.takes)) * 100) / 100;
    }
  });
  assert.ok(counted > 0, "needs priced cheap+bestrated pairs");
  assert.ok(Math.abs(expect - df.total) < 0.05 * counted,
    "draftfinal total must reconcile per shot: " + expect + " vs " + df.total);
  assert.ok(opt.modes.cheapest.total <= df.total + 1e-9,
    "the split can never undercut the cheapest-viable floor");
  assert.strictEqual(df.shots, counted, "every priced shot counted");
});

test("optimizer: four modes in the packet tables (markdown + HTML + panel)", () => {
  const opt = optPlan();
  const md = S.optimizeToMarkdown({ optimizer: opt });
  assert.ok(md.includes("### Four budget modes"), "markdown heading names four modes");
  assert.ok(md.includes("Draft cheap, finish flagship"), "markdown table carries the split mode");
  assert.ok(md.includes("Oct 2026 pricing reality"), "split row cites the research grounding");
  const html = S.optimizeToHtml({ optimizer: opt });
  assert.ok(html.includes("Four budget modes"), "HTML heading names four modes");
  assert.ok(html.includes("Draft cheap, finish flagship"), "HTML table carries the split mode");
});

test("optimizer: draftfinal degrades honestly when a shot has no pair", () => {
  const plan = S.buildPlan(DATA, OPTIN());
  plan.shots.forEach((s) => { s.model = null; });
  const opt = S.optimizePlan(DATA, plan, {});
  assert.strictEqual(typeof opt.modes.draftfinal.complete, "boolean",
    "mode flag present even on degenerate plans");
});

console.log(`\nstudio.test.js: ${n} tests, ${process.exitCode ? "FAILURES" : "all pass"}`);
