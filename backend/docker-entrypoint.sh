#!/bin/sh
set -eu

cd /var/www/html

if [ ! -f .env ] && [ -f .env.example ]; then
  cp .env.example .env
fi

LOCK_HASH_FILE="vendor/.composer-lock-hash"
CURRENT_LOCK_HASH="$(sha1sum composer.lock | awk '{print $1}')"
STORED_LOCK_HASH=""

if [ -f "$LOCK_HASH_FILE" ]; then
  STORED_LOCK_HASH="$(cat "$LOCK_HASH_FILE")"
fi

if [ ! -f vendor/autoload.php ] || [ "$CURRENT_LOCK_HASH" != "$STORED_LOCK_HASH" ]; then
  composer install --no-interaction --prefer-dist
  mkdir -p vendor
  printf '%s' "$CURRENT_LOCK_HASH" > "$LOCK_HASH_FILE"
fi

if [ -f .env ] && ! grep -Eq '^APP_KEY=base64:' .env; then
  php artisan key:generate --force --no-interaction
fi

if php -r '
  $env = is_file(".env") ? (parse_ini_file(".env", false, INI_SCANNER_RAW) ?: []) : [];
  $connection = getenv("DB_CONNECTION");
  if ($connection === false || $connection === "") {
      $connection = $env["DB_CONNECTION"] ?? "sqlite";
  }
  exit($connection === "mysql" ? 0 : 1);
' ; then
  until php -r '
    $env = is_file(".env") ? (parse_ini_file(".env", false, INI_SCANNER_RAW) ?: []) : [];
    $host = getenv("DB_HOST") ?: ($env["DB_HOST"] ?? "mysql");
    $port = getenv("DB_PORT") ?: ($env["DB_PORT"] ?? "3306");
    $database = getenv("DB_DATABASE") ?: ($env["DB_DATABASE"] ?? "backend");
    $username = getenv("DB_USERNAME") ?: ($env["DB_USERNAME"] ?? "backend");
    $password = getenv("DB_PASSWORD");
    if ($password === false) {
        $password = $env["DB_PASSWORD"] ?? "backend";
    }

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
