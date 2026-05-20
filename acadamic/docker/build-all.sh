#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
IMAGES=()

echo "=== Building Kodex Docker Sandbox Images ==="
echo ""

for df in "$DIR"/Dockerfile.*; do
  lang=$(basename "$df" | sed 's/Dockerfile.//')
  tag="kodex-$lang"
  echo "[$lang] Building $tag..."
  if docker build -t "$tag" -f "$df" "$DIR" --quiet 2>/dev/null; then
    echo "[$lang] ✓ $tag built successfully"
    IMAGES+=("$tag")
  else
    echo "[$lang] ✗ Failed to build $tag"
  fi
  echo ""
done

echo "=== Summary ==="
echo "Built ${#IMAGES[@]} images:"
for img in "${IMAGES[@]}"; do
  size=$(docker images "$img" --format '{{.Size}}' 2>/dev/null || echo "?")
  echo "  $img  ($size)"
done

echo ""
echo "To verify: docker run --rm kodex-py python3 --version"
