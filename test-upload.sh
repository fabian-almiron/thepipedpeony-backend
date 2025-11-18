#!/bin/bash

# ⚠️ SECURITY: Never hardcode API tokens!
# Set your API token as an environment variable instead:
# export STRAPI_API_TOKEN="your-token-here"

if [ -z "$STRAPI_API_TOKEN" ]; then
    echo "❌ Error: STRAPI_API_TOKEN environment variable is not set"
    echo ""
    echo "Usage:"
    echo "  export STRAPI_API_TOKEN='your-api-token'"
    echo "  ./test-upload.sh"
    exit 1
fi

API_TOKEN="$STRAPI_API_TOKEN"

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

