#!/usr/bin/env bash
# validate.sh — one-command validation pipeline for the AI Film Master Guide.
#
# Stages:
#   1. JS syntax ......... node --check every .js shipped to the browser
#   2. JSON parse ........ every JSON file under api/, site/, skills/, scripts/
#   3. JSON Schema ....... draft-07 validation (models/teardowns/templates/
#                         camera/competitions/diagnoses) against api/v1/schema/
#   4. Relative links .... every href/src in every HTML page resolves on disk
#   5. Generator audit ... skills/** matches build_skills.py output exactly
#                         (no hand edits); prompt-templates.json matches the
#                         artifact parser; api/v1 preserve list covers every
#                         non-generated file
#   6. llms.txt freshness chapter count matches CHAPTER_ORDER; every chapter
#                         marker present in llms-full.txt
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
fail() { echo "  FAIL: $1"; FAIL=$((FAIL+1)); }
pass() { echo "  ok: $1"; PASS=$((PASS+1)); }
stage() { echo; echo "[$1/6] $2"; }

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
SCH = ROOT / "api" / "v1" / "schema"
failures = []

def schema(name):
    s = json.loads((SCH / name).read_text())
    Draft7Validator.check_schema(s)  # the schema itself must be valid draft-07
    return Draft7Validator(s)

def doc(name):
    return json.loads((ROOT / "api" / "v1" / name).read_text())

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

# doc-level schemas
for fname, sname in [("competitions.json", "competition.json"),
                     ("teardowns.json", "teardown.json"),
                     ("diagnoses.json", "diagnosis.json")]:
    for e in schema(sname).iter_errors(doc(fname)):
        failures.append(f"{fname}: {e.message}")

if failures:
    print("  FAIL: schema violations:")
    for f in failures[:20]:
        print("   -", f)
    if len(failures) > 20:
        print(f"   ... and {len(failures)-20} more")
    sys.exit(1)
print("  ok: models/teardowns/templates/camera/competitions/diagnoses validate against draft-07 schemas")
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
committed = json.loads(open("api/v1/prompt-templates.json").read())["templates"]
if parsed == committed:
    print(f"  ok: prompt-templates.json matches artifact-1 parser output ({len(parsed)} templates)")
else:
    print("  FAIL: api/v1/prompt-templates.json != artifact-1 parser output")
    sys.exit(1)
EOF
[ $? -eq 0 ] && pass "prompt-templates.json == parser output" || FAIL=$((FAIL+1))

# 5c. api/v1: every file must be either generator-written or in the preserve list
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
             "schema/camera-movement.json", "schema/competition.json"}

unaccounted = []
for f in sorted((ROOT / "api" / "v1").rglob("*")):
    if f.is_file() and not str(f).endswith(".pyc"):
        rel = str(f.relative_to(ROOT / "api" / "v1"))
        if rel not in preserved and rel not in generated:
            unaccounted.append(rel)

if unaccounted:
    print("  FAIL: api/v1 files with no generator and no preserve entry:")
    for u in unaccounted:
        print("   -", u)
    print("  (add to build_api.py's preserve list or the outputs dict)")
    sys.exit(1)
print(f"  ok: all api/v1 files accounted for ({len(preserved)} preserved, {len(generated)} generated)")
EOF
[ $? -eq 0 ] && pass "api/v1 preserve list covers every non-generated file" || FAIL=$((FAIL+1))

# 5d. every skills/*.md id must come from the generator (api data ids or HAND)
python3 - <<'EOF'
import json, re, sys
from pathlib import Path

ROOT = Path(".")
def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")

t = json.loads((ROOT / "api/v1/prompt-templates.json").read_text())
c = json.loads((ROOT / "api/v1/camera-movements.json").read_text())
m = json.loads((ROOT / "api/v1/models.json").read_text())
ch = json.loads((ROOT / "api/v1/checklists.json").read_text())
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

# ---------------------------------------------------------------- stage 6 ---
stage 6 "llms.txt / llms-full.txt freshness"
python3 - <<'EOF'
import re, sys
sys.path.insert(0, "scripts")
import build_site

order = build_site.CHAPTER_ORDER
expected_n = sum(len(v) for v in order.values())

llms = open("llms.txt").read()
m = re.search(r"(\d+) chapters with sidebar nav", llms)
if not m or int(m.group(1)) != expected_n:
    print(f"  FAIL: llms.txt chapter count {m.group(1) if m else 'MISSING'} != CHAPTER_ORDER total {expected_n}")
    sys.exit(1)

full = open("llms-full.txt").read()
missing = [f"{sec}/{slug}" for sec, slugs in order.items() for slug in slugs
           if f"<!-- chapter: {sec}/{slug}.md -->" not in full]
if missing:
    print("  FAIL: llms-full.txt missing chapter markers:")
    for x in missing:
        print("   -", x)
    sys.exit(1)
print(f"  ok: llms.txt says {expected_n} chapters; llms-full.txt carries all {expected_n} chapter markers")
EOF
[ $? -eq 0 ] && pass "llms.txt/llms-full.txt fresh" || FAIL=$((FAIL+1))

# ---------------------------------------------------------------- summary ---
echo
echo "validate.sh: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ] && echo "ALL STAGES PASS" || echo "VALIDATION FAILED"
exit $([ "$FAIL" -eq 0 ] && echo 0 || echo 1)
