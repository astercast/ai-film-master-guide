#!/usr/bin/env node
/* longform.test.js — Longform Sheet engine tests.
 * Pins the engine against the long-form pipelines chapter's
 * own rules (craft/longform-pipelines.md): the five pre-lock
 * gates, the stress-test rule (a scene generated without its
 * stress test reads untested), the chaining rule (a text
 * description reads drifting — a video reference doesn't),
 * the draft rule (full-res before the winner reads wasteful;
 * draft at 720p, upscale winners only), feature-lock
 * verdicts, and the markdown export's traces.
 * Output convention shared with take.test.js.
 */
'use strict';
const assert = require('assert');
const E = require('../assets/js/longform.js');

let n = 0;
function ok(name, fn) { fn(); n += 1; console.log('ok ' + name); }

ok('gates: the chapter\u2019s five pre-lock gates, in order', () => {
  assert.deepStrictEqual(E.GATES.map((s) => s.id),
    ['registry', 'stresstest', 'architecture', 'dialogue', 'lockdiscipline']);
  assert.strictEqual(E.GATES.length, 5);
});

ok('refs: video / text / none, with the chapter\u2019s split', () => {
  assert.deepStrictEqual(E.REFS.map((s) => s.id), ['video', 'text', 'none']);
  assert.strictEqual(E.refLabel('video'), 'Video reference — previous finished scene or previz');
  assert.strictEqual(E.refLabel('nope'), '— no reference recorded —');
});

ok('dialogues + tiers + statuses: the chapter\u2019s three dialogue architectures + silent; draft / winner / full-res; building / locked / supervision / cut', () => {
  assert.deepStrictEqual(E.DIALOGUES.map((s) => s.id), ['native', 'converted', 'decoupled', 'silent']);
  assert.deepStrictEqual(E.TIERS.map((s) => s.id), ['draft', 'winner', 'fullres']);
  assert.deepStrictEqual(E.STATUSES.map((s) => s.id), ['building', 'locked', 'supervision', 'cut']);
  assert.strictEqual(E.statusLabel('locked'), 'Picture-Locked');
  assert.strictEqual(E.statusLabel('nope'), '— no route recorded —');
  assert.strictEqual(E.tierLabel('draft'), '720p draft');
  assert.strictEqual(E.dialogueLabel('converted'), 'Human-recorded, AI-converted');
});

ok('default sheet: 6 scenes, 5 clean, 1 held, 0 stopped — verdict is the hold', () => {
  const r = E.evaluate(E.DEFAULT_ENTRIES);
  assert.strictEqual(r.total, 6);
  assert.strictEqual(r.clean, 5);
  assert.strictEqual(r.held, 1);
  assert.strictEqual(r.stopped, 0);
  assert.strictEqual(r.ready, false);
  assert(r.verdict.includes('Hold feature lock — 1 scene is not ready'));
  assert.strictEqual(r.heldEntries[0].scene, 'Seq 4 — Depot office, the radio news');
  assert.strictEqual(E.effectiveStatus(r.heldEntries[0]), 'supervision');
});

ok('locking the supervision scene clears the sheet', () => {
  const entries = JSON.parse(JSON.stringify(E.DEFAULT_ENTRIES));
  entries[3].status = 'locked';
  entries[3].tier = 'winner';
  const r = E.evaluate(entries);
  assert.strictEqual(r.ready, true);
  assert(r.verdict.includes('Feature lock clean'));
  assert(r.verdict.includes('picture lock means no new generations'));
});

ok('the stress-test rule: no stress test reads untested and stops the lock, whatever its route', () => {
  const e = { scene: 'X', stress: false, board: true, ref: 'video',
    dialogue: 'native', tier: 'draft', rerolls: 0, status: 'locked', detail: '' };
  assert.strictEqual(E.effectiveStatus(e), 'untested');
  const r = E.evaluate([e]);
  assert.strictEqual(r.stopped, 1);
  assert(r.verdict.includes('Feature lock stopped'));
  assert(r.verdict.includes('Goal, Obstacle, Tactic, Reversal, Value Shift'));
  e.stress = true;
  assert.strictEqual(E.effectiveStatus(e), 'clean');
});

ok('the chaining rule: a text reference reads drifting; a video reference can lock clean', () => {
  const e = { scene: 'X', stress: true, board: true, ref: 'text',
    dialogue: 'native', tier: 'draft', rerolls: 0, status: 'locked', detail: '' };
  assert.strictEqual(E.effectiveStatus(e), 'drifting');
  const r = E.evaluate([e]);
  assert(r.verdict.includes('a text description drifts over generations'));
  e.ref = 'video';
  assert.strictEqual(E.effectiveStatus(e), 'clean');
});

ok('the draft rule: full-res generation reads wasteful; drafting at 720p answers it', () => {
  const e = { scene: 'X', stress: true, board: true, ref: 'video',
    dialogue: 'native', tier: 'fullres', rerolls: 0, status: 'locked', detail: '' };
  assert.strictEqual(E.effectiveStatus(e), 'wasteful');
  const r = E.evaluate([e]);
  assert(r.verdict.includes('draft at 720p and upscale winners only'));
  e.tier = 'draft';
  assert.strictEqual(E.effectiveStatus(e), 'clean');
});

ok('a locked scene with no storyboard or no reference reads unchecked and holds', () => {
  const e = { scene: 'X', stress: true, board: false, ref: 'video',
    dialogue: 'native', tier: 'draft', rerolls: 0, status: 'locked', detail: '' };
  assert.strictEqual(E.effectiveStatus(e), 'unchecked');
  e.board = true; e.ref = 'none';
  assert.strictEqual(E.effectiveStatus(e), 'unchecked');
  e.ref = 'video';
  assert.strictEqual(E.effectiveStatus(e), 'clean');
});

ok('a cut scene blocks nothing, whatever its state', () => {
  const e = { scene: 'X', stress: false, board: false, ref: 'text',
    dialogue: 'native', tier: 'fullres', rerolls: 30, status: 'cut', detail: '' };
  assert.strictEqual(E.effectiveStatus(e), 'cutscene');
  const r = E.evaluate([e]);
  assert.strictEqual(r.cut, 1);
  assert.strictEqual(r.stopped, 0);
  assert.strictEqual(r.ready, true);
});

ok('untested outranks drifting, drifting outranks wasteful', () => {
  const base = { board: true, dialogue: 'native', rerolls: 0, status: 'locked', detail: '' };
  const entries = [
    Object.assign({}, base, { scene: 'A', stress: true, ref: 'video', tier: 'fullres' }),
    Object.assign({}, base, { scene: 'B', stress: true, ref: 'text', tier: 'draft' }),
    Object.assign({}, base, { scene: 'C', stress: false, ref: 'video', tier: 'draft' }),
  ];
  const r = E.evaluate(entries);
  assert.strictEqual(r.stopped, 3);
  assert(r.verdict.includes('generated without a stress test'));
});

ok('empty sheet: no verdict of clean, prompts to log scenes', () => {
  const r = E.evaluate([]);
  assert.strictEqual(r.total, 0);
  assert.strictEqual(r.ready, false);
  assert(r.verdict.includes('No longform sheet yet'));
  assert.strictEqual(E.evaluate(null).total, 0);
});

ok('gateState: counts, missing, complete', () => {
  const gs = E.gateState(['registry', 'dialogue']);
  assert.strictEqual(gs.done, 2);
  assert.strictEqual(gs.total, 5);
  assert.strictEqual(gs.complete, false);
  assert.deepStrictEqual(gs.missing.map((s) => s.id), ['stresstest', 'architecture', 'lockdiscipline']);
  assert.strictEqual(E.gateState(E.GATES.map((s) => s.id)).complete, true);
  assert.strictEqual(E.gateState().done, 0);
});

ok('export: markdown carries title, gate marks, scenes with stress + reference + dialogue + tier + route, verdict, counts', () => {
  const md = E.sheetToMarkdown('The Night Bus (long form)', E.DEFAULT_ENTRIES, ['registry', 'stresstest']);
  assert(md.startsWith('# Longform sheet — The Night Bus (long form)'));
  assert(md.includes('- [x] Asset registry complete before shot one'));
  assert(md.includes('- [ ] Dialogue architecture chosen per scene, not per film'));
  assert(md.includes('Seq 4 — Depot office, the radio news — In generation supervision'));
  assert(md.includes('Stress test: done'));
  assert(md.includes('Reference: Video reference'));
  assert(md.includes('Dialogue: Decoupled'));
  assert(md.includes('Re-rolls: 7'));
  assert(md.includes('## Feature-lock verdict'));
  assert(md.includes('Clean: 5 · held: 1 · stopped: 0 · cut: 0.'));
  assert(md.endsWith('\n'));
});

ok('export: untitled + empty sheet still produces a file', () => {
  const md = E.sheetToMarkdown('', [], []);
  assert(md.includes('Untitled production'));
  assert(md.includes('- (none logged)'));
});

console.log('longform.test.js: ' + n + ' tests, all pass');
