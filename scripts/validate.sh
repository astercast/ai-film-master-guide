#!/usr/bin/env bash
# validate.sh — one-command validation pipeline for the AI Film Master Guide.
#
# Stages:
#   1. JS syntax ......... node --check every .js shipped to the browser
#   2. JSON parse ........ every JSON file under api/, site/, skills/, scripts/
#   3. JSON Schema ....... draft-07 validation of EVERY data/v1 endpoint
#                         against data/v1/schema/ (schemas self-checked too)
#   4. Relative links .... every href/src in every HTML page resolves on disk
#   5. Generator audit ... skills/** matches build_skills.py output exactly
#                         (no hand edits); prompt-templates.json matches the
#                         artifact parser; data/v1 preserve list covers every
#                         non-generated file
#   6. llms.txt freshness build_llms.py regenerates llms.txt + llms-full.txt;
#                         git diff must be clean (the generator owns them)
#   7. Studio ............ node unit tests for the studio engine
#                         (scripts/studio.test.js); studio.html + studio.js
#                         exist in both assets/js and the built site/
#   8. Agent workflows .. node scripts/agent-workflows.test.js — the three
#                         AGENT.md example workflows executed against the
#                         real local data/v1 JSON files
#
# Exit code: 0 only if every stage passes. Anything failing is a real issue
# to fix, not cosmetic churn.
#
# Usage: bash scripts/validate.sh   (from anywhere; resolves the repo itself)

set -u
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

PASS=0
FAIL=0
STAGES=8
fail() { echo "  FAIL: $1"; FAIL=$((FAIL+1)); }
pass() { echo "  ok: $1"; PASS=$((PASS+1)); }
stage() { echo; echo "[$1/$STAGES] $2"; }

# ---------------------------------------------------------------- stage 1 ---
stage 1 "JS syntax (node --check)"
JS_OK=1
JS_N=0
while IFS= read -r f; do
  JS_N=$((JS_N+1))
  if ! node --check "$f" >/dev/null 2>&1; then
    fail "$f"; JS_OK=0
  fi
done < <(find assets/js site/assets/js -name '*.js' 2>/dev/null | sort)
if [ "$JS_OK" = 1 ]; then pass "$JS_N JS files parse"; fi

# ---------------------------------------------------------------- stage 2 ---
stage 2 "JSON parse"
JSON_N=0
JSON_BAD=0
while IFS= read -r f; do
  JSON_N=$((JSON_N+1))
  if ! python3 -c 'import json,sys; json.load(open(sys.argv[1]))' "$f" 2>/dev/null; then
    fail "invalid JSON: $f"; JSON_BAD=$((JSON_BAD+1))
  fi
done < <(find api site skills scripts -name '*.json' 2>/dev/null | grep -v __pycache__ | sort)
if [ "$JSON_BAD" = 0 ]; then pass "$JSON_N JSON files parse"; fi

# ---------------------------------------------------------------- stage 3 ---
stage 3 "JSON Schema (draft-07)"
python3 - <<'EOF'
import json, sys
from pathlib import Path
from jsonschema import Draft7Validator

ROOT = Path(".")
SCH = ROOT / "data" / "v1" / "schema"
failures = []

def schema(name):
    s = json.loads((SCH / name).read_text())
    Draft7Validator.check_schema(s)  # the schema itself must be valid draft-07
    return Draft7Validator(s)

def doc(name):
    return json.loads((ROOT / "data" / "v1" / name).read_text())

# per-record schemas
checks = [
    ("models.json", "models", schema("model.json"), "model"),
    ("prompt-templates.json", "templates", schema("prompt-template.json"), "template"),
    ("camera-movements.json", "movements", schema("camera-movement.json"), "movement"),
]
for fname, key, val, label in checks:
    for i, rec in enumerate(doc(fname)[key]):
        for e in val.iter_errors(rec):
            failures.append(f"{fname}[{i}] {label}: {e.message}")

# doc-level schemas (every remaining endpoint)
for fname, sname in [("competitions.json", "competition.json"),
                     ("teardowns.json", "teardown.json"),
                     ("diagnoses.json", "diagnosis.json"),
                     ("checklists.json", "checklist.json"),
                     ("glossary.json", "glossary.json"),
                     ("index.json", "index.json"),
                     ("model-checks.json", "model-checks.json"),
                     ("model-review-queue.json", "model-review-queue.json"),
                     ("model-history.json", "model-history.json")]:
    for e in schema(sname).iter_errors(doc(fname)):
        failures.append(f"{fname}: {e.message}")

if failures:
    print("  FAIL: schema violations:")
    for f in failures[:20]:
        print("   -", f)
    if len(failures) > 20:
        print(f"   ... and {len(failures)-20} more")
    sys.exit(1)
print("  ok: all 12 endpoints validate against their draft-07 schemas")
EOF
[ $? -eq 0 ] && pass "schema validation clean" || FAIL=$((FAIL+1))

# ---------------------------------------------------------------- stage 4 ---
stage 4 "relative-link check (0 broken)"
python3 - <<'EOF'
import re, sys
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(".")
ATTR = re.compile(r'''(?:href|src)\s*=\s*["']([^"']+)["']''', re.I)
total = 0
broken = []

def resolve(page, link):
    link = link.strip()
    if not link or link.startswith(("#", "mailto:", "tel:", "data:", "javascript:")):
        return None
    if re.match(r"^(?:https?:)?//", link, re.I):
        return None  # external: out of scope for this check
    link = unquote(link.split("#", 1)[0].split("?", 1)[0])
    if not link:
        return None
    if link.startswith("/"):
        return ROOT / "site" / link[1:]  # site-rooted
    return (page.parent / link)

for page in sorted(ROOT.glob("*.html")) + sorted((ROOT / "site").rglob("*.html")):
    if page.parent == ROOT and page.name in ("craft-not-buttons.html", "api.html"):
        # build sources, not published pages: the copies served at site/ are checked there
        continue
    text = page.read_text()
    for m in ATTR.finditer(text):
        total += 1
        target = resolve(page, m.group(1))
        if target is None:
            continue
        t = Path(str(target).rstrip("/"))
        if not t.exists():
            broken.append(f"{page.relative_to(ROOT)} -> {m.group(1)}")

print(f"  checked {total} links")
if broken:
    print(f"  FAIL: {len(broken)} broken links:")
    for b in broken[:25]:
        print("   -", b)
    if len(broken) > 25:
        print(f"   ... and {len(broken)-25} more")
    sys.exit(1)
print("  ok: 0 broken relative links")
EOF
[ $? -eq 0 ] && pass "link check" || FAIL=$((FAIL+1))

# ---------------------------------------------------------------- stage 5 ---
stage 5 "generator-owns-output audit"
# 5a. skills/** must be byte-identical to what build_skills.py generates
python3 scripts/build_skills.py >/dev/null 2>&1
if [ $? -ne 0 ]; then
  fail "build_skills.py crashed"
else
  if git diff --quiet -- skills/; then
    SK_N=$(find skills -name '*.md' | wc -l | tr -d ' ')
    pass "skills/ ($SK_N files) byte-identical to generator output (no hand edits)"
  else
    fail "skills/ differs from build_skills.py output (hand edit or stale build):"
    git diff --stat -- skills/ | head -8 | sed 's/^/    /'
  fi
fi

# 5b. prompt-templates.json must match the artifact parser output
python3 - <<'EOF'
import json, sys
sys.path.insert(0, "scripts")
import build_api  # noqa: F401  (main() only runs under __main__)
parsed = build_api.parse_prompt_library()
committed = json.loads(open("data/v1/prompt-templates.json").read())["templates"]
if parsed == committed:
    print(f"  ok: prompt-templates.json matches artifact-1 parser output ({len(parsed)} templates)")
else:
    print("  FAIL: data/v1/prompt-templates.json != artifact-1 parser output")
    sys.exit(1)
EOF
[ $? -eq 0 ] && pass "prompt-templates.json == parser output" || FAIL=$((FAIL+1))

# 5c. data/v1: every file must be either generator-written or in the preserve list
python3 - <<'EOF'
import re, sys
from pathlib import Path

ROOT = Path(".")
src = (ROOT / "scripts" / "build_api.py").read_text()

m = re.search(r'for rel in \[(.*?)\]:', src, re.S)
preserved = set(re.findall(r'"([^"]+)"', m.group(1)))
generated = {"index.json", "models.json", "prompt-templates.json",
             "camera-movements.json", "checklists.json", "glossary.json",
             "competitions.json",
             "schema/model.json", "schema/prompt-template.json",
             "schema/camera-movement.json", "schema/competition.json",
             "schema/checklist.json", "schema/glossary.json",
             "schema/index.json"}

unaccounted = []
for f in sorted((ROOT / "data" / "v1").rglob("*")):
    if f.is_file() and not str(f).endswith(".pyc"):
        rel = str(f.relative_to(ROOT / "data" / "v1"))
        if rel not in preserved and rel not in generated:
            unaccounted.append(rel)

if unaccounted:
    print("  FAIL: data/v1 files with no generator and no preserve entry:")
    for u in unaccounted:
        print("   -", u)
    print("  (add to build_api.py's preserve list or the outputs dict)")
    sys.exit(1)
print(f"  ok: all data/v1 files accounted for ({len(preserved)} preserved, {len(generated)} generated)")
EOF
[ $? -eq 0 ] && pass "data/v1 preserve list covers every non-generated file" || FAIL=$((FAIL+1))

# 5d. every skills/*.md id must come from the generator (api data ids or HAND)
python3 - <<'EOF'
import json, re, sys
from pathlib import Path

ROOT = Path(".")
def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")

t = json.loads((ROOT / "data/v1/prompt-templates.json").read_text())
c = json.loads((ROOT / "data/v1/camera-movements.json").read_text())
m = json.loads((ROOT / "data/v1/models.json").read_text())
ch = json.loads((ROOT / "data/v1/checklists.json").read_text())
expected = ({f"prompt-{x['id']}" for x in t["templates"]} |
            {f"camera-{x['id']}" for x in c["movements"]} |
            {f"direct-{slug(x['model'])}" for x in m["models"] if x.get("status") != "discontinued"} |
            {f"audit-{x['id']}" for x in ch["checklists"]} |
            set(re.findall(r'dict\(id="([^"]+)"', (ROOT / "scripts/build_skills.py").read_text())))

stray = []
for f in sorted((ROOT / "skills").rglob("*.md")):
    sid = f.stem
    if sid not in expected:
        stray.append(str(f.relative_to(ROOT)))

idx = json.loads((ROOT / "skills/index.json").read_text())
if idx["count"] != len(list((ROOT / "skills").rglob("*.md"))):
    print(f"  FAIL: skills/index.json count {idx['count']} != {len(list((ROOT / 'skills').rglob('*.md')))} files")
    sys.exit(1)
if stray:
    print("  FAIL: skills not produced by the generator:")
    for s in stray:
        print("   -", s)
    sys.exit(1)
print(f"  ok: all skill ids generator-sourced; index count {idx['count']} matches files on disk")
EOF
[ $? -eq 0 ] && pass "skills ids all generator-sourced" || FAIL=$((FAIL+1))

# 5e. prompts-facets.json (HAND) must cover every template id exactly once —
# the library UI reads prompt-templates.json live, so the counts must match
python3 - <<'EOF'
import json, sys
from pathlib import Path

ROOT = Path(".")
t = json.loads((ROOT / "data/v1/prompt-templates.json").read_text())["templates"]
f = json.loads((ROOT / "prompts-facets.json").read_text())
tids = [x["id"] for x in t]
fids = list(f["facets"].keys())
voc = f["vocab"]
mov = {m["id"] for m in json.loads((ROOT / "data/v1/camera-movements.json").read_text())["movements"]} | {"varies", "none"}
tds = {x["id"] for x in json.loads((ROOT / "data/v1/teardowns.json").read_text())["teardowns"]}
layers = set(voc["layers"])
errors = []
if sorted(fids) != sorted(tids):
    errors.append(f"facet ids != template ids (facets {len(fids)}, templates {len(tids)})")
if len(set(fids)) != len(fids):
    errors.append("duplicate facet ids")
for k, v in f["facets"].items():
    if v["shot_type"] not in voc["shot_type"]: errors.append(f"{k}: shot_type {v['shot_type']}")
    if v["movement"] not in mov: errors.append(f"{k}: movement {v['movement']}")
    if v["lighting"] not in voc["lighting"]: errors.append(f"{k}: lighting {v['lighting']}")
    if v["mood"] not in voc["mood"]: errors.append(f"{k}: mood {v['mood']}")
    if set(v["layers"]) - layers: errors.append(f"{k}: layers {set(v['layers']) - layers}")
    if set(v["teardowns"]) - tds: errors.append(f"{k}: teardowns {set(v['teardowns']) - tds}")
if errors:
    print("  FAIL: prompts-facets.json out of sync:")
    for e in errors[:15]: print("   -", e)
    if len(errors) > 15: print(f"   ... and {len(errors)-15} more")
    sys.exit(1)
print(f"  ok: prompts-facets.json covers all {len(tids)} template ids; facets/teardowns in vocab")
EOF
[ $? -eq 0 ] && pass "prompts-facets.json in sync with prompt-templates.json" || FAIL=$((FAIL+1))

# ---------------------------------------------------------------- stage 6 ---
stage 6 "llms.txt / llms-full.txt freshness (generator-owned)"
if python3 scripts/build_llms.py >/dev/null 2>&1; then
  if git diff --quiet -- llms.txt llms-full.txt; then
    pass "build_llms.py regenerates llms.txt + llms-full.txt with zero diff (no hand edits)"
  else
    fail "llms.txt / llms-full.txt differ from build_llms.py output (hand edit or stale build):"
    git diff --stat -- llms.txt llms-full.txt | head -5 | sed 's/^/    /'
  fi
else
  fail "build_llms.py crashed"
fi

# ---------------------------------------------------------------- stage 7 ---
stage 7 "Studio engine + artifacts"
STUDIO_OK=1
if [ ! -f assets/js/studio.js ]; then fail "assets/js/studio.js missing"; STUDIO_OK=0; fi
if [ ! -f site/studio.html ]; then fail "site/studio.html missing (rebuild the site)"; STUDIO_OK=0; fi
if [ ! -f site/assets/js/studio.js ]; then fail "site/assets/js/studio.js missing (rebuild the site)"; STUDIO_OK=0; fi
STUDIO_OUT=$(node scripts/studio.test.js 2>&1)
if echo "$STUDIO_OUT" | tail -1 | grep -q "all pass"; then
  TEST_N=$(echo "$STUDIO_OUT" | grep -c "^ok ")
  pass "studio.test.js: $TEST_N engine unit tests pass (shot counts, determinism, budget sums, model resolution)"
else
  fail "studio.test.js failures:"
  echo "$STUDIO_OUT" | grep "^FAIL" | head -8 | sed 's/^/    /'
  STUDIO_OK=0
fi
# the Studio page must fetch the data it plans from
for d in site/models.json site/prompt-templates.json site/camera-movements.json site/prompts-facets.json; do
  if [ ! -f "$d" ]; then fail "$d missing — the Studio cannot plan without it"; STUDIO_OK=0; fi
done
if [ "$STUDIO_OK" = 1 ]; then pass "studio.html + studio.js shipped in assets/js and site/, data files present"; fi

# Green Light page: engine + page + real pricing table
GL_OK=1
for f in assets/js/greenlight.js site/greenlight.html site/assets/js/greenlight.js; do
  if [ ! -f "$f" ]; then fail "$f missing (rebuild the site)"; GL_OK=0; fi
done
if [ ! -f site/data/v1/pricing.json ]; then fail "site/data/v1/pricing.json missing — the Green Light cannot price without it"; GL_OK=0; fi
GL_OUT=$(node scripts/greenlight.test.js 2>&1)
if echo "$GL_OUT" | tail -1 | grep -q "all pass"; then
  GL_N=$(echo "$GL_OUT" | grep -c "^ok ")
  pass "greenlight.test.js: $GL_N engine unit tests pass (six-layer read, pricing tiers, money rule, verdicts)"
else
  fail "greenlight.test.js failures:"
  echo "$GL_OUT" | grep "^FAIL" | head -8 | sed 's/^/    /'
  GL_OK=0
fi
# window.StudioEngine must be exposed for the Green Light page
if grep -q "window.StudioEngine = StudioEngine" assets/js/studio.js; then
  pass "studio.js exposes window.StudioEngine for the Green Light page"
else
  fail "studio.js does not expose window.StudioEngine"; GL_OK=0
fi
# Watchtower 2.0: drift engine (server + browser mirror), changes endpoint,
# history data + page panels.
WT_OK=1
for f in server/lib/drift.js server/api/models-changes.js assets/js/watchtower-lib.js \
         assets/js/model-watch.js data/v1/model-history.json data/v1/schema/model-history.json \
         site/assets/js/watchtower-lib.js site/api/models-changes.js site/lib/drift.js \
         site/data/v1/model-history.json; do
  if [ ! -f "$f" ]; then fail "$f missing (Watchtower 2.0 incomplete)"; WT_OK=0; fi
done
WT_OUT=$(node scripts/watchtower.test.js 2>&1)
if echo "$WT_OUT" | tail -1 | grep -q "all pass"; then
  WT_N=$(echo "$WT_OUT" | grep -c "^ok ")
  pass "watchtower.test.js: $WT_N drift-engine tests pass (pricing diff, events window, drift severities, browser-mirror equivalence)"
else
  fail "watchtower.test.js failures:"
  echo "$WT_OUT" | tail -6 | sed 's/^/    /'
  WT_OK=0
fi
if grep -q "wt-since" site/model-watch.html && grep -q "wt-drift-list" site/model-watch.html && grep -q "model-history" site/model-watch.html; then
  pass "model-watch.html carries the Watchtower 2.0 panels (since-visit, drift board, event log)"
else
  fail "model-watch.html missing Watchtower 2.0 panels"; WT_OK=0
fi

# Episode Forge: engine + page + real library data
FG_OK=1
for f in assets/js/forge.js site/forge.html site/assets/js/forge.js; do
  if [ ! -f "$f" ]; then fail "$f missing (rebuild the site)"; FG_OK=0; fi
done
FG_OUT=$(node scripts/forge.test.js 2>&1)
if echo "$FG_OUT" | tail -1 | grep -q "all pass"; then
  FG_N=$(echo "$FG_OUT" | grep -c "^ok ")
  pass "forge.test.js: $FG_N engine assertions pass (8-beat arc, deterministic library matching, no invented templates, export traces)"
else
  fail "forge.test.js failures:"
  echo "$FG_OUT" | grep "^FAIL" | head -8 | sed 's/^/    /'
  FG_OK=0
fi

# Script Clearance desk: engine + page + chapter (research cycle 81)
CL_OK=1
for f in assets/js/clearance.js site/clearance.html site/assets/js/clearance.js site/legal/script-clearance.html; do
  if [ ! -f "$f" ]; then fail "$f missing (rebuild the site)"; CL_OK=0; fi
done
CL_OUT=$(node scripts/clearance.test.js 2>&1)
if echo "$CL_OUT" | tail -1 | grep -q "all pass"; then
  CL_N=$(echo "$CL_OUT" | grep -c "^ok ")
  pass "clearance.test.js: $CL_N engine assertions pass (ten rules 1358-1367, recorded-decision gate, export traces)"
else
  fail "clearance.test.js failures:"
  echo "$CL_OUT" | grep "^FAIL" | head -8 | sed 's/^/    /'
  CL_OK=0
fi

# Continuity Ledger: engine + page + chapter (rotation 13 flagship)
CT_OK=1
for f in assets/js/continuity.js site/continuity.html site/assets/js/continuity.js site/craft/character-consistency.html; do
  if [ ! -f "$f" ]; then fail "$f missing (rebuild the site)"; CT_OK=0; fi
done
CT_OUT=$(node scripts/continuity.test.js 2>&1)
if echo "$CT_OUT" | tail -1 | grep -q "all pass"; then
  CT_N=$(echo "$CT_OUT" | grep -c "^ok ")
  pass "continuity.test.js: $CT_N engine assertions pass (five pre-generation locks, rejection-rule verdicts, export traces)"
else
  fail "continuity.test.js failures:"
  echo "$CT_OUT" | grep "^FAIL" | head -8 | sed 's/^/    /'
  CT_OK=0
fi

# Cue Sheet: engine + page + chapter (rotation 14 flagship)
CS_OK=1
for f in assets/js/cuesheet.js site/cuesheet.html site/assets/js/cuesheet.js site/craft/sound-music-audio.html; do
  if [ ! -f "$f" ]; then fail "$f missing (rebuild the site)"; CS_OK=0; fi
done
CS_OUT=$(node scripts/cuesheet.test.js 2>&1)
if echo "$CS_OUT" | tail -1 | grep -q "all pass"; then
  CS_N=$(echo "$CS_OUT" | grep -c "^ok ")
  pass "cuesheet.test.js: $CS_N engine assertions pass (five pre-mix gates, three layers, no-bed-is-dry rule, mix verdicts, export traces)"
else
  fail "cuesheet.test.js failures:"
  echo "$CS_OUT" | grep "^FAIL" | head -8 | sed 's/^/    /'
  CS_OK=0
fi

# Grade Sheet: engine + page + chapter (rotation 15 flagship)
GR_OK=1
for f in assets/js/grade.js site/grade.html site/assets/js/grade.js site/craft/color-grading.html; do
  if [ ! -f "$f" ]; then fail "$f missing (rebuild the site)"; GR_OK=0; fi
done
GR_OUT=$(node scripts/grade.test.js 2>&1)
if echo "$GR_OUT" | tail -1 | grep -q "all pass"; then
  GR_N=$(echo "$GR_OUT" | grep -c "^ok ")
  pass "grade.test.js: $GR_N engine assertions pass (five pre-grade gates, five matching steps, no-reference-is-unmatched rule, grade verdicts, export traces)"
else
  fail "grade.test.js failures:"
  echo "$GR_OUT" | grep "^FAIL" | head -8 | sed 's/^/    /'
  GR_OK=0
fi

# Cutting Room → Green Light bridge button present (rendered by cutting-room.js)
if grep -q "cr-greenlight" assets/js/cutting-room.js && grep -q "cr-greenlight" site/assets/js/cutting-room.js; then
  pass "cutting-room → green-light bridge wired (button + handler)"
else
  fail "cutting-room → green-light bridge missing"; GL_OK=0
fi

# ---------------------------------------------------------------- stage 8 ---
stage 8 "Agent workflows (AGENT.md examples vs real data/v1 data)"
WF_OUT=$(node scripts/agent-workflows.test.js 2>&1)
if echo "$WF_OUT" | tail -1 | grep -q "ALL PASS"; then
  WF_N=$(echo "$WF_OUT" | grep -c "^ok   -")
  pass "agent-workflows.test.js: $WF_N assertions pass (horror-short plan, prompt lint, model price track)"
else
  fail "agent-workflows.test.js failures:"
  echo "$WF_OUT" | grep "^FAIL" | head -8 | sed 's/^/    /'
fi

# ---------------------------------------------------------------- summary ---
echo
echo "validate.sh: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ] && echo "ALL STAGES PASS" || echo "VALIDATION FAILED"
exit $([ "$FAIL" -eq 0 ] && echo 0 || echo 1)
