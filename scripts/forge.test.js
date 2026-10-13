/* forge.test.js — Episode Forge engine tests against the REAL repo data
   (data/v1/prompt-templates.json + prompts-facets.json + teardowns.json).
   Run: node scripts/forge.test.js — exits non-zero on any failure. */
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const Forge = require(path.join(ROOT, "assets/js/forge.js"));

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; console.log("ok - " + name); }
  else { fail++; console.log("FAIL - " + name); }
}

const templates = JSON.parse(fs.readFileSync(path.join(ROOT, "data/v1/prompt-templates.json"), "utf8")).templates;
const facetsDoc = JSON.parse(fs.readFileSync(path.join(ROOT, "prompts-facets.json"), "utf8"));
const teardownsDoc = JSON.parse(fs.readFileSync(path.join(ROOT, "data/v1/teardowns.json"), "utf8"));
const teardowns = {};
for (const t of teardownsDoc.teardowns) {
  teardowns[t.id] = { id: t.id, title: t.title, lesson: (t.shots && t.shots[0] && t.shots[0].lesson) || "" };
}
const DATA = { templates, facets: facetsDoc.facets, teardowns };

ok(templates.length === 47, "library carries 47 templates (got " + templates.length + ")");
ok(Forge.ARC.length === 8, "arc has 8 beats");
ok(Forge.ARC.map(b => b.act).filter((v, i, a) => a.indexOf(v) === i).length === 3, "arc spans exactly 3 acts");
ok(Forge.ARC[0].id === "hook" && Forge.ARC[7].id === "cliffhanger", "arc opens on the hook, ends on the cliffhanger");
ok(Object.keys(Forge.EMOTION_MOODS).length === 12, "12 one-emotion choices (the planner's vocabulary)");

const input = { title: "Night Taxi", premise: "A toddler rides alone to find her father", format: "minidrama", emotion: "longing", episode: 3 };
const plan = Forge.buildPlan(input, DATA);
ok(plan.beats.length === 8, "plan has 8 beats");
const ids = plan.beats.filter(b => b.covered).map(b => b.template.id);
ok(new Set(ids).size === ids.length, "no template is reused across beats");
ok(ids.every(id => templates.some(t => t.id === id)), "every attached template is a real library record");
ok(plan.beats.every(b => !b.covered || b.score >= Forge.MIN_SCORE), "covered beats clear the match bar");
ok(plan.beats.every(b => b.covered || b.template === null), "uncovered beats carry no invented template");

const plan2 = Forge.buildPlan(input, DATA);
ok(JSON.stringify(plan.beats.map(b => b.template && b.template.id)) ===
   JSON.stringify(plan2.beats.map(b => b.template && b.template.id)), "plan is deterministic");

/* every emotion produces a valid plan shape */
for (const emo of Object.keys(Forge.EMOTION_MOODS)) {
  const p = Forge.buildPlan({ emotion: emo, episode: 1, format: "minidrama" }, DATA);
  if (p.beats.length !== 8) { ok(false, "emotion " + emo + " yields 8 beats"); break; }
  if (emo === "joy") ok(true, "all 12 emotions yield an 8-beat plan");
}

/* teardown lessons attach only through real facet links */
let lessonOk = true;
for (const emo of Object.keys(Forge.EMOTION_MOODS)) {
  const p = Forge.buildPlan({ emotion: emo, episode: 1 }, DATA);
  for (const b of p.beats) {
    if (b.teardown) {
      const links = (facetsDoc.facets[b.template.id] || {}).teardowns || [];
      if (!links.includes(b.teardown.id) || !b.teardown.lesson) lessonOk = false;
    }
  }
}
ok(lessonOk, "teardown lessons attach only via the facets' own teardown links, with real lesson text");

/* a beat starved of data says so instead of inventing coverage */
const starved = Forge.buildPlan({ emotion: "longing", episode: 1 },
  { templates: templates.slice(0, 1), facets: facetsDoc.facets, teardowns });
ok(starved.coveredCount <= 1 && starved.beats.some(b => !b.covered),
  "starved library yields uncovered beats, not invented templates");

const md = Forge.planToMarkdown(plan, { minidrama: "Mini-drama" });
ok(md.includes("Episode 3"), "export names the episode");
ok(md.includes("Night Taxi"), "export carries the series title");
ok(ids.every(id => md.includes("(" + id + ")")), "export traces every attached template by id");
ok(md.includes("G2 Script") && md.includes("G4 Keyframes"), "export carries the episode gates from the craft chapter");
ok(!plan.beats.some(b => b.covered) || md.includes("Prompt:"), "export includes the real prompt text");

console.log(fail === 0 ? `forge.test.js: ${pass} assertions, all pass` : `forge.test.js: ${fail} FAILURES`);
process.exit(fail ? 1 : 0);
