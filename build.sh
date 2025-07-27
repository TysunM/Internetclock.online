#!/bin/bash

# Fixed build script for Internet Clock Online
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
    else
        echo "File not found (skipping): $file"
    fi
done

# Copy directories
echo "Copying directories..."
for dir in styles scripts assets images css js fonts; do
    if [ -d "$dir" ]; then
        cp -r "$dir" dist/
        echo "Copied $dir/ directory"
    else
        echo "Directory not found (skipping): $dir"
    fi
done

# Update any hardcoded domain references in files
echo "Updating domain references..."
if [ -f "dist/robots.txt" ]; then
    sed -i 's/bigbigtime\.com/internetclock.online/g' dist/robots.txt 2>/dev/null || true
    sed -i 's/localhost:8000/internetclock.online/g' dist/robots.txt 2>/dev/null || true
fi

if [ -f "dist/sitemap.xml" ]; then
    sed -i 's/bigbigtime\.com/internetclock.online/g' dist/sitemap.xml 2>/dev/null || true
    sed -i 's/localhost:8000/internetclock.online/g' dist/sitemap.xml 2>/dev/null || true
fi

# Verify critical files exist
echo "Verifying build..."
if [ ! -f "dist/index.html" ]; then
    echo "ERROR: Build verification failed - no index.html in dist"
    echo "Contents of dist directory:"
    ls -la dist/ || echo "dist directory is empty or doesn't exist"
    exit 1
fi

# Check for required directories
if [ ! -d "dist/styles" ]; then
    echo "WARNING: No styles directory found in dist"
fi

if [ ! -d "dist/scripts" ]; then
    echo "WARNING: No scripts directory found in dist"
fi

# Set proper permissions
echo "Setting permissions..."
chmod -R 644 dist/* 2>/dev/null || true
find dist -type d -exec chmod 755 {} \; 2>/dev/null || true

echo "Build successful"
echo "Build contents:"
ls -la dist/

echo "Total build size:"
du -sh dist

echo ""
echo "Build ready for deployment to internetclock.online"
