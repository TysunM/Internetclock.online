#!/bin/bash

# Production Deployment Script for internetclock.online
set -e

echo "Deploying Internet Clock Online to internetclock.online"
echo "====================================================="

# Configuration
DOMAIN="internetclock.online"
BUILD_DIR="dist"
WEB_ROOT="/var/www/bigbigtime.com/BigBigTime/dist"
BACKUP_DIR="/var/backups/internetclock/$(date +%Y%m%d_%H%M%S)"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "ERROR: No package.json found. Please run this script from the project root."
    exit 1
fi

echo "Domain: ${DOMAIN}"
echo "Build directory: ${BUILD_DIR}"
echo "Web root: ${WEB_ROOT}"

# Build the project
echo "Building project..."
npm run build

# Verify build
if [ ! -d "$BUILD_DIR" ] || [ ! -f "$BUILD_DIR/index.html" ]; then
    echo "ERROR: Build failed or incomplete"
    exit 1
fi

echo "Build successful!"

# Create backup of current site
echo "Creating backup..."
sudo mkdir -p "$BACKUP_DIR"
if [ -d "$WEB_ROOT" ] && [ "$(ls -A $WEB_ROOT)" ]; then
    sudo cp -r "$WEB_ROOT"/* "$BACKUP_DIR/" 2>/dev/null || true
    echo "Backup created at: $BACKUP_DIR"
fi

# Deploy new files
echo "Deploying to web root..."
sudo cp -r "$BUILD_DIR"/* "$WEB_ROOT/"

# Set proper ownership and permissions
echo "Setting permissions..."
sudo chown -R nginx:nginx "$WEB_ROOT"
sudo chmod -R 755 "$WEB_ROOT"
sudo find "$WEB_ROOT" -type f -exec chmod 644 {} \;

# Update nginx configuration if needed
NGINX_CONF="/etc/nginx/conf.d/internetclock.online.conf"
if [ ! -f "$NGINX_CONF" ]; then
    echo "Creating nginx configuration..."
    sudo tee "$NGINX_CONF" > /dev/null << 'EOF'
server {
    listen 80;
    server_name internetclock.online www.internetclock.online;
    root /var/www/bigbigtime.com/BigBigTime/dist;
    index index.html;

    # Redirect www to non-www
    if ($host = www.internetclock.online) {
        return 301 http://internetclock.online$request_uri;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static files
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
EOF
fi

# Test nginx configuration
echo "Testing nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "Reloading nginx..."
    sudo systemctl reload nginx
else
    echo "ERROR: Nginx configuration test failed"
    exit 1
fi

# Verify deployment
echo "Verifying deployment..."
if curl -s -o /dev/null -w "%{http_code}" "http://localhost" | grep -q "200"; then
    echo "SUCCESS: Site is responding"
else
    echo "WARNING: Site may not be responding properly"
fi

echo ""
echo "Deployment complete!"
echo "Site URL: https://${DOMAIN}"
echo "Backup location: ${BACKUP_DIR}"
echo ""
echo "Post-deployment checklist:"
echo "1. Test site functionality at https://${DOMAIN}"
echo "2. Check all 6 clock modes work properly"
echo "3. Test themes dropdown and background changes"
echo "4. Verify mobile responsiveness"
echo "5. Test settings dropdown with contact email"
echo "6. Check browser console for any JavaScript errors"
echo "7. Submit sitemap to Google Search Console"
echo "8. Set up SSL certificate if not already done:"
echo "   sudo certbot --nginx -d internetclock.online -d www.internetclock.online"
