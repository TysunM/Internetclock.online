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
