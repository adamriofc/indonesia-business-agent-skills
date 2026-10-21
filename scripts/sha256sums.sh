#!/usr/bin/env bash
# Indonesian Agent Skills — Release Trust Anchor Generator
# Usage:
#   ./scripts/sha256sums.sh generate   → tulis SHA256SUMS.txt di root repo
#   ./scripts/sha256sums.sh verify     → verifikasi manifest (exit non-zero bila mismatch)
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MANIFEST="$REPO_ROOT/SHA256SUMS.txt"
FILES=(
  "engines/rules/bpjs.json"
  "engines/rules/pph21.json"
  "engines/rules/marketplace.json"
  "engines/rules/umkm.json"
  "engines/rules/btki.json"
  "engines/rules/kmk-rates.json"
  "engines/rules/oss-rba.json"
)

cmd="${1:-verify}"

case "$cmd" in
  generate)
    (cd "$REPO_ROOT" && sha256sum "${FILES[@]}") > "$MANIFEST"
    echo "SHA256SUMS.txt ditulis (${#FILES[@]} ruleset): $MANIFEST"
    ;;
  verify)
    if [[ ! -f "$MANIFEST" ]]; then
      echo "ERROR: $MANIFEST tidak ditemukan — jalankan: ./scripts/sha256sums.sh generate" >&2
      exit 1
    fi
    (cd "$REPO_ROOT" && sha256sum -c "$MANIFEST")
    ;;
  *)
    echo "Usage: $0 {generate|verify}" >&2
    exit 2
    ;;
esac