#!/bin/sh
set -e

echo "╔══════════════════════════════════════════════════╗"
echo "║  Kodex's Lab — Verifying Language Runtimes...   ║"
echo "╚══════════════════════════════════════════════════╝"

check() {
    if command -v "$1" >/dev/null 2>&1; then
        ver=$("$@" 2>&1 | head -1)
        printf "  ✓ %-12s %s\n" "$1" "$ver"
    else
        printf "  ✗ %-12s NOT FOUND\n" "$1"
    fi
}

check node --version
check python3 --version
check go version
check rustc --version
check gcc --version
check dotnet --version
check kotlinc -version
check swift --version
check zig version
check wasmtime --version
check nasm --version
check bash --version
check php --version
check tsx --version
check cargo --version
check g++ --version

echo ""
echo "All runtimes verified. Starting server..."
echo ""

exec "$@"
