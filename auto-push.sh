#!/bin/bash
# Auto-push to GitHub after every git commit.
# Called by launchd whenever .git/refs/heads/master changes.

REPO="/Users/rodrigodiaz/Documents/(11) Projects/(02) Prototype/(06) Cowork Prototype/rt-interact"
LOG="/tmp/rtinteract-autopush.log"

echo "[$(date)] Auto-push triggered" >> "$LOG"
cd "$REPO" || exit 1
git push origin master >> "$LOG" 2>&1
echo "[$(date)] Push exit code: $?" >> "$LOG"
