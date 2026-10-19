#!/usr/bin/env bash
# Deterministic Sandbox Test Runner (`scripts/sandbox-test.sh`)
# Agnostic, zero-lock-in, unprivileged sandbox execution using Bubblewrap (bwrap) when available.
# Gracefully falls back to native execution if bwrap is not installed.

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if command -v bwrap >/dev/null 2>&1; then
  echo "🛡️  Bubblewrap (bwrap) detected. Running test suite inside isolated unprivileged sandbox..."
  
  # Run in Bubblewrap with read-only root, ephemeral tmpfs for temporary operations,
  # and unshared process/IPC namespaces.
  bwrap \
    --ro-bind / / \
    --dev /dev \
    --proc /proc \
    --tmpfs /tmp \
    --bind "$ROOT_DIR" "$ROOT_DIR" \
    --chdir "$ROOT_DIR" \
    --unshare-pid \
    --unshare-ipc \
    --die-with-parent \
    npm test
    
  echo "✅ Sandbox Bubblewrap Test Execution PASSED 100%!"
else
  echo "ℹ️  Bubblewrap (bwrap) not detected on PATH. Running native deterministic test suite..."
  npm test
  echo "✅ Native Test Execution PASSED 100%!"
fi
