# SKILLS_AUDIT.md — the Skills Usefulness Audit (rotation 20, 2026-10-13)

The user's order: every skill in this guide must be **obviously useful to a
total beginner** — or the site becomes an information site. This file is the
audit record. The machine-readable twin is `data/v1/skills-audit.json`
(kept in sync by `scripts/audit_skills.py`; on `build_api.py`'s preserve
list). The verdict below is by count, first — the pivot decision belongs
to the user, informed by these numbers, and is **not** taken here.

## The verdict, by count

**242 skills audited** (the 241 skills sequenced on the Path, plus the
242nd, `workflow-walk-the-path`, judged as a path skill):

| verdict | count | share |
|---|---|---|
| **Pass** — passes the bar as it stood, once the new "what this gets you" line states its outcome in plain words | **222** | 92% |
| **Rewrite-to-usable** — sound procedure, failing surface (jargon, insider codenames, a duplicate stub); rewritten in this rotation and now passing | **12** | 5% |
| **Demote-to-reference** — not honestly a beginner skill at all; moved to reference presentation | **8** | 3% |
| **Beginner-usable after rotation 20** | **234 of 242** | **97%** |

**The skills layer is broadly useful.** By count, this is not a layer that
needs the information-site pivot: 222 of 242 skills were already concrete,
executable procedures a beginner could use; the failures were concentrated
(8 skills that were never beginner skills, 12 whose surfaces hid good
procedures behind insider language). The 8 reference skills stay in the
library — marked, grouped separately, and still on the Path pending a
sequencing decision (see "Left open") — because they hold real value for
agents and for later; they no longer pose as first-project skills.

## The bar

One bar, applied per skill, judged on what a first-time visitor actually
sees (the skills-browser card — title + description — and the skill file
itself):

> A first-time visitor who has never made anything can tell **within
> seconds**: (a) **what it is**, (b) **what it does for them** — what they
> will be able to make or do with it, (c) **how they would actually use
> it** — inputs they can really supply, steps they can really execute,
> a worked example that shows the result.

## What shipped for every passing skill

Every one of the 234 beginner skills gained a plain-language
**"What this gets you"** line: one short, concrete, outcome-first sentence
(median 154 characters; written per skill, never templated filler for the
hand-authored set; derived from each item's own source data for the
prompt/camera/model/checklist families). It lives in the generator —
`scripts/build_skills.py` (`gets` on every skill; `build_skills.py`
refuses to build a skill without one) — so it survives regeneration, and
it surfaces in three places, all in the minimal register (one line, no
new walls of text):

- **the skill file itself** — a `## What this gets you` section directly
  under the title, before "Use when";
- **the skills browser** (`skills.html`) — a "Gets you:" line on every
  card, included in the live filter;
- **the Path** (`path.html`) — the line inside each stage's existing
  collapsed disclosure, under the skill's title — the Path's per-stage
  disclosure model, unchanged in shape.

Reference skills carry a banner in their file, a `reference` tag on the
Path, and their own group at the end of the skills browser ("Reference &
agent workflows — for later").

## Demote-to-reference — the 8, named

| skill | why it fails the beginner bar |
|---|---|
| `direct-seedance-3-0` | A "direct with" skill for a model that is **unconfirmed** — announced by no vendor (Watchtower standing watch). A beginner cannot use it at all. Kept as a watched brief: what is announced, what is unconfirmed, what to use instead. |
| `direct-kling-4-0` | Same failure: the model is **announced only** ("API Coming Soon", no GA access, no pricing — Watchtower standing watch). Reference brief, not a directing skill. |
| `workflow-studio-plan` | Its own text: "Agent-driven pre-production when the Studio UI isn't in the loop — same math, same data, scriptable." A reproduction of a site tool's maths **for agents**; a beginner should use the Studio page itself. |
| `workflow-model-price-watch` | A procedure for reading three repo JSON files (`models.json`, `model-checks.json`, `model-review-queue.json`). Repo-data reference for agents; a beginner reads the Model Watch page. |
| `workflow-production-office` | Agent-crew infrastructure: it requires "an agent with local folder access" and is about making a production survive agent context death. Valuable — for a later, agent-run production. |
| `workflow-component-separation` | Pipeline architecture abstraction ("separately controllable components", "progressive-change workflows") with no concrete thing a first-timer makes. Reference for pipeline design. |
| `technique-async-remote` | A team production method (multiple collaborators, split disciplines, a $150K reference production). Not a first project; reference for when a team exists. |
| `technique-five-day-sprint` | Its own Use-when requires "deep tool fluency", and its pitfall states: "Sprinting without fluency produces nothing shippable." A method to grow into, not a beginner skill. |

## Rewrite-to-usable — the 12, named (all rewritten this rotation)

Each failed on surface only; the procedure underneath was sound. The
rewrites live in `scripts/build_skills.py` (HAND entries), so they are
the generator's text now, not hand edits.

| skill | what was wrong → what changed |
|---|---|
| `craft-style-lock` | A **stub**: its procedure was literally "See workflow-style-bible." A beginner hit a dead end. → Now a full standalone skill (write the one line, append verbatim, share the doc, never paraphrase) with the cross-reference kept as context. |
| `technique-hybrid-pipeline` | Desc was an insider codename ("the Passport Rush / Get Me Out method"). → "Film the emotional moments for real and let AI build the impossible parts around them…" |
| `technique-authored-style` | Desc was a codename ("the Le Drip / Peony method"). → "Choose a visual style that hides AI's mistakes instead of exposing them…" |
| `technique-photoreal-character` | Desc compressed to jargon ("locked POV: the character-first photoreal lane"). → "Make a realistic-looking short that feels acted, not generated: start from a real script and shoot every scene from one character's point of view." |
| `technique-longform-discipline` | Desc was a codename ("ONEIRIC's systems thinking"). → The habits named in plain words (map every shot, lock identities, draft cheap). |
| `technique-entry-killer-audit` | Desc assumed the reader knew what judges punish. → The punished flaws named outright (morphing faces, drifting costumes, show-off shots). |
| `longform-depth-map` | Jargon surface ("black-and-white depth channel") and a 3-step procedure too thin to execute. → Plain desc ("what's near and what's far"), inputs clarified, procedure completed (produce the map, attach it every generation, file it with the registry). |
| `longform-compute-envelope` | Title/desc were the jargon ("compute envelope"). → Title "Work out what a long film really costs"; the honest-total framing (re-generations included) up front. |
| `legal-paperwork-stack` | Desc was a pure jargon string ("Chain of title + E&O + …"). → What the stack is, in plain words, and who will ask for it. |
| `legal-script-clearance` | Desc led with internal rule numbers ("rules 1358–1367"). → What gets checked (every name, place, brand, real person) and why; rule numbers stay in the steps, where they belong. |
| `episode-studio-bridge` | Desc was implementation plumbing ("stage the planner's saved series into localStorage…"). → The user-visible outcome: planned episodes become a full Studio production plan with one button. |
| `studio-microdrama-plan` | Desc was a dense insider figure-list ("the documented $150-microdrama figures: … Qidian's 3-5x…"). → Plain framing (what a run of short episodes really costs and takes, from a documented real production). |

## Family results

| family | audited | pass | rewrite | demote |
|---|---|---|---|---|
| prompts | 47 | 47 | 0 | 0 |
| camera | 22 | 22 | 0 | 0 |
| models | 31 | 29 | 0 | 2 |
| checklists | 5 | 5 | 0 | 0 |
| longform | 13 | 11 | 2 | 0 |
| techniques | 7 | 0 | 5 | 2 |
| entry | 4 | 4 | 0 | 0 |
| workflow | 14 | 10 | 0 | 4 |
| compare | 10 | 10 | 0 | 0 |
| fix | 6 | 6 | 0 | 0 |
| budget | 3 | 3 | 0 | 0 |
| delivery | 4 | 4 | 0 | 0 |
| audio | 6 | 6 | 0 | 0 |
| recipes | 12 | 12 | 0 | 0 |
| styles | 8 | 8 | 0 | 0 |
| craft | 22 | 21 | 1 | 0 |
| performance | 9 | 9 | 0 | 0 |
| grading | 4 | 4 | 0 | 0 |
| legal | 5 | 3 | 2 | 0 |
| distribution | 2 | 2 | 0 | 0 |
| episodes | 5 | 4 | 1 | 0 |
| studio | 3 | 2 | 1 | 0 |
| **total** | **242** | **222** | **12** | **8** |

(The 242nd skill, `workflow-walk-the-path`, sits inside the workflow
family's 10 passes — judged as a path skill, per the rotation brief.)

Notes on judgement calls, so the counts can be re-litigated honestly:

- **Prompt and camera skills pass as families** because each is a fill-in
  artefact (a template with a worked, filled example; a move with exact
  paste-ready phrasing and a plain "when to use"). A beginner's outcome
  was only ever *implied* — the new gets-you line states it, which is
  precisely the fix the order specified for passing skills.
- **Model skills for active models pass** even where a rate is unpublished
  (Soul Cinema): the skill's job — when to use it, what it costs where
  known, what to design around — is executable today, and the gap is
  disclosed in the skill itself. Only models that **cannot be used at
  all** (unconfirmed, announced-only) demote.
- **The tool-sheet skills pass** (continuity ledger, cue sheet, grade
  sheet, cut sheet, take sheet, longform sheet, script clearance): each
  is a working page on this site with gates a beginner follows in order;
  their gets-you lines name the page so the route from skill to tool is
  one click of comprehension.
- `workflow-walk-the-path` **passes as a path skill**: its job is the
  walk itself; it states what it is, what it gets the learner (always
  knowing what to learn next), and how to use it, in plain words.

## Relation to Visitor Panel ticket VP-0010 — stated honestly

VP-0010's sample verdict ("how ✗ 12/12") was a **reachability**
verdict, not a procedure verdict: at HEAD `fe22cc5` no card and no
Path row linked anywhere, so a beginner could not reach *any*
procedure, however sound the procedure itself was. This audit judged
the procedures and their surfaces; it does not contradict the panel —
both records are true about different layers. The reachability failure
is fixed structurally in this same rotation (below), and the panel's
retest walks the same 12 sampled skills against the built pages.

## Structural completion (VP-0010's core, landed with this audit)

- **Per-skill pages, generator-owned:** `build_site.py`'s
  `build_skill_pages()` renders every skill's authored body into
  `site/skills/<id>.html` on every build (the build wipes `site/`
  first, so a rebuild regenerates — never orphans — the pages). Each
  page carries the front door (what it is, what it gets you, first
  step, what you need, an effort estimate, level, prerequisite, the
  worked example up front), the full procedure body (inputs, steps,
  worked example, pitfalls), and plain-words glosses for jargon on the
  card (sakuga, J/L cuts, identity drift, Soul 2.0, face-morph,
  shot-reverse-shot — glossary-backed or curated in
  `SKILL_JARGON_PATTERNS`). The skills filter placeholder no longer
  uses "BAF", a term glossed nowhere in the guide; no expansion was
  invented for it.
- **Every card links:** `assets/js/skills.js` renders each card's
  title and an explicit "Open the skill →" link to
  `skills/<id>.html` — 242 of 242 cards, proven by executing the
  renderer in `scripts/skill-pages.test.js`.
- **Every Path row links:** `path.html` rows link to
  `skills/<id>.html` — 241 of 241, in curriculum order, proven by
  the same test from the rendered tree.
- **Reference skills:** the 8 demote-to-reference skills keep pages,
  clearly banner-marked as reference, and stay in their own browser
  group — reachable, not deleted, not posing as beginner skills.

## The U1–U6 count (research cycle-138 criteria, applied to the front door)

The bar above was this audit's working form. The same library was also
scored against research cycle-138's six pass/fail criteria — **front-door
only, all six to pass** — where the front door is the skills-browser card
plus the first screen of the skill's own page (the structural completion
below is what gives every skill a front door worth scoring). The
machine-readable record is `data/v1/skills-audit.json`
(`skills-audit/2.0`, kept by `scripts/audit_skills.py`, which re-derives
every verdict from the library on each run):

| criterion | pass | of |
|---|---|---|
| U1 FOR — verb+object job stated | 242 | 242 |
| U2 GET — a named, countable deliverable (the gets-you line) | 242 | 242 |
| U3 FIRST ACTION + EFFORT — step 1, what-you'll-need, minutes up front | 242 | 242 |
| U4 LEVEL + PREREQUISITE — one-clause honest gate | 241 | 242 |
| U5 PROOF — worked example visible at the front door | 242 | 242 |
| U6 NO UNPAID JARGON — front-door terms glossed at first use | 242 | 242 |

- **Pass all six, as beginner skills: 234 of 242.** This is the same 234
  as the verdict table above (222 pass + 12 rewrite-to-usable), now each
  verified criterion-by-criterion at the front door.
- **Front-door-fails: 0.** No beginner skill fails any criterion on
  presentation. (U3/U5 pass because the procedure, inputs and worked
  example always existed in the skill files — what was missing was
  reachability and the front-door header, both fixed structurally
  below, not by body rewrites, exactly as cycle-138 predicted.)
- **Class-fails: 8 of 242 (3.3%)** — the demote-to-reference eight,
  classified per cycle-138's classes: **Class A** (glossary/taxonomy):
  **0** — no skill in the library is a definition list; the glossary
  itself is already a separate reference layer, not a skill.
  **Class B** (tool/model catalogue reference): **3** —
  `direct-seedance-3-0`, `direct-kling-4-0` (catalogue entries for
  models nobody can use at all) and `workflow-model-price-watch`
  (a repo-data catalogue procedure for agents). The remaining model
  and comparison skills pass as Class-B-reframed decisions: each names
  its output (a go/no-go on a named model for a named shot, with the
  cost and the weakness to design around) in its gets-you line.
  **Class C** (background/theory/method with no beginner procedure):
  **5** — `workflow-studio-plan`, `workflow-production-office`,
  `workflow-component-separation`, `technique-async-remote`,
  `technique-five-day-sprint`.
- U4's single failure is `technique-five-day-sprint`, whose own
  Use-when requires "deep tool fluency" — an honest gate, and precisely
  why it sits in Class C rather than among the beginner 234.
- **Pivot verdict, by the filed rule (the class-fail count decides):**
  8 class-fails in 242 does not indicate an information-site pivot.
  The layer is a skills layer with a small, honestly-labelled reference
  shelf — the pivot question returns to the user with these counts,
  not taken here.

## Left open (for the parent / user)

- **The Path still sequences the 8 reference skills** (they sit in
  Stages 2–4 and are now tagged "reference" on the page). The Path's
  coverage law (241 skills, exactly once) was left intact this rotation;
  whether a future rotation re-sequences the Path to 233 beginner skills
  — or keeps reference stops on the walk, marked — is a curriculum
  decision that should ride with the user's verdict on this audit.
- The information-site pivot is **not** taken and, by these counts, not
  indicated: 97% of the layer is beginner-usable after this rotation's
  fixes. The call returns to the user with the numbers above.
