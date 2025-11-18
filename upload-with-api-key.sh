#!/bin/bash

# ⚠️ SECURITY: Never hardcode API tokens!
# Set your API token as an environment variable instead:
# export STRAPI_API_TOKEN="your-token-here"

if [ -z "$STRAPI_API_TOKEN" ]; then
    echo "❌ Error: STRAPI_API_TOKEN environment variable is not set"
    echo ""
    echo "Usage:"
    echo "  export STRAPI_API_TOKEN='your-api-token'"
    echo "  ./upload-with-api-key.sh"
    exit 1
fi

API_TOKEN="$STRAPI_API_TOKEN"

echo "🚀 Bulk uploading files to Railway..."
echo ""

cd ~/Documents/9S/CLIENTS/"The Piped Peony"/pp-back-end/public/uploads

count=0
success=0
failed=0
total=$(ls -1 | wc -l | tr -d ' ')

echo "📦 Uploading $total files (this will take ~4-5 minutes)..."
echo ""

for file in *; do
    if [ -f "$file" ]; then
        ((count++))
        echo -n "[$count/$total] $file ... "
        
        response=$(curl -s -w "\n%{http_code}" -X POST \
          -H "Authorization: Bearer $API_TOKEN" \
          -F "files=@$file" \
          -F "path=/" \
          https://railwayapp-strapi-production-b4af.up.railway.app/api/upload 2>&1)
        
        http_code=$(echo "$response" | tail -n1)
        
        if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
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
echo "🔍 Refresh your Media Library to see the files"

