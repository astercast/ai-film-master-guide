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

console.log(`\nstudio.test.js: ${n} tests, ${process.exitCode ? "FAILURES" : "all pass"}`);
