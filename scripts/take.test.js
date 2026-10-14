#!/usr/bin/env node
/* take.test.js, Take Sheet engine tests.
 * Pins the engine against the directing-performance chapter's
 * own rules (craft/directing-performance.md): the five
 * pre-lock gates, the label rule (an emotion label reads
 * undirected, direct, don't describe), the three-rehearsal
 * rule (three failed rehearsals read overdue: simplify the
 * shot, not the actor), the close-up rule (a close-up away
 * from an emotional peak reads misspent), performance-lock
 * verdicts, and the markdown export's traces.
 * Output convention shared with cut.test.js.
 */
'use strict';
const assert = require('assert');
const E = require('../assets/js/take.js');

let n = 0;
function ok(name, fn) { fn(); n += 1; console.log('ok ' + name); }

ok('gates: the chapter\u2019s five pre-lock gates, in order', () => {
  assert.deepStrictEqual(E.GATES.map((s) => s.id),
    ['tactics', 'eyelines', 'directorsread', 'identity', 'restraint']);
  assert.strictEqual(E.GATES.length, 5);
});

ok('modes: tactic / label, with the chapter\u2019s split', () => {
  assert.deepStrictEqual(E.MODES.map((s) => s.id), ['tactic', 'label']);
  assert.strictEqual(E.modeLabel('tactic'), 'Playable tactic, a task a body can do');
  assert.strictEqual(E.modeLabel('nope'), 'no direction recorded ');
});

ok('framings + statuses: wide / medium / close-up; rehearsing / locked / simplify / hybrid', () => {
  assert.deepStrictEqual(E.FRAMINGS.map((s) => s.id), ['wide', 'medium', 'closeup']);
  assert.deepStrictEqual(E.STATUSES.map((s) => s.id), ['rehearsing', 'locked', 'simplify', 'hybrid']);
  assert.strictEqual(E.statusLabel('locked'), "Scene-Locked, photograph it, don't regenerate it");
  assert.strictEqual(E.statusLabel('nope'), 'No route recorded ');
  assert.strictEqual(E.framingLabel('closeup'), 'Close-up');
});

ok('default sheet: 6 beats, 5 clean, 1 held, 0 stopped, verdict is the hold', () => {
  const r = E.evaluate(E.DEFAULT_ENTRIES);
  assert.strictEqual(r.total, 6);
  assert.strictEqual(r.clean, 5);
  assert.strictEqual(r.held, 1);
  assert.strictEqual(r.stopped, 0);
  assert.strictEqual(r.ready, false);
  assert(r.verdict.includes('Hold performance lock, 1 beat is not ready'));
  assert.strictEqual(r.heldEntries[0].shot, 'Sc 4 · Sh 02, Depot office, the driver hears the radio');
  assert.strictEqual(E.effectiveStatus(r.heldEntries[0]), 'rehearsing');
});

ok('locking the radio reaction clears the sheet', () => {
  const entries = JSON.parse(JSON.stringify(E.DEFAULT_ENTRIES));
  entries[3].status = 'locked';
  const r = E.evaluate(entries);
  assert.strictEqual(r.ready, true);
  assert(r.verdict.includes('Performance lock clean'));
  assert(r.verdict.includes('Scene-Locked'));
});

ok('the label rule: an emotion label reads undirected and stops the lock, whatever its route', () => {
  const e = { shot: 'X', mode: 'label', eyeline: true, deadeyes: true,
    framing: 'medium', peak: false, attempts: 0, status: 'locked', detail: '' };
  assert.strictEqual(E.effectiveStatus(e), 'undirected');
  const r = E.evaluate([e]);
  assert.strictEqual(r.stopped, 1);
  assert(r.verdict.includes('Performance lock stopped'));
  assert(r.verdict.includes('playable tactic'));
  e.mode = 'tactic';
  assert.strictEqual(E.effectiveStatus(e), 'clean');
});

ok('the three-rehearsal rule: a third failed rehearsal reads overdue; simplifying answers it', () => {
  const e = { shot: 'X', mode: 'tactic', eyeline: true, deadeyes: true,
    framing: 'medium', peak: false, attempts: 2, status: 'rehearsing', detail: '' };
  assert.strictEqual(E.effectiveStatus(e), 'rehearsing');
  e.attempts = 3;
  assert.strictEqual(E.effectiveStatus(e), 'overdue');
  const r = E.evaluate([e]);
  assert(r.verdict.includes('three-rehearsal rule'));
  assert(r.verdict.includes('simplify the shot, not the actor'));
  e.status = 'simplify';
  assert.strictEqual(E.effectiveStatus(e), 'simplifying');
});

ok('the close-up rule: a close-up away from a peak reads misspent; on its peak it can lock clean', () => {
  const e = { shot: 'X', mode: 'tactic', eyeline: true, deadeyes: true,
    framing: 'closeup', peak: false, attempts: 0, status: 'locked', detail: '' };
  assert.strictEqual(E.effectiveStatus(e), 'misspent');
  const r = E.evaluate([e]);
  assert(r.verdict.includes('Ration close-ups to the peaks'));
  e.peak = true;
  assert.strictEqual(E.effectiveStatus(e), 'clean');
});

ok('a locked beat with no eyeline or no dead-eyes check reads unchecked and holds', () => {
  const e = { shot: 'X', mode: 'tactic', eyeline: false, deadeyes: true,
    framing: 'medium', peak: false, attempts: 0, status: 'locked', detail: '' };
  assert.strictEqual(E.effectiveStatus(e), 'unchecked');
  e.eyeline = true; e.deadeyes = false;
  assert.strictEqual(E.effectiveStatus(e), 'unchecked');
  e.deadeyes = true;
  assert.strictEqual(E.effectiveStatus(e), 'clean');
});

ok('a hybrid beat blocks nothing, whatever its state', () => {
  const e = { shot: 'X', mode: 'label', eyeline: false, deadeyes: false,
    framing: 'closeup', peak: false, attempts: 5, status: 'hybrid', detail: '' };
  assert.strictEqual(E.effectiveStatus(e), 'hybrid');
  const r = E.evaluate([e]);
  assert.strictEqual(r.hybrid, 1);
  assert.strictEqual(r.stopped, 0);
  assert.strictEqual(r.ready, true);
});

ok('undirected outranks overdue, overdue outranks misspent', () => {
  const base = { eyeline: true, deadeyes: true, detail: '' };
  const entries = [
    Object.assign({}, base, { shot: 'A', mode: 'tactic', framing: 'closeup', peak: false, attempts: 0, status: 'locked' }),
    Object.assign({}, base, { shot: 'B', mode: 'tactic', framing: 'medium', peak: false, attempts: 3, status: 'rehearsing' }),
    Object.assign({}, base, { shot: 'C', mode: 'label', framing: 'medium', peak: false, attempts: 0, status: 'rehearsing' }),
  ];
  const r = E.evaluate(entries);
  assert.strictEqual(r.stopped, 3);
  assert(r.verdict.includes('directed by emotion label'));
});

ok('empty sheet: no verdict of clean, prompts to log beats', () => {
  const r = E.evaluate([]);
  assert.strictEqual(r.total, 0);
  assert.strictEqual(r.ready, false);
  assert(r.verdict.includes('No take sheet yet'));
  assert.strictEqual(E.evaluate(null).total, 0);
});

ok('gateState: counts, missing, complete', () => {
  const gs = E.gateState(['tactics', 'restraint']);
  assert.strictEqual(gs.done, 2);
  assert.strictEqual(gs.total, 5);
  assert.strictEqual(gs.complete, false);
  assert.deepStrictEqual(gs.missing.map((s) => s.id), ['eyelines', 'directorsread', 'identity']);
  assert.strictEqual(E.gateState(E.GATES.map((s) => s.id)).complete, true);
  assert.strictEqual(E.gateState().done, 0);
});

ok('export: markdown carries title, gate marks, beats with direction + eyeline + framing + route, verdict, counts', () => {
  const md = E.sheetToMarkdown('The Night Bus', E.DEFAULT_ENTRIES, ['tactics', 'eyelines']);
  assert(md.startsWith('# Take sheet, The Night Bus'));
  assert(md.includes('- [x] Every beat rewritten as a playable tactic'));
  assert(md.includes('- [ ] Restraint pass done: negative constraints, subtext, under-directed faces'));
  assert(md.includes('Sc 4 · Sh 02, Depot office, the driver hears the radio, In rehearsal, drafts as takes. Direction: Playable tactic'));
  assert(md.includes('Eyeline: named'));
  assert(md.includes('Framing: Medium'));
  assert(md.includes('Failed rehearsals: 1'));
  assert(md.includes('## Performance-lock verdict'));
  assert(md.includes('Clean: 5 · held: 1 · stopped: 0 · hybrid: 0.'));
  assert(md.endsWith('\n'));
});

ok('export: untitled + empty sheet still produces a file', () => {
  const md = E.sheetToMarkdown('', [], []);
  assert(md.includes('Untitled production'));
  assert(md.includes('- (none logged)'));
});

console.log('take.test.js: ' + n + ' tests, all pass');
