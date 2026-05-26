#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
SUCCESS=()
FAILED=()

echo "=== Building Kodex Docker Sandbox Images ==="
echo ""

for df in "$DIR"/Dockerfile.*; do
  lang=$(basename "$df" | sed 's/Dockerfile.//')
  tag="kodex-$lang"
  echo "[$lang] Building $tag..."
  if docker build -t "$tag" -f "$df" "$DIR"; then
    echo "[$lang] ✓ $tag built successfully"
    SUCCESS+=("$tag")
  else
    echo "[$lang] ✗ $tag FAILED"
    FAILED+=("$tag")
  fi
  echo ""
done

echo "============================================"
echo "=== Summary ==="
echo "Successful (${#SUCCESS[@]}):"
for img in "${SUCCESS[@]}"; do
  size=$(docker images "$img" --format '{{.Size}}' 2>/dev/null || echo "?")
  echo "  ✓ $img  ($size)"
done
if [ ${#FAILED[@]} -gt 0 ]; then
  echo "Failed (${#FAILED[@]}):"
  for img in "${FAILED[@]}"; do
    echo "  ✗ $img"
  done
fi
echo ""
echo "To verify: docker run --rm kodex-py python3 --version"
