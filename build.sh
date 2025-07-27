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
