#!/bin/bash
# Upload files to Railway volume

echo "🚀 Uploading files to Railway..."

# Change to the uploads directory
cd ~/Documents/9S/CLIENTS/"The Piped Peony"/pp-back-end/public/uploads

# Create tarball
echo "📦 Creating tarball (28MB)..."
tar -czf /tmp/uploads.tar.gz .

# Make sure Railway is linked
cd /Users/mac/.cursor/worktrees/pp-back-end/5kCSU
railway link

# Link to the main service (not Postgres)
echo "🔗 Linking to strapi service..."
railway service

# Upload to Railway
echo "📤 Uploading to Railway volume..."
cat /tmp/uploads.tar.gz | railway run bash -c "mkdir -p /app/public/uploads && cd /app/public/uploads && tar -xzf -"

# Clean up
rm /tmp/uploads.tar.gz

echo "✅ Upload complete! Check your Media Library."

