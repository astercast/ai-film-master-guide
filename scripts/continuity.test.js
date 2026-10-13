#!/usr/bin/env node
/* continuity.test.js — Continuity Ledger engine tests.
 * Pins the engine against the chapter's own rules
 * (craft/character-consistency.md): the five-item pre-generation
 * checklist, the rejection rules (a broken lock stops the chain),
 * drift as a hold, and the markdown export's traces.
 * Output convention shared with clearance.test.js / forge.test.js.
 */
'use strict';
const assert = require('assert');
const E = require('../assets/js/continuity.js');

let n = 0;
function ok(name, fn) { fn(); n += 1; console.log('ok ' + name); }

ok('checklist: the chapter\'s five pre-generation locks, in order', () => {
  assert.deepStrictEqual(E.LOCKS.map((s) => s.id),
    ['identity', 'wardrobe', 'locations', 'light', 'startframe']);
  assert.strictEqual(E.LOCKS.length, 5);
});

ok('kinds: the six lock kinds the chapter names', () => {
  assert.deepStrictEqual(E.KINDS,
    ['identity', 'wardrobe', 'prop', 'location', 'lighting', 'era / grade']);
});

ok('statuses: locked / drifted / broken', () => {
  assert.deepStrictEqual(E.STATUSES.map((s) => s.id), ['locked', 'drifted', 'broken']);
  assert.strictEqual(E.statusLabel('drifted'), 'Drifted — off the lock');
  assert.strictEqual(E.statusLabel('nope'), '— no state recorded —');
});

ok('default ledger: 6 entries, 5 locked, 1 drifted, 0 broken — verdict is the hold', () => {
  const r = E.evaluate(E.DEFAULT_ENTRIES);
  assert.strictEqual(r.total, 6);
  assert.strictEqual(r.locked, 5);
  assert.strictEqual(r.drifted, 1);
  assert.strictEqual(r.broken, 0);
  assert.strictEqual(r.clean, false);
  assert(r.verdict.includes('Hold — 1 lock has drifted'));
  assert.strictEqual(r.driftedEntries[0].kind, 'wardrobe');
});

ok('re-locking the drifted entry clears the ledger', () => {
  const entries = JSON.parse(JSON.stringify(E.DEFAULT_ENTRIES));
  entries.forEach((e) => { e.status = 'locked'; });
  const r = E.evaluate(entries);
  assert.strictEqual(r.clean, true);
  assert(r.verdict.includes('Continuity clean'));
});

ok('a broken lock stops the chain (the rejection rules)', () => {
  const entries = JSON.parse(JSON.stringify(E.DEFAULT_ENTRIES));
  entries[0].status = 'broken';
  const r = E.evaluate(entries);
  assert.strictEqual(r.broken, 1);
  assert.strictEqual(r.clean, false);
  assert(r.verdict.includes('Chain stopped'));
  assert(r.verdict.includes("failed clips don't chain"));
});

ok('broken outranks drifted in the verdict', () => {
  const entries = [
    { subject: 'A', kind: 'identity', lock: 'x', status: 'drifted' },
    { subject: 'B', kind: 'lighting', lock: 'y', status: 'broken' },
  ];
  assert(E.evaluate(entries).verdict.includes('Chain stopped'));
});

ok('empty ledger: no verdict of clean, prompts to log locks', () => {
  const r = E.evaluate([]);
  assert.strictEqual(r.total, 0);
  assert.strictEqual(r.clean, false);
  assert(r.verdict.includes('No ledger yet'));
  assert.strictEqual(E.evaluate(null).total, 0);
});

ok('checklistState: counts, missing, complete', () => {
  const cs = E.checklistState(['identity', 'light']);
  assert.strictEqual(cs.done, 2);
  assert.strictEqual(cs.total, 5);
  assert.strictEqual(cs.complete, false);
  assert.deepStrictEqual(cs.missing.map((s) => s.id), ['wardrobe', 'locations', 'startframe']);
  assert.strictEqual(E.checklistState(E.LOCKS.map((s) => s.id)).complete, true);
  assert.strictEqual(E.checklistState().done, 0);
});

ok('export: markdown carries title, checklist marks, locks, verdict, counts', () => {
  const md = E.ledgerToMarkdown('The Night Bus', E.DEFAULT_ENTRIES, ['identity', 'wardrobe']);
  assert(md.startsWith('# Continuity ledger — The Night Bus'));
  assert(md.includes('- [x] Identity system chosen and trained'));
  assert(md.includes('- [ ] Location master stills approved'));
  assert(md.includes('Mara Venn — wardrobe, scenes 1–6 [wardrobe] — Drifted — off the lock'));
  assert(md.includes('## Chaining verdict'));
  assert(md.includes('Locked: 5 · drifted: 1 · broken: 0.'));
  assert(md.endsWith('\n'));
});

ok('export: untitled + empty ledger still produces a file', () => {
  const md = E.ledgerToMarkdown('', [], []);
  assert(md.includes('Untitled production'));
  assert(md.includes('- (none logged)'));
});

console.log('continuity.test.js: ' + n + ' tests, all pass');
