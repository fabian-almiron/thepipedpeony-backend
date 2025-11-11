#!/bin/sh
set -e

echo "🔧 Fixing volume permissions..."

# Ensure uploads directory exists and has correct permissions
if [ -d "/app/public/uploads" ]; then
    # Fix ownership (we should be root at this point)
    chown -R strapi:nodejs /app/public/uploads
    chmod -R 775 /app/public/uploads
    echo "✅ Permissions fixed for uploads directory"
else
    echo "⚠️  /app/public/uploads doesn't exist, creating..."
    mkdir -p /app/public/uploads
    chown -R strapi:nodejs /app/public/uploads
    chmod -R 775 /app/public/uploads
fi

# Fix other directories
chown -R strapi:nodejs /app/.tmp /app/.cache
chmod -R 775 /app/.tmp /app/.cache

echo "🚀 Starting Strapi as strapi user..."

# Switch to strapi user and execute the CMD
exec su-exec strapi "$@"

