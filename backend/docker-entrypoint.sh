#!/bin/sh
set -eu

cd /var/www/html

if [ ! -f .env ] && [ -f .env.example ]; then
  cp .env.example .env
fi

composer install --no-interaction --prefer-dist

if [ -f .env ] && ! grep -Eq '^APP_KEY=base64:' .env; then
  php artisan key:generate --force --no-interaction
fi

if [ "${DB_CONNECTION:-}" = "mysql" ]; then
  until php -r '
    $host = getenv("DB_HOST") ?: "mysql";
    $port = getenv("DB_PORT") ?: "3306";
    $database = getenv("DB_DATABASE") ?: "backend";
    $username = getenv("DB_USERNAME") ?: "backend";
    $password = getenv("DB_PASSWORD") ?: "backend";

    try {
        new PDO("mysql:host={$host};port={$port};dbname={$database}", $username, $password);
        exit(0);
    } catch (Throwable $exception) {
        fwrite(STDERR, "Waiting for MySQL...\n");
        exit(1);
    }
  '; do
    sleep 2
  done
fi

php artisan migrate --force --no-interaction

exec php artisan serve --host=0.0.0.0 --port=8000
