#!/bin/bash

echo "🚀 Bulk uploading files to Strapi Media Library..."
echo "⚠️  You'll need an admin JWT token first"
echo ""
echo "1. Go to: https://railwayapp-strapi-production-b4af.up.railway.app/admin"
echo "2. Open DevTools (F12) → Console"
echo "3. Run: localStorage.getItem('jwtToken')"
echo "4. Copy the token (without quotes)"
echo ""
read -p "Paste your JWT token here: " JWT_TOKEN

if [ -z "$JWT_TOKEN" ]; then
    echo "❌ No token provided!"
    exit 1
fi

echo ""
echo "📦 Uploading files..."

cd ~/Documents/9S/CLIENTS/"The Piped Peony"/pp-back-end/public/uploads

count=0
total=$(ls -1 | wc -l | tr -d ' ')

for file in *; do
    if [ -f "$file" ]; then
        ((count++))
        echo "[$count/$total] Uploading: $file"
        
        curl -s -X POST \
          -H "Authorization: Bearer $JWT_TOKEN" \
          -F "files=@$file" \
          https://railwayapp-strapi-production-b4af.up.railway.app/api/upload \
          > /dev/null
        
        # Rate limit: 1 file per second
        sleep 1
    fi
done

echo ""
echo "✅ Upload complete! Uploaded $count files."
echo "🔍 Check your Media Library"

