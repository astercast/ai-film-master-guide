#!/usr/bin/env bash
# refresh.sh — weekly Model Watch entry point.
# Runs the model freshness checker and appends output to logs/refresh.log.
# Cron-ready: add the line from GO_LIVE.md to crontab.
# Exit code is always 0 unless the repo layout itself is broken.

set -u
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
LOGDIR="$REPO/logs"
mkdir -p "$LOGDIR"

{
  echo "===== refresh $(date -u '+%Y-%m-%dT%H:%M:%SZ') ====="
  python3 "$REPO/scripts/refresh/check_models.py"
  echo "checker exit: $?"
} >> "$LOGDIR/refresh.log" 2>&1

exit 0
