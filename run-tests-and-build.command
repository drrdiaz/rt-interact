#!/bin/bash
# RT Interact — test + build validation script
# Double-click this file to run, or execute in terminal.

set -e
cd "$(dirname "$0")"

echo "=========================================="
echo "RT Interact: Test + Build Validation"
echo "=========================================="
echo ""

echo ">>> TypeScript check..."
npm run typecheck && echo "✓ TypeScript: PASS" || { echo "✗ TypeScript: FAIL"; exit 1; }
echo ""

echo ">>> Running tests..."
npm run test:ci && echo "✓ Tests: PASS" || { echo "✗ Tests: FAIL"; exit 1; }
echo ""

echo ">>> Production build..."
npm run build && echo "✓ Build: PASS" || { echo "✗ Build: FAIL"; exit 1; }
echo ""

echo "=========================================="
echo "All checks passed. Deploying to Vercel..."
echo "=========================================="
npx vercel --prod

echo ""
echo "Done."
