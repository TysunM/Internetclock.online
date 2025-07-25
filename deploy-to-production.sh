#!/bin/bash

# Production Deployment Script for bigbigtime.com
set -e

echo "🚀 Deploying BigBigTime to bigbigtime.com"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
DOMAIN="bigbigtime.com"
BUILD_DIR="dist"
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ No package.json found. Please run this script from the project root.${NC}"
    exit 1
fi

echo -e "${BLUE}🌐 Domain: ${DOMAIN}${NC}"
echo -e "${BLUE}📁 Build directory: ${BUILD_DIR}${NC}"

# Build the project
echo -e "${YELLOW}🔨 Building project...${NC}"
npm run build

# Verify build
if [ ! -d "$BUILD_DIR" ] || [ ! -f "$BUILD_DIR/index.html" ]; then
    echo -e "${RED}❌ Build failed or incomplete${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful${NC}"

# Show deployment options
echo ""
echo -e "${GREEN}🚀 Deployment Options:${NC}"
echo "1. Deploy with Docker (recommended)"
echo "2. Deploy via SCP to remote server"
echo "3. Deploy to current server directory"
echo "4. Generate deployment archive"

read -p "Choose deployment method (1-4): " choice

case $choice in
    1)
        echo -e "${YELLOW}🐳 Deploying with Docker...${NC}"
        
        # Build Docker image
        docker build -t bigbigtime-clock .
        
        # Stop existing container if running
        docker stop bigbigtime-clock 2>/dev/null || true
        docker rm bigbigtime-clock 2>/dev/null || true
        
        # Run new container
        docker run -d \
            --name bigbigtime-clock \
            --restart unless-stopped \
            -p 80:80 \
            -p 443:443 \
            bigbigtime-clock
        
        echo -e "${GREEN}✅ Docker deployment complete!${NC}"
        echo -e "${BLUE}🌐 Site should be live at: http://${DOMAIN}${NC}"
        ;;
        
    2)
        read -p "Enter server user@host (e.g., user@bigbigtime.com): " server
        read -p "Enter remote web directory (e.g., /var/www/html): " webdir
        
        echo -e "${YELLOW}📤 Deploying via SCP to ${server}:${webdir}...${NC}"
        
        # Create backup on remote server
        ssh $server "mkdir -p $BACKUP_DIR && cp -r $webdir/* $BACKUP_DIR/ 2>/dev/null || true"
        
        # Deploy files
        scp -r $BUILD_DIR/* $server:$webdir/
        
        echo -e "${GREEN}✅ SCP deployment complete!${NC}"
        echo -e "${BLUE}🌐 Site should be live at: https://${DOMAIN}${NC}"
        ;;
        
    3)
        read -p "Enter local web directory (e.g., /var/www/html): " localdir
        
        echo -e "${YELLOW}📁 Deploying to local directory ${localdir}...${NC}"
        
        # Create backup
        sudo mkdir -p $BACKUP_DIR
        sudo cp -r $localdir/* $BACKUP_DIR/ 2>/dev/null || true
        
        # Deploy files
        sudo cp -r $BUILD_DIR/* $localdir/
        sudo chown -R www-data:www-data $localdir/ 2>/dev/null || true
        
        echo -e "${GREEN}✅ Local deployment complete!${NC}"
        ;;
        
    4)
        ARCHIVE_NAME="bigbigtime-clock-$(date +%Y%m%d_%H%M%S).tar.gz"
        
        echo -e "${YELLOW}📦 Creating deployment archive...${NC}"
        
        tar -czf $ARCHIVE_NAME -C $BUILD_DIR .
        
        echo -e "${GREEN}✅ Archive created: ${ARCHIVE_NAME}${NC}"
        echo -e "${BLUE}📤 Upload this archive to your server and extract it in your web directory${NC}"
        ;;
        
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 Deployment process complete!${NC}"
echo -e "${BLUE}🔗 Your site: https://${DOMAIN}${NC}"
echo -e "${YELLOW}📊 Don't forget to:${NC}"
echo "   - Test the live site"
echo "   - Check SSL certificate"
echo "   - Verify Google Analytics/ads"
echo "   - Submit sitemap to Google Search Console"
