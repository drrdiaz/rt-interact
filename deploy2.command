#!/bin/bash
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

echo "=== RT Interact Phase 1 — Vercel Deploy ==="

# Fix any native module mismatches (esbuild version)
echo "[1/3] npm install..."
npm install

# Build
echo "[2/3] Building..."
npm run build

# Deploy to Vercel — auto-answer install prompt, use existing token if present
echo "[3/3] Deploying to Vercel..."
printf 'y\n' | npx vercel@latest deploy --yes --prod 2>&1 | tee deploy-output.txt

echo ""
echo "=== Done. URL is shown above and saved to deploy-output.txt ==="
