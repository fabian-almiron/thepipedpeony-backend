#!/bin/bash

API_TOKEN="2c336b297fef850e0e6465c23b97a55b1939349c854f00f81254d2be6a3455369fa0e4cf990c4a743b13346f837a8124a9da0a6256c01aa993501e4824e3670f75fefd1e78e1189eb3708978b88be91b9c5d039455d68a0c97ac8c7ac649bf307cbc9b8d41dcc40bae678bada064e8d5543dbd02048f52592c45331bca5fc49f"

echo "🧪 Testing upload with one file..."
echo ""

cd ~/Documents/9S/CLIENTS/"The Piped Peony"/pp-back-end/public/uploads

# Get the first file
test_file=$(ls -1 | head -1)

if [ -z "$test_file" ]; then
    echo "❌ No files found in uploads directory!"
    exit 1
fi

echo "📤 Uploading: $test_file"
echo ""

response=$(curl -v -X POST \
  -H "Authorization: Bearer $API_TOKEN" \
  -F "files=@$test_file" \
  https://railwayapp-strapi-production-b4af.up.railway.app/api/upload \
  2>&1)

echo "$response"
echo ""
echo "================================"
echo "Check the response above:"
echo "  ✅ Success = HTTP 200 with JSON response"
echo "  ❌ Failed = HTTP 401/403 (auth issue) or 500 (server error)"
echo "================================"

