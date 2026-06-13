#!/usr/bin/env bash
echo "=== Deep node/npm search ==="

# pkgx paths
echo "-- /pkg/ search --"
find /pkg -name "node" -o -name "npm" 2>/dev/null | grep -v ".js$" | head -10

# Bundled in Claude/Codex app
echo "-- App bundles --"
find /Applications -name "node" -maxdepth 8 2>/dev/null | head -5
find /Applications -name "npm" -maxdepth 8 2>/dev/null | head -5

# pkgx shims
echo "-- pkgx shims --"
ls /pkg/e/nv/global/bin/ 2>/dev/null | head -20
ls ~/.pkgx/ 2>/dev/null | head -10
which pkgx 2>/dev/null || true

# Try sourcing .zprofile (login shell for zsh)
echo "-- After sourcing .zprofile --"
[ -f "$HOME/.zprofile" ] && source "$HOME/.zprofile" 2>/dev/null && echo "sourced .zprofile" || true
which node 2>/dev/null && node --version || echo "node: not found"
which npm 2>/dev/null && npm --version || echo "npm: not found"
echo "PATH=$PATH"
