#!/bin/bash

API_TOKEN="2c336b297fef850e0e6465c23b97a55b1939349c854f00f81254d2be6a3455369fa0e4cf990c4a743b13346f837a8124a9da0a6256c01aa993501e4824e3670f75fefd1e78e1189eb3708978b88be91b9c5d039455d68a0c97ac8c7ac649bf307cbc9b8d41dcc40bae678bada064e8d5543dbd02048f52592c45331bca5fc49f"

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

