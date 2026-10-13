#!/bin/bash
# Improved detached checker (rotation 12, run 1b): unbuffered python so the
# log streams to disk; wrapper records START/python-PID/EXIT on disk.
set -u
cd ~/workspace/ai-film-master-guide
STATUS="logs/wt211/run1b.status"
LOG="logs/wt211/run1b.log"
echo "START $(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$STATUS"
python3 -u scripts/refresh/check_models.py >> "$LOG" 2>&1 &
PYPID=$!
echo "PYPID $PYPID" >> "$STATUS"
wait $PYPID
echo "EXIT $? $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$STATUS"
