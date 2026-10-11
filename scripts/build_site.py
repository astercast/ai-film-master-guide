#!/usr/bin/env python3
"""Build the static guide site from chapter Markdown.

Usage: python3 scripts/build_site.py
Reads chapters from <repo>/<section>/*.md, writes HTML to <repo>/site/.
"""
import html
import json
import re
import shutil
import subprocess
from pathlib import Path

import md2html

ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT / "site"

SECTIONS = [
    ("higgsfield", "Higgsfield"),
    ("craft", "Craft"),
    ("platforms", "Platforms"),
    ("economics", "Economics"),
    ("case-studies", "Case Studies"),
    ("distribution", "Distribution"),
    ("legal", "Rights & Disclosure"),
    ("sources", "Sources"),
]

CHAPTER_ORDER = {
    "higgsfield": ["platform-mastery", "prompt-engineering", "soul-id-deep-dive", "competition-entry-craft"],
    "craft": ["story-structure", "cinematic-language", "character-consistency", "directing-performance", "color-grading", "sound-music-audio", "editing-pipeline", "long-form-pipeline", "failure-gallery"],
    "platforms": ["field-guide", "when-to-use-what"],
    "economics": ["credit-math"],
    "case-studies": ["competition-teardowns", "entry-craft-teardowns"],
    "distribution": ["release-paths"],
    "legal": ["rights-and-disclosure"],
    "sources": ["source-index"],
}

CSS = ["assets/css/tokens.css", "assets/css/base.css", "assets/css/layout.css",
       "assets/css/components.css", "assets/css/docs.css"]

NAV_ITEMS = [
    ("index.html", "Guide"),
    ("skills.html", "Skills"),
    ("workshop.html", "Workshop"),
    ("quiz.html", "Quiz"),
    ("changelog.html", "Changelog"),
    ("skill-spec.html", "Skill spec"),
    ("api.html", "API"),
]

FOOTER_ITEMS = [
    ("index.html", "Guide"),
    ("skills.html", "Skills"),
    ("workshop.html", "Workshop"),
    ("quiz.html", "Quiz"),
    ("budget.html", "Budget"),
    ("changelog.html", "Changelog"),
    ("skill-spec.html", "Skill spec"),
    ("api.html", "API"),
]


def nav_html(prefix, current):
    parts = []
    for href, label in NAV_ITEMS:
        cur = ' aria-current="page"' if href == current else ""
        parts.append(f'<a href="{prefix}{href}"{cur}>{label}</a>')
    return "\n        ".join(parts)


def footer_html(prefix):
    return "".join(f'<a href="{prefix}{href}">{label}</a>' for href, label in FOOTER_ITEMS)

PAGE_TMPL = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title} — AI Film Master Guide</title>
  <meta name="description" content="{desc}">
  {css}
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="container header-bar">
      <a class="brand" href="../index.html" aria-label="AI Film Master Guide home">
        <span class="brand-mark" aria-hidden="true">AF</span>
        <span class="brand-name">AI FILM<small>MASTER GUIDE</small></span>
      </a>
      <nav class="site-nav" aria-label="Primary">
        {sitenav}
      </nav>
      <button type="button" class="btn btn-sm btn-ghost palette-open" aria-label="Search the guide (Ctrl+K)">
        <span aria-hidden="true">⌘K</span> Search
      </button>
    </div>
  </header>
  <div class="container docs-layout">
    <nav class="docs-nav" aria-label="Chapters">{nav}</nav>
    <main id="main" class="docs-main">
      <div class="progress-bar" aria-hidden="true"><span></span></div>
      <p class="crumb"><a href="../index.html">Guide</a> / {section_name}</p>
      <article class="prose">{body}</article>
      <nav class="prevnext" aria-label="Next and previous chapters">{prevnext}</nav>
    </main>
    <aside class="docs-toc" aria-label="On this page"><p class="toc-h">On this page</p>{toc}</aside>
  </div>
  <footer class="site-footer">
    <div class="container footer-grid">
      <p>AI Film Master Guide — research notes for professional AI filmmaking. Sources linked per chapter.</p>
      <nav aria-label="Footer">{footer}</nav>
    </div>
  </footer>
  <button type="button" class="back-to-top" aria-label="Back to top">↑</button>
  <div class="palette" id="palette" role="dialog" aria-modal="true" aria-label="Search the guide" hidden>
    <div class="palette-box">
      <input id="palette-input" type="search" placeholder="Search chapters, prompts, models…" autocomplete="off" aria-label="Search the guide">
      <div id="palette-results" role="listbox" aria-label="Search results"></div>
    </div>
  </div>
  <script src="../assets/js/palette.js"></script>
  <script src="../assets/js/docs.js"></script>
  <script src="../assets/js/glossary.js"></script>
</body>
</html>
"""

INDEX_TMPL = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>AI Film Master Guide — Professional AI Filmmaking</title>
  <meta name="description" content="The master guide to professional AI filmmaking: Higgsfield mastery, pro craft, animated and photorealistic tracks, competition-entry craft, and a machine-readable API.">
  {css}
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="container header-bar">
      <a class="brand" href="index.html" aria-label="AI Film Master Guide home">
        <span class="brand-mark" aria-hidden="true">AF</span>
        <span class="brand-name">AI FILM<small>MASTER GUIDE</small></span>
      </a>
      <nav class="site-nav" aria-label="Primary">
        {sitenav}
      </nav>
      <button type="button" class="btn btn-sm btn-ghost palette-open" aria-label="Search the guide (Ctrl+K)">
        <span aria-hidden="true">⌘K</span> Search
      </button>
    </div>
  </header>
  <main id="main">
    <section class="hero hero-film" aria-labelledby="hero-title">
      <div class="container hero-inner">
        <span class="hero-kicker">Professional AI filmmaking</span>
        <h1 id="hero-title">Make films with AI<br><span class="accent">like a studio.</span></h1>
        <p class="lede">Twenty chapters on Higgsfield mastery, professional craft, directing performance, color grading, sound, economics, long-form pipelines, competition-entry craft, distribution, and rights — with separate tracks for animated/stylized and photorealistic production. Plus a machine-readable API and 191 task skills for agents.</p>
        <div class="stat-strip">
          <div class="stat"><div class="stat-value">20</div><div class="stat-label">Chapters</div></div>
          <div class="stat"><div class="stat-value">31</div><div class="stat-label">Prompt templates</div></div>
          <div class="stat"><div class="stat-value">22</div><div class="stat-label">Camera moves</div></div>
          <div class="stat"><div class="stat-value">18</div><div class="stat-label">Models compared</div></div>
          <div class="stat"><div class="stat-value">79</div><div class="stat-label">Glossary terms</div></div>
          <div class="stat"><div class="stat-value">180</div><div class="stat-label">Agent skills</div></div>
        </div>
      </div>
    </section>

    <section class="container tracks" aria-labelledby="tracks-h">
      <h2 id="tracks-h">Pick your track</h2>
      <div class="track-grid">
        <article class="card track-card">
          <h3>Animated / Stylized</h3>
          <p>Anime, Ghibli-style, Pixar-style 3D, 2D cartoon, claymation. Cheaper, more forgiving, dedicated judged categories — with its own prompt register (no lens or DOF language) and model shortlist.</p>
          <div class="btn-row">
            <a class="btn btn-sm" href="higgsfield/prompt-engineering.html">Prompt engineering</a>
            <a class="btn btn-sm" href="platforms/when-to-use-what.html">Model selection</a>
          </div>
        </article>
        <article class="card track-card">
          <h3>Photorealistic</h3>
          <p>Premium models, identity discipline, and post-production craft to pass for real. The craft lane for drama, action, and trailer-grade work.</p>
          <div class="btn-row">
            <a class="btn btn-sm" href="higgsfield/soul-id-deep-dive.html">Soul ID deep dive</a>
            <a class="btn btn-sm" href="craft/character-consistency.html">Character consistency</a>
          </div>
        </article>
      </div>
    </section>

    <section class="container" aria-labelledby="paths-h">
      <h2 id="paths-h">Start here: learning paths</h2>
      <p class="section-lede">Don't read twenty chapters in order. Pick your goal — each path is the shortest route through the guide that gets you there. Tick steps off as you finish them; your progress is saved in this browser.</p>
      <div class="path-grid">
        <article class="card path-card" data-path="first-film">
          <h3>Your first AI film <span class="path-time">a weekend</span></h3>
          <p>Story to finished short in two days. The minimum viable path.</p>
          <div class="path-bar" aria-hidden="true"><span class="path-bar-fill"></span></div>
          <p class="path-progress"><span data-path-progress aria-live="polite">0 of 5 complete</span><button type="button" class="btn btn-sm btn-ghost" data-path-reset="first-film">Reset</button></p>
          <ol class="path-steps">
            <li><input type="checkbox" class="path-check" id="pc-first-film-1" data-step="first-film-1" aria-label="Mark complete: Story structure"><a href="craft/story-structure.html">Story structure</a></li>
            <li><input type="checkbox" class="path-check" id="pc-first-film-2" data-step="first-film-2" aria-label="Mark complete: Prompt engineering"><a href="higgsfield/prompt-engineering.html">Prompt engineering</a></li>
            <li><input type="checkbox" class="path-check" id="pc-first-film-3" data-step="first-film-3" aria-label="Mark complete: Model selection"><a href="platforms/when-to-use-what.html">Model selection</a></li>
            <li><input type="checkbox" class="path-check" id="pc-first-film-4" data-step="first-film-4" aria-label="Mark complete: Credit math"><a href="economics/credit-math.html">Credit math</a></li>
            <li><input type="checkbox" class="path-check" id="pc-first-film-5" data-step="first-film-5" aria-label="Mark complete: Editing pipeline"><a href="craft/editing-pipeline.html">Editing pipeline</a></li>
          </ol>
        </article>
        <article class="card path-card" data-path="competition">
          <h3>Competition-ready craft <span class="path-time">2–4 weeks</span></h3>
          <p>What judged competitions teach about production. The craft bar, taught by the judging table.</p>
          <div class="path-bar" aria-hidden="true"><span class="path-bar-fill"></span></div>
          <p class="path-progress"><span data-path-progress aria-live="polite">0 of 5 complete</span><button type="button" class="btn btn-sm btn-ghost" data-path-reset="competition">Reset</button></p>
          <ol class="path-steps">
            <li><input type="checkbox" class="path-check" id="pc-competition-1" data-step="competition-1" aria-label="Mark complete: Competition-entry craft"><a href="higgsfield/competition-entry-craft.html">Competition-entry craft</a></li>
            <li><input type="checkbox" class="path-check" id="pc-competition-2" data-step="competition-2" aria-label="Mark complete: Directing performance"><a href="craft/directing-performance.html">Directing performance</a></li>
            <li><input type="checkbox" class="path-check" id="pc-competition-3" data-step="competition-3" aria-label="Mark complete: Color grading"><a href="craft/color-grading.html">Color grading</a></li>
            <li><input type="checkbox" class="path-check" id="pc-competition-4" data-step="competition-4" aria-label="Mark complete: Sound and music"><a href="craft/sound-music-audio.html">Sound &amp; music</a></li>
            <li><input type="checkbox" class="path-check" id="pc-competition-5" data-step="competition-5" aria-label="Mark complete: Entry craft teardowns"><a href="case-studies/entry-craft-teardowns.html">Entry craft teardowns</a></li>
          </ol>
        </article>
        <article class="card path-card" data-path="animated">
          <h3>Animated / stylized <span class="path-time">1–2 weeks</span></h3>
          <p>Cheaper, more forgiving, dedicated judged categories.</p>
          <div class="path-bar" aria-hidden="true"><span class="path-bar-fill"></span></div>
          <p class="path-progress"><span data-path-progress aria-live="polite">0 of 4 complete</span><button type="button" class="btn btn-sm btn-ghost" data-path-reset="animated">Reset</button></p>
          <ol class="path-steps">
            <li><input type="checkbox" class="path-check" id="pc-animated-1" data-step="animated-1" aria-label="Mark complete: Prompt engineering, animated register"><a href="higgsfield/prompt-engineering.html">Prompt engineering</a> <span class="path-note">animated register</span></li>
            <li><input type="checkbox" class="path-check" id="pc-animated-2" data-step="animated-2" aria-label="Mark complete: Cinematic language"><a href="craft/cinematic-language.html">Cinematic language</a></li>
            <li><input type="checkbox" class="path-check" id="pc-animated-3" data-step="animated-3" aria-label="Mark complete: Character consistency"><a href="craft/character-consistency.html">Character consistency</a></li>
            <li><input type="checkbox" class="path-check" id="pc-animated-4" data-step="animated-4" aria-label="Mark complete: Model selection"><a href="platforms/when-to-use-what.html">Model selection</a></li>
          </ol>
        </article>
        <article class="card path-card" data-path="photoreal">
          <h3>Photorealistic drama <span class="path-time">3–6 weeks</span></h3>
          <p>The premium lane: invisible AI, visible craft.</p>
          <div class="path-bar" aria-hidden="true"><span class="path-bar-fill"></span></div>
          <p class="path-progress"><span data-path-progress aria-live="polite">0 of 4 complete</span><button type="button" class="btn btn-sm btn-ghost" data-path-reset="photoreal">Reset</button></p>
          <ol class="path-steps">
            <li><input type="checkbox" class="path-check" id="pc-photoreal-1" data-step="photoreal-1" aria-label="Mark complete: Soul ID deep dive"><a href="higgsfield/soul-id-deep-dive.html">Soul ID deep dive</a></li>
            <li><input type="checkbox" class="path-check" id="pc-photoreal-2" data-step="photoreal-2" aria-label="Mark complete: Character consistency"><a href="craft/character-consistency.html">Character consistency</a></li>
            <li><input type="checkbox" class="path-check" id="pc-photoreal-3" data-step="photoreal-3" aria-label="Mark complete: Directing performance"><a href="craft/directing-performance.html">Directing performance</a></li>
            <li><input type="checkbox" class="path-check" id="pc-photoreal-4" data-step="photoreal-4" aria-label="Mark complete: Color grading"><a href="craft/color-grading.html">Color grading</a></li>
          </ol>
        </article>
        <article class="card path-card" data-path="longform">
          <h3>Long-form: 20+ minutes <span class="path-time">ongoing</span></h3>
          <p>Systems, not prompts. How features actually get made.</p>
          <div class="path-bar" aria-hidden="true"><span class="path-bar-fill"></span></div>
          <p class="path-progress"><span data-path-progress aria-live="polite">0 of 4 complete</span><button type="button" class="btn btn-sm btn-ghost" data-path-reset="longform">Reset</button></p>
          <ol class="path-steps">
            <li><input type="checkbox" class="path-check" id="pc-longform-1" data-step="longform-1" aria-label="Mark complete: Long-form pipeline"><a href="craft/long-form-pipeline.html">Long-form pipeline</a></li>
            <li><input type="checkbox" class="path-check" id="pc-longform-2" data-step="longform-2" aria-label="Mark complete: Directing performance"><a href="craft/directing-performance.html">Directing performance</a></li>
            <li><input type="checkbox" class="path-check" id="pc-longform-3" data-step="longform-3" aria-label="Mark complete: Editing pipeline"><a href="craft/editing-pipeline.html">Editing pipeline</a></li>
            <li><input type="checkbox" class="path-check" id="pc-longform-4" data-step="longform-4" aria-label="Mark complete: Credit math, compute envelopes"><a href="economics/credit-math.html">Credit math</a> <span class="path-note">compute envelopes</span></li>
          </ol>
        </article>
      </div>
    </section>

    <section class="container" aria-labelledby="chapters-h">
      <h2 id="chapters-h">The chapters</h2>
      {chapter_grid}
    </section>

    <section class="container" aria-labelledby="calc-promo-h">
      <div class="card calc-promo">
        <div>
          <h2 id="calc-promo-h">Budget your film before you spend a credit</h2>
          <p>The interactive calculator turns runtime, shot length, model, and discipline into a cost envelope — grounded in the credit-math chapter's per-clip data.</p>
        </div>
        <a class="btn" href="budget.html">Open the calculator</a>
      </div>
    </section>

    <section class="container" aria-labelledby="workshop-promo-h">
      <div class="card calc-promo">
        <div>
          <h2 id="workshop-promo-h">Write a pro prompt in sixty seconds</h2>
          <p>The prompt workshop fills any of the 31 guide templates against the model of your choice — with the anatomy notes that explain why each template works, and one-click copy.</p>
        </div>
        <a class="btn" href="workshop.html">Open the workshop</a>
      </div>
    </section>

    <section class="container" aria-labelledby="api-h">
      <h2 id="api-h">Built for agents too</h2>
      <div class="card" style="margin-bottom:var(--space-7);">
        <p style="color:var(--ink-dim);">Versioned JSON under <code>api/v1/</code>: models with live credit costs, 31 prompt templates, the 22-move camera lexicon, production checklists, and the glossary — with JSON Schemas, <code>llms.txt</code>, and <code>API.md</code>.</p>
        <div class="btn-row"><a class="btn" href="api.html">Read the API docs</a></div>
      </div>
    </section>
  </main>
  <footer class="site-footer">
    <div class="container footer-grid">
      <p>AI Film Master Guide — research notes for professional AI filmmaking. Sources linked per chapter.</p>
      <nav aria-label="Footer">{footer}</nav>
    </div>
  </footer>
  <div class="palette" id="palette" role="dialog" aria-modal="true" aria-label="Search the guide" hidden>
    <div class="palette-box">
      <input id="palette-input" type="search" placeholder="Search chapters, prompts, models…" autocomplete="off" aria-label="Search the guide">
      <div id="palette-results" role="listbox" aria-label="Search results"></div>
    </div>
  </div>
  <script src="assets/js/palette.js"></script>
  <script src="assets/js/paths.js"></script>
</body>
</html>
"""


def chapter_title(md):
    m = re.search(r"^#\s+(.+)$", md, re.M)
    return m.group(1).strip() if m else "Untitled"


def chapter_desc(md):
    # First paragraph after the H1, stripped of markdown, truncated
    lines = md.split("\n")
    started = False
    for line in lines:
        s = line.strip()
        if s.startswith("#"):
            started = True
            continue
        if started and s and not s.startswith(("!", "[", ">")):
            clean = re.sub(r"[*_`]", "", s)
            return clean[:160]
    return "AI filmmaking guide chapter."


def build_nav(chapters):
    parts = []
    for section_id, section_name in SECTIONS:
        items = "".join(
            f'<li><a href="../{section_id}/{slug}.html">{c["title"]}</a></li>'
            for slug, c in chapters[section_id]
        )
        parts.append(f"<details open><summary>{section_name}</summary><ul>{items}</ul></details>")
    return "\n".join(parts)


SKILLS_TMPL = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Skills browser — AI Film Master Guide</title>
  <meta name="description" content="Browse all 191 task skills: prompts, camera, models, long-form pipelines, craft techniques and more.">
  {css}
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="container header-bar">
      <a class="brand" href="index.html" aria-label="AI Film Master Guide home">
        <span class="brand-mark" aria-hidden="true">AF</span>
        <span class="brand-name">AI FILM<small>MASTER GUIDE</small></span>
      </a>
      <nav class="site-nav" aria-label="Primary">
        {sitenav}
      </nav>
      <button type="button" class="btn btn-sm btn-ghost palette-open" aria-label="Search the guide (Ctrl+K)">
        <span aria-hidden="true">⌘K</span> Search
      </button>
    </div>
  </header>
  <main id="main">
    <section class="hero hero-film" aria-labelledby="skills-title">
      <div class="container hero-inner">
        <span class="hero-kicker">For agents &amp; humans</span>
        <h1 id="skills-title">Task <span class="accent">skills.</span></h1>
        <p class="lede">Every procedure in the guide as a loadable skill: inputs, steps, worked examples, pitfalls. <span id="skills-count" aria-live="polite"></span></p>
        <div class="field" style="max-width:480px;">
          <label for="skills-filter">Filter skills</label>
          <input class="input" id="skills-filter" type="search" placeholder="e.g. lip sync, BAF, budget…" autocomplete="off">
        </div>
      </div>
    </section>
    <section class="container" aria-label="Skills">
      <div id="skills-list"></div>
      <div class="empty-state" id="skills-empty" hidden><p>No skills match that filter.</p></div>
      <p class="calc-note" style="margin-bottom:var(--space-7);">Skills live in <code>skills/</code> in the repo and are indexed by <code>skills/index.json</code>. Agents: <code>api/v1/index.json</code> points here.</p>
    </section>
  </main>
  <footer class="site-footer">
    <div class="container footer-grid">
      <p>AI Film Master Guide — research notes for professional AI filmmaking. Sources linked per chapter.</p>
      <nav aria-label="Footer">{footer}</nav>
    </div>
  </footer>
  <script src="assets/js/skills.js"></script>
</body>
</html>
"""

BUDGET_TMPL = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Budget calculator — AI Film Master Guide</title>
  <meta name="description" content="Estimate the compute budget for an AI film: runtime, shot length, model, and discipline in — cost envelope out.">
  {css}
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="container header-bar">
      <a class="brand" href="index.html" aria-label="AI Film Master Guide home">
        <span class="brand-mark" aria-hidden="true">AF</span>
        <span class="brand-name">AI FILM<small>MASTER GUIDE</small></span>
      </a>
      <nav class="site-nav" aria-label="Primary">
        {sitenav}
      </nav>
      <button type="button" class="btn btn-sm btn-ghost palette-open" aria-label="Search the guide (Ctrl+K)">
        <span aria-hidden="true">⌘K</span> Search
      </button>
    </div>
  </header>
  <main id="main">
    <section class="hero hero-film" aria-labelledby="budget-title">
      <div class="container hero-inner">
        <span class="hero-kicker">Economics</span>
        <h1 id="budget-title">Budget <span class="accent">calculator.</span></h1>
        <p class="lede">Runtime, shot length, model, and discipline in — a cost envelope out. Grounded in the <a href="economics/credit-math.html">credit-math</a> chapter (third-party per-clip estimates, Oct 2026).</p>
      </div>
    </section>
    <section class="container" aria-labelledby="calc-h">
      <h2 id="calc-h">Your production</h2>
      <div class="calc-grid">
        <form class="card calc-form" aria-label="Budget inputs" onsubmit="return false;">
          <div class="field">
            <label for="b-runtime">Target runtime: <output id="b-runtime-out" for="b-runtime">4 min</output></label>
            <input type="range" id="b-runtime" min="1" max="120" step="1" value="4">
          </div>
          <div class="field">
            <label for="b-shotlen">Average shot length (seconds)</label>
            <input class="input" type="number" id="b-shotlen" min="2" max="30" step="1" value="4">
          </div>
          <div class="field">
            <label for="b-model">Model / platform</label>
            <select class="input" id="b-model"></select>
          </div>
          <div class="field">
            <label for="b-takes">Takes per keeper</label>
            <select class="input" id="b-takes">
              <option value="3">3 — disciplined (draft-then-hero)</option>
              <option value="5" selected>5 — typical</option>
              <option value="8">8 — perfectionist / action-heavy</option>
            </select>
          </div>
        </form>
        <div class="card calc-results" aria-live="polite" aria-label="Budget estimate">
          <div class="calc-stat"><div class="calc-value" id="r-shots">—</div><div class="calc-label">Shots</div></div>
          <div class="calc-stat"><div class="calc-value" id="r-gens">—</div><div class="calc-label">Generations</div></div>
          <div class="calc-stat highlight"><div class="calc-value" id="r-low">—</div><div class="calc-label">Envelope low</div></div>
          <div class="calc-stat highlight"><div class="calc-value" id="r-high">—</div><div class="calc-label">Envelope high</div></div>
          <div class="calc-stat"><div class="calc-value" id="r-rule">—</div><div class="calc-label">$80/min rule of thumb</div></div>
          <p class="calc-note">Per-clip costs are third-party estimates (Oct 2026) — verify live before budgeting. The envelope budgets the rejects, not just the hero renders.</p>
        </div>
      </div>
    </section>
  </main>
  <footer class="site-footer">
    <div class="container footer-grid">
      <p>AI Film Master Guide — research notes for professional AI filmmaking. Sources linked per chapter.</p>
      <nav aria-label="Footer">{footer}</nav>
    </div>
  </footer>
  <script src="assets/js/budget.js"></script>
</body>
</html>
"""

WORKSHOP_TMPL = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Prompt workshop — AI Film Master Guide</title>
  <meta name="description" content="Interactive prompt workshop: pick a template, model, and track, fill the placeholders, and copy a production-ready prompt — with anatomy notes on why each template works.">
  {css}
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="container header-bar">
      <a class="brand" href="index.html" aria-label="AI Film Master Guide home">
        <span class="brand-mark" aria-hidden="true">AF</span>
        <span class="brand-name">AI FILM<small>MASTER GUIDE</small></span>
      </a>
      <nav class="site-nav" aria-label="Primary">
        {sitenav}
      </nav>
      <button type="button" class="btn btn-sm btn-ghost palette-open" aria-label="Search the guide (Ctrl+K)">
        <span aria-hidden="true">⌘K</span> Search
      </button>
    </div>
  </header>
  <main id="main">
    <section class="hero hero-film" aria-labelledby="workshop-title">
      <div class="container hero-inner">
        <span class="hero-kicker">Interactive tool</span>
        <h1 id="workshop-title">Prompt <span class="accent">workshop.</span></h1>
        <p class="lede">Pick a template, a model, and a track — fill the placeholders and copy a production-ready prompt. Every template carries its anatomy notes, so you learn why it works while you use it.</p>
      </div>
    </section>
    <section class="container" aria-labelledby="ws-pick-h">
      <div class="card" id="ws-pickers" style="margin-bottom:var(--space-5);">
        <h2 id="ws-pick-h">1. Pick your ingredients</h2>
        <div class="placeholder-grid">
          <div class="field">
            <label for="ws-track">Track</label>
            <select class="input" id="ws-track">
              <option value="all">All tracks</option>
              <option value="core">Core</option>
              <option value="animated">Animated / stylized</option>
              <option value="photorealistic">Photorealistic</option>
            </select>
          </div>
          <div class="field">
            <label for="ws-template">Template</label>
            <select class="input" id="ws-template"></select>
          </div>
          <div class="field">
            <label for="ws-model">Model</label>
            <select class="input" id="ws-model"></select>
          </div>
        </div>
        <p class="empty-state" id="ws-error" hidden></p>
      </div>
      <div class="workshop-grid">
        <div class="card">
          <h2>2. Fill the placeholders</h2>
          <p class="save-meta">Suggested defaults are pre-filled wherever the template's author gave one.</p>
          <div class="placeholder-grid" id="ws-fields"></div>
          <p class="empty-state" id="ws-fields-empty" hidden>No placeholders in this template.</p>
        </div>
        <div>
          <div class="card" id="ws-why" style="margin-bottom:var(--space-5);" aria-live="polite"></div>
          <div class="card">
            <h2>3. Copy your prompt</h2>
            <div class="prompt-preview" id="ws-preview" aria-live="polite"></div>
            <p class="empty-state" id="ws-preview-empty" hidden>Pick a template to preview your prompt.</p>
            <div class="btn-row">
              <button type="button" class="btn btn-gold" id="ws-copy" disabled>Copy prompt</button>
              <button type="button" class="btn" id="ws-save" disabled>Save this prompt</button>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="container" aria-labelledby="ws-saves-h">
      <h2 id="ws-saves-h">Your saved prompts</h2>
      <p class="section-lede">Saved in this browser only — never sent anywhere. Rate your keepers; the highest-rated float to the top.</p>
      <div id="ws-saves"></div>
      <div class="empty-state" id="ws-saves-empty" hidden><p>No saved prompts yet. Fill a template above and hit &ldquo;Save this prompt&rdquo;.</p></div>
      <p class="calc-note" style="margin-bottom:var(--space-7);">Templates and models come from <code>prompt-templates.json</code> and <code>models.json</code> — the same versioned API the guide publishes under <code>api/v1/</code>.</p>
    </section>
  </main>
  <footer class="site-footer">
    <div class="container footer-grid">
      <p>AI Film Master Guide — research notes for professional AI filmmaking. Sources linked per chapter.</p>
      <nav aria-label="Footer">{footer}</nav>
    </div>
  </footer>
  <div class="palette" id="palette" role="dialog" aria-modal="true" aria-label="Search the guide" hidden>
    <div class="palette-box">
      <input id="palette-input" type="search" placeholder="Search chapters, prompts, models…" autocomplete="off" aria-label="Search the guide">
      <div id="palette-results" role="listbox" aria-label="Search results"></div>
    </div>
  </div>
  <script src="assets/js/palette.js"></script>
  <script src="assets/js/workshop.js"></script>
</body>
</html>
"""

QUIZ_TMPL = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Model-picker quiz — AI Film Master Guide</title>
  <meta name="description" content="Five questions, one ranked shortlist: the model-picker quiz scores all 18 video models in the guide's API against your use case, budget, and audio needs — with live cost math.">
  {css}
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="container header-bar">
      <a class="brand" href="index.html" aria-label="AI Film Master Guide home">
        <span class="brand-mark" aria-hidden="true">AF</span>
        <span class="brand-name">AI FILM<small>MASTER GUIDE</small></span>
      </a>
      <nav class="site-nav" aria-label="Primary">
        {sitenav}
      </nav>
      <button type="button" class="btn btn-sm btn-ghost palette-open" aria-label="Search the guide (Ctrl+K)">
        <span aria-hidden="true">⌘K</span> Search
      </button>
    </div>
  </header>
  <main id="main">
    <section class="hero hero-film" aria-labelledby="quiz-title">
      <div class="container hero-inner">
        <span class="hero-kicker">Interactive tool</span>
        <h1 id="quiz-title">Model-picker <span class="accent">quiz.</span></h1>
        <p class="lede">Five questions. A ranked top 3 with cost math — scored live from <code>models.json</code>, so the picks stay fresh as the data does.</p>
      </div>
    </section>
    <section class="container" aria-labelledby="quiz-form-h">
      <form class="card" id="quiz-form">
        <h2 id="quiz-form-h">1. What&apos;s the job?</h2>
        <div class="quiz-options" role="radiogroup" aria-label="Primary use case">
          <label class="quiz-opt"><input type="radio" name="usecase" value="dialogue" required> <span><strong>Dialogue</strong> with synced speech</span></label>
          <label class="quiz-opt"><input type="radio" name="usecase" value="photoreal"> <span><strong>Photoreal humans</strong> / drama</span></label>
          <label class="quiz-opt"><input type="radio" name="usecase" value="stylized"> <span><strong>Stylized</strong> / animated</span></label>
          <label class="quiz-opt"><input type="radio" name="usecase" value="drafts"> <span><strong>Cheap drafts</strong> &amp; fast iteration</span></label>
          <label class="quiz-opt"><input type="radio" name="usecase" value="longform"> <span><strong>Long-form</strong> / multi-shot narrative</span></label>
          <label class="quiz-opt"><input type="radio" name="usecase" value="presenter"> <span><strong>Talking presenter</strong> / ads</span></label>
        </div>
        <h2>2. Budget tier?</h2>
        <div class="quiz-options" role="radiogroup" aria-label="Budget tier">
          <label class="quiz-opt"><input type="radio" name="budget" value="shoestring" required> <span><strong>Shoestring</strong> — cheapest viable</span></label>
          <label class="quiz-opt"><input type="radio" name="budget" value="balanced"> <span><strong>Balanced</strong> — value per credit</span></label>
          <label class="quiz-opt"><input type="radio" name="budget" value="premium"> <span><strong>Premium</strong> — quality first</span></label>
        </div>
        <h2>3. What look?</h2>
        <div class="quiz-options" role="radiogroup" aria-label="Desired look">
          <label class="quiz-opt"><input type="radio" name="look" value="realism" required> <span><strong>Maximum realism</strong></span></label>
          <label class="quiz-opt"><input type="radio" name="look" value="balanced"> <span><strong>Balanced</strong></span></label>
          <label class="quiz-opt"><input type="radio" name="look" value="stylized"> <span><strong>Stylized</strong></span></label>
        </div>
        <h2>4. Native audio needed?</h2>
        <div class="quiz-options" role="radiogroup" aria-label="Native audio need">
          <label class="quiz-opt"><input type="radio" name="audio" value="must" required> <span><strong>Must-have</strong> — dialogue in the generation</span></label>
          <label class="quiz-opt"><input type="radio" name="audio" value="nice"> <span><strong>Nice to have</strong></span></label>
          <label class="quiz-opt"><input type="radio" name="audio" value="no"> <span><strong>Not needed</strong> — silent / post audio</span></label>
        </div>
        <h2>5. Your footage plan <span class="quiz-optional">(for cost math)</span></h2>
        <div class="placeholder-grid">
          <div class="field">
            <label for="q-seconds">Seconds of final footage</label>
            <input class="input" id="q-seconds" name="seconds" type="number" min="1" value="60">
          </div>
          <div class="field">
            <label for="q-takes">Takes per keeper</label>
            <input class="input" id="q-takes" name="takes" type="number" min="1" value="5">
          </div>
        </div>
        <div class="btn-row" style="margin-top:var(--space-5);">
          <button type="submit" class="btn btn-gold">Rank my models</button>
        </div>
      </form>
      <div id="quiz-results" aria-live="polite" style="margin-top:var(--space-6);"></div>
      <p class="calc-note" style="margin-bottom:var(--space-7);">Scored from <code>models.json</code> — the same versioned API the guide publishes. Costs are third-party estimates; verify live before budgeting.</p>
    </section>
  </main>
  <footer class="site-footer">
    <div class="container footer-grid">
      <p>AI Film Master Guide — research notes for professional AI filmmaking. Sources linked per chapter.</p>
      <nav aria-label="Footer">{footer}</nav>
    </div>
  </footer>
  <div class="palette" id="palette" role="dialog" aria-modal="true" aria-label="Search the guide" hidden>
    <div class="palette-box">
      <input id="palette-input" type="search" placeholder="Search chapters, prompts, models…" autocomplete="off" aria-label="Search the guide">
      <div id="palette-results" role="listbox" aria-label="Search results"></div>
    </div>
  </div>
  <script src="assets/js/palette.js"></script>
  <script src="assets/js/quiz.js"></script>
</body>
</html>
"""

CHANGELOG_TMPL = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Changelog — AI Film Master Guide</title>
  <meta name="description" content="What changed in the AI Film Master Guide, dated per release: new chapters, model updates, new templates, and corrections.">
  {css}
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="container header-bar">
      <a class="brand" href="index.html" aria-label="AI Film Master Guide home">
        <span class="brand-mark" aria-hidden="true">AF</span>
        <span class="brand-name">AI FILM<small>MASTER GUIDE</small></span>
      </a>
      <nav class="site-nav" aria-label="Primary">
        {sitenav}
      </nav>
      <button type="button" class="btn btn-sm btn-ghost palette-open" aria-label="Search the guide (Ctrl+K)">
        <span aria-hidden="true">⌘K</span> Search
      </button>
    </div>
  </header>
  <main id="main">
    <section class="hero hero-film" aria-labelledby="changelog-title">
      <div class="container hero-inner">
        <span class="hero-kicker">Freshness log</span>
        <h1 id="changelog-title">What <span class="accent">changed.</span></h1>
        <p class="lede">AI film tooling rots in months. This page is how the guide stays fresh — every shipped change, dated, newest first.</p>
      </div>
    </section>
    <section class="container" aria-labelledby="process-h">
      <div class="card" style="margin-bottom:var(--space-6);">
        <h2 id="process-h">Process note</h2>
        <p>This changelog is rebuilt from the repository's git history on every site build, so it always reflects the latest release. Each entry below is a shipped change with its commit date — not a roadmap, not a promise. When a model price, feature, or platform rule changes in the world, the corresponding chapter or API update appears here with its date, and the affected chapter links its sources.</p>
      </div>
      <h2>Recent changes</h2>
      <ol class="change-list">{changelog_rows}</ol>
      <p class="calc-note" style="margin-bottom:var(--space-7);">Older history lives in the repository's git log. The guide also ships <code>llms.txt</code> so agents can check freshness programmatically.</p>
    </section>
  </main>
  <footer class="site-footer">
    <div class="container footer-grid">
      <p>AI Film Master Guide — research notes for professional AI filmmaking. Sources linked per chapter.</p>
      <nav aria-label="Footer">{footer}</nav>
    </div>
  </footer>
  <div class="palette" id="palette" role="dialog" aria-modal="true" aria-label="Search the guide" hidden>
    <div class="palette-box">
      <input id="palette-input" type="search" placeholder="Search chapters, prompts, models…" autocomplete="off" aria-label="Search the guide">
      <div id="palette-results" role="listbox" aria-label="Search results"></div>
    </div>
  </div>
  <script src="assets/js/palette.js"></script>
</body>
</html>
"""

SKILLSPEC_TMPL = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Skill schema spec — AI Film Master Guide</title>
  <meta name="description" content="The exact frontmatter-plus-sections format every guide skill follows, so other agent frameworks can consume or produce compatible skills.">
  {css}
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="container header-bar">
      <a class="brand" href="index.html" aria-label="AI Film Master Guide home">
        <span class="brand-mark" aria-hidden="true">AF</span>
        <span class="brand-name">AI FILM<small>MASTER GUIDE</small></span>
      </a>
      <nav class="site-nav" aria-label="Primary">
        {sitenav}
      </nav>
      <button type="button" class="btn btn-sm btn-ghost palette-open" aria-label="Search the guide (Ctrl+K)">
        <span aria-hidden="true">⌘K</span> Search
      </button>
    </div>
  </header>
  <main id="main">
    <section class="hero hero-film" aria-labelledby="spec-title">
      <div class="container hero-inner">
        <span class="hero-kicker">Agent-native</span>
        <h1 id="spec-title">Skill schema <span class="accent">spec.</span></h1>
        <p class="lede">Every one of the {skill_count} skills in <code>skills/</code> follows this exact format — YAML frontmatter plus six Markdown sections. Build to it and your skills slot straight into this library, or any agent framework that reads it.</p>
      </div>
    </section>
    <section class="container" aria-labelledby="spec-body-h">
      <h2 id="spec-body-h" class="sr-only">Specification</h2>
      <div class="prose" style="margin-bottom:var(--space-7);">
        <h3 id="frontmatter-h">Frontmatter</h3>
        <p>Each skill file opens with a YAML frontmatter block carrying two required fields. <code>name</code> is the skill's machine id (lowercase, hyphens); <code>description</code> is the one-line trigger summary an agent reads when deciding whether to load the skill.</p>
        <table class="spec-table">
          <thead><tr><th scope="col">Field</th><th scope="col">Required</th><th scope="col">Format</th></tr></thead>
          <tbody>
            <tr><td><code>name</code></td><td>Yes</td><td>Lowercase slug, unique across <code>skills/</code></td></tr>
            <tr><td><code>description</code></td><td>Yes</td><td>One sentence: what the skill does, in which track, using which source</td></tr>
          </tbody>
        </table>
        <h3 id="sections-h">Sections</h3>
        <p>After the frontmatter, the body is Markdown with an H1 title and these H2 sections, in order:</p>
        <table class="spec-table">
          <thead><tr><th scope="col">Section</th><th scope="col">Required</th><th scope="col">Purpose</th></tr></thead>
          <tbody>
            <tr><td>Use when</td><td>Yes</td><td>Trigger conditions: the situation, the anatomy at play, the models it applies to</td></tr>
            <tr><td>Inputs</td><td>Yes</td><td>Every placeholder or artifact the procedure needs, one per bullet</td></tr>
            <tr><td>Procedure</td><td>Yes</td><td>Numbered steps an agent can execute verbatim; templates quoted exactly, never paraphrased</td></tr>
            <tr><td>Worked example</td><td>Yes</td><td>One filled, realistic example showing the expected output shape</td></tr>
            <tr><td>API references</td><td>No</td><td>Versioned <code>api/v1/</code> files the skill draws on</td></tr>
            <tr><td>Pitfalls</td><td>Yes</td><td>The known failure modes and how to avoid them</td></tr>
          </tbody>
        </table>
        <h3 id="example-h">Full example</h3>
        <p class="example-meta"><code>skills/prompts/prompt-a1.md</code> — frontmatter first, then the rendered body:</p>
        <pre><code>{spec_frontmatter}</code></pre>
      </div>
      <article class="card" style="margin-bottom:var(--space-7);">
        <div class="prose">{spec_example_body}</div>
      </article>
    </section>
  </main>
  <footer class="site-footer">
    <div class="container footer-grid">
      <p>AI Film Master Guide — research notes for professional AI filmmaking. Sources linked per chapter.</p>
      <nav aria-label="Footer">{footer}</nav>
    </div>
  </footer>
  <div class="palette" id="palette" role="dialog" aria-modal="true" aria-label="Search the guide" hidden>
    <div class="palette-box">
      <input id="palette-input" type="search" placeholder="Search chapters, prompts, models…" autocomplete="off" aria-label="Search the guide">
      <div id="palette-results" role="listbox" aria-label="Search results"></div>
    </div>
  </div>
  <script src="assets/js/palette.js"></script>
</body>
</html>
"""

def build_toc(heads):
    items = "".join(
        f'<li class="toc-l{level}"><a href="#{anchor}">{h}</a></li>'
        for level, h, anchor in heads if level > 1
    )
    return f"<ul>{items}</ul>" if items else ""


def changelog_rows(n=15):
    """Dated changelog entries rebuilt from git history on every build."""
    try:
        out = subprocess.run(
            ["git", "-C", str(ROOT), "log", "--format=%ad|%h|%s", "--date=short", f"-{n}"],
            capture_output=True, text=True, check=True,
        ).stdout
    except Exception:
        return ""
    rows = []
    for line in out.splitlines():
        parts = line.split("|", 2)
        if len(parts) != 3:
            continue
        date, h, msg = parts
        msg = html.escape(msg).replace("{", "").replace("}", "")
        rows.append(
            f'<li><span class="change-date">{html.escape(date)}</span> '
            f'<span class="change-hash">{html.escape(h)}</span><p>{msg}</p></li>'
        )
    return "\n      ".join(rows)


def skill_spec_example():
    """Frontmatter (escaped) + rendered body of one full example skill."""
    src = ROOT / "skills" / "prompts" / "prompt-a1.md"
    text = src.read_text()
    m = re.match(r"^---\n(.*?)\n---\n(.*)$", text, re.S)
    front, body = (m.group(1), m.group(2)) if m else ("", text)
    front_esc = html.escape(front.strip()).replace("{", "").replace("}", "")
    return front_esc, md2html.convert(body)


def main():
    shutil.rmtree(SITE, ignore_errors=True)
    chapters = {}  # section_id -> [(slug, {title, desc, path})]
    for section_id, _ in SECTIONS:
        chapters[section_id] = []
        for slug in CHAPTER_ORDER[section_id]:
            path = ROOT / section_id / f"{slug}.md"
            md = path.read_text()
            chapters[section_id].append((slug, {
                "title": chapter_title(md),
                "desc": chapter_desc(md),
                "md": md,
            }))

    css_links = "\n  ".join(f'<link rel="stylesheet" href="{c}">' for c in CSS)

    # Chapter pages
    flat = [(sid, slug, c) for sid, sname in SECTIONS for slug, c in chapters[sid] for sname in [dict(SECTIONS)[sid]]]
    search_index = []
    for idx, (section_id, slug, c) in enumerate(flat):
        section_name = dict(SECTIONS)[section_id]
        body = md2html.convert(c["md"])
        heads = md2html.headings(c["md"])
        toc = build_toc(heads)
        nav = build_nav(chapters)
        prev_l = next_l = ""
        if idx > 0:
            ps, pslug, pc = flat[idx - 1]
            prev_l = f'<a class="btn" href="../{ps}/{pslug}.html" rel="prev">← {pc["title"]}</a>'
        if idx < len(flat) - 1:
            ns, nslug, nc = flat[idx + 1]
            next_l = f'<a class="btn" href="../{ns}/{nslug}.html" rel="next">{nc["title"]} →</a>'
        html = PAGE_TMPL.format(
            title=c["title"], desc=c["desc"].replace('"', "&quot;"),
            css=css_links.replace('href="assets/', 'href="../assets/'),
            nav=nav, section_name=section_name, body=body, toc=toc,
            prevnext=prev_l + next_l,
            sitenav=nav_html("../", ""), footer=footer_html("../"),
        )
        out_dir = SITE / section_id
        out_dir.mkdir(parents=True, exist_ok=True)
        (out_dir / f"{slug}.html").write_text(html)
        text = re.sub(r"[#*`_>\[\]()|]", " ", c["md"])
        text = re.sub(r"\s+", " ", text)
        search_index.append({
            "url": f"{section_id}/{slug}.html",
            "title": c["title"],
            "section": section_name,
            "headings": [h for _, h, _ in heads],
            "text": text[:4000],
        })

    # Landing
    grid_parts = []
    for section_id, section_name in SECTIONS:
        cards = "".join(
            f'<article class="card chapter-card"><h3><a href="{section_id}/{slug}.html">{c["title"]}</a></h3>'
            f'<p>{c["desc"]}</p></article>'
            for slug, c in chapters[section_id]
        )
        grid_parts.append(f'<h3 class="section-h">{section_name}</h3><div class="chapter-grid">{cards}</div>')
    (SITE / "index.html").write_text(INDEX_TMPL.format(
        css=css_links, chapter_grid="\n".join(grid_parts),
        sitenav=nav_html("", "index.html"), footer=footer_html("")))
    (SITE / "budget.html").write_text(BUDGET_TMPL.format(
        css=css_links, sitenav=nav_html("", ""), footer=footer_html("")))
    (SITE / "skills.html").write_text(SKILLS_TMPL.format(
        css=css_links, sitenav=nav_html("", "skills.html"), footer=footer_html("")))
    shutil.copy(ROOT / "skills" / "index.json", SITE / "skills-index.json")
    shutil.copy(ROOT / "api" / "v1" / "prompt-templates.json", SITE / "prompt-templates.json")
    shutil.copy(ROOT / "api" / "v1" / "models.json", SITE / "models.json")
    shutil.copy(ROOT / "api" / "v1" / "glossary.json", SITE / "glossary.json")

    # Prompt workshop page (data above is what it loads)
    (SITE / "workshop.html").write_text(WORKSHOP_TMPL.format(
        css=css_links, sitenav=nav_html("", "workshop.html"), footer=footer_html("")))

    # Model-picker quiz page
    (SITE / "quiz.html").write_text(QUIZ_TMPL.format(
        css=css_links, sitenav=nav_html("", "quiz.html"), footer=footer_html("")))

    # Changelog page — dated entries rebuilt from git history on every build
    (SITE / "changelog.html").write_text(CHANGELOG_TMPL.format(
        css=css_links, sitenav=nav_html("", "changelog.html"), footer=footer_html(""),
        changelog_rows=changelog_rows()))

    # Skill-spec page — schema + one full example skill
    spec_front, spec_body = skill_spec_example()
    skill_index = json.loads((ROOT / "skills" / "index.json").read_text())
    (SITE / "skill-spec.html").write_text(SKILLSPEC_TMPL.format(
        css=css_links, sitenav=nav_html("", "skill-spec.html"), footer=footer_html(""),
        skill_count=len(skill_index.get("skills", [])),
        spec_frontmatter=spec_front, spec_example_body=spec_body))

    # New pages discoverable through the search palette
    search_index.extend([
        {"url": "quiz.html", "title": "Model-picker quiz", "section": "Tools",
         "headings": ["What's the job?", "Budget tier?", "What look?", "Native audio needed?", "Your footage plan"],
         "text": "Five questions, one ranked shortlist: the model-picker quiz scores all 18 video models against your use case, budget, and audio needs, with live cost math and a one-click handoff to the prompt workshop."},
        {"url": "workshop.html", "title": "Prompt workshop", "section": "Tools",
         "headings": ["Pick your ingredients", "Fill the placeholders", "Copy your prompt", "Your saved prompts"],
         "text": "Interactive prompt workshop: pick a template, model, and track, fill the placeholders, and copy a production-ready prompt. Every template carries anatomy notes explaining why it works. Save and rate your own prompts in the browser."},
        {"url": "budget.html", "title": "Budget calculator", "section": "Tools",
         "headings": ["Your production"],
         "text": "Interactive budget calculator: runtime, shot length, model, and takes per keeper in — a cost envelope out, grounded in the credit-math chapter's third-party per-clip estimates."},
        {"url": "skills.html", "title": "Skills browser", "section": "Tools",
         "headings": [],
         "text": "Browse all task skills: prompt templates, camera moves, models, long-form pipelines, craft techniques, checklists, and more, with live filtering."},
        {"url": "changelog.html", "title": "Changelog", "section": "Meta",
         "headings": ["Process note", "Recent changes"],
         "text": "What changed in the guide, dated per release: new chapters, model updates, new templates, and corrections. Rebuilt from the git history on every site build."},
        {"url": "skill-spec.html", "title": "Skill schema spec", "section": "Meta",
         "headings": ["Frontmatter", "Sections", "Full example"],
         "text": "The exact frontmatter-plus-sections format every guide skill follows, so other agent frameworks can consume or produce compatible skills: name, description, Use when, Inputs, Procedure, Worked example, API references, Pitfalls."},
    ])
    (SITE / "search-index.json").write_text(json.dumps(search_index, ensure_ascii=False))

    # Bundle shared assets + API docs page into site/ so it is self-contained
    shutil.copytree(ROOT / "assets", SITE / "assets", dirs_exist_ok=True)
    shutil.copy(ROOT / "api.html", SITE / "api.html")
    print(f"Built {len(flat)} chapters + index + search index -> {SITE}")


if __name__ == "__main__":
    main()
