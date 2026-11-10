#!/bin/sh
set -e

PORT="${PORT:-80}"

if [ "$PORT" != "80" ]; then
  sed -ri "s/^Listen 80$/Listen 80\nListen ${PORT}/" /etc/apache2/ports.conf
  sed "s/<VirtualHost \*:80>/<VirtualHost *:${PORT}>/" /etc/apache2/sites-available/000-default.conf > /etc/apache2/sites-available/010-port.conf
  a2ensite 010-port > /dev/null
fi

php artisan config:clear

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
