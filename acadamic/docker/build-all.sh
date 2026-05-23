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
  (docker build -t "$tag" -f "$df" "$DIR" --quiet 2>/dev/null \
    && echo "[$lang] ✓ $tag built successfully" \
    && echo "$tag" >> /tmp/.sandbox-built) &
done

wait

if [ -f /tmp/.sandbox-built ]; then
  while IFS= read -r tag; do
    IMAGES+=("$tag")
  done < /tmp/.sandbox-built
  rm -f /tmp/.sandbox-built
fi

echo ""
echo "=== Summary ==="
if [ ${#IMAGES[@]} -gt 0 ]; then
  echo "Built ${#IMAGES[@]} images:"
  for img in "${IMAGES[@]}"; do
    size=$(docker images "$img" --format '{{.Size}}' 2>/dev/null || echo "?")
    echo "  $img  ($size)"
  done
else
  echo "No images were built (all may have failed)"
fi

echo ""
echo "To verify: docker run --rm kodex-py python3 --version"
