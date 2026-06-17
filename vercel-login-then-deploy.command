#!/bin/bash
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

echo "=== Step 1: Vercel login (browser will open) ==="
printf 'y\n' | npx vercel@latest login

echo ""
echo "=== Step 2: Deploy ==="
printf 'y\n' | npx vercel@latest deploy --yes --prod 2>&1 | tee deploy-output.txt

echo ""
echo "=== Done. URL saved to deploy-output.txt ==="
