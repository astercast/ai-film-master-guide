#!/usr/bin/env node
/* cut.test.js, Cut Sheet engine tests.
 * Pins the engine against the editing chapters' own rules
 * (craft/editing-pipeline.md + craft/editing-ai-footage.md):
 * the five pre-lock gates, the three inspection passes, the
 * 5-second rule (a long hold without the frame-by-frame
 * check reads uninspected), the structural rule (a
 * structural defect routed to repair reads misrouted), the
 * two-strike rule (two failed repairs strike a shot out),
 * picture-lock verdicts, and the markdown export's traces.
 * Output convention shared with grade.test.js.
 */
'use strict';
const assert = require('assert');
const E = require('../assets/js/cut.js');

let n = 0;
function ok(name, fn) { fn(); n += 1; console.log('ok ' + name); }

ok('gates: the chapters\u2019 five pre-lock gates, in order', () => {
  assert.deepStrictEqual(E.GATES.map((s) => s.id),
    ['selects', 'receipts', 'naming', 'soundled', 'lockorder']);
  assert.strictEqual(E.GATES.length, 5);
});

ok('passes: story, background, motion, the three-eyed inspection pass', () => {
  assert.deepStrictEqual(E.PASSES.map((s) => s.id), ['story', 'background', 'motion']);
});

ok('defects: none / local / structural, with the chapter\u2019s split', () => {
  assert.deepStrictEqual(E.DEFECTS.map((r) => r.id), ['none', 'local', 'structural']);
  assert.strictEqual(E.defectLabel('structural'), 'Structural, action, composition, identity');
  assert.strictEqual(E.defectLabel('nope'), 'No finding recorded ');
});

ok('statuses: in / repair / regen / cut', () => {
  assert.deepStrictEqual(E.STATUSES.map((s) => s.id), ['in', 'repair', 'regen', 'cut']);
  assert.strictEqual(E.statusLabel('regen'), 'Sent back, regenerate');
  assert.strictEqual(E.statusLabel('nope'), 'No route recorded ');
});

ok('default sheet: 6 shots, 5 clean, 1 held, 0 stopped, verdict is the hold', () => {
  const r = E.evaluate(E.DEFAULT_ENTRIES);
  assert.strictEqual(r.total, 6);
  assert.strictEqual(r.clean, 5);
  assert.strictEqual(r.held, 1);
  assert.strictEqual(r.stopped, 0);
  assert.strictEqual(r.ready, false);
  assert(r.verdict.includes('Hold picture lock, 1 shot is not ready'));
  assert.strictEqual(r.heldEntries[0].shot, 'Sc 3 · Sh 05, Hands on the shelter rail');
  assert.strictEqual(E.effectiveStatus(r.heldEntries[0]), 'repairing');
});

ok('finishing the rain stop repair clears the sheet', () => {
  const entries = JSON.parse(JSON.stringify(E.DEFAULT_ENTRIES));
  entries[3].status = 'in';
  entries[3].defect = 'none';
  const r = E.evaluate(entries);
  assert.strictEqual(r.ready, true);
  assert(r.verdict.includes('Picture lock clean'));
  assert(r.verdict.includes('24-hour rule'));
});

ok('the 5-second rule: a hold over 5s without the frame check reads uninspected and stops the lock', () => {
  const entries = JSON.parse(JSON.stringify(E.DEFAULT_ENTRIES));
  entries[2].framecheck = false; // the 6.8s shelter hold, unchecked
  assert.strictEqual(E.effectiveStatus(entries[2]), 'uninspected');
  const r = E.evaluate(entries);
  assert.strictEqual(r.stopped, 1);
  assert(r.verdict.includes('Picture lock stopped'));
  assert(r.verdict.includes('frame-by-frame check'));
  // at exactly 5s the rule does not bite; trimming under it also clears
  const e = { shot: 'X', duration: 5, framecheck: false, detail: '',
    passes: { story: true, background: true, motion: true }, defect: 'none', status: 'in', attempts: 0 };
  assert.strictEqual(E.effectiveStatus(e), 'clean');
});

ok('structural defect routed to repair reads misrouted; sent back, it reads sentback', () => {
  const e = { shot: 'X', duration: 3, framecheck: false, detail: '',
    passes: { story: true, background: true, motion: true }, defect: 'structural', status: 'repair', attempts: 0 };
  assert.strictEqual(E.effectiveStatus(e), 'misrouted');
  const r = E.evaluate([e]);
  assert(r.verdict.includes('Picture lock stopped'));
  assert(r.verdict.includes('fix the prompt, not the frames'));
  e.status = 'regen';
  assert.strictEqual(E.effectiveStatus(e), 'sentback');
});

ok('the two-strike rule: a second failed repair strikes the shot out', () => {
  const e = { shot: 'X', duration: 3, framecheck: false, detail: '',
    passes: { story: true, background: true, motion: true }, defect: 'local', status: 'repair', attempts: 1 };
  assert.strictEqual(E.effectiveStatus(e), 'repairing');
  e.attempts = 2;
  assert.strictEqual(E.effectiveStatus(e), 'struck');
  const r = E.evaluate([e]);
  assert(r.verdict.includes('two-strike rule'));
  e.status = 'regen';
  assert.strictEqual(E.effectiveStatus(e), 'sentback');
});

ok('unfinished inspection holds a shot claimed in the cut; a carried local defect holds it too', () => {
  const e = { shot: 'X', duration: 3, framecheck: false, detail: '',
    passes: { story: true, background: false, motion: true }, defect: 'none', status: 'in', attempts: 0 };
  assert.strictEqual(E.effectiveStatus(e), 'unchecked');
  assert.strictEqual(E.passCount(e), 2);
  e.passes.background = true;
  e.defect = 'local';
  assert.strictEqual(E.effectiveStatus(e), 'carrying');
});

ok('a shot cut from the film blocks nothing, whatever its state', () => {
  const e = { shot: 'X', duration: 9, framecheck: false, detail: '',
    passes: { story: false, background: false, motion: false }, defect: 'structural', status: 'cut', attempts: 5 };
  assert.strictEqual(E.effectiveStatus(e), 'cut');
  const r = E.evaluate([e]);
  assert.strictEqual(r.cut, 1);
  assert.strictEqual(r.stopped, 0);
  assert.strictEqual(r.ready, true);
});

ok('misrouted outranks struck, struck outranks uninspected', () => {
  const base = { framecheck: false, detail: '', passes: { story: true, background: true, motion: true } };
  const entries = [
    Object.assign({}, base, { shot: 'A', duration: 8, defect: 'none', status: 'in', attempts: 0 }),
    Object.assign({}, base, { shot: 'B', duration: 3, defect: 'local', status: 'repair', attempts: 2 }),
    Object.assign({}, base, { shot: 'C', duration: 3, defect: 'structural', status: 'repair', attempts: 0 }),
  ];
  const r = E.evaluate(entries);
  assert.strictEqual(r.stopped, 3);
  assert(r.verdict.includes('structural defect routed to repair'));
});

ok('empty sheet: no verdict of clean, prompts to log shots', () => {
  const r = E.evaluate([]);
  assert.strictEqual(r.total, 0);
  assert.strictEqual(r.ready, false);
  assert(r.verdict.includes('No cut sheet yet'));
  assert.strictEqual(E.evaluate(null).total, 0);
});

ok('gateState: counts, missing, complete', () => {
  const gs = E.gateState(['selects', 'lockorder']);
  assert.strictEqual(gs.done, 2);
  assert.strictEqual(gs.total, 5);
  assert.strictEqual(gs.complete, false);
  assert.deepStrictEqual(gs.missing.map((s) => s.id), ['receipts', 'naming', 'soundled']);
  assert.strictEqual(E.gateState(E.GATES.map((s) => s.id)).complete, true);
  assert.strictEqual(E.gateState().done, 0);
});

ok('export: markdown carries title, gate marks, shots with passes + finding + route, verdict, counts', () => {
  const md = E.sheetToMarkdown('The Night Bus', E.DEFAULT_ENTRIES, ['selects', 'receipts']);
  assert(md.startsWith('# Cut sheet, The Night Bus'));
  assert(md.includes('- [x] Selects discipline held: 2 to 4 takes, one keeper'));
  assert(md.includes('- [ ] Lock order respected: picture before grade and mix, upscale last'));
  assert(md.includes('Sc 3 · Sh 05, Hands on the shelter rail, In repair, on the ladder. Duration: 2.4s'));
  assert(md.includes('Frame check: not done'));
  assert(md.includes('Finding: Local, bad frames, one element, jitter'));
  assert(md.includes('Repair attempts: 1'));
  assert(md.includes('## Picture-lock verdict'));
  assert(md.includes('Clean: 5 · held: 1 · stopped: 0 · cut from the film: 0.'));
  assert(md.endsWith('\n'));
});

ok('export: untitled + empty sheet still produces a file', () => {
  const md = E.sheetToMarkdown('', [], []);
  assert(md.includes('Untitled production'));
  assert(md.includes('- (none logged)'));
});

console.log('cut.test.js: ' + n + ' tests, all pass');
