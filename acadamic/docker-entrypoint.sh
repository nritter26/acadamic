#!/bin/sh
set -e

if [ -S /var/run/docker.sock ] && docker info >/dev/null 2>&1; then
    echo "[entrypoint] Docker available — checking sandbox images..."

    for df in /app/docker/Dockerfile.*; do
        [ -f "$df" ] || continue
        lang=$(basename "$df" | sed 's/Dockerfile.//')
        tag="kodex-$lang"
        if ! docker image inspect "$tag" >/dev/null 2>&1; then
            echo "[entrypoint] Building $tag..."
            docker build -t "$tag" -f "$df" /app/docker --quiet &
        fi
    done

    wait
    echo "[entrypoint] Sandbox images ready"
fi

exec "$@"
