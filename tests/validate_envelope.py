#!/usr/bin/env python3
"""Vercel Wave A: validate a function response against ARCHITECTURE.md §1.10.

Implements the envelope JSON Schema (draft 2020-12) in stdlib only:
  required ok/data/meta, types, service slug, semver, RFC3339 timestamps,
  source enum, degraded/stale_since, upstream entries, request_id,
  error object rules (required iff ok=false; forbidden iff ok=true).

Usage: curl -s $BASE/api/health | python3 tests/validate_envelope.py
Exit 0 = valid, 1 = invalid (prints each violation).
"""
import json
import re
import sys
from datetime import datetime

FAILURES = []


def fail(msg):
    FAILURES.append(msg)


def is_rfc3339(s):
    if not isinstance(s, str):
        return False
    try:
        iso = s.replace("Z", "+00:00")
        datetime.fromisoformat(iso)
        return True
    except ValueError:
        return False


def check_meta(meta):
    if not isinstance(meta, dict):
        fail("meta is not an object")
        return
    for f in ("service", "version", "generated_at", "request_id"):
        if f not in meta:
            fail("meta missing required field: %s" % f)
    if "service" in meta and not re.match(r"^[a-z0-9-]+$", str(meta["service"])):
        fail("meta.service bad slug: %r" % meta["service"])
    if "version" in meta and not re.match(r"^[0-9]+\.[0-9]+\.[0-9]+$", str(meta["version"])):
        fail("meta.version not semver: %r" % meta["version"])
    if "generated_at" in meta and not is_rfc3339(meta["generated_at"]):
        fail("meta.generated_at not RFC3339: %r" % meta["generated_at"])
    if "request_id" in meta and not re.match(r"^req_[0-9a-f]{6}$", str(meta["request_id"])):
        fail("meta.request_id bad shape: %r" % meta["request_id"])
    if "source" in meta and meta["source"] not in ("live", "cache", "static"):
        fail("meta.source not in enum: %r" % meta["source"])
    if "degraded" in meta and not isinstance(meta["degraded"], bool):
        fail("meta.degraded not boolean")
    if "stale_since" in meta:
        ss = meta["stale_since"]
        if ss is not None and not is_rfc3339(ss):
            fail("meta.stale_since not RFC3339/null: %r" % ss)
    if "note" in meta and meta["note"] is not None and not isinstance(meta["note"], str):
        fail("meta.note not string/null")
    if "upstream" in meta:
        up = meta["upstream"]
        if not isinstance(up, list):
            fail("meta.upstream not an array")
        else:
            for i, u in enumerate(up):
                if not isinstance(u, dict):
                    fail("meta.upstream[%d] not an object" % i)
                    continue
                for f in ("source", "ok", "checked_at"):
                    if f not in u:
                        fail("meta.upstream[%d] missing %s" % (i, f))
                if "ok" in u and not isinstance(u["ok"], bool):
                    fail("meta.upstream[%d].ok not boolean" % i)
                if "checked_at" in u and not is_rfc3339(u["checked_at"]):
                    fail("meta.upstream[%d].checked_at not RFC3339" % i)
                if "latency_ms" in u and not isinstance(u["latency_ms"], int):
                    fail("meta.upstream[%d].latency_ms not integer" % i)
                if "error" in u and not isinstance(u["error"], str):
                    fail("meta.upstream[%d].error not string" % i)


def check_error(err):
    if not isinstance(err, dict):
        fail("error is not an object")
        return
    if "code" not in err or "message" not in err:
        fail("error missing code/message")
    codes = ("BAD_INPUT", "UNAUTHORIZED", "NOT_FOUND", "RATE_LIMITED",
             "UPSTREAM_UNAVAILABLE", "REFRESH_FAILED", "INTERNAL")
    if err.get("code") not in codes:
        fail("error.code not in enum: %r" % err.get("code"))
    if "details" in err and not isinstance(err["details"], dict):
        fail("error.details not an object")


def main():
    try:
        e = json.load(sys.stdin)
    except Exception as ex:
        fail("response is not JSON: %s" % ex)
        print("\n".join(FAILURES))
        return 1
    for f in ("ok", "data", "meta"):
        if f not in e:
            fail("missing required top-level field: %s" % f)
    if "ok" in e and not isinstance(e["ok"], bool):
        fail("ok not boolean")
    if "data" in e and not (isinstance(e["data"], (dict, list)) or e["data"] is None):
        fail("data not object/array/null")
    if "meta" in e:
        check_meta(e["meta"])
    if e.get("ok") is True and "error" in e:
        fail("ok=true but error present")
    if e.get("ok") is False:
        if "error" not in e:
            fail("ok=false but error missing")
        else:
            check_error(e["error"])
    if FAILURES:
        print("envelope INVALID:")
        print("\n".join(" - " + f for f in FAILURES))
        return 1
    print("envelope valid")
    return 0


if __name__ == "__main__":
    sys.exit(main())
