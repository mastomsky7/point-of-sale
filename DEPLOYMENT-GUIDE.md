# Deployment Guide - Point of Sales System

## Overview

This guide provides step-by-step instructions for deploying the Point of Sales system to production environments.

## Table of Contents

1. [Server Requirements](#server-requirements)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Deployment Methods](#deployment-methods)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [Queue and Scheduler Setup](#queue-and-scheduler-setup)
7. [Web Server Configuration](#web-server-configuration)
8. [SSL Certificate](#ssl-certificate)
9. [Performance Optimization](#performance-optimization)
10. [Monitoring and Logging](#monitoring-and-logging)
11. [Backup Strategy](#backup-strategy)
12. [Troubleshooting](#troubleshooting)

---

## Server Requirements

### Minimum Requirements
- **CPU**: 2 cores
- **RAM**: 4 GB
- **Storage**: 20 GB SSD
- **OS**: Ubuntu 22.04 LTS or later

### Recommended for Production
- **CPU**: 4 cores
- **RAM**: 8 GB
- **Storage**: 50 GB SSD
- **OS**: Ubuntu 22.04 LTS

### Software Requirements
- PHP 8.2 or higher
- MySQL 8.0 or higher
- Redis 6.0 or higher
- Nginx or Apache
- Node.js 18.x or higher
- Composer 2.x
- Supervisor (for queue workers)

---

## Pre-Deployment Checklist

- [ ] Server meets minimum requirements
- [ ] Domain name configured and pointing to server
- [ ] SSL certificate obtained
- [ ] Database backup from staging/development
- [ ] All environment variables documented
- [ ] Payment gateway credentials verified
- [ ] WhatsApp/Email/SMS API credentials ready
- [ ] Google Calendar API credentials ready
- [ ] Code tested in staging environment
- [ ] All tests passing
- [ ] Security audit completed

---

## Deployment Methods

### Method 1: Manual Deployment (Recommended for First Deploy)

#### Step 1: Update System
```bash
sudo apt update && sudo apt upgrade -y
```

#### Step 2: Install PHP 8.2
```bash
sudo add-apt-repository ppa:ondrej/php
sudo apt update
sudo apt install -y php8.2 php8.2-fpm php8.2-mysql php8.2-mbstring \
  php8.2-xml php8.2-bcmath php8.2-curl php8.2-zip php8.2-gd \
  php8.2-redis php8.2-intl
```

#### Step 3: Install MySQL
```bash
sudo apt install -y mysql-server
sudo mysql_secure_installation
```

#### Step 4: Install Redis
```bash
sudo apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

#### Step 5: Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

#### Step 6: Install Composer
```bash
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```

#### Step 7: Install Nginx
```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

#### Step 8: Install Supervisor
```bash
sudo apt install -y supervisor
sudo systemctl enable supervisor
sudo systemctl start supervisor
```

#### Step 9: Clone Repository
```bash
cd /var/www
sudo git clone https://github.com/yourusername/point-of-sales.git
sudo chown -R www-data:www-data point-of-sales
cd point-of-sales
```

#### Step 10: Install Dependencies
```bash
# PHP dependencies
composer install --optimize-autoloader --no-dev

# Node dependencies
npm ci --production
npm run build
```

#### Step 11: Configure Environment
```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env` file with production settings (see [Environment Configuration](#environment-configuration))

#### Step 12: Setup Database
```bash
php artisan migrate --force
php artisan db:seed --force
```

#### Step 13: Optimize Application
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
```

#### Step 14: Set Permissions
```bash
sudo chown -R www-data:www-data /var/www/point-of-sales
sudo chmod -R 755 /var/www/point-of-sales
sudo chmod -R 775 /var/www/point-of-sales/storage
sudo chmod -R 775 /var/www/point-of-sales/bootstrap/cache
```

---

### Method 2: Automated Deployment with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2

    - name: Deploy to Server
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_PRIVATE_KEY }}
        script: |
          cd /var/www/point-of-sales
          git pull origin main
          composer install --optimize-autoloader --no-dev
          npm ci --production
          npm run build
          php artisan migrate --force
          php artisan config:cache
          php artisan route:cache
          php artisan view:cache
          php artisan optimize
          sudo systemctl restart php8.2-fpm
          sudo supervisorctl restart all
```

---

## Environment Configuration

### Production .env File

```ini
# Application
APP_NAME="Point of Sales"
APP_ENV=production
APP_KEY=base64:YOUR_GENERATED_KEY
APP_DEBUG=false
APP_URL=https://your-domain.com

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=point_of_sales
DB_USERNAME=pos_user
DB_PASSWORD=STRONG_PASSWORD_HERE

# Cache & Session
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

# Redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# Mail
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@your-domain.com
MAIL_FROM_NAME="${APP_NAME}"

# Payment Gateway - Midtrans
MIDTRANS_SERVER_KEY=your-production-server-key
MIDTRANS_CLIENT_KEY=your-production-client-key
MIDTRANS_IS_PRODUCTION=true

# Payment Gateway - Xendit
XENDIT_API_KEY=your-production-api-key
XENDIT_WEBHOOK_TOKEN=your-webhook-token

# WhatsApp Business API
WHATSAPP_API_URL=https://api.whatsapp.com
WHATSAPP_API_TOKEN=your-api-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id

# SMS - Twilio
TWILIO_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Google Calendar
GOOGLE_CALENDAR_ID=your-calendar-id@group.calendar.google.com
GOOGLE_CALENDAR_CREDENTIALS_PATH=/var/www/point-of-sales/storage/app/google-calendar/credentials.json

# Logging
LOG_CHANNEL=daily
LOG_LEVEL=error
LOG_DEPRECATIONS_CHANNEL=null

# Performance
OPTIMIZE_CACHE=true
```

---

## Database Setup

### Create Database User
```sql
CREATE DATABASE point_of_sales CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'pos_user'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON point_of_sales.* TO 'pos_user'@'localhost';
FLUSH PRIVILEGES;
```

### Run Migrations
```bash
php artisan migrate --force
```

### Seed Initial Data
```bash
php artisan db:seed --class=RoleSeeder
php artisan db:seed --class=PermissionSeeder
php artisan db:seed --class=DatabaseSeeder
```

### Backup Database
```bash
mysqldump -u pos_user -p point_of_sales > backup_$(date +%Y%m%d).sql
```

---

## Queue and Scheduler Setup

### Configure Supervisor for Queue Workers

Create `/etc/supervisor/conf.d/pos-worker.conf`:

```ini
[program:pos-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/point-of-sales/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/point-of-sales/storage/logs/worker.log
stopwaitsecs=3600
```

Update and start:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start pos-worker:*
```

### Configure Cron for Task Scheduler

```bash
sudo crontab -e -u www-data
```

Add:
```
* * * * * cd /var/www/point-of-sales && php artisan schedule:run >> /dev/null 2>&1
```

---

## Web Server Configuration

### Nginx Configuration

Create `/etc/nginx/sites-available/pos`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    root /var/www/point-of-sales/public;
    index index.php index.html;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Logging
    access_log /var/log/nginx/pos-access.log;
    error_log /var/log/nginx/pos-error.log;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Client Max Body Size (for file uploads)
    client_max_body_size 20M;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_read_timeout 300;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/pos /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## SSL Certificate

### Using Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal (already setup by certbot)
sudo certbot renew --dry-run
```

### Manual SSL Certificate

If using a purchased SSL certificate:

```bash
# Copy certificate files
sudo cp your-certificate.crt /etc/ssl/certs/
sudo cp your-private-key.key /etc/ssl/private/
sudo cp your-ca-bundle.crt /etc/ssl/certs/

# Update Nginx configuration with correct paths
```

---

## Performance Optimization

### 1. Enable OPcache

Edit `/etc/php/8.2/fpm/php.ini`:

```ini
opcache.enable=1
opcache.memory_consumption=256
opcache.interned_strings_buffer=16
opcache.max_accelerated_files=10000
opcache.validate_timestamps=0
opcache.save_comments=1
opcache.fast_shutdown=1
```

Restart PHP-FPM:
```bash
sudo systemctl restart php8.2-fpm
```

### 2. Configure Redis Maxmemory

Edit `/etc/redis/redis.conf`:

```
maxmemory 256mb
maxmemory-policy allkeys-lru
```

Restart Redis:
```bash
sudo systemctl restart redis-server
```

### 3. MySQL Optimization

Edit `/etc/mysql/mysql.conf.d/mysqld.cnf`:

```ini
[mysqld]
innodb_buffer_pool_size = 2G
innodb_log_file_size = 256M
max_connections = 200
query_cache_size = 0
query_cache_type = 0
```

Restart MySQL:
```bash
sudo systemctl restart mysql
```

### 4. Laravel Optimizations

```bash
# Run all optimization commands
php artisan optimize

# Individual commands
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
```

---

## Monitoring and Logging

### 1. Application Logging

Configure daily log rotation in `.env`:
```ini
LOG_CHANNEL=daily
LOG_LEVEL=error
```

### 2. Laravel Telescope (Optional - Development/Staging Only)

```bash
# Install Telescope
composer require laravel/telescope --dev

# Publish assets
php artisan telescope:install
php artisan migrate

# Restrict access in production
# Only enable on specific IPs or authenticated users
```

### 3. Server Monitoring

Install monitoring tools:

```bash
# Install htop for system monitoring
sudo apt install -y htop

# Install netdata for real-time monitoring
bash <(curl -Ss https://my-netdata.io/kickstart.sh)
```

### 4. Error Tracking with Sentry (Optional)

```bash
composer require sentry/sentry-laravel
php artisan sentry:publish --dsn=YOUR_DSN
```

### 5. Uptime Monitoring

Use services like:
- UptimeRobot (free)
- Pingdom
- StatusCake

---

## Backup Strategy

### 1. Automated Database Backups

Create `/usr/local/bin/backup-database.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/var/backups/mysql"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="point_of_sales"
DB_USER="pos_user"
DB_PASS="YOUR_PASSWORD"

mkdir -p $BACKUP_DIR

mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/pos_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -type f -mtime +30 -delete
```

Make executable:
```bash
sudo chmod +x /usr/local/bin/backup-database.sh
```

Add to crontab:
```bash
0 2 * * * /usr/local/bin/backup-database.sh
```

### 2. Application File Backups

```bash
# Backup storage and uploads
tar -czf /var/backups/pos_storage_$(date +%Y%m%d).tar.gz /var/www/point-of-sales/storage

# Upload to cloud storage (AWS S3, etc.)
aws s3 cp /var/backups/ s3://your-bucket/backups/ --recursive
```

---

## Troubleshooting

### Common Issues

#### 1. 500 Internal Server Error

```bash
# Check Laravel logs
tail -f storage/logs/laravel.log

# Check Nginx error log
sudo tail -f /var/log/nginx/pos-error.log

# Check PHP-FPM log
sudo tail -f /var/log/php8.2-fpm.log
```

#### 2. Permission Issues

```bash
sudo chown -R www-data:www-data /var/www/point-of-sales
sudo chmod -R 755 /var/www/point-of-sales
sudo chmod -R 775 /var/www/point-of-sales/storage
sudo chmod -R 775 /var/www/point-of-sales/bootstrap/cache
```

#### 3. Queue Not Processing

```bash
# Check queue worker status
sudo supervisorctl status pos-worker:*

# Restart workers
sudo supervisorctl restart pos-worker:*

# Check worker logs
tail -f storage/logs/worker.log
```

#### 4. Cache Issues

```bash
# Clear all caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Rebuild caches
php artisan optimize
```

#### 5. Database Connection Issues

```bash
# Test MySQL connection
mysql -u pos_user -p point_of_sales

# Check MySQL status
sudo systemctl status mysql

# Restart MySQL
sudo systemctl restart mysql
```

---

## Post-Deployment Checklist

- [ ] Application accessible via HTTPS
- [ ] SSL certificate valid and auto-renewing
- [ ] Database migrations completed
- [ ] Queue workers running
- [ ] Cron scheduler configured
- [ ] File permissions correct
- [ ] Logs rotating properly
- [ ] Backups running automatically
- [ ] Payment gateways tested in production
- [ ] Email sending working
- [ ] WhatsApp notifications working
- [ ] Monitoring tools configured
- [ ] Error tracking active
- [ ] Performance optimizations applied
- [ ] Security headers configured
- [ ] Firewall rules set

---

## Security Hardening

### 1. Firewall Configuration

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. Fail2Ban

```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. Disable Root Login

Edit `/etc/ssh/sshd_config`:
```
PermitRootLogin no
```

Restart SSH:
```bash
sudo systemctl restart sshd
```

---

## Support and Maintenance

### Regular Maintenance Tasks

**Daily:**
- Monitor error logs
- Check queue worker status
- Verify backup completion

**Weekly:**
- Review system resource usage
- Check for failed jobs
- Update dependencies

**Monthly:**
- Security updates
- Performance review
- Database optimization

**Quarterly:**
- Full system audit
- Disaster recovery test
- Documentation update

---

## Rollback Procedure

If deployment fails:

```bash
# 1. Revert code
git reset --hard HEAD~1

# 2. Restore database
mysql -u pos_user -p point_of_sales < backup_YYYYMMDD.sql

# 3. Clear caches
php artisan optimize:clear

# 4. Rebuild caches
php artisan optimize

# 5. Restart services
sudo systemctl restart php8.2-fpm
sudo supervisorctl restart all
```

---

**Last Updated:** 2026-01-04
**Version:** 1.0
