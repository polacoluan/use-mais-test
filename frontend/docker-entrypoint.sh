#!/bin/sh
set -eu

cd /app

pnpm install --frozen-lockfile

exec pnpm dev --hostname 0.0.0.0 --port 3000
