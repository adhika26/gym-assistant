FROM php:8.4-apache

RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    unzip \
    libpq-dev \
    libzip-dev \
    libicu-dev \
    libonig-dev \
    libcurl4-openssl-dev \
    && docker-php-ext-install pdo_pgsql pgsql zip intl mbstring curl fileinfo \
    && a2enmod rewrite \
    && sed -ri \
        -e 's/^StartServers.*/StartServers 2/' \
        -e 's/^MinSpareServers.*/MinSpareServers 1/' \
        -e 's/^MaxSpareServers.*/MaxSpareServers 3/' \
        -e 's/^ServerLimit.*/ServerLimit 6/' \
        -e 's/^MaxRequestWorkers.*/MaxRequestWorkers 6/' \
        -e 's/^MaxConnectionsPerChild.*/MaxConnectionsPerChild 500/' \
        /etc/apache2/mods-available/mpm_prefork.conf \
    && printf 'memory_limit=160M\nmax_execution_time=180\n' > /usr/local/etc/php/conf.d/zz-angkat.ini \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .

RUN composer install --no-dev --optimize-autoloader --no-interaction \
    && php artisan filament:assets \
    && mkdir -p storage/logs storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

ENV APACHE_DOCUMENT_ROOT=/var/www/html/public

RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf \
    && sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf \
    && sed -ri 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf \
    && echo "ServerName localhost" >> /etc/apache2/apache2.conf

COPY docker/start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

EXPOSE 80

CMD ["start.sh"]
