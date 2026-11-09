#!/bin/sh
set -e

PORT="${PORT:-80}"

sed -ri "s/^Listen 80$/Listen ${PORT}/" /etc/apache2/ports.conf
sed -ri "s/<VirtualHost \*:80>/<VirtualHost *:${PORT}>/" /etc/apache2/sites-available/000-default.conf

php artisan config:clear
php artisan filament:assets || true

attempt=0
until php artisan migrate --force; do
  attempt=$((attempt + 1))

  if [ "$attempt" -ge 10 ]; then
    echo "Migration failed after 10 attempts."
    exit 1
  fi

  sleep 3
done

php artisan db:seed --class=FoodSeeder --force || true
php artisan db:seed --class=ExerciseSeeder --force || true

exec apache2-foreground
