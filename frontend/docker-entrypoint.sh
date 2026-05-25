#!/bin/sh
set -eu

cd /app

if [ ! -f .env.local ] && [ -f .env.example ]; then
  cp .env.example .env.local
fi

pnpm install --frozen-lockfile --yes

exec pnpm dev --hostname 0.0.0.0 --port 3000
