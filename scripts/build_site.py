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
    ("guides", "Guides"),
]

CHAPTER_ORDER = {
    "higgsfield": ["platform-mastery", "prompt-engineering", "soul-id-deep-dive", "competition-entry-craft"],
    "craft": ["story-structure", "cinematic-language", "character-consistency", "directing-performance", "color-grading", "sound-music-audio", "editing-pipeline", "longform-pipelines", "failure-gallery", "ai-film-business"],
    "platforms": ["field-guide", "when-to-use-what"],
    "economics": ["credit-math"],
    "case-studies": ["competition-teardowns", "entry-craft-teardowns"],
    "distribution": ["release-paths"],
    "legal": ["rights-and-disclosure"],
    "sources": ["source-index"],
    "guides": ["first-short"],
}

CSS = ["assets/css/tokens.css", "assets/css/base.css", "assets/css/layout.css",
       "assets/css/components.css", "assets/css/docs.css", "assets/css/print.css"]

NAV_ITEMS = [
    ("index.html", "Guide"),
    ("skills.html", "Skills"),
    ("workshop.html", "Workshop"),
    ("quiz.html", "Quiz"),
    ("compare.html", "Compare"),
    ("gallery.html", "Gallery"),
    ("teardown.html", "Teardowns"),
    ("model-watch.html", "Model watch"),
    ("changelog.html", "Changelog"),
    ("skill-spec.html", "Skill spec"),
    ("api.html", "API"),
]

FOOTER_ITEMS = [
    ("index.html", "Guide"),
    ("skills.html", "Skills"),
    ("workshop.html", "Workshop"),
    ("quiz.html", "Quiz"),
    ("compare.html", "Compare"),
    ("gallery.html", "Gallery"),
    ("teardown.html", "Teardowns"),
    ("model-watch.html", "Model watch"),
    ("checks/", "Knowledge checks"),
    ("budget.html", "Budget"),
    ("optimizer.html", "Optimizer"),
    ("anatomy.html", "Anatomy"),
    ("manifesto.html", "Manifesto"),
    ("craft-not-buttons.html", "Craft, not buttons"),
    ("recipes.html", "Recipes"),
    ("field-guides/", "Field guides"),
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
      <p class="read-time">{read_min} min read · {words} words</p>
      <article class="prose">{body}</article>
      <nav class="prevnext" aria-label="Next and previous chapters">{prevnext}</nav>{check}
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
        <p class="lede">Twenty-three chapters on Higgsfield mastery, professional craft, directing performance, color grading, sound, economics, long-form pipelines, competition-entry craft, distribution, and rights — with separate tracks for animated/stylized and photorealistic production. Plus a machine-readable API and 192 task skills for agents.</p>
        <div class="btn-row">
          <a class="btn btn-gold" href="manifesto.html">Read the manifesto</a>
          <a class="btn" href="teardown.html">Shot-by-shot teardowns</a>
          <a class="btn" href="field-guides/">Printable field guides</a>
          <a class="btn" href="craft-not-buttons.html">Craft, not buttons</a>
        </div>
        <div class="stat-strip">
          <div class="stat"><div class="stat-value">23</div><div class="stat-label">Chapters</div></div>
          <div class="stat"><div class="stat-value">{total_read}</div><div class="stat-label">Total read time</div></div>
          <div class="stat"><div class="stat-value">47</div><div class="stat-label">Prompt templates</div></div>
          <div class="stat"><div class="stat-value">22</div><div class="stat-label">Camera moves</div></div>
          <div class="stat"><div class="stat-value">22</div><div class="stat-label">Models compared</div></div>
          <div class="stat"><div class="stat-value">79</div><div class="stat-label">Glossary terms</div></div>
          <div class="stat"><div class="stat-value">192</div><div class="stat-label">Agent skills</div></div>
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
      <p class="section-lede">Don't read twenty-three chapters in order. Pick your goal — each path is the shortest route through the guide that gets you there. Tick steps off as you finish them; your progress is saved in this browser.</p>
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
            <li><input type="checkbox" class="path-check" id="pc-longform-1" data-step="longform-1" aria-label="Mark complete: Long-form pipelines"><a href="craft/longform-pipelines.html">Long-form pipelines</a></li>
            <li><input type="checkbox" class="path-check" id="pc-longform-2" data-step="longform-2" aria-label="Mark complete: Directing performance"><a href="craft/directing-performance.html">Directing performance</a></li>
            <li><input type="checkbox" class="path-check" id="pc-longform-3" data-step="longform-3" aria-label="Mark complete: Editing pipeline"><a href="craft/editing-pipeline.html">Editing pipeline</a></li>
            <li><input type="checkbox" class="path-check" id="pc-longform-4" data-step="longform-4" aria-label="Mark complete: Credit math, compute envelopes"><a href="economics/credit-math.html">Credit math</a> <span class="path-note">compute envelopes</span></li>
          </ol>
        </article>
        <article class="card path-card" data-path="first-short">
          <h3>Your first 60-second short <span class="path-time">7 days</span></h3>
          <p>Zero to one finished minute. A day-by-day production plan with checkpoints — the whole guide compressed into a shippable week.</p>
          <div class="path-bar" aria-hidden="true"><span class="path-bar-fill"></span></div>
          <p class="path-progress"><span data-path-progress aria-live="polite">0 of 7 complete</span><button type="button" class="btn btn-sm btn-ghost" data-path-reset="first-short">Reset</button></p>
          <ol class="path-steps">
            <li><input type="checkbox" class="path-check" id="pc-first-short-1" data-step="first-short-1" aria-label="Mark complete: Day 1, concept lock"><a href="guides/first-short.html">Day 1</a> <span class="path-note">concept lock</span></li>
            <li><input type="checkbox" class="path-check" id="pc-first-short-2" data-step="first-short-2" aria-label="Mark complete: Day 2, prompt workshop"><a href="guides/first-short.html">Day 2</a> <span class="path-note">prompt workshop</span></li>
            <li><input type="checkbox" class="path-check" id="pc-first-short-3" data-step="first-short-3" aria-label="Mark complete: Day 3, generation batches"><a href="guides/first-short.html">Day 3</a> <span class="path-note">generation batches</span></li>
            <li><input type="checkbox" class="path-check" id="pc-first-short-4" data-step="first-short-4" aria-label="Mark complete: Day 4, selects and assembly"><a href="guides/first-short.html">Day 4</a> <span class="path-note">selects &amp; assembly</span></li>
            <li><input type="checkbox" class="path-check" id="pc-first-short-5" data-step="first-short-5" aria-label="Mark complete: Day 5, performance fixes"><a href="guides/first-short.html">Day 5</a> <span class="path-note">performance fixes</span></li>
            <li><input type="checkbox" class="path-check" id="pc-first-short-6" data-step="first-short-6" aria-label="Mark complete: Day 6, sound"><a href="guides/first-short.html">Day 6</a> <span class="path-note">sound</span></li>
            <li><input type="checkbox" class="path-check" id="pc-first-short-7" data-step="first-short-7" aria-label="Mark complete: Day 7, grade and export"><a href="guides/first-short.html">Day 7</a> <span class="path-note">grade &amp; export</span></li>
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
        <p style="color:var(--ink-dim);">Versioned JSON under <code>api/v1/</code>: models with live credit costs, 47 prompt templates, the 22-move camera lexicon, production checklists, and the glossary — with JSON Schemas, <code>llms.txt</code>, and <code>API.md</code>.</p>
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


def word_count(md):
    """Honest word count: strip code, images, links, and markdown syntax."""
    t = re.sub(r"```.*?```", " ", md, flags=re.S)
    t = re.sub(r"`[^`]*`", " ", t)
    t = re.sub(r"!\[[^\]]*\]\([^)]*\)", " ", t)
    t = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", t)
    t = re.sub(r"[#>*_~|\-]", " ", t)
    t = re.sub(r"\s+", " ", t)
    return len([w for w in t.split(" ") if w])


def read_minutes(md):
    return max(1, round(word_count(md) / 200))


def md_section(md, heading):
    """Extract the markdown of one ## section by heading text."""
    lines = md.split("\n")
    buf, inside = [], False
    for line in lines:
        m = re.match(r"^##\s+(.*)$", line.strip())
        if m:
            if inside:
                break
            if m.group(1).strip().lower() == heading.strip().lower():
                inside = True
            continue
        if inside:
            buf.append(line)
    return "\n".join(buf).strip()


def fmt_total_minutes(mins):
    h, m = divmod(mins, 60)
    return f"{h}h {m}m" if h else f"{m}m"


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
  <meta name="description" content="Browse all 192 task skills: prompts, camera, models, long-form pipelines, craft techniques and more.">
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
          <p style="margin-top:var(--space-4);"><a class="btn" href="optimizer.html">Plan a full production → budget optimizer</a></p>
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

OPTIMIZER_TMPL = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Budget optimizer — AI Film Master Guide</title>
  <meta name="description" content="Turn the budget calculator into a production plan: runtime, dialogue share, and quality bar in — an optimal model mix with cost envelopes out, computed live from models.json.">
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
    <section class="hero hero-film" aria-labelledby="opt-title">
      <div class="container hero-inner">
        <span class="hero-kicker">Economics</span>
        <h1 id="opt-title">Budget <span class="accent">optimizer.</span></h1>
        <p class="lede">The calculator tells you what one model costs. The optimizer tells you what your film should cost: it splits your runtime into dialogue and non-dialogue buckets and assigns the cheapest model that satisfies your quality bar — computed live from <code>models.json</code>, so the picks stay fresh as the data does.</p>
      </div>
    </section>
    <section class="container" aria-labelledby="opt-h">
      <h2 id="opt-h">Your production</h2>
      <div class="calc-grid">
        <form class="card calc-form" aria-label="Optimizer inputs" onsubmit="return false;">
          <div class="field">
            <label for="o-runtime">Target runtime: <output id="o-runtime-out" for="o-runtime">4 min</output></label>
            <input type="range" id="o-runtime" min="1" max="120" step="1" value="4">
          </div>
          <div class="field">
            <label for="o-dialogue">Dialogue share: <output id="o-dialogue-out" for="o-dialogue">30%</output></label>
            <input type="range" id="o-dialogue" min="0" max="100" step="5" value="30">
          </div>
          <div class="field">
            <label for="o-shotlen">Average shot length (seconds)</label>
            <input class="input" type="number" id="o-shotlen" min="2" max="30" step="1" value="4">
          </div>
          <div class="field">
            <label for="o-tier">Quality bar</label>
            <select class="input" id="o-tier">
              <option value="draft">Draft — cheapest that moves</option>
              <option value="standard" selected>Standard — mid-range workhorse</option>
              <option value="premium">Premium — cinematic finish</option>
            </select>
          </div>
          <div class="field">
            <label for="o-takes">Takes per keeper</label>
            <select class="input" id="o-takes">
              <option value="3">3 — disciplined (draft-then-hero)</option>
              <option value="5" selected>5 — typical</option>
              <option value="8">8 — perfectionist / action-heavy</option>
            </select>
          </div>
        </form>
        <div class="card calc-results" aria-live="polite" aria-label="Optimized plan" id="o-results">
          <p class="calc-note">Loading model data…</p>
        </div>
      </div>
      <p class="empty-state" id="o-error" hidden></p>
      <p style="margin-top:var(--space-5);"><a class="btn btn-ghost" href="budget.html">← Back to the single-model calculator</a></p>
    </section>
  </main>
  <footer class="site-footer">
    <div class="container footer-grid">
      <p>AI Film Master Guide — research notes for professional AI filmmaking. Sources linked per chapter.</p>
      <nav aria-label="Footer">{footer}</nav>
    </div>
  </footer>
  <script src="assets/js/palette.js"></script>
  <script src="assets/js/optimizer.js"></script>
</body>
</html>
"""

ANATOMY_TMPL = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Anatomy of a prompt — AI Film Master Guide</title>
  <meta name="description" content="The nine-layer prompt anatomy as an interactive annotated example: hover any layer to learn what it does, then build your own prompt layer by layer.">
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
    <section class="hero hero-film" aria-labelledby="anat-title">
      <div class="container hero-inner">
        <span class="hero-kicker">Craft</span>
        <h1 id="anat-title">Anatomy of <span class="accent">a prompt.</span></h1>
        <p class="lede">Treat the prompt as a directing system, not a description. Nine layers, in order — plus the exclusion block. Missing layers = randomness. Hover, tap, or focus any layer below to see what it does.</p>
      </div>
    </section>
    <section class="container" aria-labelledby="anat-h">
      <h2 id="anat-h" class="visually-hidden">Prompt anatomy explorer</h2>
      <div class="anatomy-tabs" role="group" aria-label="Explorer mode">
        <button type="button" class="btn" id="anat-tab-explore" aria-pressed="true">Explore the example</button>
        <button type="button" class="btn btn-ghost" id="anat-tab-build" aria-pressed="false">Build yours</button>
      </div>
      <div id="anat-explore">
        <p class="calc-note">One real prompt, ten highlighted layers. Pick any layer — here or in the list — for its breakdown. Esc clears.</p>
        <div class="anatomy-sample" id="anat-sample" aria-label="Annotated sample prompt"></div>
        <ol class="anatomy-layers" id="anat-layers" aria-label="The ten layers"></ol>
        <div class="card anatomy-detail" id="anat-detail" aria-live="polite" aria-label="Layer breakdown">
          <p class="calc-note">Pick a layer above — in the prompt or the list — to see what it does, why it matters, and what breaks without it.</p>
        </div>
      </div>
      <div id="anat-build" hidden>
        <p class="calc-note">Fill the nine layers in order. Your prompt assembles below — copy it, then continue in the workshop with a full template.</p>
        <div class="card">
          <div class="anatomy-build-grid" id="anat-form"></div>
        </div>
        <h3>Your prompt</h3>
        <div class="card"><p class="anatomy-preview" id="anat-preview" aria-live="polite"></p></div>
        <div class="btn-row" style="margin-top:var(--space-4);">
          <button type="button" class="btn" id="anat-copy">Copy prompt</button>
          <a class="btn btn-ghost" href="workshop.html">Continue in the workshop →</a>
        </div>
      </div>
      <p style="margin-top:var(--space-6);"><a href="field-guides/prompt-anatomy.html">Printable cheat-sheet version</a> · <a href="higgsfield/prompt-engineering.html">Full prompt-engineering chapter</a></p>
    </section>
  </main>
  <footer class="site-footer">
    <div class="container footer-grid">
      <p>AI Film Master Guide — research notes for professional AI filmmaking. Sources linked per chapter.</p>
      <nav aria-label="Footer">{footer}</nav>
    </div>
  </footer>
  <script src="assets/js/palette.js"></script>
  <script src="assets/js/anatomy.js"></script>
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
        <p class="lede">Pick a template, a model, and a track — fill the placeholders and copy a production-ready prompt. Every template carries its anatomy notes, so you learn why it works while you use it. New to prompt structure? Start with the <a href="anatomy.html">anatomy explorer</a>.</p>
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
              <option value="performance">Performance direction</option>
              <option value="audio">Audio &amp; voice</option>
              <option value="longform">Long-form craft</option>
              <option value="repair">Failure repair</option>
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

COMPARE_TMPL = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Model compare — AI Film Master Guide</title>
  <meta name="description" content="Side-by-side model comparison from the guide's versioned model data: cost, best use, strengths, weaknesses, native audio, and freshness status for 2–3 models. Shareable via URL.">
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
        <span aria-hidden="true">&#8984;K</span> Search
      </button>
    </div>
  </header>
  <main id="main">
    <section class="hero hero-film" aria-labelledby="cmp-title">
      <div class="container hero-inner">
        <span class="hero-kicker">Tools</span>
        <h1 id="cmp-title">Model <span class="accent">compare.</span></h1>
        <p class="lede">The quiz picks for you. This page lets you argue with it: put 2–3 models side by side — cost, best use, strengths, weaknesses, native audio, freshness — all rendered live from <code>models.json</code>. The URL updates as you pick, so the comparison is shareable.</p>
      </div>
    </section>
    <section class="container" aria-labelledby="cmp-h">
      <h2 id="cmp-h">Pick your contenders</h2>
      <div class="card" style="margin-bottom:var(--space-6);">
        <div class="calc-grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr));">
          <div class="field">
            <label for="cmp-a">Model A</label>
            <select class="input" id="cmp-a"></select>
          </div>
          <div class="field">
            <label for="cmp-b">Model B</label>
            <select class="input" id="cmp-b"></select>
          </div>
          <div class="field">
            <label for="cmp-c">Model C <span class="quiz-optional">(optional)</span></label>
            <select class="input" id="cmp-c"></select>
          </div>
        </div>
      </div>
      <p class="empty-state" id="cmp-error" hidden></p>
      <p class="calc-note" id="cmp-note">Pick at least two models to compare.</p>
      <div id="cmp-results" aria-live="polite"></div>
      <p style="margin-top:var(--space-6);"><a class="btn btn-ghost" href="quiz.html">&larr; Take the model-picker quiz</a> <a class="btn btn-ghost" href="model-watch.html">Model watch</a></p>
    </section>
  </main>
  <footer class="site-footer">
    <div class="container footer-grid">
      <p>AI Film Master Guide — research notes for professional AI filmmaking. Sources linked per chapter.</p>
      <nav aria-label="Footer">{footer}</nav>
    </div>
  </footer>
  <div class="palette" id="palette" role="dialog" aria-modal="true" aria-label="Search" hidden>
    <div class="palette-box">
      <input type="search" id="palette-input" placeholder="Search the guide…" aria-label="Search the guide">
      <div id="palette-results" role="listbox" aria-label="Search results"></div>
    </div>
  </div>
  <script src="assets/js/palette.js"></script>
  <script src="assets/js/compare.js"></script>
</body>
</html>
"""

GALLERY_TMPL = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Prompt gallery — AI Film Master Guide</title>
  <meta name="description" content="Your saved workshop prompts as a browsable gallery: filter by track and model, sort by rating, open in the workshop, export and import as JSON. Stored in your browser.">
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
        <span aria-hidden="true">&#8984;K</span> Search
      </button>
    </div>
  </header>
  <main id="main">
    <section class="hero hero-film" aria-labelledby="gal-title">
      <div class="container hero-inner">
        <span class="hero-kicker">Workshop</span>
        <h1 id="gal-title">Prompt <span class="accent">gallery.</span></h1>
        <p class="lede">Every prompt you've saved and rated in the workshop, in one browsable place. Filter by track and model, sort by rating, jump back into the workshop, or take your collection with you as JSON. Everything lives in your browser — nothing leaves it.</p>
      </div>
    </section>
    <section class="container" aria-labelledby="gal-h">
      <h2 id="gal-h">Your collection</h2>
      <div class="card" style="margin-bottom:var(--space-6);">
        <div class="calc-grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr));">
          <div class="field">
            <label for="gal-track">Track</label>
            <select class="input" id="gal-track"><option value="all">All tracks</option></select>
          </div>
          <div class="field">
            <label for="gal-model">Model</label>
            <select class="input" id="gal-model"><option value="all">All models</option></select>
          </div>
          <div class="field">
            <label for="gal-sort">Sort</label>
            <select class="input" id="gal-sort">
              <option value="rating">Highest rated</option>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
        </div>
        <div class="btn-row" style="margin-top:var(--space-4);">
          <button type="button" class="btn btn-sm" id="gal-export">Export JSON</button>
          <label class="btn btn-sm btn-ghost" for="gal-import" style="cursor:pointer;">Import JSON</label>
          <input type="file" id="gal-import" accept="application/json,.json" hidden>
        </div>
        <p class="empty-state" id="gal-error" hidden></p>
      </div>
      <p class="calc-note" id="gal-count" aria-live="polite"></p>
      <div id="gal-grid"></div>
      <div class="empty-state" id="gal-empty" hidden>
        <p><strong>No saved prompts yet.</strong></p>
        <p>Build one in the workshop — fill a template's placeholders, hit "Save this prompt", rate it — and it appears here.</p>
        <p><a class="btn" href="workshop.html">Open the workshop &rarr;</a></p>
      </div>
    </section>
  </main>
  <footer class="site-footer">
    <div class="container footer-grid">
      <p>AI Film Master Guide — research notes for professional AI filmmaking. Sources linked per chapter.</p>
      <nav aria-label="Footer">{footer}</nav>
    </div>
  </footer>
  <div class="palette" id="palette" role="dialog" aria-modal="true" aria-label="Search" hidden>
    <div class="palette-box">
      <input type="search" id="palette-input" placeholder="Search the guide…" aria-label="Search the guide">
      <div id="palette-results" role="listbox" aria-label="Search results"></div>
    </div>
  </div>
  <script src="assets/js/palette.js"></script>
  <script src="assets/js/gallery.js"></script>
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

TEARDOWN_TMPL = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Shot-by-shot teardowns — AI Film Master Guide</title>
  <meta name="description" content="Learn to see: shot-by-shot teardowns of documented AI-film sequences — what each shot did, what broke, and the craft lesson.">
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
    <section class="hero hero-film" aria-labelledby="td-title">
      <div class="container hero-inner">
        <span class="hero-kicker">Learn to see</span>
        <h1 id="td-title">Shot-by-shot <span class="accent">teardowns.</span></h1>
        <p class="lede">Three documented AI-film sequences, broken into shots: what each shot did, what worked, what broke, and the craft lesson. Prompt reconstructions are analytical — they teach the thinking, not the buttons.</p>
      </div>
    </section>
    <section class="container" aria-labelledby="td-app-h" style="margin-bottom:var(--space-7);">
      <h2 id="td-app-h" class="sr-only">Teardown viewer</h2>
      <div id="teardown-app"><p>Loading teardowns…</p></div>
      <noscript><p>Teardowns need JavaScript. The source data is <code>api/v1/teardowns.json</code> in the repository.</p></noscript>
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
  <script src="assets/js/teardown.js"></script>
</body>
</html>
"""

MANIFESTO_TMPL = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Manifesto — AI Film Master Guide</title>
  <meta name="description" content="What this guide is, what it costs, what it refuses to do, and how to use it.">
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
    <section class="hero hero-film" aria-labelledby="man-title">
      <div class="container hero-inner">
        <span class="hero-kicker">The manifesto</span>
        <h1 id="man-title">This is <span class="accent">not a course.</span></h1>
        <p class="lede">No cohort. No certificate. No $2,000 upsell. This is a living reference for people making films with AI — and it has opinions.</p>
      </div>
    </section>
    <section class="container" style="margin-bottom:var(--space-7);">
      <div class="prose">
        <h2>What this is</h2>
        <p>A reference manual you keep open while you work — twenty-three chapters on craft, platforms, economics, and pipelines, plus the tools (budget calculator, prompt workshop, model quiz, teardowns) and the machine-readable API underneath. It is updated as the field moves: the changelog is dated, the model data is versioned, and corrections are printed, not buried.</p>
        <h2>What it costs</h2>
        <p>Nothing. Courses have their place — structure, community, and feedback from a working filmmaker are genuinely worth paying for, and this guide does not replace them. This is the other thing: the manual their graduates keep open after the cohort ends. The reference layer, free, forever, with no account.</p>
        <h2>Everything is sourced</h2>
        <p>Every claim in this guide carries a URL, a confidence flag, or an explicit unknown. When we get something wrong, we print the correction — this guide once repeated a Cannes premiere claim for ONEIRIC that didn't hold up; the correction is in the text, not in a quiet edit. Trust is the whole product. A reference that hides its mistakes is marketing.</p>
        <h2>What it won't do</h2>
        <ul>
          <li><strong>No hype.</strong> AI will not replace filmmakers; it replaced the render farm. The guide says what the tools actually do.</li>
          <li><strong>No tool worship.</strong> <a href="craft-not-buttons.html">Craft over buttons</a>. The prompting chapters teach directing; the platform chapters are comparisons, not loyalty.</li>
          <li><strong>No secrets.</strong> There is no "one prompt trick." There is story structure, shot discipline, and credit math — unglamorous and learnable.</li>
          <li><strong>No vendor lock-in.</strong> Eighteen models, compared honestly, weaknesses included. The quiz recommends from data, not sponsorship.</li>
          <li><strong>No invented facts.</strong> Unknowns are labeled as unknowns. If a budget, timeline, or technique couldn't be verified, it isn't in here.</li>
        </ul>
        <h2>How to use it</h2>
        <p><strong>Ten minutes:</strong> take the <a href="quiz.html">model quiz</a>, fill a template in the <a href="workshop.html">prompt workshop</a>, run your numbers through the <a href="budget.html">budget calculator</a>. You'll know what to shoot with, what to write, and what it costs.</p>
        <p><strong>Ten hours:</strong> pick a <a href="index.html#paths-h">learning path</a> — first film, competition-ready craft, animated, photoreal, long-form. Tick the steps off; your progress is saved in this browser.</p>
        <p><strong>As a reference:</strong> press Ctrl+K (or ⌘K) anywhere and search. Print any chapter or <a href="field-guides/">field guide</a> for the set.</p>
        <h2>Who it's for</h2>
        <p>People making films with AI who want craft, not content. If you want the fastest path to a viral clip, there are cheaper guides. If you want to direct — to learn why a shot works, what a performance needs, and what a minute of footage actually costs — this is yours.</p>
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
</body>
</html>
"""

RECIPES_TMPL = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Shoot recipes — AI Film Master Guide</title>
  <meta name="description" content="Twelve repeatable shoot recipes from the guide's skill library: steps, inputs, worked examples, and pitfalls for dialogue scenes, trailers, fight scenes, horror shorts and more.">
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
        <span aria-hidden="true">&#8984;K</span> Search
      </button>
    </div>
  </header>
  <main id="main">
    <section class="hero hero-film" aria-labelledby="recipes-title">
      <div class="container hero-inner">
        <span class="hero-kicker">Repeatable workflows</span>
        <h1 id="recipes-title">Shoot <span class="accent">recipes.</span></h1>
        <p class="lede">The guide's recipe skills as cards: the procedure, the inputs, a worked example, and the pitfalls — for the twelve shots and sequences every AI film needs. <span id="recipes-count" aria-live="polite">{count} recipes</span></p>
        <div class="field" style="max-width:480px;">
          <label for="recipes-filter">Filter recipes</label>
          <input class="input" id="recipes-filter" type="search" placeholder="e.g. dialogue, trailer, horror&hellip;" autocomplete="off">
        </div>
      </div>
    </section>
    <section class="container" aria-label="Recipes">
      <div class="chapter-grid" id="recipes-list">
{cards}
      </div>
      <div class="empty-state" id="recipes-empty" hidden><p>No recipes match that filter.</p></div>
      <p class="calc-note" style="margin-bottom:var(--space-7);">Generated from <code>skills/recipes/*.md</code> at build time, so cards never drift from the skill files. Complexity is estimated from step and input counts. Full skill library: <a href="skills.html">skills browser</a>.</p>
    </section>
  </main>
  <footer class="site-footer">
    <div class="container footer-grid">
      <p>AI Film Master Guide &mdash; research notes for professional AI filmmaking. Sources linked per chapter.</p>
      <nav aria-label="Footer">{footer}</nav>
    </div>
  </footer>
  <div class="palette" id="palette" role="dialog" aria-modal="true" aria-label="Search the guide" hidden>
    <div class="palette-box">
      <input id="palette-input" type="search" placeholder="Search chapters, prompts, models&hellip;" autocomplete="off" aria-label="Search the guide">
      <div id="palette-results" role="listbox" aria-label="Search results"></div>
    </div>
  </div>
  <script src="assets/js/palette.js"></script>
  <script src="assets/js/recipes.js"></script>
</body>
</html>
"""

FIELDGUIDE_TMPL = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title} — Field guide — AI Film Master Guide</title>
  <meta name="description" content="{desc}">
  {css}
</head>
<body class="fg-page">
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header no-print">
    <div class="container header-bar">
      <a class="brand" href="../index.html" aria-label="AI Film Master Guide home">
        <span class="brand-mark" aria-hidden="true">AF</span>
        <span class="brand-name">AI FILM<small>MASTER GUIDE</small></span>
      </a>
      <nav class="site-nav" aria-label="Primary">
        {sitenav}
      </nav>
    </div>
  </header>
  <main id="main" class="fg-body">
    <div class="container">
      <p class="crumb no-print"><a href="../index.html">Guide</a> / <a href="index.html">Field guides</a></p>
      <h1>{title}</h1>
      <p class="fg-provenance">{provenance}</p>
      <div class="print-btn-row no-print">
        <button type="button" class="btn btn-gold" onclick="window.print()">Print this guide</button>
        <a class="btn" href="index.html">All field guides</a>
      </div>
      {body}
      <div class="print-btn-row no-print">
        <button type="button" class="btn btn-gold" onclick="window.print()">Print this guide</button>
      </div>
    </div>
  </main>
  <footer class="site-footer no-print">
    <div class="container footer-grid">
      <p>AI Film Master Guide — research notes for professional AI filmmaking. Sources linked per chapter.</p>
      <nav aria-label="Footer">{footer}</nav>
    </div>
  </footer>
</body>
</html>
"""

FIELDGUIDES_INDEX_TMPL = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Field guides — AI Film Master Guide</title>
  <meta name="description" content="Printable one-page field guides: model quick-reference, prompt anatomy cheat sheet, consistency checklist.">
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
  <main id="main">
    <section class="hero hero-film" aria-labelledby="fg-title">
      <div class="container hero-inner">
        <span class="hero-kicker">Print-ready</span>
        <h1 id="fg-title">Field <span class="accent">guides.</span></h1>
        <p class="lede">One-page references, generated from the guide's own data — dense enough to be useful on set, honest enough to print. Every chapter prints cleanly too: open any chapter and use your browser's print.</p>
      </div>
    </section>
    <section class="container" style="margin-bottom:var(--space-7);">
      <div class="fg-list">
        {cards}
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
  <script src="../assets/js/palette.js"></script>
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


def build_field_guides(css_links):
    """Printable one-page field guides, generated from the guide's own data."""
    fg_dir = SITE / "field-guides"
    fg_dir.mkdir(parents=True, exist_ok=True)
    css = css_links.replace('href="assets/', 'href="../assets/')
    sitenav = nav_html("../", "")
    footer = footer_html("../")
    today = "2026-10-11"

    def page(slug, title, desc, provenance, body_html):
        (fg_dir / slug).write_text(FIELDGUIDE_TMPL.format(
            title=title, desc=desc, provenance=provenance, body=body_html,
            css=css, sitenav=sitenav, footer=footer))

    # 1. Model quick-reference — from api/v1/models.json
    models_doc = json.loads((ROOT / "api" / "v1" / "models.json").read_text())
    models = models_doc["models"]
    rows = "".join(
        f"<tr><th scope=\"row\">{html.escape(m['model'])}</th>"
        f"<td>{html.escape(str(m.get('platform', '')))}</td>"
        f"<td>{html.escape(str(m.get('type', '')))}</td>"
        f"<td>{html.escape(str(m.get('best_use', '')))}</td>"
        f"<td>{html.escape(str(m.get('est_cost_credits', '—')))}</td>"
        f"<td>{html.escape(str(m.get('weakness', '')))}</td>"
        f"<td>{html.escape(str(m.get('status', 'active')))}</td></tr>"
        for m in models)
    cost_basis = html.escape(str(models_doc.get("cost_basis", "")))
    unverified = ", ".join(models_doc.get("unverified", []))
    unver_note = f"<p><strong>Cost confidence:</strong> flagged as unverified for: {html.escape(unverified)}.</p>" if unverified else ""
    page("models.html", "Model quick-reference",
         "One-page model reference: best use, cost, and weakness for every compared model.",
         f"Generated {today} from api/v1/models.json (v{html.escape(str(models_doc.get('version', '')))}, observed {html.escape(str(models_doc.get('observed', '')))}).",
         f"<h2>All {len(models)} models at a glance</h2>"
         f"<table><thead><tr><th scope=\"col\">Model</th><th scope=\"col\">Platform</th>"
         f"<th scope=\"col\">Type</th><th scope=\"col\">Best use</th><th scope=\"col\">Cost</th>"
         f"<th scope=\"col\">Weakness</th></tr></thead><tbody>{rows}</tbody></table>"
         f"<p><strong>Cost basis:</strong> {cost_basis}</p>{unver_note}"
         f"<p>Full comparisons: <a href=\"../platforms/field-guide.html\">platform field guide</a>, "
         f"<a href=\"../platforms/when-to-use-what.html\">when to use what</a>, <a href=\"../quiz.html\">model quiz</a>.</p>")

    # 2. Prompt anatomy cheat sheet — from higgsfield/prompt-engineering.md
    pe = (ROOT / "higgsfield" / "prompt-engineering.md").read_text()
    anatomy = "".join(
        f"<h2>{h}</h2>" + md2html.convert(md_section(pe, h))
        for h in ["The anatomy of a prompt that works",
                  "Camera phrasing that the models obey",
                  "The exclusion block", "Per-shot discipline",
                  "Common failure modes and fixes"])
    page("prompt-anatomy.html", "Prompt anatomy cheat sheet",
         "The nine-layer prompt anatomy, camera phrasing, exclusion block, and failure fixes on one page.",
         f"Generated {today} from higgsfield/prompt-engineering.md (the chapter is the authority).",
         anatomy + "<p>Full chapter: <a href=\"../higgsfield/prompt-engineering.html\">prompt engineering</a>. "
         "Fill templates live: <a href=\"../workshop.html\">prompt workshop</a>.</p>")

    # 3. Consistency / dead-eyes checklist — from craft/directing-performance.md
    dp = (ROOT / "craft" / "directing-performance.md").read_text()
    dead_eyes = md_section(dp, "The dead-eyes checklist").replace("- [ ]", "- \u2610")
    perf = md_section(dp, "The performance checklist").replace("- [ ]", "- \u2610")
    checklist_html = ("<h2>The dead-eyes checklist</h2>" + md2html.convert(dead_eyes)
                       + "<h2>The performance checklist</h2>" + md2html.convert(perf))
    page("consistency-checklist.html", "Consistency & dead-eyes checklist",
         "The dead-eyes checklist and the full performance checklist — print for the set.",
         f"Generated {today} from craft/directing-performance.md (the chapter is the authority).",
         checklist_html + "<p>Full chapter: <a href=\"../craft/directing-performance.html\">directing performance</a>.</p>")

    # Index
    cards = "".join(
        f'<article class="card"><h3><a href="{slug}">{title}</a></h3><p>{desc}</p>'
        f'<p><a class="btn btn-sm" href="{slug}">Open &amp; print →</a></p></article>'
        for slug, title, desc in [
            ("models.html", "Model quick-reference",
             "Every compared model: best use, cost, weakness. From models.json."),
            ("prompt-anatomy.html", "Prompt anatomy cheat sheet",
             "The nine-layer anatomy, camera phrasing, exclusion block, failure fixes."),
            ("consistency-checklist.html", "Consistency & dead-eyes checklist",
             "Dead-eyes markers + the 12-point performance checklist."),
        ])
    (fg_dir / "index.html").write_text(FIELDGUIDES_INDEX_TMPL.format(
        css=css, cards=cards, sitenav=sitenav, footer=footer))


def parse_recipe(path):
    """Parse a recipe skill file into card data. Returns None if not recipe-structured."""
    text = path.read_text()
    front = {}
    body = text
    if text.startswith("---"):
        parts = text.split("---", 2)
        if len(parts) == 3:
            for line in parts[1].strip().splitlines():
                if ":" in line:
                    k, v = line.split(":", 1)
                    front[k.strip()] = v.strip()
            body = parts[2]
    title = None
    sections = {}
    current = None
    buf = []
    for line in body.splitlines():
        if line.startswith("# "):
            title = line[2:].strip()
            current = None
        elif line.startswith("## "):
            if current:
                sections[current] = "\n".join(buf).strip()
            current = line[3:].strip().lower()
            buf = []
        elif current:
            buf.append(line)
    if current:
        sections[current] = "\n".join(buf).strip()
    steps = [l for l in sections.get("procedure", "").splitlines()
             if re.match(r"\s*\d+[.)]\s+", l)]
    if not steps or not title:
        return None  # not recipe-structured; skip rather than force it

    def bullets(key):
        return [re.sub(r"^\s*[-*]\s+", "", l).strip()
                for l in sections.get(key, "").splitlines()
                if re.match(r"\s*[-*]\s+", l)]

    def clean_steps():
        return [re.sub(r"^\s*\d+[.)]\s+", "", l).strip() for l in steps]

    def inline(key):
        return " ".join(l.strip() for l in sections.get(key, "").splitlines() if l.strip())

    n_steps = len(steps)
    n_inputs = len(bullets("inputs"))
    score = n_steps + n_inputs
    difficulty = "Straightforward" if score <= 6 else ("Intermediate" if score <= 10 else "Involved")
    return {
        "name": front.get("name", path.stem),
        "title": title,
        "description": front.get("description", ""),
        "use_when": inline("use when"),
        "inputs": bullets("inputs"),
        "steps": clean_steps(),
        "example": inline("worked example"),
        "pitfalls": bullets("pitfalls"),
        "difficulty": difficulty,
    }


def recipe_card(r):
    def esc(t):
        return html.escape(t, quote=True)
    lis = lambda items, tag: "".join(f"<{tag}>{esc(i)}</{tag}>" for i in items)
    search = esc(" ".join([r["title"], r["description"], r["use_when"]] + r["steps"]))
    inputs = f"<h4>Inputs</h4><ul>{lis(r['inputs'], 'li')}</ul>" if r["inputs"] else ""
    example = f"<h4>Worked example</h4><p>{esc(r['example'])}</p>" if r["example"] else ""
    pitfalls = f"<h4>Pitfalls</h4><ul>{lis(r['pitfalls'], 'li')}</ul>" if r["pitfalls"] else ""
    use = f'<p class="recipe-use"><strong>Use when:</strong> {esc(r["use_when"])}</p>' if r["use_when"] else ""
    return f"""<article class="card recipe-card" data-search="{search}">
  <div class="recipe-head"><h3>{esc(r["title"])}</h3><span class="badge" title="Estimated from step and input counts">{esc(r["difficulty"])}</span></div>
  <p class="recipe-desc">{esc(r["description"])}</p>
  {use}
  {inputs}
  <h4>Steps</h4><ol>{lis(r["steps"], "li")}</ol>
  {example}
  {pitfalls}
  <p class="card-meta">Skill <code>{esc(r["name"])}</code> &middot; card generated from the skill file at build time</p>
</article>"""


def build_recipes(css_links):
    recipes = []
    for path in sorted((ROOT / "skills" / "recipes").glob("recipe-*.md")):
        r = parse_recipe(path)
        if r:
            recipes.append(r)
    cards = "\n".join(recipe_card(r) for r in recipes)
    (SITE / "recipes.html").write_text(RECIPES_TMPL.format(
        css=css_links, sitenav=nav_html("", "recipes.html"), footer=footer_html(""),
        cards=cards, count=len(recipes)))
    return recipes


MODELWATCH_TMPL = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Model watch — AI Film Master Guide</title>
  <meta name="description" content="Every video and image model in the guide, with last-verified dates, version status, and what changed. Generated from models.json so it never drifts.">
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
        <span aria-hidden="true">&#8984;K</span> Search
      </button>
    </div>
  </header>
  <main id="main">
    <section class="hero hero-film" aria-labelledby="mw-title">
      <div class="container hero-inner">
        <span class="hero-kicker">Trust, dated</span>
        <h1 id="mw-title">Model <span class="accent">watch.</span></h1>
        <p class="lede">Every model in the guide's API — what it is, what it costs, what changed, and when we last checked. Generated from <code>models.json</code> at build time, so this page can never drift from the data.</p>
      </div>
    </section>
    <section class="container" aria-label="Model status" style="margin-bottom:var(--space-7);">
      <div class="verify-banner" role="note" aria-label="Verify live before spending">
        <p><strong>Verify live before spending.</strong> Model versions, prices, and availability move monthly — sometimes weekly. Every card below shows its last-verified date. If a card is older than your shoot budget, re-check the vendor's pricing page first.</p>
      </div>
      <div class="mw-filters" role="group" aria-label="Filter by model status">
        <button type="button" class="btn btn-sm" data-mw-filter="all" aria-pressed="true">All ({total})</button>
        <button type="button" class="btn btn-sm" data-mw-filter="active" aria-pressed="false">Active ({n_active})</button>
        <button type="button" class="btn btn-sm" data-mw-filter="reported" aria-pressed="false">Reported ({n_reported})</button>
        <button type="button" class="btn btn-sm" data-mw-filter="discontinued" aria-pressed="false">Discontinued ({n_discontinued})</button>
      </div>
      <p class="card-meta">Last full refresh: {refresh_date} · {total} models · <a href="../api/v1/model-updates.md">changelog</a> · <a href="../api/v1/models.json">raw JSON</a></p>
      <div class="mw-grid" id="mw-grid">
{cards}
      </div>
      <noscript><p>Filtering needs JavaScript; all {total} models are listed above regardless.</p></noscript>
    </section>
  </main>
  <footer class="site-footer">
    <div class="container footer-grid">
      <p>AI Film Master Guide — research notes for professional AI filmmaking. Sources linked per chapter.</p>
      <nav aria-label="Footer">{footer}</nav>
    </div>
  </footer>
  <button type="button" class="back-to-top" aria-label="Back to top">&uarr;</button>
  <div class="palette" id="palette" role="dialog" aria-modal="true" aria-label="Search the guide" hidden>
    <div class="palette-box">
      <input id="palette-input" type="search" placeholder="Search chapters, prompts, models&hellip;" autocomplete="off" aria-label="Search the guide">
      <div id="palette-results" role="listbox" aria-label="Search results"></div>
    </div>
  </div>
  <script src="assets/js/palette.js"></script>
  <script>
  (function () {{
    var btns = Array.prototype.slice.call(document.querySelectorAll("[data-mw-filter]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll("#mw-grid .mw-card"));
    btns.forEach(function (b) {{
      b.addEventListener("click", function () {{
        var f = b.getAttribute("data-mw-filter");
        btns.forEach(function (x) {{ x.setAttribute("aria-pressed", x === b ? "true" : "false"); }});
        cards.forEach(function (c) {{
          c.hidden = (f !== "all" && c.getAttribute("data-status") !== f);
        }});
      }});
    }});
  }})();
  </script>
</body>
</html>
"""

def build_model_watch(css_links):
    """Model freshness page, generated from api/v1/models.json."""
    doc = json.loads((ROOT / "api" / "v1" / "models.json").read_text())
    models = doc["models"]

    def card(m):
        status = m.get("status", "active")
        badge = {"active": "Active", "reported": "Reported — unconfirmed",
                 "announced": "Announced — not GA",
                 "discontinued": "Discontinued"}.get(status, status)
        sources = "".join(
            f'<li><a href="{html.escape(u)}" rel="noopener">{html.escape(u.split("/")[2])}</a></li>'
            for u in m.get("sources", []) if u.startswith("http"))
        sources_html = f"<ul>{sources}</ul>" if sources else "<p>Vendor page — verify live.</p>"
        return (
            f'<article class="mw-card{" is-discontinued" if status == "discontinued" else ""}" data-status="{status}">\n'
            f'  <span class="mw-badge mw-badge-{status}">{badge}</span>\n'
            f'  <h3>{html.escape(m["model"])}</h3>\n'
            f'  <p class="mw-platform">{html.escape(str(m.get("platform", "")))} · {html.escape(str(m.get("type", "")))}</p>\n'
            f'  <dl>\n'
            f'    <dt>Best use</dt><dd>{html.escape(str(m.get("best_use", "")))}</dd>\n'
            f'    <dt>Cost</dt><dd>{html.escape(str(m.get("est_cost_credits", "")))}</dd>\n'
            f'    <dt>Strength</dt><dd>{html.escape(str(m.get("strength", "")))}</dd>\n'
            f'    <dt>Weakness</dt><dd>{html.escape(str(m.get("weakness", "")))}</dd>\n'
            f'  </dl>\n'
            f'  <p class="mw-changed"><strong>What changed:</strong> {html.escape(str(m.get("what_changed", "")))}</p>\n'
            f'  <div class="mw-sources"><strong>Sources</strong>{sources_html}</div>\n'
            f'  <p class="mw-verified">last verified {html.escape(str(m.get("last_verified", "—")))}</p>\n'
            f'</article>'
        )

    counts = {"active": 0, "reported": 0, "discontinued": 0}
    for m in models:
        counts[m.get("status", "active")] = counts.get(m.get("status", "active"), 0) + 1
    (SITE / "model-watch.html").write_text(MODELWATCH_TMPL.format(
        css=css_links, sitenav=nav_html("", "model-watch.html"), footer=footer_html(""),
        cards="\n".join(card(m) for m in models),
        total=len(models), n_active=counts.get("active", 0),
        n_reported=counts.get("reported", 0), n_discontinued=counts.get("discontinued", 0),
        refresh_date="2026-10-11"))


CHECK_TMPL = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title} — knowledge check — AI Film Master Guide</title>
  <meta name="description" content="Test your understanding of the {title} chapter: scenario questions with explained answers. Progress saves in your browser.">
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
        <span aria-hidden="true">&#8984;K</span> Search
      </button>
    </div>
  </header>
  <main id="main">
    <section class="hero hero-film" aria-labelledby="check-title">
      <div class="container hero-inner">
        <span class="hero-kicker">Knowledge check</span>
        <h1 id="check-title">{title}</h1>
        <p class="lede">{n} scenario questions drawn from the chapter. These test understanding, not trivia — every answer explains <em>why</em>. Your score saves in this browser.</p>
        <p><a class="btn btn-ghost" href="../{chapter_url}">&larr; Back to the chapter</a></p>
      </div>
    </section>
    <section class="container check" data-check="{slug}" aria-label="Quiz questions" style="margin-bottom:var(--space-7);">
      <form id="check-form" novalidate>
        {questions}
        <div class="check-actions">
          <button type="submit" class="btn btn-gold">Check answers</button>
          <button type="reset" class="btn btn-ghost">Clear</button>
        </div>
      </form>
      <div class="check-result" role="status" hidden></div>
      <noscript><p>These checks need JavaScript to score. The chapter itself is fully readable without it.</p></noscript>
    </section>
  </main>
  <footer class="site-footer">
    <div class="container footer-grid">
      <p>AI Film Master Guide — research notes for professional AI filmmaking. Sources linked per chapter.</p>
      <nav aria-label="Footer">{footer}</nav>
    </div>
  </footer>
  <button type="button" class="back-to-top" aria-label="Back to top">&uarr;</button>
  <div class="palette" id="palette" role="dialog" aria-modal="true" aria-label="Search the guide" hidden>
    <div class="palette-box">
      <input id="palette-input" type="search" placeholder="Search chapters, prompts, models&hellip;" autocomplete="off" aria-label="Search the guide">
      <div id="palette-results" role="listbox" aria-label="Search results"></div>
    </div>
  </div>
  <script src="../assets/js/palette.js"></script>
  <script src="../assets/js/checks.js"></script>
</body>
</html>
"""

CHECKS_INDEX_TMPL = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Knowledge checks — AI Film Master Guide</title>
  <meta name="description" content="Scenario-based knowledge checks for the guide's core craft chapters. Test understanding, get explained answers, track progress.">
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
        <span aria-hidden="true">&#8984;K</span> Search
      </button>
    </div>
  </header>
  <main id="main">
    <section class="hero hero-film" aria-labelledby="checks-title">
      <div class="container hero-inner">
        <span class="hero-kicker">The course-killer</span>
        <h1 id="checks-title">Knowledge <span class="accent">checks.</span></h1>
        <p class="lede">Six chapters, {total_q} scenario questions. Not trivia — situations a director actually faces, with every answer explaining why. Pass these and the chapters are yours.</p>
        <p class="card-meta" id="checks-summary" role="status"></p>
      </div>
    </section>
    <section class="container" aria-label="All knowledge checks" style="margin-bottom:var(--space-7);">
      <div class="checks-grid" id="checks-progress">
{cards}
      </div>
      <noscript><p>Progress tracking needs JavaScript; the checks themselves are linked above regardless.</p></noscript>
    </section>
  </main>
  <footer class="site-footer">
    <div class="container footer-grid">
      <p>AI Film Master Guide — research notes for professional AI filmmaking. Sources linked per chapter.</p>
      <nav aria-label="Footer">{footer}</nav>
    </div>
  </footer>
  <button type="button" class="back-to-top" aria-label="Back to top">&uarr;</button>
  <div class="palette" id="palette" role="dialog" aria-modal="true" aria-label="Search the guide" hidden>
    <div class="palette-box">
      <input id="palette-input" type="search" placeholder="Search chapters, prompts, models&hellip;" autocomplete="off" aria-label="Search the guide">
      <div id="palette-results" role="listbox" aria-label="Search results"></div>
    </div>
  </div>
  <script src="../assets/js/palette.js"></script>
  <script src="../assets/js/checks.js"></script>
</body>
</html>
"""

def build_checks(css_links):
    """Knowledge checks: one page per chapter + index, from scripts/checks.json."""
    data = json.loads((ROOT / "scripts" / "checks.json").read_text())
    checks = data["checks"]
    out_dir = SITE / "checks"
    out_dir.mkdir(parents=True, exist_ok=True)
    css_sub = css_links.replace('href="assets/', 'href="../assets/')
    cards = []
    for c in checks:
        slug = c["slug"]
        qs = []
        for i, q in enumerate(c["questions"]):
            opts = "".join(
                f'<label><input type="radio" name="q{i}" value="{j}" required> '
                f'<span>{html.escape(opt)}</span></label>'
                for j, opt in enumerate(q["options"]))
            qs.append(
                f'<fieldset data-answer="{q["answer"]}" data-why="{html.escape(q["why"], quote=True)}">\n'
                f'  <legend>{i + 1}. {html.escape(q["q"])}</legend>\n'
                f'  {opts}\n'
                f'  <p class="check-feedback" hidden></p>\n'
                f'</fieldset>')
        (out_dir / f"{slug}.html").write_text(CHECK_TMPL.format(
            title=html.escape(c["title"]), slug=slug, n=len(c["questions"]),
            chapter_url=c["chapter_url"], questions="\n".join(qs),
            css=css_sub, sitenav=nav_html("../", ""), footer=footer_html("../")))
        cards.append(
            f'<article class="card chapter-card" data-check-card="{slug}">\n'
            f'  <h3><a href="{slug}.html">{html.escape(c["title"])}</a></h3>\n'
            f'  <p>{len(c["questions"])} scenario questions · answers explain why</p>\n'
            f'  <p><a href="../{c["chapter_url"]}">Read the chapter first &rarr;</a></p>\n'
            f'  <span class="check-status">Not taken</span>\n'
            f'</article>')
    total_q = sum(len(c["questions"]) for c in checks)
    css_idx = css_links.replace('href="assets/', 'href="../assets/')
    (out_dir / "index.html").write_text(CHECKS_INDEX_TMPL.format(
        css=css_idx, sitenav=nav_html("../", ""), footer=footer_html("../"),
        cards="\n".join(cards), total_q=total_q))
    return checks


CHECK_SLUGS = {
    ("higgsfield", "prompt-engineering"): "prompt-engineering",
    ("craft", "directing-performance"): "directing-performance",
    ("craft", "character-consistency"): "character-consistency",
    ("craft", "longform-pipelines"): "longform-pipelines",
    ("craft", "sound-music-audio"): "sound-music-audio",
    ("legal", "rights-and-disclosure"): "rights-and-disclosure",
}

def check_html(section_id, slug):
    """'Test yourself' callout for chapters that have a knowledge check."""
    cslug = CHECK_SLUGS.get((section_id, slug))
    if not cslug:
        return ""
    return (
        '<aside class="check-callout" aria-label="Knowledge check">'
        '<p><strong>Test yourself:</strong> '
        f'<a href="../checks/{cslug}.html">take the {cslug.replace("-", " ")} knowledge check</a> '
        "(5 scenario questions, answers explain why).</p></aside>"
    )


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
                "words": word_count(md),
                "read_min": read_minutes(md),
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
            prevnext=prev_l + next_l, check=check_html(section_id, slug), read_min=c["read_min"],
            words=f"{c['words']:,}",
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
            f'<p>{c["desc"]}</p><p class="card-meta">{c["read_min"]} min read</p></article>'
            for slug, c in chapters[section_id]
        )
        grid_parts.append(f'<h3 class="section-h">{section_name}</h3><div class="chapter-grid">{cards}</div>')
    total_read = fmt_total_minutes(sum(c["read_min"] for _, _, c in flat))
    (SITE / "index.html").write_text(INDEX_TMPL.format(
        css=css_links, chapter_grid="\n".join(grid_parts),
        total_read=total_read,
        sitenav=nav_html("", "index.html"), footer=footer_html("")))
    (SITE / "budget.html").write_text(BUDGET_TMPL.format(
        css=css_links, sitenav=nav_html("", ""), footer=footer_html("")))

    # Budget optimizer page (model mix planner, data-driven from models.json)
    (SITE / "optimizer.html").write_text(OPTIMIZER_TMPL.format(
        css=css_links, sitenav=nav_html("", ""), footer=footer_html("")))

    # Anatomy of a prompt explorer
    (SITE / "anatomy.html").write_text(ANATOMY_TMPL.format(
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

    # Model compare tool (side-by-side, shareable URLs)
    (SITE / "compare.html").write_text(COMPARE_TMPL.format(
        css=css_links, sitenav=nav_html("", "compare.html"), footer=footer_html("")))

    # Prompt gallery (workshop saves as a browsable collection)
    (SITE / "gallery.html").write_text(GALLERY_TMPL.format(
        css=css_links, sitenav=nav_html("", "gallery.html"), footer=footer_html("")))

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

    # Shot-by-shot teardown viewer
    shutil.copy(ROOT / "api" / "v1" / "teardowns.json", SITE / "teardowns.json")
    (SITE / "teardown.html").write_text(TEARDOWN_TMPL.format(
        css=css_links, sitenav=nav_html("", "teardown.html"), footer=footer_html("")))

    # Manifesto page
    (SITE / "manifesto.html").write_text(MANIFESTO_TMPL.format(
        css=css_links, sitenav=nav_html("", "manifesto.html"), footer=footer_html("")))

    # Printable field guides (generated from the guide's own data)
    build_field_guides(css_links)

    # Shoot recipes (generated from skills/recipes/*.md at build time)
    build_recipes(css_links)

    # Model freshness page (generated from api/v1/models.json)
    build_model_watch(css_links)

    # Knowledge checks (generated from scripts/checks.json)
    wave7_checks = build_checks(css_links)

    # Vendor-neutral craft page (static, repo root)
    shutil.copy(ROOT / "craft-not-buttons.html", SITE / "craft-not-buttons.html")

    # New pages discoverable through the search palette
    search_index.extend([
        {"url": "teardown.html", "title": "Shot-by-shot teardowns", "section": "Tools",
         "headings": ["Passport Rush", "ONEIRIC", "The $100K cautionary case"],
         "text": "Learn to see: shot-by-shot teardowns of Passport Rush, ONEIRIC, and the Grok Odyssey $100K winner — what each shot did, what worked, what broke, and the craft lesson, with labeled prompt reconstructions."},
        {"url": "manifesto.html", "title": "Manifesto", "section": "Meta",
         "headings": ["What this is", "What it costs", "Everything is sourced", "What it won't do", "How to use it", "Who it's for"],
         "text": "This is not a course: the guide's positioning — a living, free, sourced reference. What it costs, what it refuses to do (no hype, no tool worship, no secrets), and how to use it in 10 minutes or 10 hours."},
        {"url": "field-guides/", "title": "Field guides", "section": "Tools",
         "headings": ["Model quick-reference", "Prompt anatomy cheat sheet", "Consistency & dead-eyes checklist"],
         "text": "Printable one-page field guides generated from the guide's own data: model quick-reference, prompt anatomy cheat sheet, consistency and dead-eyes checklist."},
        {"url": "quiz.html", "title": "Model-picker quiz", "section": "Tools",
         "headings": ["What's the job?", "Budget tier?", "What look?", "Native audio needed?", "Your footage plan"],
         "text": "Five questions, one ranked shortlist: the model-picker quiz scores all 18 video models against your use case, budget, and audio needs, with live cost math and a one-click handoff to the prompt workshop."},
        {"url": "compare.html", "title": "Model compare", "section": "Tools",
         "headings": ["Pick your contenders"],
         "text": "Side-by-side model comparison from the guide's versioned model data: cost, best use, strengths, weaknesses, native audio, and freshness status for 2–3 models, with shareable URLs. Discontinued models excluded."},
        {"url": "gallery.html", "title": "Prompt gallery", "section": "Tools",
         "headings": ["Your collection"],
         "text": "Your workshop-saved prompts as a browsable gallery: filter by track and model, sort by rating, open in the workshop, export and import as JSON. Stored in your browser."},
        {"url": "workshop.html", "title": "Prompt workshop", "section": "Tools",
         "headings": ["Pick your ingredients", "Fill the placeholders", "Copy your prompt", "Your saved prompts"],
         "text": "Interactive prompt workshop: pick a template, model, and track, fill the placeholders, and copy a production-ready prompt. Every template carries anatomy notes explaining why it works. Save and rate your own prompts in the browser."},
        {"url": "budget.html", "title": "Budget calculator", "section": "Tools",
         "headings": ["Your production"],
         "text": "Interactive budget calculator: runtime, shot length, model, and takes per keeper in — a cost envelope out, grounded in the credit-math chapter's third-party per-clip estimates."},
        {"url": "optimizer.html", "title": "Budget optimizer", "section": "Tools",
         "headings": ["Your production", "Your shoot plan"],
         "text": "Budget optimizer: runtime, dialogue share, and quality bar in — an optimal model mix out. Splits the film into dialogue and non-dialogue buckets, assigns the cheapest model that satisfies the tier from models.json, with 5x and 20x cost envelopes from the long-form chapter."},
        {"url": "anatomy.html", "title": "Anatomy of a prompt", "section": "Tools",
         "headings": ["Prompt anatomy explorer", "Your prompt"],
         "text": "Anatomy of a prompt: the nine-layer prompt anatomy as an interactive annotated example — hover any layer to learn what it does, why it matters, and what breaks without it. Plus a build-your-own mode that assembles the layers into a production-ready prompt."},
        {"url": "skills.html", "title": "Skills browser", "section": "Tools",
         "headings": [],
         "text": "Browse all task skills: prompt templates, camera moves, models, long-form pipelines, craft techniques, checklists, and more, with live filtering."},
        {"url": "changelog.html", "title": "Changelog", "section": "Meta",
         "headings": ["Process note", "Recent changes"],
         "text": "What changed in the guide, dated per release: new chapters, model updates, new templates, and corrections. Rebuilt from the git history on every site build."},
        {"url": "skill-spec.html", "title": "Skill schema spec", "section": "Meta",
         "headings": ["Frontmatter", "Sections", "Full example"],
         "text": "The exact frontmatter-plus-sections format every guide skill follows, so other agent frameworks can consume or produce compatible skills: name, description, Use when, Inputs, Procedure, Worked example, API references, Pitfalls."},
        {"url": "craft-not-buttons.html", "title": "Learn craft, not buttons", "section": "Craft",
         "headings": ["Text-to-video: the shot", "Image-to-video: the plate", "Upscaling: the finish", "Voice and dialogue: the performance", "Editing and assembly: the film"],
         "text": "Vendor-neutral craft decisions for AI filmmaking: what actually matters for text-to-video, image-to-video, upscaling, voice, and editing, mapped to where each decision lives in Kling, Veo, Runway, Luma, Higgsfield, and Seedance. Tools die, craft transfers."},
        {"url": "recipes.html", "title": "Shoot recipes", "section": "Tools",
         "headings": ["Steps", "Inputs", "Worked example", "Pitfalls"],
         "text": "Twelve repeatable shoot recipes from the guide's skill library as visual cards: dialogue scenes, trailers, fight scenes, horror shorts, montages, music videos and more — steps, inputs, worked examples, pitfalls, generated from the skill files at build time."},
    ])
    search_index.extend([
        {"url": "model-watch.html", "title": "Model watch", "section": "Tools",
         "headings": ["Verify live before spending", "Active", "Reported", "Discontinued"],
         "text": "Every model in the guide with last-verified dates, version status, and what changed: Sora discontinued, Kling 4.0 announced, MiniMax H3 and Midjourney V1 Video added, Veo 3.1 current with no Veo 4. Generated from models.json."},
        {"url": "checks/", "title": "Knowledge checks", "section": "Tools",
         "headings": ["Prompt engineering", "Directing performance", "Character consistency",
                      "Long-form pipelines", "Sound, music and audio", "Rights and disclosure"],
         "text": "Scenario-based knowledge checks for six core craft chapters: 30 questions testing real directing judgment, every answer explained, progress saved in the browser."},
    ] + [
        {"url": f"checks/{c['slug']}.html", "title": c["title"] + " — knowledge check", "section": "Tools",
         "headings": [], "text": f"Knowledge check for the {c['title']} chapter: scenario questions with explained answers."}
        for c in wave7_checks
    ])
    (SITE / "search-index.json").write_text(json.dumps(search_index, ensure_ascii=False))

    # Bundle shared assets + API docs page into site/ so it is self-contained
    shutil.copytree(ROOT / "assets", SITE / "assets", dirs_exist_ok=True)
    shutil.copy(ROOT / "api.html", SITE / "api.html")
    print(f"Built {len(flat)} chapters + index + search index -> {SITE}")


if __name__ == "__main__":
    main()
