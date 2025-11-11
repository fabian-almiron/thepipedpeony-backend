#!/bin/bash

echo "🚀 Bulk uploading missing files to Railway..."
echo ""
echo "This will upload files from your local uploads directory"
echo "to match what's in the database."
echo ""
echo "📍 Source: ~/Documents/9S/CLIENTS/The Piped Peony/pp-back-end/public/uploads"
echo "📍 Target: Railway Volume (/app/public/uploads)"
echo ""
read -p "Continue? (y/n): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 0
fi

echo ""
echo "⚠️  You'll need an admin JWT token"
echo "1. Go to: https://railwayapp-strapi-production-b4af.up.railway.app/admin"
echo "2. Open DevTools (F12) → Console"
echo "3. Run: localStorage.getItem('jwtToken')"
echo "4. Copy the token (without quotes)"
echo ""
read -p "Paste your JWT token: " JWT_TOKEN

if [ -z "$JWT_TOKEN" ]; then
    echo "❌ No token provided!"
    exit 1
fi

echo ""
echo "📦 Uploading files (this will take a few minutes)..."
echo ""

cd ~/Documents/9S/CLIENTS/"The Piped Peony"/pp-back-end/public/uploads

count=0
success=0
failed=0
total=$(ls -1 | wc -l | tr -d ' ')

for file in *; do
    if [ -f "$file" ]; then
        ((count++))
        echo -n "[$count/$total] $file ... "
        
        response=$(curl -s -w "\n%{http_code}" -X POST \
          -H "Authorization: Bearer $JWT_TOKEN" \
          -F "files=@$file" \
          https://railwayapp-strapi-production-b4af.up.railway.app/api/upload)
        
        http_code=$(echo "$response" | tail -n1)
        
        if [ "$http_code" = "200" ]; then
            echo "✅"
            ((success++))
        else
            echo "❌ (HTTP $http_code)"
            ((failed++))
        fi
        
        # Rate limit: 1 file per second
        sleep 1
    fi
done

echo ""
echo "================================"
echo "✅ Upload complete!"
echo "   Success: $success files"
if [ $failed -gt 0 ]; then
    echo "   Failed:  $failed files"
fi
echo "================================"
echo ""
echo "🔍 Check your Media Library to verify"

