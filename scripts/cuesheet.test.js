#!/usr/bin/env node
/* cuesheet.test.js — Cue Sheet engine tests.
 * Pins the engine against the sound chapter's own rules
 * (craft/sound-music-audio.md): the five pre-mix gates, the
 * three layers per scene, the dialogue routes, the no-bed-is-dry
 * rule, drift-style verdicts (thin holds, dry stops), and the
 * markdown export's traces.
 * Output convention shared with continuity.test.js / forge.test.js.
 */
'use strict';
const assert = require('assert');
const E = require('../assets/js/cuesheet.js');

let n = 0;
function ok(name, fn) { fn(); n += 1; console.log('ok ' + name); }

ok('gates: the chapter\u2019s five pre-mix gates, in order', () => {
  assert.deepStrictEqual(E.GATES.map((s) => s.id),
    ['bible', 'routes', 'lockedcut', 'stems', 'receipts']);
  assert.strictEqual(E.GATES.length, 5);
});

ok('layers: bed, foley, accents — the chapter\u2019s three layers', () => {
  assert.deepStrictEqual(E.LAYERS.map((l) => l.id), ['bed', 'foley', 'accents']);
});

ok('routes: decoupled / native / none, with the exact-words rule on decoupled', () => {
  assert.deepStrictEqual(E.ROUTES.map((r) => r.id), ['decoupled', 'native', 'none']);
  assert.strictEqual(E.routeLabel('decoupled'), 'Decoupled — voice built separately, lip-sync pass');
  assert.strictEqual(E.routeLabel('nope'), '— no route recorded —');
});

ok('statuses: designed / thin / dry', () => {
  assert.deepStrictEqual(E.STATUSES.map((s) => s.id), ['designed', 'thin', 'dry']);
  assert.strictEqual(E.statusLabel('dry'), 'Dry — drops to digital silence');
  assert.strictEqual(E.statusLabel('nope'), '— no state recorded —');
});

ok('default sheet: 5 scenes, 4 designed, 1 thin, 0 dry — verdict is the hold', () => {
  const r = E.evaluate(E.DEFAULT_ENTRIES);
  assert.strictEqual(r.total, 5);
  assert.strictEqual(r.designed, 4);
  assert.strictEqual(r.thin, 1);
  assert.strictEqual(r.dry, 0);
  assert.strictEqual(r.clean, false);
  assert(r.verdict.includes('Hold the mix — 1 scene is thin'));
  assert.strictEqual(r.thinEntries[0].scene, 'Sc 3 — The rain stop');
  assert.strictEqual(E.layerCount(r.thinEntries[0]), 2);
});

ok('laying the missing foley and marking the scene designed clears the sheet', () => {
  const entries = JSON.parse(JSON.stringify(E.DEFAULT_ENTRIES));
  entries[2].layers.foley = true;
  entries[2].status = 'designed';
  const r = E.evaluate(entries);
  assert.strictEqual(r.clean, true);
  assert(r.verdict.includes('Mix clean'));
  assert(r.verdict.includes('silence test'));
});

ok('no bed reads dry whatever the recorded state (the chapter\u2019s hardest rule)', () => {
  const e = { scene: 'X', route: 'native', detail: '', layers: { bed: false, foley: true, accents: true }, status: 'designed' };
  assert.strictEqual(E.effectiveStatus(e), 'dry');
  const r = E.evaluate([e]);
  assert.strictEqual(r.dry, 1);
  assert(r.verdict.includes('Mix stopped'));
  assert(r.verdict.includes('digital silence'));
});

ok('dry outranks thin in the verdict', () => {
  const entries = [
    { scene: 'A', route: 'none', detail: '', layers: { bed: true, foley: false, accents: true }, status: 'thin' },
    { scene: 'B', route: 'none', detail: '', layers: { bed: true, foley: true, accents: true }, status: 'dry' },
  ];
  assert(E.evaluate(entries).verdict.includes('Mix stopped'));
});

ok('empty sheet: no verdict of clean, prompts to log scenes', () => {
  const r = E.evaluate([]);
  assert.strictEqual(r.total, 0);
  assert.strictEqual(r.clean, false);
  assert(r.verdict.includes('No cue sheet yet'));
  assert.strictEqual(E.evaluate(null).total, 0);
});

ok('gateState: counts, missing, complete', () => {
  const gs = E.gateState(['bible', 'stems']);
  assert.strictEqual(gs.done, 2);
  assert.strictEqual(gs.total, 5);
  assert.strictEqual(gs.complete, false);
  assert.deepStrictEqual(gs.missing.map((s) => s.id), ['routes', 'lockedcut', 'receipts']);
  assert.strictEqual(E.gateState(E.GATES.map((s) => s.id)).complete, true);
  assert.strictEqual(E.gateState().done, 0);
});

ok('export: markdown carries title, gate marks, scenes with route + layers, verdict, counts', () => {
  const md = E.sheetToMarkdown('The Night Bus', E.DEFAULT_ENTRIES, ['bible', 'routes']);
  assert(md.startsWith('# Cue sheet — The Night Bus'));
  assert(md.includes('- [x] Voice Bible written for every speaking character'));
  assert(md.includes('- [ ] Stems kept for the score and the voices'));
  assert(md.includes('Sc 3 — The rain stop — Thin — a layer missing or rough. Route: Decoupled'));
  assert(md.includes('Layers: Bed ✓ · Foley — · Accents ✓'));
  assert(md.includes('## Mix verdict'));
  assert(md.includes('Designed: 4 · thin: 1 · dry: 0.'));
  assert(md.endsWith('\n'));
});

ok('export: untitled + empty sheet still produces a file', () => {
  const md = E.sheetToMarkdown('', [], []);
  assert(md.includes('Untitled production'));
  assert(md.includes('- (none logged)'));
});

console.log('cuesheet.test.js: ' + n + ' tests, all pass');
