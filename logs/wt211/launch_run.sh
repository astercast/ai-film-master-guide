#!/bin/bash
# Launcher: detached checker run with PID/status/heartbeat files.
# Usage: launch_run.sh <run-name>
set -u
cd ~/workspace/ai-film-master-guide
NAME="${1:?run name}"
LOG="logs/wt211/${NAME}.log"
STATUS="logs/wt211/${NAME}.status"
setsid nohup bash -c '
  echo "START $(date -u +%Y-%m-%dT%H:%M:%SZ) pid=$$" > "'"$STATUS"'"
  python3 scripts/refresh/check_models.py > "'"$LOG"'" 2>&1
  echo "EXIT $? $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "'"$STATUS"'"
' < /dev/null > /dev/null 2>&1 &
echo $! > "logs/wt211/${NAME}.pid"
