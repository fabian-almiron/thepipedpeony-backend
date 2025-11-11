#!/bin/bash

echo "🚀 Uploading files to Railway..."

# Create tarball from your local uploads
cd ~/Documents/9S/CLIENTS/"The Piped Peony"/pp-back-end/public/uploads
echo "📦 Creating tarball..."
tar -czf /tmp/uploads.tar.gz .

# Upload to Railway
echo "📤 Uploading to Railway (28MB)..."
curl -X POST \
  -F "file=@/tmp/uploads.tar.gz" \
  https://railwayapp-strapi-production-b4af.up.railway.app/api/bulk-upload

# Clean up
rm /tmp/uploads.tar.gz

echo ""
echo "✅ Done! Check your Media Library."

