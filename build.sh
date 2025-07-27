#!/bin/bash

# Complete Build-to-Deploy Pipeline for Internet Clock Online
# This script handles everything from build to live deployment
set -e

echo "Internet Clock Online - Build to Deploy Pipeline"
echo "==============================================="

# Configuration
DOMAIN="internetclock.online"
PROJECT_NAME="internet-clock-online"
BUILD_DIR="dist"
WEB_ROOT="/var/www/bigbigtime.com/BigBigTime/dist"
BACKUP_DIR="/var/backups/internetclock/$(date +%Y%m%d_%H%M%S)"
NGINX_CONF="/etc/nginx/conf.d/internetclock.online.conf"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to print status
print_status() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')] $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if running as root for deployment parts
    if [[ $EUID -eq 0 ]]; then
        print_warning "Running as root. This is required for deployment."
    fi
    
    # Check required files
    required_files=("package.json" "styles/main.css" "scripts/app.js")
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            print_error "Required file missing: $file"
            exit 1
        fi
    done
    
    # Check for HTML file
    if [ ! -f "Index.html" ] && [ ! -f "index.html" ]; then
        print_error "No HTML file found (Index.html or index.html)"
        exit 1
    fi
    
    # Check if nginx is installed
    if ! command -v nginx &> /dev/null; then
        print_error "Nginx is not installed"
        exit 1
    fi
    
    # Check if node and npm are available
    if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
        print_error "Node.js and npm are required"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Function to clean previous builds
clean_build() {
    print_status "Cleaning previous build..."
    rm -rf "$BUILD_DIR"
    print_success "Previous build cleaned"
}

# Function to build the project
build_project() {
    print_status "Building project..."
    
    # Create dist directory
    mkdir -p "$BUILD_DIR"
    
    # Copy HTML files (handle both Index.html and index.html)
    if [ -f "Index.html" ]; then
        cp Index.html "$BUILD_DIR/index.html"
        print_success "Copied Index.html as index.html"
    elif [ -f "index.html" ]; then
        cp index.html "$BUILD_DIR/"
        print_success "Copied index.html"
    fi
    
    # Copy other HTML files
    for file in *.html; do
        if [ -f "$file" ] && [ "$file" != "index.html" ] && [ "$file" != "Index.html" ]; then
            cp "$file" "$BUILD_DIR/"
            print_success "Copied $file"
        fi
    done
    
    # Copy essential files
    essential_files=("robots.txt" "sitemap.xml" "favicon.ico" "manifest.json" ".htaccess")
    for file in "${essential_files[@]}"; do
        if [ -f "$file" ]; then
            cp "$file" "$BUILD_DIR/"
            print_success "Copied $file"
        fi
    done
    
    # Copy directories
    directories=("styles" "scripts" "assets" "images" "css" "js" "fonts")
    for dir in "${directories[@]}"; do
        if [ -d "$dir" ]; then
            cp -r "$dir" "$BUILD_DIR/"
            print_success "Copied $dir/ directory"
        fi
    done
    
    # Update domain references
    if [ -f "$BUILD_DIR/robots.txt" ]; then
        sed -i "s/bigbigtime\.com/$DOMAIN/g" "$BUILD_DIR/robots.txt"
        sed -i "s/localhost:8000/$DOMAIN/g" "$BUILD_DIR/robots.txt"
    fi
    
    if [ -f "$BUILD_DIR/sitemap.xml" ]; then
        sed -i "s/bigbigtime\.com/$DOMAIN/g" "$BUILD_DIR/sitemap.xml"
        sed -i "s/localhost:8000/$DOMAIN/g" "$BUILD_DIR/sitemap.xml"
    fi
    
    print_success "Project built successfully"
}

# Function to verify build
verify_build() {
    print_status "Verifying build..."
    
    # Check critical files
    critical_files=("$BUILD_DIR/index.html" "$BUILD_DIR/styles" "$BUILD_DIR/scripts")
    for file in "${critical_files[@]}"; do
        if [ ! -e "$file" ]; then
            print_error "Critical file/directory missing: $file"
            exit 1
        fi
    done
    
    # Check file sizes
    if [ ! -s "$BUILD_DIR/styles/main.css" ]; then
        print_error "CSS file is empty"
        exit 1
    fi
    
    if [ ! -s "$BUILD_DIR/scripts/app.js" ]; then
        print_error "JavaScript file is empty"
        exit 1
    fi
    
    # Check HTML structure
    if ! grep -q '<!DOCTYPE html>' "$BUILD_DIR/index.html"; then
        print_error "HTML file missing DOCTYPE"
        exit 1
    fi
    
    # Display build info
    print_success "Build verification passed"
    echo "Build contents:"
    ls -la "$BUILD_DIR/"
    echo "Build size: $(du -sh $BUILD_DIR | cut -f1)"
}

# Function to test build locally
test_build() {
    print_status "Testing build locally..."
    
    if command -v python3 &> /dev/null; then
        cd "$BUILD_DIR"
        echo "Starting local server on http://localhost:8001"
        echo "Testing for 5 seconds..."
        
        # Start server in background
        python3 -m http.server 8001 >/dev/null 2>&1 &
        SERVER_PID=$!
        
        # Wait for server to start
        sleep 2
        
        # Test if server responds
        if curl -s -o /dev/null -w "%{http_code}" "http://localhost:8001" | grep -q "200"; then
            print_success "Local server test passed"
        else
            print_warning "Local server test failed, but continuing..."
        fi
        
        # Clean up
        kill $SERVER_PID 2>/dev/null || true
        cd ..
    else
        print_warning "Python3 not available, skipping local test"
    fi
}

# Function to create backup
create_backup() {
    print_status "Creating backup..."
    
    if [ -d "$WEB_ROOT" ] && [ "$(ls -A $WEB_ROOT 2>/dev/null)" ]; then
        mkdir -p "$BACKUP_DIR"
        cp -r "$WEB_ROOT"/* "$BACKUP_DIR/" 2>/dev/null || true
        print_success "Backup created at: $BACKUP_DIR"
    else
        print_warning "No existing site to backup"
    fi
}

# Function to deploy to web server
deploy_to_server() {
    print_status "Deploying to web server..."
    
    # Ensure web root exists
    mkdir -p "$WEB_ROOT"
    
    # Copy files
    cp -r "$BUILD_DIR"/* "$WEB_ROOT/"
    
    # Set permissions
    chown -R nginx:nginx "$WEB_ROOT"
    chmod -R 755 "$WEB_ROOT"
    find "$WEB_ROOT" -type f -exec chmod 644 {} \;
    
    print_success "Files deployed to web server"
}

# Function to configure nginx
configure_nginx() {
    print_status "Configuring nginx..."
    
    # Create nginx configuration if it doesn't exist
    if [ ! -f "$NGINX_CONF" ]; then
        cat > "$NGINX_CONF" << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    root $WEB_ROOT;
    index index.html;

    # Redirect www to non-www
    if (\$host = www.$DOMAIN) {
        return 301 http://$DOMAIN\$request_uri;
    }

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Cache static files
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        add_header Vary Accept-Encoding;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    # Handle specific files
    location = /favicon.ico {
        access_log off;
        log_not_found off;
        expires 1y;
    }

    location = /robots.txt {
        access_log off;
        log_not_found off;
    }

    location = /sitemap.xml {
        access_log off;
        log_not_found off;
    }
}
EOF
        print_success "Nginx configuration created"
    else
        print_warning "Nginx configuration already exists"
    fi
    
    # Test nginx configuration
    if nginx -t >/dev/null 2>&1; then
        print_success "Nginx configuration is valid"
    else
        print_error "Nginx configuration test failed"
        nginx -t
        exit 1
    fi
    
    # Reload nginx
    systemctl reload nginx
    print_success "Nginx reloaded"
}

# Function to verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    # Test local response
    if curl -s -o /dev/null -w "%{http_code}" "http://localhost" | grep -q "200"; then
        print_success "Local server responding correctly"
    else
        print_warning "Local server may not be responding properly"
    fi
    
    # Test domain response (if DNS is configured)
    if curl -s -o /dev/null -w "%{http_code}" "http://$DOMAIN" | grep -q "200"; then
        print_success "Domain responding correctly"
    else
        print_warning "Domain may not be responding (check DNS configuration)"
    fi
}

# Function to display post-deployment instructions
show_post_deployment() {
    echo ""
    echo "============================================="
    echo -e "${GREEN}🎉 DEPLOYMENT COMPLETE! 🎉${NC}"
    echo "============================================="
    echo ""
    echo -e "${BLUE}🌐 Your site: http://$DOMAIN${NC}"
    echo -e "${BLUE}📁 Backup location: $BACKUP_DIR${NC}"
    echo ""
    echo -e "${YELLOW}📋 Post-Deployment Checklist:${NC}"
    echo "1. Test site functionality at http://$DOMAIN"
    echo "2. Verify all 6 clock modes work properly"
    echo "3. Test themes dropdown (18 backgrounds)"
    echo "4. Check settings dropdown with contact email"
    echo "5. Test mobile responsiveness"
    echo "6. Check browser console for JavaScript errors"
    echo ""
    echo -e "${YELLOW}🔒 SSL Setup (if needed):${NC}"
    echo "sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
    echo ""
    echo -e "${YELLOW}📊 SEO Setup:${NC}"
    echo "1. Submit sitemap to Google Search Console:"
    echo "   https://$DOMAIN/sitemap.xml"
    echo "2. Verify domain ownership"
    echo "3. Monitor site performance"
    echo ""
    echo -e "${GREEN}✅ Ready for production traffic!${NC}"
}

# Main execution
main() {
    echo "Starting build-to-deploy pipeline..."
    echo "Domain: $DOMAIN"
    echo "Timestamp: $(date)"
    echo ""
    
    # Check if running with appropriate permissions
    if [[ $EUID -ne 0 ]] && [[ "$1" != "--build-only" ]]; then
        print_error "This script needs to be run with sudo for deployment"
        echo "Usage: sudo ./build-to-deploy.sh"
        echo "   or: ./build-to-deploy.sh --build-only (for build only)"
        exit 1
    fi
    
    # Execute pipeline steps
    check_prerequisites
    clean_build
    build_project
    verify_build
    test_build
    
    # If build-only mode, stop here
    if [[ "$1" == "--build-only" ]]; then
        print_success "Build completed successfully!"
        echo "To deploy: sudo ./build-to-deploy.sh"
        exit 0
    fi
    
    # Continue with deployment
    create_backup
    deploy_to_server
    configure_nginx
    verify_deployment
    show_post_deployment
}

# Run main function with all arguments
main "$@"
