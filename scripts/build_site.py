#!/usr/bin/env python3
"""Build the static guide site from chapter Markdown.

Usage: python3 scripts/build_site.py
Reads chapters from <repo>/<section>/*.md, writes HTML to <repo>/site/.
"""
import json
import re
import shutil
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
    ("sources", "Sources"),
]

CHAPTER_ORDER = {
    "higgsfield": ["platform-mastery", "prompt-engineering", "soul-id-deep-dive", "100k-festival-playbook"],
    "craft": ["story-structure", "cinematic-language", "character-consistency", "directing-performance", "color-grading", "sound-music-audio", "editing-pipeline", "long-form-pipeline"],
    "platforms": ["field-guide", "when-to-use-what"],
    "economics": ["credit-math"],
    "case-studies": ["festival-winners", "entry-craft-teardowns"],
    "sources": ["source-index"],
}

CSS = ["assets/css/tokens.css", "assets/css/base.css", "assets/css/layout.css",
       "assets/css/components.css", "assets/css/docs.css"]

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
        <a href="../index.html">Guide</a>
        <a href="../api.html">API</a>
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
      <nav aria-label="Footer"><a href="../index.html">Guide</a><a href="../api.html">API</a></nav>
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
</body>
</html>
"""

INDEX_TMPL = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>AI Film Master Guide — Professional AI Filmmaking</title>
  <meta name="description" content="The master guide to professional AI filmmaking: Higgsfield mastery, pro craft, animated and photorealistic tracks, festival playbooks, and a machine-readable API.">
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
        <a href="index.html" aria-current="page">Guide</a>
        <a href="api.html">API</a>
      </nav>
      <button type="button" class="btn btn-sm btn-ghost palette-open" aria-label="Search the guide (Ctrl+K)">
        <span aria-hidden="true">⌘K</span> Search
      </button>
    </div>
  </header>
  <main id="main">
    <section class="hero hero-film" aria-labelledby="hero-title">
      <div class="container hero-inner">
        <span class="hero-kicker">Festival-grade AI filmmaking</span>
        <h1 id="hero-title">Make films with AI<br><span class="accent">like a studio.</span></h1>
        <p class="lede">Eighteen chapters on Higgsfield mastery, professional craft, directing performance, color grading, sound, economics, long-form pipelines, and festival playbooks — with separate tracks for animated/stylized and photorealistic production. Plus a machine-readable API and 180 task skills for agents.</p>
        <div class="stat-strip">
          <div class="stat"><div class="stat-value">18</div><div class="stat-label">Chapters</div></div>
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
          <p>Anime, Ghibli-style, Pixar-style 3D, 2D cartoon, claymation. Cheaper, more forgiving, dedicated festival lanes — with its own prompt register (no lens or DOF language) and model shortlist.</p>
          <div class="btn-row">
            <a class="btn btn-sm" href="higgsfield/prompt-engineering.html">Prompt engineering</a>
            <a class="btn btn-sm" href="platforms/when-to-use-what.html">Model selection</a>
          </div>
        </article>
        <article class="card track-card">
          <h3>Photorealistic</h3>
          <p>Premium models, identity discipline, and post-production craft to pass for real. The festival-winning lane for drama, action, and trailer-grade work.</p>
          <div class="btn-row">
            <a class="btn btn-sm" href="higgsfield/soul-id-deep-dive.html">Soul ID deep dive</a>
            <a class="btn btn-sm" href="craft/character-consistency.html">Character consistency</a>
          </div>
        </article>
      </div>
    </section>

    <section class="container" aria-labelledby="paths-h">
      <h2 id="paths-h">Start here: learning paths</h2>
      <p class="section-lede">Don't read eighteen chapters in order. Pick your goal — each path is the shortest route through the guide that gets you there.</p>
      <div class="path-grid">
        <article class="card path-card">
          <h3>Your first AI film <span class="path-time">a weekend</span></h3>
          <p>Story to finished short in two days. The minimum viable path.</p>
          <ol class="path-steps">
            <li><a href="craft/story-structure.html">Story structure</a></li>
            <li><a href="higgsfield/prompt-engineering.html">Prompt engineering</a></li>
            <li><a href="platforms/when-to-use-what.html">Model selection</a></li>
            <li><a href="economics/credit-math.html">Credit math</a></li>
            <li><a href="craft/editing-pipeline.html">Editing pipeline</a></li>
          </ol>
        </article>
        <article class="card path-card">
          <h3>Festival entry <span class="path-time">2–4 weeks</span></h3>
          <p>Built to place. Every chapter judges actually score.</p>
          <ol class="path-steps">
            <li><a href="higgsfield/100k-festival-playbook.html">Festival playbook</a></li>
            <li><a href="craft/directing-performance.html">Directing performance</a></li>
            <li><a href="craft/color-grading.html">Color grading</a></li>
            <li><a href="craft/sound-music-audio.html">Sound &amp; music</a></li>
            <li><a href="case-studies/entry-craft-teardowns.html">Entry craft teardowns</a></li>
          </ol>
        </article>
        <article class="card path-card">
          <h3>Animated / stylized <span class="path-time">1–2 weeks</span></h3>
          <p>Cheaper, more forgiving, dedicated festival lanes.</p>
          <ol class="path-steps">
            <li><a href="higgsfield/prompt-engineering.html">Prompt engineering</a> <span class="path-note">animated register</span></li>
            <li><a href="craft/cinematic-language.html">Cinematic language</a></li>
            <li><a href="craft/character-consistency.html">Character consistency</a></li>
            <li><a href="platforms/when-to-use-what.html">Model selection</a></li>
          </ol>
        </article>
        <article class="card path-card">
          <h3>Photorealistic drama <span class="path-time">3–6 weeks</span></h3>
          <p>The premium lane: invisible AI, visible craft.</p>
          <ol class="path-steps">
            <li><a href="higgsfield/soul-id-deep-dive.html">Soul ID deep dive</a></li>
            <li><a href="craft/character-consistency.html">Character consistency</a></li>
            <li><a href="craft/directing-performance.html">Directing performance</a></li>
            <li><a href="craft/color-grading.html">Color grading</a></li>
          </ol>
        </article>
        <article class="card path-card">
          <h3>Long-form: 20+ minutes <span class="path-time">ongoing</span></h3>
          <p>Systems, not prompts. How features actually get made.</p>
          <ol class="path-steps">
            <li><a href="craft/long-form-pipeline.html">Long-form pipeline</a></li>
            <li><a href="craft/directing-performance.html">Directing performance</a></li>
            <li><a href="craft/editing-pipeline.html">Editing pipeline</a></li>
            <li><a href="economics/credit-math.html">Credit math</a> <span class="path-note">compute envelopes</span></li>
          </ol>
        </article>
      </div>
    </section>

    <section class="container" aria-labelledby="chapters-h">
      <h2 id="chapters-h">The chapters</h2>
      {chapter_grid}
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
      <nav aria-label="Footer"><a href="index.html">Guide</a><a href="api.html">API</a></nav>
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


def build_toc(heads):
    items = "".join(
        f'<li class="toc-l{level}"><a href="#{anchor}">{h}</a></li>'
        for level, h, anchor in heads if level > 1
    )
    return f"<ul>{items}</ul>" if items else ""


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
    (SITE / "index.html").write_text(INDEX_TMPL.format(css=css_links, chapter_grid="\n".join(grid_parts)))
    (SITE / "search-index.json").write_text(json.dumps(search_index, ensure_ascii=False))

    # Bundle shared assets + API docs page into site/ so it is self-contained
    shutil.copytree(ROOT / "assets", SITE / "assets", dirs_exist_ok=True)
    shutil.copy(ROOT / "api.html", SITE / "api.html")
    print(f"Built {len(flat)} chapters + index + search index -> {SITE}")


if __name__ == "__main__":
    main()
