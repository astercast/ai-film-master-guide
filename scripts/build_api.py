#!/usr/bin/env python3
"""Build api/v1/*.json for the AI Film Master Guide.

Usage: python3 scripts/build_api.py
Sources: research artifacts (mega-research 2026-10-10) + hand-authored festivals.
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


def festivals():
    # Hand-authored from the verified mega-research report (2026-10-10).
    # Winners were NOT announced at research time — status reflects that.
    return [{
        "id": "higgsfield-global-film-festival-2026",
        "name": "$1M Higgsfield Global Film Festival",
        "status": "winners_pending",
        "status_note": "Winners not announced at research time; expected end of October 2026. Check higgsfieldglobalfilmfestival.com.",
        "prizes": {
            "first": 500000, "second": 200000, "third": 100000,
            "audience_choice": 100000, "honorable_mention_each": 10000,
            "honorable_mention_count": 10, "currency": "USD",
        },
        "jury": ["Edwin Catmull", "Phedon Papamichael", "Paul W.S. Anderson"],
        "criteria": ["directing & storytelling", "visual craft", "sound & editing", "originality & concept"],
        "timeline": {
            "opened": "2026-08-10T14:00:00-07:00",
            "deadline": "2026-09-15T23:59:59Z",
            "screening_shortlist": "2026-09-16 to 2026-10-05",
            "jury_review": "2026-10-06 to 2026-10-11",
            "winners_expected": "end of October 2026",
        },
        "rules": [
            "Minimum 3:00 runtime (recommended max 5:00)",
            "16:9 or 21:9 aspect ratio",
            "All video/image generation on higgsfield.ai",
            "No real person's face or voice as input (even your own)",
            "Music, voice, and SFX must be AI-generated; creator holds rights",
            "Submission must carry watermark + packshot, plus a public social post of the film",
        ],
        "sources": ["https://higgsfield.ai/blog/higgsfield-global-film-festival"],
    }]


def main():
    shutil.rmtree(API, ignore_errors=True)
    (API / "schema").mkdir(parents=True)

    model_data = json.loads((ART / "artifact-3-model-comparison.json").read_text())
    camera_data = json.loads((ART / "artifact-5-camera-lexicon.json").read_text())
    templates = parse_prompt_library()
    checklists = parse_checklists()
    glossary = parse_glossary()
    fest = festivals()

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
    fest_doc = {"version": VERSION, "observed": OBSERVED, "festivals": fest}

    index = {
        "name": "AI Film Master Guide API",
        "version": VERSION, "observed": OBSERVED,
        "provenance": "Compiled from the 2026-10-10 mega-research pass (Higgsfield pricing page read live; festival details from the official festival blog). Unverified values are listed explicitly, never invented.",
        "endpoints": {
            "index": "api/v1/index.json",
            "models": "api/v1/models.json",
            "prompt-templates": "api/v1/prompt-templates.json",
            "camera-movements": "api/v1/camera-movements.json",
            "checklists": "api/v1/checklists.json",
            "glossary": "api/v1/glossary.json",
            "festivals": "api/v1/festivals.json",
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
    }

    outputs = {
        "index.json": index, "models.json": models,
        "prompt-templates.json": prompts, "camera-movements.json": cameras,
        "checklists.json": checks, "glossary.json": gloss, "festivals.json": fest_doc,
    }
    for name, payload in outputs.items():
        (API / name).write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")
    for name, schema in schemas.items():
        (API / "schema" / name).write_text(json.dumps(schema, indent=2) + "\n")

    print(f"API v{VERSION}: {len(templates)} templates, {len(model_data['models'])} models, "
          f"{len(cameras['movements'])} moves, {len(glossary)} terms -> {API}")


if __name__ == "__main__":
    main()
