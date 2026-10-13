#!/usr/bin/env bash
# tests/api.test.sh — Vercel Wave A, film-watchtower (ARCHITECTURE.md §12).
#
# Usage:
#   ./tests/api.test.sh                        # spins up tests/local-server.js, runs all checks
#   BASE=https://<preview>.vercel.app ./tests/api.test.sh   # runs against a live URL
#
# Asserts: envelope ok:true per roster endpoint, envelope schema (§1.10),
# 401 gates on the cron job, 400/404 gates on calc-cost, static fallback
# presence, cache headers (§1.6), rate limiting (§1.7), cron-daily lint.
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO"

pass=0; fail=0
chk() { # chk <name> <command...>
  local name="$1"; shift
  if "$@" >/dev/null 2>&1; then pass=$((pass+1)); echo "ok   $name";
  else fail=$((fail+1)); echo "FAIL $name"; fi
}

CRON_SECRET_TEST="test-secret-wave-a"

if [ -z "${BASE:-}" ]; then
  # Local mode: pick a free port, start the harness with a known CRON_SECRET.
  PORT="$(python3 -c 'import socket; s=socket.socket(); s.bind(("127.0.0.1",0)); print(s.getsockname()[1])')"
  BASE="http://127.0.0.1:$PORT"
  PORT="$PORT" CRON_SECRET="$CRON_SECRET_TEST" node tests/local-server.js > /tmp/watchtower-test-server.log 2>&1 &
  SERVER_PID=$!
  trap 'kill $SERVER_PID 2>/dev/null || true' EXIT
  for i in $(seq 1 50); do
    curl -sf -o /dev/null "$BASE/api/health" 2>/dev/null && break
    sleep 0.2
  done
  AUTH_HEADER="Authorization: Bearer $CRON_SECRET_TEST"
else
  # Remote mode (preview URL): the caller owns the server; use their secret if given.
  AUTH_HEADER="Authorization: Bearer ${CRON_SECRET:-}"
fi

VAL="python3 tests/validate_envelope.py"
JSON_OK='import json,sys; e=json.load(sys.stdin); assert e["ok"] is True, "ok!=true"; assert "request_id" in e["meta"], "no request_id"'

echo "== 1. health =="
chk "health 200" curl -sf "$BASE/api/health"
chk "health envelope ok" bash -c "curl -sf '$BASE/api/health' | python3 -c '$JSON_OK'"
chk "health schema" bash -c "curl -sf '$BASE/api/health' | $VAL"
chk "health functions == roster" bash -c "curl -sf '$BASE/api/health' | python3 -c \"
import json,sys; e=json.load(sys.stdin)
assert e['data']['functions'] == ['health','models-status','models-pricing','models-changes','calc-cost','cron/watchtower'], e['data']['functions']\""
chk "health cache s-maxage=60" bash -c "curl -sf -D - -o /dev/null '$BASE/api/health' | grep -qi 'cache-control: public, s-maxage=60'"

echo "== 2. roster endpoints: envelope ok:true =="
for p in models-status models-pricing models-changes; do
  chk "envelope $p" bash -c "curl -sf '$BASE/api/$p' | python3 -c '$JSON_OK'"
  chk "schema $p" bash -c "curl -sf '$BASE/api/$p' | $VAL"
  chk "cache $p s-maxage=600" bash -c "curl -sf -D - -o /dev/null '$BASE/api/$p' | grep -qi 'cache-control: public, s-maxage=600'"
done

echo "== 3. models-status payload shape =="
chk "models-status 32 models, status enum" bash -c "curl -sf '$BASE/api/models-status' | python3 -c \"
import json,sys; e=json.load(sys.stdin); ms=e['data']['models']
assert len(ms)==32, len(ms)
assert all(m['status'] in ('stable','changed','error','unwatched') for m in ms)
assert all(m['id'] and m['name'] and isinstance(m['source_urls'],list) for m in ms)\""

echo "== 4. models-pricing payload shape =="
chk "models-pricing 32 models" bash -c "curl -sf '$BASE/api/models-pricing' | python3 -c \"
import json,sys; e=json.load(sys.stdin); ms=e['data']['models']
assert len(ms)==32, len(ms)
veo=[m for m in ms if m['model_id']=='veo-3-1'][0]
assert any(t['tier']=='standard-720p' and t['usd_low']==0.4 for t in veo['tiers'])
assert e['data']['currency']=='USD'\""
chk "models-pricing ?model_id= filter" bash -c "curl -sf '$BASE/api/models-pricing?model_id=runway-gen-4-5' | python3 -c \"
import json,sys; e=json.load(sys.stdin); assert e['ok'] is True and len(e['data']['models'])==1\""
chk "models-pricing ?model_id=bogus -> 404 NOT_FOUND" bash -c "curl -s '$BASE/api/models-pricing?model_id=bogus' | python3 -c \"
import json,sys; e=json.load(sys.stdin); assert e['ok'] is False and e['error']['code']=='NOT_FOUND'\" && \
  [ "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/models-pricing?model_id=bogus")" = 404 ]"

echo "== 4b. models-changes (Watchtower 2.0) =="
chk "models-changes since window holds October events" bash -c "curl -sf '$BASE/api/models-changes?since=2026-10-01' | python3 -c \"
import json,sys; e=json.load(sys.stdin); d=e['data']
ids=[x['id'] for x in d['events']]
assert '2026-10-07-vidu-q4-rate-card' in ids, ids
assert '2026-09-28-kling-40-announced' not in ids
assert d['counts']['total']==len(d['events']) and d['counts']['total']==79, d['counts']
assert d['since']=='2026-10-01' and d['baseline_at'].startswith('2026-10-11')\""
chk "models-changes future window empty" bash -c "curl -sf '$BASE/api/models-changes?since=2999-01-01' | python3 -c \"
import json,sys; e=json.load(sys.stdin); assert e['data']['counts']['total']==0 and e['data']['events']==[]\""
chk "models-changes bad since -> 400 BAD_INPUT" bash -c "[ \"\$(curl -s -o /dev/null -w '%{http_code}' '$BASE/api/models-changes?since=banana')\" = 400 ]"
chk "models-changes price diff == 5 coverage changes + Soul Cinema tier (2.3) + Wan 2.7 (2.4)" bash -c "curl -sf '$BASE/api/models-changes' | python3 -c \"
import json,sys; e=json.load(sys.stdin); pc=e['data']['price_changes']
assert len(pc)==7, pc
assert any(c['kind']=='model-added' and c['model_id']=='pixverse-v6' for c in pc)
assert any(c['kind']=='model-added' and c['model_id']=='wan-2-7' for c in pc)
assert sum(1 for c in pc if c['kind']=='tier-added')==5
assert any(c['kind']=='tier-added' and c['model_id']=='soul-cinema' for c in pc)\""
chk "models-changes drift summary 32 models, 23 alerts, 0 unwatched" bash -c "curl -sf '$BASE/api/models-changes' | python3 -c \"
import json,sys; e=json.load(sys.stdin); s=e['data']['drift_summary']
assert s['models_total']==32 and s['alert']==23 and s['unwatched']==0, s
assert len(e['data']['drift_alerts'])==s['alert']+s['watch']\""
chk "models-changes ?model_id= filter" bash -c "curl -sf '$BASE/api/models-changes?since=2025-01-01&model_id=kling-3-0' | python3 -c \"
import json,sys; e=json.load(sys.stdin)
assert all(x['model_id']=='kling-3-0' for x in e['data']['events']) and len(e['data']['events'])>=1\""
chk "models-changes ?model_id=bogus -> 404 NOT_FOUND" bash -c "[ \"\$(curl -s -o /dev/null -w '%{http_code}' '$BASE/api/models-changes?model_id=bogus')\" = 404 ]"
chk "models-status carries drift fields" bash -c "curl -sf '$BASE/api/models-status' | python3 -c \"
import json,sys; e=json.load(sys.stdin); d=e['data']
assert d['drift_summary']['models_total']==32
assert all('drift_severity' in m and 'drift_alerts' in m for m in d['models'])\""
chk "health freshness resolves (Watchtower 2.0 path fix)" bash -c "curl -sf '$BASE/api/health' | python3 -c \"
import json,sys; e=json.load(sys.stdin); d=e['data']
assert d['checks']['static_fallback_present'] is True, d['checks']
assert d['data_freshness']['model-history.json']['generated_at'] is not None
assert d['data_freshness']['pricing.json']['within_sla'] is True\""

echo "== 5. calc-cost =="
chk "calc-cost valid POST" bash -c "curl -sf -X POST -H 'Content-Type: application/json' -d '{\"model_id\":\"hailuo-2-3\",\"seconds\":6,\"resolution_tier\":\"1080p\",\"clips\":2}' '$BASE/api/calc-cost' | python3 -c \"
import json,sys; e=json.load(sys.stdin); d=e['data']
assert e['ok'] is True and d['currency']=='USD'
assert abs(d['cost_low']-0.0817*6*2)<1e-6, d
assert d['cost_low']<=d['cost_high'] and d['pricing_as_of'] and d['note']
assert len(d['breakdown'])==1 and d['breakdown'][0]['clips']==2\""
chk "calc-cost schema" bash -c "curl -sf -X POST -H 'Content-Type: application/json' -d '{\"model_id\":\"veo-3-1\",\"seconds\":8,\"resolution_tier\":\"standard-720p\"}' '$BASE/api/calc-cost' | $VAL"
chk "calc-cost no-store" bash -c "curl -sf -D - -o /dev/null -X POST -H 'Content-Type: application/json' -d '{\"model_id\":\"veo-3-1\",\"seconds\":8,\"resolution_tier\":\"standard-720p\"}' '$BASE/api/calc-cost' | grep -qi 'cache-control: no-store'"
chk "calc-cost bad body -> 400 BAD_INPUT" bash -c "[ \"\$(curl -s -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d '{}' '$BASE/api/calc-cost')\" = 400 ]" 
chk "calc-cost bad body envelope" bash -c "curl -s -X POST -H 'Content-Type: application/json' -d '{}' '$BASE/api/calc-cost' | python3 -c \"
import json,sys; e=json.load(sys.stdin); assert e['ok'] is False and e['error']['code']=='BAD_INPUT' and 'fields' in e['error']['details']\""
chk "calc-cost unknown model -> 404 NOT_FOUND" bash -c "curl -s -X POST -H 'Content-Type: application/json' -d '{\"model_id\":\"nope\",\"seconds\":5,\"resolution_tier\":\"720p\"}' '$BASE/api/calc-cost' | python3 -c \"
import json,sys; e=json.load(sys.stdin); assert e['ok'] is False and e['error']['code']=='NOT_FOUND'\""
chk "calc-cost bad tier -> 400 lists tiers" bash -c "curl -s -X POST -H 'Content-Type: application/json' -d '{\"model_id\":\"veo-3-1\",\"seconds\":5,\"resolution_tier\":\"999p\"}' '$BASE/api/calc-cost' | python3 -c \"
import json,sys; e=json.load(sys.stdin); assert e['ok'] is False and 'standard-720p' in e['error']['details']['fields']['resolution_tier']\""
chk "calc-cost image model -> 400 human message" bash -c "curl -s -X POST -H 'Content-Type: application/json' -d '{\"model_id\":\"soul-2-0\",\"seconds\":5,\"resolution_tier\":\"image\"}' '$BASE/api/calc-cost' | python3 -c \"
import json,sys; e=json.load(sys.stdin); assert e['ok'] is False and 'per image' in e['error']['message']\""
chk "calc-cost free local model -> cost 0" bash -c "curl -sf -X POST -H 'Content-Type: application/json' -d '{\"model_id\":\"mirage-tesseract\",\"seconds\":60,\"resolution_tier\":\"local\"}' '$BASE/api/calc-cost' | python3 -c \"
import json,sys; e=json.load(sys.stdin); assert e['ok'] is True and e['data']['cost_low']==0 and e['data']['cost_high']==0\""
chk "calc-cost tier range low<=high" bash -c "curl -sf -X POST -H 'Content-Type: application/json' -d '{\"model_id\":\"kling-3-0\",\"seconds\":10,\"resolution_tier\":\"720p\",\"clips\":3}' '$BASE/api/calc-cost' | python3 -c \"
import json,sys; e=json.load(sys.stdin); d=e['data']; assert d['cost_low']<=d['cost_high'] and d['cost_low']>0\""

echo "== 6. cron auth gates =="
chk "cron 401 no secret" bash -c "[ \"\$(curl -s -o /dev/null -w '%{http_code}' '$BASE/api/cron/watchtower')\" = 401 ]"
chk "cron 401 no secret envelope" bash -c "curl -s '$BASE/api/cron/watchtower' | python3 -c \"
import json,sys; e=json.load(sys.stdin); assert e['ok'] is False and e['error']['code']=='UNAUTHORIZED'\""
chk "cron 401 bad secret" bash -c "[ \"\$(curl -s -o /dev/null -w '%{http_code}' -H 'Authorization: Bearer wrong' '$BASE/api/cron/watchtower')\" = 401 ]"
chk "cron no-store" bash -c "curl -s -D - -o /dev/null '$BASE/api/cron/watchtower' | grep -qi 'cache-control: no-store'"

echo "== 7. static fallback present =="
for f in model-checks.json pricing.json models.json model-history.json; do
  chk "static /data/v1/$f" curl -sf "$BASE/data/v1/$f"
done
chk "static schema envelope.json" curl -sf "$BASE/data/v1/schema/envelope.json"

echo "== 8. authorized cron run (bounded, hits real sources) =="
chk "cron 200 with secret" bash -c "curl -sf -m 90 -H '$AUTH_HEADER' '$BASE/api/cron/watchtower' | tee /tmp/watchtower-cron-out.json | python3 -c '$JSON_OK'"
chk "cron schema" bash -c "$VAL < /tmp/watchtower-cron-out.json"
chk "cron payload shape" bash -c "python3 -c \"
import json; e=json.load(open('/tmp/watchtower-cron-out.json')); d=e['data']
assert isinstance(d['checked'],int) and isinstance(d['models_changed'],list) and 'sources_ok' in d
assert isinstance(d.get('drift'),dict) and d['drift']['summary']['models_total']==32
assert isinstance(e['meta']['upstream'],list)\""

echo "== 9. vercel.json lint =="
chk "vercel.json valid json" python3 -c "import json; json.load(open('vercel.json'))"
chk "cron daily-or-slower" python3 -c "
import json; v=json.load(open('vercel.json'))
assert len(v.get('crons',[]))==1, v.get('crons')
for c in v['crons']:
    f=c['schedule'].split()
    assert f[0]!='*' and '*/' not in f[0] and '*/' not in f[1], c
    print('schedule:', c['schedule'], 'path:', c['path'])"
chk "functions: explicit paths, maxDuration only, no runtime key" python3 -c "
import json; v=json.load(open('vercel.json'))
f=v['functions']
assert set(f)=={'api/health.js','api/models-status.js','api/models-pricing.js','api/models-changes.js','api/calc-cost.js','api/cron/watchtower.js'}, f
assert all(e=={'maxDuration':10} for e in f.values()), f
assert 'runtime' not in json.dumps(v)"
chk "outputDirectory site" python3 -c "
import json; v=json.load(open('vercel.json')); assert v['outputDirectory']=='site'"

echo "== 10. rate limiting (runs last: trips the bucket on purpose) =="
chk "429 after bucket exhausted" bash -c "
codes=\$(for i in \$(seq 1 70); do curl -s -o /dev/null -w '%{http_code} ' '$BASE/api/models-status'; done)
echo \"\$codes\" | grep -q ' 429 '"
chk "429 has Retry-After + envelope" bash -c "
for i in \$(seq 1 70); do code=\$(curl -s -o /tmp/rl.json -w '%{http_code}' '$BASE/api/models-status'); [ \"\$code\" = 429 ] && break; done
[ \"\$code\" = 429 ] && python3 -c \"
import json; e=json.load(open('/tmp/rl.json')); assert e['ok'] is False and e['error']['code']=='RATE_LIMITED'\""

echo
echo "pass=$pass fail=$fail"
[ "$fail" = 0 ]
