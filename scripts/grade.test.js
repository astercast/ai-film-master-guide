#!/usr/bin/env node
/* grade.test.js — Grade Sheet engine tests.
 * Pins the engine against the color-grading chapter's own
 * rules (craft/color-grading.md): the five pre-grade gates,
 * the five matching steps in the chapter's order (unification
 * pass, then the de-plasticize stack, skin last), the sources,
 * the no-reference-is-unmatched rule, drift-style verdicts
 * (drifting holds, unmatched stops), and the markdown
 * export's traces.
 * Output convention shared with cuesheet.test.js.
 */
'use strict';
const assert = require('assert');
const E = require('../assets/js/grade.js');

let n = 0;
function ok(name, fn) { fn(); n += 1; console.log('ok ' + name); }

ok('gates: the chapter\u2019s five pre-grade gates, in order', () => {
  assert.deepStrictEqual(E.GATES.map((s) => s.id),
    ['plategrade', 'reference', 'showlook', 'grain', 'masters']);
  assert.strictEqual(E.GATES.length, 5);
});

ok('steps: exposure, contrast, saturation, texture, skin — unification then stack, skin last', () => {
  assert.deepStrictEqual(E.STEPS.map((s) => s.id),
    ['exposure', 'contrast', 'saturation', 'texture', 'skin']);
});

ok('sources: single / mixed, with the house-grade rule on mixed', () => {
  assert.deepStrictEqual(E.SOURCES.map((r) => r.id), ['single', 'mixed']);
  assert.strictEqual(E.sourceLabel('mixed'), 'Mixed models — house grades differ');
  assert.strictEqual(E.sourceLabel('nope'), '— no source recorded —');
});

ok('statuses: unified / drifting / unmatched', () => {
  assert.deepStrictEqual(E.STATUSES.map((s) => s.id), ['unified', 'drifting', 'unmatched']);
  assert.strictEqual(E.statusLabel('unmatched'), 'Unmatched — its own built-in grade');
  assert.strictEqual(E.statusLabel('nope'), '— no state recorded —');
});

ok('default sheet: 5 scenes, 4 unified, 1 drifting, 0 unmatched — verdict is the hold', () => {
  const r = E.evaluate(E.DEFAULT_ENTRIES);
  assert.strictEqual(r.total, 5);
  assert.strictEqual(r.unified, 4);
  assert.strictEqual(r.drifting, 1);
  assert.strictEqual(r.unmatched, 0);
  assert.strictEqual(r.clean, false);
  assert(r.verdict.includes('Hold the grade — 1 scene is drifting'));
  assert.strictEqual(r.driftingEntries[0].scene, 'Sc 3 — The rain stop');
  assert.strictEqual(E.stepCount(r.driftingEntries[0]), 2);
});

ok('finishing the rain stop\u2019s stack clears the sheet', () => {
  const entries = JSON.parse(JSON.stringify(E.DEFAULT_ENTRIES));
  entries[2].steps.saturation = true;
  entries[2].steps.texture = true;
  entries[2].steps.skin = true;
  const r = E.evaluate(entries);
  assert.strictEqual(r.clean, true);
  assert(r.verdict.includes('Grade clean'));
  assert(r.verdict.includes('skin-tone line'));
});

ok('no hero reference reads unmatched whatever the recorded state (the chapter\u2019s hardest rule)', () => {
  const e = { scene: 'X', source: 'single', reference: false, detail: '',
    steps: { exposure: true, contrast: true, saturation: true, texture: true, skin: true }, status: 'unified' };
  assert.strictEqual(E.effectiveStatus(e), 'unmatched');
  const r = E.evaluate([e]);
  assert.strictEqual(r.unmatched, 1);
  assert(r.verdict.includes('Grade stopped'));
  assert(r.verdict.includes('nothing to match to'));
});

ok('claimed unified with steps unfinished reads drifting', () => {
  const e = { scene: 'X', source: 'mixed', reference: true, detail: '',
    steps: { exposure: true, contrast: false, saturation: false, texture: false, skin: false }, status: 'unified' };
  assert.strictEqual(E.effectiveStatus(e), 'drifting');
});

ok('unmatched outranks drifting in the verdict', () => {
  const entries = [
    { scene: 'A', source: 'single', reference: true, detail: '', steps: {}, status: 'drifting' },
    { scene: 'B', source: 'single', reference: false, detail: '', steps: {}, status: 'unified' },
  ];
  assert(E.evaluate(entries).verdict.includes('Grade stopped'));
});

ok('empty sheet: no verdict of clean, prompts to log scenes', () => {
  const r = E.evaluate([]);
  assert.strictEqual(r.total, 0);
  assert.strictEqual(r.clean, false);
  assert(r.verdict.includes('No grade sheet yet'));
  assert.strictEqual(E.evaluate(null).total, 0);
});

ok('gateState: counts, missing, complete', () => {
  const gs = E.gateState(['plategrade', 'masters']);
  assert.strictEqual(gs.done, 2);
  assert.strictEqual(gs.total, 5);
  assert.strictEqual(gs.complete, false);
  assert.deepStrictEqual(gs.missing.map((s) => s.id), ['reference', 'showlook', 'grain']);
  assert.strictEqual(E.gateState(E.GATES.map((s) => s.id)).complete, true);
  assert.strictEqual(E.gateState().done, 0);
});

ok('export: markdown carries title, gate marks, scenes with source + steps, verdict, counts', () => {
  const md = E.sheetToMarkdown('The Night Bus', E.DEFAULT_ENTRIES, ['plategrade', 'reference']);
  assert(md.startsWith('# Grade sheet — The Night Bus'));
  assert(md.includes('- [x] Every element assigned: plate or grade'));
  assert(md.includes('- [ ] Pre-grade masters archived'));
  assert(md.includes('Sc 3 — The rain stop — Drifting — partly matched. Source: Mixed models'));
  assert(md.includes('Reference: hero chosen'));
  assert(md.includes('Saturation —'));
  assert(md.includes('## Grade verdict'));
  assert(md.includes('Unified: 4 · drifting: 1 · unmatched: 0.'));
  assert(md.endsWith('\n'));
});

ok('export: untitled + empty sheet still produces a file', () => {
  const md = E.sheetToMarkdown('', [], []);
  assert(md.includes('Untitled production'));
  assert(md.includes('- (none logged)'));
});

console.log('grade.test.js: ' + n + ' tests, all pass');
