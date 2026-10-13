#!/usr/bin/env python3
"""Build the static guide site from chapter Markdown.

Usage: python3 scripts/build_site.py
Reads chapters from <repo>/<section>/*.md, writes HTML to <repo>/site/.
"""
import html
import json
import random
import re
import shutil
import subprocess
from pathlib import Path

import md2html

ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT / "site"

SECTIONS = [
    ("field", "State of the Field"),
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
    "field": ["2026-developments"],
    "higgsfield": ["platform-mastery", "prompt-engineering", "soul-id-deep-dive", "competition-entry-craft"],
    "craft": ["story-structure", "cinematic-language", "character-consistency", "directing-performance", "color-grading", "sound-music-audio", "editing-pipeline", "editing-ai-footage", "longform-pipelines", "agentic-production-office", "component-based-generation", "episodic-shortform", "documentary-ethics", "failure-gallery", "ai-film-business"],
    "platforms": ["field-guide", "when-to-use-what"],
    "economics": ["credit-math"],
    "case-studies": ["competition-teardowns", "entry-craft-teardowns"],
    "distribution": ["release-paths", "festival-landscape-2026"],
    "legal": ["rights-and-disclosure", "script-clearance"],
    "sources": ["source-index"],
    "guides": ["first-short"],
}

CSS = ["assets/css/tokens.css", "assets/css/base.css", "assets/css/layout.css",
       "assets/css/components.css", "assets/css/motifs.css", "assets/css/docs.css",
       "assets/css/home.css", "assets/css/print.css"]

NAV_TOP = [
    ("index.html", "Guide"),
    ("cutting-room.html", "Cutting room"),
    ("teardown.html", "Teardowns"),
    ("workshop.html", "Workshop"),
    ("models/", "Models"),
    ("compare.html", "Compare"),
]
# Everything else lives in the Index drawer — progressive disclosure.
# Groups are editorial, not taxonomic: where a working filmmaker would reach.
NAV_INDEX = [
    ("On the bench", [
        ("prompts.html", "Prompts"),
        ("shots.html", "Shot list"),
        ("style-bible.html", "Style bible"),
        ("budget.html", "Budget"),
        ("optimizer.html", "Optimizer"),
        ("doctor.html", "Doctor"),
        ("linter.html", "Linter"),
        ("greenlight.html", "Green light"),
        ("clearance.html", "Script clearance"),
        ("continuity.html", "Continuity ledger"),
        ("cuesheet.html", "Cue sheet"),
        ("grade.html", "Grade sheet"),
        ("cut.html", "Cut sheet"),
        ("take.html", "Take sheet"),
        ("recipes.html", "Recipes"),
        ("forge.html", "Episode forge"),
    ]),
    ("Study", [
        ("manifesto.html", "Manifesto"),
        ("craft-not-buttons.html", "Craft, not buttons"),
        ("field-guides/", "Field guides"),
        ("checks/", "Knowledge checks"),
        ("quiz.html", "Quiz"),
        ("gallery.html", "Gallery"),
        ("model-watch.html", "Model watch"),
        ("showdown.html", "Model showdown"),
    ]),
    ("For agents", [
        ("skills.html", "Skills"),
        ("skill-spec.html", "Skill spec"),
        ("api.html", "API"),
        ("changelog.html", "Changelog"),
    ]),
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
    ("showdown.html", "Showdown"),
    ("forge.html", "Episode forge"),
    ("clearance.html", "Script clearance"),
    ("continuity.html", "Continuity ledger"),
    ("cuesheet.html", "Cue sheet"),
    ("grade.html", "Grade sheet"),
    ("cut.html", "Cut sheet"),
    ("take.html", "Take sheet"),
    ("checks/", "Knowledge checks"),
    ("budget.html", "Budget"),
    ("optimizer.html", "Optimizer"),
    ("shots.html", "Shot list"),
    ("style-bible.html", "Style bible"),
    ("doctor.html", "Doctor"),
    ("linter.html", "Linter"),
    ("cutting-room.html", "Cutting room"),
    ("prompts.html", "Prompts"),
    ("models/", "Models"),
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
    for href, label in NAV_TOP:
        cur = ' aria-current="page"' if href == current else ""
        parts.append(f'<a href="{prefix}{href}"{cur}>{label}</a>')
    groups = []
    index_current = False
    for gname, items in NAV_INDEX:
        lis = []
        for href, label in items:
            if href == current:
                index_current = True
                lis.append(f'<li><a href="{prefix}{href}" aria-current="page">{label}</a></li>')
            else:
                lis.append(f'<li><a href="{prefix}{href}">{label}</a></li>')
        groups.append(
            f'<div class="nav-idx-group"><p>{gname}</p><ul>{"".join(lis)}</ul></div>')
    idx_cls = " is-current" if index_current else ""
    parts.append(
        f'<details class="nav-idx"><summary class="nav-idx-btn{idx_cls}">'
        f'<span>Index</span><span class="nav-idx-caret" aria-hidden="true">▾</span></summary>'
        f'<div class="nav-idx-panel">{"".join(groups)}</div></details>')
    return "\n        ".join(parts)


def footer_html(prefix):
    return "".join(f'<a href="{prefix}{href}">{label}</a>' for href, label in FOOTER_ITEMS)


def _deck_clips(labels, cls):
    """Lay clip blocks across a timeline track: even widths, 2% gutters."""
    n = len(labels)
    if not n:
        return ""
    gap = 2.0
    w = (100.0 - gap * (n + 1)) / n
    parts = []
    for i, lab in enumerate(labels):
        left = gap + i * (w + gap)
        parts.append(
            f'<span class="clip {cls}" style="left:{left:.1f}%;width:{w:.1f}%">{lab}</span>')
    return "\n            ".join(parts)


def waveform_divider(seed=7, bars=72):
    """Section divider styled as an audio waveform — pure markup, deterministic.

    A seeded random walk gives it the irregular hand of real room tone;
    the same seed builds identically every time (stable builds, no drift).
    """
    rnd = random.Random(seed)
    h = 42.0
    parts = []
    for _ in range(bars):
        h = max(10.0, min(100.0, h + rnd.uniform(-36, 36)))
        parts.append(f'<i style="height:{h:.0f}%"></i>')
    return '<div class="waveform" aria-hidden="true">' + "".join(parts) + "</div>"


def reel_cue(scene, tc, label):
    """Slate-style cue above a homepage section: scene number + timecode."""
    return (f'<p class="reel-cue"><span class="tc">{tc}</span>'
            f'<span class="reel-cue-scene">{scene}</span>'
            f'<span class="reel-cue-label">{label}</span></p>')


def hero_cutroom(kicker, h1, lede, deck_title, clips, h1_id, extra=""):
    """The Cutting Room hero (wave 37): timeline deck + leader frame + hero copy.

    kicker/h1/lede/extra are raw HTML fragments (may carry {placeholders}
    for the outer .format() call). clips = {"v2": [...], "v1": [...], "a1": [...]}.
    """
    v2 = _deck_clips(clips.get("v2", []), "is-blue")
    v1 = _deck_clips(clips.get("v1", []), "is-gold")
    a1_labels = clips.get("a1", [])
    a1 = []
    n = len(a1_labels)
    gap = 2.0
    w = (100.0 - gap * (n + 1)) / n if n else 0
    for i, lab in enumerate(a1_labels):
        cls = "is-rec" if i == 0 else ""
        left = gap + i * (w + gap)
        a1.append(
            f'<span class="clip {cls}" style="left:{left:.1f}%;width:{w:.1f}%">{lab}</span>')
    a1s = "\n            ".join(a1)
    return f"""<section class="hero hero-cutroom" aria-labelledby="{h1_id}">
      <div class="tl-deck" aria-hidden="true">
        <div class="tl-chrome">
          <span class="tl-rec"><i></i>REC</span>
          <span class="tl-tc-live" data-tl-tc>00:00:04:00</span>
          <span class="tl-pop">2-POP 01:00:06:00 &#183; &#x223F;1kHz</span>
          <span class="tl-title">{deck_title}</span>
        </div>
        <div class="tl-ruler">
          <span style="left:0%">00:00:00:00</span><span style="left:20%">00:00:12:00</span><span style="left:40%">00:00:24:00</span><span style="left:60%">00:00:36:00</span><span style="left:80%">00:00:48:00</span><span style="left:100%">00:01:00:00</span>
        </div>
        <div class="tl-tracks">
          <div class="tl-track"><span class="tl-track-label">V2</span>
            {v2}
          </div>
          <div class="tl-track"><span class="tl-track-label">V1</span>
            {v1}
          </div>
          <div class="tl-track"><span class="tl-track-label">A1</span>
            {a1s}
          </div>
          <div class="tl-playhead"></div>
        </div>
        <div class="leader-frame" data-leader-frame><b>3</b><span class="lf-label">LEADER</span></div>
      </div>
      <div class="container hero-inner">
        <span class="hero-kicker"><span class="rec" aria-hidden="true"></span>{kicker}</span>
        <h1 id="{h1_id}">{h1}</h1>
        <p class="lede">{lede}</p>
        {extra}
      </div>
    </section>"""

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
  <div class="edge-right" aria-hidden="true"></div>
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
      <span class="hdr-tc" data-hdr-tc aria-hidden="true"><span class="hdr-rec">●</span> <span class="hdr-tc-val">00:59:52:00</span></span>
      <button type="button" class="btn btn-sm btn-ghost palette-open" aria-label="Search the guide (Ctrl+K)">
        <span aria-hidden="true">⌘K</span> Search
      </button>
    </div>
  </header>
  <div class="container docs-layout">
    <nav class="docs-nav" aria-label="Chapters">{nav}</nav>
    <main id="main" class="docs-main">
      <div class="progress-bar" aria-hidden="true"><span></span></div>
      <div class="progress-tc" aria-hidden="true">00:00:00:00</div>
      <header class="reel-head">
        <div class="reel-no"><small>REEL</small>{reel}</div>
        <div>
          <p class="crumb"><a href="../index.html">Guide</a> / {section_name}</p>
          <p class="reel-meta"><span class="tc">{read_min} MIN</span> · {words} words · chapter {reel} of 30</p>
        </div>
      </header>
      <article class="prose">{body}</article>
      <nav class="prevnext" aria-label="Next and previous chapters">{prevnext}</nav>{check}
    </main>
    <aside class="docs-toc" aria-label="On this page"><p class="toc-h">On this page</p>{toc}</aside>
  </div>
  <footer class="site-footer">
    <div class="container footer-grid">
      <p>AI Film Master Guide — research notes for professional AI filmmaking. Sources linked per chapter.</p>
      <nav aria-label="Footer">{footer}</nav>
      <div class="footer-colophon"><span class="tc">TC 00:00:00:00</span><span class="tailpop">Tail pop</span><span>Cut in the cutting room</span><span class="tail">AI Film Master Guide — craft, not buttons</span></div>
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
<body class="home">
  <div class="edge-right" aria-hidden="true"></div>
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
      <span class="hdr-tc" data-hdr-tc aria-hidden="true"><span class="hdr-rec">●</span> <span class="hdr-tc-val">00:59:52:00</span></span>
      <button type="button" class="btn btn-sm btn-ghost palette-open" aria-label="Search the guide (Ctrl+K)">
        <span aria-hidden="true">⌘K</span> Search
      </button>
    </div>
  
  <main id="main">
    <section class="hero hero-cutroom hero-home" aria-labelledby="hero-title">
<div class="tl-deck" aria-hidden="true">
        <div class="tl-chrome">
          <span class="tl-rec"><i></i>REC</span>
          <span class="tl-tc-live" data-tl-tc>00:00:04:00</span>
          <span class="tl-pop">2-POP 01:00:06:00 &#183; &#x223F;1kHz</span>
          <span class="tl-title">AI_FILM_MASTER_GUIDE — ASSEMBLY_01</span>
        </div>
        <div class="tl-ruler">
          <span style="left:0%">00:00:00:00</span><span style="left:20%">00:00:12:00</span><span style="left:40%">00:00:24:00</span><span style="left:60%">00:00:36:00</span><span style="left:80%">00:00:48:00</span><span style="left:100%">00:01:00:00</span>
        </div>
        <div class="tl-tracks">
          <div class="tl-track"><span class="tl-track-label">V2</span>
            <span class="clip is-blue" style="left:8%;width:20%">B-roll selects</span>
            <span class="clip is-blue" style="left:33%;width:16%">Cutaways</span>
            <span class="clip is-blue" style="left:64%;width:24%">Teardown frames</span>
          </div>
          <div class="tl-track"><span class="tl-track-label">V1</span>
            <span class="clip is-gold" style="left:2%;width:30%">Opening — the hook</span>
            <span class="clip is-gold" style="left:36%;width:26%">Craft chapters</span>
            <span class="clip is-gold" style="left:66%;width:28%">Teardowns</span>
          </div>
          <div class="tl-track"><span class="tl-track-label">A1</span>
            <span class="clip is-rec" style="left:10%;width:44%">Voiceover — tungsten room tone</span>
            <span class="clip" style="left:58%;width:30%">Score — low strings</span>
          </div>
          <div class="tl-playhead"></div>
        </div>
        <div class="leader-frame" data-leader-frame><b>3</b><span class="lf-label">LEADER</span></div>
      </div>
            <div class="container hero-inner">
        <span class="hero-kicker"><span class="rec" aria-hidden="true"></span>Professional AI filmmaking</span>
        <h1 id="hero-title">Make films with AI<br><span class="accent">like a studio.</span></h1>
        <p class="lede">Typing a sentence gets you a clip. Getting twelve clips to feel like one film — same faces, same world, a story worth the runtime — that's a craft. This is the craft manual: thirty chapters, a working cutting room, and every tool you'd reach for at 2 a.m. before a deadline.</p>
        <div class="btn-row hero-cta">
          <a class="btn btn-gold btn-lg" href="guides/first-short.html">Make your first short <span aria-hidden="true">&rarr;</span></a>
          <a class="hero-alt" href="cutting-room.html">or watch a scene get built in the cutting room</a>
        </div>
      </div>
    </section>

    <div class="reel-stats" role="list" aria-label="What's inside the guide">
      <span role="listitem"><b>{chapter_count}</b> chapters</span><i aria-hidden="true">&middot;</i>
      <span role="listitem"><b>{total_read}</b> of reading</span><i aria-hidden="true">&middot;</i>
      <span role="listitem"><b>47</b> prompt templates</span><i aria-hidden="true">&middot;</i>
      <span role="listitem"><b>22</b> camera moves</span><i aria-hidden="true">&middot;</i>
      <span role="listitem"><b>{model_count}</b> models compared</span><i aria-hidden="true">&middot;</i>
      <span role="listitem"><b>79</b> glossary terms</span><i aria-hidden="true">&middot;</i>
      <span role="listitem"><b>{skill_count}</b> agent skills</span>
    </div>

    {wave1}

    <section class="container tracks" aria-labelledby="tracks-h">
      {cue_tracks}
      <h2 id="tracks-h">Pick your track</h2>
      <p class="section-lede">Two ways to shoot. The craft overlaps; the prompt language doesn't. Pick the lane your film lives in.</p>
      <div class="track-grid">
        <article class="card track-card">
          <h3>Animated / Stylized</h3>
          <p>Anime, Ghibli-style, Pixar-style 3D, 2D cartoon, claymation. Cheaper to iterate, more forgiving on faces, judged in its own categories — with its own prompt register (no lens or depth-of-field language) and its own model shortlist.</p>
          <div class="btn-row">
            <a class="btn btn-sm" href="higgsfield/prompt-engineering.html">Prompt engineering</a>
            <a class="btn btn-sm" href="platforms/when-to-use-what.html">Model selection</a>
          </div>
        </article>
        <article class="card track-card">
          <h3>Photorealistic</h3>
          <p>Premium models, identity discipline, and post-production craft that passes for real. The lane for drama, action, and trailer-grade work — where every shortcut shows.</p>
          <div class="btn-row">
            <a class="btn btn-sm" href="higgsfield/soul-id-deep-dive.html">Soul ID deep dive</a>
            <a class="btn btn-sm" href="craft/character-consistency.html">Character consistency</a>
          </div>
        </article>
      </div>
    </section>

    {wave2}

<section class="container" aria-labelledby="paths-h">
      {cue_paths}
      <h2 id="paths-h">Pick your path</h2>
      <p class="section-lede">Don't read thirty chapters in order. Pick the goal that matches the film you're trying to make — each path is the shortest honest route through the guide. Tick steps off as you finish them; your progress stays in this browser.</p>
      <div class="path-list">
        <details class="path-row path-card" data-path="first-film">
          <summary class="path-summary"><span class="path-title">Your first AI film <span class="path-time">a weekend</span></span></summary>
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
        </details>
        <details class="path-row path-card" data-path="competition">
          <summary class="path-summary"><span class="path-title">Competition-ready craft <span class="path-time">2–4 weeks</span></span></summary>
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
        </details>
        <details class="path-row path-card" data-path="animated">
          <summary class="path-summary"><span class="path-title">Animated / stylized <span class="path-time">1–2 weeks</span></span></summary>
          <p>Cheaper, more forgiving, dedicated judged categories.</p>
          <div class="path-bar" aria-hidden="true"><span class="path-bar-fill"></span></div>
          <p class="path-progress"><span data-path-progress aria-live="polite">0 of 4 complete</span><button type="button" class="btn btn-sm btn-ghost" data-path-reset="animated">Reset</button></p>
          <ol class="path-steps">
            <li><input type="checkbox" class="path-check" id="pc-animated-1" data-step="animated-1" aria-label="Mark complete: Prompt engineering, animated register"><a href="higgsfield/prompt-engineering.html">Prompt engineering</a> <span class="path-note">animated register</span></li>
            <li><input type="checkbox" class="path-check" id="pc-animated-2" data-step="animated-2" aria-label="Mark complete: Cinematic language"><a href="craft/cinematic-language.html">Cinematic language</a></li>
            <li><input type="checkbox" class="path-check" id="pc-animated-3" data-step="animated-3" aria-label="Mark complete: Character consistency"><a href="craft/character-consistency.html">Character consistency</a></li>
            <li><input type="checkbox" class="path-check" id="pc-animated-4" data-step="animated-4" aria-label="Mark complete: Model selection"><a href="platforms/when-to-use-what.html">Model selection</a></li>
          </ol>
        </details>
        <details class="path-row path-card" data-path="photoreal">
          <summary class="path-summary"><span class="path-title">Photorealistic drama <span class="path-time">3–6 weeks</span></span></summary>
          <p>The premium lane: invisible AI, visible craft.</p>
          <div class="path-bar" aria-hidden="true"><span class="path-bar-fill"></span></div>
          <p class="path-progress"><span data-path-progress aria-live="polite">0 of 4 complete</span><button type="button" class="btn btn-sm btn-ghost" data-path-reset="photoreal">Reset</button></p>
          <ol class="path-steps">
            <li><input type="checkbox" class="path-check" id="pc-photoreal-1" data-step="photoreal-1" aria-label="Mark complete: Soul ID deep dive"><a href="higgsfield/soul-id-deep-dive.html">Soul ID deep dive</a></li>
            <li><input type="checkbox" class="path-check" id="pc-photoreal-2" data-step="photoreal-2" aria-label="Mark complete: Character consistency"><a href="craft/character-consistency.html">Character consistency</a></li>
            <li><input type="checkbox" class="path-check" id="pc-photoreal-3" data-step="photoreal-3" aria-label="Mark complete: Directing performance"><a href="craft/directing-performance.html">Directing performance</a></li>
            <li><input type="checkbox" class="path-check" id="pc-photoreal-4" data-step="photoreal-4" aria-label="Mark complete: Color grading"><a href="craft/color-grading.html">Color grading</a></li>
          </ol>
        </details>
        <details class="path-row path-card" data-path="longform">
          <summary class="path-summary"><span class="path-title">Long-form: 20+ minutes <span class="path-time">ongoing</span></span></summary>
          <p>Systems, not prompts. How features actually get made.</p>
          <div class="path-bar" aria-hidden="true"><span class="path-bar-fill"></span></div>
          <p class="path-progress"><span data-path-progress aria-live="polite">0 of 4 complete</span><button type="button" class="btn btn-sm btn-ghost" data-path-reset="longform">Reset</button></p>
          <ol class="path-steps">
            <li><input type="checkbox" class="path-check" id="pc-longform-1" data-step="longform-1" aria-label="Mark complete: Long-form pipelines"><a href="craft/longform-pipelines.html">Long-form pipelines</a></li>
            <li><input type="checkbox" class="path-check" id="pc-longform-2" data-step="longform-2" aria-label="Mark complete: Directing performance"><a href="craft/directing-performance.html">Directing performance</a></li>
            <li><input type="checkbox" class="path-check" id="pc-longform-3" data-step="longform-3" aria-label="Mark complete: Editing pipeline"><a href="craft/editing-pipeline.html">Editing pipeline</a></li>
            <li><input type="checkbox" class="path-check" id="pc-longform-4" data-step="longform-4" aria-label="Mark complete: Credit math, compute envelopes"><a href="economics/credit-math.html">Credit math</a> <span class="path-note">compute envelopes</span></li>
          </ol>
        </details>
        <details class="path-row path-card" data-path="first-short" open>
          <summary class="path-summary"><span class="path-title">Your first 60-second short <span class="path-time">7 days</span></span><span class="marker-flag marker-sm" aria-hidden="true">M1 · start here</span></summary>
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
        </details>
        <details class="path-row path-card" data-path="filmmaker">
          <summary class="path-summary"><span class="path-title">The 90-day filmmaker <span class="path-time">12 weeks</span></span></summary>
          <p>From first short to competition-ready entry. The advanced arc the 7-day plan feeds into — one milestone project per month.</p>
          <div class="path-bar" aria-hidden="true"><span class="path-bar-fill"></span></div>
          <p class="path-progress"><span data-path-progress aria-live="polite">0 of 12 complete</span><button type="button" class="btn btn-sm btn-ghost" data-path-reset="filmmaker">Reset</button></p>
          <ol class="path-steps">
            <li><input type="checkbox" class="path-check" id="pc-filmmaker-1" data-step="filmmaker-1" aria-label="Mark complete: Weeks 1 and 2, story foundations"><a href="craft/story-structure.html">Weeks 1&ndash;2</a> <span class="path-note">story foundations — logline + beat sheet</span></li>
            <li><input type="checkbox" class="path-check" id="pc-filmmaker-2" data-step="filmmaker-2" aria-label="Mark complete: Week 3, prompt craft"><a href="higgsfield/prompt-engineering.html">Week 3</a> <span class="path-note">prompt craft + <a href="anatomy.html">anatomy explorer</a></span></li>
            <li><input type="checkbox" class="path-check" id="pc-filmmaker-3" data-step="filmmaker-3" aria-label="Mark complete: Week 4, consistency system"><a href="craft/character-consistency.html">Week 4</a> <span class="path-note">consistency system — build a <a href="style-bible.html">style bible</a></span></li>
            <li><input type="checkbox" class="path-check" id="pc-filmmaker-4" data-step="filmmaker-4" aria-label="Mark complete: Weeks 5 and 6, directing performance"><a href="craft/directing-performance.html">Weeks 5&ndash;6</a> <span class="path-note">directing performance</span></li>
            <li><input type="checkbox" class="path-check" id="pc-filmmaker-5" data-step="filmmaker-5" aria-label="Mark complete: Week 7, first 60-second short"><a href="guides/first-short.html">Week 7</a> <span class="path-note">milestone: finished 60-second short</span></li>
            <li><input type="checkbox" class="path-check" id="pc-filmmaker-6" data-step="filmmaker-6" aria-label="Mark complete: Week 8, grade and sound"><a href="craft/color-grading.html">Week 8</a> <span class="path-note">grade + <a href="craft/sound-music-audio.html">sound</a></span></li>
            <li><input type="checkbox" class="path-check" id="pc-filmmaker-7" data-step="filmmaker-7" aria-label="Mark complete: Week 9, edit and repair"><a href="craft/editing-pipeline.html">Week 9</a> <span class="path-note">edit + <a href="doctor.html">failure doctor</a> repairs</span></li>
            <li><input type="checkbox" class="path-check" id="pc-filmmaker-8" data-step="filmmaker-8" aria-label="Mark complete: Week 10, the 3-minute short"><a href="craft/longform-pipelines.html">Week 10</a> <span class="path-note">milestone: 3-minute short</span></li>
            <li><input type="checkbox" class="path-check" id="pc-filmmaker-9" data-step="filmmaker-9" aria-label="Mark complete: Week 11, competition craft"><a href="higgsfield/competition-entry-craft.html">Week 11</a> <span class="path-note">competition-entry craft</span></li>
            <li><input type="checkbox" class="path-check" id="pc-filmmaker-10" data-step="filmmaker-10" aria-label="Mark complete: Week 12, distribution and rights"><a href="distribution/release-paths.html">Week 12</a> <span class="path-note"><a href="legal/rights-and-disclosure.html">rights</a> + release plan</span></li>
            <li><input type="checkbox" class="path-check" id="pc-filmmaker-11" data-step="filmmaker-11" aria-label="Mark complete: study the teardowns"><a href="teardown.html">Study</a> <span class="path-note">shot-by-shot teardowns, all ten films</span></li>
            <li><input type="checkbox" class="path-check" id="pc-filmmaker-12" data-step="filmmaker-12" aria-label="Mark complete: ship the entry"><a href="case-studies/entry-craft-teardowns.html">Ship</a> <span class="path-note">milestone: competition entry submitted</span></li>
          </ol>
        </details>
      </div>
    </section>

    {wave3}

    <section class="container bins" aria-labelledby="chapters-h">
      {cue_chapters}
      <h2 id="chapters-h">The full shelf</h2>
      <p class="section-lede">Thirty chapters across ten bins. Open a bin; every chapter lists its read time. The order that matters is your path's, not this one's.</p>
      {bins_section}
    </section>

    {wave4}

    <section class="container workbench" aria-labelledby="bench-h">
      {cue_bench}
      <h2 id="bench-h">The workbench</h2>
      <p class="section-lede">Four tools, no filler. Each one answers a question you'll actually ask at 2 a.m.</p>
      <div class="bench-grid">
        <a class="bench-tile" href="budget.html">
          <p class="bench-kicker">Economics</p>
          <h3>Budget calculator</h3>
          <p>What will this film actually cost? Runtime in, cost envelope out — per-clip math from the credit-math chapter.</p>
          <span class="bench-go" aria-hidden="true">Open <span>&rarr;</span></span>
        </a>
        <a class="bench-tile" href="workshop.html">
          <p class="bench-kicker">Craft</p>
          <h3>Prompt workshop</h3>
          <p>A pro prompt in sixty seconds. Pick a template, pick a model, learn why it works, copy it.</p>
          <span class="bench-go" aria-hidden="true">Open <span>&rarr;</span></span>
        </a>
        <a class="bench-tile" href="prompts.html">
          <p class="bench-kicker">Library</p>
          <h3>Prompt library</h3>
          <p>All 47 templates, filterable by shot, camera move, lighting, and mood. Remix and send to the Studio.</p>
          <span class="bench-go" aria-hidden="true">Open <span>&rarr;</span></span>
        </a>
        <a class="bench-tile" href="api.html">
          <p class="bench-kicker">Machine-readable</p>
          <h3>For agents</h3>
          <p>Versioned JSON: {model_count} model records, 47 templates, the 22-move camera lexicon, checklists, glossary — with schemas and llms.txt.</p>
          <span class="bench-go" aria-hidden="true">Open <span>&rarr;</span></span>
        </a>
      </div>
    </section>

    <section class="container curator" aria-labelledby="curator-h">
      {cue_curator}
      <h2 id="curator-h">From the cutting room</h2>
      <div class="curator-note">
        <span class="marker-flag" aria-hidden="true">M1 &middot; good take</span>
        <p>If you read one chapter this week, make it <a href="higgsfield/prompt-engineering.html">prompt engineering</a>. Everything downstream — the budget, the edit, the grade — gets cheaper when the prompt is right on the first take. And skip the model-comparison rabbit hole until you've finished three clips on whatever you already have. The model is never the reason the film is bad; the cut is.</p>
        <p class="curator-sign">&mdash; the editor</p>
      </div>
    </section>
  </main>

<footer class="site-footer">
    <div class="container footer-grid">
      <p>AI Film Master Guide — research notes for professional AI filmmaking. Sources linked per chapter.</p>
      <nav aria-label="Footer">{footer}</nav>
      <div class="footer-colophon"><span class="tc">TC 00:00:00:00</span><span class="tailpop">Tail pop</span><span>Cut in the cutting room</span><span class="tail">AI Film Master Guide — craft, not buttons</span></div>
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
  <script src="assets/js/identity.js"></script>
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
  <div class="edge-right" aria-hidden="true"></div>
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
      <span class="hdr-tc" data-hdr-tc aria-hidden="true"><span class="hdr-rec">●</span> <span class="hdr-tc-val">00:59:52:00</span></span>
      <button type="button" class="btn btn-sm btn-ghost palette-open" aria-label="Search the guide (Ctrl+K)">
        <span aria-hidden="true">⌘K</span> Search
      </button>
    </div>
  </header>
  <main id="main">
    {hero}
    <section class="container" aria-label="Skills">
      <div id="skills-list"></div>
      <div class="empty-state" id="skills-empty" hidden><span class="es-slate">No footage</span><p>No skills match that filter.</p></div>
      <p class="calc-note" style="margin-bottom:var(--space-7);">Skills live in <code>skills/</code> in the repo and are indexed by <code>skills/index.json</code>. Agents: <code>data/v1/index.json</code> points here.</p>
    </section>
  </main>
  <footer class="site-footer">
    <div class="container footer-grid">
      <p>AI Film Master Guide — research notes for professional AI filmmaking. Sources linked per chapter.</p>
      <nav aria-label="Footer">{footer}</nav>
      <div class="footer-colophon"><span class="tc">TC 00:00:00:00</span><span class="tailpop">Tail pop</span><span>Cut in the cutting room</span><span class="tail">AI Film Master Guide — craft, not buttons</span></div>
    </div>
  </footer>
  <script src="assets/js/skills.js"></script>
  <script src="assets/js/docs.js"></script>
  <script src="assets/js/identity.js"></script>
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
  <div class="edge-right" aria-hidden="true"></div>
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
      <span class="hdr-tc" data-hdr-tc aria-hidden="true"><span class="hdr-rec">●</span> <span class="hdr-tc-val">00:59:52:00</span></span>
      <button type="button" class="btn btn-sm btn-ghost palette-open" aria-label="Search the guide (Ctrl+K)">
        <span aria-hidden="true">⌘K</span> Search
      </button>
    </div>
  </header>
  <main id="main">
    {hero}
    <section class="container" aria-labelledby="calc-h">
      <h2 id="calc-h">Your production <span class="api-badge" id="b-api-badge" data-api-state="none" role="status" tabindex="0"></span></h2>
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
          <p class="calc-note">Per-clip costs come from the guide's pricing table — the Watchtower API serves it live when it can, otherwise the last published copy. The envelope budgets the rejects, not just the hero renders. Verify live before budgeting.</p>
          <p class="calc-note" id="b-provenance">Rates: built-in estimates (Oct 2026).</p>
          <p style="margin-top:var(--space-4);"><a class="btn" href="optimizer.html">Plan a full production → budget optimizer</a></p>
        </div>
      </div>
    </section>
  </main>
  <footer class="site-footer">
    <div class="container footer-grid">
      <p>AI Film Master Guide — research notes for professional AI filmmaking. Sources linked per chapter.</p>
      <nav aria-label="Footer">{footer}</nav>
      <div class="footer-colophon"><span class="tc">TC 00:00:00:00</span><span class="tailpop">Tail pop</span><span>Cut in the cutting room</span><span class="tail">AI Film Master Guide — craft, not buttons</span></div>
    </div>
  </footer>
  <script src="assets/js/api-client.js"></script>
  <script src="assets/js/budget.js"></script>
  <script src="assets/js/docs.js"></script>
  <script src="assets/js/identity.js"></script>
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
  <div class="edge-right" aria-hidden="true"></div>
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
      <span class="hdr-tc" data-hdr-tc aria-hidden="true"><span class="hdr-rec">●</span> <span class="hdr-tc-val">00:59:52:00</span></span>
      <button type="button" class="btn btn-sm btn-ghost palette-open" aria-label="Search the guide (Ctrl+K)">
        <span aria-hidden="true">⌘K</span> Search
      </button>
    </div>
  </header>
  <main id="main">
    {hero}
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
      <div class="footer-colophon"><span class="tc">TC 00:00:00:00</span><span class="tailpop">Tail pop</span><span>Cut in the cutting room</span><span class="tail">AI Film Master Guide — craft, not buttons</span></div>
    </div>
  </footer>
  <script src="assets/js/palette.js"></script>
  <script src="assets/js/optimizer.js"></script>
  <script src="assets/js/docs.js"></script>
  <script src="assets/js/identity.js"></script>
</body>
</html>
"""

DOCTOR_TMPL = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Failure doctor — AI Film Master Guide</title>
  <meta name="description" content="Something broke in your AI footage? Pick the symptom — face morphing, dead eyes, plasticky skin, flat acting — and get the craft diagnosis, the fix, and the repair template.">
  {css}
</head>
<body>
  <div class="edge-right" aria-hidden="true"></div>
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
      <span class="hdr-tc" data-hdr-tc aria-hidden="true"><span class="hdr-rec">●</span> <span class="hdr-tc-val">00:59:52:00</span></span>
      <button type="button" class="btn btn-sm btn-ghost palette-open" aria-label="Search the guide (Ctrl+K)">
        <span aria-hidden="true">⌘K</span> Search
      </button>
    </div>
  </header>
  <main id="main">
    {hero}
    <section class="container" aria-labelledby="doc-pick-h">
      <h2 id="doc-pick-h">What are you seeing?</h2>
      <div class="doc-grid" id="doc-grid" role="group" aria-label="Failure symptoms"></div>
      <p class="empty-state" id="doc-grid-empty">Loading diagnoses…</p>
      <p class="empty-state" id="doc-error" hidden></p>
    </section>
    <section class="container" aria-label="Diagnosis" style="margin-top:var(--space-6);">
      <div id="doc-panel" aria-live="polite">
        <p class="calc-note">Pick a symptom above — the diagnosis appears here.</p>
      </div>
      <p style="margin-top:var(--space-5);"><a class="btn btn-ghost" href="craft/failure-gallery.html">Read the full failure gallery →</a></p>
    </section>
  </main>
  <footer class="site-footer">
    <div class="container footer-grid">
      <p>AI Film Master Guide — research notes for professional AI filmmaking. Sources linked per chapter.</p>
      <nav aria-label="Footer">{footer}</nav>
      <div class="footer-colophon"><span class="tc">TC 00:00:00:00</span><span class="tailpop">Tail pop</span><span>Cut in the cutting room</span><span class="tail">AI Film Master Guide — craft, not buttons</span></div>
    </div>
  </footer>
  <script src="assets/js/palette.js"></script>
  <script src="assets/js/doctor.js"></script>
  <script src="assets/js/docs.js"></script>
  <script src="assets/js/identity.js"></script>
</body>
</html>
"""

EPISODEPLANNER_TMPL = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Episode planner — AI Film Master Guide</title>
  <meta name="description" content="Plan an AI mini-drama series: series setup with locked character bible, per-episode blocks (emotion, beats, turn, cliffhanger), and an arc tracker with lessons learned. Saves in your browser.">
  {css}
  <style>
    .cast-row {{ display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: var(--space-3); align-items: end; border-top: 1px solid var(--line); padding-top: var(--space-3); }}
    .cast-row:first-of-type {{ border-top: 0; padding-top: 0; }}
    @media (max-width: 720px) {{ .cast-row {{ grid-template-columns: 1fr; }} }}
    .log-entry {{ margin-bottom: var(--space-4); }}
    .log-entry .log-label {{ font-weight: 700; color: var(--gold); }}
    .log-entry .log-meta {{ color: var(--muted); font-size: 0.85rem; }}
    .log-list {{ list-style: none; padding: 0; margin: 0; }}
    .hg-card {{ margin-bottom: var(--space-5); }}
    .hg-caption {{ white-space: pre-wrap; word-break: break-word; }}
    .hg-num {{ display: inline-block; min-width: 1.6em; text-align: center; background: var(--gold); color: #111; border-radius: 999px; font-size: 0.85em; margin-right: 0.4em; }}
    .hg-why {{ border-left: 3px solid var(--gold); padding-left: var(--space-3); }}
    .epf-formats {{ display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-2); }}
    @media (max-width: 720px) {{ .epf-formats {{ grid-template-columns: 1fr; }} }}
    .epf-radio {{ display: block; border: 1px solid var(--line); border-radius: var(--radius-s); padding: var(--space-2) var(--space-3); cursor: pointer; }}
    .epf-radio:has(input:checked) {{ border-color: var(--gold); background: color-mix(in srgb, var(--gold) 8%, transparent); }}
    .epf-radio input {{ margin-right: var(--space-2); }}
    .epf-hint {{ display: block; color: var(--muted); font-size: 0.85rem; }}
  </style>
</head>
<body>
  <div class="edge-right" aria-hidden="true"></div>
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
      <span class="hdr-tc" data-hdr-tc aria-hidden="true"><span class="hdr-rec">●</span> <span class="hdr-tc-val">00:59:52:00</span></span>
      <button type="button" class="btn btn-sm btn-ghost palette-open" aria-label="Search the guide (Ctrl+K)">
        <span aria-hidden="true">⌘K</span> Search
      </button>
    </div>
  </header>
  <main id="main">
    {hero}
    <section class="container" aria-labelledby="eps-h">
      <h2 id="eps-h">1 · Series setup — lock the bible</h2>
      <form class="card calc-form" aria-label="Series setup" onsubmit="return false;">
        <div class="field">
          <label for="ep-title">Series title</label>
          <input class="input" type="text" id="ep-title" placeholder="e.g. The Taxi Home">
        </div>
        <div class="field">
          <label for="ep-logline">Logline — the arc in one sentence</label>
          <input class="input" type="text" id="ep-logline" placeholder="e.g. A brave toddler crosses the city alone to find her daddy">
        </div>
        <div class="field">
          <label for="ep-hashtag">Series hashtag</label>
          <input class="input" type="text" id="ep-hashtag" placeholder="#taxihome">
        </div>
        <fieldset>
          <legend>Recurring cast — name + voice + one-line anchor per character</legend>
          <div id="ep-cast-list"></div>
          <button type="button" class="btn btn-ghost btn-sm" id="ep-cast-add" style="margin-top:var(--space-3);">+ Add character</button>
        </fieldset>
        <div class="btn-row">
          <button type="button" class="btn" id="ep-save-series">Lock series</button>
          <button type="button" class="btn btn-ghost" id="ep-clear-series">Delete saved series</button>
        </div>
        <p class="calc-note" id="ep-series-msg" role="status" hidden></p>
      </form>
    </section>
    <section class="container" aria-labelledby="epb-h" style="margin-top:var(--space-6);">
      <h2 id="epb-h">2 · Episode block — one emotion, one turn, one cliffhanger</h2>
      <form class="card calc-form" aria-label="Episode block" onsubmit="return false;">
        <fieldset>
          <legend>Format preset — pre-fills the block skeleton</legend>
          <div class="epf-formats" role="radiogroup" aria-label="Series format">
            <label class="epf-radio"><input type="radio" name="epf-format" value="minidrama" checked> Mini-drama<span class="epf-hint">One emotion, soap-opera pacing, 60–150s</span></label>
            <label class="epf-radio"><input type="radio" name="epf-format" value="pov"> POV series<span class="epf-hint">"You" are the protagonist, 30–90s</span></label>
            <label class="epf-radio"><input type="radio" name="epf-format" value="daylife"> Day-in-the-life<span class="epf-hint">Recurring character, one small event, 15–60s</span></label>
            <label class="epf-radio"><input type="radio" name="epf-format" value="revenge"> Revenge arc<span class="epf-hint">The justice ladder, 60–150s</span></label>
            <label class="epf-radio"><input type="radio" name="epf-format" value="interactive"> Interactive<span class="epf-hint">Comment-poll-driven episodes, 60–150s</span></label>
            <label class="epf-radio"><input type="radio" name="epf-format" value="custom"> Custom<span class="epf-hint">Blank block, 60–150s band</span></label>
          </div>
          <button type="button" class="btn btn-ghost btn-sm" id="epf-apply" style="margin-top:var(--space-3);">Apply format template</button>
        </fieldset>
        <div class="field">
          <label for="epb-num">Episode number</label>
          <input class="input" type="number" id="epb-num" min="1" step="1" value="1">
        </div>
        <div class="field">
          <label for="epb-emotion">Emotion — one word</label>
          <input class="input" type="text" id="epb-emotion" list="epb-emotion-list" autocomplete="off" placeholder="e.g. longing">
          <datalist id="epb-emotion-list">
            <option value="longing"></option>
            <option value="dread"></option>
            <option value="grief"></option>
            <option value="relief"></option>
            <option value="triumph"></option>
            <option value="suspense"></option>
            <option value="comfort"></option>
            <option value="heartbreak"></option>
            <option value="defiance"></option>
            <option value="tenderness"></option>
            <option value="guilt"></option>
            <option value="joy"></option>
          </datalist>
          <span class="epf-hint">One emotion per episode — the save gate refuses a block that reads as two.</span>
        </div>
        <div class="field">
          <label for="epb-stake">One-line emotional stake</label>
          <input class="input" type="text" id="epb-stake" placeholder="e.g. Mia took a taxi alone to find her daddy">
        </div>
        <div class="field">
          <label for="epb-hook">Hook visual — the first 3 seconds</label>
          <input class="input" type="text" id="epb-hook" placeholder="e.g. Toddler alone in the back of a night taxi, city lights">
        </div>
        <fieldset>
          <legend>Beats — 3 to 5</legend>
          <div id="epb-beats"></div>
          <button type="button" class="btn btn-ghost btn-sm" id="epb-beat-add" style="margin-top:var(--space-3);">+ Add beat</button>
        </fieldset>
        <div class="field">
          <label for="epb-turn">Emotional turn — which beat, and what changes</label>
          <input class="input" type="text" id="epb-turn" placeholder="e.g. Beat 4: the driver realizes she's not lost — she's determined">
        </div>
        <div class="field">
          <label for="epb-cliff">Cliffhanger — the unanswered beat. Never the resolution.</label>
          <input class="input" type="text" id="epb-cliff" placeholder="e.g. The taxi stops at the wrong address — headlights, cut">
          <div class="field" style="margin-top:var(--space-2);">
            <label for="epb-cliff-tpl">…or start from a template (<span class="mono">{{name}}</span> fills from the cast)</label>
            <select class="input" id="epb-cliff-tpl"></select>
            <button type="button" class="btn btn-ghost btn-sm" id="epb-cliff-apply" style="margin-top:var(--space-2);">Use template</button>
          </div>
        </div>
        <div class="field">
          <label for="epb-scenes">Keyframe scenes — hook / beat / turn / cliffhanger</label>
          <input class="input" type="text" id="epb-scenes" placeholder="e.g. taxi night exterior; Mia clutching coat; driver sees her; wrong-address stop">
        </div>
        <fieldset>
          <legend>Runtime estimator — beats × seconds-per-beat vs the dialogue budget</legend>
          <div class="field">
            <label for="epf-spb">Seconds per beat</label>
            <input class="input" type="number" id="epf-spb" min="5" max="45" step="1" value="15">
          </div>
          <p class="calc-note" id="epf-runtime" role="status">Add beats above to estimate the runtime.</p>
        </fieldset>
        <div class="btn-row">
          <button type="button" class="btn" id="epb-save">Save episode block</button>
          <button type="button" class="btn btn-ghost" id="epb-new">New blank block</button>
          <button type="button" class="btn btn-ghost" id="epb-caption-draft">Draft caption from block</button>
        </div>
        <pre class="hg-caption" id="epb-caption-out" hidden aria-live="polite" style="margin-top:var(--space-3);"></pre>
        <div class="btn-row" id="epb-caption-row" hidden style="margin-top:var(--space-2);">
          <button type="button" class="btn btn-ghost btn-sm" id="epb-caption-copy">Copy caption</button>
        </div>
        <p class="calc-note" id="epb-msg" role="status" hidden></p>
      </form>
      <h3 style="margin-top:var(--space-5);">Saved blocks — your series so far</h3>
      <ul class="log-list" id="epb-blocks" aria-live="polite"></ul>
      <p class="empty-state" id="epb-blocks-empty">No saved blocks yet — write a block above and save it.</p>
      <p>
        <button type="button" class="btn" id="epb-send-series" disabled>Send series to Studio →</button>
        <button type="button" class="btn btn-ghost" id="epb-send-run" disabled>Send run to Studio →</button>
      </p>
      <p class="calc-note">One click stages the whole saved series (title, logline, cast anchors, every block's format/runtime/beats) into the Studio — which pre-fills a series packet: per-episode shot budgets, the locked series bible, and reuse math. <strong>Send run to Studio</strong> stages episode count + median runtime per episode into the Studio's <strong>microdrama mode</strong> instead: clip budget, the $50/min benchmark, the 3–5× retake budget, the regen reserve, and the documented-pace timeline — economics only, no shot packet. Nothing leaves your browser.</p>
    </section>
    <section class="container" aria-labelledby="epl-h" style="margin-top:var(--space-6);">
      <h2 id="epl-h">3 · Arc tracker — the log that makes the series smarter</h2>
      <ul class="log-list" id="epl-list" aria-live="polite"></ul>
      <p class="empty-state" id="epl-empty">No log entries yet — ship an episode, then write what it taught you.</p>
      <form class="card calc-form" aria-label="Add an arc log entry" onsubmit="return false;" style="margin-top:var(--space-5);">
        <div class="field">
          <label for="epl-ep">Episode</label>
          <input class="input" type="number" id="epl-ep" min="1" step="1" value="1">
        </div>
        <div class="field">
          <label for="epl-title">Episode title (optional)</label>
          <input class="input" type="text" id="epl-title" placeholder="e.g. The Wrong Address">
        </div>
        <div class="field">
          <label for="epl-lesson">Lesson learned — story, timing, or production</label>
          <textarea class="input" id="epl-lesson" rows="3" placeholder="e.g. Turn landed flat: the driver reveal needed its own keyframe, not a borrowed beat shot."></textarea>
        </div>
        <div class="btn-row">
          <button type="button" class="btn" id="epl-add">Append to log</button>
        </div>
      </form>
      <p class="calc-note">Gate G8: the episode isn't shipped until the log and a lesson are appended — and the bible never changes mid-series.</p>
    </section>
  </main>
  <footer class="site-footer">
    <div class="container footer-grid">
      <p>AI Film Master Guide — research notes for professional AI filmmaking. Sources linked per chapter.</p>
      <nav aria-label="Footer">{footer}</nav>
      <div class="footer-colophon"><span class="tc">TC 00:00:00:00</span><span class="tailpop">Tail pop</span><span>Cut in the cutting room</span><span class="tail">AI Film Master Guide — craft, not buttons</span></div>
    </div>
  </footer>
  <script src="assets/js/palette.js"></script>
  <script src="assets/js/episode-planner.js"></script>
  <script src="assets/js/docs.js"></script>
  <script src="assets/js/identity.js"></script>
</body>
</html>
"""

HOOKGEN_TMPL = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Hook-title generator — AI Film Master Guide</title>
  <meta name="description" content="Build hook-title captions from the observed formula: Episode N + one-line emotional stake + CTA. Six worked variants per input, each with a why-this-hooks note.">
  {css}
  <style>
    .hg-card {{ margin-bottom: var(--space-5); }}
    .hg-caption {{ white-space: pre-wrap; word-break: break-word; }}
    .hg-num {{ display: inline-block; min-width: 1.6em; text-align: center; background: var(--gold); color: #111; border-radius: 999px; font-size: 0.85em; margin-right: 0.4em; }}
    .hg-why {{ border-left: 3px solid var(--gold); padding-left: var(--space-3); }}
  </style>
</head>
<body>
  <div class="edge-right" aria-hidden="true"></div>
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
      <span class="hdr-tc" data-hdr-tc aria-hidden="true"><span class="hdr-rec">●</span> <span class="hdr-tc-val">00:59:52:00</span></span>
      <button type="button" class="btn btn-sm btn-ghost palette-open" aria-label="Search the guide (Ctrl+K)">
        <span aria-hidden="true">⌘K</span> Search
      </button>
    </div>
  </header>
  <main id="main">
    {hero}
    <section class="container" aria-labelledby="hg-in-h">
      <h2 id="hg-in-h">Your episode</h2>
      <form class="card calc-form" aria-label="Hook inputs" onsubmit="return false;">
        <div class="field">
          <label for="hg-num">Episode number</label>
          <input class="input" type="number" id="hg-num" min="1" step="1" value="1">
        </div>
        <div class="field">
          <label for="hg-character">Character name</label>
          <input class="input" type="text" id="hg-character" placeholder="e.g. Mia">
        </div>
        <div class="field">
          <label for="hg-stake">One-line emotional stake</label>
          <input class="input" type="text" id="hg-stake" placeholder="e.g. took a taxi alone to find her daddy">
        </div>
        <div class="field">
          <label for="hg-cta">CTA style</label>
          <select class="input" id="hg-cta">
            <option value="tomorrow" selected>Next-part tease — "part N+1 tomorrow"</option>
            <option value="funnel">Funnel tease — longer cut elsewhere</option>
            <option value="thesis">Finale — thesis line instead of tease</option>
            <option value="poll">Interactive — vote in the comments (TikTok poll)</option>
          </select>
        </div>
        <div class="field">
          <label for="hg-hashtag">Series hashtag (optional)</label>
          <input class="input" type="text" id="hg-hashtag" placeholder="#taxihome">
        </div>
        <div class="btn-row">
          <button type="button" class="btn" id="hg-generate">Generate hooks</button>
        </div>
        <p class="calc-note" id="hg-status" role="status" hidden></p>
      </form>
    </section>
    <section class="container" aria-labelledby="hg-out-h" style="margin-top:var(--space-6);">
      <h2 id="hg-out-h">Six variants</h2>
      <p class="empty-state" id="hg-empty">Fill in the episode and stake above — six worked captions appear here.</p>
      <div id="hg-results" aria-live="polite"></div>
    </section>
  </main>
  <footer class="site-footer">
    <div class="container footer-grid">
      <p>AI Film Master Guide — research notes for professional AI filmmaking. Sources linked per chapter.</p>
      <nav aria-label="Footer">{footer}</nav>
      <div class="footer-colophon"><span class="tc">TC 00:00:00:00</span><span class="tailpop">Tail pop</span><span>Cut in the cutting room</span><span class="tail">AI Film Master Guide — craft, not buttons</span></div>
    </div>
  </footer>
  <script src="assets/js/palette.js"></script>
  <script src="assets/js/hook-gen.js"></script>
  <script src="assets/js/docs.js"></script>
  <script src="assets/js/identity.js"></script>
</body>
</html>
"""

STUDIO_TMPL = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Studio — plan my AI film — AI Film Master Guide</title>
  <meta name="description" content="Studio 2.0: the AI-film studio simulator. A standalone film (title, logline, genre/mood, runtime, quality tier) or a serialized series (3–10 episodes, one of the 5 proven serialized formats) in — a deterministic production packet out: shot list with per-shot prompts from the 47-template library, per-shot model picks with real cost math, budget table with 5×/20× envelopes, shooting schedule, series bible with locked prompt DNA, self-contained HTML packet export. Or plan a microdrama run: clip budget, $50/min benchmark, 3–5× retake budget, regen reserve, timeline — all from the documented $150-microdrama figures.">
  {css}
  <style>
    .radio-row {{ display: flex; flex-wrap: wrap; gap: var(--space-3); }}
    .radio-pill {{ display: inline-flex; align-items: center; gap: var(--space-2); border: 1px solid var(--line); border-radius: 999px; padding: var(--space-2) var(--space-4); cursor: pointer; }}
    .radio-pill input {{ accent-color: var(--gold); }}
    .radio-pill:has(input:checked) {{ border-color: var(--gold); background: color-mix(in srgb, var(--gold) 12%, transparent); }}
    .radio-pill:has(input:focus-visible) {{ outline: 2px solid var(--gold); outline-offset: 2px; }}
    .st-kinds {{ display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-2); }}
    @media (max-width: 720px) {{ .st-kinds {{ grid-template-columns: 1fr; }} }}
    .st-kinds .radio-pill {{ align-items: flex-start; border-radius: var(--radius-s); }}
    .st-hint {{ display: block; color: var(--muted); font-size: 0.85rem; }}
    .st-cast-row {{ display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: var(--space-3); align-items: end; border-top: 1px solid var(--line); padding-top: var(--space-3); }}
    .st-cast-row:first-of-type {{ border-top: 0; padding-top: 0; }}
    @media (max-width: 720px) {{ .st-cast-row {{ grid-template-columns: 1fr; }} }}
    .st-kicker {{ color: var(--gold); text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.8rem; }}
    .st-shot {{ margin-bottom: var(--space-4); }}
    .st-shot h4 {{ margin-top: 0; }}
    .st-tid {{ color: var(--muted); font-weight: 400; font-size: 0.85em; }}
    .st-meta {{ color: var(--muted); font-size: 0.9rem; }}
    .st-anatomy {{ border-left: 3px solid var(--gold); padding-left: var(--space-3); font-size: 0.92rem; }}
    .st-track {{ color: var(--muted); }}
    .st-prompt {{ white-space: pre-wrap; word-break: break-word; background: var(--bg-raise); border: 1px solid var(--line); border-radius: var(--radius); padding: var(--space-3); font-size: 0.92rem; }}
    .st-note {{ font-size: 0.9rem; color: var(--muted); }}
    .st-badge {{ display: inline-block; font-size: 0.78rem; border: 1px solid var(--gold); color: var(--gold); border-radius: 999px; padding: 0.1em 0.7em; margin-left: 0.4em; }}
    .st-math {{ font-variant-numeric: tabular-nums; font-size: 0.88rem; color: var(--muted); }}
    #st-actions .btn-row {{ margin-top: var(--space-4); }}
    @media (prefers-reduced-motion: reduce) {{
      * {{ scroll-behavior: auto !important; }}
    }}
    @media print {{
      .site-header, .site-footer, .skip-link, #st-form-sec, #st-saved-sec, #st-actions, #st-optimize-sec {{ display: none !important; }}
      .hero {{ padding: var(--space-4) 0; }}
      .st-shot {{ break-inside: avoid; }}
      body {{ background: #fff; color: #000; }}
    }}
    /* ---- Studio 3.0 styles ---- */
    /* Studio 3.0 — Shot Refinery + plan sharing styles (moved from JS injection) */
    dialog.st3-dialog{{border:1px solid var(--line);border-radius:var(--radius);
     background:var(--bg);color:inherit;padding:0;width:min(46rem,94vw)}}
    dialog.st3-dialog::backdrop{{background:rgba(0,0,0,.6)}}
    .st3-dlg-wrap{{display:flex;flex-direction:column;max-height:92vh}}
    .st3-dlg-head{{padding:var(--space-4) var(--space-5) 0}}
    .st3-dlg-head h3{{margin:0 0 var(--space-2)}}
    .st3-dlg-body{{padding:var(--space-2) var(--space-5);overflow:auto}}
    .st3-dlg-body h4{{margin:var(--space-4) 0 var(--space-2)}}
    .st3-dlg-foot{{padding:var(--space-4) var(--space-5);border-top:1px solid var(--line);
     display:flex;gap:var(--space-3);flex-wrap:wrap}}
    .st3-field{{margin:0 0 var(--space-4)}}
    .st3-field>label{{display:block;font-weight:600;margin-bottom:var(--space-1)}}
    .st3-field .st-hint{{display:block;font-weight:400;color:var(--muted);font-size:.85rem}}
    .st3-field textarea,.st3-field select,.st3-field input[type=text]{{width:100%;font:inherit;
     color:inherit;background:var(--bg-raise);border:1px solid var(--line);
     border-radius:var(--radius-s);padding:var(--space-2) var(--space-3)}}
    .st3-preview{{background:var(--bg-raise);border:1px solid var(--line);
     border-radius:var(--radius-s);padding:var(--space-3);white-space:pre-wrap;
     word-break:break-word;font-size:.92rem;max-height:16rem;overflow:auto;margin:0}}
    .st3-history{{list-style:none;padding:0;margin:0}}
    .st3-history li{{border-top:1px solid var(--line);padding:var(--space-2) 0;font-size:.9rem}}
    nav.st3-pnav{{position:sticky;top:0;z-index:20;background:var(--bg);
     border-bottom:1px solid var(--line);padding:var(--space-2) 0;margin-bottom:var(--space-4)}}
    nav.st3-pnav ul{{list-style:none;display:flex;gap:var(--space-1);margin:0;padding:0;
     overflow-x:auto;scrollbar-width:thin}}
    nav.st3-pnav a{{display:inline-block;padding:var(--space-1) var(--space-3);white-space:nowrap;
     border:1px solid var(--line);border-radius:999px;font-size:.85rem;text-decoration:none;color:inherit}}
    nav.st3-pnav a[aria-current=\"true\"]{{border-color:var(--gold);color:var(--gold)}}
    .st3-progress{{position:fixed;top:0;left:0;z-index:60;height:3px;width:100%;
     background:var(--gold);transform:scaleX(0);transform-origin:0 50%;pointer-events:none}}
    @supports (animation-timeline:scroll()){{
     .st3-progress{{animation:st3-progressbar linear both;animation-timeline:scroll()}}
     @keyframes st3-progressbar{{to{{transform:scaleX(1)}}}}}}
    @media (prefers-reduced-motion:reduce){{.st3-progress{{display:none}}}}
    .st3-shots{{container-type:inline-size;display:grid;gap:var(--space-4);
     grid-template-columns:minmax(0,1fr)}}
    .st3-shots .st-shot{{margin-bottom:0}}
    @container (min-width:58rem){{.st3-shots{{grid-template-columns:1fr 1fr}}}}
    .st3-share-json{{width:100%;min-height:9rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
     font-size:.8rem;background:var(--bg-raise);color:inherit;border:1px solid var(--line);
     border-radius:var(--radius-s);padding:var(--space-3)}}
    .st3-err{{color:#e5484d;font-weight:600}}
    /* Motion tokens (web-craft round 1, motion-system finding): durations +
       named easings as custom properties; 500ms max on UI interactions. */
    :root{{--st3-dur-fast:120ms;--st3-dur-base:200ms;--st3-dur-slow:480ms;
     --st3-ease-standard:cubic-bezier(.2,0,0,1);--st3-ease-out:cubic-bezier(0,0,0,1)}}
    /* Dialog entry: opacity + small rise, decelerating ease-out, 200ms base.
       Reduced-motion users get no travel (variant, not kill switch — the
       dialog still opens instantly). Transform + opacity only. */
    @media (prefers-reduced-motion:no-preference){{
     dialog.st3-dialog{{animation:st3-in var(--st3-dur-base) var(--st3-ease-out)}}
     @keyframes st3-in{{from{{opacity:0;transform:translateY(10px)}}}}}}
    .st3-dlg-head h3{{text-wrap:balance}}
    /* Auto-growing refinery textareas (field-sizing:content, Baseline Jun 2026;
       unsupported browsers keep rows=2). Scoped to the refinery dialog — the
       share dialog's JSON textareas keep their fixed heights. */
    #st3-dialog .st3-field textarea{{field-sizing:content}}
    /* Tactile hover: 120ms ease-out lift, transform only. */
    .st3-pnav a,.st3-refine{{transition:transform var(--st3-dur-fast) var(--st3-ease-out)}}
    @media (hover:hover){{.st3-pnav a:hover,.st3-refine:hover{{transform:translateY(-1px)}}}}
    .st3-pnav a:focus-visible,.st3-refine:focus-visible{{outline:2px solid var(--gold);outline-offset:2px}}
    /* Long shot lists stay fast: skip off-screen cards (content-visibility),
       reserving ~26rem so scroll position never jumps. */
    .st3-shots .st-shot{{content-visibility:auto;contain-intrinsic-size:auto 26rem}}
  </style>
</head>
<body>
  <div class="edge-right" aria-hidden="true"></div>
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
      <span class="hdr-tc" data-hdr-tc aria-hidden="true"><span class="hdr-rec">●</span> <span class="hdr-tc-val">00:59:52:00</span></span>
      <button type="button" class="btn btn-sm btn-ghost palette-open" aria-label="Search the guide (Ctrl+K)">
        <span aria-hidden="true">⌘K</span> Search
      </button>
    </div>
  </header>
  <main id="main">
    <section class="hero hero-cutroom" aria-labelledby="st-title-h">
      <div class="tl-deck" aria-hidden="true">
        <div class="tl-chrome">
          <span class="tl-rec"><i></i>REC</span>
          <span class="tl-tc-live" data-tl-tc>00:00:04:00</span>
          <span class="tl-pop">2-POP 01:00:06:00 &#183; &#x223F;1kHz</span>
          <span class="tl-title">STUDIO_03 — PRODUCTION_PACKET</span>
        </div>
        <div class="tl-ruler">
          <span style="left:0%">00:00:00:00</span><span style="left:20%">00:00:12:00</span><span style="left:40%">00:00:24:00</span><span style="left:60%">00:00:36:00</span><span style="left:80%">00:00:48:00</span><span style="left:100%">00:01:00:00</span>
        </div>
        <div class="tl-tracks">
          <div class="tl-track"><span class="tl-track-label">V2</span>
            <span class="clip is-blue" style="left:6%;width:22%">Reference frames</span>
            <span class="clip is-blue" style="left:34%;width:20%">Style selects</span>
          </div>
          <div class="tl-track"><span class="tl-track-label">V1</span>
            <span class="clip is-gold" style="left:2%;width:28%">Shot list</span>
            <span class="clip is-gold" style="left:34%;width:24%">Budget pass</span>
            <span class="clip is-gold" style="left:62%;width:30%">Schedule + bible</span>
          </div>
          <div class="tl-track"><span class="tl-track-label">A1</span>
            <span class="clip is-rec" style="left:8%;width:40%">Plan narration</span>
            <span class="clip " style="left:52%;width:34%">Score — low strings</span>
          </div>
          <div class="tl-playhead"></div>
        </div>
        <div class="leader-frame" data-leader-frame><b>3</b><span class="lf-label">LEADER</span></div>
      </div>
      <div class="container hero-inner">
        <span class="hero-kicker"><span class="rec" aria-hidden="true"></span>Tools · Flagship</span>
        <h1 id="st-title-h">The Studio<span class="accent">.</span></h1>
        <p class="lede">Plan my AI film — or my AI series — or my microdrama run. A standalone film (title, logline, genre and mood, target runtime, quality tier) or a serialized series (3–10 episodes in one of the five proven serialized formats) in — and the Studio builds the production packet: a shot list with per-shot prompts written from the guide's 47-template library, a model pick for every shot with the real credit math, a budget table that shows its work, and a shooting schedule. A <strong>microdrama run</strong> in — and the Studio plans the run's economics from the documented $150-microdrama figures: clip budget (10–15s clip units), per-episode and run budgets against the $50/min benchmark, the 3–5× "drawing cards" retake budget, a character-regen reserve, and a timeline from the documented 4-days-for-4-episodes pace. Series get a locked bible with prompt DNA that keeps every episode consistent, plus a self-contained HTML packet you can hand to a collaborator. Every number traces back to <code>models.json</code> or a documented figure — ranges, not promises.</p>
      </div>
    </section>
    <section class="container" aria-labelledby="st-in-h" id="st-form-sec">
      <h2 id="st-in-h">Your concept</h2>
      <p class="calc-note" id="st-import-msg" role="status" hidden></p>
      <div class="card" id="st-prompt-msg" role="status" hidden style="margin-bottom:var(--space-4);"></div>
      <form class="card calc-form" aria-label="Film or series concept" onsubmit="return false;">
        <fieldset>
          <legend>Project type</legend>
          <div class="st-kinds" role="radiogroup" aria-label="Project type">
            <label class="radio-pill"><input type="radio" name="st-kind" value="film" checked> Standalone film<span class="st-hint">one production packet, runtime 30s–10min</span></label>
            <label class="radio-pill"><input type="radio" name="st-kind" value="minidrama"> Series — mini-drama<span class="st-hint">60–150s per episode, soap-opera pacing</span></label>
            <label class="radio-pill"><input type="radio" name="st-kind" value="pov"> Series — POV micro-series<span class="st-hint">30–90s per episode, "you" are the protagonist</span></label>
            <label class="radio-pill"><input type="radio" name="st-kind" value="daylife"> Series — day-in-the-life<span class="st-hint">15–60s per episode, recurring character</span></label>
            <label class="radio-pill"><input type="radio" name="st-kind" value="revenge"> Series — revenge arc<span class="st-hint">60–150s per episode, the justice ladder</span></label>
            <label class="radio-pill"><input type="radio" name="st-kind" value="interactive"> Series — interactive<span class="st-hint">60–150s per episode, viewer decisions shape the plot</span></label>
            <label class="radio-pill"><input type="radio" name="st-kind" value="microdrama"> Microdrama run<span class="st-hint">economics planner — clip budget, $50/min benchmark, documented 4-day pace</span></label>
          </div>
        </fieldset>
        <div class="field">
          <label for="st-title">Film / series title</label>
          <input class="input" type="text" id="st-title" placeholder="e.g. Porch Light" maxlength="80" autocomplete="off">
        </div>
        <div class="field">
          <label for="st-logline">Logline — one sentence</label>
          <textarea class="input" id="st-logline" rows="2" maxlength="300" placeholder="e.g. A lonely projectionist restores an abandoned cinema before the wrecking ball arrives."></textarea>
        </div>
        <div class="field">
          <label for="st-genre">Genre / mood</label>
          <select class="input" id="st-genre"></select>
        </div>
        <fieldset id="st-runtime-fs">
          <legend>Target runtime</legend>
          <div class="radio-row" role="radiogroup" aria-label="Target runtime">
            <label class="radio-pill"><input type="radio" name="st-runtime" value="30"> 30s</label>
            <label class="radio-pill"><input type="radio" name="st-runtime" value="120" checked> 2 min</label>
            <label class="radio-pill"><input type="radio" name="st-runtime" value="300"> 5 min</label>
            <label class="radio-pill"><input type="radio" name="st-runtime" value="600"> 10 min</label>
          </div>
        </fieldset>
        <div id="st-series-panel" hidden>
          <div class="field">
            <label for="st-eps">Episodes — plan 3 to 10 in one pass</label>
            <input class="input" type="number" id="st-eps" min="3" max="10" step="1" value="5">
          </div>
          <div class="field">
            <label for="st-epruntime">Runtime per episode — inside the format's band</label>
            <select class="input" id="st-epruntime"></select>
          </div>
          <fieldset>
            <legend>Series cast — name + voice + one-line anchor, locked into the bible</legend>
            <div id="st-cast-list"></div>
            <button type="button" class="btn btn-ghost btn-sm" id="st-cast-add" style="margin-top:var(--space-3);">+ Add character</button>
          </fieldset>
          <div class="field">
            <label for="st-locations">Locations — recurring sets (comma-separated)</label>
            <input class="input" type="text" id="st-locations" placeholder="e.g. abandoned cinema lobby, rooftop at dawn" autocomplete="off">
          </div>
          <p class="calc-note" id="st-preset-note" role="status"></p>
        </div>
        <div id="st-micro-panel" hidden>
          <div class="field">
            <label for="st-md-eps">Episodes — 1 to 40</label>
            <input class="input" type="number" id="st-md-eps" min="1" max="40" step="1" value="4">
          </div>
          <div class="field">
            <label for="st-md-min">Minutes per episode — 0.5 to 3</label>
            <input class="input" type="number" id="st-md-min" min="0.5" max="3" step="0.5" value="1">
            <p class="calc-note">One page of dialogue ≈ one minute ≈ one episode (TheWrap's industry survey).</p>
          </div>
          <div class="field">
            <label for="st-md-regens">Character regenerations per episode — your input</label>
            <input class="input" type="number" id="st-md-regens" min="0" max="100" step="1" value="5">
            <p class="calc-note">StoReel paid for regenerations when faces drifted; no per-episode figure was published — this is your budget guess, priced at the cheapest image-model rate.</p>
          </div>
          <p class="calc-note"><strong>Documented basis:</strong> every number in the plan traces to the "The $150 Microdrama" teardown (StoReel Canvas experiment, TheWrap, June 2026; Qidian Interactive, Sixth Tone) or to <code>models.json</code> rates — ranges, not promises. <a href="teardown.html">Read the teardown first →</a></p>
        </div>
        <fieldset>
          <legend>Quality tier</legend>
          <div class="radio-row" role="radiogroup" aria-label="Quality tier">
            <label class="radio-pill"><input type="radio" name="st-tier" value="draft" checked> Draft — fast, cheap, coverage first</label>
            <label class="radio-pill"><input type="radio" name="st-tier" value="festival"> Festival — slower, costlier, color-locked</label>
          </div>
        </fieldset>
        <div class="btn-row">
          <button type="button" class="btn" id="st-generate" disabled>Build my production packet</button>
        </div>
        <p class="calc-note" id="st-msg" role="status" hidden></p>
        <p class="calc-note" id="st-error" role="alert" tabindex="-1" hidden></p>
      </form>
      <p class="calc-note">Tier assumptions, stated up front: draft = 1 shot per 6s, 3 takes per keeper, 40 shots/day, 1 keyframe still per shot. Festival = 1 shot per 4s, 6 takes per keeper, 12 shots/day, 2 stills per shot. Microdrama run: 10–15s clips, draft = 3× retakes (low end of the documented "drawing cards" range), festival = 5× (high end), regen count is your input. The packet is deterministic — the same concept always builds the same plan (the seed is printed on the packet).</p>
    </section>
    <section class="container" aria-labelledby="st-out-h" style="margin-top:var(--space-6);">
      <h2 id="st-out-h" class="visually-hidden">Production packet</h2>
      <div id="st-results" aria-live="polite"></div>
      <div id="st-actions" hidden>
        <div class="btn-row">
          <button type="button" class="btn" id="st-copy">Copy packet as markdown</button>
          <button type="button" class="btn btn-ghost" id="st-dl-md">Download packet (.md)</button>
          <button type="button" class="btn btn-ghost" id="st-dl-html" hidden>Download packet (.html, self-contained)</button>
          <button type="button" class="btn btn-ghost" id="st-print">Print / save PDF</button>
          <a class="btn btn-ghost" href="greenlight.html">Take this plan to the Green Light →</a>
        </div>
        <div class="field" style="margin-top:var(--space-4);">
          <label for="st-plan-name">Plan name (for saving)</label>
          <input class="input" type="text" id="st-plan-name" maxlength="60" placeholder="Defaults to the film title">
        </div>
        <div class="btn-row">
          <button type="button" class="btn btn-ghost" id="st-save">Save plan in this browser</button>
        </div>
      </div>
    </section>
    <section class="container" aria-labelledby="st-opt-title" id="st-optimize-sec" hidden style="margin-top:var(--space-6);">
      <h2 id="st-opt-title">Optimize cost</h2>
      <p class="calc-note">Find the cheapest way to make this plan. Every substitution must clear the shot's requirements — resolution at or above the bar, native audio where the shot needs dialogue — or it is listed as ineligible, never assumed. All rates come from <code>models.json</code>.</p>
      <div class="calc-grid">
        <div class="field">
          <label for="st-opt-res">Resolution bar — every pick must document at least this</label>
          <select class="input" id="st-opt-res">
            <option value="720">720p</option>
            <option value="1080">1080p</option>
            <option value="2160">4K</option>
          </select>
        </div>
        <div class="field">
          <label for="st-opt-audio">Shots needing native audio (dialogue) — <output id="st-opt-audio-out" for="st-opt-audio">0%</output></label>
          <input type="range" id="st-opt-audio" min="0" max="100" step="5" value="0">
          <p class="calc-note">Spread evenly across the shots, deterministically.</p>
        </div>
      </div>
      <div class="btn-row">
        <button type="button" class="btn" id="st-opt-run">Run cost optimizer</button>
      </div>
      <div id="st-opt-body" aria-live="polite"></div>
    </section>
    <section class="container" aria-labelledby="st-sv-h" id="st-saved-sec" style="margin-top:var(--space-6);">
      <h2 id="st-sv-h">Saved plans</h2>
      <ul class="log-list" id="st-saved" aria-live="polite"></ul>
      <p class="empty-state" id="st-saved-empty">No saved plans yet — build a packet and save it here.</p>
    </section>
  </main>
  <footer class="site-footer">
    <div class="container footer-grid">
      <p>AI Film Master Guide — research notes for professional AI filmmaking. Sources linked per chapter.</p>
      <nav aria-label="Footer">{footer}</nav>
      <div class="footer-colophon"><span class="tc">TC 00:00:00:00</span><span class="tailpop">Tail pop</span><span>Cut in the cutting room</span><span class="tail">AI Film Master Guide — craft, not buttons</span></div>
    </div>
  </footer>
  <script src="assets/js/palette.js"></script>
  <script src="assets/js/studio.js"></script>
  <script src="assets/js/identity.js"></script>
</body>
</html>
"""

LINTER_TMPL = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Prompt linter — AI Film Master Guide</title>
  <meta name="description" content="Paste any prompt and get a structural analysis against the ten-layer prompt anatomy: which layers are present, what's missing, vague words flagged, and concrete fixes.">
  {css}
</head>
<body>
  <div class="edge-right" aria-hidden="true"></div>
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
      <span class="hdr-tc" data-hdr-tc aria-hidden="true"><span class="hdr-rec">●</span> <span class="hdr-tc-val">00:59:52:00</span></span>
      <button type="button" class="btn btn-sm btn-ghost palette-open" aria-label="Search the guide (Ctrl+K)">
        <span aria-hidden="true">⌘K</span> Search
      </button>
    </div>
  </header>
  <main id="main">
    {hero}
    <section class="container" aria-labelledby="lint-input-h">
      <h2 id="lint-input-h">Your prompt</h2>
      <label class="visually-hidden" for="lint-input">Prompt text to analyze</label>
      <textarea id="lint-input" rows="7" style="width:100%;" placeholder="Paste your prompt here — e.g. 'A woman walks down a street at night, cinematic…'"></textarea>
      <p style="margin-top:var(--space-3);">
        <button type="button" class="btn" id="lint-run">Analyze prompt</button>
        <button type="button" class="btn btn-ghost" id="lint-sample">Try the sample</button>
        <button type="button" class="btn btn-ghost" id="lint-clear">Clear</button>
      </p>
      <p class="empty-state" id="lint-error" hidden></p>
    </section>
    <section class="container" id="lint-results" hidden aria-label="Analysis results" style="margin-top:var(--space-6);">
      <h2>Analysis</h2>
      <div id="lint-score" class="card" style="margin-bottom:var(--space-5);"></div>
      <h3>The ten layers</h3>
      <ol id="lint-layers" class="lint-list"></ol>
      <div id="lint-weak" class="card" style="margin-top:var(--space-5);"></div>
      <div id="lint-fixes" style="margin-top:var(--space-5);"></div>
      <p style="margin-top:var(--space-5);"><a class="btn btn-ghost" href="anatomy.html">Learn the anatomy →</a> <a class="btn btn-ghost" href="higgsfield/prompt-engineering.html">Prompt-engineering chapter →</a></p>
    </section>
  </main>
  <footer class="site-footer">
    <div class="container footer-grid">
      <p>AI Film Master Guide — research notes for professional AI filmmaking. Sources linked per chapter.</p>
      <nav aria-label="Footer">{footer}</nav>
      <div class="footer-colophon"><span class="tc">TC 00:00:00:00</span><span class="tailpop">Tail pop</span><span>Cut in the cutting room</span><span class="tail">AI Film Master Guide — craft, not buttons</span></div>
    </div>
  </footer>
  <script src="assets/js/palette.js"></script>
  <script src="assets/js/linter.js"></script>
  <script src="assets/js/docs.js"></script>
  <script src="assets/js/identity.js"></script>
</body>
</html>
"""

CUTTINGROOM_TMPL = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>The cutting room — AI Film Master Guide</title>
  <meta name="description" content="A playable cutting room: type a weak prompt, roll the camera, and watch the scene get built shot by shot from the guide's real prompt library — then improve the prompt and watch the cut improve. Real templates, real model pricing, real cost math.">
  {css}
</head>
<body>
  <div class="edge-right" aria-hidden="true"></div>
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
      <span class="hdr-tc" data-hdr-tc aria-hidden="true"><span class="hdr-rec">●</span> <span class="hdr-tc-val">00:59:52:00</span></span>
      <button type="button" class="btn btn-sm btn-ghost palette-open" aria-label="Search the guide (Ctrl+K)">
        <span aria-hidden="true">⌘K</span> Search
      </button>
    </div>
  </header>
  <main id="main">
    {hero}
    <div id="cr-note" class="container" style="margin-top:var(--space-4);"></div>

    <section class="container cr-reveal" aria-labelledby="cr-bench-h" style="margin-top:var(--space-7);">
      <div class="cr-slate">
        <span class="cr-take-tag" aria-hidden="true">Take 01</span>
        <h2 id="cr-bench-h">The empty bench</h2>
        <span class="tc" aria-hidden="true">00:00:00:00</span>
      </div>
      <p>A weak prompt is already on the bench — the kind everyone types first. Roll the camera and watch what it shoots. Then use the fix bay to direct it properly, take by take.</p>
      <label for="cr-prompt"><strong>Your prompt</strong> <span class="calc-note">(Ctrl+Enter rolls the camera)</span></label>
      <textarea id="cr-prompt" rows="6" style="width:100%;margin-top:var(--space-2);">a dog in a city</textarea>
      <div style="display:flex;gap:var(--space-3);flex-wrap:wrap;margin-top:var(--space-3);align-items:end;">
        <div class="field" style="max-width:180px;">
          <label for="cr-seconds">Shot length (seconds)</label>
          <input class="input" type="number" id="cr-seconds" min="2" max="10" step="1" value="4">
        </div>
        <div class="field" style="max-width:220px;">
          <label for="cr-takes-per">Takes per keeper</label>
          <select class="input" id="cr-takes-per">
            <option value="3">3 — disciplined</option>
            <option value="5" selected>5 — typical</option>
            <option value="8">8 — perfectionist</option>
          </select>
        </div>
      </div>
      <p style="margin-top:var(--space-4);display:flex;gap:var(--space-3);flex-wrap:wrap;">
        <button type="button" class="btn" id="cr-roll">🎬 Roll camera</button>
        <button type="button" class="btn btn-ghost" id="cr-sample-weak">Load the weak sample</button>
        <button type="button" class="btn btn-ghost" id="cr-sample-strong">Load the strong sample</button>
        <button type="button" class="btn btn-ghost" id="cr-clear">Clear</button>
      </p>
      <p class="empty-state" id="cr-error" role="alert" hidden></p>
    </section>

    <div id="cr-results" class="cr-reveal" hidden>
      <section class="container" aria-labelledby="cr-grade-h" style="margin-top:var(--space-8);">
        <div class="cr-slate">
          <span class="cr-take-tag" aria-hidden="true">Take 02</span>
          <h2 id="cr-grade-h">The dailies <span class="api-badge" id="cr-badge" data-api-state="none" role="status" tabindex="0"></span></h2>
          <span class="tc" aria-hidden="true">00:00:45:00</span>
        </div>
        <div id="cr-grade" class="card" aria-live="polite"></div>
        <h3 style="margin-top:var(--space-5);">The ten layers</h3>
        <ol id="cr-layers" class="cr-layers"></ol>
      </section>

      <section class="container" aria-labelledby="cr-shoot-h" style="margin-top:var(--space-8);">
        <div class="cr-slate">
          <span class="cr-take-tag" aria-hidden="true">Take 03</span>
          <h2 id="cr-shoot-h">The shoot</h2>
          <span class="tc" aria-hidden="true">00:01:30:00</span>
        </div>
        <p class="calc-note">Shot-by-shot, built from the guide's real prompt library — every shot names the template it came from. Better prompts earn more coverage.</p>
        <div id="cr-shoot"></div>
        <div class="cr-timeline" role="region" aria-label="Scene timeline">
          <div class="container cr-timeline-inner">
            <span class="cr-tl-label" aria-hidden="true">Timeline — this take</span>
            <div class="cr-tl-track">
              <div class="cr-tl-fill" id="cr-tl-fill"></div>
              <ol class="cr-tl-shots" id="cr-tl-shots"></ol>
            </div>
          </div>
        </div>
      </section>

      <section class="container" aria-labelledby="cr-cost-h" style="margin-top:var(--space-8);">
        <div class="cr-slate">
          <span class="cr-take-tag" aria-hidden="true">Take 04</span>
          <h2 id="cr-cost-h">The cost desk</h2>
          <span class="tc" aria-hidden="true">00:02:15:00</span>
        </div>
        <div class="card" aria-live="polite">
          <div id="cr-cost"></div>
        </div>
      </section>

      <section class="container" aria-labelledby="cr-fix-h" style="margin-top:var(--space-8);">
        <div class="cr-slate">
          <span class="cr-take-tag" aria-hidden="true">Take 05</span>
          <h2 id="cr-fix-h">The fix bay</h2>
          <span class="tc" aria-hidden="true">00:03:00:00</span>
        </div>
        <p>Every missing layer gets a real technique from the prompt library — quoted, cited, one click to apply. Applying re-shoots the scene as a new take, so you can watch the cut improve.</p>
        <div id="cr-fix" class="cr-fixgrid"></div>
      </section>

      <section class="container" aria-labelledby="cr-takes-h" style="margin-top:var(--space-8);">
        <div class="cr-slate">
          <span class="cr-take-tag" aria-hidden="true">Take 06</span>
          <h2 id="cr-takes-h">The take log</h2>
          <span class="tc" aria-hidden="true">00:03:45:00</span>
        </div>
        <ol id="cr-takes" class="cr-takelog"></ol>
        <p style="margin-top:var(--space-5);"><a class="btn btn-ghost" href="anatomy.html">Learn the anatomy →</a> <a class="btn btn-ghost" href="workshop.html">Open the workshop →</a> <a class="btn btn-ghost" href="linter.html">Lint any prompt →</a></p>
      </section>
    </div>
  </main>
  <footer class="site-footer">
    <div class="container footer-grid">
      <p>AI Film Master Guide — research notes for professional AI filmmaking. Sources linked per chapter.</p>
      <nav aria-label="Footer">{footer}</nav>
      <div class="footer-colophon"><span class="tc">TC 00:00:00:00</span><span class="tailpop">Tail pop</span><span>Cut in the cutting room</span><span class="tail">AI Film Master Guide — craft, not buttons</span></div>
    </div>
  </footer>
  <script src="assets/js/palette.js"></script>
  <script src="assets/js/api-client.js"></script>
  <script src="assets/js/cutting-room.js"></script>
  <script src="assets/js/docs.js"></script>
  <script src="assets/js/identity.js"></script>
</body>
</html>
"""

GREENLIGHT_TMPL = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>The green light — a studio meeting, playable — AI Film Master Guide</title>
  <meta name="description" content="The Green Light: pitch your film concept to the room. A six-layer cold read, a shot list built from the guide's real 47-template prompt library, per-shot pricing from the real pricing table, a day-by-day schedule, and a verdict — green light, conditional, or back to the room.">
  {css}
  <style>
    .gl-form-grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }}
    .gl-form-grid .full {{ grid-column: 1 / -1; }}
    @media (max-width: 720px) {{ .gl-form-grid {{ grid-template-columns: 1fr; }} }}
    .gl-ambition {{ display: flex; gap: var(--space-3); flex-wrap: wrap; }}
    .gl-kicker {{ display: block; color: var(--gold); text-transform: uppercase; letter-spacing: .08em; font-size: .8rem; margin-bottom: var(--space-2); font-family: var(--font-mono); }}
    .gl-ambition .radio-pill {{ display: inline-flex; align-items: flex-start; gap: var(--space-2); border: 1px solid var(--line); border-radius: var(--radius); padding: var(--space-2) var(--space-3); cursor: pointer; }}
    .gl-ambition .radio-pill input {{ accent-color: var(--gold); margin-top: 3px; }}
    .gl-ambition .radio-pill:has(input:checked) {{ border-color: var(--gold); background: color-mix(in srgb, var(--gold) 12%, transparent); }}
    .gl-ambition .radio-pill:has(input:focus-visible) {{ outline: 2px solid var(--gold); outline-offset: 2px; }}
    .gl-ambition .gl-hint {{ display: block; color: var(--muted); font-size: .85rem; }}
    .gl-temp {{ margin: var(--space-4) 0; }}
    .gl-temp-track {{ height: 10px; background: var(--panel-2); border: 1px solid var(--line); border-radius: 999px; overflow: hidden; }}
    .gl-temp-fill {{ height: 100%; width: 0; background: linear-gradient(90deg, var(--ember), var(--warn), var(--ok)); }}
    @media (prefers-reduced-motion: no-preference) {{ .gl-temp-fill {{ transition: width .8s ease; }} }}
    .gl-temp-word {{ font-family: var(--font-display); text-transform: uppercase; letter-spacing: .06em; font-size: 1.3rem; margin: var(--space-2) 0 0; }}
    .gl-score {{ font-family: var(--font-mono); color: var(--muted); font-size: .85em; }}
    .gl-grade strong {{ font-family: var(--font-display); text-transform: uppercase; letter-spacing: .04em; font-size: 1.25em; }}
    .gl-layers {{ list-style: none; padding: 0; margin: var(--space-4) 0; display: grid; gap: var(--space-2); }}
    .gl-layers li {{ border: 1px solid var(--line); border-radius: var(--radius-s); padding: var(--space-2) var(--space-3); }}
    .gl-layers .is-on .gl-lamp {{ color: var(--ok); }}
    .gl-layers .is-off .gl-lamp {{ color: var(--muted); }}
    .gl-hits {{ color: var(--muted); font-size: .82rem; font-family: var(--font-mono); }}
    .gl-hint {{ color: var(--muted); font-size: .9rem; }}
    .gl-hype {{ border-left: 3px solid var(--warn); padding-left: var(--space-3); }}
    .gl-punch {{ margin-top: var(--space-4); border: 1px dashed var(--line-bright); border-radius: var(--radius); padding: var(--space-4); }}
    .gl-punch h3 {{ margin-top: 0; }}
    .gl-shots {{ display: grid; gap: var(--space-4); grid-template-columns: minmax(0, 1fr); }}
    @media (min-width: 58rem) {{ .gl-shots {{ grid-template-columns: 1fr 1fr; }} }}
    .gl-shot h3 {{ margin-top: 0; }}
    .gl-shot-n {{ font-family: var(--font-mono); color: var(--gold); font-size: .85em; }}
    .gl-act {{ color: var(--muted); font-weight: 400; font-size: .78em; text-transform: uppercase; letter-spacing: .06em; }}
    .gl-plat {{ color: var(--muted); font-size: .85em; }}
    .gl-flag {{ display: inline-block; font-size: .75rem; border: 1px solid var(--warn); color: var(--warn); border-radius: 999px; padding: .1em .7em; margin-left: .4em; }}
    .gl-why {{ color: var(--muted); font-size: .9rem; }}
    .gl-cost {{ font-size: 1.05rem; }}
    .gl-cost.is-unpriced {{ color: var(--warn); }}
    .gl-math {{ display: block; font-family: var(--font-mono); font-size: .78rem; color: var(--muted); margin-top: var(--space-1); }}
    .gl-unpriced {{ color: var(--warn); }}
    .gl-table td:nth-child(4), .gl-table td:nth-child(5),
    .gl-table th:nth-child(4), .gl-table th:nth-child(5) {{ text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }}
    .gl-table td:nth-child(6) {{ max-width: 36ch; color: var(--muted); font-size: .85rem; }}
    .gl-totals {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-3); padding: 0; margin: var(--space-4) 0; }}
    @media (max-width: 720px) {{ .gl-totals {{ grid-template-columns: 1fr; }} }}
    .gl-totals > div {{ border: 1px solid var(--line); border-radius: var(--radius-s); padding: var(--space-3); list-style: none; }}
    .gl-totals dt {{ color: var(--muted); font-size: .82rem; text-transform: uppercase; letter-spacing: .05em; }}
    .gl-totals dd {{ margin: var(--space-1) 0 0; font-family: var(--font-display); font-size: 1.6rem; color: var(--gold); }}
    .gl-days {{ list-style: none; padding: 0; margin: 0; display: grid; gap: var(--space-2); }}
    .gl-days li {{ display: flex; gap: var(--space-3); align-items: baseline; border-bottom: 1px solid var(--line-soft); padding-bottom: var(--space-2); flex-wrap: wrap; }}
    .gl-day {{ font-family: var(--font-mono); color: var(--gold); white-space: nowrap; }}
    .gl-basis {{ color: var(--muted); font-size: .88rem; margin-left: auto; text-align: right; }}
    .gl-verdict {{ border: 2px solid var(--line-bright); border-radius: var(--radius); padding: var(--space-5); }}
    .gl-verdict.is-green {{ border-color: var(--ok); }}
    .gl-verdict.is-cond {{ border-color: var(--warn); }}
    .gl-verdict.is-pass {{ border-color: var(--ember); }}
    .gl-stamp {{ font-family: var(--font-display); font-size: clamp(2rem, 6vw, 3.2rem); text-transform: uppercase; letter-spacing: .04em; transform: rotate(-3deg); display: inline-block; border: 3px solid currentColor; border-radius: var(--radius-s); padding: 0 var(--space-3); margin: 0 0 var(--space-3); line-height: 1.15; }}
    .is-green .gl-stamp {{ color: var(--ok); }}
    .is-cond .gl-stamp {{ color: var(--warn); }}
    .is-pass .gl-stamp {{ color: var(--ember-soft); }}
    @media (prefers-reduced-motion: no-preference) {{
      .gl-stamp {{ animation: gl-stamp-in .45s cubic-bezier(.2,1.4,.4,1) both; }}
      @keyframes gl-stamp-in {{ from {{ transform: rotate(-3deg) scale(1.6); opacity: 0; }} to {{ transform: rotate(-3deg) scale(1); opacity: 1; }} }}
    }}
    .gl-vline {{ font-size: 1.05rem; }}
    #gl-meeting section {{ margin-bottom: var(--space-7); }}
    #gl-meeting .st-prompt {{ white-space: pre-wrap; word-break: break-word; background: var(--bg-raise); border: 1px solid var(--line); border-radius: var(--radius); padding: var(--space-3); font-size: .92rem; }}
    #gl-bridge {{ margin-bottom: var(--space-4); border-color: var(--gold); }}
    @media print {{
      .site-header, .site-footer, .skip-link, #gl-form-sec, #gl-how-sec, #gl-actions {{ display: none !important; }}
      .hero {{ padding: var(--space-4) 0; }}
      .gl-shot {{ break-inside: avoid; }}
      body {{ background: #fff; color: #000; }}
    }}
  </style>
</head>
<body>
  <div class="edge-right" aria-hidden="true"></div>
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
      <span class="hdr-tc" data-hdr-tc aria-hidden="true"><span class="hdr-rec">●</span> <span class="hdr-tc-val">00:59:52:00</span></span>
      <button type="button" class="btn btn-sm btn-ghost palette-open" aria-label="Search the guide (Ctrl+K)">
        <span aria-hidden="true">⌘K</span> Search
      </button>
    </div>
  </header>
  <main id="main">
    {hero}
    <section class="container" id="gl-form-sec" aria-labelledby="gl-pitch-h">
      <h2 id="gl-pitch-h">The pitch <span class="tc" aria-hidden="true">00:00:00:00</span></h2>
      <p class="section-lede">One concept, plain words. The room does the rest — and tells you exactly what it charged you for.</p>
      <div class="card" id="gl-bridge" hidden></div>
      <form class="card calc-form" aria-label="Pitch your film to the room" onsubmit="return false;">
        <div class="gl-form-grid">
          <div class="field">
            <label for="gl-title">Working title</label>
            <input class="input" type="text" id="gl-title" maxlength="80" placeholder="e.g. The Net Mender" autocomplete="off">
          </div>
          <div class="field">
            <label for="gl-genre">Genre / mood</label>
            <select class="input" id="gl-genre"></select>
          </div>
          <div class="field full">
            <label for="gl-concept">The concept — what is the film?</label>
            <textarea class="input" id="gl-concept" rows="4" placeholder="e.g. A retired lighthouse keeper rows out every dawn to relight the lamp the town switched off…"></textarea>
          </div>
          <div class="field">
            <label for="gl-runtime">Target runtime</label>
            <select class="input" id="gl-runtime">
              <option value="30">30 seconds</option>
              <option value="120" selected>2 minutes</option>
              <option value="300">5 minutes</option>
            </select>
          </div>
          <div class="field">
            <label for="gl-res">Finish resolution</label>
            <select class="input" id="gl-res">
              <option value="720p">720p — draft-friendly</option>
              <option value="1080p" selected>1080p — the festival standard</option>
              <option value="4k">4K — flagship money</option>
            </select>
          </div>
          <div class="field full">
            <span class="gl-kicker" id="gl-amb-label">Ambition</span>
            <div class="gl-ambition" role="radiogroup" aria-labelledby="gl-amb-label">
              <label class="radio-pill"><input type="radio" name="gl-ambition" value="draft" checked> <span class="gl-pill-t"><strong>Draft</strong><span class="gl-hint">cheapest usable models</span></span></label>
              <label class="radio-pill"><input type="radio" name="gl-ambition" value="festival"> <span class="gl-pill-t"><strong>Festival</strong><span class="gl-hint">flagship pricing — earned, not assumed</span></span></label>
            </div>
          </div>
          <div class="field full">
            <div class="btn-row">
              <button type="button" class="btn btn-gold" id="gl-pitch" disabled>Loading the room…</button>
              <button type="button" class="btn btn-sm btn-ghost" id="gl-weak">Weak sample</button>
              <button type="button" class="btn btn-sm btn-ghost" id="gl-strong">Strong sample</button>
              <button type="button" class="btn btn-sm btn-ghost" id="gl-clear">Clear</button>
            </div>
            <p class="calc-note">Ctrl+Enter pitches. A take from the <a href="cutting-room.html">Cutting Room</a> can walk straight in — look for the “Green light →” button on any take.</p>
          </div>
        </div>
      </form>
      <p class="empty-state" id="gl-error" role="alert" hidden></p>
    </section>
    <section class="container" id="gl-meeting" aria-label="The meeting" hidden></section>
    <section class="container" id="gl-how-sec" aria-labelledby="gl-how-h">
      <h2 id="gl-how-h">How the room works <span class="tc" aria-hidden="true">00:03:45:00</span></h2>
      <div class="prose">
        <p>The room reads <strong>structure, not taste</strong>. Six layers — someone to watch, something happening, a camera decision, light, place and time, a feeling — scored 0–100 from the words on the page. Then the money rule: festival ambition only unlocks flagship pricing when the read clears 55. A cold read gets draft money no matter what was asked for, and the room says so on the record.</p>
        <p>Every shot is built from the guide's 47-template prompt library and priced from the real per-second pricing table — low/high ranges, the tier priced, the arithmetic shown per shot. Envelopes are 5× and 20× the clean number. Post (assembly, audio, grade) is human time and software you already own; it isn't modeled. Ranges, not promises — verify live before spending.</p>
        <p>The room also does hype hygiene: Veo 4 doesn't exist (the “release date” pages are SEO bait — verified Oct 2026), Kling 4.0 is announced but not shipped, and Sora is discontinued. Name one and the room corrects the record instead of pricing the fantasy.</p>
      </div>
    </section>
  </main>
  <footer class="site-footer">
    {footer}
  </footer>
  <script src="assets/js/palette.js"></script>
  <script src="assets/js/api-client.js"></script>
  <script src="assets/js/studio.js"></script>
  <script src="assets/js/greenlight.js"></script>
  <script src="assets/js/docs.js"></script>
  <script src="assets/js/identity.js"></script>
</body>
</html>
"""

SHOTS_TMPL = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Shot-list builder — AI Film Master Guide</title>
  <meta name="description" content="Plan your AI shoot shot by shot: add shots with models and takes, get live per-shot and total costs from models.json, save lists in the browser, and hand off to the budget optimizer.">
  {css}
</head>
<body>
  <div class="edge-right" aria-hidden="true"></div>
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
      <span class="hdr-tc" data-hdr-tc aria-hidden="true"><span class="hdr-rec">●</span> <span class="hdr-tc-val">00:59:52:00</span></span>
      <button type="button" class="btn btn-sm btn-ghost palette-open" aria-label="Search the guide (Ctrl+K)">
        <span aria-hidden="true">⌘K</span> Search
      </button>
    </div>
  </header>
  <main id="main">
    {hero}
    <section class="container" aria-labelledby="sh-add-h">
      <h2 id="sh-add-h">Add a shot</h2>
      <form class="card calc-form" aria-label="Add a shot" onsubmit="return false;">
        <div class="field">
          <label for="sh-type">Shot type</label>
          <select class="input" id="sh-type">
            <option>Wide</option>
            <option>Medium</option>
            <option>Close-up</option>
            <option>Extreme close-up</option>
            <option>Insert</option>
            <option>Over-the-shoulder</option>
            <option>POV</option>
            <option>Aerial / drone</option>
            <option>Tracking</option>
            <option>Static locked-off</option>
          </select>
        </div>
        <div class="field">
          <label for="sh-desc">Description</label>
          <input class="input" type="text" id="sh-desc" placeholder="e.g. Mara crosses the kitchen, morning light">
        </div>
        <div class="field">
          <label for="sh-model">Model</label>
          <select class="input" id="sh-model"></select>
        </div>
        <div class="field">
          <label for="sh-seconds">Seconds per take</label>
          <input class="input" type="number" id="sh-seconds" min="1" max="60" step="1" value="4">
        </div>
        <div class="field">
          <label for="sh-takes">Takes</label>
          <input class="input" type="number" id="sh-takes" min="1" max="30" step="1" value="5">
        </div>
        <div class="field">
          <button type="button" class="btn" id="sh-add">Add shot</button>
        </div>
      </form>
      <p class="empty-state" id="sh-error" hidden></p>
    </section>
    <section class="container" aria-labelledby="sh-list-h" style="margin-top:var(--space-6);">
      <h2 id="sh-list-h">Your shot list</h2>
      <p class="empty-state" id="sh-empty">No shots yet — add your first shot above.</p>
      <div class="table-scroll" id="sh-table" hidden>
        <table>
          <caption>Per-shot cost computed live from <code>models.json</code>.</caption>
          <thead><tr><th scope="col">#</th><th scope="col">Shot</th><th scope="col">Model</th><th scope="col">Footage</th><th scope="col">Cost</th><th scope="col"><span class="visually-hidden">Actions</span></th></tr></thead>
          <tbody id="sh-tbody"></tbody>
        </table>
      </div>
      <div class="calc-grid" style="margin-top:var(--space-5);" id="sh-totals" hidden aria-live="polite" aria-label="Shot list totals"></div>
      <div class="btn-row" style="margin-top:var(--space-5);">
        <a class="btn" id="sh-to-optimizer" href="optimizer.html" hidden>Send to the budget optimizer →</a>
        <button type="button" class="btn btn-ghost" id="sh-export">Export JSON</button>
        <label class="btn btn-ghost" for="sh-import-file" style="cursor:pointer;">Import JSON</label>
        <input type="file" id="sh-import-file" accept="application/json" hidden>
        <button type="button" class="btn btn-ghost" id="sh-clear">Clear list</button>
      </div>
    </section>
    <section class="container" aria-labelledby="sh-saved-h" style="margin-top:var(--space-6);">
      <h2 id="sh-saved-h">Saved lists</h2>
      <div class="card calc-form">
        <div class="field">
          <label for="sh-list-name">List name</label>
          <input class="input" type="text" id="sh-list-name" placeholder="e.g. Neon short — v1">
        </div>
        <div class="field">
          <button type="button" class="btn btn-ghost" id="sh-save-list">Save current list</button>
        </div>
        <div class="field">
          <label for="sh-load-list">Load a saved list</label>
          <select class="input" id="sh-load-list"></select>
        </div>
        <div class="field">
          <button type="button" class="btn btn-ghost" id="sh-delete-list">Delete selected</button>
        </div>
      </div>
      <p class="calc-note">Lists live in your browser's localStorage — nothing leaves your machine.</p>
    </section>
  </main>
  <footer class="site-footer">
    <div class="container footer-grid">
      <p>AI Film Master Guide — research notes for professional AI filmmaking. Sources linked per chapter.</p>
      <nav aria-label="Footer">{footer}</nav>
      <div class="footer-colophon"><span class="tc">TC 00:00:00:00</span><span class="tailpop">Tail pop</span><span>Cut in the cutting room</span><span class="tail">AI Film Master Guide — craft, not buttons</span></div>
    </div>
  </footer>
  <script src="assets/js/palette.js"></script>
  <script src="assets/js/shots.js"></script>
  <script src="assets/js/docs.js"></script>
  <script src="assets/js/identity.js"></script>
</body>
</html>
"""

STYLEBIBLE_TMPL = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Style-bible builder — AI Film Master Guide</title>
  <meta name="description" content="Build a reusable STYLE LOCK block for your production — character, world, palette, lens, texture — the consistency system's core artifact. Save bibles in your browser and prepend them in the prompt workshop.">
  {css}
  <style>
    .bible-text {{ max-height: 16rem; overflow: auto; }}
    .sb-preview {{ white-space: pre-wrap; font-family: ui-monospace, monospace; font-size: 0.9rem; }}
  </style>
</head>
<body>
  <div class="edge-right" aria-hidden="true"></div>
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
      <span class="hdr-tc" data-hdr-tc aria-hidden="true"><span class="hdr-rec">●</span> <span class="hdr-tc-val">00:59:52:00</span></span>
      <button type="button" class="btn btn-sm btn-ghost palette-open" aria-label="Search the guide (Ctrl+K)">
        <span aria-hidden="true">&#8984;K</span> Search
      </button>
    </div>
  </header>
  <main id="main">
    {hero}
    <section class="container" aria-labelledby="sb-why-h">
      <h2 id="sb-why-h">Why this works</h2>
      <p>Long-form productions survive on reference discipline: one locked description of who and where, reused word-for-word so the model has no room to reinterpret between shots. The <a href="craft/character-consistency.html">character-consistency</a> and <a href="craft/longform-pipelines.html">long-form pipelines</a> chapters cover the system; this tool produces its core artifact. Rule of the lock: <strong>never paraphrase it</strong> — if the model drifts, regenerate the shot, don't rewrite the bible.</p>
    </section>
    <form class="container" id="sb-form" aria-labelledby="sb-form-h" onsubmit="return false;">
      <h2 id="sb-form-h">Describe the production</h2>
      <p class="empty-state" id="sb-error" hidden role="alert"></p>
      <div class="card" style="margin-bottom:var(--space-5);">
        <h3>Production</h3>
        <div class="field">
          <label for="sb-name">Production name (used when saving)</label>
          <input class="input" type="text" id="sb-name" placeholder="e.g. Neon Harbor">
        </div>
      </div>
      <div class="card" style="margin-bottom:var(--space-5);">
        <h3>Character</h3>
        <div class="placeholder-grid">
          <div class="field"><label for="sb-char-name">Character name</label><input class="input" type="text" id="sb-char-name" placeholder="e.g. Mara Voss"></div>
          <div class="field"><label for="sb-char-age">Age &amp; presentation</label><input class="input" type="text" id="sb-char-age" placeholder="e.g. mid-30s woman, tired, deliberate"></div>
          <div class="field"><label for="sb-char-face">Face &amp; distinguishing features</label><input class="input" type="text" id="sb-char-face" placeholder="e.g. round face, freckles across the nose, scar through left brow"></div>
          <div class="field"><label for="sb-char-hair">Hair</label><input class="input" type="text" id="sb-char-hair" placeholder="e.g. black bob, never covers the face"></div>
          <div class="field"><label for="sb-char-wardrobe">Wardrobe / signature look</label><input class="input" type="text" id="sb-char-wardrobe" placeholder="e.g. oil-stained canvas jacket, brass diving watch"></div>
          <div class="field"><label for="sb-char-build">Build &amp; movement quality</label><input class="input" type="text" id="sb-char-build" placeholder="e.g. wiry, moves like she is conserving energy"></div>
        </div>
      </div>
      <div class="card" style="margin-bottom:var(--space-5);">
        <h3>World &amp; style</h3>
        <div class="placeholder-grid">
          <div class="field"><label for="sb-world-era">Era &amp; setting</label><input class="input" type="text" id="sb-world-era" placeholder="e.g. 1987, rain-drowned harbor city"></div>
          <div class="field"><label for="sb-world-palette">Color palette</label><input class="input" type="text" id="sb-world-palette" placeholder="e.g. sodium orange, wet asphalt black, signal green"></div>
          <div class="field"><label for="sb-world-light">Light quality</label><input class="input" type="text" id="sb-world-light" placeholder="e.g. overcast daylight, practical neon at night"></div>
          <div class="field"><label for="sb-world-lens">Lens &amp; camera language</label><input class="input" type="text" id="sb-world-lens" placeholder="e.g. 35mm, handheld, shallow focus on faces"></div>
          <div class="field"><label for="sb-world-texture">Texture &amp; grain / finish</label><input class="input" type="text" id="sb-world-texture" placeholder="e.g. 16mm grain, halation on highlights"></div>
          <div class="field"><label for="sb-world-mood">Mood keywords</label><input class="input" type="text" id="sb-world-mood" placeholder="e.g. weary, tender, salt-air melancholy"></div>
        </div>
      </div>
      <div class="card" style="margin-bottom:var(--space-5);">
        <h3>Recurring elements &amp; exclusions</h3>
        <div class="field">
          <label for="sb-recurring">Recurring elements (one per line)</label>
          <textarea class="input" id="sb-recurring" rows="3" placeholder="e.g. the brass diving watch&#10;harbor fog in every exterior"></textarea>
        </div>
        <div class="field">
          <label for="sb-never">Never do this (one per line)</label>
          <textarea class="input" id="sb-never" rows="3" placeholder="e.g. clean modern skylines&#10;day-for-night grading"></textarea>
        </div>
      </div>
    </form>
    <section class="container" aria-labelledby="sb-out-h" style="margin-top:var(--space-6);">
      <h2 id="sb-out-h">Your style lock</h2>
      <div class="card">
        <div class="prompt-preview sb-preview" id="sb-preview" aria-live="polite"></div>
        <p class="empty-state" id="sb-preview-empty">Fill in the form above — the lock assembles itself here.</p>
        <div class="btn-row" style="margin-top:var(--space-4);">
          <button type="button" class="btn btn-gold" id="sb-copy" disabled>Copy style lock</button>
          <button type="button" class="btn" id="sb-save" disabled>Save style bible</button>
          <a class="btn btn-ghost" id="sb-open-workshop" href="workshop.html">Open in workshop &rarr;</a>
        </div>
      </div>
    </section>
    <section class="container" aria-labelledby="sb-saved-h" style="margin-top:var(--space-6);">
      <h2 id="sb-saved-h">Saved bibles</h2>
      <p class="section-lede">Stored in this browser only. The workshop's style-bible menu lists these automatically.</p>
      <div id="sb-saved"></div>
      <p class="empty-state" id="sb-saved-empty" hidden>No saved bibles yet.</p>
      <div class="btn-row" style="margin-top:var(--space-4);">
        <button type="button" class="btn btn-ghost" id="sb-export">Export JSON</button>
        <label class="btn btn-ghost" for="sb-import-file" style="cursor:pointer;">Import JSON</label>
        <input type="file" id="sb-import-file" accept="application/json" hidden>
      </div>
    </section>
  </main>
  <footer class="site-footer">
    <div class="container footer-grid">
      <p>AI Film Master Guide — research notes for professional AI filmmaking. Sources linked per chapter.</p>
      <nav aria-label="Footer">{footer}</nav>
      <div class="footer-colophon"><span class="tc">TC 00:00:00:00</span><span class="tailpop">Tail pop</span><span>Cut in the cutting room</span><span class="tail">AI Film Master Guide — craft, not buttons</span></div>
    </div>
  </footer>
  <script src="assets/js/palette.js"></script>
  <script src="assets/js/style-bible.js"></script>
  <script src="assets/js/docs.js"></script>
  <script src="assets/js/identity.js"></script>
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
  <div class="edge-right" aria-hidden="true"></div>
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
      <span class="hdr-tc" data-hdr-tc aria-hidden="true"><span class="hdr-rec">●</span> <span class="hdr-tc-val">00:59:52:00</span></span>
      <button type="button" class="btn btn-sm btn-ghost palette-open" aria-label="Search the guide (Ctrl+K)">
        <span aria-hidden="true">⌘K</span> Search
      </button>
    </div>
  </header>
  <main id="main">
    {hero}
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
      <div class="footer-colophon"><span class="tc">TC 00:00:00:00</span><span class="tailpop">Tail pop</span><span>Cut in the cutting room</span><span class="tail">AI Film Master Guide — craft, not buttons</span></div>
    </div>
  </footer>
  <script src="assets/js/palette.js"></script>
  <script src="assets/js/anatomy.js"></script>
  <script src="assets/js/docs.js"></script>
  <script src="assets/js/identity.js"></script>
</body>
</html>
"""

PROMPTS_TMPL = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Prompt library — AI Film Master Guide</title>
  <meta name="description" content="Browse all 47 guide prompt templates: search full text, filter by shot type, camera movement, lighting, and mood, see which prompt-anatomy layers each template demonstrates, copy any prompt, remix it, or send it to the Studio.">
  {css}
  <style>
    .pr-grid {{ display: grid; gap: var(--space-4); grid-template-columns: 1fr; margin-bottom: var(--space-7); }}
    @media (min-width: 1100px) {{ .pr-grid {{ grid-template-columns: 1fr 1fr; }} }}
    .pr-card-head {{ display: flex; align-items: baseline; justify-content: space-between; gap: var(--space-3); }}
    .pr-card-head h3 {{ margin: 0; }}
    .pr-track {{ flex: none; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--gold); border: 1px solid var(--gold); border-radius: 999px; padding: 0.15em 0.8em; }}
    .pr-id {{ color: var(--muted); font-size: 0.85rem; margin-top: var(--space-2); }}
    .pr-prompt {{ white-space: pre-wrap; word-break: break-word; background: var(--bg-raise); border: 1px solid var(--line); border-radius: var(--radius); padding: var(--space-3); font-size: 0.92rem; max-height: 16rem; overflow: auto; }}
    .pr-slot {{ color: var(--gold); font-weight: 700; }}
    .pr-chips {{ list-style: none; display: flex; flex-wrap: wrap; gap: var(--space-2); padding: 0; margin: var(--space-3) 0; }}
    .pr-chip {{ font-size: 0.78rem; border: 1px solid var(--line-bright); border-radius: 999px; padding: 0.2em 0.8em; color: var(--ink-dim); }}
    .pr-chip.pr-layer {{ border-color: var(--gold); }}
    .pr-chip.pr-layer a {{ color: var(--gold); text-decoration: none; }}
    .pr-chip.pr-layer a:hover {{ text-decoration: underline; }}
    .pr-note {{ font-size: 0.9rem; border-left: 3px solid var(--gold); padding-left: var(--space-3); }}
    .pr-models, .pr-teardowns {{ list-style: none; display: flex; flex-wrap: wrap; gap: var(--space-2); padding: 0; margin: var(--space-2) 0; font-size: 0.85rem; color: var(--muted); }}
    .pr-models li {{ border: 1px solid var(--line); border-radius: var(--radius-s); padding: 0.1em 0.6em; }}
    .pr-teardowns li a {{ color: var(--ink-dim); }}
    .pr-actions .btn {{ margin-bottom: var(--space-2); }}
    #pr-count {{ color: var(--muted); font-size: 0.9rem; }}
    #pr-remix-dialog {{ border: 1px solid var(--line-bright); border-radius: var(--radius-l); background: var(--bg); color: var(--ink); max-width: 42rem; width: calc(100% - 2rem); padding: var(--space-5); }}
    #pr-remix-dialog::backdrop {{ background: rgba(0, 0, 0, 0.6); }}
    #pr-remix-dialog h2 {{ margin-top: 0; }}
    .is-ok {{ color: var(--gold); }}
    .is-err {{ color: #e5484d; }}
    @media (prefers-reduced-motion: reduce) {{
      * {{ scroll-behavior: auto !important; }}
    }}
  </style>
</head>
<body>
  <div class="edge-right" aria-hidden="true"></div>
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
      <span class="hdr-tc" data-hdr-tc aria-hidden="true"><span class="hdr-rec">●</span> <span class="hdr-tc-val">00:59:52:00</span></span>
      <button type="button" class="btn btn-sm btn-ghost palette-open" aria-label="Search the guide (Ctrl+K)">
        <span aria-hidden="true">⌘K</span> Search
      </button>
    </div>
  </header>
  <main id="main">
    {hero}
    <section class="container" aria-labelledby="pr-filters-h" id="pr-app">
      <div class="card" style="margin-bottom:var(--space-5);">
        <h2 id="pr-filters-h">Find a template</h2>
        <div class="placeholder-grid">
          <div class="field">
            <label for="pr-q">Search</label>
            <input class="input" id="pr-q" type="search" placeholder="e.g. orbit, dialogue, neon" autocomplete="off">
          </div>
          <div class="field">
            <label for="pr-track">Track</label>
            <select class="input" id="pr-track">
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
            <label for="pr-shot-type">Shot type</label>
            <select class="input" id="pr-shot-type"><option value="all">All shot types</option></select>
          </div>
          <div class="field">
            <label for="pr-movement">Camera movement</label>
            <select class="input" id="pr-movement"><option value="all">All movements</option></select>
          </div>
          <div class="field">
            <label for="pr-lighting">Lighting</label>
            <select class="input" id="pr-lighting"><option value="all">All lighting</option></select>
          </div>
          <div class="field">
            <label for="pr-mood">Mood</label>
            <select class="input" id="pr-mood"><option value="all">All moods</option></select>
          </div>
        </div>
        <div class="btn-row">
          <button type="button" class="btn btn-ghost" id="pr-clear">Clear filters</button>
        </div>
        <p class="empty-state" id="pr-error" hidden></p>
        <p class="calc-note" id="pr-provenance" hidden></p>
      </div>
      <p id="pr-count" role="status"></p>
      <div id="pr-list" class="pr-grid" aria-live="polite"></div>
      <div class="empty-state" id="pr-empty" hidden><span class="es-slate">No footage</span><p>No templates match those filters. Clear a filter or try a different search.</p></div>
    </section>
    <section class="container" aria-labelledby="pr-more-h">
      <h2 id="pr-more-h">Where to go next</h2>
      <p class="section-lede">Templates are starting points — the craft around them lives here.</p>
      <div class="btn-row" style="margin-bottom:var(--space-7);">
        <a class="btn btn-ghost" href="anatomy.html">Learn the ten layers →</a>
        <a class="btn btn-ghost" href="studio.html">Plan in the Studio →</a>
        <a class="btn btn-ghost" href="workshop.html">Fill in the workshop →</a>
        <a class="btn btn-ghost" href="linter.html">Lint a prompt →</a>
        <a class="btn btn-ghost" href="teardown.html">Watch the teardowns →</a>
      </div>
    </section>
    <dialog id="pr-remix-dialog" aria-labelledby="pr-remix-h">
      <form method="dialog" aria-label="Remix a template">
        <h2 id="pr-remix-h">Remix a template</h2>
        <p class="calc-note">Pick a template, swap the subject, setting, and lighting — the rest of the template's craft stays intact. The output is always labeled as a remix, never as a guide template. Empty fields keep their <span class="pr-slot">[BRACKETS]</span>. Two-subject templates: write the subject as "Mara and Jun".</p>
        <div class="field">
          <label for="pr-remix-template">Template</label>
          <select class="input" id="pr-remix-template"></select>
        </div>
        <div class="field">
          <label for="pr-remix-subject">Subject</label>
          <input class="input" id="pr-remix-subject" type="text" placeholder="e.g. a lighthouse keeper in her forties">
        </div>
        <div class="field">
          <label for="pr-remix-setting">Setting</label>
          <input class="input" id="pr-remix-setting" type="text" placeholder="e.g. a fog-drowned coastal cliff">
        </div>
        <div class="field">
          <label for="pr-remix-lighting">Lighting</label>
          <input class="input" id="pr-remix-lighting" type="text" placeholder="e.g. cold dawn, one warm lantern">
        </div>
        <div class="btn-row">
          <button type="button" class="btn btn-gold" id="pr-remix-generate">Generate remix</button>
          <button type="button" class="btn" id="pr-remix-copy" disabled>Copy remix</button>
          <button type="submit" class="btn btn-ghost">Close</button>
        </div>
        <p class="calc-note" id="pr-remix-label" aria-live="polite"></p>
        <pre class="pr-prompt" id="pr-remix-out" aria-live="polite"></pre>
        <p class="empty-state" id="pr-remix-msg" hidden></p>
      </form>
    </dialog>
  </main>
  <footer class="site-footer">
    <div class="container footer-grid">
      <p>AI Film Master Guide — research notes for professional AI filmmaking. Sources linked per chapter.</p>
      <nav aria-label="Footer">{footer}</nav>
      <div class="footer-colophon"><span class="tc">TC 00:00:00:00</span><span class="tailpop">Tail pop</span><span>Cut in the cutting room</span><span class="tail">AI Film Master Guide — craft, not buttons</span></div>
    </div>
  </footer>
  <div class="palette" id="palette" role="dialog" aria-modal="true" aria-label="Search the guide" hidden>
    <div class="palette-box">
      <input id="palette-input" type="search" placeholder="Search chapters, prompts, models…" autocomplete="off" aria-label="Search the guide">
      <div id="palette-results" role="listbox" aria-label="Search results"></div>
    </div>
  </div>
  <script src="assets/js/palette.js"></script>
  <script src="assets/js/prompts.js"></script>
  <script src="assets/js/docs.js"></script>
  <script src="assets/js/identity.js"></script>
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
  <div class="edge-right" aria-hidden="true"></div>
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
      <span class="hdr-tc" data-hdr-tc aria-hidden="true"><span class="hdr-rec">●</span> <span class="hdr-tc-val">00:59:52:00</span></span>
      <button type="button" class="btn btn-sm btn-ghost palette-open" aria-label="Search the guide (Ctrl+K)">
        <span aria-hidden="true">⌘K</span> Search
      </button>
    </div>
  </header>
  <main id="main">
    {hero}
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
          <div class="field">
            <label for="ws-stylebible">Style bible</label>
            <select class="input" id="ws-stylebible"></select>
            <p class="calc-note" style="margin-top:var(--space-2);">Optional: prepend a saved <a href="style-bible.html">style bible</a> to every prompt.</p>
          </div>
        </div>
        <p class="empty-state" id="ws-error" hidden></p>
      </div>
      <div class="workshop-grid">
        <div class="card">
          <h2>2. Fill the placeholders</h2>
          <p class="save-meta">Suggested defaults are pre-filled wherever the template's author gave one.</p>
          <div class="placeholder-grid" id="ws-fields"></div>
          <p class="empty-state" id="ws-fields-empty" hidden><span class="es-slate">No footage</span>No placeholders in this template.</p>
        </div>
        <div>
          <div class="card" id="ws-why" style="margin-bottom:var(--space-5);" aria-live="polite"></div>
          <div class="card">
            <h2>3. Copy your prompt</h2>
            <div class="prompt-preview" id="ws-preview" aria-live="polite"></div>
            <p class="empty-state" id="ws-preview-empty" hidden><span class="es-slate">No footage</span>Pick a template to preview your prompt.</p>
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
      <div class="empty-state" id="ws-saves-empty" hidden><span class="es-slate">No footage</span><p>No saved prompts yet. Fill a template above and hit &ldquo;Save this prompt&rdquo;.</p></div>
      <p class="calc-note" style="margin-bottom:var(--space-7);">Templates and models come from <code>prompt-templates.json</code> and <code>models.json</code> — the same versioned API the guide publishes under <code>data/v1/</code>.</p>
    </section>
  </main>
  <footer class="site-footer">
    <div class="container footer-grid">
      <p>AI Film Master Guide — research notes for professional AI filmmaking. Sources linked per chapter.</p>
      <nav aria-label="Footer">{footer}</nav>
      <div class="footer-colophon"><span class="tc">TC 00:00:00:00</span><span class="tailpop">Tail pop</span><span>Cut in the cutting room</span><span class="tail">AI Film Master Guide — craft, not buttons</span></div>
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
  <script src="assets/js/docs.js"></script>
  <script src="assets/js/identity.js"></script>
</body>
</html>
"""

QUIZ_TMPL = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Model-picker quiz — AI Film Master Guide</title>
  <meta name="description" content="Five questions, one ranked shortlist: the model-picker quiz scores all 22 video models in the guide's API against your use case, budget, and audio needs — with live cost math.">
  {css}
</head>
<body>
  <div class="edge-right" aria-hidden="true"></div>
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
      <span class="hdr-tc" data-hdr-tc aria-hidden="true"><span class="hdr-rec">●</span> <span class="hdr-tc-val">00:59:52:00</span></span>
      <button type="button" class="btn btn-sm btn-ghost palette-open" aria-label="Search the guide (Ctrl+K)">
        <span aria-hidden="true">⌘K</span> Search
      </button>
    </div>
  </header>
  <main id="main">
    {hero}
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
      <div class="footer-colophon"><span class="tc">TC 00:00:00:00</span><span class="tailpop">Tail pop</span><span>Cut in the cutting room</span><span class="tail">AI Film Master Guide — craft, not buttons</span></div>
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
  <script src="assets/js/docs.js"></script>
  <script src="assets/js/identity.js"></script>
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
  <div class="edge-right" aria-hidden="true"></div>
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
      <span class="hdr-tc" data-hdr-tc aria-hidden="true"><span class="hdr-rec">●</span> <span class="hdr-tc-val">00:59:52:00</span></span>
      <button type="button" class="btn btn-sm btn-ghost palette-open" aria-label="Search the guide (Ctrl+K)">
        <span aria-hidden="true">&#8984;K</span> Search
      </button>
    </div>
  </header>
  <main id="main">
    {hero}
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
      <p style="margin-top:var(--space-6);"><a class="btn btn-ghost" href="quiz.html">&larr; Take the model-picker quiz</a> <a class="btn btn-ghost" href="model-watch.html">Model watch</a> <a class="btn btn-ghost" href="showdown.html">Model showdown</a></p>
    </section>
  </main>
  <footer class="site-footer">
    <div class="container footer-grid">
      <p>AI Film Master Guide — research notes for professional AI filmmaking. Sources linked per chapter.</p>
      <nav aria-label="Footer">{footer}</nav>
      <div class="footer-colophon"><span class="tc">TC 00:00:00:00</span><span class="tailpop">Tail pop</span><span>Cut in the cutting room</span><span class="tail">AI Film Master Guide — craft, not buttons</span></div>
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
  <script src="assets/js/docs.js"></script>
  <script src="assets/js/identity.js"></script>
</body>
</html>
"""

SHOWDOWN_TMPL = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Model showdown — AI Film Master Guide</title>
  <meta name="description" content="Two AI film models on the cutting table: published rates, source-check health, drift-board state, and pricing movement against the 2026-10-11 baseline — every figure from the Watchtower record, nothing scored or estimated.">
  {css}
  <style>
    .sd-reels {{ display: grid; grid-template-columns: 1fr auto 1fr; gap: var(--space-4); align-items: stretch; margin-bottom: var(--space-5); }}
    .sd-reel {{ position: relative; border: 1px solid var(--line); border-radius: 12px; padding: calc(var(--space-5) + 12px) var(--space-5) var(--space-5); overflow: hidden; }}
    .sd-reel::before {{ content: ""; position: absolute; inset: 0 0 auto 0; height: 14px; background-image: radial-gradient(circle, var(--line) 2.2px, transparent 2.6px); background-size: 18px 14px; background-position: center; }}
    .sd-reel h3 {{ margin: var(--space-2) 0 var(--space-1); font-size: 1.6rem; }}
    .sd-splice {{ align-self: center; border: 1px solid var(--gold); border-radius: 999px; padding: .35em .9em; color: var(--gold); font-weight: 800; letter-spacing: .12em; }}
    .sd-table {{ border-top: 2px solid var(--gold); }}
    .sd-row {{ display: grid; grid-template-columns: 1fr 9.5rem 1fr; border-bottom: 1px solid var(--line); }}
    .sd-cell {{ padding: var(--space-4); }}
    .sd-cell p {{ margin: 0 0 var(--space-2); }}
    .sd-cell p:last-child {{ margin-bottom: 0; }}
    .sd-cell-a {{ border-right: 1px dashed var(--line); }}
    .sd-cell-b {{ border-left: 1px dashed var(--line); }}
    .sd-lab {{ display: flex; align-items: center; justify-content: center; text-align: center; font-size: .78rem; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); padding: var(--space-4) var(--space-2); }}
    .sd-edge {{ display: inline-block; background: var(--gold); color: #111; border-radius: 999px; font-size: .72rem; font-weight: 700; padding: .1em .6em; margin-left: .4em; white-space: nowrap; }}
    .sd-tiers, .sd-alerts {{ margin: 0; padding-left: 1.1em; }}
    .sd-tiers li, .sd-alerts li {{ margin-bottom: var(--space-1); }}
    .sd-unpub {{ font-weight: 700; }}
    .sd-conf {{ color: var(--muted); font-size: .85em; }}
    .sd-verdict {{ border-left: 3px solid var(--gold); padding-left: var(--space-4); font-size: 1.05rem; margin-bottom: var(--space-6); }}
    .sd-feed {{ color: var(--muted); }}
    @media (max-width: 720px) {{
      .sd-row {{ grid-template-columns: 1fr 1fr; }}
      .sd-lab {{ grid-column: 1 / -1; order: -1; justify-content: flex-start; padding-bottom: 0; }}
      .sd-reels {{ grid-template-columns: 1fr; }}
      .sd-splice {{ justify-self: center; }}
    }}
  </style>
</head>
<body>
  <div class="edge-right" aria-hidden="true"></div>
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
      <span class="hdr-tc" data-hdr-tc aria-hidden="true"><span class="hdr-rec">●</span> <span class="hdr-tc-val">00:59:52:00</span></span>
      <button type="button" class="btn btn-sm btn-ghost palette-open" aria-label="Search the guide (Ctrl+K)">
        <span aria-hidden="true">&#8984;K</span> Search
      </button>
    </div>
  </header>
  <main id="main">
    {hero}
    <section class="container" aria-labelledby="sd-h">
      <h2 id="sd-h">Lace up two reels</h2>
      <p class="sd-feed">{sd_feed}</p>
      <div class="card" style="margin-bottom:var(--space-6);">
        <div class="calc-grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr));">
          <div class="field">
            <label for="sd-a">Reel A</label>
            <select class="input" id="sd-a">{sd_options_a}</select>
          </div>
          <div class="field">
            <label for="sd-b">Reel B</label>
            <select class="input" id="sd-b">{sd_options_b}</select>
          </div>
          <div class="field">
            <label aria-hidden="true">&nbsp;</label>
            <button type="button" class="btn btn-ghost" id="sd-swap">Swap reels</button>
          </div>
        </div>
      </div>
      <p class="sd-verdict" id="sd-verdict" aria-live="polite">{sd_verdict}</p>
      <div id="sd-stage">{sd_stage}</div>
      <p style="margin-top:var(--space-6);"><a class="btn btn-ghost" href="model-watch.html">Model watch</a> <a class="btn btn-ghost" href="compare.html">Compare 2–3 models</a> <a class="btn btn-ghost" href="quiz.html">Take the model-picker quiz</a></p>
    </section>
  </main>
  <footer class="site-footer">
    <div class="container footer-grid">
      <p>AI Film Master Guide — research notes for professional AI filmmaking. Sources linked per chapter.</p>
      <nav aria-label="Footer">{footer}</nav>
      <div class="footer-colophon"><span class="tc">TC 00:00:00:00</span><span class="tailpop">Tail pop</span><span>Cut in the cutting room</span><span class="tail">AI Film Master Guide — craft, not buttons</span></div>
    </div>
  </footer>
  <div class="palette" id="palette" role="dialog" aria-modal="true" aria-label="Search" hidden>
    <div class="palette-box">
      <input type="search" id="palette-input" placeholder="Search the guide…" aria-label="Search the guide">
      <div id="palette-results" role="listbox" aria-label="Search results"></div>
    </div>
  </div>
  <script type="application/json" id="sd-data">{sd_data}</script>
  <script src="assets/js/palette.js"></script>
  <script src="assets/js/showdown.js"></script>
  <script src="assets/js/docs.js"></script>
  <script src="assets/js/identity.js"></script>
</body>
</html>
"""


FORGE_TMPL = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Episode forge — AI Film Master Guide</title>
  <meta name="description" content="Forge one mini-drama episode: an 8-beat, 3-act arc from the guide's craft chapters, every beat matched to a real template from the guide's own 47-template library, with teardown field lessons and a clean exportable plan. Where the library has no template for a beat, the Forge says so.">
  {css}
  <style>
    .fg-summary {{ font-size: 1.05rem; border-left: 3px solid var(--gold); padding-left: var(--space-4); margin-bottom: var(--space-6); }}
    .fg-act {{ margin: var(--space-6) 0 var(--space-3); letter-spacing: .1em; text-transform: uppercase; font-size: .85rem; color: var(--gold); }}
    .fg-beat {{ border: 1px solid var(--line); border-radius: 12px; padding: var(--space-4) var(--space-5); margin-bottom: var(--space-4); }}
    .fg-beat-head {{ display: flex; align-items: baseline; gap: var(--space-3); flex-wrap: wrap; }}
    .fg-beat-head h4 {{ margin: 0; font-size: 1.25rem; }}
    .fg-num {{ display: inline-block; min-width: 1.7em; text-align: center; background: var(--gold); color: #111; border-radius: 999px; font-weight: 800; padding: .1em .3em; }}
    .fg-tag {{ margin-left: auto; font-size: .78rem; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }}
    .fg-tag-none {{ color: #e88; }}
    .fg-craft {{ color: var(--muted); }}
    .fg-prompt {{ white-space: pre-wrap; word-break: break-word; background: color-mix(in srgb, var(--gold) 6%, transparent); border: 1px solid var(--line); border-radius: 8px; padding: var(--space-3); font-size: .92rem; }}
    .fg-anatomy, .fg-models, .fg-lesson {{ color: var(--muted); }}
    .fg-lesson strong {{ color: var(--text); }}
  </style>
</head>
<body>
  <div class="edge-right" aria-hidden="true"></div>
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
      <span class="hdr-tc" data-hdr-tc aria-hidden="true"><span class="hdr-rec">●</span> <span class="hdr-tc-val">00:59:52:00</span></span>
      <button type="button" class="btn btn-sm btn-ghost palette-open" aria-label="Search the guide (Ctrl+K)">
        <span aria-hidden="true">&#8984;K</span> Search
      </button>
    </div>
  </header>
  <main id="main">
    {hero}
    <section class="container" aria-labelledby="fg-h">
      <h2 id="fg-h">Set the episode</h2>
      <p>One episode, one emotion, eight beats. The Forge lays the arc the craft chapters teach, then walks the guide's own template library beat by beat and attaches the template that fits — scored on the template's own facets (shot type, camera movement, mood) and its stated use. A beat the library does not cover is named, not papered over.</p>
      <div class="card" style="margin-bottom:var(--space-6);">
        <div class="calc-grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr));">
          <div class="field">
            <label for="fg-title">Series title</label>
            <input class="input" type="text" id="fg-title" placeholder="e.g. Night Taxi">
          </div>
          <div class="field">
            <label for="fg-episode">Episode</label>
            <input class="input" type="number" id="fg-episode" min="1" value="1">
          </div>
          <div class="field">
            <label for="fg-format">Format</label>
            <select class="input" id="fg-format">{fg_format_options}</select>
          </div>
          <div class="field">
            <label for="fg-emotion">One emotion</label>
            <select class="input" id="fg-emotion">{fg_emotion_options}</select>
          </div>
          <div class="field" style="grid-column:1/-1;">
            <label for="fg-premise">Premise — one line, one stake</label>
            <input class="input" type="text" id="fg-premise" placeholder="e.g. A toddler rides a night taxi alone to find her father">
          </div>
          <div class="field">
            <label aria-hidden="true">&nbsp;</label>
            <button type="button" class="btn" id="fg-forge">Forge the episode</button>
          </div>
        </div>
      </div>
      <p class="fg-summary" id="fg-summary" aria-live="polite">{fg_summary}</p>
      <div id="fg-stage">{fg_stage}</div>
      <div class="card" style="margin-top:var(--space-6);">
        <h3>Take the plan</h3>
        <p>The plan exports as clean markdown: every beat, its craft note, the real template and prompt, the shortlisted models, and the field lesson where a teardown is linked. Gates G2 and G4 ride along — an episode is not forged until it can pass them.</p>
        <p><button type="button" class="btn" id="fg-copy">Copy plan</button> <button type="button" class="btn btn-ghost" id="fg-download">Download plan (.md)</button></p>
        <p class="calc-note" id="fg-msg" hidden></p>
        <p><a class="btn btn-ghost" href="episode-planner.html">Episode planner — lock the series bible</a> <a class="btn btn-ghost" href="prompts.html">Prompt library</a> <a class="btn btn-ghost" href="teardown.html">Teardowns</a></p>
      </div>
    </section>
  </main>
  <footer class="site-footer">
    <div class="container footer-grid">
      <p>AI Film Master Guide — research notes for professional AI filmmaking. Sources linked per chapter.</p>
      <nav aria-label="Footer">{footer}</nav>
      <div class="footer-colophon"><span class="tc">TC 00:00:00:00</span><span class="tailpop">Tail pop</span><span>Cut in the cutting room</span><span class="tail">AI Film Master Guide — craft, not buttons</span></div>
    </div>
  </footer>
  <div class="palette" id="palette" role="dialog" aria-modal="true" aria-label="Search" hidden>
    <div class="palette-box">
      <input type="search" id="palette-input" placeholder="Search the guide…" aria-label="Search the guide">
      <div id="palette-results" role="listbox" aria-label="Search results"></div>
    </div>
  </div>
  <script type="application/json" id="fg-data">{fg_data}</script>
  <script src="assets/js/palette.js"></script>
  <script src="assets/js/forge.js"></script>
  <script src="assets/js/docs.js"></script>
  <script src="assets/js/identity.js"></script>
</body>
</html>
"""


# The Forge arc — kept byte-identical in spirit with assets/js/forge.js
# (ARC there is the runtime copy; forge.test.js pins its behaviour, and the
# pre-rendered default plan below is screenshot-checked against it).
FORGE_ARC = [
    dict(id="hook", act="Act 1 — Cold open", name="The hook",
         craft="Hook line in the first 3 seconds; caption and opening shot say the same thing (genre anatomy, Episodic Short-Form).",
         shotTypes=["establishing", "wide"], movements=["dolly-out-pull-back", "crane-up-crane-down"],
         moods=["expansive", "majestic", "tense"], useKeys=["opening", "hook"]),
    dict(id="stake", act="Act 1 — Cold open", name="The stake",
         craft="One want, visible on screen: the protagonist wants something concrete (Story Structure — the short-film engine).",
         shotTypes=["two-shot", "medium"], movements=["static-locked-off"],
         moods=["conversational", "intimate", "grounded"], useKeys=["conversation", "dialogue"]),
    dict(id="escalation", act="Act 2 — Escalation", name="Escalation",
         craft="The want meets the obstacle; each shot raises the stakes or deepens the world (Story Structure — the judged-short template).",
         shotTypes=["tracking", "wide"], movements=["tracking-shot", "dolly-in-push-in"],
         moods=["kinetic", "tense", "dramatic"], useKeys=["chases", "action", "montage"]),
    dict(id="turn", act="Act 2 — Escalation", name="The turn",
         craft="One turn — the moment everything changes; a dedicated shot for the emotional turn (Story Structure; gate G4, Episodic Short-Form).",
         shotTypes=["close-up", "medium"], movements=["dolly-in-push-in"],
         moods=["dramatic", "intimate", "somber"], useKeys=["emotional"]),
    dict(id="complication", act="Act 2 — Escalation", name="The complication",
         craft="The plan fails or the truth lands — pressure builds before the reversal (Story Structure — the judged-short template).",
         shotTypes=["close-up", "two-shot"], movements=["static-locked-off", "handheld"],
         moods=["unsettling", "tense", "somber"], useKeys=["horror", "suspense", "dialogue"]),
    dict(id="reversal", act="Act 3 — Reversal & button", name="The reversal",
         craft="The reversal: the choice gets made. Most AI-film losers are tech demos with no second act — this is the second act (Story Structure).",
         shotTypes=["close-up", "tracking"], movements=["tracking-shot", "orbit-arc-shot"],
         moods=["dramatic", "kinetic", "triumphant"], useKeys=["emotional", "action", "transformation"]),
    dict(id="button", act="Act 3 — Reversal & button", name="The button",
         craft="One final image that reframes everything before it. End on the image, not on explanation (Story Structure — the judged-short template).",
         shotTypes=["wide", "establishing"], movements=["static-locked-off", "dolly-out-pull-back"],
         moods=["dreamlike", "somber", "expansive"], useKeys=["transition", "transformation"]),
    dict(id="cliffhanger", act="Act 3 — Reversal & button", name="The cliffhanger",
         craft="Ends mid-beat or on an unanswered question — never the resolution. The resolution is what Episode N+1 is (genre anatomy, Episodic Short-Form).",
         shotTypes=["close-up", "medium"], movements=["static-locked-off"],
         moods=["tense", "unsettling", "dramatic"], useKeys=["reaction", "listening", "emotional"]),
]
FORGE_EMOTION_MOODS = {
    "longing": ["dreamlike", "nostalgic", "intimate"], "dread": ["unsettling", "tense", "somber"],
    "grief": ["somber", "intimate", "nostalgic"], "relief": ["warm", "dreamlike", "grounded"],
    "triumph": ["kinetic", "dramatic", "expansive"], "suspense": ["tense", "unsettling", "dramatic"],
    "comfort": ["warm", "intimate", "grounded"], "heartbreak": ["somber", "dramatic", "intimate"],
    "defiance": ["dramatic", "kinetic", "grounded"], "tenderness": ["intimate", "warm", "dreamlike"],
    "guilt": ["somber", "unsettling", "intimate"], "joy": ["playful", "warm", "expansive"],
}
FORGE_FORMATS = [("minidrama", "Mini-drama"), ("pov", "POV series"), ("daylife", "Day-in-the-life"),
                 ("revenge", "Revenge arc"), ("interactive", "Interactive")]
FORGE_MIN_SCORE = 3


def forge_score(beat, tpl, facet, emotion_moods):
    if not facet:
        return 0
    s = 0
    if facet.get("shot_type") in beat["shotTypes"]:
        s += 3
    if facet.get("movement") in beat["movements"]:
        s += 2
    if facet.get("mood") in beat["moods"]:
        s += 2
    if facet.get("mood") in emotion_moods:
        s += 1
    hay = ((tpl.get("use") or "") + " " + (tpl.get("anatomy") or "")).lower()
    s += min(sum(1 for k in beat["useKeys"] if k in hay), 2)
    return s


def forge_plan(templates, facets, teardowns, emotion):
    """Mirror of ForgeEngine.buildPlan (assets/js/forge.js) for the
    pre-rendered default plan — same arc, same scoring, same tie-break."""
    emotion_moods = FORGE_EMOTION_MOODS.get(emotion, [])
    used = set()
    beats = []
    for beat in FORGE_ARC:
        best, best_score = None, -1
        for tpl in templates:
            if tpl["id"] in used:
                continue
            sc = forge_score(beat, tpl, facets.get(tpl["id"]), emotion_moods)
            if sc > best_score or (sc == best_score and best and tpl["id"] < best["id"]):
                best, best_score = tpl, sc
        if best is None or best_score < FORGE_MIN_SCORE:
            beats.append({"beat": beat, "covered": False, "score": max(best_score, 0),
                          "template": None, "teardown": None})
            continue
        used.add(best["id"])
        td = None
        for tid in (facets.get(best["id"]) or {}).get("teardowns", []):
            if tid in teardowns:
                td = teardowns[tid]
                break
        beats.append({"beat": beat, "covered": True, "score": best_score,
                      "template": best, "teardown": td})
    return beats


def build_forge(css_links):
    """Episode Forge page — a serialized mini-drama episode planner built
    from the guide's own craft data: the 47-template library
    (prompt-templates.json), its facets (prompts-facets.json), and the
    teardown lessons (teardowns.json). The arc and its craft notes quote
    craft/story-structure.md and craft/episodic-shortform.md. Every
    template attached to a beat is a real library record, matched by a
    deterministic score; a beat under the bar renders as uncovered —
    nothing is invented. The default plan is pre-rendered here under the
    same rules assets/js/forge.js runs in the browser."""
    templates = json.loads((ROOT / "data" / "v1" / "prompt-templates.json").read_text())["templates"]
    facets = json.loads((ROOT / "prompts-facets.json").read_text())["facets"]
    td_doc = json.loads((ROOT / "data" / "v1" / "teardowns.json").read_text())["teardowns"]
    teardowns = {}
    for t in td_doc:
        shots = t.get("shots") or []
        teardowns[t["id"]] = {"id": t["id"], "title": t.get("title", t["id"]),
                              "lesson": (shots[0].get("lesson", "") if shots else "")}
    island = {"templates": templates, "facets": facets, "teardowns": teardowns}

    beats = forge_plan(templates, facets, teardowns, "longing")
    covered = sum(1 for b in beats if b["covered"])
    summary = (f"Episode 1 · Mini-drama · one emotion: longing · {covered} of {len(beats)} "
               f"beats covered by the library"
               + (" — the rest are named as uncovered below; the Forge invents nothing."
                  if covered < len(beats) else "."))

    def esc(s):
        return html.escape(str(s if s is not None else ""))

    stage = []
    act = ""
    for i, b in enumerate(beats):
        beat = b["beat"]
        if beat["act"] != act:
            act = beat["act"]
            stage.append(f'<h3 class="fg-act">{esc(act)}</h3>')
        tag = (f'<span class="fg-tag">{esc(b["template"]["id"])} · match {b["score"]}</span>'
               if b["covered"] else '<span class="fg-tag fg-tag-none">no library template</span>')
        s = (f'<article class="fg-beat"><div class="fg-beat-head"><span class="fg-num">{i + 1}</span>'
             f'<h4>{esc(beat["name"])}</h4>{tag}</div>'
             f'<p class="fg-craft">{esc(beat["craft"])}</p>')
        if not b["covered"]:
            s += ('<p class="fg-none">The guide\u2019s library has no template that covers this beat. '
                  'Write it by hand or take it to the <a href="workshop.html">prompt workshop</a> — '
                  'the Forge does not invent one.</p>')
        else:
            t = b["template"]
            s += (f'<p class="fg-tpl"><strong>{esc(t["title"])}</strong> — {esc(t.get("use") or "")}</p>'
                  f'<p class="fg-anatomy">{esc(t.get("anatomy") or "")}</p>'
                  f'<pre class="fg-prompt">{esc(t.get("prompt") or "")}</pre>')
            if t.get("models"):
                s += f'<p class="fg-models">Shortlisted models: {esc(", ".join(t["models"]))}</p>'
            if b["teardown"]:
                s += (f'<p class="fg-lesson"><strong>Field lesson — {esc(b["teardown"]["title"])}:</strong> '
                      f'{esc(b["teardown"]["lesson"])} <a href="teardown.html">Teardowns</a></p>')
        s += "</article>"
        stage.append(s)

    fmt_opts = "".join(f'<option value="{v}"{" selected" if v == "minidrama" else ""}>{label}</option>'
                       for v, label in FORGE_FORMATS)
    emo_opts = "".join(f'<option value="{e}"{" selected" if e == "longing" else ""}>{e}</option>'
                       for e in FORGE_EMOTION_MOODS)
    (SITE / "forge.html").write_text(FORGE_TMPL.format(
        css=css_links, sitenav=nav_html("", "forge.html"), footer=footer_html(""),
        hero=hero_cutroom(
            kicker="""The cutting room""",
            h1="""Episode <span class="accent">forge.</span>""",
            lede="""One episode on the anvil: an eight-beat, three-act arc from the guide's craft chapters, with a real library template hammered onto every beat it fits — and an honest gap named where none does. Export the plan and shoot it.""",
            deck_title="""FORGE — EPISODE_ARC""",
            clips={"v2": ['The arc'], "v1": ['Hook', 'Turn', 'Cliffhanger'], "a1": ['The plan']},
            h1_id="fg-title-h",
            extra=""" """),
        fg_format_options=fmt_opts, fg_emotion_options=emo_opts,
        fg_summary=html.escape(summary), fg_stage="".join(stage),
        fg_data=json.dumps(island, ensure_ascii=False)))
    return [("forge.html", "Episode forge")]


CLEARANCE_TMPL = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Script clearance desk — AI Film Master Guide</title>
  <meta name="description" content="The script-clearance layer as a working file: the ten rules (1358–1367) as steps, your production's items logged one by one, every flag closed by a recorded decision, and the E&O / distribution gate verdict computed from your own entries.">
  {css}
  <style>
    .cl-verdict {{ font-size: 1.05rem; border-left: 3px solid var(--gold); padding-left: var(--space-4); margin-bottom: var(--space-6); }}
    .cl-held {{ border-left-color: #e88; }}
    .cl-step, .cl-item {{ border: 1px solid var(--line); border-radius: 12px; padding: var(--space-4) var(--space-5); margin-bottom: var(--space-4); }}
    .cl-step-head, .cl-item-head {{ display: flex; align-items: baseline; gap: var(--space-3); flex-wrap: wrap; }}
    .cl-step-head h4, .cl-item-head h4 {{ margin: 0; font-size: 1.2rem; }}
    .cl-num {{ display: inline-block; min-width: 1.7em; text-align: center; background: var(--gold); color: #111; border-radius: 999px; font-weight: 800; padding: .1em .3em; }}
    .cl-tag {{ margin-left: auto; font-size: .78rem; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }}
    .cl-what, .cl-when, .cl-flag, .cl-clear {{ color: var(--muted); }}
    .cl-flag strong {{ color: var(--text); }}
  </style>
</head>
<body>
  <div class="edge-right" aria-hidden="true"></div>
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
      <span class="hdr-tc" data-hdr-tc aria-hidden="true"><span class="hdr-rec">&#9679;</span> <span class="hdr-tc-val">00:59:52:00</span></span>
      <button type="button" class="btn btn-sm btn-ghost palette-open" aria-label="Search the guide (Ctrl+K)">
        <span aria-hidden="true">&#8984;K</span> Search
      </button>
    </div>
  </header>
  <main id="main">
    {hero}
    <section class="container" aria-labelledby="cl-h">
      <h2 id="cl-h">The ten steps — the file itself</h2>
      <p>Script clearance is the layer under every other rights question in this guide: what may lawfully appear in the work at all. The ten steps below are the ten rules from research cycle 81 (rules 1358–1367), each with what the document is and when it is required; the full chapter is <a href="legal/script-clearance.html">Script Clearance: The Report, the Chain, and the Gate</a>. Tick a step when the production has actually done it — the desk counts paper, not intentions. Not legal advice: this is the file a clearance researcher and an entertainment attorney work from.</p>
      <div id="cl-steps">{cl_steps}</div>
      <p class="calc-note" id="cl-steps-state" aria-live="polite">{cl_steps_state}</p>
      <h2>Your clearance file</h2>
      <p>Log the production's items one by one — every name, place, business, person, location and featured object the research touches. A flagged item closes only with a recorded decision (license, substitute, change the use, or expressly assume the risk); an undecided flag holds the gate. The desk opens on a worked example: a small AI short with one flag still open, so the first verdict you see is the honest one.</p>
      <div class="card" style="margin-bottom:var(--space-6);">
        <div class="calc-grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr));">
          <div class="field">
            <label for="cl-title">Production title</label>
            <input class="input" type="text" id="cl-title" placeholder="e.g. The Night Bus">
          </div>
          <div class="field">
            <label for="cl-new-label">New item — what the research must check</label>
            <input class="input" type="text" id="cl-new-label" placeholder="e.g. Shopfront signage in shot 7">
          </div>
          <div class="field">
            <label for="cl-new-kind">Item kind</label>
            <select class="input" id="cl-new-kind">{cl_kind_options}</select>
          </div>
          <div class="field">
            <label for="cl-new-flagged">Research outcome</label>
            <span><input type="checkbox" id="cl-new-flagged"> Flagged — needs a recorded decision</span>
          </div>
          <div class="field">
            <label aria-hidden="true">&nbsp;</label>
            <button type="button" class="btn" id="cl-add">Add item to the file</button>
          </div>
        </div>
        <p class="calc-note" id="cl-msg" hidden></p>
      </div>
      <p class="cl-verdict" id="cl-verdict" aria-live="polite">{cl_verdict}</p>
      <div id="cl-stage">{cl_stage}</div>
      <div class="card" style="margin-top:var(--space-6);">
        <h3>Take the file</h3>
        <p>The file exports as clean markdown: the ten steps with their state, every logged item with its flag and recorded decision, and the gate verdict — the shape of the clearance file the E&amp;O application and the distributor's delivery review both ask for.</p>
        <p><button type="button" class="btn" id="cl-copy">Copy file</button> <button type="button" class="btn btn-ghost" id="cl-download">Download file (.md)</button></p>
        <p><a class="btn btn-ghost" href="legal/script-clearance.html">Read the clearance chapter</a> <a class="btn btn-ghost" href="legal/rights-and-disclosure.html">Rights &amp; disclosure</a> <a class="btn btn-ghost" href="greenlight.html">Green light</a></p>
      </div>
    </section>
  </main>
  <footer class="site-footer">
    <div class="container footer-grid">
      <p>AI Film Master Guide — research notes for professional AI filmmaking. Sources linked per chapter.</p>
      <nav aria-label="Footer">{footer}</nav>
      <div class="footer-colophon"><span class="tc">TC 00:00:00:00</span><span class="tailpop">Tail pop</span><span>Cut in the cutting room</span><span class="tail">AI Film Master Guide — craft, not buttons</span></div>
    </div>
  </footer>
  <div class="palette" id="palette" role="dialog" aria-modal="true" aria-label="Search" hidden>
    <div class="palette-box">
      <input type="search" id="palette-input" placeholder="Search the guide…" aria-label="Search the guide">
      <div id="palette-results" role="listbox" aria-label="Search results"></div>
    </div>
  </div>
  <script src="assets/js/palette.js"></script>
  <script src="assets/js/clearance.js"></script>
  <script src="assets/js/docs.js"></script>
  <script src="assets/js/identity.js"></script>
</body>
</html>
"""


# The clearance layer — kept in step with assets/js/clearance.js
# (STEPS / DEFAULT_ITEMS / evaluate there are the runtime copy;
# clearance.test.js pins the engine, and the pre-rendered default file
# below is screenshot-checked against the JS render). Rules 1358–1367,
# research cycle 81 (Identity r78) — see legal/script-clearance.md.
CLEARANCE_STEPS = [
    dict(n=1358, id="report", name="The clearance report", stage="Before the shoot",
         what="The final shooting script, researched by a professional clearance researcher: every character name, place, address and business checked against its real-world commonality, and the permission contact named for every referenced product, copyright and trademark.",
         when="Filed before production, on the final shooting script."),
    dict(n=1359, id="annotation", name="The annotation guide", stage="Before the shoot",
         what="The writer labels every character, place and event fictional, real or composite; the work's origins and any similar submission's independent path are documented, and true-life sources are recorded as primary or secondary.",
         when="At the start — it is the clearance review's input, not its output."),
    dict(n=1360, id="names", name="Researched names, permitted numbers", stage="Before the shoot",
         what="A fictional name, business or address that coincides with a real, identifiable person or entity is changed or released before use — coincidence is a defect, not a defence — and only permitted telephone and plate numbers ever appear.",
         when="With the report, before any flagged element is shot or rendered."),
    dict(n=1361, id="chain", name="Chain of title + copyright report", stage="Before the shoot",
         what="Ownership proven as an unbroken filed record — origin plus every transfer, work-for-hire or option tested, contributors without releases found, encumbrances quitclaimed — verified by a copyright report covering domestic, foreign and renewal rights.",
         when="From acquisition onward, and re-run by the distributor at delivery."),
    dict(n=1362, id="title", name="The title report", stage="Before the shoot",
         what="The title is researched before final selection; the report lists prior same and similar uses, a conflict changes the title, and the report is filed for the distributors and insurers who require it.",
         when="Before the title is final — and again when the title is chosen at the end of the process."),
    dict(n=1363, id="releases", name="Release coverage", stage="During production",
         what="Written releases cover every recognizably depicted person — thinly disguised and deceased included, the latter via representatives or heirs — every performer, recognizable extra and crew member, and every distinctive location.",
         when="As each person, performance and location enters the production."),
    dict(n=1364, id="objects", name="The featured-object caution", stage="During production",
         what="Props, products, artwork and photographs are cleared one by one under an abundance of caution — prominence in the final form is unknowable in advance, and supplied or previously used items are never assumed already cleared.",
         when="Item by item, as dressing, props and artwork are placed."),
    dict(n=1365, id="living", name="The living report", stage="During production",
         what="The clearance report is updated whenever new material enters — script versions, boards, schedules, the shoot, post-production — and clearance monitoring runs at all stages, not as a single pass at the start.",
         when="Continuously, from inception through final cut."),
    dict(n=1366, id="decision", name="The recorded decision", stage="Closing the file",
         what="Every flagged item is closed by a recorded decision — license it, substitute it, change the way it is used, or expressly assume the risk — and an undecided flagged item blocks the element it flags.",
         when="Per flagged item, before the element it flags can ship."),
    dict(n=1367, id="gate", name="The final check + the gate", stage="Closing the file",
         what="Before exhibition the finished work is reviewed against the clearance file for what the script never contained, trailers and publicity receive their own clearance analysis, and the completed file is the gate — no completed clearance, no cover and no distribution.",
         when="Before exhibition, on the finished film — not the script."),
]
CLEARANCE_KINDS = ["character name", "place / address", "business / signage",
                   "product / trademark reference", "depicted person",
                   "performer / extra / crew", "distinctive location",
                   "prop / artwork / photograph", "title"]
CLEARANCE_DECISIONS = [("license", "License it"), ("substitute", "Substitute it"),
                       ("change-use", "Change the use"),
                       ("assume-risk", "Expressly assume the risk")]
CLEARANCE_DEFAULT_ITEMS = [
    dict(label="Lead character name — “Mara Venn”", kind="character name", flagged=False, decision=None),
    dict(label="Café signage — “Café Lumen” matches a real café chain", kind="business / signage", flagged=True, decision="substitute"),
    dict(label="Phone number on a flyer in shot 4", kind="place / address", flagged=True, decision="change-use"),
    dict(label="Poster artwork on the bedroom wall (generated)", kind="prop / artwork / photograph", flagged=True, decision=None),
    dict(label="Street address spoken in dialogue — checked, no match", kind="place / address", flagged=False, decision=None),
    dict(label="Working title — title report filed, no conflict", kind="title", flagged=False, decision=None),
    dict(label="Neighbour recognisable in a background plate", kind="depicted person", flagged=True, decision="license"),
    dict(label="Crew member visible in a behind-the-scenes still", kind="performer / extra / crew", flagged=True, decision="assume-risk"),
]


def clearance_eval(items):
    """Mirror of ClearanceEngine.evaluate (assets/js/clearance.js)."""
    dec_ids = [d for d, _ in CLEARANCE_DECISIONS]
    flagged = [i for i in items if i.get("flagged")]
    open_items = [i for i in flagged if i.get("decision") not in dec_ids]
    gate_open = bool(items) and not open_items
    if not items:
        verdict = "No file yet — the gate cannot be assessed. Log the production's items first."
    elif gate_open:
        verdict = ("Gate open — every flagged item carries a recorded decision (rule 1366). "
                   "The completed file can go forward to the final check (rule 1367).")
    else:
        n = len(open_items)
        verdict = (f"Gate held — {n} flagged item" + ("" if n == 1 else "s") +
                   " without a recorded decision. Under rule 1366 an undecided flagged item "
                   "blocks the element it flags; under rule 1367, no completed clearance, "
                   "no cover and no distribution.")
    return {"total": len(items), "flagged": len(flagged), "open": len(open_items),
            "gate_open": gate_open, "verdict": verdict}


def build_clearance(css_links):
    """Script Clearance desk — the clearance layer (research cycle 81,
    rules 1358–1367) as a working file: the ten steps, a log of the
    production's own items, a recorded decision per flag, and the gate
    verdict computed exactly as rules 1366–1367 state it. The default
    file is pre-rendered here under the same rules assets/js/clearance.js
    runs in the browser; the engine invents no items and no decisions —
    an item with no recorded decision holds the gate, on the record."""
    def esc(s):
        return html.escape(str(s if s is not None else ""))

    dec_label = dict(CLEARANCE_DECISIONS)
    steps_html = []
    for i, s in enumerate(CLEARANCE_STEPS):
        steps_html.append(
            f'<article class="cl-step"><div class="cl-step-head"><span class="cl-num">{i + 1}</span>'
            f'<h4>{esc(s["name"])}</h4><span class="cl-tag">Rule {s["n"]} · {esc(s["stage"])}</span></div>'
            f'<p class="cl-what">{esc(s["what"])}</p><p class="cl-when"><strong>When:</strong> {esc(s["when"])}</p>'
            f'<p><label><input type="checkbox" data-cl-step="{esc(s["id"])}"> Done — the paper is in the file</label></p></article>')
    r = clearance_eval(CLEARANCE_DEFAULT_ITEMS)
    stage_html = []
    for idx, it in enumerate(CLEARANCE_DEFAULT_ITEMS):
        s = (f'<article class="cl-item"><div class="cl-item-head"><h4>{esc(it["label"])}</h4>'
             f'<span class="cl-tag">{esc(it["kind"])}</span></div>')
        if it["flagged"]:
            s += (f'<p class="cl-flag">Flagged on research. Recorded decision: '
                  f'<strong>{esc(dec_label.get(it["decision"]) or "— no decision recorded —")}</strong></p>'
                  f'<p class="cl-decisions" role="group" aria-label="Record a decision for {esc(it["label"])}">'
                  + " ".join(
                      f'<button type="button" class="btn btn-sm{"" if it["decision"] == d else " btn-ghost"}" '
                      f'data-cl-dec="{idx}:{d}">{esc(label)}</button>'
                      for d, label in CLEARANCE_DECISIONS)
                  + "</p>")
        else:
            s += '<p class="cl-clear">Clear on research — no flag raised.</p>'
        s += (f'<p><button type="button" class="btn btn-sm btn-ghost" data-cl-del="{idx}">'
              f'Remove item</button></p></article>')
        stage_html.append(s)
    kind_opts = "".join(f'<option value="{esc(k)}">{esc(k)}</option>' for k in CLEARANCE_KINDS)
    (SITE / "clearance.html").write_text(CLEARANCE_TMPL.format(
        css=css_links, sitenav=nav_html("", "clearance.html"), footer=footer_html(""),
        hero=hero_cutroom(
            kicker="""The cutting room""",
            h1="""Script <span class="accent">clearance.</span>""",
            lede="""Every name, place, business and object in the script, researched against the real world — and proved in a file. The ten steps, your production's items, a recorded decision for every flag, and the gate the insurer and the distributor both check: no completed clearance, no cover, no distribution.""",
            deck_title="""CLEARANCE — THE_FILE""",
            clips={"v2": ['The file'], "v1": ['Report', 'Chain', 'Title'], "a1": ['The gate']},
            h1_id="cl-title-h",
            extra=""" """),
        cl_steps="".join(steps_html),
        cl_steps_state="Steps complete: 0 of 10 — the file is not complete until every step is done.",
        cl_kind_options=kind_opts,
        cl_verdict=html.escape(r["verdict"]), cl_stage="".join(stage_html)))
    return [("clearance.html", "Script clearance")]



CONTINUITY_TMPL = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Continuity ledger — AI Film Master Guide</title>
  <meta name="description" content="The character-consistency chapter as a working ledger: the five pre-generation locks, every character, wardrobe, prop, location and lighting lock logged with its state, and the chaining verdict computed from the chapter's own rejection rules.">
  {css}
  <style>
    .ct-verdict {{ font-size: 1.05rem; border-left: 3px solid var(--gold); padding-left: var(--space-4); margin-bottom: var(--space-6); }}
    .ct-held {{ border-left-color: #e88; }}
    .ct-lock-card, .ct-entry {{ border: 1px solid var(--line); border-radius: 12px; padding: var(--space-4) var(--space-5); margin-bottom: var(--space-4); }}
    .ct-lock-head, .ct-entry-head {{ display: flex; align-items: baseline; gap: var(--space-3); flex-wrap: wrap; }}
    .ct-lock-head h4, .ct-entry-head h4 {{ margin: 0; font-size: 1.2rem; }}
    .ct-num {{ display: inline-block; min-width: 1.7em; text-align: center; background: var(--gold); color: #111; border-radius: 999px; font-weight: 800; padding: .1em .3em; }}
    .ct-tag {{ margin-left: auto; font-size: .78rem; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }}
    .ct-what, .ct-lock, .ct-state {{ color: var(--muted); }}
    .ct-state strong {{ color: var(--text); }}
  </style>
</head>
<body>
  <div class="edge-right" aria-hidden="true"></div>
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
      <span class="hdr-tc" data-hdr-tc aria-hidden="true"><span class="hdr-rec">&#9679;</span> <span class="hdr-tc-val">00:59:52:00</span></span>
      <button type="button" class="btn btn-sm btn-ghost palette-open" aria-label="Search the guide (Ctrl+K)">
        <span aria-hidden="true">&#8984;K</span> Search
      </button>
    </div>
  </header>
  <main id="main">
    {hero}
    <section class="container" aria-labelledby="ct-h">
      <h2 id="ct-h">The five locks — before any generation</h2>
      <p>The consistency chapter opens with the sentence every AI filmmaker learns the expensive way: this is where most festival entries die. The five locks below are the chapter's own pre-generation checklist; the full chapter is <a href="craft/character-consistency.html">Character Consistency</a>. Tick a lock when the production has actually done it — the ledger counts what is written down, not intentions.</p>
      <div id="ct-locks">{ct_locks}</div>
      <p class="calc-note" id="ct-locks-state" aria-live="polite">{ct_locks_state}</p>
      <h2>Your continuity ledger</h2>
      <p>Log every lock the film depends on — a face, a wardrobe line pasted verbatim, a hero prop, a location master still, the light of a scene, the era and grade. Mark each one as it stands today: locked, drifted, or broken. The verdict follows the chapter's rejection rules: a clip fails if the face drifts, the wardrobe changes, or the light flips — and failed clips don't chain, they get re-prompted. The ledger opens on a worked example: a small AI short with one wardrobe lock drifted, so the first verdict you see is the honest hold.</p>
      <div class="card" style="margin-bottom:var(--space-6);">
        <div class="calc-grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr));">
          <div class="field">
            <label for="ct-title">Production title</label>
            <input class="input" type="text" id="ct-title" placeholder="e.g. The Night Bus">
          </div>
          <div class="field">
            <label for="ct-new-subject">New lock — subject</label>
            <input class="input" type="text" id="ct-new-subject" placeholder="e.g. Mara Venn — wardrobe, night scenes">
          </div>
          <div class="field">
            <label for="ct-new-kind">Lock kind</label>
            <select class="input" id="ct-new-kind">{ct_kind_options}</select>
          </div>
          <div class="field">
            <label for="ct-new-lock">The lock itself — verbatim wording or reference</label>
            <input class="input" type="text" id="ct-new-lock" placeholder="e.g. Character sheet v3 + Soul ID, 42 photos">
          </div>
          <div class="field">
            <label for="ct-new-status">State today</label>
            <select class="input" id="ct-new-status">{ct_status_options}</select>
          </div>
          <div class="field">
            <label aria-hidden="true">&nbsp;</label>
            <button type="button" class="btn" id="ct-add">Add lock to the ledger</button>
          </div>
        </div>
        <p class="calc-note" id="ct-msg" hidden></p>
      </div>
      <p class="ct-verdict" id="ct-verdict" aria-live="polite">{ct_verdict}</p>
      <div id="ct-stage">{ct_stage}</div>
      <div class="card" style="margin-top:var(--space-6);">
        <h3>Take the ledger</h3>
        <p>The ledger exports as clean markdown: the five-lock checklist with its state, every logged lock with its state and verbatim wording, and the chaining verdict — the file the next shoot day starts from.</p>
        <p><button type="button" class="btn" id="ct-copy">Copy ledger</button> <button type="button" class="btn btn-ghost" id="ct-download">Download ledger (.md)</button></p>
        <p><a class="btn btn-ghost" href="craft/character-consistency.html">Read the consistency chapter</a> <a class="btn btn-ghost" href="style-bible.html">Style bible</a> <a class="btn btn-ghost" href="forge.html">Episode forge</a></p>
      </div>
    </section>
  </main>
  <footer class="site-footer">
    <div class="container footer-grid">
      <p>AI Film Master Guide — research notes for professional AI filmmaking. Sources linked per chapter.</p>
      <nav aria-label="Footer">{footer}</nav>
      <div class="footer-colophon"><span class="tc">TC 00:00:00:00</span><span class="tailpop">Tail pop</span><span>Cut in the cutting room</span><span class="tail">AI Film Master Guide — craft, not buttons</span></div>
    </div>
  </footer>
  <div class="palette" id="palette" role="dialog" aria-modal="true" aria-label="Search" hidden>
    <div class="palette-box">
      <input type="search" id="palette-input" placeholder="Search the guide…" aria-label="Search the guide">
      <div id="palette-results" role="listbox" aria-label="Search results"></div>
    </div>
  </div>
  <script src="assets/js/palette.js"></script>
  <script src="assets/js/continuity.js"></script>
  <script src="assets/js/docs.js"></script>
  <script src="assets/js/identity.js"></script>
</body>
</html>
"""


# The continuity layer — kept in step with assets/js/continuity.js
# (ContinuityEngine). scripts/continuity.test.js pins the engine, and
# the pre-rendered default ledger below is rendered under the same
# rules. Source: craft/character-consistency.md — its checklist, its
# identity stack, and its rejection rules, quoted in substance.
CONTINUITY_LOCKS = [
    dict(id="identity", name="Identity system chosen and trained",
         what="The identity stack, ranked by reliability: trained identity (Soul ID) first, then the character sheet as reference, then a per-generation reference upload. Text description alone is the weakest — never rely on prose to hold a face across 50 shots."),
    dict(id="wardrobe", name="Wardrobe description locked, verbatim",
         what="Write the wardrobe once, in exact language, and paste it verbatim into every prompt. A mid-film wardrobe change is a new locked description — never improvised per shot. Props get the same treatment: one description, reused exactly."),
    dict(id="locations", name="Location master stills approved",
         what="Generate and approve a master still of each location first. Every shot in that location starts from it or references it."),
    dict(id="light", name="Light direction + time of day locked per scene",
         what="Lock time of day and light direction per scene — \u201cgolden-hour side light from frame left\u201d in every prompt of the scene. Pick the era and colour palette up front; don't grade shot-by-shot and hope."),
    dict(id="startframe", name="Start frame is real, never invented",
         what="Every clip starts from the last frame of the previous approved clip, or from the approved-frame library. Never fabricate a start frame. One human per start frame on character-led work — crowded frames multiply failure modes."),
]

CONTINUITY_KINDS = ["identity", "wardrobe", "prop", "location", "lighting", "era / grade"]

CONTINUITY_STATUSES = [
    ("locked", "Locked — holds"),
    ("drifted", "Drifted — off the lock"),
    ("broken", "Broken — fails the rejection rules"),
]

# Mirror of DEFAULT_ENTRIES in assets/js/continuity.js.
CONTINUITY_DEFAULT_ENTRIES = [
    dict(subject="Mara Venn — face", kind="identity", lock="Character sheet v3 (front / 3-4 / side) + Soul ID trained on 42 photos", status="locked"),
    dict(subject="Mara Venn — wardrobe, scenes 1–6", kind="wardrobe", lock="\u201cworn brown leather jacket, white t-shirt, dark jeans, scuffed boots\u201d — pasted verbatim", status="drifted"),
    dict(subject="Ledger prop (hero)", kind="prop", lock="One description, reused exactly: \u201cbrass-bound ledger, cracked spine, red ribbon marker\u201d", status="locked"),
    dict(subject="Night-bus interior", kind="location", lock="Master still NB-MASTER-02 approved; every interior shot references it", status="locked"),
    dict(subject="Bus scenes — light", kind="lighting", lock="Night; sodium practicals from frame right; no daylight plates", status="locked"),
    dict(subject="Era / grade — whole film", kind="era / grade", lock="Early-90s palette locked up front; grade applied to the cut, not per shot", status="locked"),
]


def continuity_eval(entries):
    """Mirror of ContinuityEngine.evaluate (assets/js/continuity.js)."""
    drifted = [e for e in entries if e.get("status") == "drifted"]
    broken = [e for e in entries if e.get("status") == "broken"]
    clean = bool(entries) and not drifted and not broken
    if not entries:
        verdict = "No ledger yet — nothing is locked, so nothing can hold. Log the production's locks first."
    elif broken:
        n = len(broken)
        verdict = (f"Chain stopped — {n} broken lock" + ("" if n == 1 else "s") +
                   ". Under the chapter's rejection rules a clip fails if the face drifts, "
                   "the wardrobe changes, or the light flips; failed clips don't chain — "
                   "they get re-prompted from the last approved frame.")
    elif drifted:
        n = len(drifted)
        verdict = (f"Hold — {n} lock" + (" has" if n == 1 else "s have") +
                   " drifted off the locked wording or reference. Re-lock before the next "
                   "generation: drift compounds shot over shot, and the next clip chains "
                   "from this one.")
    else:
        verdict = ("Continuity clean — every logged lock holds. Chain from the approved "
                   "frames and keep logging: a lock that is not in the ledger is not locked.")
    return {"total": len(entries), "locked": len(entries) - len(drifted) - len(broken),
            "drifted": len(drifted), "broken": len(broken), "clean": clean,
            "verdict": verdict}


def build_continuity(css_links):
    """Continuity Ledger — the character-consistency chapter
    (craft/character-consistency.md) as a working ledger: the five
    pre-generation locks, the production's own logged locks with
    their observed states, and the chaining verdict computed exactly
    as the chapter's rejection rules state it. The default ledger is
    pre-rendered here under the same rules assets/js/continuity.js
    runs in the browser; the engine invents no locks and no states —
    a drifted or broken lock holds or stops the chain, on the record."""
    def esc(s):
        return html.escape(str(s if s is not None else ""))

    status_label = dict(CONTINUITY_STATUSES)
    locks_html = []
    for i, s in enumerate(CONTINUITY_LOCKS):
        locks_html.append(
            f'<article class="ct-lock-card"><div class="ct-lock-head"><span class="ct-num">{i + 1}</span>'
            f'<h4>{esc(s["name"])}</h4><span class="ct-tag">Pre-generation lock</span></div>'
            f'<p class="ct-what">{esc(s["what"])}</p>'
            f'<p><label><input type="checkbox" data-ct-lock="{esc(s["id"])}"> Done — the lock is written down</label></p></article>')
    r = continuity_eval(CONTINUITY_DEFAULT_ENTRIES)
    stage_html = []
    for idx, e in enumerate(CONTINUITY_DEFAULT_ENTRIES):
        s = (f'<article class="ct-entry"><div class="ct-entry-head"><h4>{esc(e["subject"])}</h4>'
             f'<span class="ct-tag">{esc(e["kind"])}</span></div>'
             f'<p class="ct-lock">Lock: {esc(e["lock"])}</p>'
             f'<p class="ct-state">State: <strong>{esc(status_label.get(e["status"]) or "— no state recorded —")}</strong></p>'
             f'<p class="ct-states" role="group" aria-label="Set the state for {esc(e["subject"])}">'
             + " ".join(
                 f'<button type="button" class="btn btn-sm{"" if e["status"] == sid else " btn-ghost"}" '
                 f'data-ct-set="{idx}:{sid}">{esc(label)}</button>'
                 for sid, label in CONTINUITY_STATUSES)
             + "</p>"
             f'<p><button type="button" class="btn btn-sm btn-ghost" data-ct-del="{idx}">'
             f'Remove lock</button></p></article>')
        stage_html.append(s)
    kind_opts = "".join(f'<option value="{esc(k)}">{esc(k)}</option>' for k in CONTINUITY_KINDS)
    status_opts = "".join(f'<option value="{esc(sid)}">{esc(label)}</option>' for sid, label in CONTINUITY_STATUSES)
    (SITE / "continuity.html").write_text(CONTINUITY_TMPL.format(
        css=css_links, sitenav=nav_html("", "continuity.html"), footer=footer_html(""),
        hero=hero_cutroom(
            kicker="""The cutting room""",
            h1="""Continuity <span class="accent">ledger.</span>""",
            lede="""Keeping people and worlds stable across shots is where most festival entries die. The five locks before any generation, every lock your film depends on logged with its state today, and the chaining verdict from the chapter's own rejection rules: failed clips don't chain — they get re-prompted.""",
            deck_title="""CONTINUITY — THE_LEDGER""",
            clips={"v2": ['The locks'], "v1": ['Face', 'Wardrobe', 'Light'], "a1": ['The chain']},
            h1_id="ct-title-h",
            extra=""" """),
        ct_locks="".join(locks_html),
        ct_locks_state="Checklist complete: 0 of 5 — the checklist is the gate before any generation; finish it first.",
        ct_kind_options=kind_opts, ct_status_options=status_opts,
        ct_verdict=html.escape(r["verdict"]), ct_stage="".join(stage_html)))
    return [("continuity.html", "Continuity ledger")]


CUESHEET_TMPL = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Cue sheet — AI Film Master Guide</title>
  <meta name="description" content="The sound, music & audio chapter as a working cue sheet: the five pre-mix gates, every scene logged with its three layers and dialogue route, and the mix verdict computed from the chapter's own rules — no bed means dry, a missing layer holds the mix.">
  {css}
  <style>
    .cs-verdict {{ font-size: 1.05rem; border-left: 3px solid var(--gold); padding-left: var(--space-4); margin-bottom: var(--space-6); }}
    .cs-held {{ border-left-color: #e88; }}
    .cs-gate-card, .cs-entry {{ border: 1px solid var(--line); border-radius: 12px; padding: var(--space-4) var(--space-5); margin-bottom: var(--space-4); }}
    .cs-gate-head, .cs-entry-head {{ display: flex; align-items: baseline; gap: var(--space-3); flex-wrap: wrap; }}
    .cs-gate-head h4, .cs-entry-head h4 {{ margin: 0; font-size: 1.2rem; }}
    .cs-num {{ display: inline-block; min-width: 1.7em; text-align: center; background: var(--gold); color: #111; border-radius: 999px; font-weight: 800; padding: .1em .3em; }}
    .cs-tag {{ margin-left: auto; font-size: .78rem; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }}
    .cs-what, .cs-detail, .cs-state {{ color: var(--muted); }}
    .cs-state strong {{ color: var(--text); }}
    .cs-note {{ font-size: .85rem; }}
  </style>
</head>
<body>
  <div class="edge-right" aria-hidden="true"></div>
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
      <span class="hdr-tc" data-hdr-tc aria-hidden="true"><span class="hdr-rec">&#9679;</span> <span class="hdr-tc-val">00:59:52:00</span></span>
      <button type="button" class="btn btn-sm btn-ghost palette-open" aria-label="Search the guide (Ctrl+K)">
        <span aria-hidden="true">&#8984;K</span> Search
      </button>
    </div>
  </header>
  <main id="main">
    {hero}
    <section class="container" aria-labelledby="cs-h">
      <h2 id="cs-h">The five gates — before the mix</h2>
      <p>The sound chapter opens with the claim every AI filmmaker pays to learn: sound is half the picture, and finished films are designed, not slapped together. The five gates below are the chapter's own pre-mix discipline; the full chapter is <a href="craft/sound-music-audio.html">Sound, Music &amp; Audio</a>. Tick a gate when the production has actually done it — the sheet counts what is written down, not intentions.</p>
      <div id="cs-gates">{cs_gates}</div>
      <p class="calc-note" id="cs-gates-state" aria-live="polite">{cs_gates_state}</p>
      <h2>Your cue sheet</h2>
      <p>Log every scene with the three layers the chapter requires — the ambient bed, the foley that makes movement physical, the accents that land the story beats — and the dialogue route chosen for it: decoupled when the words must be exact, native for short ambient lines, never mixed mid-scene. Mark each scene as it stands today: designed, thin, or dry. One rule is mechanical: a scene with no bed reads dry whatever you claim, because the bed runs under everything and never drops to digital silence. The sheet opens on a worked example — the same small AI short the Continuity Ledger tracks, heard instead of seen — with the rain stop's foley not yet laid, so the first verdict you see is the honest hold.</p>
      <div class="card" style="margin-bottom:var(--space-6);">
        <div class="calc-grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr));">
          <div class="field">
            <label for="cs-title">Production title</label>
            <input class="input" type="text" id="cs-title" placeholder="e.g. The Night Bus">
          </div>
          <div class="field">
            <label for="cs-new-scene">New scene</label>
            <input class="input" type="text" id="cs-new-scene" placeholder="e.g. Sc 6 — Rooftop, dawn">
          </div>
          <div class="field">
            <label for="cs-new-route">Dialogue route</label>
            <select class="input" id="cs-new-route">{cs_route_options}</select>
          </div>
          <div class="field">
            <label for="cs-new-detail">What the layers are — specifically, physically</label>
            <input class="input" type="text" id="cs-new-detail" placeholder="e.g. Bed: dawn birds, distant traffic. Foley: gravel steps.">
          </div>
          <div class="field">
            <label for="cs-new-status">State today</label>
            <select class="input" id="cs-new-status">{cs_status_options}</select>
          </div>
          <div class="field">
            <label>Layers laid</label>
            <p style="margin:.2em 0;">
              <label><input type="checkbox" id="cs-new-bed" checked> Bed</label>
              <label><input type="checkbox" id="cs-new-foley" checked> Foley</label>
              <label><input type="checkbox" id="cs-new-accents" checked> Accents</label>
            </p>
          </div>
          <div class="field">
            <label aria-hidden="true">&nbsp;</label>
            <button type="button" class="btn" id="cs-add">Add scene to the sheet</button>
          </div>
        </div>
        <p class="calc-note" id="cs-msg" hidden></p>
      </div>
      <p class="cs-verdict" id="cs-verdict" aria-live="polite">{cs_verdict}</p>
      <div id="cs-stage">{cs_stage}</div>
      <div class="card" style="margin-top:var(--space-6);">
        <h3>Take the sheet</h3>
        <p>The sheet exports as clean markdown: the five gates with their state, every scene with its route, its layers, and its verdict state, and the mix verdict — the file the mix session starts from.</p>
        <p><button type="button" class="btn" id="cs-copy">Copy sheet</button> <button type="button" class="btn btn-ghost" id="cs-download">Download sheet (.md)</button></p>
        <p><a class="btn btn-ghost" href="craft/sound-music-audio.html">Read the sound chapter</a> <a class="btn btn-ghost" href="continuity.html">Continuity ledger</a> <a class="btn btn-ghost" href="studio.html">Studio</a></p>
      </div>
    </section>
  </main>
  <footer class="site-footer">
    <div class="container footer-grid">
      <p>AI Film Master Guide — research notes for professional AI filmmaking. Sources linked per chapter.</p>
      <nav aria-label="Footer">{footer}</nav>
      <div class="footer-colophon"><span class="tc">TC 00:00:00:00</span><span class="tailpop">Tail pop</span><span>Cut in the cutting room</span><span class="tail">AI Film Master Guide — craft, not buttons</span></div>
    </div>
  </footer>
  <div class="palette" id="palette" role="dialog" aria-modal="true" aria-label="Search" hidden>
    <div class="palette-box">
      <input type="search" id="palette-input" placeholder="Search the guide…" aria-label="Search the guide">
      <div id="palette-results" role="listbox" aria-label="Search results"></div>
    </div>
  </div>
  <script src="assets/js/palette.js"></script>
  <script src="assets/js/cuesheet.js"></script>
  <script src="assets/js/docs.js"></script>
  <script src="assets/js/identity.js"></script>
</body>
</html>
"""


# The cue-sheet layer — kept in step with assets/js/cuesheet.js
# (CueSheetEngine). scripts/cuesheet.test.js pins the engine, and
# the pre-rendered default sheet below is rendered under the same
# rules. Source: craft/sound-music-audio.md — its three layers,
# its dialogue routes, its build order, and its mix QC, quoted in
# substance.
CUESHEET_GATES = [
    dict(id="bible", name="Voice Bible written for every speaking character",
         what="Register, timbre, tempo, manner — written per character before generating, and referenced by every generation after. Test the voice on the character's hardest line first, not a demo sentence: a voice that collapses on the hardest scene was never cast."),
    dict(id="routes", name="Dialogue route chosen per scene — never mixed mid-scene",
         what="Road A, native: the model generates picture plus synced dialogue in one pass — best for short lines and ambient realism. Road B, decoupled: silent clip, separately produced voice, a lip-sync pass that reshapes only the mouth. Rule of thumb: if the words must be exact, take Road B."),
    dict(id="lockedcut", name="Score briefed per cue, cut to the locked cut",
         what="Brief by emotional function, not genre — genre, tempo, instrumentation, the cue's job, what to avoid — and generate 3–5 variants per cue to comp. Temp-track discipline: cut to a temp score first, then generate the final score to the locked cut. Never score a moving target."),
    dict(id="stems", name="Stems kept for the score and the voices",
         what="Dialogue ducks badly under a full stereo mix; stems let the mix breathe. Keep the score's stems and every voice take separate until the mix is signed off — a bounced stereo pair is a decision you cannot unmake."),
    dict(id="receipts", name="Generation receipts saved for every AI voice and cue",
         what="AI-generated music and voices sit in the murkiest rights territory in the guide. Keep the receipts — prompts, dates, tool, terms version — for every generated voice and cue, and read the rights chapter before distributing anything with AI music in it."),
]

CUESHEET_LAYERS = [("bed", "Bed"), ("foley", "Foley"), ("accents", "Accents")]

CUESHEET_ROUTES = [
    ("decoupled", "Decoupled — voice built separately, lip-sync pass"),
    ("native", "Native — model generates picture + dialogue"),
    ("none", "No dialogue — sound design only"),
]

CUESHEET_STATUSES = [
    ("designed", "Designed — built and checked"),
    ("thin", "Thin — a layer missing or rough"),
    ("dry", "Dry — drops to digital silence"),
]

# Mirror of DEFAULT_ENTRIES in assets/js/cuesheet.js.
CUESHEET_DEFAULT_ENTRIES = [
    dict(scene="Sc 1 — Depot at night, Mara waits", route="decoupled",
         detail="Bed: depot room tone, rain on the canopy. Foley: boots on wet concrete, bag set down. Accent: the departure-board flip on her line.",
         layers=dict(bed=True, foley=True, accents=True), status="designed"),
    dict(scene="Sc 2 — On the bus, the hardest line", route="decoupled",
         detail="Voice per the Voice Bible (chest register, unhurried, flat warmth), comped from paragraph takes. Bed: engine idle under everything. Accent: ticket punch on the turn.",
         layers=dict(bed=True, foley=True, accents=True), status="designed"),
    dict(scene="Sc 3 — The rain stop", route="decoupled",
         detail="Bed: rain on the shelter roof, road hiss. Accents: bus sigh and door chime laid. Foley not laid yet — her walk to the shelter is still silent under the bed.",
         layers=dict(bed=True, foley=False, accents=True), status="thin"),
    dict(scene="Sc 4 — Depot office, radio voices", route="native",
         detail="Short native lines only — nothing word-exact in this scene. Bed: office tone, fluorescent hum. Foley: mug, keys, chair. Accent: radio squelch into the reveal.",
         layers=dict(bed=True, foley=True, accents=True), status="designed"),
    dict(scene="Sc 5 — Departure, the button", route="none",
         detail="No dialogue — the scene plays on design alone. Bed: depot tone thinning as the bus pulls out. Foley: steps, door, pull-away. Accent: one brake sigh under the final frame; score enters only after.",
         layers=dict(bed=True, foley=True, accents=True), status="designed"),
]


def cuesheet_effective(e):
    """Mirror of CueSheetEngine.effectiveStatus (assets/js/cuesheet.js):
    no bed reads dry, whatever state was recorded."""
    if not e.get("layers") or not e["layers"].get("bed"):
        return "dry"
    return e.get("status") if e.get("status") in dict(CUESHEET_STATUSES) else "thin"


def cuesheet_eval(entries):
    """Mirror of CueSheetEngine.evaluate (assets/js/cuesheet.js)."""
    eff = [cuesheet_effective(e) for e in entries]
    designed = eff.count("designed")
    thin = eff.count("thin")
    dry = eff.count("dry")
    clean = bool(entries) and thin == 0 and dry == 0
    if not entries:
        verdict = "No cue sheet yet — nothing is designed, so the film is silent by default. Log the scenes first."
    elif dry:
        verdict = (f"Mix stopped — {dry} scene" + (" runs" if dry == 1 else "s run") +
                   " dry: no ambient bed under the scene, so the cut drops to digital silence. "
                   "The bed runs under everything; build it first — backgrounds first, hard FX "
                   "second, foley third — before anything else is judged.")
    elif thin:
        verdict = (f"Hold the mix — {thin} scene" + (" is" if thin == 1 else "s are") +
                   " thin: a layer is missing or rough. Work the build order — dialogue first, "
                   "then the SFX bed, then music last; a thin scene finished under a full score "
                   "stays thin.")
    else:
        verdict = ("Mix clean — every logged scene carries its three layers on a bed that never "
                   "drops out. Before calling it done: the three-way listen (headphones, laptop "
                   "speakers, phone) and the silence test — mute the music, and the scene must "
                   "still play on dialogue and SFX alone.")
    return {"total": len(entries), "designed": designed, "thin": thin, "dry": dry,
            "clean": clean, "verdict": verdict}


def build_cuesheet(css_links):
    """Cue Sheet — the sound, music & audio chapter
    (craft/sound-music-audio.md) as a working cue sheet: the five
    pre-mix gates, the production's own scenes with their three
    layers and dialogue routes, and the mix verdict computed
    exactly as the chapter's rules state it. The default sheet is
    pre-rendered here under the same rules assets/js/cuesheet.js
    runs in the browser; the engine invents no scenes and no
    states — a scene with no bed reads dry, a thin scene holds
    the mix, on the record."""
    def esc(s):
        return html.escape(str(s if s is not None else ""))

    status_label = dict(CUESHEET_STATUSES)
    route_label = dict(CUESHEET_ROUTES)
    gates_html = []
    for i, s in enumerate(CUESHEET_GATES):
        gates_html.append(
            f'<article class="cs-gate-card"><div class="cs-gate-head"><span class="cs-num">{i + 1}</span>'
            f'<h4>{esc(s["name"])}</h4><span class="cs-tag">Pre-mix gate</span></div>'
            f'<p class="cs-what">{esc(s["what"])}</p>'
            f'<p><label><input type="checkbox" data-cs-gate="{esc(s["id"])}"> Done — the gate is written down</label></p></article>')
    r = cuesheet_eval(CUESHEET_DEFAULT_ENTRIES)
    stage_html = []
    for idx, e in enumerate(CUESHEET_DEFAULT_ENTRIES):
        eff = cuesheet_effective(e)
        s = (f'<article class="cs-entry"><div class="cs-entry-head"><h4>{esc(e["scene"])}</h4>'
             f'<span class="cs-tag">{esc((route_label.get(e["route"]) or "—").split(" — ")[0])}</span></div>'
             f'<p class="cs-detail">{esc(e["detail"])}</p>'
             f'<p class="cs-layers" role="group" aria-label="Layers present in {esc(e["scene"])}">'
             + " ".join(
                 f'<button type="button" class="btn btn-sm{"" if e["layers"].get(lid) else " btn-ghost"}" '
                 f'data-cs-layer="{idx}:{lid}" aria-pressed="{"true" if e["layers"].get(lid) else "false"}">'
                 f'{esc(label)}{" ✓" if e["layers"].get(lid) else " —"}</button>'
                 for lid, label in CUESHEET_LAYERS)
             + "</p>"
             f'<p class="cs-state">State: <strong>{esc(status_label.get(eff) or "— no state recorded —")}</strong></p>'
             f'<p class="cs-states" role="group" aria-label="Set the state for {esc(e["scene"])}">'
             + " ".join(
                 f'<button type="button" class="btn btn-sm{"" if e["status"] == sid else " btn-ghost"}" '
                 f'data-cs-set="{idx}:{sid}">{esc(label)}</button>'
                 for sid, label in CUESHEET_STATUSES)
             + "</p>"
             f'<p><button type="button" class="btn btn-sm btn-ghost" data-cs-del="{idx}">'
             f'Remove scene</button></p></article>')
        stage_html.append(s)
    route_opts = "".join(f'<option value="{esc(k)}">{esc(v)}</option>' for k, v in CUESHEET_ROUTES)
    status_opts = "".join(f'<option value="{esc(sid)}">{esc(label)}</option>' for sid, label in CUESHEET_STATUSES)
    (SITE / "cuesheet.html").write_text(CUESHEET_TMPL.format(
        css=css_links, sitenav=nav_html("", "cuesheet.html"), footer=footer_html(""),
        hero=hero_cutroom(
            kicker="""The cutting room""",
            h1="""Cue <span class="accent">sheet.</span>""",
            lede="""Sound is half the picture. The five gates before the mix, every scene logged with its three layers — bed, foley, accents — and its dialogue route, and the mix verdict from the sound chapter's own rules: no bed means dry, and a thin scene holds the mix.""",
            deck_title="""SOUND — THE_CUE_SHEET""",
            clips={"v2": ['The mix'], "v1": ['Bed', 'Foley', 'Accents'], "a1": ['Dialogue']},
            h1_id="cs-title-h",
            extra=""" """),
        cs_gates="".join(gates_html),
        cs_gates_state="Gates complete: 0 of 5 — the gates are the discipline before any scene is judged; finish them first.",
        cs_route_options=route_opts, cs_status_options=status_opts,
        cs_verdict=html.escape(r["verdict"]), cs_stage="".join(stage_html)))
    return [("cuesheet.html", "Cue sheet")]


GRADE_TMPL = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Grade sheet — AI Film Master Guide</title>
  <meta name="description" content="The color-grading chapter as a working grade sheet: the five pre-grade gates, every scene logged with its hero reference, its source, and its five matching steps, and the grade verdict computed from the chapter's own rules — no reference means unmatched, unfinished steps hold the grade.">
  {css}
  <style>
    .gr-verdict {{ font-size: 1.05rem; border-left: 3px solid var(--gold); padding-left: var(--space-4); margin-bottom: var(--space-6); }}
    .gr-held {{ border-left-color: #e88; }}
    .gr-gate-card, .gr-entry {{ border: 1px solid var(--line); border-radius: 12px; padding: var(--space-4) var(--space-5); margin-bottom: var(--space-4); }}
    .gr-gate-head, .gr-entry-head {{ display: flex; align-items: baseline; gap: var(--space-3); flex-wrap: wrap; }}
    .gr-gate-head h4, .gr-entry-head h4 {{ margin: 0; font-size: 1.2rem; }}
    .gr-num {{ display: inline-block; min-width: 1.7em; text-align: center; background: var(--gold); color: #111; border-radius: 999px; font-weight: 800; padding: .1em .3em; }}
    .gr-tag {{ margin-left: auto; font-size: .78rem; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }}
    .gr-what, .gr-detail, .gr-state {{ color: var(--muted); }}
    .gr-state strong {{ color: var(--text); }}
    .gr-note {{ font-size: .85rem; }}
  </style>
</head>
<body>
  <div class="edge-right" aria-hidden="true"></div>
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
      <span class="hdr-tc" data-hdr-tc aria-hidden="true"><span class="hdr-rec">&#9679;</span> <span class="hdr-tc-val">00:59:52:00</span></span>
      <button type="button" class="btn btn-sm btn-ghost palette-open" aria-label="Search the guide (Ctrl+K)">
        <span aria-hidden="true">&#8984;K</span> Search
      </button>
    </div>
  </header>
  <main id="main">
    {hero}
    <section class="container" aria-labelledby="gr-h">
      <h2 id="gr-h">The five gates — before the grade</h2>
      <p>Every AI generation arrives with its own built-in grade — the model's idea of what "cinematic" looks like, baked into the pixels. On a multi-shot production that is 40 different colorists who never met; the colorist's job is unification. The five gates below are the grading chapter's own discipline before any scene is touched; the full chapter is <a href="craft/color-grading.html">Color Grading AI Footage</a>. Tick a gate when the production has actually done it — the sheet counts what is written down, not intentions.</p>
      <div id="gr-gates">{gr_gates}</div>
      <p class="calc-note" id="gr-gates-state" aria-live="polite">{gr_gates_state}</p>
      <h2>Your grade sheet</h2>
      <p>Log every scene with its hero reference (one shot per scene that every other shot is matched to), its source (one model, or several — different models carry different house grades, and mixed scenes unify harder), and the five matching steps in order: exposure and white balance, contrast curve, saturation, then the de-plasticize texture pass (fine grain, a whisper of chromatic aberration, soften — never sharpen), skin last and on a big screen. Mark each scene as it stands today: unified, drifting, or unmatched. Two rules are mechanical: a scene with no hero reference reads unmatched whatever you claim, because unification is matching to a reference; and a scene claimed unified with steps unfinished reads drifting, because the creative look never goes on before the match. The sheet opens on a worked example — the same small AI short the Ledger and the Cue Sheet track, graded instead of seen or heard — with the rain stop shot across two models and its saturation unmatched, so the first verdict you see is the honest hold.</p>
      <div class="card" style="margin-bottom:var(--space-6);">
        <div class="calc-grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr));">
          <div class="field">
            <label for="gr-title">Production title</label>
            <input class="input" type="text" id="gr-title" placeholder="e.g. The Night Bus">
          </div>
          <div class="field">
            <label for="gr-new-scene">New scene</label>
            <input class="input" type="text" id="gr-new-scene" placeholder="e.g. Sc 6 — Rooftop, dawn">
          </div>
          <div class="field">
            <label for="gr-new-source">Source</label>
            <select class="input" id="gr-new-source">{gr_source_options}</select>
          </div>
          <div class="field">
            <label for="gr-new-detail">What the match is — specifically, on the scopes</label>
            <input class="input" type="text" id="gr-new-detail" placeholder="e.g. Hero: the doorway wide. Blacks matched, skin on the line.">
          </div>
          <div class="field">
            <label for="gr-new-status">State today</label>
            <select class="input" id="gr-new-status">{gr_status_options}</select>
          </div>
          <div class="field">
            <label>Reference + steps done</label>
            <p style="margin:.2em 0;">
              <label><input type="checkbox" id="gr-new-reference" checked> Hero reference</label>
              <label><input type="checkbox" id="gr-new-exposure"> Exposure</label>
              <label><input type="checkbox" id="gr-new-contrast"> Contrast</label>
              <label><input type="checkbox" id="gr-new-saturation"> Saturation</label>
              <label><input type="checkbox" id="gr-new-texture"> Texture</label>
              <label><input type="checkbox" id="gr-new-skin"> Skin</label>
            </p>
          </div>
          <div class="field">
            <label aria-hidden="true">&nbsp;</label>
            <button type="button" class="btn" id="gr-add">Add scene to the sheet</button>
          </div>
        </div>
        <p class="calc-note" id="gr-msg" hidden></p>
      </div>
      <p class="gr-verdict" id="gr-verdict" aria-live="polite">{gr_verdict}</p>
      <div id="gr-stage">{gr_stage}</div>
      <div class="card" style="margin-top:var(--space-6);">
        <h3>Take the sheet</h3>
        <p>The sheet exports as clean markdown: the five gates with their state, every scene with its source, its reference, its steps, and its verdict state, and the grade verdict — the file the grading session starts from.</p>
        <p><button type="button" class="btn" id="gr-copy">Copy sheet</button> <button type="button" class="btn btn-ghost" id="gr-download">Download sheet (.md)</button></p>
        <p><a class="btn btn-ghost" href="craft/color-grading.html">Read the grading chapter</a> <a class="btn btn-ghost" href="cuesheet.html">Cue sheet</a> <a class="btn btn-ghost" href="continuity.html">Continuity ledger</a></p>
      </div>
    </section>
  </main>
  <footer class="site-footer">
    <div class="container footer-grid">
      <p>AI Film Master Guide — research notes for professional AI filmmaking. Sources linked per chapter.</p>
      <nav aria-label="Footer">{footer}</nav>
      <div class="footer-colophon"><span class="tc">TC 00:00:00:00</span><span class="tailpop">Tail pop</span><span>Cut in the cutting room</span><span class="tail">AI Film Master Guide — craft, not buttons</span></div>
    </div>
  </footer>
  <div class="palette" id="palette" role="dialog" aria-modal="true" aria-label="Search" hidden>
    <div class="palette-box">
      <input type="search" id="palette-input" placeholder="Search the guide…" aria-label="Search the guide">
      <div id="palette-results" role="listbox" aria-label="Search results"></div>
    </div>
  </div>
  <script src="assets/js/palette.js"></script>
  <script src="assets/js/grade.js"></script>
  <script src="assets/js/docs.js"></script>
  <script src="assets/js/identity.js"></script>
</body>
</html>
"""


# The grade-sheet layer — kept in step with assets/js/grade.js
# (GradeEngine). scripts/grade.test.js pins the engine, and
# the pre-rendered default sheet below is rendered under the
# same rules. Source: craft/color-grading.md — its two places
# color lives, its unification pass, its de-plasticize stack,
# its show look, its scopes discipline, and its delivery
# rules, quoted in substance.
GRADE_GATES = [
    dict(id="plategrade", name="Every element assigned: plate or grade",
         what="Decide per element which place its color lives. What you bake into the plate — lens character, palette direction, texture, time of day — you don't have to fix; anything the video model keeps dropping belongs in the plate, and anything that must move across the whole film belongs in the grade."),
    dict(id="reference", name="Hero reference chosen for every scene",
         what="Pick one hero shot per scene as the reference and match every other shot to it — scopes, not eyes. Do the unification pass over the location set before generating where possible: it is cheaper than discovering the mismatch in the grade."),
    dict(id="showlook", name="One show look locked — scene variations only",
         what="One look for the film, with scene-level variations — not a new look per scene. Work in passes: primary (whole image), then secondaries (skin, sky, key objects), then texture. Restraint wins: halation and bloom flatter AI highlights, which tend to clip harshly."),
    dict(id="grain", name="Grain philosophy decided — one grain, applied last",
         what="One grain for the film, applied at the end, over everything — it is the final unifier. Decide it before the first scene is graded, not after the last one looks different from the rest."),
    dict(id="masters", name="Pre-grade masters archived",
         what="Keep the pre-grade masters. When the festival asks for a revision, you re-grade — you don't re-generate. Archive the masters with the project, at delivery resolution, before the creative look goes on."),
]

GRADE_STEPS = [("exposure", "Exposure + white balance"), ("contrast", "Contrast curve"),
               ("saturation", "Saturation (desat 10–20%)"), ("texture", "Texture (grain · CA · soften)"),
               ("skin", "Skin, last, big screen")]

GRADE_SOURCES = [
    ("single", "Single model — one house grade"),
    ("mixed", "Mixed models — house grades differ"),
]

GRADE_STATUSES = [
    ("unified", "Unified — matched to the reference"),
    ("drifting", "Drifting — partly matched"),
    ("unmatched", "Unmatched — its own built-in grade"),
]

# Mirror of DEFAULT_ENTRIES in assets/js/grade.js.
GRADE_DEFAULT_ENTRIES = [
    dict(scene="Sc 1 — Depot at night, Mara waits", source="single", reference=True,
         detail="Hero: the wide under the canopy. Generations matched on scopes — blacks reach black, sodium practicals held off the skin line.",
         steps=dict(exposure=True, contrast=True, saturation=True, texture=True, skin=True), status="unified"),
    dict(scene="Sc 2 — On the bus, the hardest line", source="single", reference=True,
         detail="Hero: her close-up at the window. One model's house grade throughout; desaturated 15%, one grain over the scene, skin checked on the big screen.",
         steps=dict(exposure=True, contrast=True, saturation=True, texture=True, skin=True), status="unified"),
    dict(scene="Sc 3 — The rain stop", source="mixed", reference=True,
         detail="Shot across two models — the walk on one, the shelter two-shot on another, and their house grades disagree on saturation. Exposure and contrast matched to the shelter hero; saturation, texture and the skin pass not done yet.",
         steps=dict(exposure=True, contrast=True, saturation=False, texture=False, skin=False), status="unified"),
    dict(scene="Sc 4 — Depot office, radio voices", source="single", reference=True,
         detail="Hero: the desk two-shot. Fluorescent green pulled off the skin line on the vectorscope before the creative look went on.",
         steps=dict(exposure=True, contrast=True, saturation=True, texture=True, skin=True), status="unified"),
    dict(scene="Sc 5 — Departure, the button", source="single", reference=True,
         detail="Hero: the pull-away wide. The show look's night variation only — same primary, cooler secondaries; grain is the film's one grain, applied last.",
         steps=dict(exposure=True, contrast=True, saturation=True, texture=True, skin=True), status="unified"),
]


def grade_effective(e):
    """Mirror of GradeEngine.effectiveStatus (assets/js/grade.js):
    no hero reference reads unmatched; claimed unified with
    steps unfinished reads drifting."""
    if not e.get("reference"):
        return "unmatched"
    st = e.get("status") if e.get("status") in dict(GRADE_STATUSES) else "drifting"
    steps_done = sum(1 for lid, _label in GRADE_STEPS if e.get("steps", {}).get(lid))
    if st == "unified" and steps_done < len(GRADE_STEPS):
        return "drifting"
    return st


def grade_eval(entries):
    """Mirror of GradeEngine.evaluate (assets/js/grade.js)."""
    eff = [grade_effective(e) for e in entries]
    unified = eff.count("unified")
    drifting = eff.count("drifting")
    unmatched = eff.count("unmatched")
    clean = bool(entries) and drifting == 0 and unmatched == 0
    if not entries:
        verdict = "No grade sheet yet — every generation is still wearing its own built-in grade, so the film is 40 colorists who never met. Log the scenes first."
    elif unmatched:
        verdict = (f"Grade stopped — {unmatched} scene" + (" has" if unmatched == 1 else "s have") +
                   " no hero reference: unification is matching to a reference, and there is nothing "
                   "to match to. Choose the hero shot first; if two models won't match after that, "
                   "re-generate the outlier rather than torturing the grade.")
    elif drifting:
        verdict = (f"Hold the grade — {drifting} scene" + (" is" if drifting == 1 else "s are") +
                   " drifting: the matching steps are unfinished. Finish the unification pass first "
                   "(exposure and white balance, contrast curve, saturation — scopes, not eyes), then "
                   "the de-plasticize stack in order, skin last; a creative look laid over an "
                   "unmatched scene has to be laid again.")
    else:
        verdict = ("Grade clean — every logged scene is matched to its hero reference, all five steps "
                   "down. Before delivery: the scopes check (blacks actually reach black, skin tones "
                   "on the skin-tone line, no channel clips), broadcast-safe levels, one grain over "
                   "everything at the end — and the pre-grade masters stay archived.")
    return {"total": len(entries), "unified": unified, "drifting": drifting,
            "unmatched": unmatched, "clean": clean, "verdict": verdict}


def build_grade(css_links):
    """Grade Sheet — the color-grading chapter
    (craft/color-grading.md) as a working grade sheet: the five
    pre-grade gates, the production's own scenes with their
    hero references, sources, and five matching steps, and the
    grade verdict computed exactly as the chapter's rules state
    it. The default sheet is pre-rendered here under the same
    rules assets/js/grade.js runs in the browser; the engine
    invents no scenes and no states — no reference reads
    unmatched, unfinished steps hold the grade, on the record."""
    def esc(s):
        return html.escape(str(s if s is not None else ""))

    status_label = dict(GRADE_STATUSES)
    source_label = dict(GRADE_SOURCES)
    gates_html = []
    for i, s in enumerate(GRADE_GATES):
        gates_html.append(
            f'<article class="gr-gate-card"><div class="gr-gate-head"><span class="gr-num">{i + 1}</span>'
            f'<h4>{esc(s["name"])}</h4><span class="gr-tag">Pre-grade gate</span></div>'
            f'<p class="gr-what">{esc(s["what"])}</p>'
            f'<p><label><input type="checkbox" data-gr-gate="{esc(s["id"])}"> Done — the gate is written down</label></p></article>')
    r = grade_eval(GRADE_DEFAULT_ENTRIES)
    stage_html = []
    for idx, e in enumerate(GRADE_DEFAULT_ENTRIES):
        eff = grade_effective(e)
        s = (f'<article class="gr-entry"><div class="gr-entry-head"><h4>{esc(e["scene"])}</h4>'
             f'<span class="gr-tag">{esc((source_label.get(e["source"]) or "—").split(" — ")[0])}</span></div>'
             f'<p class="gr-detail">{esc(e["detail"])}</p>'
             f'<p class="gr-steps" role="group" aria-label="Matching steps done in {esc(e["scene"])}">'
             + " ".join(
                 f'<button type="button" class="btn btn-sm{"" if e["steps"].get(lid) else " btn-ghost"}" '
                 f'data-gr-step="{idx}:{lid}" aria-pressed="{"true" if e["steps"].get(lid) else "false"}">'
                 f'{esc(label)}{" ✓" if e["steps"].get(lid) else " —"}</button>'
                 for lid, label in GRADE_STEPS)
             + "</p>"
             f'<p class="gr-ref"><button type="button" class="btn btn-sm{"" if e["reference"] else " btn-ghost"}" '
             f'data-gr-ref="{idx}" aria-pressed="{"true" if e["reference"] else "false"}">Hero reference'
             f'{" ✓ chosen" if e["reference"] else " — not chosen"}</button></p>'
             f'<p class="gr-state">State: <strong>{esc(status_label.get(eff) or "— no state recorded —")}</strong></p>'
             f'<p class="gr-states" role="group" aria-label="Set the state for {esc(e["scene"])}">'
             + " ".join(
                 f'<button type="button" class="btn btn-sm{"" if e["status"] == sid else " btn-ghost"}" '
                 f'data-gr-set="{idx}:{sid}">{esc(label)}</button>'
                 for sid, label in GRADE_STATUSES)
             + "</p>"
             f'<p><button type="button" class="btn btn-sm btn-ghost" data-gr-del="{idx}">'
             f'Remove scene</button></p></article>')
        stage_html.append(s)
    source_opts = "".join(f'<option value="{esc(k)}">{esc(v)}</option>' for k, v in GRADE_SOURCES)
    status_opts = "".join(f'<option value="{esc(sid)}">{esc(label)}</option>' for sid, label in GRADE_STATUSES)
    (SITE / "grade.html").write_text(GRADE_TMPL.format(
        css=css_links, sitenav=nav_html("", "grade.html"), footer=footer_html(""),
        hero=hero_cutroom(
            kicker="""The cutting room""",
            h1="""Grade <span class="accent">sheet.</span>""",
            lede="""Every generation arrives wearing its own grade. The five gates before the grade, every scene logged with its hero reference, its source, and its five matching steps, and the grade verdict from the grading chapter's own rules: no reference means unmatched, and unfinished steps hold the grade.""",
            deck_title="""COLOR — THE_GRADE_SHEET""",
            clips={"v2": ['The grade'], "v1": ['Unify', 'De-plasticize', 'Skin'], "a1": ['Scopes']},
            h1_id="gr-title-h",
            extra=""" """),
        gr_gates="".join(gates_html),
        gr_gates_state="Gates complete: 0 of 5 — the gates are the discipline before any scene is judged; finish them first.",
        gr_source_options=source_opts, gr_status_options=status_opts,
        gr_verdict=html.escape(r["verdict"]), gr_stage="".join(stage_html)))
    return [("grade.html", "Grade sheet")]


CUT_TMPL = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Cut sheet — AI Film Master Guide</title>
  <meta name="description" content="The editing chapters as a working cut sheet: the five pre-lock gates, every shot logged with its duration, its three inspection passes, its finding and its route, and the picture-lock verdict computed from the chapters' own rules — the 5-second rule, the structural rule, the two-strike rule.">
  {css}
  <style>
    .cut-verdict {{ font-size: 1.05rem; border-left: 3px solid var(--gold); padding-left: var(--space-4); margin-bottom: var(--space-6); }}
    .cut-held {{ border-left-color: #e88; }}
    .cut-gate-card, .cut-entry {{ border: 1px solid var(--line); border-radius: 12px; padding: var(--space-4) var(--space-5); margin-bottom: var(--space-4); }}
    .cut-gate-head, .cut-entry-head {{ display: flex; align-items: baseline; gap: var(--space-3); flex-wrap: wrap; }}
    .cut-gate-head h4, .cut-entry-head h4 {{ margin: 0; font-size: 1.2rem; }}
    .cut-num {{ display: inline-block; min-width: 1.7em; text-align: center; background: var(--gold); color: #111; border-radius: 999px; font-weight: 800; padding: .1em .3em; }}
    .cut-tag {{ margin-left: auto; font-size: .78rem; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }}
    .cut-what, .cut-detail, .cut-state, .cut-finding, .cut-route, .cut-attempts {{ color: var(--muted); }}
    .cut-state strong, .cut-attempts strong {{ color: var(--text); }}
    .cut-note {{ font-size: .85rem; }}
  </style>
</head>
<body>
  <div class="edge-right" aria-hidden="true"></div>
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
      <span class="hdr-tc" data-hdr-tc aria-hidden="true"><span class="hdr-rec">&#9679;</span> <span class="hdr-tc-val">00:59:52:00</span></span>
      <button type="button" class="btn btn-sm btn-ghost palette-open" aria-label="Search the guide (Ctrl+K)">
        <span aria-hidden="true">&#8984;K</span> Search
      </button>
    </div>
  </header>
  <main id="main">
    {hero}
    <section class="container" aria-labelledby="cut-h">
      <h2 id="cut-h">The five gates — before picture lock</h2>
      <p>Synthetic footage has no rest state: a still AI room shimmers, breathes, and drifts at the pixel level, so the cut is where the film is actually made. The five gates below are the editing chapters' own discipline before any shot is judged; the full chapters are <a href="craft/editing-ai-footage.html">Editing AI Footage</a> and <a href="craft/editing-pipeline.html">Editing Pipeline</a>. Tick a gate when the production has actually done it — the sheet counts what is written down, not intentions.</p>
      <div id="cut-gates">{cut_gates}</div>
      <p class="calc-note" id="cut-gates-state" aria-live="polite">{cut_gates_state}</p>
      <h2>Your cut sheet</h2>
      <p>Log every shot in the cut with its duration, its three inspection passes (the story pass; the background scan — hands at frame edges, background faces, signs, reflections; the motion pass at half speed, where micro-jitter and swimming cloth show), and the frame-by-frame check any hold over five seconds owes at its start, middle, and end. Record what the inspection found — no defect, a local defect (bad frames, one element, jitter), or a structural one (wrong action, wrong composition, identity drift) — and the shot's route: in the cut, in repair on the fix-it ladder (cut around it, re-time, stabilize, composite, grain — bottom-up, stop at the first rung that works), sent back to regenerate, or cut from the film. Three rules are mechanical: a hold over five seconds without the frame check reads uninspected; a structural defect routed anywhere but regeneration reads misrouted; and a repair with two failed attempts reads struck — the two-strike rule sends it back. The sheet opens on a worked example — the same small AI short the Ledger, the Cue Sheet, and the Grade Sheet track, cut instead of seen, heard, or graded — with the rain stop's hand shot on the repair ladder, so the first verdict you see is the honest hold.</p>
      <div class="card" style="margin-bottom:var(--space-6);">
        <div class="calc-grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr));">
          <div class="field">
            <label for="cut-title">Production title</label>
            <input class="input" type="text" id="cut-title" placeholder="e.g. The Night Bus">
          </div>
          <div class="field">
            <label for="cut-new-shot">New shot</label>
            <input class="input" type="text" id="cut-new-shot" placeholder="e.g. Sc 6 · Sh 02 — Rooftop, dawn">
          </div>
          <div class="field">
            <label for="cut-new-duration">Duration (seconds)</label>
            <input class="input" type="number" id="cut-new-duration" min="0" step="0.1" placeholder="e.g. 3.5">
          </div>
          <div class="field">
            <label for="cut-new-detail">What the inspection found — specifically</label>
            <input class="input" type="text" id="cut-new-detail" placeholder="e.g. Background scan: sign text holds; half speed: no swim.">
          </div>
          <div class="field">
            <label for="cut-new-defect">Finding</label>
            <select class="input" id="cut-new-defect">{cut_defect_options}</select>
          </div>
          <div class="field">
            <label for="cut-new-status">Route today</label>
            <select class="input" id="cut-new-status">{cut_status_options}</select>
          </div>
          <div class="field">
            <label for="cut-new-attempts">Failed repair attempts</label>
            <input class="input" type="number" id="cut-new-attempts" min="0" max="9" step="1" value="0">
          </div>
          <div class="field">
            <label>Inspection done</label>
            <p style="margin:.2em 0;">
              <label><input type="checkbox" id="cut-new-story"> Story</label>
              <label><input type="checkbox" id="cut-new-background"> Background</label>
              <label><input type="checkbox" id="cut-new-motion"> Motion</label>
              <label><input type="checkbox" id="cut-new-framecheck"> Frame check (&gt;5s holds)</label>
            </p>
          </div>
          <div class="field">
            <label aria-hidden="true">&nbsp;</label>
            <button type="button" class="btn" id="cut-add">Add shot to the sheet</button>
          </div>
        </div>
        <p class="calc-note" id="cut-msg" hidden></p>
      </div>
      <p class="cut-verdict" id="cut-verdict" aria-live="polite">{cut_verdict}</p>
      <div id="cut-stage">{cut_stage}</div>
      <div class="card" style="margin-top:var(--space-6);">
        <h3>Take the sheet</h3>
        <p>The sheet exports as clean markdown: the five gates with their state, every shot with its duration, its passes, its frame check, its finding, its route, and its repair attempts, and the picture-lock verdict — the file the lock decision is made from.</p>
        <p><button type="button" class="btn" id="cut-copy">Copy sheet</button> <button type="button" class="btn btn-ghost" id="cut-download">Download sheet (.md)</button></p>
        <p><a class="btn btn-ghost" href="craft/editing-ai-footage.html">Read the editing chapter</a> <a class="btn btn-ghost" href="grade.html">Grade sheet</a> <a class="btn btn-ghost" href="cuesheet.html">Cue sheet</a></p>
      </div>
    </section>
  </main>
  <footer class="site-footer">
    <div class="container footer-grid">
      <p>AI Film Master Guide — research notes for professional AI filmmaking. Sources linked per chapter.</p>
      <nav aria-label="Footer">{footer}</nav>
      <div class="footer-colophon"><span class="tc">TC 00:00:00:00</span><span class="tailpop">Tail pop</span><span>Cut in the cutting room</span><span class="tail">AI Film Master Guide — craft, not buttons</span></div>
    </div>
  </footer>
  <div class="palette" id="palette" role="dialog" aria-modal="true" aria-label="Search" hidden>
    <div class="palette-box">
      <input type="search" id="palette-input" placeholder="Search the guide…" aria-label="Search the guide">
      <div id="palette-results" role="listbox" aria-label="Search results"></div>
    </div>
  </div>
  <script src="assets/js/palette.js"></script>
  <script src="assets/js/cut.js"></script>
  <script src="assets/js/docs.js"></script>
  <script src="assets/js/identity.js"></script>
</body>
</html>
"""


# The cut-sheet layer — kept in step with assets/js/cut.js
# (CutEngine). scripts/cut.test.js pins the engine, and the
# pre-rendered default sheet below is rendered under the
# same rules. Source: craft/editing-pipeline.md +
# craft/editing-ai-footage.md — the selects discipline, the
# inspection pass, the 5-second rule, the fix-it ladder, the
# regenerate-vs-repair decision, and the delivery rules,
# quoted in substance.
CUT_GATES = [
    dict(id="selects", name="Selects discipline held: 2–4 takes, one keeper",
         what="Generate 2–4 takes per shot and keep the best one — the first generation is a draft, and takes 2–4 are where the model settles. Past four takes you are usually prompting the wrong thing: go back to the prompt, not the generate button. Only keeps enter the edit; alts live in a separate bin."),
    dict(id="receipts", name="Generation receipts kept for every kept take",
         what="For every take you keep, record the model, the prompt (or prompt ID), the seed if the tool exposes one, and the generation date. When a shot needs a re-render three weeks later, the receipt is the difference between matching it and starting over."),
    dict(id="naming", name="Takes named like an editor, not a prompter",
         what="Scene, shot, version, verdict: sc03_sh02_v3_keep.mov beats kling_dreamy_final_FINAL2.mp4. The verdict suffix (_keep, _alt, _fix) is the whole system — at 2am you should be able to read the selects bin without opening anything."),
    dict(id="soundled", name="Cut to sound early: temp score in, J/L-cuts placed",
         what="Even a rough music bed gives synthetic footage a pulse to cut against; editors who cut AI footage silent tend to cut it metronomically. Let audio lead or lag the picture cut — J-cuts and L-cuts are free professionalism, and they cost nothing."),
    dict(id="lockorder", name="Lock order respected: picture before grade and mix, upscale last",
         what="Picture lock comes before color and mix — the grade and the cue sheet both start from the locked cut. One grain goes over the locked timeline, and the upscale is of the final timeline only: never upscale individual clips and re-edit; you pay for pixels you cut."),
]

CUT_PASSES = [("story", "Story pass"), ("background", "Background scan"),
              ("motion", "Motion pass (half speed)")]

CUT_DEFECTS = [
    ("none", "No defect found"),
    ("local", "Local — bad frames, one element, jitter"),
    ("structural", "Structural — action, composition, identity"),
]

CUT_STATUSES = [
    ("in", "In the cut"),
    ("repair", "In repair — on the ladder"),
    ("regen", "Sent back — regenerate"),
    ("cut", "Cut from the film"),
]

CUT_EFFECTIVE_LABELS = {
    "clean": "Clean — in the cut",
    "repairing": "In repair — on the ladder",
    "sentback": "Sent back — regenerate",
    "unchecked": "Unchecked — inspection unfinished",
    "carrying": "Carrying a defect in the cut",
    "uninspected": "Uninspected long hold — frame check owed",
    "misrouted": "Misrouted — structural defect in repair",
    "struck": "Struck out — two failed repairs",
    "cut": "Cut from the film",
}

# Mirror of DEFAULT_ENTRIES in assets/js/cut.js.
CUT_DEFAULT_ENTRIES = [
    dict(shot="Sc 1 · Sh 01 — Depot wide, Mara waits", duration=3.5, framecheck=False,
         detail="Take 2 of 3, the keeper. Story pass: the wait reads. Background: canopy signs hold. Half speed: no swim in the wet concrete.",
         passes=dict(story=True, background=True, motion=True), defect="none", status="in", attempts=0),
    dict(shot="Sc 2 · Sh 04 — Window close-up, the hardest line", duration=4.2, framecheck=False,
         detail="The performance shot — held under five seconds on purpose; an AI face held longer invites the audience to study the render instead of the line.",
         passes=dict(story=True, background=True, motion=True), defect="none", status="in", attempts=0),
    dict(shot="Sc 3 · Sh 02 — The rain stop, shelter two-shot hold", duration=6.8, framecheck=True,
         detail="The film's one long hold, and its cleanest take — earned in the inspection pass and frame-checked at start, middle, and end: no drift past forgiveness.",
         passes=dict(story=True, background=True, motion=True), defect="none", status="in", attempts=0),
    dict(shot="Sc 3 · Sh 05 — Hands on the shelter rail", duration=2.4, framecheck=False,
         detail="Micro-jitter on the rail at half speed — a local defect. On the ladder at rung 2 (re-time at 90%): one attempt smoothed the hands but warped the rail; the next attempt works the trim first, rung 1, before climbing.",
         passes=dict(story=True, background=True, motion=True), defect="local", status="repair", attempts=1),
    dict(shot="Sc 4 · Sh 03 — Office pan, radio voices", duration=3.1, framecheck=False,
         detail="Cut on the pan's motion vector — the match-cut carries the eye past the join. J-cut: the radio voice leads the picture by six frames.",
         passes=dict(story=True, background=True, motion=True), defect="none", status="in", attempts=0),
    dict(shot="Sc 5 · Sh 01 — Departure pull-away", duration=4.6, framecheck=False,
         detail="The button. Background scan caught a warping timetable board in take 1; take 3's board holds. L-cut: the depot ambience lags the cut to black.",
         passes=dict(story=True, background=True, motion=True), defect="none", status="in", attempts=0),
]


def cut_effective(e):
    """Mirror of CutEngine.effectiveStatus (assets/js/cut.js):
    a shot cut from the film blocks nothing; a structural
    defect not routed to regeneration reads misrouted; two
    failed repairs read struck; a >5s hold without the frame
    check reads uninspected."""
    st = e.get("status") if e.get("status") in dict(CUT_STATUSES) else "in"
    if st == "cut":
        return "cut"
    if e.get("defect") == "structural" and st != "regen":
        return "misrouted"
    if st == "repair" and (e.get("attempts") or 0) >= 2:
        return "struck"
    if (e.get("duration") or 0) > 5 and not e.get("framecheck"):
        return "uninspected"
    if st == "regen":
        return "sentback"
    if st == "repair":
        return "repairing"
    passes = e.get("passes", {})
    if not all(passes.get(pid) for pid, _label in CUT_PASSES):
        return "unchecked"
    if e.get("defect") and e.get("defect") != "none":
        return "carrying"
    return "clean"


def cut_eval(entries):
    """Mirror of CutEngine.evaluate (assets/js/cut.js)."""
    eff = [cut_effective(e) for e in entries]
    clean = eff.count("clean")
    cut = eff.count("cut")
    held = sum(eff.count(s) for s in ("repairing", "sentback", "unchecked", "carrying"))
    stopped = sum(eff.count(s) for s in ("misrouted", "struck", "uninspected"))
    ready = bool(entries) and held == 0 and stopped == 0
    if not entries:
        verdict = "No cut sheet yet — the timeline is a pile of generations until the selects are logged. Log every shot in the cut: its duration, its three inspection passes, and what the inspection found."
    elif eff.count("misrouted"):
        m = eff.count("misrouted")
        verdict = (f"Picture lock stopped — {m} shot" + (" carries" if m == 1 else "s carry") +
                   " a structural defect routed to repair: wrong action, wrong composition, or identity drift "
                   "through the whole clip is not a repair job. Regenerate — and if the same defect appears "
                   "in three takes, the problem is upstream: fix the prompt, not the frames.")
    elif eff.count("struck"):
        k = eff.count("struck")
        verdict = (f"Picture lock stopped — {k} shot" + (" has" if k == 1 else "s have") +
                   " burned two repair attempts: the two-strike rule sends them back to regenerate. "
                   "A third attempt at fixing a morph almost never works, and it now costs more than "
                   "a fresh generation.")
    elif eff.count("uninspected"):
        u = eff.count("uninspected")
        verdict = (f"Picture lock stopped — {u} shot" + (" holds" if u == 1 else "s hold") +
                   " longer than five seconds without the frame-by-frame check: long holds are where "
                   "drift accumulates past the audience's forgiveness. Inspect the start, middle, and "
                   "end — or trim the hold under five seconds.")
    elif held:
        verdict = (f"Hold picture lock — {held} shot" + (" is" if held == 1 else "s are") +
                   " not ready: a repair still on the ladder, a shot sent back for regeneration, an "
                   "inspection unfinished, or a local defect still carried in the cut. Work the ladder "
                   "bottom-up — cut around it, re-time, stabilize, composite — and stop at the first "
                   "rung that works.")
    else:
        verdict = ("Picture lock clean — every shot in the cut passed the three-eyed inspection, every "
                   "hold over five seconds is frame-checked, and no defect is being carried or repaired "
                   "past its second strike. Still owed before delivery: the 24-hour rule — lock it, sleep, "
                   "watch it fresh — the watch on three screens (phone, laptop, TV), one grain over the "
                   "locked timeline, and the upscale, last, of the final timeline only.")
    return {"total": len(entries), "clean": clean, "held": held, "stopped": stopped,
            "cut": cut, "ready": ready, "verdict": verdict}


def build_cut(css_links):
    """Cut Sheet — the editing chapters (craft/editing-pipeline.md
    + craft/editing-ai-footage.md) as a working cut sheet: the
    five pre-lock gates, the production's own shots with their
    durations, inspection passes, findings, and routes, and the
    picture-lock verdict computed exactly as the chapters' rules
    state it. The default sheet is pre-rendered here under the
    same rules assets/js/cut.js runs in the browser; the engine
    invents no shots and no states — the 5-second rule, the
    structural rule, and the two-strike rule are mechanical,
    on the record."""
    def esc(s):
        return html.escape(str(s if s is not None else ""))

    def fmt_dur(d):
        return "%g" % (d or 0)

    gates_html = []
    for i, s in enumerate(CUT_GATES):
        gates_html.append(
            f'<article class="cut-gate-card"><div class="cut-gate-head"><span class="cut-num">{i + 1}</span>'
            f'<h4>{esc(s["name"])}</h4><span class="cut-tag">Pre-lock gate</span></div>'
            f'<p class="cut-what">{esc(s["what"])}</p>'
            f'<p><label><input type="checkbox" data-cut-gate="{esc(s["id"])}"> Done — the gate is written down</label></p></article>')
    r = cut_eval(CUT_DEFAULT_ENTRIES)
    stage_html = []
    for idx, e in enumerate(CUT_DEFAULT_ENTRIES):
        eff = cut_effective(e)
        s = (f'<article class="cut-entry"><div class="cut-entry-head"><h4>{esc(e["shot"])}</h4>'
             f'<span class="cut-tag">{esc(fmt_dur(e["duration"]))}s</span></div>'
             f'<p class="cut-detail">{esc(e["detail"])}</p>'
             f'<p class="cut-passes" role="group" aria-label="Inspection passes done for {esc(e["shot"])}">'
             + " ".join(
                 f'<button type="button" class="btn btn-sm{"" if e["passes"].get(pid) else " btn-ghost"}" '
                 f'data-cut-pass="{idx}:{pid}" aria-pressed="{"true" if e["passes"].get(pid) else "false"}">'
                 f'{esc(label)}{" ✓" if e["passes"].get(pid) else " —"}</button>'
                 for pid, label in CUT_PASSES)
             + f' <button type="button" class="btn btn-sm{"" if e["framecheck"] else " btn-ghost"}" '
               f'data-cut-frame="{idx}" aria-pressed="{"true" if e["framecheck"] else "false"}">'
               f'Frame check (holds &gt;5s){" ✓" if e["framecheck"] else " —"}</button></p>'
             f'<p class="cut-state">State: <strong>{esc(CUT_EFFECTIVE_LABELS.get(eff) or "—")}</strong></p>'
             f'<p class="cut-finding">Finding: '
             + " ".join(
                 f'<button type="button" class="btn btn-sm{"" if e["defect"] == did else " btn-ghost"}" '
                 f'data-cut-defect="{idx}:{did}">{esc(label.split(" — ")[0])}</button>'
                 for did, label in CUT_DEFECTS)
             + "</p>"
             f'<p class="cut-route">Route: '
             + " ".join(
                 f'<button type="button" class="btn btn-sm{"" if e["status"] == sid else " btn-ghost"}" '
                 f'data-cut-set="{idx}:{sid}">{esc(label)}</button>'
                 for sid, label in CUT_STATUSES)
             + "</p>"
             f'<p class="cut-attempts">Failed repair attempts: <strong>{e["attempts"]}</strong> '
             f'<button type="button" class="btn btn-sm btn-ghost" data-cut-att="{idx}:-1">−</button> '
             f'<button type="button" class="btn btn-sm btn-ghost" data-cut-att="{idx}:1">+</button>'
             f' <span class="cut-note">two failed repairs strike the shot out — regenerate</span></p>'
             f'<p><button type="button" class="btn btn-sm btn-ghost" data-cut-del="{idx}">'
             f'Remove shot</button></p></article>')
        stage_html.append(s)
    defect_opts = "".join(f'<option value="{esc(k)}">{esc(v)}</option>' for k, v in CUT_DEFECTS)
    status_opts = "".join(f'<option value="{esc(sid)}">{esc(label)}</option>' for sid, label in CUT_STATUSES)
    (SITE / "cut.html").write_text(CUT_TMPL.format(
        css=css_links, sitenav=nav_html("", "cut.html"), footer=footer_html(""),
        hero=hero_cutroom(
            kicker="""The cutting room""",
            h1="""Cut <span class="accent">sheet.</span>""",
            lede="""Synthetic footage never sits still, so the cut is where the film is made. The five gates before picture lock, every shot logged with its duration, its three inspection passes, its finding, and its route, and the lock verdict from the editing chapters' own rules: the 5-second rule, the structural rule, the two-strike rule.""",
            deck_title="""EDIT — THE_CUT_SHEET""",
            clips={"v2": ['The cut'], "v1": ['Selects', 'Inspect', 'Lock'], "a1": ['Temp score']},
            h1_id="cut-title-h",
            extra=""" """),
        cut_gates="".join(gates_html),
        cut_gates_state="Gates complete: 0 of 5 — the gates are the discipline before any shot is judged; finish them first.",
        cut_defect_options=defect_opts, cut_status_options=status_opts,
        cut_verdict=html.escape(r["verdict"]), cut_stage="".join(stage_html)))
    return [("cut.html", "Cut sheet")]




TAKE_TMPL = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Take sheet — AI Film Master Guide</title>
  <meta name="description" content="The directing-performance chapter as a working take sheet: the five pre-lock gates, every performance beat logged with its direction, eyeline, dead-eyes check, framing, and route, and the performance-lock verdict computed from the chapter's own rules — the label rule, the three-rehearsal rule, the close-up rule.">
  {css}
  <style>
    .take-verdict {{ font-size: 1.05rem; border-left: 3px solid var(--gold); padding-left: var(--space-4); margin-bottom: var(--space-6); }}
    .take-held {{ border-left-color: #e88; }}
    .take-gate-card, .take-entry {{ border: 1px solid var(--line); border-radius: 12px; padding: var(--space-4) var(--space-5); margin-bottom: var(--space-4); }}
    .take-gate-head, .take-entry-head {{ display: flex; align-items: baseline; gap: var(--space-3); flex-wrap: wrap; }}
    .take-gate-head h4, .take-entry-head h4 {{ margin: 0; font-size: 1.2rem; }}
    .take-num {{ display: inline-block; min-width: 1.7em; text-align: center; background: var(--gold); color: #111; border-radius: 999px; font-weight: 800; padding: .1em .3em; }}
    .take-tag {{ margin-left: auto; font-size: .78rem; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }}
    .take-what, .take-detail, .take-state, .take-mode, .take-framing, .take-route, .take-attempts, .take-checks {{ color: var(--muted); }}
    .take-state strong, .take-attempts strong {{ color: var(--text); }}
    .take-note {{ font-size: .85rem; }}
  </style>
</head>
<body>
  <div class="edge-right" aria-hidden="true"></div>
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
      <span class="hdr-tc" data-hdr-tc aria-hidden="true"><span class="hdr-rec">&#9679;</span> <span class="hdr-tc-val">00:59:52:00</span></span>
      <button type="button" class="btn btn-sm btn-ghost palette-open" aria-label="Search the guide (Ctrl+K)">
        <span aria-hidden="true">&#8984;K</span> Search
      </button>
    </div>
  </header>
  <main id="main">
    {hero}
    <section class="container" aria-labelledby="take-h">
      <h2 id="take-h">The five gates — before performance lock</h2>
      <p>AI models don't act: they render plausible arrangements of pixels that read as acting when the direction is specific enough, and collapse into mannequin theater when it isn't. The five gates below are the directing chapter's own discipline before any beat is judged; the full chapter is <a href="craft/directing-performance.html">Directing Performance in AI Video</a>. Tick a gate when the production has actually done it — the sheet counts what is written down, not intentions.</p>
      <div id="take-gates">{take_gates}</div>
      <p class="calc-note" id="take-gates-state" aria-live="polite">{take_gates_state}</p>
      <h2>Your take sheet</h2>
      <p>Log every performance beat with its direction — a playable tactic (a task a body can do: scene event, motive, goal, obstacle, tactic) or an emotion label (an adjective, which is not direction) — its eyeline target named or not, its dead-eyes check (microsaccades, the Duchenne smile, fluctuating asymmetry, pupillary response), its framing and whether that framing sits on an emotional peak, its failed rehearsals, and its route: in rehearsal (720p drafts as takes), Scene-Locked (photograph the performance, don't regenerate it), to be simplified, or hybrid (a real performer at the emotional core). Three rules are mechanical: a beat directed by emotion label reads undirected; a beat still re-rolling after three failed rehearsals reads overdue — simplify the shot, not the actor; and a close-up spent away from an emotional peak reads misspent. The sheet opens on a worked example — the same small AI short the Ledger, the Cue Sheet, the Grade Sheet, and the Cut Sheet track, performed instead of seen, heard, graded, or cut — with the depot-office reaction still in rehearsal, so the first verdict you see is the honest hold.</p>
      <div class="card" style="margin-bottom:var(--space-6);">
        <div class="calc-grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr));">
          <div class="field">
            <label for="take-title">Production title</label>
            <input class="input" type="text" id="take-title" placeholder="e.g. The Night Bus">
          </div>
          <div class="field">
            <label for="take-new-shot">New performance beat</label>
            <input class="input" type="text" id="take-new-shot" placeholder="e.g. Sc 6 · Sh 02 — Rooftop, dawn">
          </div>
          <div class="field">
            <label for="take-new-detail">The direction, specifically — the tactic and the channel</label>
            <input class="input" type="text" id="take-new-detail" placeholder="e.g. Tactic: she is stalling — hands busy with the strap, eyes on his hands.">
          </div>
          <div class="field">
            <label for="take-new-mode">Direction</label>
            <select class="input" id="take-new-mode">{take_mode_options}</select>
          </div>
          <div class="field">
            <label for="take-new-framing">Framing</label>
            <select class="input" id="take-new-framing">{take_framing_options}</select>
          </div>
          <div class="field">
            <label for="take-new-status">Route today</label>
            <select class="input" id="take-new-status">{take_status_options}</select>
          </div>
          <div class="field">
            <label for="take-new-attempts">Failed rehearsals</label>
            <input class="input" type="number" id="take-new-attempts" min="0" max="9" step="1" value="0">
          </div>
          <div class="field">
            <label>Checks done</label>
            <p style="margin:.2em 0;">
              <label><input type="checkbox" id="take-new-eyeline"> Eyeline named</label>
              <label><input type="checkbox" id="take-new-deadeyes"> Dead-eyes check</label>
              <label><input type="checkbox" id="take-new-peak"> Emotional peak</label>
            </p>
          </div>
          <div class="field">
            <label aria-hidden="true">&nbsp;</label>
            <button type="button" class="btn" id="take-add">Add beat to the sheet</button>
          </div>
        </div>
        <p class="calc-note" id="take-msg" hidden></p>
      </div>
      <p class="take-verdict" id="take-verdict" aria-live="polite">{take_verdict}</p>
      <div id="take-stage">{take_stage}</div>
      <div class="card" style="margin-top:var(--space-6);">
        <h3>Take the sheet</h3>
        <p>The sheet exports as clean markdown: the five gates with their state, every beat with its direction, eyeline, dead-eyes check, framing, peak, failed rehearsals, and route, and the performance-lock verdict — the file the lock decision is made from.</p>
        <p><button type="button" class="btn" id="take-copy">Copy sheet</button> <button type="button" class="btn btn-ghost" id="take-download">Download sheet (.md)</button></p>
        <p><a class="btn btn-ghost" href="craft/directing-performance.html">Read the directing chapter</a> <a class="btn btn-ghost" href="cut.html">Cut sheet</a> <a class="btn btn-ghost" href="continuity.html">Continuity ledger</a></p>
      </div>
    </section>
  </main>
  <footer class="site-footer">
    <div class="container footer-grid">
      <p>AI Film Master Guide — research notes for professional AI filmmaking. Sources linked per chapter.</p>
      <nav aria-label="Footer">{footer}</nav>
      <div class="footer-colophon"><span class="tc">TC 00:00:00:00</span><span class="tailpop">Tail pop</span><span>Cut in the cutting room</span><span class="tail">AI Film Master Guide — craft, not buttons</span></div>
    </div>
  </footer>
  <div class="palette" id="palette" role="dialog" aria-modal="true" aria-label="Search" hidden>
    <div class="palette-box">
      <input type="search" id="palette-input" placeholder="Search the guide…" aria-label="Search the guide">
      <div id="palette-results" role="listbox" aria-label="Search results"></div>
    </div>
  </div>
  <script src="assets/js/palette.js"></script>
  <script src="assets/js/take.js"></script>
  <script src="assets/js/docs.js"></script>
  <script src="assets/js/identity.js"></script>
</body>
</html>
"""


# The take-sheet layer — kept in step with assets/js/take.js
# (TakeEngine). scripts/take.test.js pins the engine, and the
# pre-rendered default sheet below is rendered under the
# same rules. Source: craft/directing-performance.md — direct,
# don't describe; give the eyes a job; the director's read;
# one tactic per shot; ration the close-up; the dead-eyes
# checklist; rehearsal as a department; Scene Lock, quoted
# in substance.
TAKE_GATES = [
    dict(id="tactics", name="Every beat rewritten as a playable tactic",
         what="Direct, don't describe: replace every emotion label with a task a body can do — scene event, motive, goal, obstacle, tactic. Models can't render 'devastated'; they can render a jaw set and eyes fixed on a door."),
    dict(id="eyelines", name="Eyelines named per beat — every pair of eyes has a job",
         what="Dead, glassy eyes are never fixed with lighting — they're fixed by giving the eyes a job. Name the eyeline target per beat; eyes move between targets (avert, hold, search, track) and never stare into the middle distance."),
    dict(id="directorsread", name="Director's read written: shared event + a channel per character",
         what="Everyone in the scene lives through the same event, but each character carries it in a different physical channel — grief in her hands, in his jaw, in the kid's feet. Write the event once, then assign each character their channel."),
    dict(id="identity", name="Identity locked — the face anchor is never re-run",
         what="Consistent identity reads as good acting; a face that drifts 5% reads as a bad performance. Lock the face anchor, never re-run the base portrait, and make state changes (dirt, wounds, tears) masked integrations, not re-generations."),
    dict(id="restraint", name="Restraint pass done: negative constraints, subtext, under-directed faces",
         what="Models default to theatrical. Strip it: negative constraints (no eyebrow raises, no wide-eyed gasps), subtext instead of stated emotion, environment carrying mood — and deliberately under-direct the face where the model finds expression better itself."),
]

TAKE_MODES = [
    ("tactic", "Playable tactic — a task a body can do"),
    ("label", "Emotion label — an adjective, not a task"),
]

TAKE_FRAMINGS = [("wide", "Wide"), ("medium", "Medium"), ("closeup", "Close-up")]

TAKE_STATUSES = [
    ("rehearsing", "In rehearsal — drafts as takes"),
    ("locked", "Scene-Locked — photograph it, don't regenerate it"),
    ("simplify", "Simplify the shot"),
    ("hybrid", "Hybrid — a real performer at the core"),
]

TAKE_EFFECTIVE_LABELS = {
    "clean": "Clean — Scene-Locked",
    "rehearsing": "In rehearsal — drafts as takes",
    "simplifying": "Simplifying — the shot changes, not the actor",
    "unchecked": "Unchecked — eyeline or dead-eyes check unfinished",
    "undirected": "Undirected — an emotion label is not a task",
    "overdue": "Overdue — three failed rehearsals",
    "misspent": "Misspent close-up — no peak under it",
    "hybrid": "Hybrid — a real performer at the core",
}

# Mirror of DEFAULT_ENTRIES in assets/js/take.js.
TAKE_DEFAULT_ENTRIES = [
    dict(shot="Sc 1 · Sh 01 — Depot wide, Mara waits", mode="tactic", eyeline=True, deadeyes=True,
         framing="wide", peak=False, attempts=0, status="locked",
         detail="Tactic: she is keeping herself ready to leave — coat on, bag zipped, eyes tracking the arrivals board, then the door. Grief lives in her hands: the ticket folded and re-folded."),
    dict(shot="Sc 2 · Sh 04 — Window close-up, the hardest line", mode="tactic", eyeline=True, deadeyes=True,
         framing="closeup", peak=True, attempts=0, status="locked",
         detail="The film's one close-up, spent on its peak. Tactic: she is trying not to cry in front of him — jaw set, eyes on the window catch until the line lands. The voice carries; the face supports."),
    dict(shot="Sc 3 · Sh 02 — The rain stop, shelter two-shot", mode="tactic", eyeline=True, deadeyes=True,
         framing="medium", peak=False, attempts=0, status="locked",
         detail="Director's read: the same late bus, two channels — Mara's stillness against the driver's restless weight-shifting. Eyelines cross only once, on the headlights."),
    dict(shot="Sc 4 · Sh 02 — Depot office, the driver hears the radio", mode="tactic", eyeline=True, deadeyes=True,
         framing="medium", peak=False, attempts=1, status="rehearsing",
         detail="The listener's reaction shot — AI renders listening better than complex feeling, and this one is not there yet: the first 720p rehearsal read blank, the second (eyeline moved to the radio speaker, thumb rubbing the ring) reads rehearsing, not locked. One failed rehearsal; re-direct with a changed variable, never the same prompt hoping."),
    dict(shot="Sc 4 · Sh 03 — Office pan, radio voices", mode="tactic", eyeline=True, deadeyes=True,
         framing="medium", peak=False, attempts=0, status="locked",
         detail="No face carries this beat — the radio does. Faces under-directed on purpose; the restraint pass stripped two eyebrow raises the model offered on its own."),
    dict(shot="Sc 5 · Sh 01 — Departure pull-away", mode="tactic", eyeline=True, deadeyes=True,
         framing="wide", peak=False, attempts=0, status="locked",
         detail="The button is a wide: she keeps finding reasons to stand closer to the kerb; he keeps noticing and not moving away. Dead-eyes check passed at distance — no stare, eyeline on the bus until it fills the frame."),
]


def take_effective(e):
    """Mirror of TakeEngine.effectiveStatus (assets/js/take.js):
    a hybrid beat blocks nothing; an emotion label reads
    undirected; three failed rehearsals still re-rolling read
    overdue; a close-up away from its peak reads misspent."""
    st = e.get("status") if e.get("status") in dict(TAKE_STATUSES) else "rehearsing"
    if st == "hybrid":
        return "hybrid"
    if e.get("mode") != "tactic":
        return "undirected"
    if st == "rehearsing" and (e.get("attempts") or 0) >= 3:
        return "overdue"
    if e.get("framing") == "closeup" and not e.get("peak"):
        return "misspent"
    if st == "simplify":
        return "simplifying"
    if st == "rehearsing":
        return "rehearsing"
    if not e.get("eyeline") or not e.get("deadeyes"):
        return "unchecked"
    return "clean"


def take_eval(entries):
    """Mirror of TakeEngine.evaluate (assets/js/take.js)."""
    eff = [take_effective(e) for e in entries]
    clean = eff.count("clean")
    hybrid = eff.count("hybrid")
    held = sum(eff.count(s) for s in ("rehearsing", "simplifying", "unchecked"))
    stopped = sum(eff.count(s) for s in ("undirected", "overdue", "misspent"))
    ready = bool(entries) and held == 0 and stopped == 0
    if not entries:
        verdict = "No take sheet yet — undirected generations are mannequin theater until the beats are directed. Log every performance beat: its tactic, its eyeline, its framing, and its route."
    elif eff.count("undirected"):
        m = eff.count("undirected")
        verdict = (f"Performance lock stopped — {m} beat" + (" is" if m == 1 else "s are") +
                   " directed by emotion label: models can't render 'devastated' — they can render a jaw set and eyes on a door. "
                   "Rewrite each label as a playable tactic: scene event, motive, goal, obstacle, tactic.")
    elif eff.count("overdue"):
        k = eff.count("overdue")
        verdict = (f"Performance lock stopped — {k} beat" + (" has" if k == 1 else "s have") +
                   " burned three rehearsals: the three-rehearsal rule means simplify the shot, not the actor. "
                   "Change a variable — a new tactic, a new eyeline — or simplify the shot; never re-roll the same prompt hoping.")
    elif eff.count("misspent"):
        u = eff.count("misspent")
        verdict = (f"Performance lock stopped — {u} close-up" + (" is" if u == 1 else "s are") +
                   " spent away from an emotional peak: micro-acting is the weakest link in every current model, and a "
                   "pushed-in over-directed close-up exposes every flaw. Ration close-ups to the peaks, or widen the framing.")
    elif held:
        verdict = (f"Hold performance lock — {held} beat" + (" is" if held == 1 else "s are") +
                   " not ready: a take still in rehearsal, a simplification still owed, or the eyeline / dead-eyes check "
                   "unfinished. Review drafts as rehearsals — does the tactic read, do the eyes have a job, does the turn land in the cut?")
    else:
        verdict = ("Performance lock clean — every beat is a playable tactic, every pair of eyes has a job, every "
                   "close-up sits on its peak, and every approved take is Scene-Locked. Still owed: photograph the "
                   "locked performance from new angles, don't regenerate it — the model must stop reinterpreting "
                   "gestures, pauses, and props after approval — and keep synthetic performers inside edited, controlled contexts.")
    return {"total": len(entries), "clean": clean, "held": held, "stopped": stopped,
            "hybrid": hybrid, "ready": ready, "verdict": verdict}


def build_take(css_links):
    """Take Sheet — the directing-performance chapter
    (craft/directing-performance.md) as a working take sheet:
    the five pre-lock gates, the production's own performance
    beats with their direction, eyelines, dead-eyes checks,
    framings, and routes, and the performance-lock verdict
    computed exactly as the chapter's rules state it. The
    default sheet is pre-rendered here under the same rules
    assets/js/take.js runs in the browser; the engine invents
    no beats and no states — the label rule, the
    three-rehearsal rule, and the close-up rule are
    mechanical, on the record."""
    def esc(s):
        return html.escape(str(s if s is not None else ""))

    gates_html = []
    for i, s in enumerate(TAKE_GATES):
        gates_html.append(
            f'<article class="take-gate-card"><div class="take-gate-head"><span class="take-num">{i + 1}</span>'
            f'<h4>{esc(s["name"])}</h4><span class="take-tag">Pre-lock gate</span></div>'
            f'<p class="take-what">{esc(s["what"])}</p>'
            f'<p><label><input type="checkbox" data-take-gate="{esc(s["id"])}"> Done — the gate is written down</label></p></article>')
    r = take_eval(TAKE_DEFAULT_ENTRIES)
    stage_html = []
    for idx, e in enumerate(TAKE_DEFAULT_ENTRIES):
        eff = take_effective(e)
        s = (f'<article class="take-entry"><div class="take-entry-head"><h4>{esc(e["shot"])}</h4>'
             f'<span class="take-tag">{esc(dict(TAKE_FRAMINGS).get(e["framing"]) or "—")}</span></div>'
             f'<p class="take-detail">{esc(e["detail"])}</p>'
             f'<p class="take-checks" role="group" aria-label="Performance checks for {esc(e["shot"])}">'
             f'<button type="button" class="btn btn-sm{"" if e["eyeline"] else " btn-ghost"}" '
             f'data-take-eye="{idx}" aria-pressed="{"true" if e["eyeline"] else "false"}">'
             f'Eyeline named{" ✓" if e["eyeline"] else " —"}</button> '
             f'<button type="button" class="btn btn-sm{"" if e["deadeyes"] else " btn-ghost"}" '
             f'data-take-dead="{idx}" aria-pressed="{"true" if e["deadeyes"] else "false"}">'
             f'Dead-eyes check{" ✓" if e["deadeyes"] else " —"}</button> '
             f'<button type="button" class="btn btn-sm{"" if e["peak"] else " btn-ghost"}" '
             f'data-take-peak="{idx}" aria-pressed="{"true" if e["peak"] else "false"}">'
             f'Emotional peak{" ✓" if e["peak"] else " —"}</button></p>'
             f'<p class="take-state">State: <strong>{esc(TAKE_EFFECTIVE_LABELS.get(eff) or "—")}</strong></p>'
             f'<p class="take-mode">Direction: '
             + " ".join(
                 f'<button type="button" class="btn btn-sm{"" if e["mode"] == mid else " btn-ghost"}" '
                 f'data-take-mode="{idx}:{mid}">{esc(label.split(" — ")[0])}</button>'
                 for mid, label in TAKE_MODES)
             + "</p>"
             f'<p class="take-framing">Framing: '
             + " ".join(
                 f'<button type="button" class="btn btn-sm{"" if e["framing"] == fid else " btn-ghost"}" '
                 f'data-take-frame="{idx}:{fid}">{esc(label)}</button>'
                 for fid, label in TAKE_FRAMINGS)
             + "</p>"
             f'<p class="take-route">Route: '
             + " ".join(
                 f'<button type="button" class="btn btn-sm{"" if e["status"] == sid else " btn-ghost"}" '
                 f'data-take-set="{idx}:{sid}">{esc(label.split(" — ")[0])}</button>'
                 for sid, label in TAKE_STATUSES)
             + "</p>"
             f'<p class="take-attempts">Failed rehearsals: <strong>{e["attempts"]}</strong> '
             f'<button type="button" class="btn btn-sm btn-ghost" data-take-att="{idx}:-1">−</button> '
             f'<button type="button" class="btn btn-sm btn-ghost" data-take-att="{idx}:1">+</button>'
             f' <span class="take-note">three failed rehearsals simplify the shot — not the actor</span></p>'
             f'<p><button type="button" class="btn btn-sm btn-ghost" data-take-del="{idx}">'
             f'Remove beat</button></p></article>')
        stage_html.append(s)
    mode_opts = "".join(f'<option value="{esc(k)}">{esc(v)}</option>' for k, v in TAKE_MODES)
    framing_opts = "".join(f'<option value="{esc(k)}">{esc(v)}</option>' for k, v in TAKE_FRAMINGS)
    status_opts = "".join(f'<option value="{esc(sid)}">{esc(label)}</option>' for sid, label in TAKE_STATUSES)
    (SITE / "take.html").write_text(TAKE_TMPL.format(
        css=css_links, sitenav=nav_html("", "take.html"), footer=footer_html(""),
        hero=hero_cutroom(
            kicker="""The rehearsal room""",
            h1="""Take <span class="accent">sheet.</span>""",
            lede="""Models don't act — direction makes pixels read as acting. The five gates before performance lock, every beat logged with its tactic, its eyeline, its dead-eyes check, its framing, and its route, and the lock verdict from the directing chapter's own rules: the label rule, the three-rehearsal rule, the close-up rule.""",
            deck_title="""PERFORM — THE_TAKE_SHEET""",
            clips={"v2": ['The take'], "v1": ['Direct', 'Rehearse', 'Lock'], "a1": ['The read']},
            h1_id="take-title-h",
            extra=""" """),
        take_gates="".join(gates_html),
        take_gates_state="Gates complete: 0 of 5 — the gates are the discipline before any beat is judged; finish them first.",
        take_mode_options=mode_opts, take_framing_options=framing_opts,
        take_status_options=status_opts,
        take_verdict=html.escape(r["verdict"]), take_stage="".join(stage_html)))
    return [("take.html", "Take sheet")]

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
  <div class="edge-right" aria-hidden="true"></div>
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
      <span class="hdr-tc" data-hdr-tc aria-hidden="true"><span class="hdr-rec">●</span> <span class="hdr-tc-val">00:59:52:00</span></span>
      <button type="button" class="btn btn-sm btn-ghost palette-open" aria-label="Search the guide (Ctrl+K)">
        <span aria-hidden="true">&#8984;K</span> Search
      </button>
    </div>
  </header>
  <main id="main">
    {hero}
    <section class="container heritage-band" aria-labelledby="gal-heritage-h">
      <h2 id="gal-heritage-h">The rooms this craft comes from</h2>
      <p class="lede" style="margin-bottom:var(--space-5);">Before a prompt ever described a frame, these machines made them — and the discipline they taught (load carefully, expose once, project honestly) is the discipline this gallery is for.</p>
      <div class="heritage-grid">
        <figure class="heritage-fig">
          <img src="assets/film-projector.webp" alt="Cinema projector mechanism at the Onomichi Cinema Museum" loading="lazy">
          <figcaption>A cinema projector mechanism, Onomichi Cinema Museum. <span class="heritage-attr">Photo: Asturio Cantabrio, CC BY-SA 4.0, via Wikimedia Commons</span></figcaption>
        </figure>
        <figure class="heritage-fig">
          <img src="assets/movie-theater-marquee.webp" alt="The Uptown Cinema marquee lit at night, 2017" loading="lazy">
          <figcaption>The Uptown Cinema marquee at night, 2017. <span class="heritage-attr">Photo: Jehof, CC BY-SA 4.0, via Wikimedia Commons</span></figcaption>
        </figure>
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
      <div class="footer-colophon"><span class="tc">TC 00:00:00:00</span><span class="tailpop">Tail pop</span><span>Cut in the cutting room</span><span class="tail">AI Film Master Guide — craft, not buttons</span></div>
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
  <script src="assets/js/docs.js"></script>
  <script src="assets/js/identity.js"></script>
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
  <div class="edge-right" aria-hidden="true"></div>
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
      <span class="hdr-tc" data-hdr-tc aria-hidden="true"><span class="hdr-rec">●</span> <span class="hdr-tc-val">00:59:52:00</span></span>
      <button type="button" class="btn btn-sm btn-ghost palette-open" aria-label="Search the guide (Ctrl+K)">
        <span aria-hidden="true">⌘K</span> Search
      </button>
    </div>
  </header>
  <main id="main">
    {hero}
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
      <div class="footer-colophon"><span class="tc">TC 00:00:00:00</span><span class="tailpop">Tail pop</span><span>Cut in the cutting room</span><span class="tail">AI Film Master Guide — craft, not buttons</span></div>
    </div>
  </footer>
  <div class="palette" id="palette" role="dialog" aria-modal="true" aria-label="Search the guide" hidden>
    <div class="palette-box">
      <input id="palette-input" type="search" placeholder="Search chapters, prompts, models…" autocomplete="off" aria-label="Search the guide">
      <div id="palette-results" role="listbox" aria-label="Search results"></div>
    </div>
  </div>
  <script src="assets/js/palette.js"></script>
  <script src="assets/js/docs.js"></script>
  <script src="assets/js/identity.js"></script>
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
  <div class="edge-right" aria-hidden="true"></div>
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
      <span class="hdr-tc" data-hdr-tc aria-hidden="true"><span class="hdr-rec">●</span> <span class="hdr-tc-val">00:59:52:00</span></span>
      <button type="button" class="btn btn-sm btn-ghost palette-open" aria-label="Search the guide (Ctrl+K)">
        <span aria-hidden="true">⌘K</span> Search
      </button>
    </div>
  </header>
  <main id="main">
    {hero}
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
            <tr><td>API references</td><td>No</td><td>Versioned <code>data/v1/</code> files the skill draws on</td></tr>
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
      <div class="footer-colophon"><span class="tc">TC 00:00:00:00</span><span class="tailpop">Tail pop</span><span>Cut in the cutting room</span><span class="tail">AI Film Master Guide — craft, not buttons</span></div>
    </div>
  </footer>
  <div class="palette" id="palette" role="dialog" aria-modal="true" aria-label="Search the guide" hidden>
    <div class="palette-box">
      <input id="palette-input" type="search" placeholder="Search chapters, prompts, models…" autocomplete="off" aria-label="Search the guide">
      <div id="palette-results" role="listbox" aria-label="Search results"></div>
    </div>
  </div>
  <script src="assets/js/palette.js"></script>
  <script src="assets/js/docs.js"></script>
  <script src="assets/js/identity.js"></script>
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
  <div class="edge-right" aria-hidden="true"></div>
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
      <span class="hdr-tc" data-hdr-tc aria-hidden="true"><span class="hdr-rec">●</span> <span class="hdr-tc-val">00:59:52:00</span></span>
      <button type="button" class="btn btn-sm btn-ghost palette-open" aria-label="Search the guide (Ctrl+K)">
        <span aria-hidden="true">⌘K</span> Search
      </button>
    </div>
  </header>
  <main id="main">
    <section class="hero hero-cutroom" aria-labelledby="td-title">
      <div class="tl-deck" aria-hidden="true">
        <div class="tl-chrome">
          <span class="tl-rec"><i></i>REC</span>
          <span class="tl-tc-live" data-tl-tc>00:00:04:00</span>
          <span class="tl-pop">2-POP 01:00:06:00 &#183; &#x223F;1kHz</span>
          <span class="tl-title">TEARDOWNS — SHOT_BY_SHOT</span>
        </div>
        <div class="tl-ruler">
          <span style="left:0%">00:00:00:00</span><span style="left:20%">00:00:12:00</span><span style="left:40%">00:00:24:00</span><span style="left:60%">00:00:36:00</span><span style="left:80%">00:00:48:00</span><span style="left:100%">00:01:00:00</span>
        </div>
        <div class="tl-tracks">
          <div class="tl-track"><span class="tl-track-label">V2</span>
            <span class="clip is-blue" style="left:8%;width:20%">Selects</span>
            <span class="clip is-blue" style="left:33%;width:16%">Cutaways</span>
            <span class="clip is-blue" style="left:64%;width:24%">Alt takes</span>
          </div>
          <div class="tl-track"><span class="tl-track-label">V1</span>
            <span class="clip is-gold" style="left:2%;width:30%">Dragon Blue — the take</span>
            <span class="clip is-gold" style="left:36%;width:26%">Gaudette — selects</span>
            <span class="clip is-gold" style="left:66%;width:28%">StoReel — assembly</span>
          </div>
          <div class="tl-track"><span class="tl-track-label">A1</span>
            <span class="clip is-rec" style="left:10%;width:44%">Director commentary</span>
            <span class="clip " style="left:58%;width:30%">Room tone</span>
          </div>
          <div class="tl-playhead"></div>
        </div>
        <div class="leader-frame" data-leader-frame><b>3</b><span class="lf-label">LEADER</span></div>
      </div>
      <div class="container hero-inner">
        <span class="hero-kicker"><span class="rec" aria-hidden="true"></span>Learn to see</span>
        <h1 id="td-title">Shot-by-shot <span class="accent">teardowns.</span></h1>
        <p class="lede">Nine documented AI-film productions, broken into shots: what each shot did, what worked, what broke, and the craft lesson. Prompt reconstructions are analytical — they teach the thinking, not the buttons.</p>
      </div>
    </section>
    <section class="container" aria-labelledby="td-app-h" style="margin-bottom:var(--space-7);">
      <h2 id="td-app-h" class="sr-only">Teardown viewer</h2>
      <div id="teardown-app"><p>Loading teardowns…</p></div>
      <noscript><p>Teardowns need JavaScript. The source data is <code>data/v1/teardowns.json</code> in the repository.</p></noscript>
    </section>
  </main>
  <footer class="site-footer">
    <div class="container footer-grid">
      <p>AI Film Master Guide — research notes for professional AI filmmaking. Sources linked per chapter.</p>
      <nav aria-label="Footer">{footer}</nav>
      <div class="footer-colophon"><span class="tc">TC 00:00:00:00</span><span class="tailpop">Tail pop</span><span>Cut in the cutting room</span><span class="tail">AI Film Master Guide — craft, not buttons</span></div>
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
  <script src="assets/js/identity.js"></script>
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
  <div class="edge-right" aria-hidden="true"></div>
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
      <span class="hdr-tc" data-hdr-tc aria-hidden="true"><span class="hdr-rec">●</span> <span class="hdr-tc-val">00:59:52:00</span></span>
      <button type="button" class="btn btn-sm btn-ghost palette-open" aria-label="Search the guide (Ctrl+K)">
        <span aria-hidden="true">⌘K</span> Search
      </button>
    </div>
  </header>
  <main id="main">
    {hero}
    <section class="container" style="margin-bottom:var(--space-7);">
      <div class="prose">
      <figure class="heritage-fig heritage-fig-wide">
        <img src="assets/silent-era-camera.webp" alt="Frank Hurley filming on location in Papua, about 1923" loading="lazy">
        <figcaption>Frank Hurley filming on location, Papua, ca. 1923. A century before the first prompt, the job was already the job: choose the frame, commit, live with the take. <span class="heritage-attr">Photo: State Library of Queensland, public domain (no known restrictions), via Wikimedia Commons</span></figcaption>
      </figure>
        <h2>What this is</h2>
        <p>A reference manual you keep open while you work — twenty-six chapters on craft, platforms, economics, and pipelines, plus the tools (budget calculator, prompt workshop, model quiz, teardowns) and the machine-readable API underneath. It is updated as the field moves: the changelog is dated, the model data is versioned, and corrections are printed, not buried.</p>
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
      <div class="footer-colophon"><span class="tc">TC 00:00:00:00</span><span class="tailpop">Tail pop</span><span>Cut in the cutting room</span><span class="tail">AI Film Master Guide — craft, not buttons</span></div>
    </div>
  </footer>
  <div class="palette" id="palette" role="dialog" aria-modal="true" aria-label="Search the guide" hidden>
    <div class="palette-box">
      <input id="palette-input" type="search" placeholder="Search chapters, prompts, models…" autocomplete="off" aria-label="Search the guide">
      <div id="palette-results" role="listbox" aria-label="Search results"></div>
    </div>
  </div>
  <script src="assets/js/palette.js"></script>
  <script src="assets/js/docs.js"></script>
  <script src="assets/js/identity.js"></script>
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
  <div class="edge-right" aria-hidden="true"></div>
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
      <span class="hdr-tc" data-hdr-tc aria-hidden="true"><span class="hdr-rec">●</span> <span class="hdr-tc-val">00:59:52:00</span></span>
      <button type="button" class="btn btn-sm btn-ghost palette-open" aria-label="Search the guide (Ctrl+K)">
        <span aria-hidden="true">&#8984;K</span> Search
      </button>
    </div>
  </header>
  <main id="main">
    {hero}
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
      <div class="footer-colophon"><span class="tc">TC 00:00:00:00</span><span class="tailpop">Tail pop</span><span>Cut in the cutting room</span><span class="tail">AI Film Master Guide — craft, not buttons</span></div>
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
  <script src="assets/js/docs.js"></script>
  <script src="assets/js/identity.js"></script>
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
    <div class="sprocket-strip slim no-print" aria-hidden="true"></div>
    <div class="container">
      <div class="fg-slate no-print" aria-hidden="true">
        <span class="tl-rec"><i></i>REC</span>
        <span class="tl-pop">2-POP 01:00:06:00 &#183; &#x223F;1kHz</span>
        <span class="tl-title">FIELD_GUIDE — PRINT_01</span>
      </div>
      <p class="crumb no-print"><a href="../index.html">Guide</a> / <a href="index.html">Field guides</a></p>
      <h1>{title}</h1>
      <p class="fg-provenance">{provenance}</p>
      <p class="no-print"><span class="print-tag is-answer">Answer print</span></p>
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
      <div class="footer-colophon"><span class="tc">TC 00:00:00:00</span><span class="tailpop">Tail pop</span><span>Cut in the cutting room</span><span class="tail">AI Film Master Guide — craft, not buttons</span></div>
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
  <div class="edge-right" aria-hidden="true"></div>
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
      <span class="hdr-tc" data-hdr-tc aria-hidden="true"><span class="hdr-rec">●</span> <span class="hdr-tc-val">00:59:52:00</span></span>
      <button type="button" class="btn btn-sm btn-ghost palette-open" aria-label="Search the guide (Ctrl+K)">
        <span aria-hidden="true">⌘K</span> Search
      </button>
    </div>
  </header>
  <main id="main">
    {hero}
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
      <div class="footer-colophon"><span class="tc">TC 00:00:00:00</span><span class="tailpop">Tail pop</span><span>Cut in the cutting room</span><span class="tail">AI Film Master Guide — craft, not buttons</span></div>
    </div>
  </footer>
  <div class="palette" id="palette" role="dialog" aria-modal="true" aria-label="Search the guide" hidden>
    <div class="palette-box">
      <input id="palette-input" type="search" placeholder="Search chapters, prompts, models…" autocomplete="off" aria-label="Search the guide">
      <div id="palette-results" role="listbox" aria-label="Search results"></div>
    </div>
  </div>
  <script src="../assets/js/palette.js"></script>
  <script src="../assets/js/docs.js"></script>
  <script src="../assets/js/identity.js"></script>
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
    body_html = md2html.convert(body)
    # QA-009: the example is content under the page's own <h1> (spec-title);
    # demote its headings one level so the page keeps exactly one <h1>.
    for lvl in (3, 2, 1):
        body_html = body_html.replace(f"<h{lvl}", f"<h{lvl + 1}").replace(f"</h{lvl}>", f"</h{lvl + 1}>")
    return front_esc, body_html


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

    # 1. Model quick-reference — from data/v1/models.json
    models_doc = json.loads((ROOT / "data" / "v1" / "models.json").read_text())
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
         f"Generated {today} from data/v1/models.json (v{html.escape(str(models_doc.get('version', '')))}, observed {html.escape(str(models_doc.get('observed', '')))}).",
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
            hero=hero_cutroom(
                kicker="""Print-ready""",
                h1="""Field <span class="accent">guides.</span>""",
                lede="""One-page references, generated from the guide's own data — dense enough to be useful on set, honest enough to print. Every chapter prints cleanly too: open any chapter and use your browser's print.""",
                deck_title="""FIELD_GUIDES — PRINT_01""",
                clips={"v2": ['Generated pages'], "v1": ['One-page refs', 'Print cleanly', 'On set'], "a1": ['Paper rustle']},
                h1_id="fg-title",
                extra=""""""),        css=css, cards=cards, sitenav=sitenav, footer=footer))


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
            hero=hero_cutroom(
                kicker="""Repeatable workflows""",
                h1="""Shoot <span class="accent">recipes.</span>""",
                lede="""The guide's recipe skills as cards: the procedure, the inputs, a worked example, and the pitfalls — for the twelve shots and sequences every AI film needs. <span id="recipes-count" aria-live="polite">{count} recipes</span>""",
                deck_title="""SHOOT_RECIPES — BIN_01""",
                clips={"v2": ['Pitfalls'], "v1": ['Twelve shots', 'Procedures', 'Worked examples'], "a1": ['Repeatable', 'Set tone']},
                h1_id="recipes-title",
                extra="""<div class="field" style="max-width:480px;"> <label for="recipes-filter">Filter recipes</label> <input class="input" id="recipes-filter" type="search" placeholder="e.g. dialogue, trailer, horror&hellip;" autocomplete="off"> </div>"""),        css=css_links, sitenav=nav_html("", "recipes.html"), footer=footer_html(""),
        cards=cards, count=len(recipes)))
    return recipes


MODELWATCH_TMPL = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Model watch — AI Film Master Guide</title>
  <meta name="description" content="The Watchtower: every AI film model the guide tracks — live status, drift alerts, pricing changes diffed against a dated baseline, and what changed since your last visit.">
  {css}
</head>
<body>
  <div class="edge-right" aria-hidden="true"></div>
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
      <span class="hdr-tc" data-hdr-tc aria-hidden="true"><span class="hdr-rec">●</span> <span class="hdr-tc-val">00:59:52:00</span></span>
      <button type="button" class="btn btn-sm btn-ghost palette-open" aria-label="Search the guide (Ctrl+K)">
        <span aria-hidden="true">&#8984;K</span> Search
      </button>
    </div>
  </header>
  <main id="main">
    {hero}
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
      <div class="mw-freshness">
        <h2 class="mw-freshness-h">Watchtower freshness <span class="api-badge" id="mw-api-badge" data-api-state="none" role="status" tabindex="0"></span></h2>
        <p class="card-meta" id="mw-freshness-line">{freshness_line}</p>
      </div>
      <div class="wt-since" id="wt-since">
        <h2 class="wt-since-h"><span id="wt-since-title">{since_title}</span> <span class="api-badge" id="wt-api-badge" data-api-state="none" role="status" tabindex="0"></span></h2>
        <p class="wt-since-line" id="wt-since-line">{since_line}</p>
        <ul class="wt-events" id="wt-since-list">
{since_events}
        </ul>
        <button type="button" class="btn btn-sm btn-ghost wt-reset" id="wt-reset-visit">Mark all as seen — reset my baseline to today</button>
      </div>
      <div class="wt-drift" id="wt-drift">
        <h2>Drift board <span class="tc" aria-hidden="true">TC 00:00:30:00</span></h2>
        <p class="card-meta" id="wt-drift-line">{drift_line}</p>
        <ul class="wt-drift-list" id="wt-drift-list">
{drift_rows}
        </ul>
      </div>
      <div class="wt-price" id="wt-pricing">
        <h2>Pricing changes <span class="tc" aria-hidden="true">TC 00:00:45:00</span></h2>
        <p class="card-meta" id="wt-price-line">{price_line}</p>
        <div class="table-scroll"><table>
          <thead><tr><th>Model</th><th>What moved</th><th class="num">Was</th><th class="num">Now</th></tr></thead>
          <tbody id="wt-price-body">
{price_rows}
          </tbody>
        </table></div>
      </div>
      <div class="wt-history" id="wt-history">
        <h2>The log — every change on record <span class="tc" aria-hidden="true">TC 00:01:00:00</span></h2>
        <p class="card-meta">{history_count} events, newest first. Every entry traces to a source the guide recorded — a vendor announcement, an official rate card, a re-verification pass. Nothing here is inferred from a scraped page diff.</p>
        <ul class="wt-events">
{history_recent}
        </ul>
        <details class="wt-more">
          <summary>Earlier events — the full log</summary>
          <ul class="wt-events">
{history_more}
          </ul>
        </details>
      </div>
      <h2>Every model, on the record</h2>
      <p class="card-meta">{total} models · <a href="../data/v1/model-updates.md">changelog</a> · <a href="../data/v1/models.json">raw JSON</a> · <a href="../data/v1/model-checks.json">check feed</a> · <a href="../data/v1/model-history.json">event log</a></p>
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
      <div class="footer-colophon"><span class="tc">TC 00:00:00:00</span><span class="tailpop">Tail pop</span><span>Cut in the cutting room</span><span class="tail">AI Film Master Guide — craft, not buttons</span></div>
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
  <script src="assets/js/docs.js"></script>
  <script src="assets/js/identity.js"></script>
  <script src="assets/js/api-client.js"></script>
  <script src="assets/js/watchtower-lib.js"></script>
  <script src="assets/js/model-watch.js"></script>
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
    """Model freshness page — Watchtower 2.0.

    Generated from models.json + model-checks.json + pricing.json +
    model-history.json. The build-time reference date is the history
    file's generated_at, so a rebuild is reproducible: staleness, the
    30-day since window, and the pricing diff never depend on the wall
    clock. The Python drift rules below mirror server/lib/drift.js;
    scripts/watchtower.test.js holds the JS pair to identical output,
    and the pre-rendered panels here are checked against the same data.
    """
    import datetime as _dt

    doc = json.loads((ROOT / "data" / "v1" / "models.json").read_text())
    models = doc["models"]
    # Pre-rendered freshness line: the last published check feed. The live
    # layer (model-watch.js) overwrites it from /api/models-status when the
    # function answers, or re-renders it from the same static file on fallback.
    checks = json.loads((ROOT / "data" / "v1" / "model-checks.json").read_text())
    pricing = json.loads((ROOT / "data" / "v1" / "pricing.json").read_text())
    history = json.loads((ROOT / "data" / "v1" / "model-history.json").read_text())
    ck_when = str(checks.get("checked_at", "")).replace("T", " ").replace("+00:00", " UTC")
    ck_sum = checks.get("summary", {})
    freshness_line = (
        "Last published check: {when} — {total} models, {changed} changed, "
        "{errors} check errors, {unwatched} unwatched.".format(
            when=ck_when or "unknown time",
            total=ck_sum.get("models_total", len(models)),
            changed=ck_sum.get("changed", 0),
            errors=ck_sum.get("with_errors", 0),
            unwatched=ck_sum.get("no_sources", 0)))

    ref_day = _dt.date.fromisoformat(str(history.get("generated_at", "2026-10-12"))[:10])
    checks_by_name = {r["model"]: r for r in checks.get("models", [])}
    pricing_by_name = {e["model"]: e for e in pricing.get("entries", [])}
    pricing_by_id = {e["model_id"]: e for e in pricing.get("entries", [])}

    def check_status(rec):
        if rec is None:
            return "unwatched"
        if rec.get("changed"):
            return "changed"
        srcs = rec.get("source_results") or []
        if not srcs:
            return "unwatched"
        if rec.get("source_status") == "error" or any(not s.get("ok") for s in srcs):
            return "error"
        return "stable"

    def diff_pricing(baseline_entries, current_entries):
        base = {e["model_id"]: e for e in baseline_entries}
        cur = {e["model_id"]: e for e in current_entries}
        out = []
        for mid, c in cur.items():
            b = base.get(mid)
            if b is None:
                lows = [t["usd_low"] for t in c.get("tiers", [])]
                highs = [t["usd_high"] for t in c.get("tiers", [])]
                out.append({"model_id": mid, "model": c["model"], "tier": None,
                            "kind": "model-added", "before_low": None, "before_high": None,
                            "after_low": min(lows) if lows else None,
                            "after_high": max(highs) if highs else None, "pct": None})
                continue
            bt = {(t["tier"], t["unit"]): t for t in b.get("tiers", [])}
            ct = {(t["tier"], t["unit"]): t for t in c.get("tiers", [])}
            for k, t in ct.items():
                o = bt.get(k)
                if o is None:
                    out.append({"model_id": mid, "model": c["model"], "tier": t["tier"],
                                "kind": "tier-added", "before_low": None, "before_high": None,
                                "after_low": t["usd_low"], "after_high": t["usd_high"], "pct": None})
                elif o["usd_low"] != t["usd_low"] or o["usd_high"] != t["usd_high"]:
                    bmid = (o["usd_low"] + o["usd_high"]) / 2
                    cmid = (t["usd_low"] + t["usd_high"]) / 2
                    out.append({"model_id": mid, "model": c["model"], "tier": t["tier"],
                                "kind": "price-up" if cmid > bmid else "price-down",
                                "before_low": o["usd_low"], "before_high": o["usd_high"],
                                "after_low": t["usd_low"], "after_high": t["usd_high"],
                                "pct": round((cmid - bmid) / bmid * 100, 2) if bmid > 0 else None})
            for k, t in bt.items():
                if k not in ct:
                    out.append({"model_id": mid, "model": c["model"], "tier": t["tier"],
                                "kind": "tier-removed", "before_low": t["usd_low"],
                                "before_high": t["usd_high"], "after_low": None,
                                "after_high": None, "pct": None})
        for mid, b in base.items():
            if mid not in cur:
                out.append({"model_id": mid, "model": b["model"], "tier": None,
                            "kind": "model-removed", "before_low": None, "before_high": None,
                            "after_low": None, "after_high": None, "pct": None})
        out.sort(key=lambda c: (c["model_id"], c["tier"] or ""))
        return out

    price_changes = diff_pricing(history["pricing_baseline"]["entries"], pricing.get("entries", []))
    moved_ids = {c["model_id"] for c in price_changes}
    baseline_day = str(history["pricing_baseline"]["at"])[:10]

    def money(v):
        if v is None:
            return "—"
        return "$" + (f"{v:.4f}".rstrip("0").rstrip(".") if v < 0.1 and v != 0 else f"{v:.2f}")

    def money_range(lo, hi):
        if lo is None:
            return "—"
        return money(lo) if lo == hi else f"{money(lo)}–{money(hi)}"

    def fmt_day(iso):
        d = _dt.date.fromisoformat(str(iso)[:10])
        return d.strftime("%b ") + str(d.day) + d.strftime(", %Y")

    latest_event = {}
    for e in history.get("events", []):
        if not e.get("model_id"):
            continue
        prev = latest_event.get(e["model_id"])
        if prev is None or e["date"] > prev["date"]:
            latest_event[e["model_id"]] = e

    # --- drift (mirrors drift.js computeDrift) ---
    drift_rows = []
    n_alert = n_watch = n_unwatched = n_unpub = 0
    for m in models:
        entry = pricing_by_name.get(m["model"])
        mid = entry["model_id"] if entry else re.sub(r"[^a-z0-9]+", "-", m["model"].lower()).strip("-")
        cs = check_status(checks_by_name.get(m["model"]))
        pstat = entry["pricing_status"] if entry else "missing"
        try:
            stale = (ref_day - _dt.date.fromisoformat(str(m.get("last_verified"))[:10])).days
        except Exception:
            stale = None
        alerts = []
        if cs == "changed":
            alerts.append("Source check flagged a change — queued for review. This record still shows the last verified data.")
        elif cs == "error":
            alerts.append("The last automated source check failed — this record shows the last verified data.")
        elif cs == "unwatched":
            alerts.append("No automated source watch yet — verified by hand on the wave cadence.")
            n_unwatched += 1
        if pstat == "unpublished" and m.get("status") != "discontinued":
            alerts.append("No published USD rate — verify live before budgeting.")
            n_unpub += 1
        if pstat == "missing":
            alerts.append("No pricing record — verify live before budgeting.")
        if stale is not None and stale > 14:
            alerts.append(f"Record last verified {stale} days ago — re-check before a paid shoot.")
        if mid in moved_ids:
            alerts.append(f"Pricing table moved against the {baseline_day} baseline — see the pricing changes.")
        severity = "alert" if cs in ("changed", "error") else ("watch" if alerts else "ok")
        if severity == "alert":
            n_alert += 1
        elif severity == "watch":
            n_watch += 1
        if severity != "ok":
            rec = checks_by_name.get(m["model"])
            meta = []
            if rec and rec.get("last_checked"):
                meta.append(f'checked {fmt_day(str(rec["last_checked"])[:10])}')
            if m.get("last_verified"):
                meta.append(f'record verified {fmt_day(str(m["last_verified"])[:10])}')
            meta_html = (f'<span class="wt-drift-meta">{html.escape(" · ".join(meta))}</span>'
                         if meta else "")
            drift_rows.append(
                f'<li class="wt-drift-row is-{severity}">'
                f'<span class="wt-sev wt-sev-{severity}">{"Review" if severity == "alert" else "Watch"}</span>'
                f'<span class="wt-drift-body"><strong>{html.escape(m["model"])}</strong> — '
                f'{html.escape(" ".join(alerts))}</span>{meta_html}</li>')
        m["_drift"] = {"mid": mid, "check": cs, "pricing": pstat,
                       "latest": latest_event.get(mid)}
    drift_line = (f"{len(models)} models tracked · {n_alert} need review · {n_watch} on watch · "
                  f"{n_unwatched} without an automated source watch · {n_unpub} without a published rate.")
    if not drift_rows:
        drift_rows = ['<li class="wt-drift-row is-ok">Nothing needs a human today. '
                      'Every watched source answered, every record is inside its verification window.</li>']

    # --- since-visit panel: pre-rendered with a 30-day window ---
    since_day = ref_day - _dt.timedelta(days=30)
    win = [e for e in history.get("events", []) if e["date"] >= since_day.isoformat()]
    win.sort(key=lambda e: (e["date"], e["id"]), reverse=True)
    kind_counts = {}
    for e in win:
        kind_counts[e["kind"]] = kind_counts.get(e["kind"], 0) + 1
    label = {"price": "price changes", "status": "status changes", "release": "releases",
             "tier": "tier changes", "coverage": "coverage fixes", "verification": "verifications"}
    parts = [f"{kind_counts[k]} {label[k]}" for k in
             ("price", "status", "release", "tier", "coverage", "verification") if kind_counts.get(k)]
    since_title = "Changed in the last 30 days"
    since_line = ("The pre-rendered window is the last 30 days. With JavaScript on, this panel "
                  "re-renders for the exact date of your last visit — the Watchtower remembers "
                  "it in this browser, nowhere else. In the window: " + " · ".join(parts) + ".")

    def event_row(e):
        return (f'<li class="wt-event wt-event-{e["kind"]}">'
                f'<span class="wt-kind wt-kind-{e["kind"]}">{e["kind"]}</span>'
                f'<span class="wt-event-body"><strong>{html.escape(e["model"])}</strong> — '
                f'{html.escape(e["summary"])}</span>'
                f'<time class="wt-event-date" datetime="{e["date"]}">{fmt_day(e["date"])}</time></li>')

    since_events = "\n".join(event_row(e) for e in win[:8]) or \
        '<li class="wt-event wt-event-none">No events in this window.</li>'

    # --- pricing changes table (the mechanical diff) ---
    price_line = (f"Diffed mechanically against the pricing baseline of {fmt_day(baseline_day)}. "
                  "The event log below records the documented changes the baseline already "
                  "contains — the Vidu Q4 rate-card correction, the FLUX 3 QHD/UHD listing, "
                  "the Grok Lite rollout.")
    price_rows = []
    for c in price_changes:
        was = "not in the table" if c["kind"] in ("tier-added", "model-added") else money_range(c["before_low"], c["before_high"])
        now = "removed" if c["kind"] in ("tier-removed", "model-removed") else money_range(c["after_low"], c["after_high"])
        if c["kind"] == "model-added":
            what = "Model added to the pricing table"
        elif c["kind"] == "model-removed":
            what = "Model removed from the pricing table"
        elif c["kind"] == "tier-added":
            what = f"Tier added: {c['tier']}"
        elif c["kind"] == "tier-removed":
            what = f"Tier removed: {c['tier']}"
        else:
            what = c["tier"] + (f" {'+' if (c['pct'] or 0) > 0 else ''}{c['pct']}%" if c["pct"] is not None else "")
        price_rows.append(f'<tr><td><strong>{html.escape(c["model"])}</strong></td><td>{html.escape(what)}</td>'
                          f'<td class="num">{html.escape(was)}</td><td class="num">{html.escape(now)}</td></tr>')
    if not price_rows:
        price_rows = [f'<tr><td colspan="4">No movement against the {fmt_day(baseline_day)} baseline. '
                      'Every tier in the live table matches the baseline to the cent.</td></tr>']

    # --- full history timeline ---
    all_events = sorted(history.get("events", []), key=lambda e: (e["date"], e["id"]), reverse=True)
    history_recent = "\n".join(event_row(e) for e in all_events[:10])
    history_more = "\n".join(event_row(e) for e in all_events[10:])

    def card(m):
        status = m.get("status", "active")
        badge = {"active": "Active", "reported": "Reported — unconfirmed",
                 "announced": "Announced — not GA",
                 "discontinued": "Discontinued"}.get(status, status)
        sources = "".join(
            f'<li><a href="{html.escape(u)}" rel="noopener">{html.escape(u.split("/")[2])}</a></li>'
            for u in m.get("sources", []) if u.startswith("http"))
        sources_html = f"<ul>{sources}</ul>" if sources else "<p>Vendor page — verify live.</p>"
        # Watchtower 2.0 drift chips: the model's latest logged event first,
        # then the two standing cautions (unwatched, rate unpublished).
        chips = ""
        d = m.get("_drift", {})
        lev = d.get("latest")
        if lev:
            cls = {"price": "is-price", "status": "is-status", "release": "is-release"}.get(lev["kind"], "is-watch")
            chips += (f'<span class="mw-drift-chip {cls}">{html.escape(fmt_day(lev["date"]))} · '
                      f'{html.escape(lev["kind"])}</span>')
        if d.get("check") == "unwatched":
            chips += '<span class="mw-drift-chip is-watch">No automated watch</span>'
        elif d.get("pricing") == "unpublished" and status != "discontinued":
            chips += '<span class="mw-drift-chip is-watch">Rate unpublished</span>'
        return (
            f'<article class="mw-card{" is-discontinued" if status == "discontinued" else ""}" data-status="{status}">\n'
            f'  <span class="mw-badge mw-badge-{status}">{badge}</span>\n'
            f'  <span class="print-tag {"is-workprint" if status == "reported" else "is-answer"}">'
            f'{"WORKPRINT" if status == "reported" else "ANSWER PRINT"}</span>\n'
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
            f'  <p class="mw-verified">last verified {html.escape(str(m.get("last_verified", "—")))}</p>{chips}\n'
            f'</article>'
        )

    counts = {"active": 0, "reported": 0, "discontinued": 0}
    for m in models:
        counts[m.get("status", "active")] = counts.get(m.get("status", "active"), 0) + 1
    (SITE / "model-watch.html").write_text(MODELWATCH_TMPL.format(
            hero=hero_cutroom(
                kicker="""Trust, dated""",
                h1="""Model <span class="accent">watch.</span>""",
                lede="""The Watchtower, second cut: every model the guide tracks — live status, drift alerts, pricing diffed against a dated baseline, and a panel that answers one question first: what changed since you were last here?""",
                deck_title="""MODEL_WATCH — FEED_01""",
                clips={"v2": ['Last checked'], "v1": ['What it is', 'What it costs', 'What changed'], "a1": ['Watch beep', 'Never drifts']},
                h1_id="mw-title",
                extra=""""""),        css=css_links, sitenav=nav_html("", "model-watch.html"), footer=footer_html(""),
        cards="\n".join(card(m) for m in models),
        total=len(models), n_active=counts.get("active", 0),
        n_reported=counts.get("reported", 0), n_discontinued=counts.get("discontinued", 0),
        freshness_line=freshness_line,
        since_title=since_title, since_line=since_line, since_events=since_events,
        drift_line=drift_line, drift_rows="\n".join(drift_rows),
        price_line=price_line, price_rows="\n".join(price_rows),
        history_count=len(all_events), history_recent=history_recent,
        history_more=history_more))


# ---- Model deep dives (wave 11): one page per model + index ----
# ---- Model deep dives (wave 11): one page per model + index ----
MODEL_TMPL = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{name} — model deep dive — AI Film Master Guide</title>
  <meta name="description" content="{name} ({platform}): cost math, prompt tips, and when to use it vs avoid it — from the guide's versioned model data.">
  {css}
</head>
<body>
  <div class="edge-right" aria-hidden="true"></div>
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
      <span class="hdr-tc" data-hdr-tc aria-hidden="true"><span class="hdr-rec">●</span> <span class="hdr-tc-val">00:59:52:00</span></span>
      <button type="button" class="btn btn-sm btn-ghost palette-open" aria-label="Search the guide (Ctrl+K)">
        <span aria-hidden="true">&#8984;K</span> Search
      </button>
    </div>
  </header>
  <main id="main">
    {hero}
    <section class="container" aria-label="Model specifications">
      <div class="card mw-card">
        <dl>
          <dt>Best use</dt><dd>{best_use}</dd>
          <dt>Cost</dt><dd>{cost}</dd>
          <dt>Strength</dt><dd>{strength}</dd>
          <dt>Weakness</dt><dd>{weakness}</dd>
        </dl>
        <p class="mw-changed"><strong>What changed:</strong> {changed}</p>
      </div>
    </section>
    <section class="container" aria-labelledby="md-cost-h" style="margin-top:var(--space-6);">
      <h2 id="md-cost-h">Cost math</h2>
      {cost_examples}
      <p class="calc-note">USD at $0.0392/credit (Higgsfield Plus plan, observed 2026-10-10). Verify live before budgeting — rates change.</p>
    </section>
    <section class="container" aria-labelledby="md-when-h" style="margin-top:var(--space-6);">
      <h2 id="md-when-h">Use it when / avoid it when</h2>
      <div class="card-grid">
        <div class="card"><h3>Use it when</h3><p>{use_when}</p></div>
        <div class="card"><h3>Avoid it when</h3><p>{avoid_when}</p></div>
      </div>
      <p class="calc-note">Drawn directly from the model's own best-use and weakness fields — the record's words, not ours.</p>
    </section>
    <section class="container" aria-labelledby="md-tips-h" style="margin-top:var(--space-6);">
      <h2 id="md-tips-h">Prompt tips for this model</h2>
      <ul>
{tips}
      </ul>
    </section>
    <section class="container" aria-label="Sources" style="margin-top:var(--space-6);">
      <h2>Sources</h2>
      {sources}
      <p style="margin-top:var(--space-5);"><a class="btn btn-ghost" href="index.html">All model deep dives</a> <a class="btn btn-ghost" href="../model-watch.html">Model watch</a> <a class="btn btn-ghost" href="../compare.html">Compare models</a> <a class="btn btn-ghost" href="../quiz.html">Take the quiz</a></p>
    </section>
  </main>
  <footer class="site-footer">
    <div class="container footer-grid">
      <p>AI Film Master Guide — research notes for professional AI filmmaking. Sources linked per chapter.</p>
      <nav aria-label="Footer">{footer}</nav>
      <div class="footer-colophon"><span class="tc">TC 00:00:00:00</span><span class="tailpop">Tail pop</span><span>Cut in the cutting room</span><span class="tail">AI Film Master Guide — craft, not buttons</span></div>
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
  <script src="../assets/js/docs.js"></script>
  <script src="../assets/js/identity.js"></script>
</body>
</html>
"""

MODELS_INDEX_TMPL = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Model deep dives — AI Film Master Guide</title>
  <meta name="description" content="One deep-dive page per model: cost math, prompt tips, use-when/avoid-when — all generated from the guide's versioned model data.">
  {css}
</head>
<body>
  <div class="edge-right" aria-hidden="true"></div>
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
      <span class="hdr-tc" data-hdr-tc aria-hidden="true"><span class="hdr-rec">●</span> <span class="hdr-tc-val">00:59:52:00</span></span>
      <button type="button" class="btn btn-sm btn-ghost palette-open" aria-label="Search the guide (Ctrl+K)">
        <span aria-hidden="true">&#8984;K</span> Search
      </button>
    </div>
  </header>
  <main id="main">
    {hero}
    <section class="container" aria-label="All models">
      <div class="chapter-grid">
{cards}
      </div>
    </section>
  </main>
  <footer class="site-footer">
    <div class="container footer-grid">
      <p>AI Film Master Guide — research notes for professional AI filmmaking. Sources linked per chapter.</p>
      <nav aria-label="Footer">{footer}</nav>
      <div class="footer-colophon"><span class="tc">TC 00:00:00:00</span><span class="tailpop">Tail pop</span><span>Cut in the cutting room</span><span class="tail">AI Film Master Guide — craft, not buttons</span></div>
    </div>
  </footer>
  <button type="button" class="back-to-top" aria-label="Back to top">&uarr;</button>
  <div class="palette" id="palette" role="dialog" aria-modal="true" aria-label="Search the guide" hidden>
    <div class="palette-box">
      <input id="palette-input" type="search" placeholder="Search chapters, prompts, models&hellip;" autocomplete="off" aria-label="Search the guide">
      <div id="palette-results" role="listbox" aria-label="Search the guide"></div>
    </div>
  </div>
  <script src="../assets/js/palette.js"></script>
  <script src="../assets/js/docs.js"></script>
  <script src="../assets/js/identity.js"></script>
</body>
</html>
"""


def build_showdown(css_links):
    """Model showdown page — two models on the cutting table.

    Generated from the same four Watchtower artifacts as the model-watch
    page (models.json + pricing.json + model-checks.json +
    model-history.json). Every model's showdown record is embedded as a
    JSON island; assets/js/showdown.js renders any pairing from it, and
    the default pairing is pre-rendered here under the same rules, so the
    page reads identically with or without JavaScript. An "edge" is a
    direct comparison of two published values — nothing is scored,
    estimated, or invented, and an unpublished rate stays unpublished.
    """
    import datetime as _dt

    doc = json.loads((ROOT / "data" / "v1" / "models.json").read_text())
    models = doc["models"]
    checks = json.loads((ROOT / "data" / "v1" / "model-checks.json").read_text())
    pricing = json.loads((ROOT / "data" / "v1" / "pricing.json").read_text())
    history = json.loads((ROOT / "data" / "v1" / "model-history.json").read_text())

    checks_by_name = {r["model"]: r for r in checks.get("models", [])}
    pricing_by_name = {e["model"]: e for e in pricing.get("entries", [])}
    ref_day = _dt.date.fromisoformat(str(history.get("generated_at", "2026-10-12"))[:10])
    baseline_day = str(history["pricing_baseline"]["at"])[:10]

    def money(v):
        if v is None:
            return "—"
        return "$" + (f"{v:.4f}".rstrip("0").rstrip(".") if v < 0.1 and v != 0 else f"{v:.2f}")

    def money_range(lo, hi):
        if lo is None:
            return "—"
        return money(lo) if lo == hi else f"{money(lo)}–{money(hi)}"

    def fmt_day(iso):
        d = _dt.date.fromisoformat(str(iso)[:10])
        return d.strftime("%b ") + str(d.day) + d.strftime(", %Y")

    def diff_pricing(baseline_entries, current_entries):
        base = {e["model_id"]: e for e in baseline_entries}
        cur = {e["model_id"]: e for e in current_entries}
        out = []
        for mid, c in cur.items():
            b = base.get(mid)
            if b is None:
                lows = [t["usd_low"] for t in c.get("tiers", [])]
                highs = [t["usd_high"] for t in c.get("tiers", [])]
                out.append({"model_id": mid, "model": c["model"], "tier": None,
                            "kind": "model-added", "before_low": None, "before_high": None,
                            "after_low": min(lows) if lows else None,
                            "after_high": max(highs) if highs else None, "pct": None})
                continue
            bt = {(t["tier"], t["unit"]): t for t in b.get("tiers", [])}
            ct = {(t["tier"], t["unit"]): t for t in c.get("tiers", [])}
            for k, t in ct.items():
                o = bt.get(k)
                if o is None:
                    out.append({"model_id": mid, "model": c["model"], "tier": t["tier"],
                                "kind": "tier-added", "before_low": None, "before_high": None,
                                "after_low": t["usd_low"], "after_high": t["usd_high"], "pct": None})
                elif o["usd_low"] != t["usd_low"] or o["usd_high"] != t["usd_high"]:
                    bmid = (o["usd_low"] + o["usd_high"]) / 2
                    cmid = (t["usd_low"] + t["usd_high"]) / 2
                    out.append({"model_id": mid, "model": c["model"], "tier": t["tier"],
                                "kind": "price-up" if cmid > bmid else "price-down",
                                "before_low": o["usd_low"], "before_high": o["usd_high"],
                                "after_low": t["usd_low"], "after_high": t["usd_high"],
                                "pct": round((cmid - bmid) / bmid * 100, 2) if bmid > 0 else None})
            for k, t in bt.items():
                if k not in ct:
                    out.append({"model_id": mid, "model": c["model"], "tier": t["tier"],
                                "kind": "tier-removed", "before_low": t["usd_low"],
                                "before_high": t["usd_high"], "after_low": None,
                                "after_high": None, "pct": None})
        for mid, b in base.items():
            if mid not in cur:
                out.append({"model_id": mid, "model": b["model"], "tier": None,
                            "kind": "model-removed", "before_low": None, "before_high": None,
                            "after_low": None, "after_high": None, "pct": None})
        out.sort(key=lambda c: (c["model_id"], c["tier"] or ""))
        return out

    price_changes = diff_pricing(history["pricing_baseline"]["entries"], pricing.get("entries", []))
    moved_ids = {c["model_id"] for c in price_changes}
    moves_by_id = {}
    for c in price_changes:
        was = "not in the table" if c["kind"] in ("tier-added", "model-added") else money_range(c["before_low"], c["before_high"])
        now = "removed" if c["kind"] in ("tier-removed", "model-removed") else money_range(c["after_low"], c["after_high"])
        if c["kind"] == "model-added":
            what = "Model added to the pricing table"
        elif c["kind"] == "model-removed":
            what = "Model removed from the pricing table"
        elif c["kind"] == "tier-added":
            what = f"Tier added: {c['tier']}"
        elif c["kind"] == "tier-removed":
            what = f"Tier removed: {c['tier']}"
        else:
            what = c["tier"] + (f" {'+' if (c['pct'] or 0) > 0 else ''}{c['pct']}%" if c["pct"] is not None else "")
        moves_by_id.setdefault(c["model_id"], []).append({"what": what, "was": was, "now": now})

    latest_event = {}
    for e in history.get("events", []):
        if not e.get("model_id"):
            continue
        prev = latest_event.get(e["model_id"])
        if prev is None or e["date"] > prev["date"]:
            latest_event[e["model_id"]] = e

    def check_status(rec):
        if rec is None:
            return "unwatched"
        if rec.get("changed"):
            return "changed"
        srcs = rec.get("source_results") or []
        if not srcs:
            return "unwatched"
        if rec.get("source_status") == "error" or any(not s.get("ok") for s in srcs):
            return "error"
        return "stable"

    status_label = {"active": "Active", "reported": "Reported — unconfirmed",
                    "announced": "Announced — not GA", "discontinued": "Discontinued"}

    records = []
    for m in models:
        entry = pricing_by_name.get(m["model"])
        mid = entry["model_id"] if entry else re.sub(r"[^a-z0-9]+", "-", m["model"].lower()).strip("-")
        rec = checks_by_name.get(m["model"])
        cs = check_status(rec)
        pstat = entry["pricing_status"] if entry else "missing"
        try:
            stale = (ref_day - _dt.date.fromisoformat(str(m.get("last_verified"))[:10])).days
        except Exception:
            stale = None
        alerts = []
        if cs == "changed":
            alerts.append("Source check flagged a change — queued for review. This record still shows the last verified data.")
        elif cs == "error":
            alerts.append("The last automated source check failed — this record shows the last verified data.")
        elif cs == "unwatched":
            alerts.append("No automated source watch yet — verified by hand on the wave cadence.")
        if pstat == "unpublished" and m.get("status") != "discontinued":
            alerts.append("No published USD rate — verify live before budgeting.")
        if pstat == "missing":
            alerts.append("No pricing record — verify live before budgeting.")
        if stale is not None and stale > 14:
            alerts.append(f"Record last verified {stale} days ago — re-check before a paid shoot.")
        if mid in moved_ids:
            alerts.append(f"Pricing table moved against the {baseline_day} baseline — see the pricing changes.")
        severity = "alert" if cs in ("changed", "error") else ("watch" if alerts else "ok")
        srcs = (rec.get("source_results") or []) if rec else []
        ev = latest_event.get(mid)
        records.append({
            "id": mid, "name": m["model"], "platform": m.get("platform", ""),
            "type": m.get("type", ""), "status": m.get("status", "active"),
            "status_label": status_label.get(m.get("status", "active"), m.get("status", "active")),
            "last_verified": m.get("last_verified"), "best_use": m.get("best_use"),
            "strength": m.get("strength"), "weakness": m.get("weakness"),
            "cost_line": m.get("est_cost_credits"), "pricing_status": pstat,
            "tiers": [{"tier": t["tier"], "unit": t["unit"], "low": t["usd_low"],
                       "high": t["usd_high"], "confidence": t.get("confidence", "")}
                      for t in (entry.get("tiers", []) if entry else [])],
            "check_status": cs,
            "sources_ok": sum(1 for s in srcs if s.get("ok")), "sources_total": len(srcs),
            "last_checked": (str(rec["last_checked"])[:10] if rec and rec.get("last_checked") else None),
            "severity": severity, "alerts": alerts,
            "price_moves": moves_by_id.get(mid, []),
            "latest_event": ({"date": ev["date"], "kind": ev["kind"], "summary": ev["summary"]} if ev else None),
            "deep_dive": f"models/{model_slug(m['model'])}.html",
        })
    by_id = {r["id"]: r for r in records}

    def cheapest_by_unit(r):
        out = {}
        for t in r["tiers"]:
            mid_v = (t["low"] + t["high"]) / 2
            if t["unit"] not in out or mid_v < out[t["unit"]]:
                out[t["unit"]] = mid_v
        return out

    def compute_edges(a, b):
        e = {"rate": {}, "sources": None, "fresh": None, "drift": None}
        ca, cb = cheapest_by_unit(a), cheapest_by_unit(b)
        for u, v in ca.items():
            if u in cb and cb[u] != v:
                e["rate"][u] = "a" if v < cb[u] else "b"
        if a["sources_total"] and b["sources_total"]:
            fa = a["sources_ok"] / a["sources_total"]
            fb = b["sources_ok"] / b["sources_total"]
            if fa != fb:
                e["sources"] = "a" if fa > fb else "b"
        if a["last_verified"] and b["last_verified"] and a["last_verified"] != b["last_verified"]:
            e["fresh"] = "a" if a["last_verified"] > b["last_verified"] else "b"
        if len(a["alerts"]) != len(b["alerts"]):
            e["drift"] = "a" if len(a["alerts"]) < len(b["alerts"]) else "b"
        return e

    def chip(text):
        return f' <span class="sd-edge">{html.escape(text)}</span>'

    def rate_cell(m, side, edges):
        if m["pricing_status"] == "unpublished":
            return ('<p class="sd-unpub">Unpublished — no USD rate on record.</p>'
                    "<p>The guide does not estimate one. Verify live before budgeting.</p>")
        if m["pricing_status"] == "missing" or not m["tiers"]:
            return ('<p class="sd-unpub">No pricing record.</p>'
                    "<p>Verify live before budgeting.</p>")
        cheapest = cheapest_by_unit(m)
        items = []
        for t in m["tiers"]:
            c = (chip(f"lowest {t['unit']} rate")
                 if edges["rate"].get(t["unit"]) == side
                 and (t["low"] + t["high"]) / 2 == cheapest[t["unit"]] else "")
            items.append(f"<li><strong>{html.escape(t['tier'])}</strong> — "
                         f"{html.escape(money_range(t['low'], t['high']))} / {html.escape(t['unit'])} "
                         f'<span class="sd-conf">({html.escape(t["confidence"])})</span>{c}</li>')
        out = '<ul class="sd-tiers">' + "".join(items) + "</ul>"
        if m["cost_line"]:
            out += f"<p>On the record: {html.escape(m['cost_line'])}</p>"
        return out

    def check_cell(m, side, edges):
        word = {"stable": "Stable — every watched source answered",
                "changed": "Changed — a watched source moved; queued for review",
                "error": "Check failed — a watched source did not answer",
                "unwatched": "No automated source watch"}[m["check_status"]]
        s = f"<p><strong>{html.escape(word)}.</strong></p>"
        if m["sources_total"]:
            c = chip("more sources answering") if edges["sources"] == side else ""
            s += f"<p>Sources answering: {m['sources_ok']} of {m['sources_total']}{c}</p>"
        if m["last_checked"]:
            s += f"<p>Last checked {html.escape(fmt_day(m['last_checked']))}.</p>"
        return s

    def drift_cell(m, side, edges):
        word = {"alert": "Review", "watch": "Watch", "ok": "Clear"}[m["severity"]]
        c = chip("cleaner drift board") if edges["drift"] == side else ""
        s = f'<p><span class="wt-sev wt-sev-{m["severity"]}">{word}</span>{c}</p>'
        if m["alerts"]:
            s += '<ul class="sd-alerts">' + "".join(f"<li>{html.escape(t)}</li>" for t in m["alerts"]) + "</ul>"
        else:
            s += "<p>No open alerts on the drift board.</p>"
        return s

    def moves_cell(m):
        if not m["price_moves"]:
            return f"<p>No movement against the {html.escape(fmt_day(baseline_day))} pricing baseline.</p>"
        return ('<ul class="sd-alerts">' + "".join(
            f"<li>{html.escape(mv['what'])} — was {html.escape(mv['was'])}, now {html.escape(mv['now'])}.</li>"
            for mv in m["price_moves"]) + "</ul>")

    def event_cell(m):
        ev = m["latest_event"]
        if not ev:
            return "<p>No events in the Watchtower log yet.</p>"
        return (f"<p><strong>{html.escape(ev['kind'])}</strong> · {html.escape(fmt_day(ev['date']))}</p>"
                f"<p>{html.escape(ev['summary'])}</p>")

    def reel_head(m):
        return ('<div class="sd-reel-head">'
                f'<span class="mw-badge mw-badge-{html.escape(m["status"])}">{html.escape(m["status_label"])}</span>'
                f"<h3>{html.escape(m['name'])}</h3>"
                f'<p class="mw-platform">{html.escape(m["platform"])} · {html.escape(m["type"])}</p>'
                f'<p class="sd-reel-links"><a href="{html.escape(m["deep_dive"])}">Deep dive</a> · '
                '<a href="model-watch.html">Model watch</a></p></div>')

    def row(label, a_html, b_html):
        return (f'<div class="sd-row"><div class="sd-cell sd-cell-a">{a_html}</div>'
                f'<div class="sd-lab">{html.escape(label)}</div>'
                f'<div class="sd-cell sd-cell-b">{b_html}</div></div>')

    def verdict(a, b, edges):
        lines = []
        for u, side in edges["rate"].items():
            w, l = (a, b) if side == "a" else (b, a)
            lines.append(f"<strong>{html.escape(w['name'])}</strong> carries the lower entry "
                         f"per-{html.escape(u)} rate of the two; <strong>{html.escape(l['name'])}</strong> "
                         "starts higher on that unit.")
        if a["pricing_status"] == "unpublished" and b["pricing_status"] != "unpublished":
            lines.append(f"<strong>{html.escape(a['name'])}</strong> has no published USD rate — its cost "
                         "cannot be compared from the record, and the guide does not guess one.")
        if b["pricing_status"] == "unpublished" and a["pricing_status"] != "unpublished":
            lines.append(f"<strong>{html.escape(b['name'])}</strong> has no published USD rate — its cost "
                         "cannot be compared from the record, and the guide does not guess one.")
        if edges["sources"]:
            sw = a if edges["sources"] == "a" else b
            lines.append(f"<strong>{html.escape(sw['name'])}</strong> has more of its watched sources "
                         f"answering ({sw['sources_ok']} of {sw['sources_total']}).")
        if edges["drift"]:
            dw = a if edges["drift"] == "a" else b
            lines.append(f"<strong>{html.escape(dw['name'])}</strong> sits cleaner on the drift board — "
                         "fewer open alerts.")
        if not lines:
            lines.append("On the published record these two are level — no rate, source, or freshness "
                         "edge separates them. The difference is in the rows.")
        return " ".join(lines)

    def stage_html(a, b):
        edges = compute_edges(a, b)
        out = ('<div class="sd-reels"><div class="sd-reel">' + reel_head(a) + "</div>"
               '<div class="sd-splice" aria-hidden="true">VS</div>'
               '<div class="sd-reel">' + reel_head(b) + "</div></div>")
        out += '<div class="sd-table">'
        out += row("Status", f"<p><strong>{html.escape(a['status_label'])}</strong></p>",
                   f"<p><strong>{html.escape(b['status_label'])}</strong></p>")
        out += row("The rate", rate_cell(a, "a", edges), rate_cell(b, "b", edges))
        out += row("Best use", f"<p>{html.escape(a['best_use'] or '—')}</p>",
                   f"<p>{html.escape(b['best_use'] or '—')}</p>")
        out += row("Strength", f"<p>{html.escape(a['strength'] or '—')}</p>",
                   f"<p>{html.escape(b['strength'] or '—')}</p>")
        out += row("Weakness", f"<p>{html.escape(a['weakness'] or '—')}</p>",
                   f"<p>{html.escape(b['weakness'] or '—')}</p>")
        out += row("Source check", check_cell(a, "a", edges), check_cell(b, "b", edges))
        out += row("Drift board", drift_cell(a, "a", edges), drift_cell(b, "b", edges))
        out += row("Vs the baseline", moves_cell(a), moves_cell(b))
        out += row("Record verified",
                   f"<p>{html.escape(fmt_day(a['last_verified'])) if a['last_verified'] else '—'}"
                   f"{chip('verified more recently') if edges['fresh'] == 'a' else ''}</p>",
                   f"<p>{html.escape(fmt_day(b['last_verified'])) if b['last_verified'] else '—'}"
                   f"{chip('verified more recently') if edges['fresh'] == 'b' else ''}</p>")
        out += row("Latest event", event_cell(a), event_cell(b))
        out += "</div>"
        return out, edges

    a0 = by_id.get("veo-3-1") or records[0]
    b0 = by_id.get("kling-3-0") or records[1]
    stage, edges0 = stage_html(a0, b0)

    def options(sel):
        return "".join(f'<option value="{html.escape(r["id"])}"'
                       f'{" selected" if r["id"] == sel else ""}>{html.escape(r["name"])}</option>'
                       for r in records)

    ck_when = str(checks.get("checked_at", "")).replace("T", " ").replace("+00:00", " UTC")
    ck_sum = checks.get("summary", {})
    feed_line = (f"Built from the published check feed of {ck_when or 'unknown time'} — "
                 f"{ck_sum.get('models_total', len(models))} models, {ck_sum.get('changed', 0)} changed, "
                 f"{ck_sum.get('with_errors', 0)} check errors. Every figure below is the record, "
                 "not a rating: rates are the published ones, and a model with no published rate says so.")
    island = {"feed": {"checked_at": checks.get("checked_at"), "baseline_day": baseline_day},
              "models": records}
    (SITE / "showdown.html").write_text(SHOWDOWN_TMPL.format(
        css=css_links, sitenav=nav_html("", "showdown.html"), footer=footer_html(""),
        hero=hero_cutroom(
            kicker="""The cutting table""",
            h1="""Model <span class="accent">showdown.</span>""",
            lede="""Two reels on the table, spliced side by side. Published rates, source-check health, drift-board state, and pricing movement against the October 11 baseline — every figure from the Watchtower record. No scores, no estimates: where a rate is unpublished, the table says so.""",
            deck_title="""SHOWDOWN — REEL_A / REEL_B""",
            clips={"v2": ['The rate'], "v1": ['Reel A', 'Reel B'], "a1": ['The verdict']},
            h1_id="sd-title",
            extra=""" """),
        sd_feed=html.escape(feed_line), sd_options_a=options(a0["id"]),
        sd_options_b=options(b0["id"]), sd_verdict=verdict(a0, b0, edges0),
        sd_stage=stage, sd_data=json.dumps(island, ensure_ascii=False)))
    return [("showdown.html", "Model showdown")]


def model_slug(name):
    s = re.sub(r"[^a-z0-9]+", "-", str(name).lower()).strip("-")
    return s or "model"


def model_cost_examples(m):
    """Worked cost examples parsed from est_cost_credits. USD at $0.0392/credit."""
    raw = str(m.get("est_cost_credits", ""))
    usd = 0.0392
    out = []
    for rate in re.findall(r"([\d.]+)\s*/\s*image", raw):
        try:
            cr = float(rate)
        except ValueError:
            continue
        per = cr * usd
        out.append(
            f"<li><strong>{cr:g} credits / image</strong> — one image ≈ ${per:.3f}; "
            f"50 images ≈ ${per * 50:.2f}; 500 images ≈ ${per * 500:.2f}.</li>")
    for label, rate in re.findall(r"([A-Za-z0-9 ]*?)\s*~?\s*([\d.]+)\s*/\s*5s", raw):
        try:
            cr = float(rate)
        except ValueError:
            continue
        per_min_cr = cr * 12
        per_min_usd = per_min_cr * usd
        lab = label.strip() or "video"
        out.append(
            f"<li><strong>{html.escape(lab)} ≈ {cr:g} credits / 5s</strong> — "
            f"one finished minute ≈ {per_min_cr:,.0f} credits (≈ ${per_min_usd:.2f}); "
            f"a 3-minute short ≈ ${per_min_usd * 3:.2f} before takes.</li>")
    if not out:
        if "verify live" in raw.lower():
            return ("<p>No published rate in the captured data — "
                    "<strong>verify live</strong> on the vendor's pricing page before budgeting. "
                    f"Recorded rate string: <code>{html.escape(raw)}</code></p>")
        return f"<p>Rate string not machine-readable: <code>{html.escape(raw)}</code> — verify live.</p>"
    return "<ul>\n" + "\n".join(out) + "\n</ul>"


def model_chapter_tips(m):
    """Chapter links chosen by what the model actually is. No invented advice."""
    text = " ".join(str(m.get(k, "")) for k in ("best_use", "strength", "weakness", "type")).lower()
    tips = []
    if "native audio" in text or "dialogue" in text or "voice" in text or "tts" in text:
        tips.append(("<strong>Direct the voice, not just the picture.</strong> "
                     "Native-audio models live or die on voice direction — "
                     '<a href="../craft/sound-music-audio.html">sound, music &amp; audio</a> '
                     "covers TTS direction, Voice Bibles, and the two dialogue roads."))
    if m.get("type") == "image":
        tips.append(("<strong>Plates carry the look.</strong> Image models make your keyframes and "
                     "character sheets — lock them with the "
                     '<a href="../craft/character-consistency.html">character-consistency</a> system '
                     "and describe them with the <a href=\"../anatomy.html\">prompt anatomy</a>."))
    else:
        tips.append(("<strong>One action per shot.</strong> Video models execute a single believable verb well; "
                     "stacked actions collapse — <a href=\"../craft/directing-performance.html\">directing performance</a> "
                     "and the <a href=\"../doctor.html\">failure doctor</a> show what breaks."))
    if "fashion" in text or "portrait" in text or "aesthetic" in text:
        tips.append(("<strong>Style is the brief.</strong> Aesthetic models reward precise visual language — "
                     '<a href="../craft/cinematic-language.html">cinematic language</a> for the vocabulary.'))
    tips.append(("<strong>Run it through the linter.</strong> "
                 '<a href="../linter.html">Paste any prompt</a> for this model and check all ten layers before spending credits.'))
    tips.append(("<strong>Not sure it's the right model?</strong> "
                 '<a href="../quiz.html">Take the 5-question quiz</a> or '
                 '<a href="../compare.html">compare it side-by-side</a> with alternatives.'))
    return "\n".join(f"      <li>{t}</li>" for t in tips)


def build_models(css_links):
    """Model deep dives: one page per model + index, generated from data/v1/models.json."""
    models = json.loads((ROOT / "data" / "v1" / "models.json").read_text())["models"]
    out_dir = SITE / "models"
    out_dir.mkdir(parents=True, exist_ok=True)
    css_sub = css_links.replace('href="assets/', 'href="../assets/')
    seen = set()
    pages = []
    status_badge = {"active": "Active", "reported": "Reported — unconfirmed",
                    "announced": "Announced — not GA", "discontinued": "Discontinued"}
    for m in models:
        slug = model_slug(m.get("model", "model"))
        i = 2
        base = slug
        while slug in seen:
            slug = f"{base}-{i}"
            i += 1
        seen.add(slug)
        status = m.get("status", "active")
        sources = "".join(
            f'<li><a href="{html.escape(u)}" rel="noopener">{html.escape(u.split("/")[2])}</a></li>'
            for u in m.get("sources", []) if u.startswith("http"))
        sources_html = f"<ul>{sources}</ul>" if sources else "<p>Vendor page — verify live.</p>"
        pt_name = "WORKPRINT" if status == "reported" else "ANSWER PRINT"
        pt_cls = "is-workprint" if status == "reported" else "is-answer"
        print_tag_html = f'<span class="print-tag {pt_cls}">{pt_name}</span>'
        (out_dir / f"{slug}.html").write_text(MODEL_TMPL.format(
            hero=hero_cutroom(
                kicker="""Model deep dive""",
                h1=html.escape(str(m.get("model", ""))),
                lede=html.escape(str(m.get("platform", ""))) + " · " + html.escape(str(m.get("type", ""))),
                deck_title="""MODEL — DEEP_DIVE""",
                clips={"v2": ['Prompt tips'], "v1": ['Spec record', 'Worked cost', 'Avoid-when'], "a1": ['Vendor hum', 'Verify live']},
                h1_id="md-title",
                extra=('<p><span class="mw-badge mw-badge-' + status + '">'
                       + status_badge.get(status, status) + '</span> '
                       '<span class="card-meta">last verified '
                       + html.escape(str(m.get("last_verified", "—")))
                       + '</span> ' + print_tag_html + '</p>')),            name=html.escape(str(m.get("model", ""))),
            platform=html.escape(str(m.get("platform", ""))),
            mtype=html.escape(str(m.get("type", ""))),
            status=status, badge=status_badge.get(status, status),
            verified=html.escape(str(m.get("last_verified", "—"))),
            best_use=html.escape(str(m.get("best_use", ""))),
            cost=html.escape(str(m.get("est_cost_credits", ""))),
            strength=html.escape(str(m.get("strength", ""))),
            weakness=html.escape(str(m.get("weakness", ""))),
            changed=html.escape(str(m.get("what_changed", ""))),
            cost_examples=model_cost_examples(m),
            use_when=html.escape(str(m.get("best_use", ""))),
            avoid_when=html.escape(str(m.get("weakness", ""))),
            tips=model_chapter_tips(m),
            sources=sources_html,
            css=css_sub, sitenav=nav_html("../", ""), footer=footer_html("../")))
        pages.append({"slug": slug, "name": str(m.get("model", "")),
                      "platform": str(m.get("platform", "")), "status": status,
                      "best_use": str(m.get("best_use", ""))})
    cards = "\n".join(
        f'<article class="card chapter-card"><h3><a href="{p["slug"]}.html">{html.escape(p["name"])}</a></h3>'
        f'<p>{html.escape(p["platform"])} · <span class="mw-badge mw-badge-{p["status"]}">'
        f'{status_badge.get(p["status"], p["status"])}</span></p></article>'
        for p in pages)
    (out_dir / "index.html").write_text(MODELS_INDEX_TMPL.format(
            hero=hero_cutroom(
                kicker="""Reference""",
                h1="""Model <span class="accent">deep dives.</span>""",
                lede="""One page per model: the spec record, worked cost math, prompt tips from the guide's chapters, and honest use-when/avoid-when. Generated from <code>models.json</code> — it can't drift from the data.""",
                deck_title="""MODEL_INDEX — BIN_01""",
                clips={"v2": [f'{len(models)} records'], "v1": ['Spec records', 'Cost math', 'Use-when'], "a1": ['Data tone', 'models.json']},
                h1_id="mdi-title",
                extra=""""""),        css=css_sub, sitenav=nav_html("../", ""), footer=footer_html("../"), cards=cards))
    return pages


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
  <div class="edge-right" aria-hidden="true"></div>
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
      <span class="hdr-tc" data-hdr-tc aria-hidden="true"><span class="hdr-rec">●</span> <span class="hdr-tc-val">00:59:52:00</span></span>
      <button type="button" class="btn btn-sm btn-ghost palette-open" aria-label="Search the guide (Ctrl+K)">
        <span aria-hidden="true">&#8984;K</span> Search
      </button>
    </div>
  </header>
  <main id="main">
    {hero}
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
      <div class="footer-colophon"><span class="tc">TC 00:00:00:00</span><span class="tailpop">Tail pop</span><span>Cut in the cutting room</span><span class="tail">AI Film Master Guide — craft, not buttons</span></div>
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
  <script src="../assets/js/docs.js"></script>
  <script src="../assets/js/identity.js"></script>
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
  <div class="edge-right" aria-hidden="true"></div>
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
      <span class="hdr-tc" data-hdr-tc aria-hidden="true"><span class="hdr-rec">●</span> <span class="hdr-tc-val">00:59:52:00</span></span>
      <button type="button" class="btn btn-sm btn-ghost palette-open" aria-label="Search the guide (Ctrl+K)">
        <span aria-hidden="true">&#8984;K</span> Search
      </button>
    </div>
  </header>
  <main id="main">
    {hero}
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
      <div class="footer-colophon"><span class="tc">TC 00:00:00:00</span><span class="tailpop">Tail pop</span><span>Cut in the cutting room</span><span class="tail">AI Film Master Guide — craft, not buttons</span></div>
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
  <script src="../assets/js/docs.js"></script>
  <script src="../assets/js/identity.js"></script>
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
            hero=hero_cutroom(
                kicker="""Knowledge check""",
                h1=html.escape(c["title"]),
                lede=str(len(c["questions"])) + """ scenario questions drawn from the chapter. These test understanding, not trivia — every answer explains <em>why</em>. Your score saves in this browser.""",
                deck_title="""KNOWLEDGE_CHECK — REEL_01""",
                clips={"v2": ['Scenario Qs'], "v1": ['Not trivia', 'Why explained', 'Score saves'], "a1": ['Pencil scratch', 'Six chapters']},
                h1_id="check-title",
                extra='<p><a class="btn btn-ghost" href="../' + c["chapter_url"] + '">&larr; Back to the chapter</a></p>'),            title=html.escape(c["title"]), slug=slug, n=len(c["questions"]),
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
            hero=hero_cutroom(
                kicker="""The course-killer""",
                h1="""Knowledge <span class="accent">checks.</span>""",
                lede="Six chapters, " + str(total_q) + """ scenario questions. Not trivia — situations a director actually faces, with every answer explaining why. Pass these and the chapters are yours.""",
                deck_title="""KNOWLEDGE_CHECKS — REEL_01""",
                clips={"v2": ['Scenario bank'], "v1": ['Six chapters', 'Situations', 'Pass the chapters'], "a1": ['Exam hall']},
                h1_id="checks-title",
                extra="""<p class="card-meta" id="checks-summary" role="status"></p>"""),        css=css_idx, sitenav=nav_html("../", ""), footer=footer_html("../"),
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


FOUR_OH_FOUR_TMPL = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Missing reel — AI Film Master Guide</title>
  <meta name="description" content="This reel is missing. The guide's other 30 chapters are intact.">
  {css}
</head>
<body>
  <div class="edge-right" aria-hidden="true"></div>
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
      <span class="hdr-tc" data-hdr-tc aria-hidden="true"><span class="hdr-rec">●</span> <span class="hdr-tc-val">00:59:52:00</span></span>
      <button type="button" class="btn btn-sm btn-ghost palette-open" aria-label="Search the guide (Ctrl+K)">
        <span aria-hidden="true">⌘K</span> Search
      </button>
    </div>
  </header>
  <main id="main">
    <div class="sprocket-strip" aria-hidden="true"></div>
    <section class="container">
      <div class="missing-reel">
        <div class="leader-frame" data-leader-frame><b>3</b><span class="lf-label">LEADER</span></div>
        <p class="kicker is-rec">Missing reel</p>
        <h1>That reel <span class="accent">is missing.</span></h1>
        <p class="lede" style="text-align:center;color:var(--ink-dim);max-width:52ch;margin:0 auto var(--space-5);">The footage you asked for never made it to the cutting room — even the best editors lose a reel. The other 30 chapters, the Studio, and all ten teardowns are still on the shelf.</p>
        <div class="end-slate" role="img" aria-label="Upside-down end slate: footage pending"><b>SLATED AT TAIL</b><span>FOOTAGE PENDING</span></div>
        <div class="btn-row" style="justify-content:center;">
          <a class="btn btn-gold" href="index.html">Back to the guide</a>
          <a class="btn" href="studio.html">Open the Studio</a>
        </div>
      </div>
    </section>
    <div class="sprocket-strip" aria-hidden="true"></div>
  </main>
  <footer class="site-footer">
    <div class="container footer-grid">
      <p>AI Film Master Guide — research notes for professional AI filmmaking. Sources linked per chapter.</p>
      <nav aria-label="Footer">{footer}</nav>
      <div class="footer-colophon"><span class="tc">TC 00:00:00:00</span><span class="tailpop">Tail pop</span><span>Cut in the cutting room</span><span class="tail">AI Film Master Guide — craft, not buttons</span></div>
    </div>
  </footer>
  <div class="palette" id="palette" role="dialog" aria-modal="true" aria-label="Search the guide" hidden>
    <div class="palette-box">
      <input id="palette-input" type="search" placeholder="Search chapters, prompts, models…" autocomplete="off" aria-label="Search the guide">
      <div id="palette-results" role="listbox" aria-label="Search results"></div>
    </div>
  </div>
  <script src="assets/js/palette.js"></script>
  <script src="assets/js/identity.js"></script>
</body>
</html>
"""

LIVE_ORIGIN = "https://ai-film-master-guide-live.vercel.app"
ARTICLE_DIRS = {"craft", "field", "legal", "economics", "distribution",
                "platforms", "guides", "case-studies", "higgsfield",
                "checks", "field-guides"}


def _canonical_url(rel):
    """cleanUrls canonical URL for a site-relative page path."""
    if rel == "index.html":
        return LIVE_ORIGIN + "/"
    if rel.endswith("/index.html"):
        return LIVE_ORIGIN + "/" + rel[: -len("index.html")]
    return LIVE_ORIGIN + "/" + rel[: -len(".html")]


def inject_head_meta():
    """Shared <head> completion for every generated page (rotation 12
    follow-up: Foundry rounds 2/6/11/12 + Commons rounds 8/10).

    The ~40 page templates each own their <head>, so the meta layer is
    applied here, once, as a post-build pass inside the generator —
    never as hand-edits to generated pages. Values are never invented:
    og:title / twitter:title mirror the page's own <title>;
    og:description / twitter:description mirror its own meta
    description; og:image / twitter:image are ABSOLUTE on the live
    domain (social crawlers ignore relative image URLs — Foundry
    round 6). theme-color is the site's --bg token verbatim (#090807,
    icon-theme-proposal.md); the favicon set at the site root is the
    proposal's "REC frame" mark. rel="canonical" is self-referential
    and absolute (Commons round 10). JSON-LD is emitted only where a
    page's own data holds the facts: WebSite (homepage), ItemList
    (model-watch board + models index, from data/v1/models.json),
    Article (chapter pages; headline + description only — no dates,
    ratings, or offers exist in the data, so none are emitted).
    Idempotent: pages already carrying og:image are skipped.
    """
    models_doc = json.loads((ROOT / "data" / "v1" / "models.json").read_text())
    itemlist = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": [
            {"@type": "ListItem", "position": i + 1, "name": m["model"],
             "url": _canonical_url(f"models/{model_slug(m['model'])}.html")}
            for i, m in enumerate(models_doc["models"])
        ],
    }
    for path in sorted(SITE.rglob("*.html")):
        text = path.read_text()
        if "og:image" in text or "</head>" not in text:
            continue
        title_m = re.search(r"<title>(.*?)</title>", text, re.S)
        if not title_m:
            continue
        title_raw = title_m.group(1).replace('"', "&quot;")
        desc_m = re.search(r'<meta name="description" content="(.*?)"', text, re.S)
        desc_raw = desc_m.group(1) if desc_m else ""
        rel = path.relative_to(SITE).as_posix()
        canon = _canonical_url(rel)
        block = [
            '  <meta name="theme-color" content="#090807">',
            '  <link rel="icon" href="/favicon.ico" sizes="48x48">',
            '  <link rel="icon" href="/favicon.svg" type="image/svg+xml">',
            '  <link rel="apple-touch-icon" href="/apple-touch-icon.png">',
            f'  <link rel="canonical" href="{canon}">',
            '  <meta property="og:type" content="website">',
            f'  <meta property="og:title" content="{title_raw}">',
            f'  <meta property="og:description" content="{desc_raw}">',
            f'  <meta property="og:image" content="{LIVE_ORIGIN}/assets/og-card.png">',
            '  <meta property="og:image:width" content="1200">',
            '  <meta property="og:image:height" content="630">',
            '  <meta name="twitter:card" content="summary_large_image">',
            f'  <meta name="twitter:title" content="{title_raw}">',
            f'  <meta name="twitter:description" content="{desc_raw}">',
            f'  <meta name="twitter:image" content="{LIVE_ORIGIN}/assets/og-card.png">',
        ]
        ld = None
        if rel == "index.html":
            ld = {"@context": "https://schema.org", "@type": "WebSite",
                  "name": "AI Film Master Guide", "url": canon,
                  "description": html.unescape(desc_raw)}
        elif rel in ("model-watch.html", "models/index.html"):
            ld = itemlist
        elif "/" in rel and rel.split("/")[0] in ARTICLE_DIRS:
            headline = html.unescape(title_m.group(1))
            suffix = " — AI Film Master Guide"
            if headline.endswith(suffix):
                headline = headline[: -len(suffix)]
            ld = {"@context": "https://schema.org", "@type": "Article",
                  "headline": headline, "description": html.unescape(desc_raw),
                  "url": canon}
        if ld is not None:
            block.append('  <script type="application/ld+json">'
                         + json.dumps(ld, ensure_ascii=False) + "</script>")
        text = text.replace("</head>", "\n".join(block) + "\n</head>", 1)
        path.write_text(text)


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

    font_links = (
        '<link rel="preload" href="assets/fonts/anton-latin-normal-400.woff2" as="font" type="font/woff2" crossorigin>\n  '
        '<link rel="stylesheet" href="assets/css/fonts.css">\n  '
    )
    css_links = font_links + "\n  ".join(f'<link rel="stylesheet" href="{c}">' for c in CSS)

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
            words=f"{c['words']:,}", reel=f"{idx + 1:02d}",
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

    # Landing — the homepage is a cut, not a catalog: one hero, one action,
    # everything else revealed progressively (bins, path accordion, workbench).
    models_data = json.loads((ROOT / "data" / "v1" / "models.json").read_text())
    model_count = len(models_data["models"])
    chapter_count = len(flat)
    skill_count = json.loads((ROOT / "skills" / "index.json").read_text())["count"]
    bins_parts = []
    for s_idx, (section_id, section_name) in enumerate(SECTIONS):
        items = chapters[section_id]
        n = len(items)
        mins = sum(c["read_min"] for _, c in items)
        cards = "".join(
            f'<article class="card chapter-card"><h3><a href="{section_id}/{slug}.html">{c["title"]}</a></h3>'
            f'<p>{c["desc"]}</p><p class="card-meta">{c["read_min"]} min read</p></article>'
            for slug, c in items
        )
        open_attr = " open" if s_idx == 0 else ""
        bins_parts.append(
            f'<details class="bin"{open_attr}><summary class="bin-summary">'
            f'<span class="bin-no">Bin {s_idx + 1:02d}</span>'
            f'<span class="bin-name">{section_name}</span>'
            f'<span class="bin-meta">{n} {"chapter" if n == 1 else "chapters"} · {mins} min</span>'
            f'<span class="tc bin-tc">00:{s_idx * 5:02d}:00:00</span>'
            f'</summary><div class="bin-body"><div class="chapter-grid">{cards}</div></div></details>')
    total_read = fmt_total_minutes(sum(c["read_min"] for _, _, c in flat))
    (SITE / "index.html").write_text(INDEX_TMPL.format(
        css=css_links,
        total_read=total_read,
        model_count=model_count,
        chapter_count=chapter_count,
        skill_count=skill_count,
        cue_tracks=reel_cue("Scene 01", "00:01:00:00", "two ways to shoot"),
        cue_paths=reel_cue("Scene 02", "00:02:00:00", "shortest honest routes"),
        cue_chapters=reel_cue("Scene 03", "00:04:00:00", "the full shelf"),
        cue_bench=reel_cue("Scene 04", "00:06:00:00", "the bench"),
        cue_curator=reel_cue("Scene 05", "00:08:00:00", "a note, taped to the bin"),
        wave1=waveform_divider(seed=11),
        wave2=waveform_divider(seed=23),
        wave3=waveform_divider(seed=37),
        wave4=waveform_divider(seed=51),
        bins_section="\n".join(bins_parts),
        sitenav=nav_html("", "index.html"), footer=footer_html("")))
    (SITE / "budget.html").write_text(BUDGET_TMPL.format(
            hero=hero_cutroom(
                kicker="""Economics""",
                h1="""Budget <span class="accent">calculator.</span>""",
                lede="""Runtime, shot length, model, and discipline in — a cost envelope out. Grounded in the <a href="economics/credit-math.html">credit-math</a> chapter (third-party per-clip estimates, Oct 2026).""",
                deck_title="""BUDGET_CALC — TAKE_01""",
                clips={"v2": ['Credit math'], "v1": ['Runtime', 'Shot length', 'Model pick'], "a1": ['Cost envelope', 'Live total']},
                h1_id="budget-title",
                extra=""""""),        css=css_links, sitenav=nav_html("", ""), footer=footer_html("")))

    # Budget optimizer page (model mix planner, data-driven from models.json)
    (SITE / "optimizer.html").write_text(OPTIMIZER_TMPL.format(
            hero=hero_cutroom(
                kicker="""Economics""",
                h1="""Budget <span class="accent">optimizer.</span>""",
                lede="""The calculator tells you what one model costs. The optimizer tells you what your film should cost: it splits your runtime into dialogue and non-dialogue buckets and assigns the cheapest model that satisfies your quality bar — computed live from <code>models.json</code>, so the picks stay fresh as the data does.""",
                deck_title="""OPTIMIZER — TAKE_01""",
                clips={"v2": ['Four modes'], "v1": ['Dialogue split', 'Non-dialogue', 'Draft cheap'], "a1": ['Keeper take', 'Finish flagship']},
                h1_id="opt-title",
                extra=""""""),        css=css_links, sitenav=nav_html("", ""), footer=footer_html("")))

    # Anatomy of a prompt explorer
    (SITE / "anatomy.html").write_text(ANATOMY_TMPL.format(
            hero=hero_cutroom(
                kicker="""Craft""",
                h1="""Anatomy of <span class="accent">a prompt.</span>""",
                lede="""Treat the prompt as a directing system, not a description. Nine layers, in order — plus the exclusion block. Missing layers = randomness. Hover, tap, or focus any layer below to see what it does.""",
                deck_title="""PROMPT_ANATOMY — TAKE_01""",
                clips={"v2": ['Exclusion block'], "v1": ['Nine layers', 'Hover the map', 'In order'], "a1": ["Director's notes"]},
                h1_id="anat-title",
                extra=""""""),        css=css_links, sitenav=nav_html("", ""), footer=footer_html("")))
    (SITE / "skills.html").write_text(SKILLS_TMPL.format(
            hero=hero_cutroom(
                kicker="""For agents &amp; humans""",
                h1="""Task <span class="accent">skills.</span>""",
                lede="""Every procedure in the guide as a loadable skill: inputs, steps, worked examples, pitfalls. <span id="skills-count" aria-live="polite"></span>""",
                deck_title="""SKILL_LIBRARY — BIN_01""",
                clips={"v2": [f'{skill_count} skills', 'Procedures'], "v1": ['Inputs', 'Steps', 'Worked examples'], "a1": ['Agent room tone', 'Pitfalls']},
                h1_id="skills-title",
                extra="""<div class="field" style="max-width:480px;"> <label for="skills-filter">Filter skills</label> <input class="input" id="skills-filter" type="search" placeholder="e.g. lip sync, BAF, budget…" autocomplete="off"> </div>"""),        css=css_links, sitenav=nav_html("", "skills.html"), footer=footer_html("")))
    shutil.copy(ROOT / "skills" / "index.json", SITE / "skills-index.json")
    shutil.copy(ROOT / "data" / "v1" / "prompt-templates.json", SITE / "prompt-templates.json")
    shutil.copy(ROOT / "data" / "v1" / "models.json", SITE / "models.json")
    shutil.copy(ROOT / "data" / "v1" / "glossary.json", SITE / "glossary.json")
    shutil.copy(ROOT / "data" / "v1" / "camera-movements.json", SITE / "camera-movements.json")

    # Prompt workshop page (data above is what it loads)
    (SITE / "workshop.html").write_text(WORKSHOP_TMPL.format(
            hero=hero_cutroom(
                kicker="""Interactive tool""",
                h1="""Prompt <span class="accent">workshop.</span>""",
                lede="""Pick a template, a model, and a track — fill the placeholders and copy a production-ready prompt. Every template carries its anatomy notes, so you learn why it works while you use it. New to prompt structure? Start with the <a href="anatomy.html">anatomy explorer</a>.""",
                deck_title="""PROMPT_WORKSHOP — TAKE_01""",
                clips={"v2": ['Saved prompts'], "v1": ['Pick ingredients', 'Fill placeholders', 'Copy prompt'], "a1": ['Bench tone', 'Production-ready']},
                h1_id="workshop-title",
                extra=""""""),        css=css_links, sitenav=nav_html("", "workshop.html"), footer=footer_html("")))
    shutil.copy(ROOT / "prompts-facets.json", SITE / "prompts-facets.json")

    # Prompt library explorer (wave 25: searchable/filterable browser over the
    # 47 templates; reads prompt-templates.json + prompts-facets.json live)
    (SITE / "prompts.html").write_text(PROMPTS_TMPL.format(
            hero=hero_cutroom(
                kicker="""Interactive tool""",
                h1="""Prompt <span class="accent">library.</span>""",
                lede="""All 47 guide templates in one browsable shelf — filter by shot type, camera movement, lighting, and mood, see which of the ten <a href="anatomy.html">prompt-anatomy</a> layers each template demonstrates, then copy, remix, or send any template to the <a href="studio.html">Studio</a> as a shot-prompt starting point.""",
                deck_title="""PROMPT_LIBRARY — BIN_01""",
                clips={"v2": ['Remix bench'], "v1": ['47 templates', 'Facet filters', 'Anatomy notes'], "a1": ['Shelf tone', 'Copy-ready']},
                h1_id="prompts-title",
                extra=""""""),        css=css_links, sitenav=nav_html("", "prompts.html"), footer=footer_html("")))

    # Model-picker quiz page
    (SITE / "quiz.html").write_text(QUIZ_TMPL.format(
            hero=hero_cutroom(
                kicker="""Interactive tool""",
                h1="""Model-picker <span class="accent">quiz.</span>""",
                lede="""Five questions. A ranked top 3 with cost math — scored live from <code>models.json</code>, so the picks stay fresh as the data does.""",
                deck_title="""MODEL_QUIZ — TAKE_01""",
                clips={"v2": ['Ranked top 3'], "v1": ['Five questions', 'Score live', 'Cost math'], "a1": ['Think music', 'models.json']},
                h1_id="quiz-title",
                extra=""""""),        css=css_links, sitenav=nav_html("", "quiz.html"), footer=footer_html("")))

    # Model compare tool (side-by-side, shareable URLs)
    (SITE / "compare.html").write_text(COMPARE_TMPL.format(
            hero=hero_cutroom(
                kicker="""Tools""",
                h1="""Model <span class="accent">compare.</span>""",
                lede="""The quiz picks for you. This page lets you argue with it: put 2–3 models side by side — cost, best use, strengths, weaknesses, native audio, freshness — all rendered live from <code>models.json</code>. The URL updates as you pick, so the comparison is shareable.""",
                deck_title="""MODEL_COMPARE — TAKE_01""",
                clips={"v2": ['Side by side'], "v1": ['Pick contenders', 'Cost', 'Best use'], "a1": ['Debate track', '2–3 models']},
                h1_id="cmp-title",
                extra=""""""),        css=css_links, sitenav=nav_html("", "compare.html"), footer=footer_html("")))

    # Prompt gallery (workshop saves as a browsable collection)
    (SITE / "gallery.html").write_text(GALLERY_TMPL.format(
            hero=hero_cutroom(
                kicker="""Workshop""",
                h1="""Prompt <span class="accent">gallery.</span>""",
                lede="""Every prompt you've saved and rated in the workshop, in one browsable place. Filter by track and model, sort by rating, jump back into the workshop, or take your collection with you as JSON. Everything lives in your browser — nothing leaves it.""",
                deck_title="""PROMPT_GALLERY — REEL_01""",
                clips={"v2": ['Rated selects'], "v1": ['Your collection', 'Filter & sort', 'Jump back'], "a1": ['Selects reel', 'Workshop returns']},
                h1_id="gal-title",
                extra=""""""),        css=css_links, sitenav=nav_html("", "gallery.html"), footer=footer_html("")))

    # Changelog page — dated entries rebuilt from git history on every build
    (SITE / "changelog.html").write_text(CHANGELOG_TMPL.format(
            hero=hero_cutroom(
                kicker="""Freshness log""",
                h1="""What <span class="accent">changed.</span>""",
                lede="""AI film tooling rots in months. This page is how the guide stays fresh — every shipped change, dated, newest first.""",
                deck_title="""CHANGELOG — FEED_01""",
                clips={"v2": ['Dated entries'], "v1": ['Newest first', 'Every change', 'No rot'], "a1": ['Freshness beep', 'Stay current']},
                h1_id="changelog-title",
                extra=""""""),        css=css_links, sitenav=nav_html("", "changelog.html"), footer=footer_html(""),
        changelog_rows=changelog_rows()))

    # Skill-spec page — schema + one full example skill
    spec_front, spec_body = skill_spec_example()
    skill_index = json.loads((ROOT / "skills" / "index.json").read_text())
    (SITE / "skill-spec.html").write_text(SKILLSPEC_TMPL.format(
            hero=hero_cutroom(
                kicker="""Agent-native""",
                h1="""Skill schema <span class="accent">spec.</span>""",
                lede=f"""Every one of the {len(skill_index.get("skills", []))} skills in <code>skills/</code> follows this exact format — YAML frontmatter plus six Markdown sections. Build to it and your skills slot straight into this library, or any agent framework that reads it.""",
                deck_title="""SKILL_SPEC — DOC_01""",
                clips={"v2": ['Six sections'], "v1": ['YAML frontmatter', 'Build to it', f'{len(skill_index.get("skills", []))} skills'], "a1": ['Spec tone', 'Machine-readable']},
                h1_id="spec-title",
                extra=""""""),        css=css_links, sitenav=nav_html("", "skill-spec.html"), footer=footer_html(""),
        skill_count=len(skill_index.get("skills", [])),
        spec_frontmatter=spec_front, spec_example_body=spec_body))

    # Shot-by-shot teardown viewer
    shutil.copy(ROOT / "data" / "v1" / "teardowns.json", SITE / "teardowns.json")
    (SITE / "teardown.html").write_text(TEARDOWN_TMPL.format(
        css=css_links, sitenav=nav_html("", "teardown.html"), footer=footer_html("")))

    # Failure doctor (interactive troubleshooter, data-driven from diagnoses.json)
    shutil.copy(ROOT / "data" / "v1" / "diagnoses.json", SITE / "diagnoses.json")
    (SITE / "doctor.html").write_text(DOCTOR_TMPL.format(
            hero=hero_cutroom(
                kicker="""Tools""",
                h1="""Failure <span class="accent">doctor.</span>""",
                lede="""Something broke in your footage? Pick the symptom. The doctor gives you the diagnosis in craft terms, the fix that works, and — where one exists — the repair template loaded in the workshop. Every diagnosis is sourced from the guide's chapters.""",
                deck_title="""FAILURE_DOCTOR — TAKE_01""",
                clips={"v2": ['Symptom index'], "v1": ['Pick symptom', 'Diagnosis', 'The fix'], "a1": ['Flatline', 'Pulse restored']},
                h1_id="doc-title",
                extra=""""""),        css=css_links, sitenav=nav_html("", "doctor.html"), footer=footer_html("")))

    # Shot-list builder (pre-production planner, hands off to the optimizer)
    (SITE / "shots.html").write_text(SHOTS_TMPL.format(
            hero=hero_cutroom(
                kicker="""Tools""",
                h1="""Shot-list <span class="accent">builder.</span>""",
                lede="""The pre-production planner the optimizer was missing: list every shot with its model and takes, watch the cost add up live from <code>models.json</code>, then hand the whole plan to the budget optimizer. Lists save in your browser; export the JSON and take it to set.""",
                deck_title="""SHOT_BUILDER — TAKE_01""",
                clips={"v2": ['Saved lists'], "v1": ['Add a shot', 'Model per shot', 'Live cost'], "a1": ['Slate claps', 'models.json hum']},
                h1_id="sh-title",
                extra=""""""),        css=css_links, sitenav=nav_html("", "shots.html"), footer=footer_html("")))

    # Style-bible builder (consistency system's core artifact; workshop can prepend saved bibles)
    (SITE / "style-bible.html").write_text(STYLEBIBLE_TMPL.format(
            hero=hero_cutroom(
                kicker="""Tools""",
                h1="""Style-bible <span class="accent">builder.</span>""",
                lede="""Consistency is not a prompt trick — it is a document. Describe your character and world once, lock it into a STYLE LOCK block, and prepend that block verbatim to every generation in the production. Save named bibles in your browser; the <a href="workshop.html">prompt workshop</a> can prepend any saved bible automatically.""",
                deck_title="""STYLE_BIBLE — LOCK_01""",
                clips={"v2": ['Saved bibles'], "v1": ['Character lock', 'World lock', 'Style block'], "a1": ['Continuity tone', 'Prepend block']},
                h1_id="sb-title",
                extra=""""""),        css=css_links, sitenav=nav_html("", "style-bible.html"), footer=footer_html("")))

    # Prompt linter (wave 11: structural analysis against the ten-layer anatomy)
    (SITE / "linter.html").write_text(LINTER_TMPL.format(
            hero=hero_cutroom(
                kicker="""Tools""",
                h1="""Prompt <span class="accent">linter.</span>""",
                lede="""Paste any prompt. The linter checks it against the ten-layer anatomy — which layers are present, which are missing, what each gap costs you on screen — and flags the vague words models can't act on. Heuristic, honest about being heuristic: it checks structure, not taste.""",
                deck_title="""PROMPT_LINTER — TAKE_01""",
                clips={"v2": ['Ten layers'], "v1": ['Paste prompt', 'Layer check', 'Gaps flagged'], "a1": ['MOS — no audio', 'What gaps cost']},
                h1_id="lint-title",
                extra=""""""),        css=css_links, sitenav=nav_html("", "linter.html"), footer=footer_html("")))

    # The Cutting Room, playable (wow wave 1: type a weak prompt, watch the
    # scene get built shot by shot from the real prompt library, improve the
    # prompt via the fix bay, watch the cut improve — real cost math)
    (SITE / "cutting-room.html").write_text(CUTTINGROOM_TMPL.format(
            hero=hero_cutroom(
                kicker="""Interactive tool""",
                h1="""The cutting <span class="accent">room.</span>""",
                lede="""A playable cutting room: type a weak prompt, roll the camera, and watch the scene get built shot by shot from the guide's real prompt library — then improve the prompt in the fix bay and watch the cut improve, take by take. Real templates, real model pricing, real cost math.""",
                deck_title="""CUTTING_ROOM — TAKE_01""",
                clips={"v2": ['The bench'], "v1": ['Dailies', 'The shoot', 'Fix bay'], "a1": ['Take log', 'Cost desk', 'Print it']},
                h1_id="cr-title",
                extra=""""""),        css=css_links, sitenav=nav_html("", "cutting-room.html"), footer=footer_html("")))

    # Episode planner (wave 14: mini-drama series setup → episode blocks → arc tracker)
    (SITE / "episode-planner.html").write_text(EPISODEPLANNER_TMPL.format(
            hero=hero_cutroom(
                kicker="""Tools""",
                h1="""Episode <span class="accent">planner.</span>""",
                lede="""A series is a contract with the audience: lock the bible once, plan every episode as a block (one emotion, 3–5 beats, dedicated turn, cliffhanger), and keep an arc log with lessons learned. Everything saves in your browser — nothing leaves your machine.""",
                deck_title="""EPISODE_PLANNER — BLOCK_01""",
                clips={"v2": ['Cast grid', 'Turn markers'], "v1": ['Bible lock', 'Episode blocks', 'Arc log'], "a1": ['Tension bed', 'Cliffhanger sting']},
                h1_id="ep-title-h",
                extra=""""""),        css=css_links, sitenav=nav_html("", ""), footer=footer_html("")))

    # Hook-title generator (wave 14: [Episode N] + [stake] + [CTA] caption variants)
    (SITE / "hook-generator.html").write_text(HOOKGEN_TMPL.format(
            hero=hero_cutroom(
                kicker="""Tools""",
                h1="""Hook-title <span class="accent">generator.</span>""",
                lede="""In the mini-drama genre the caption <em>is</em> the hook. The observed formula — <code>[Episode N] + [one-line emotional stake] + [CTA]</code> — turns one line of stake into five worked caption variants, each with the craft reason it hooks. Name the character every time; never lead with hashtags.""",
                deck_title="""HOOK_GENERATOR — TAKE_01""",
                clips={"v2": ['Caption stack'], "v1": ['Your episode', 'Six variants', 'CTA cards'], "a1": ['Hook sting', 'Six formulas']},
                h1_id="hg-title",
                extra=""""""),        css=css_links, sitenav=nav_html("", ""), footer=footer_html("")))

    # Studio (wave 15: flagship "plan my AI film" production-packet simulator)
    (SITE / "studio.html").write_text(STUDIO_TMPL.format(
        css=css_links, sitenav=nav_html("", ""), footer=footer_html("")))

    # Green Light (wow wave 2: the studio meeting, playable — pitch in,
    # six-layer read, real-pricing plan, verdict out)
    (SITE / "greenlight.html").write_text(GREENLIGHT_TMPL.format(
            hero=hero_cutroom(
                kicker="""Interactive tool""",
                h1="""The green <span class="accent">light.</span>""",
                lede="""Every film starts as a pitch to a room. This is that room, playable: pitch your concept, and the room reads it cold — builds your shot list from the guide's real prompt library, prices every shot from the real pricing table, lays out the shoot day by day, then votes. A weak pitch gets a cheap plan. Punch it up and watch the money move.""",
                deck_title="""GREEN_LIGHT — SESSION_01""",
                clips={"v2": ['The read'], "v1": ['The pitch', 'The board', 'The money', 'The schedule'], "a1": ['The verdict']},
                h1_id="gl-title-h",
                extra=""""""),        css=css_links, sitenav=nav_html("", "greenlight.html"), footer=footer_html("")))
    (SITE / "404.html").write_text(FOUR_OH_FOUR_TMPL.format(
        css=css_links, sitenav=nav_html("", ""), footer=footer_html("")))

    # Model deep dives (wave 11: one page per model + index, from models.json)
    model_pages = build_models(css_links)

    # Manifesto page
    (SITE / "manifesto.html").write_text(MANIFESTO_TMPL.format(
            hero=hero_cutroom(
                kicker="""The manifesto""",
                h1="""This is <span class="accent">not a course.</span>""",
                lede="""No cohort. No certificate. No $2,000 upsell. This is a living reference for people making films with AI — and it has opinions.""",
                deck_title="""MANIFESTO — REEL_01""",
                clips={"v2": ['Opinions'], "v1": ['Not a course', 'Living reference', 'Sourced'], "a1": ['Soapbox', 'No upsell']},
                h1_id="man-title",
                extra=""""""),        css=css_links, sitenav=nav_html("", "manifesto.html"), footer=footer_html("")))

    # Printable field guides (generated from the guide's own data)
    build_field_guides(css_links)

    # Shoot recipes (generated from skills/recipes/*.md at build time)
    build_recipes(css_links)

    # Model freshness page (generated from data/v1/models.json)
    build_model_watch(css_links)

    # Model showdown page (two models on the cutting table, Watchtower data)
    build_showdown(css_links)

    # Episode Forge page (mini-drama episode planner, library-matched arc)
    build_forge(css_links)

    # Script Clearance desk (research cycle 81, rules 1358-1367)
    build_clearance(css_links)

    # Continuity Ledger (rotation 13 flagship — the consistency chapter as a working ledger)
    build_continuity(css_links)

    # Cue Sheet (rotation 14 flagship — the sound chapter as a working cue sheet)
    build_cuesheet(css_links)

    # Grade Sheet (rotation 15 flagship — the color-grading chapter as a working grade sheet)
    build_grade(css_links)

    # Cut Sheet (rotation 16 flagship — the editing chapters as a working cut sheet)
    build_cut(css_links)

    # Take Sheet (rotation 17 flagship — the directing-performance chapter as a working take sheet)
    build_take(css_links)

    # Knowledge checks (generated from scripts/checks.json)
    wave7_checks = build_checks(css_links)

    # Vendor-neutral craft page (static, repo root)
    shutil.copy(ROOT / "craft-not-buttons.html", SITE / "craft-not-buttons.html")

    # New pages discoverable through the search palette
    search_index.extend([
        {"url": "teardown.html", "title": "Shot-by-shot teardowns", "section": "Tools",
         "headings": ["Passport Rush", "ONEIRIC", "The $100K cautionary case", "Dear Upstairs Neighbors", "Dreams of Violets", "The First Honest Day", "The $150 Microdrama", "The Character Sheets Came First"],
         "text": "Learn to see: shot-by-shot teardowns of Passport Rush, ONEIRIC, the Grok Odyssey $100K winner, Google DeepMind's Dear Upstairs Neighbors, Fountain 0's Dreams of Violets, Nikolay Shestak's The First Honest Day ($450K Astana 2026 Grand Prix winner), StoReel's The $150 Microdrama ('Off Campus' experiment — four AI episodes in four days, documented clip by clip), and Robert Gaudette's 'A Face Only a Mother Could Love' ($50K Runway AIFF 2026 Grand Prix + Reply AI Film Festival 2026 winner — 8-minute solo short, character sheets before shot one, lip-sync in the prompt, redub for the voice), and Tim Simmons' Dragon Blue (hyper-stylized AI action short, made solo in two days with Claude Cowork as the production office — reference grids before video, filter-safety memory, token discipline) — what each shot did, what worked, what broke, and the craft lesson, with labeled prompt reconstructions where the production documented its stack."},
        {"url": "manifesto.html", "title": "Manifesto", "section": "Meta",
         "headings": ["What this is", "What it costs", "Everything is sourced", "What it won't do", "How to use it", "Who it's for"],
         "text": "This is not a course: the guide's positioning — a living, free, sourced reference. What it costs, what it refuses to do (no hype, no tool worship, no secrets), and how to use it in 10 minutes or 10 hours."},
        {"url": "field-guides/", "title": "Field guides", "section": "Tools",
         "headings": ["Model quick-reference", "Prompt anatomy cheat sheet", "Consistency & dead-eyes checklist"],
         "text": "Printable one-page field guides generated from the guide's own data: model quick-reference, prompt anatomy cheat sheet, consistency and dead-eyes checklist."},
        {"url": "quiz.html", "title": "Model-picker quiz", "section": "Tools",
         "headings": ["What's the job?", "Budget tier?", "What look?", "Native audio needed?", "Your footage plan"],
         "text": "Five questions, one ranked shortlist: the model-picker quiz scores all 22 video models against your use case, budget, and audio needs, with live cost math and a one-click handoff to the prompt workshop."},
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
        {"url": "doctor.html", "title": "Failure doctor", "section": "Tools",
         "headings": ["What are you seeing?", "Diagnosis"],
         "text": "Failure doctor: pick the symptom — face morphing, identity drift, dead eyes, plasticky skin, flat acting, melting hands, flicker — and get the craft diagnosis, the fix, and a one-click deep link into the workshop's repair templates. Every diagnosis sourced from the guide's chapters."},
        {"url": "shots.html", "title": "Shot-list builder", "section": "Tools",
         "headings": ["Add a shot", "Your shot list", "Saved lists"],
         "text": "Shot-list builder: add shots with type, model, seconds, and takes; live per-shot and total costs from models.json with 5x and 20x envelopes; save lists in the browser, export JSON, and hand off to the budget optimizer."},
        {"url": "style-bible.html", "title": "Style-bible builder", "section": "Tools",
         "headings": ["Describe the production", "Your style lock", "Saved bibles"],
         "text": "Style-bible builder: describe your character and world once, get a reusable STYLE LOCK block to prepend verbatim to every prompt. Save named bibles in the browser; the prompt workshop can prepend any saved bible automatically."},
        {"url": "anatomy.html", "title": "Anatomy of a prompt", "section": "Tools",
         "headings": ["Prompt anatomy explorer", "Your prompt"],
         "text": "Anatomy of a prompt: the nine-layer prompt anatomy as an interactive annotated example — hover any layer to learn what it does, why it matters, and what breaks without it. Plus a build-your-own mode that assembles the layers into a production-ready prompt."},
        {"url": "episode-planner.html", "title": "Episode planner", "section": "Tools",
         "headings": ["Series setup — lock the bible", "Episode block", "Arc tracker"],
         "text": "Episode planner: lock a mini-drama series (title, logline, hashtag, recurring cast with voice IDs and anchor paragraphs), plan each episode as a block (one emotion, 3–5 beats, emotional turn, cliffhanger), and keep an arc log with lessons learned. The save gate enforces the one-emotion rule (a second emotion word in the block refuses the save), per-format cliffhanger templates slot in the cast name, and a caption draft builds the hook-title caption straight from the block. Saved blocks feed one-click \"Send series to Studio\", which pre-fills the Studio's series mode (format, runtime, beats, cast anchors), or \"Send run to Studio\", which stages episode count and median runtime into the Studio's microdrama economics mode. Saves in the browser."},
        {"url": "hook-generator.html", "title": "Hook-title generator", "section": "Tools",
         "headings": ["Your episode", "Six variants"],
         "text": "Hook-title generator: builds hook-title captions from the observed formula [Episode N] + [one-line emotional stake] + [CTA] — six worked variants per input, each with a why-this-hooks craft note (including the vote-hook variant for interactive episodes). Copy any caption in one click."},
        {"url": "studio.html", "title": "Studio — plan my AI film", "section": "Tools",
         "headings": ["Your concept", "Production packet", "Shot list", "Model picks", "Budget", "Schedule", "Saved plans"],
         "text": "The Studio 2.0: AI-film studio simulator. A standalone film (title, logline, genre/mood, runtime, draft/festival tier) or a serialized series (3–10 episodes, one of the 5 proven serialized formats) in — a deterministic production packet out: shot list with per-shot prompts built from the 47-template library, per-shot model picks from models.json with real cost math, budget table with 5×/20× envelopes, shooting schedule, series bible with locked prompt DNA, self-contained HTML/Markdown packet export, localStorage plans with duplicate and continue-planning. Microdrama run mode (Studio 2.5): episodes + minutes per episode + tier in — clip budget (10–15s clips), per-episode and run budgets against the documented $50/min StoReel benchmark with live models.json rates, the 3–5x drawing-cards retake budget, a character-regen reserve, and a timeline from the documented 4-days-for-4-episodes pace. Episode planner bridges: Send series to Studio (series mode) and Send run to Studio (microdrama mode)."},
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
         "headings": ["Since your last visit", "Drift board", "Pricing changes", "The log"],
         "text": "The Watchtower 2.0: every model in the guide with live status, drift alerts, pricing changes diffed against the 2026-10-11 baseline, and what changed since your last visit: Sora discontinued, Kling 4.0 announced, the Vidu Q4 rate-card correction, PixVerse V6 added. Generated from models.json, model-checks.json, pricing.json, and model-history.json."},
        {"url": "forge.html", "title": "Episode forge", "section": "Tools",
         "headings": ["Set the episode", "The hook", "The turn", "The cliffhanger", "Take the plan"],
         "text": "The Episode Forge: a serialized mini-drama episode planner built from the guide's own craft data. An eight-beat, three-act arc (cold open, escalation, reversal and button, folded into the mini-drama genre anatomy — hook in the first 3 seconds, one emotion per episode, a dedicated turn shot, a cliffhanger that is never the resolution) with every beat matched to a real template from the guide's 47-template prompt library, scored on the template's own facets and stated use, with teardown field lessons attached through the facets' own links. A beat the library does not cover is named as uncovered — no template is invented. Export a clean markdown episode plan with the G2/G4 episode gates."},
        {"url": "clearance.html", "title": "Script clearance desk", "section": "Tools",
         "headings": ["The ten steps — the file itself", "Your clearance file", "Take the file"],
         "text": "The Script Clearance desk: the clearance layer from research cycle 81 (rules 1358–1367) as a working file — the clearance report, the annotation guide, researched names and permitted numbers, chain of title and the copyright report, the title report, release coverage, the featured-object caution, the living report, the recorded decision, and the final check at the E&O / distribution gate. Log a production's items, close every flag with a recorded decision, and read the gate verdict computed from your own entries; export the file as markdown. Chapter: legal/script-clearance.md."},
        {"url": "continuity.html", "title": "Continuity ledger", "section": "Tools",
         "headings": ["The five locks — before any generation", "Your continuity ledger", "Take the ledger"],
         "text": "The Continuity Ledger: the character-consistency chapter as a working ledger — the identity stack ranked by reliability, wardrobe and props locked verbatim, location master stills, light locked per scene, and the real start frame. Log every lock a film depends on (identity, wardrobe, prop, location, lighting, era / grade) with its state — locked, drifted, or broken — and read the chaining verdict computed from the chapter's rejection rules: a clip fails if the face drifts, the wardrobe changes, or the light flips, and failed clips don't chain, they get re-prompted. Export the ledger as markdown. Chapter: craft/character-consistency.md."},
        {"url": "grade.html", "title": "Grade sheet", "section": "Tools",
         "headings": ["The five gates — before the grade", "Your grade sheet", "Take the sheet"],
         "text": "The Grade Sheet: the color-grading chapter as a working grade sheet — every element assigned to plate or grade, a hero reference chosen per scene, one show look, one grain applied last, pre-grade masters archived. Log every scene with its hero reference, its source (single model, or mixed models with different house grades), and its five matching steps (exposure and white balance, contrast curve, saturation, the de-plasticize texture pass, skin last) — and read the grade verdict computed from the chapter's rules: a scene with no hero reference reads unmatched whatever its owner claims, a scene claimed unified with steps unfinished reads drifting, and a clean sheet still owes the scopes check. Export the sheet as markdown. Chapter: craft/color-grading.md."},
        {"url": "cut.html", "title": "Cut sheet", "section": "Tools",
         "headings": ["The five gates — before picture lock", "Your cut sheet", "Take the sheet"],
         "text": "The Cut Sheet: the editing chapters as a working cut sheet — selects discipline (2–4 takes, one keeper), generation receipts kept, takes named like an editor, cut to sound early, lock order respected (picture before grade and mix, upscale last). Log every shot with its duration, its three inspection passes (story, background scan, motion at half speed), the frame-by-frame check a hold over five seconds owes, its finding (no defect, local, structural), its route (in the cut, in repair on the fix-it ladder, sent back to regenerate, cut from the film), and its failed repair attempts — and read the picture-lock verdict computed from the chapters' rules: a hold over five seconds without the frame check reads uninspected, a structural defect routed to repair reads misrouted, two failed repairs strike a shot out, and a clean sheet still owes the 24-hour rule and the three-screen watch. Export the sheet as markdown. Chapters: craft/editing-ai-footage.md and craft/editing-pipeline.md."},
        {"url": "take.html", "title": "Take sheet", "section": "Tools",
         "headings": ["The five gates — before performance lock", "Your take sheet", "Take the sheet"],
         "text": "The Take Sheet: the directing-performance chapter as a working take sheet — every beat rewritten as a playable tactic, eyelines named per beat, the director's read (shared event plus a physical channel per character), identity locked, the restraint pass. Log every performance beat with its direction (playable tactic or emotion label), its eyeline, its dead-eyes check, its framing and whether it sits on an emotional peak, its failed rehearsals, and its route (in rehearsal, Scene-Locked, simplify the shot, hybrid) — and read the performance-lock verdict computed from the chapter's rules: an emotion label reads undirected, three failed rehearsals read overdue (simplify the shot, not the actor), a close-up away from its peak reads misspent, and a clean sheet still owes Scene Lock discipline. Export the sheet as markdown. Chapter: craft/directing-performance.md."},
        {"url": "cuesheet.html", "title": "Cue sheet", "section": "Tools",
         "headings": ["The five gates — before the mix", "Your cue sheet", "Take the sheet"],
         "text": "The Cue Sheet: the sound, music & audio chapter as a working cue sheet — the Voice Bible, the per-scene dialogue route (native or decoupled, never mixed mid-scene), score briefed per cue to the locked cut, stems kept, generation receipts saved. Log every scene with its three layers (bed, foley, accents), its route, and its state — designed, thin, or dry — and read the mix verdict computed from the chapter's rules: a scene with no bed reads dry whatever its owner claims, a thin scene holds the mix, and a clean sheet still owes the three-way listen and the silence test. Export the sheet as markdown. Chapter: craft/sound-music-audio.md."},
        {"url": "showdown.html", "title": "Model showdown", "section": "Tools",
         "headings": ["Lace up two reels", "The rate", "Drift board", "Vs the baseline"],
         "text": "The model showdown: any two of the guide's 32 watched models spliced side by side on the cutting table — published rates tier by tier, source-check health, drift-board severity and alerts, pricing movement against the 2026-10-11 baseline, and the latest Watchtower event for each. Edges are direct comparisons of published values only; a model with no published USD rate is shown as unpublished, never estimated. Generated from models.json, pricing.json, model-checks.json, and model-history.json."},
        {"url": "linter.html", "title": "Prompt linter", "section": "Tools",
         "headings": ["Your prompt", "Analysis", "The ten layers"],
         "text": "Prompt linter: paste any prompt and get a structural analysis against the ten-layer prompt anatomy — layers present/missing, vague words flagged, concrete fix per gap, one-click handoff to the workshop. Heuristic: checks structure, not taste."},
        {"url": "cutting-room.html", "title": "The cutting room", "section": "Tools",
         "headings": ["The empty bench", "The dailies", "The shoot", "The cost desk", "The fix bay", "The take log"],
         "text": "The cutting room, playable: type a weak prompt, roll the camera, and watch the scene get built shot by shot from the guide's real 47-template prompt library — then improve the prompt with guided fix-bay techniques quoted from real templates and watch the cut improve take by take, with real model pricing and honest cost math from the Watchtower pricing API. Any take can walk into the Green Light for a full production plan."},
        {"url": "greenlight.html", "title": "The green light", "section": "Tools",
         "headings": ["The pitch", "The read", "The board", "The money", "The schedule", "The verdict"],
         "text": "The green light: a studio meeting, playable. Pitch your film concept and the room reads it cold — a six-layer analysis (someone to watch, something happening, a camera decision, light, place and time, a feeling) — then builds the shot list from the guide's real 47-template prompt library, prices every shot from the real per-second pricing table (low/high ranges, tier and arithmetic shown), lays out the shoot day by day, and votes: green light, conditional, or back to the room. Festival ambition only unlocks flagship pricing when the read clears 55/100; a cold read gets draft money, stated on the record. Punch-up buttons add craft layer by layer and re-run the plan so you can watch the money move. Takes from the Cutting Room walk straight in."},
        {"url": "prompts.html", "title": "Prompt library", "section": "Tools",
         "headings": ["Find a template", "Where to go next"],
         "text": "Prompt library: all 47 guide templates in one browsable shelf — full-text search plus filters for shot type, camera movement, lighting, and mood. Every card shows which prompt-anatomy layers the template demonstrates, the shortlisted models, matching teardown workflows, and one-click copy, remix, or Send to Studio."},
        {"url": "models/", "title": "Model deep dives", "section": "Reference",
         "headings": [],
         "text": "One deep-dive page per model: spec record, worked cost math, prompt tips from the guide's chapters, use-when/avoid-when. Generated from models.json."},
    ] + [
        {"url": f"models/{p['slug']}.html", "title": p["name"] + " — model deep dive", "section": "Reference",
         "headings": ["Cost math", "Use it when / avoid it when", "Prompt tips for this model"],
         "text": f"{p['name']} ({p['platform']}): {p['best_use']}"}
        for p in model_pages
    ])
    search_index.extend([
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
    shutil.copytree(ROOT / "data", SITE / "data", dirs_exist_ok=True)
    # Wave B: the Watchtower functions + lib live at ROOT/server/ and are
    # copied into site/ so a rebuild (which wipes SITE first) can never
    # orphan them. site/data/v1/* above is the static fallback they serve.
    shutil.copytree(ROOT / "server" / "api", SITE / "api", dirs_exist_ok=True)
    shutil.copytree(ROOT / "server" / "lib", SITE / "lib", dirs_exist_ok=True)
    shutil.copy(ROOT / "api.html", SITE / "api.html")

    # Icon set at the deploy root (Foundry round 12 proposal; sources in
    # assets/icons/ — copied per-build like the other root files above,
    # because a rebuild wipes site/ first).
    for icon in ("favicon.ico", "favicon.svg", "apple-touch-icon.png",
                 "icon-192.png", "icon-512.png"):
        shutil.copy(ROOT / "assets" / "icons" / icon, SITE / icon)

    # robots.txt (Commons round 8): allow-all. The repo publishes no
    # sitemap, so there is no Sitemap: pointer — none is invented.
    (SITE / "robots.txt").write_text("User-agent: *\nAllow: /\n")

    # Shared <head> completion (OG/twitter/theme-color/favicon/canonical/
    # JSON-LD) for every generated page — see inject_head_meta().
    inject_head_meta()
    print(f"Built {len(flat)} chapters + index + search index -> {SITE}")


if __name__ == "__main__":
    main()
