FROM php:8.3-cli-alpine

# Install system dependencies & PostgreSQL/MySQL/SQLite drivers
RUN apk add --no-cache \
    postgresql-dev \
    sqlite-dev \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    curl \
    && docker-php-ext-install pdo pdo_pgsql pdo_mysql pdo_sqlite bcmath zip gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copy Backend codebase
COPY . .

# Install PHP dependencies without dev packages and scripts
RUN composer install --no-dev --optimize-autoloader --no-scripts --ignore-platform-reqs

# Set permissions for Laravel storage, cache, and start script
RUN chmod -R 777 storage bootstrap/cache && chmod +x /app/start.sh

# Expose Render default port
EXPOSE 10000

# Start Laravel Server via start.sh
CMD ["/bin/sh", "/app/start.sh"]
