#!/bin/sh
set -e

echo "🔧 Fixing volume permissions..."

# Ensure uploads directory exists and has correct permissions
if [ -d "/app/public/uploads" ]; then
    # Fix ownership if we have permission
    if [ "$(id -u)" = "0" ]; then
        chown -R strapi:nodejs /app/public/uploads
    fi
    
    # Ensure directory is writable
    chmod -R 755 /app/public/uploads
    
    echo "✅ Permissions fixed"
else
    echo "⚠️  /app/public/uploads doesn't exist, creating..."
    mkdir -p /app/public/uploads
    chmod -R 755 /app/public/uploads
fi

echo "🚀 Starting Strapi..."

# Execute the CMD from Dockerfile
exec "$@"

