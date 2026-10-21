#!/usr/bin/env bash
# Package Smoke Installation & Module Export Test (`scripts/package-smoke-test.sh`)
# Packs repository tarball, installs in isolated temp environment, and verifies module exports.
# Compatible with read-only host environments & sandboxes (tmpfs cache).

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEMP_DIR=$(mktemp -d /tmp/ibas-smoke-XXXXXX)
CACHE_DIR=$(mktemp -d /tmp/ibas-cache-XXXXXX)

cleanup() {
  rm -rf "$TEMP_DIR" "$CACHE_DIR"
  if [ -n "$TARBALL_PATH" ] && [ -f "$TARBALL_PATH" ]; then
    rm -f "$TARBALL_PATH"
  fi
}
trap cleanup EXIT

echo "📦 Running Package Smoke Installation & Export Test..."

cd "$ROOT_DIR"
TARBALL=$(npm pack --pack-destination "$TEMP_DIR" --cache "$CACHE_DIR" --quiet | tail -n 1)
TARBALL_PATH="$TEMP_DIR/$TARBALL"

if [ ! -f "$TARBALL_PATH" ]; then
  echo "❌ Error: Tarball was not created at expected path: $TARBALL_PATH"
  exit 1
fi

echo "  [1/3] Created package tarball: $TARBALL"

cd "$TEMP_DIR"
npm init -y --cache "$CACHE_DIR" > /dev/null
npm install "$TARBALL_PATH" --cache "$CACHE_DIR" --quiet > /dev/null

echo "  [2/3] Successfully installed tarball into isolated temp environment: $TEMP_DIR"

# Verify module requiring
node -e "
const pkg = require('indonesia-business-agent-skills/package.json');
console.log('    ✓ Package name:', pkg.name, 'v' + pkg.version);

const { calculatePPh21Monthly } = require('indonesia-business-agent-skills/engines/pph21-calculator');
const pph = calculatePPh21Monthly(10000000, 'TK/0', true, '2026-03-01');
if (pph.monthlyTaxWithheld !== 200000) throw new Error('Smoke test failed for pph21-calculator');
console.log('    ✓ Engine pph21-calculator required & executed successfully');

const { resolveBusinessArchetype } = require('indonesia-business-agent-skills/engines/kbli-context-router');
const arch = resolveBusinessArchetype({ kbliCode: '70209' });
if (arch.businessArchetype !== 'PROFESSIONAL_SERVICE') throw new Error('Smoke test failed for kbli-context-router');
console.log('    ✓ Engine kbli-context-router required & executed successfully');
"

echo "  [3/3] Smoke test clean-up completed."
echo "✅ Package Smoke Test PASSED 100%!"
