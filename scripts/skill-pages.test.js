#!/usr/bin/env node
/* skill-pages.test.js, VP-0010 structural-fix tests (rotation 20).
 * Proves, from the built tree alone:
 *  - every one of the 242 skills has an in-site page carrying its
 *    procedure, worked example and pitfalls;
 *  - the skills browser's card renderer links every card to its page
 *    (executed against the real skills-index.json with a DOM stub, *    242 cards, each with title + "Open the skill" anchors);
 *  - every Path row (241) links to its skill page, in curriculum order;
 *  - the 8 reference skills' pages are marked as reference;
 *  - the ticket's named jargon is glossed on the pages where it leads;
 *  - the skills filter placeholder no longer uses the unglossed "BAF".
 * Output convention shared with path.test.js.
 */
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE = path.join(ROOT, 'site');
const INDEX = JSON.parse(fs.readFileSync(path.join(ROOT, 'skills/index.json'), 'utf8'));
const CURR = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/v1/curriculum.json'), 'utf8'));
const REF = INDEX.skills.filter((s) => s.audience === 'reference').map((s) => s.id);

let n = 0;
function ok(name, fn) { fn(); n += 1; console.log('ok ' + name); }

ok('pages: all 242 skills have an in-site page', () => {
  assert.strictEqual(INDEX.skills.length, 242);
  const pages = fs.readdirSync(path.join(SITE, 'skills')).filter((f) => f.endsWith('.html'));
  assert.strictEqual(pages.length, 242, 'site/skills/*.html count');
  INDEX.skills.forEach((s) => {
    assert(fs.existsSync(path.join(SITE, 'skills', s.id + '.html')), 'missing page ' + s.id);
  });
});

ok('pages: every page carries procedure, worked example, pitfalls, gets-you', () => {
  INDEX.skills.forEach((s) => {
    const t = fs.readFileSync(path.join(SITE, 'skills', s.id + '.html'), 'utf8');
    ['Procedure', 'Worked example', 'Pitfalls', 'Gets you:'].forEach((w) => {
      assert(t.includes(w), s.id + ' page missing ' + w);
    });
  });
});

ok('pages: the 8 reference skills are marked as reference, not deleted', () => {
  assert.strictEqual(REF.length, 8);
  REF.forEach((id) => {
    const t = fs.readFileSync(path.join(SITE, 'skills', id + '.html'), 'utf8');
    assert(t.includes('Reference skill'), id + ' page not marked reference');
  });
});

ok('path: all 241 rows link to their skill page, in curriculum order', () => {
  const t = fs.readFileSync(path.join(SITE, 'path.html'), 'utf8');
  const links = [...t.matchAll(/href="skills\/([^"]+)\.html"/g)].map((m) => m[1]);
  const flat = CURR.stages.flatMap((s) => s.skills);
  assert.deepStrictEqual(links, flat);
});

ok('gloss: the ticket jargon set is glossed where it leads', () => {
  const cases = [
    ['prompt-a1', 'Sakuga'], ['craft-jl-cuts', 'J/L cuts'],
    ['prompt-r2', 'identity drift'], ['direct-soul-2-0', 'Soul 2.0'],
    ['prompt-r1', 'face-morph'], ['prompt-t2', 'Shot-reverse-shot'],
  ];
  cases.forEach(([id, term]) => {
    const t = fs.readFileSync(path.join(SITE, 'skills', id + '.html'), 'utf8');
    assert(t.includes('In plain words'), id + ' has no plain-words gloss box');
    assert(t.toLowerCase().includes(term.toLowerCase()), id + ' gloss missing ' + term);
  });
  const skillsHtml = fs.readFileSync(path.join(SITE, 'skills.html'), 'utf8');
  assert(!/placeholder="[^"]*BAF/.test(skillsHtml), 'skills filter still uses unglossed BAF');
});

// Async: execute the real card renderer (skills.js) against the real
// index with a minimal DOM stub, then count what a visitor gets.
const els = {
  'skills-filter': { addEventListener() {}, value: '' },
  'skills-count': { textContent: '' },
  'skills-list': { innerHTML: '' },
  'skills-empty': { hidden: false },
};
global.document = { getElementById: (id) => els[id] || null };
global.fetch = () => Promise.resolve({
  ok: true,
  json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(SITE, 'skills-index.json'), 'utf8'))),
});
require(path.join(ROOT, 'assets/js/skills.js'));
setImmediate(() => setImmediate(() => {
  const htmlOut = els['skills-list'].innerHTML;
  const cards = (htmlOut.match(/<article class="card skill-card">/g) || []).length;
  assert.strictEqual(cards, 242, 'rendered cards');
  INDEX.skills.forEach((s) => {
    assert(htmlOut.includes('href="skills/' + s.id + '.html"'), 'card for ' + s.id + ' has no page link');
  });
  const opens = (htmlOut.match(/Open the skill/g) || []).length;
  assert.strictEqual(opens, 242, 'explicit open links');
  n += 1;
  console.log('ok cards: skills.js renders 242 cards, every card linked to its page');
  console.log('skill-pages.test.js: ' + n + ' tests, all pass');
}));
