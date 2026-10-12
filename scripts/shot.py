#!/usr/bin/env python3
"""Headless screenshot helper. Usage: shot.py <url> <out.png> [--w 1600 --h 1000 --full]"""
import sys, os, glob, subprocess, time

BIN = sorted(glob.glob(os.path.expanduser("~/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell")))[0]

def main():
    url, out = sys.argv[1], sys.argv[2]
    w = h = None
    args = sys.argv[3:]
    i = 0
    while i < len(args):
        if args[i] == "--w":
            w = int(args[i+1]); i += 2
        elif args[i] == "--h":
            h = int(args[i+1]); i += 2
        elif args[i] == "--full":
            full = True; i += 1
        else:
            i += 1
    full = "--full" in sys.argv
    cmd = [BIN, "--headless", "--no-sandbox", "--disable-gpu",
           f"--window-size={w or 1600},{h or 1000}",
           f"--screenshot={out}",
           url]
    if full:
        cmd.insert(4, "--full-page")
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=90)
    print(r.stdout[-500:] if r.stdout else "", r.stderr[-800:] if r.stderr else "")

main()
