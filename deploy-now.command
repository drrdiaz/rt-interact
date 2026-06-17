#!/bin/bash
set -e
cd "$(dirname "$0")"
echo "Deploying to Vercel..."
printf 'y\n' | npx vercel@latest --yes --prod 2>&1 | tee deploy-output.txt
echo "Done."
