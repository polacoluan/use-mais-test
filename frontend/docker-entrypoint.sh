#!/bin/sh
set -eu

cd /app

if [ ! -f .env.local ] && [ -f .env.example ]; then
  cp .env.example .env.local
fi

LOCK_HASH_FILE="node_modules/.pnpm-lock-hash"
CURRENT_LOCK_HASH="$(sha1sum pnpm-lock.yaml | awk '{print $1}')"
STORED_LOCK_HASH=""

if [ -f "$LOCK_HASH_FILE" ]; then
  STORED_LOCK_HASH="$(cat "$LOCK_HASH_FILE")"
fi

if [ ! -d node_modules/.pnpm ] || [ "$CURRENT_LOCK_HASH" != "$STORED_LOCK_HASH" ]; then
  pnpm install --frozen-lockfile
  mkdir -p node_modules
  printf '%s' "$CURRENT_LOCK_HASH" > "$LOCK_HASH_FILE"
fi

exec pnpm dev --hostname 0.0.0.0 --port 3000
