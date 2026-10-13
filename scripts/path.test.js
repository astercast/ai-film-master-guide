#!/usr/bin/env node
/* path.test.js — The Path engine + curriculum tests.
 * Pins the rotation-19 flagship against its filed shape
 * (competitor gap T-FILM-5): data/v1/curriculum.json sequences
 * ALL of the guide's skills into ~6 stages, every skill ID
 * appearing exactly once, and assets/js/path.js computes the
 * walker's standing from it — per-stage progress, the current
 * stage, the next skill, the milestone verdict, and the
 * markdown export's traces. The companion skill
 * (workflow-walk-the-path) teaches the walk itself and is
 * deliberately not a stop on the path it describes.
 * Output convention shared with longform.test.js.
 */
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const E = require('../assets/js/path.js');

const ROOT = path.join(__dirname, '..');
const CURR = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/v1/curriculum.json'), 'utf8'));
const INDEX = JSON.parse(fs.readFileSync(path.join(ROOT, 'skills/index.json'), 'utf8'));
const COMPANION = 'workflow-walk-the-path';

let n = 0;
function ok(name, fn) { fn(); n += 1; console.log('ok ' + name); }

ok('curriculum: six stages, in the authored production order', () => {
  assert.strictEqual(CURR.format, 'curriculum/1.0');
  assert.strictEqual(CURR.stages.length, 6);
  assert.deepStrictEqual(CURR.stages.map((s) => s.id),
    ['first-light', 'look-and-voice', 'the-instrument', 'direction', 'production', 'the-finish']);
  assert.deepStrictEqual(CURR.stages.map((s) => s.n), [1, 2, 3, 4, 5, 6]);
  CURR.stages.forEach((s) => { assert.strictEqual(s.skill_count, s.skills.length); });
});

ok('curriculum: stage sizes 37 / 40 / 41 / 44 / 43 / 36', () => {
  assert.deepStrictEqual(CURR.stages.map((s) => s.skills.length), [37, 40, 41, 44, 43, 36]);
  assert.strictEqual(CURR.skill_count, 241);
});

ok('coverage: every one of the 241 skills appears exactly once across the stages', () => {
  const flat = CURR.stages.flatMap((s) => s.skills);
  assert.strictEqual(flat.length, 241);
  assert.strictEqual(new Set(flat).size, 241, 'duplicate skill id in the curriculum');
  const expected = INDEX.skills.map((s) => s.id).filter((id) => id !== COMPANION);
  assert.strictEqual(expected.length, 241);
  assert.deepStrictEqual([...flat].sort(), [...expected].sort());
});

ok('companion: the walk-the-path skill exists in the library and is not a stop on the path', () => {
  assert(INDEX.skills.some((s) => s.id === COMPANION), 'companion skill missing from skills/index.json');
  assert.strictEqual(CURR.companion_skill, COMPANION);
  assert(!CURR.stages.flatMap((s) => s.skills).includes(COMPANION));
});

ok('flatten: global order is stage order, numbered 1..241', () => {
  const flat = E.flatten(CURR);
  assert.strictEqual(flat.length, 241);
  assert.strictEqual(flat[0].id, 'prompt-t1');
  assert.strictEqual(flat[0].n, 1);
  assert.strictEqual(flat[0].stageId, 'first-light');
  assert.strictEqual(flat[36].stageId, 'first-light');
  assert.strictEqual(flat[37].stageId, 'look-and-voice');
  assert.strictEqual(flat[240].n, 241);
  assert.strictEqual(flat[240].stageId, 'the-finish');
});

ok('stageProgress: counts, pct, complete, next', () => {
  const st = CURR.stages[0];
  const sp0 = E.stageProgress(st, []);
  assert.strictEqual(sp0.done, 0);
  assert.strictEqual(sp0.complete, false);
  assert.strictEqual(sp0.next, 'prompt-t1');
  const spAll = E.stageProgress(st, st.skills);
  assert.strictEqual(spAll.done, 37);
  assert.strictEqual(spAll.pct, 100);
  assert.strictEqual(spAll.complete, true);
  assert.strictEqual(spAll.next, null);
  assert.strictEqual(E.stageProgress(st, ['prompt-t1', 'prompt-t2']).done, 2);
});

ok('progress: empty walk — stage 1 current, next is skill 1', () => {
  const p = E.progress(CURR, []);
  assert.strictEqual(p.done, 0);
  assert.strictEqual(p.total, 241);
  assert.strictEqual(p.pct, 0);
  assert.strictEqual(p.finished, false);
  assert.strictEqual(p.currentStage.id, 'first-light');
  assert.strictEqual(p.next.id, 'prompt-t1');
  assert.strictEqual(p.stages.length, 6);
});

ok('progress: finishing stage 1 moves the current stage to stage 2', () => {
  const p = E.progress(CURR, CURR.stages[0].skills);
  assert.strictEqual(p.done, 37);
  assert.strictEqual(p.currentStage.id, 'look-and-voice');
  assert.strictEqual(p.next.stageId, 'look-and-voice');
  assert.strictEqual(p.stages[0].complete, true);
});

ok('progress: a stray check in a later stage does not skip the current stage', () => {
  const p = E.progress(CURR, ['legal-script-clearance']);
  assert.strictEqual(p.done, 1);
  assert.strictEqual(p.currentStage.id, 'first-light');
  assert.strictEqual(p.next.id, 'prompt-t1');
  assert.strictEqual(p.stages[5].done, 1);
});

ok('progress: the full walk is finished, no current stage, no next', () => {
  const all = CURR.stages.flatMap((s) => s.skills);
  const p = E.progress(CURR, all);
  assert.strictEqual(p.done, 241);
  assert.strictEqual(p.pct, 100);
  assert.strictEqual(p.finished, true);
  assert.strictEqual(p.currentStage, null);
  assert.strictEqual(p.next, null);
});

ok('progress: unknown ids and junk input count for nothing', () => {
  const p = E.progress(CURR, ['nope-not-a-skill']);
  assert.strictEqual(p.done, 0);
  assert.strictEqual(E.progress(null, null).total, 0);
  assert.strictEqual(E.progress(CURR, null).done, 0);
});

ok('verdict: not started names the first skill and the done-on-a-production rule', () => {
  const v = E.verdict(CURR, []);
  assert(v.includes('Not started'));
  assert(v.includes('241 skills'));
  assert(v.includes('prompt-t1'));
  assert(v.includes('done on a real production'));
});

ok('verdict: mid-walk names the stage, the counts, and the next skill', () => {
  const v = E.verdict(CURR, CURR.stages[0].skills.concat(['prompt-a1']));
  assert(v.includes('Stage 2'));
  assert(v.includes('1 of 40 skills done'));
  assert(v.includes('prompt-a2'));
  assert(v.includes('milestone'));
});

ok('verdict: a walked path and an empty curriculum both read honestly', () => {
  const all = CURR.stages.flatMap((s) => s.skills);
  assert(E.verdict(CURR, all).includes('The Path is walked'));
  assert(E.verdict(null, []).includes('The Path is empty'));
});

ok('export: markdown carries stages, milestones, check marks, counts, standing', () => {
  const titles = { 'prompt-t1': 'Prompt: Establishing drone shot' };
  const md = E.progressToMarkdown(CURR, titles, ['prompt-t1']);
  assert(md.startsWith('# The Path — my walk'));
  assert(md.includes('## Stage 1 — First Light — the prompt and the camera (1 of 37)'));
  assert(md.includes('- [x] Prompt: Establishing drone shot (`prompt-t1`)'));
  assert(md.includes('- [ ] '));
  assert(md.includes('Milestone: You can write a core-track prompt'));
  assert(md.includes('## Stage 6 — The Finish'));
  assert(md.includes('Done: 1 of 241 (0%).'));
  assert(md.endsWith('\n'));
});

console.log('path.test.js: ' + n + ' tests, all pass');
