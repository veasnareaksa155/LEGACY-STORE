#!/bin/sh
set -e

# Generate APP_KEY if missing in production environment
if [ -z "$APP_KEY" ]; then
    echo "APP_KEY missing, generating new key..."
    php artisan key:generate --force
fi

php artisan config:clear
php artisan route:clear
php artisan package:discover --ansi

mkdir -p /app/database
touch /app/database/database.sqlite
chmod 777 /app/database /app/database/database.sqlite || true

# Execute database migrations & default seeds safely
(php artisan migrate --database=sqlite --force || true)
(php artisan migrate --force || true)
(php artisan db:seed --force || true)

# Bind server to Render dynamic PORT or default 10000
PORT_TO_USE="${PORT:-10000}"
echo "Starting Alexandre Luxe Laravel Server on 0.0.0.0:${PORT_TO_USE}..."
exec php artisan serve --host=0.0.0.0 --port="${PORT_TO_USE}"

