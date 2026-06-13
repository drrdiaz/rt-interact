#!/bin/zsh --login
# RT Interact — Phase 1 build validation
set -euo pipefail
DIR="${0:a:h}"
cd "$DIR"

echo "=== RT Interact — Phase 1 build validation ==="

if ! command -v npm &>/dev/null; then
  if command -v brew &>/dev/null; then
    echo "npm not found — installing node via Homebrew…"
    # echo y auto-answers any [y/n] confirmation brew may show
    echo y | HOMEBREW_NO_INTERACTIVE=1 HOMEBREW_NO_AUTO_UPDATE=1 brew install node
  else
    echo "ERROR: Node.js and Homebrew not found. Install from https://nodejs.org"
    exit 1
  fi
fi

echo "Node $(node --version)  |  npm $(npm --version)"
echo "Directory: $DIR"
echo ""

echo "━━━ 1/4  npm install ━━━━━━━━━━━━━━━━━━━━━━━━━━"
npm install

echo ""
echo "━━━ 2/4  TypeScript check ━━━━━━━━━━━━━━━━━━━━━"
npm run typecheck

echo ""
echo "━━━ 3/4  Tests ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npm test

echo ""
echo "━━━ 4/4  Production build ━━━━━━━━━━━━━━━━━━━━━"
npm run build

echo ""
echo "✓ All steps completed successfully."
