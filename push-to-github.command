#!/bin/bash
cd "/Users/rodrigodiaz/Documents/(11) Projects/(02) Prototype/(06) Cowork Prototype/rt-interact"

# Clear any stale git locks
rm -f .git/index.lock .git/HEAD.lock .git/refs/heads/master.lock

echo "Pushing to GitHub..."
git push origin master --force

echo ""
echo "Done! Vercel is deploying automatically (~2 min)."
echo "Live at: https://rt-interact-rodrigo1976-s-projects1.vercel.app"
read -p "Press Enter to close..."
