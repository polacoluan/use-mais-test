#!/bin/sh
set -eu

export MYSQL_DATABASE="${MYSQL_DATABASE:-${DB_DATABASE:-}}"
export MYSQL_USER="${MYSQL_USER:-${DB_USERNAME:-}}"
export MYSQL_PASSWORD="${MYSQL_PASSWORD:-${DB_PASSWORD:-}}"
export MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:-root}"

exec docker-entrypoint.sh mysqld "$@"
