/* clearance.test.js — Script Clearance desk engine tests against the
   REAL rule set (research cycle 81, rules 1358–1367 in
   assets/js/clearance.js — the same data build_site.py pre-renders).
   Run: node scripts/clearance.test.js — exits non-zero on any failure. */
"use strict";
const path = require("path");
const ROOT = path.join(__dirname, "..");
const C = require(path.join(ROOT, "assets/js/clearance.js"));

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; console.log("ok - " + name); }
  else { fail++; console.log("FAIL - " + name); }
}

ok(C.STEPS.length === 10, "the file has exactly ten steps (got " + C.STEPS.length + ")");
ok(C.STEPS.map(s => s.n).join(",") === "1358,1359,1360,1361,1362,1363,1364,1365,1366,1367",
  "steps are rules 1358–1367 in order");
ok(C.STEPS.every(s => s.what && s.when && s.name), "every step states what it is and when it is required");
ok(new Set(C.STEPS.map(s => s.stage)).size === 3, "steps span the three stages (before / during / closing)");
ok(C.DECISIONS.map(d => d.id).join(",") === "license,substitute,change-use,assume-risk",
  "the four recorded decisions are rule 1366's: license, substitute, change the use, assume the risk");

const r0 = C.evaluate(C.DEFAULT_ITEMS);
ok(r0.total === 8 && r0.flagged === 5 && r0.clear === 3, "worked example: 8 items, 5 flagged, 3 clear");
ok(r0.open === 1 && r0.gateOpen === false, "worked example: one undecided flag holds the gate (rule 1366)");
ok(r0.verdict.includes("Gate held") && r0.verdict.includes("1367"), "held verdict cites the gate rule");

const closed = JSON.parse(JSON.stringify(C.DEFAULT_ITEMS));
closed.forEach(i => { if (i.flagged && !i.decision) i.decision = "license"; });
const r1 = C.evaluate(closed);
ok(r1.open === 0 && r1.gateOpen === true, "closing the last flag with a recorded decision opens the gate");
ok(r1.byDecision.license === 2 && r1.byDecision.substitute === 1 &&
   r1.byDecision["change-use"] === 1 && r1.byDecision["assume-risk"] === 1,
  "decisions are counted by kind");

const r2 = C.evaluate([]);
ok(r2.gateOpen === false && r2.verdict.includes("No file yet"), "an empty file is not a passed gate");
const r3 = C.evaluate([{ label: "x", kind: "title", flagged: true, decision: "waive" }]);
ok(r3.open === 1 && r3.gateOpen === false, "an invented decision value does not close a flag");

const cs0 = C.checklistState([]);
ok(cs0.done === 0 && cs0.total === 10 && cs0.complete === false, "checklist starts incomplete");
const csAll = C.checklistState(C.STEPS.map(s => s.id));
ok(csAll.complete === true && csAll.missing.length === 0, "all ten steps done completes the file");

const md = C.fileToMarkdown("Test Short", closed, C.STEPS.map(s => s.id));
ok(md.includes("Rule 1358") && md.includes("Rule 1367"), "export carries the ten rules");
ok(md.includes("Gate open"), "export carries the gate verdict");
ok(md.includes("Substitute it") && md.includes("Expressly assume the risk"), "export traces every recorded decision by label");
ok(md.includes("Not legal advice"), "export carries the not-legal-advice line");
const md2 = C.fileToMarkdown("Test Short", C.DEFAULT_ITEMS, []);
ok(md2.includes("no decision recorded"), "export names an undecided flag instead of hiding it");

console.log(fail === 0 ? `clearance.test.js: ${pass} assertions, all pass` : `clearance.test.js: ${fail} FAILURES`);
process.exit(fail ? 1 : 0);
