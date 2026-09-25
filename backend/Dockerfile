FROM php:8.2-apache

# Install dependencies yang dibutuhkan Laravel & PostgreSQL
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    unzip \
    libpq-dev

# Bersihkan cache apt
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Ekstensi PHP (Penting: pdo_pgsql untuk terkoneksi ke Supabase)
RUN docker-php-ext-install pdo_pgsql mbstring exif pcntl bcmath gd zip

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Atur working directory
WORKDIR /var/www/html

# Salin seluruh kode backend
COPY . .

# Beri hak akses ke folder storage & bootstrap/cache (Sangat krusial untuk Laravel)
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 /var/www/html/storage \
    && chmod -R 775 /var/www/html/bootstrap/cache

# Ubah DocumentRoot Apache agar mengarah ke folder /public milik Laravel
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Aktifkan mod_rewrite Apache untuk routing Laravel
RUN a2enmod rewrite

# Install dependensi Laravel khusus untuk production
RUN composer install --optimize-autoloader --no-dev

# Ekspos port 80 untuk Render
EXPOSE 80

# Jalankan Apache saat kontainer menyala
CMD ["apache2-foreground"]
