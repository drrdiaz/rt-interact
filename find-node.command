#!/usr/bin/env bash
echo "=== Node/npm discovery ==="

echo ""
echo "-- Searching common paths --"
for p in \
  /usr/local/bin/npm \
  /opt/homebrew/bin/npm \
  /opt/homebrew/opt/node/bin/npm \
  "$HOME/.volta/bin/npm" \
  "$HOME/.nvm/versions/node/*/bin/npm" \
  "$HOME/.asdf/shims/npm" \
  "$HOME/.mise/shims/npm" \
  "$HOME/.local/bin/npm" \
  /usr/local/opt/node*/bin/npm
do
  ls $p 2>/dev/null && echo "FOUND: $p"
done

echo ""
echo "-- find /usr/local -name npm 2>/dev/null --"
find /usr/local -name "npm" -type f 2>/dev/null | head -5

echo ""
echo "-- find /opt -name npm 2>/dev/null --"
find /opt -name "npm" -type f 2>/dev/null | head -5

echo ""
echo "-- find $HOME -name npm -maxdepth 6 2>/dev/null --"
find "$HOME" -name "npm" -maxdepth 6 -type f 2>/dev/null | head -10

echo ""
echo "-- which node (after zshrc) --"
[ -f "$HOME/.zshrc" ] && source "$HOME/.zshrc" 2>/dev/null || true
[ -f "$HOME/.zprofile" ] && source "$HOME/.zprofile" 2>/dev/null || true
which node 2>/dev/null && node --version || echo "node still not found"
which npm 2>/dev/null && npm --version || echo "npm still not found"

echo ""
echo "-- Current PATH --"
echo "$PATH"
