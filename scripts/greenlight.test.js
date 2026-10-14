/* Green Light engine unit tests, run with: node scripts/greenlight.test.js
   Exercises the pure engine exported by assets/js/greenlight.js against the
   REAL site data (data/v1/models.json + data/v1/prompt-templates.json +
   data/v1/pricing.json). */
"use strict";

const assert = require("assert");
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..");
const G = require(path.join(ROOT, "assets/js/greenlight.js"));
const S = require(path.join(ROOT, "assets/js/studio.js"));
const models = JSON.parse(fs.readFileSync(path.join(ROOT, "data/v1/models.json"), "utf8")).models;
const templates = JSON.parse(fs.readFileSync(path.join(ROOT, "data/v1/prompt-templates.json"), "utf8")).templates;
const pricingDoc = JSON.parse(fs.readFileSync(path.join(ROOT, "data/v1/pricing.json"), "utf8"));
const DATA = { models, templates };
const ENTRIES = G.normalizePricing(pricingDoc);

let n = 0;
function test(name, fn) {
  n++;
  try { fn(); console.log("ok " + n + " - " + name); }
  catch (e) { console.error("FAIL " + n + " - " + name + ": " + e.message); process.exitCode = 1; }
}

const WEAK = "a dog in a city";
const STRONG = "Mara, a weathered fisherwoman in her sixties, silver braid, oilskin coat, " +
  "mending a torn net on a fog-draped wooden dock at dawn; the camera pushes in slowly " +
  "from medium to close-up; cold blue dawn light with a warm lantern glow from frame left; " +
  "quiet resilience; coat hem stirring in the sea breeze.";

/* ---- the read ---- */
test("weak prompt: low score, cold grade", () => {
  const r = G.readRoom(WEAK);
  assert.ok(r.score < 45, "score=" + r.score);
  assert.ok(r.missing.length >= 3, "missing=" + r.missing.length);
  assert.strictEqual(r.unusable, false);
});
test("strong prompt: high score, warm grade", () => {
  const r = G.readRoom(STRONG);
  assert.ok(r.score >= 70, "score=" + r.score);
  assert.strictEqual(r.presentCount, 6);
});
test("empty concept is unusable (empty)", () => {
  const r = G.readRoom("   ");
  assert.strictEqual(r.unusable, true);
  assert.strictEqual(r.unusableReason, "empty");
});
test("keysmash is unusable (gibberish)", () => {
  const r = G.readRoom("xqzwrt bnmplk jhgfds vccxzz");
  assert.strictEqual(r.unusable, true);
  assert.strictEqual(r.unusableReason, "gibberish");
});
test("named subject detected via capitalization", () => {
  const r = G.readRoom("Mara walks through the market at dawn");
  const subj = r.layers.find((l) => l.key === "subject");
  assert.ok(subj.present, "Mara should count as a subject");
});
test("non-English flagged, not rejected", () => {
  const r = G.readRoom("el perro corre por la ciudad de noche bajo la lluvia");
  assert.strictEqual(r.lang, "Spanish");
  assert.strictEqual(r.unusable, false);
});
test("Veo 4 hype flagged with the correction", () => {
  const r = G.readRoom("a robot uprising rendered on Veo 4, dramatic");
  assert.strictEqual(r.hype.length, 1);
  assert.ok(/doesn't exist/.test(r.hype[0].note), r.hype[0].note);
});
test("Kling 4.0 hype flagged as announced-not-shipped", () => {
  const r = G.readRoom("shot on Kling 4.0, neon city chase");
  assert.ok(r.hype.some((h) => /announced, not shipped/.test(h.note)));
});
test("Sora flagged as discontinued", () => {
  const r = G.readRoom("a Sora short about the ocean");
  assert.ok(r.hype.some((h) => /discontinued/.test(h.note)));
});

/* ---- punch-ups ---- */
test("punch-up clauses exist for the five craft layers", () => {
  const r = G.readRoom(WEAK);
  const keys = r.missing.map((l) => l.key);
  const ups = G.punchUpClauses(WEAK, keys);
  assert.ok(ups.length >= 3, "ups=" + ups.length);
  ups.forEach((u) => assert.ok(u.clause.length > 4, u.key));
});
test("applyPunchUp appends cleanly and raises the score", () => {
  const r0 = G.readRoom(WEAK);
  const ups = G.punchUpClauses(WEAK, r0.missing.map((l) => l.key));
  let text = WEAK;
  ups.forEach((u) => { text = G.applyPunchUp(text, u.clause); });
  const r1 = G.readRoom(text);
  assert.ok(r1.score > r0.score, r0.score + " -> " + r1.score);
  assert.ok(r1.score >= 70, "punched-up weak prompt should clear 70, got " + r1.score);
});
test("punch-ups are deterministic", () => {
  const a = G.punchUpClauses(WEAK, ["camera", "light"]);
  const b = G.punchUpClauses(WEAK, ["camera", "light"]);
  assert.deepStrictEqual(a, b);
});

/* ---- pricing ---- */
test("pricing entries normalize (discontinued excluded)", () => {
  assert.ok(ENTRIES.length >= 20, "entries=" + ENTRIES.length);
  assert.ok(!ENTRIES.some((e) => e.id === "sora-2"), "Sora excluded");
});
test("Veo 3.1 resolves; festival/1080p picks standard tier", () => {
  const p = G.priceShot(ENTRIES, "Veo 3.1", 8, 3, "1080p", "festival");
  assert.strictEqual(p.unpriced, false);
  assert.ok(/standard-1080p/.test(p.tierName), p.tierName);
  assert.ok(Math.abs(p.low - 9.60) < 0.01, "got " + p.low); /* the $3.20/8s figure, ×3 takes */
});
test("Veo 3.1 draft picks the cheapest tier (lite-1080p)", () => {
  const p = G.priceShot(ENTRIES, "Veo 3.1", 8, 3, "1080p", "draft");
  assert.strictEqual(p.unpriced, false);
  assert.ok(/lite-1080p/.test(p.tierName), p.tierName);
  assert.ok(p.low < 9.60, "draft cheaper than flagship: " + p.low);
});
test("Kling 3.0 10s = $0.84 at 720p", () => {
  const p = G.priceShot(ENTRIES, "Kling 3.0", 10, 1, "720p", "draft");
  assert.strictEqual(p.unpriced, false);
  assert.ok(Math.abs(p.low - 0.84) < 0.001, "got " + p.low);
});
test("Kling 4.0 is unpriced (announced, no price)", () => {
  const p = G.priceShot(ENTRIES, "Kling 4.0", 8, 3, "1080p", "festival");
  assert.strictEqual(p.unpriced, true);
  assert.ok(/announced/.test(p.reason), p.reason);
});
test("unknown model is unpriced, honestly", () => {
  const p = G.priceShot(ENTRIES, "Dream-O-Matic 9000", 8, 3, "1080p", "festival");
  assert.strictEqual(p.unpriced, true);
});
test("selectTier falls back 4k → 1080p when no 4k tier", () => {
  const entry = G.matchEntry(ENTRIES, "Hailuo 02 / 2.3");
  const t = G.selectTier(entry, "4k", "festival");
  assert.ok(t && /1080p/.test(t.tier), "fell back to " + (t && t.tier));
});

/* ---- the meeting ---- */
const INPUT = (o) => Object.assign(
  { title: "Dog in the City", logline: WEAK, genre: "action",
    runtimeSec: 30, resKey: "1080p", ambition: "festival" }, o || {});

test("cold read + festival ambition = priced at draft (money rule)", () => {
  const m = G.buildMeeting(DATA, pricingDoc, INPUT(), S);
  assert.strictEqual(m.input.effTier, "draft");
  assert.strictEqual(m.input.tierDowngraded, true);
  assert.ok(m.verdict.notes.some((x) => /draft money/.test(x) || /festival money/.test(x)));
});
test("warm read + festival ambition = flagship pricing", () => {
  const m = G.buildMeeting(DATA, pricingDoc, INPUT({ logline: STRONG, title: "The Net Mender" }), S);
  assert.strictEqual(m.input.effTier, "festival");
  assert.strictEqual(m.input.tierDowngraded, false);
});
test("meeting is deterministic", () => {
  const a = JSON.stringify(G.buildMeeting(DATA, pricingDoc, INPUT(), S));
  const b = JSON.stringify(G.buildMeeting(DATA, pricingDoc, INPUT(), S));
  assert.strictEqual(a, b);
});
test("every priced shot shows its math", () => {
  const m = G.buildMeeting(DATA, pricingDoc, INPUT({ logline: STRONG, title: "The Net Mender" }), S);
  m.shots.filter((s) => !s.pricing.unpriced).forEach((s) => {
    assert.ok(/\$\d+\.\d+\/s × \d+s × \d+ takes/.test(s.pricing.math), s.pricing.math);
  });
});
test("budget totals reconcile with shot sums", () => {
  const m = G.buildMeeting(DATA, pricingDoc, INPUT({ logline: STRONG, title: "The Net Mender" }), S);
  const sumLow = m.lines.reduce((a, l) => a + l.low, 0);
  assert.ok(Math.abs(sumLow - m.totals.cleanLow) < 0.02, sumLow + " vs " + m.totals.cleanLow);
  assert.ok(Math.abs(m.totals.fiveLow - m.totals.cleanLow * 5) < 0.02);
  assert.ok(Math.abs(m.totals.twentyLow - m.totals.cleanLow * 20) < 0.02);
});
test("schedule days are sequential and total", () => {
  const m = G.buildMeeting(DATA, pricingDoc, INPUT(), S);
  m.days.forEach((d, i) => assert.strictEqual(d.day, i + 1));
  assert.strictEqual(m.totalDays, m.days.length);
  assert.ok(m.days[m.days.length - 1].phase === "Lock the cut");
});
test("unusable concept returns no meeting", () => {
  const m = G.buildMeeting(DATA, pricingDoc, INPUT({ logline: "xqzwrt bnmplk jhgfds" }), S);
  assert.strictEqual(m.unusable, true);
});
test("verdict: strong read greens, weak read passes", () => {
  const good = G.buildMeeting(DATA, pricingDoc, INPUT({ logline: STRONG, title: "The Net Mender" }), S);
  assert.strictEqual(good.verdict.level, "green");
  const bad = G.buildMeeting(DATA, pricingDoc, INPUT(), S);
  assert.strictEqual(bad.verdict.level, "pass");
});
test("markdown export contains the beats", () => {
  const m = G.buildMeeting(DATA, pricingDoc, INPUT({ logline: STRONG, title: "The Net Mender" }), S);
  const md = G.meetingToMarkdown(m);
  assert.ok(md.includes("# Green light, The Net Mender"));
  assert.ok(md.includes("## The board"));
  assert.ok(md.includes("## The money"));
  assert.ok(md.includes("## The schedule"));
  assert.ok(md.includes("## The verdict, GREEN LIGHT"));
  assert.ok(md.includes("pricing.json"));
});
test("genre validation surfaces bad genres", () => {
  assert.throws(() => G.buildMeeting(DATA, pricingDoc, INPUT({ genre: "noir-western" }), S),
    /unknown genre/);
});

console.log(`\ngreenlight.test.js: ${n} tests, ${process.exitCode ? "FAILURES" : "all pass"}`);
