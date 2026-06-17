#!/bin/bash
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"
echo "=== RT Interact Phase 1 — Vercel Deploy ==="
echo "Project: $DIR"
echo ""

# Ensure dist is fresh
npm run build

# Deploy to Vercel (will open browser for auth on first run)
npx vercel --yes --prod 2>&1 | tee deploy-output.txt

echo ""
echo "=== Deploy complete. URL is above. ==="
