#!/bin/bash
# Script to upload files to Railway deployment

echo "🚀 Uploading files to Railway..."

# Make sure you're linked to the right service
railway service link

# Create a tarball of uploads
echo "📦 Creating tarball of uploads..."
tar -czf uploads.tar.gz -C /path/to/old-strapi/public uploads

# Copy to Railway container (requires running deployment)
echo "📤 Copying files to Railway..."
railway run bash -c "cd /app/public && tar -xzf - " < uploads.tar.gz

echo "✅ Upload complete!"

