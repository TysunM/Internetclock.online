#!/bin/bash

# Enhanced build script for Internet Clock Online
set -e

echo "Building Internet Clock Online for internetclock.online"
echo "===================================================="

# Clean previous build
echo "Cleaning previous build..."
rm -rf dist

# Create dist directory
echo "Creating dist directory..."
mkdir -p dist

# Copy HTML files
echo "Copying HTML files..."
if [ -f "Index.html" ]; then
    cp Index.html dist/index.html
    echo "Copied Index.html as index.html"
elif [ -f "index.html" ]; then
    cp index.html dist/
    echo "Copied index.html"
else
    echo "ERROR: No HTML file found (Index.html or index.html)"
    exit 1
fi

# Copy other HTML files if they exist
for file in *.html; do
    if [ -f "$file" ] && [ "$file" != "index.html" ] && [ "$file" != "Index.html" ]; then
        cp "$file" dist/
        echo "Copied $file"
    fi
done

# Copy essential files
echo "Copying essential files..."
for file in robots.txt sitemap.xml favicon.ico manifest.json .htaccess; do
    if [ -f "$file" ]; then
        cp "$file" dist/
        echo "Copied $file"
    fi
done

# Copy directories
echo "Copying directories..."
for dir in styles scripts assets images css js fonts; do
    if [ -d "$dir" ]; then
        cp -r "$dir" dist/
        echo "Copied $dir/ directory"
    fi
done

# Verify critical files exist
echo "Verifying build..."
critical_files=("dist/index.html" "dist/styles" "dist/scripts")
for file in "${critical_files[@]}"; do
    if [ ! -e "$file" ]; then
        echo "ERROR: Critical file/directory missing: $file"
        exit 1
    fi
done

# Update any hardcoded domain references in files
echo "Updating domain references..."
if [ -f "dist/robots.txt" ]; then
    sed -i 's/bigbigtime\.com/internetclock.online/g' dist/robots.txt
fi

if [ -f "dist/sitemap.xml" ]; then
    sed -i 's/bigbigtime\.com/internetclock.online/g' dist/sitemap.xml
fi

# Set proper permissions
echo "Setting permissions..."
chmod -R 644 dist/*
find dist -type d -exec chmod 755 {} \;

echo "Build successful!"
echo "Build contents:"
ls -la dist/

echo "Total build size:"
du -sh dist

echo ""
echo "Build ready for deployment to internetclock.online"
echo "Next steps:"
echo "1. sudo cp -r dist/* /var/www/bigbigtime.com/BigBigTime/dist/"
echo "2. sudo chown -R nginx:nginx /var/www/bigbigtime.com/BigBigTime/dist/"
echo "3. sudo systemctl reload nginx"
