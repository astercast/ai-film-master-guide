#!/usr/bin/env python3
"""Build api/v1/*.json for the AI Film Master Guide.

Usage: python3 scripts/build_api.py
Sources: research artifacts (mega-research 2026-10-10) + hand-authored competitions.
Outputs are committed so the API is static and versioned.
"""
import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ART = Path.home() / "workspace/research_notes/ai-film-mega-research-20261010-0311/artifacts"
API = ROOT / "api" / "v1"
VERSION = "1.0.0"
OBSERVED = "2026-10-10"


def parse_prompt_library():
    """Parse artifact-1 markdown into structured prompt templates."""
    text = (ART / "artifact-1-prompt-library.md").read_text()
    templates = []
    section = None
    current = None

    def flush():
        if current:
            current["prompt"] = "\n".join(current.pop("prompt_parts")).strip()
            templates.append(current)

    for line in text.split("\n"):
        m = re.match(r"^## SECTION (\d+) — (.+?) \((\d+)\)", line)
        if m:
            flush()
            current = None
            section = {"1": "core", "2": "animated", "3": "photorealistic"}[m.group(1)]
            continue
        m = re.match(r"^### ([A-Z]\d+)\.\s+(.+)$", line)
        if m:
            flush()
            current = {
                "id": m.group(1).lower(),
                "title": m.group(2).strip(),
                "track": section,
                "prompt_parts": [],
                "anatomy": None,
                "use": None,
                "models": [],
            }
            continue
        if current is None:
            continue
        for quoted in re.findall(r"`([^`]+)`", line):
            current["prompt_parts"].append(quoted)
        m = re.match(r"^(Anatomy|Register):\s*(.+)$", line)
        if m:
            rest = m.group(2)
            use_m = re.search(r"Use:\s*(.+?)(?:\. Models:|$)", rest)
            models_m = re.search(r"Models:\s*(.+?)\.?$", rest)
            current["anatomy"] = re.sub(r"\s*Use:.*$", "", rest).strip().rstrip(".")
            if use_m:
                current["use"] = use_m.group(1).strip().rstrip(".")
            if models_m:
                current["models"] = [x.strip() for x in models_m.group(1).split(",")]
    flush()
    return templates


def parse_checklists():
    text = (ART / "artifact-2-checklists.md").read_text()
    checklists = []
    current = None
    for line in text.split("\n"):
        m = re.match(r"^## \d+\.\s+(.+)$", line)
        if m:
            name = m.group(1).strip()
            current = {"id": re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-"),
                       "name": name, "items": []}
            checklists.append(current)
            continue
        m = re.match(r"^- \[[ xX]\]\s+(.+)$", line)
        if m and current is not None:
            current["items"].append(m.group(1).strip())
    return checklists


def parse_glossary():
    text = (ART / "artifact-4-glossary.md").read_text()
    terms = []
    for line in text.split("\n"):
        m = re.match(r"^-\s+\*\*(.+?)\*\*\s+[—–-]\s+(.+)$", line)
        if m:
            terms.append({"term": m.group(1).strip(), "definition": m.group(2).strip()})
    return terms


def competitions():
    # Hand-authored from the verified mega-research report (2026-10-10).
    # Competitions are craft references only: what they judge, the production
    # constraints their rules teach, and the craft lessons their judged work
    # demonstrates. No prizes, deadlines, or promotional material.
    return [{
        "id": "higgsfield-global-film-festival-2026",
        "name": "Higgsfield Global Film Festival",
        "what_it_judges": ["directing & storytelling", "visual craft",
                           "sound & editing", "originality & concept"],
        "production_constraints": [
            "Short-form runtime cap (3-5 minutes) — runtime discipline",
            "16:9 or 21:9 aspect ratio — delivery spec discipline",
            "All video/image generation on the platform — tool-constraint fluency",
            "No real person's face or voice as input, even your own — likeness safety",
            "Music, voice, and SFX AI-generated; creator holds rights — rights hygiene",
            "Submission carries watermark + packshot — delivery-package discipline",
        ],
        "craft_lessons": [
            "Judges reward story over spectacle, authorial intent, POV discipline, originality, sound design; polish is the floor.",
            "Sound is scored — a film with designed sound beats a silent film at equal visuals.",
            "Small async teams (2-4) win when the asset pipeline is disciplined.",
            "AI used for impossible scale beats AI used for novelty.",
        ],
        "sources": ["https://higgsfield.ai/blog/higgsfield-global-film-festival"],
    }, {
        "id": "runway-aiff",
        "name": "Runway AI Film Festival",
        "what_it_judges": ["narrative cohesion", "committed point of view",
                           "intentional AI use", "pro-grade sound",
                           "consistent visuals"],
        "production_constraints": [
            "AI must be meaningfully used in the filmmaking process",
            "Short-form entries",
        ],
        "craft_lessons": [
            "Concept-first films win: 'Total Pixel Space' (2025) made the medium the message.",
            "Hybrid craft wins: 'Get Me Out' (2024) shot the emotion for real, used AI only for what the budget couldn't do.",
            "A real screenplay beats a prompt: 'A Face Only a Mother Could Love' (2026) proved character-first photorealism.",
            "Consistency is the floor — no hype forgives broken continuity.",
        ],
        "sources": [
            "https://news.artnet.com/art-world/total-pixel-space-jacob-adler-a-i-film-festival-2662774",
            "https://www.fastcompany.com/91565229/runway-ai-film-festival",
        ],
    }]


def main():
    shutil.rmtree(API, ignore_errors=True)
    (API / "schema").mkdir(parents=True)

    model_data = json.loads((ART / "artifact-3-model-comparison.json").read_text())
    camera_data = json.loads((ART / "artifact-5-camera-lexicon.json").read_text())
    templates = parse_prompt_library()
    checklists = parse_checklists()
    glossary = parse_glossary()
    comps = competitions()

    assert len(templates) == 31, f"expected 31 prompt templates, got {len(templates)}"
    assert len(checklists) == 5, f"expected 5 checklists, got {len(checklists)}"
    assert len(glossary) >= 60, f"expected 60+ glossary terms, got {len(glossary)}"
    assert len(model_data["models"]) == 18
    assert len(camera_data["lexicon"]) == 22

    models = {
        "version": VERSION, "observed": OBSERVED,
        "cost_basis": model_data["cost_basis"],
        "models": model_data["models"],
        "unverified": model_data["unverified"],
    }
    cameras = {
        "version": VERSION, "observed": OBSERVED,
        "note": camera_data["note"],
        "movements": [
            {"id": re.sub(r"[^a-z0-9]+", "-", m["move"].lower()).strip("-"),
             "move": m["move"], "prompt_phrasing": m["prompt_phrasing"],
             "when_to_use": m["when_to_use"]}
            for m in camera_data["lexicon"]
        ],
    }
    prompts = {"version": VERSION, "observed": OBSERVED,
               "conventions": "Placeholders: [SHOT] [MOVE] [SUBJECT] [ACTION] [ENV] [LIGHT] [STYLE] [AUDIO]. Keep [STYLE] identical across a project. One primary motion per prompt.",
               "templates": templates}
    checks = {"version": VERSION, "observed": OBSERVED, "checklists": checklists}
    gloss = {"version": VERSION, "observed": OBSERVED, "terms": glossary}
    comps_doc = {"version": VERSION, "observed": OBSERVED,
                 "note": "Competition records teach production discipline: constraints, judging criteria, and delivery rules. No prizes, deadlines, or promotional material are tracked here — this file is about craft.",
                 "competitions": comps}

    skills_index = {}
    skills_idx_path = ROOT / "skills" / "index.json"
    if skills_idx_path.exists():
        skills_index = json.loads(skills_idx_path.read_text())

    index = {
        "name": "AI Film Master Guide API",
        "version": VERSION, "observed": OBSERVED,
        "repository": "https://github.com/astercast/ai-film-master-guide",
        "for_agents": "Start at api/v1/index.json. For task procedures, read skills/index.json and load the relevant skill file — skills are the primary agentic interface for doing work, the JSON endpoints are the data layer.",
        "provenance": "Compiled from the 2026-10-10 mega-research pass (Higgsfield pricing page read live; competition details from official sources). Unverified values are listed explicitly, never invented.",
        "skills": {
            "directory": "skills/",
            "index": "skills/index.json",
            "count": skills_index.get("count", 0),
            "usage": "Each skill is a markdown file with frontmatter (name, description), then: Use when, Inputs, Procedure, Worked example, API references, Pitfalls. Load the skill whose task matches the user's request.",
        },
        "endpoints": {
            "index": "api/v1/index.json",
            "models": "api/v1/models.json",
            "prompt-templates": "api/v1/prompt-templates.json",
            "camera-movements": "api/v1/camera-movements.json",
            "checklists": "api/v1/checklists.json",
            "glossary": "api/v1/glossary.json",
            "competitions": "api/v1/competitions.json",
        },
    }

    schemas = {
        "model.json": {
            "$schema": "http://json-schema.org/draft-07/schema#", "title": "Model",
            "type": "object",
            "required": ["model", "platform", "type", "est_cost_credits"],
            "properties": {
                "model": {"type": "string"}, "platform": {"type": "string"},
                "type": {"type": "string"}, "est_cost_credits": {"type": "string"},
                "strength": {"type": "string"}, "weakness": {"type": "string"},
                "best_use": {"type": "string"},
            },
        },
        "prompt-template.json": {
            "$schema": "http://json-schema.org/draft-07/schema#", "title": "PromptTemplate",
            "type": "object",
            "required": ["id", "title", "track", "prompt"],
            "properties": {
                "id": {"type": "string"}, "title": {"type": "string"},
                "track": {"type": "string", "enum": ["core", "animated", "photorealistic"]},
                "prompt": {"type": "string"}, "anatomy": {"type": ["string", "null"]},
                "use": {"type": ["string", "null"]},
                "models": {"type": "array", "items": {"type": "string"}},
            },
        },
        "camera-movement.json": {
            "$schema": "http://json-schema.org/draft-07/schema#", "title": "CameraMovement",
            "type": "object",
            "required": ["id", "move", "prompt_phrasing", "when_to_use"],
            "properties": {
                "id": {"type": "string"}, "move": {"type": "string"},
                "prompt_phrasing": {"type": "string"}, "when_to_use": {"type": "string"},
            },
        },
        "competition.json": {
            "$schema": "http://json-schema.org/draft-07/schema#",
            "title": "CompetitionRecord",
            "description": "A judged AI-film competition as a craft reference: what it judges, the production constraints its rules teach, and the craft lessons its judged work demonstrates. No prizes, deadlines, or promotional material.",
            "type": "object",
            "required": ["version", "observed", "competitions"],
            "properties": {
                "version": {"type": "string"},
                "observed": {"format": "date"},
                "note": {"type": "string"},
                "competitions": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "required": ["id", "name", "what_it_judges", "production_constraints", "craft_lessons", "sources"],
                        "properties": {
                            "id": {"type": "string"},
                            "name": {"type": "string"},
                            "what_it_judges": {"type": "array", "items": {"type": "string"}},
                            "production_constraints": {"type": "array", "items": {"type": "string"}},
                            "craft_lessons": {"type": "array", "items": {"type": "string"}},
                            "sources": {"type": "array", "items": {"type": "string", "format": "uri"}},
                        },
                    },
                },
            },
        },
    }

    outputs = {
        "index.json": index, "models.json": models,
        "prompt-templates.json": prompts, "camera-movements.json": cameras,
        "checklists.json": checks, "glossary.json": gloss, "competitions.json": comps_doc,
    }
    for name, payload in outputs.items():
        (API / name).write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")
    for name, schema in schemas.items():
        (API / "schema" / name).write_text(json.dumps(schema, indent=2) + "\n")

    print(f"API v{VERSION}: {len(templates)} templates, {len(model_data['models'])} models, "
          f"{len(cameras['movements'])} moves, {len(glossary)} terms -> {API}")


if __name__ == "__main__":
    main()
