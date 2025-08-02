#!/bin/bash

# Internet Clock - Podman Deployment Script for Fedora
# Make executable with: chmod +x podman-deploy.sh

set -e

echo "🚀 Internet Clock - Podman Deployment for Fedora"
echo "================================================"

# Check if Podman is installed
if ! command -v podman &> /dev/null; then
    echo "❌ Podman not found. Installing..."
    sudo dnf install -y podman podman-compose
fi

# Check if podman-compose is available
if ! command -v podman-compose &> /dev/null; then
    echo "❌ podman-compose not found. Installing..."
    sudo dnf install -y podman-compose
fi

# Stop and remove existing containers
echo "🛑 Stopping existing containers..."
podman stop internet-clock-app 2>/dev/null || true
podman rm internet-clock-app 2>/dev/null || true

# Remove existing images
echo "🗑️  Removing old images..."
podman rmi localhost/internet-clock:latest 2>/dev/null || true

# Build the image
echo "🔨 Building Internet Clock image..."
podman build -t internet-clock:latest .

# Run the container (requires sudo for port 80)
echo "🚀 Starting Internet Clock container..."
sudo podman run -d \
  --name internet-clock-app \
  --restart unless-stopped \
  -p 80:80 \
  -e NODE_ENV=production \
  -e PORT=80 \
  internet-clock:latest

# Wait for container to start
echo "⏳ Waiting for container to start..."
sleep 5

# Check container status
if podman ps | grep -q internet-clock-app; then
    echo "✅ Internet Clock is running successfully!"
    echo ""
    echo "🌐 Access your Internet Clock at:"
    echo "   http://localhost"
    echo "   http://$(hostname -I | awk '{print $1}')"
    echo ""
    echo "📊 Container status:"
    podman ps --filter name=internet-clock-app
    echo ""
    echo "📋 Useful commands:"
    echo "   podman logs internet-clock-app     # View logs"
    echo "   podman stop internet-clock-app     # Stop container"
    echo "   podman start internet-clock-app    # Start container"
    echo "   podman restart internet-clock-app  # Restart container"
else
    echo "❌ Failed to start container. Checking logs..."
    podman logs internet-clock-app
    exit 1
fi
