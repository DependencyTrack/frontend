#!/usr/bin/env sh
set -eu

export HTTP_PORT="${HTTP_PORT:-8080}"

echo "Setting HTTP_PORT to ${HTTP_PORT}"

/docker-entrypoint.sh "$@"
