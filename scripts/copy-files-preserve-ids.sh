#!/bin/bash

echo "📦 Copying files to Railway volume (preserving IDs)..."
echo ""
echo "This will copy your local uploads directly to Railway"
echo "WITHOUT creating new database records, so all IDs stay the same!"
echo ""

cd ~/Documents/9S/CLIENTS/"The Piped Peony"/pp-back-end/public/uploads

# Create tarball
echo "📦 Creating tarball of uploads (~28MB)..."
tar -czf /tmp/uploads-preserve.tar.gz .

echo "📤 Uploading to Railway..."
echo ""

# We'll use the Railway run with a simple HTTP server approach
# Create a temporary upload endpoint
echo "Creating temporary upload endpoint..."

cat > /tmp/receive-upload.js << 'SCRIPT'
const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/upload-tar') {
    const uploadsPath = path.join(process.cwd(), 'public', 'uploads');
    
    // Ensure directory exists
    if (!fs.existsSync(uploadsPath)) {
      fs.mkdirSync(uploadsPath, { recursive: true });
    }
    
    const tarPath = '/tmp/uploads.tar.gz';
    const writeStream = fs.createWriteStream(tarPath);
    
    req.pipe(writeStream);
    
    writeStream.on('finish', () => {
      // Extract tar
      exec(`cd ${uploadsPath} && tar -xzf ${tarPath}`, (err) => {
        if (err) {
          res.writeHead(500);
          res.end(JSON.stringify({ error: err.message }));
        } else {
          const files = fs.readdirSync(uploadsPath);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success: true, 
            fileCount: files.length,
            message: 'Files extracted successfully'
          }));
        }
        fs.unlinkSync(tarPath);
      });
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(9999, () => {
  console.log('Listening on port 9999...');
});
SCRIPT

echo ""
echo "⚠️  This requires a temporary endpoint. Let's use the Strapi upload API instead."
echo ""

rm /tmp/receive-upload.js
rm /tmp/uploads-preserve.tar.gz

echo "❌ This approach won't work without SSH access to Railway container."
echo ""
echo "✅ Better solution: Use the bulk upload script you already have!"
echo ""
echo "Run: ./upload-with-api-key.sh"
echo ""
echo "Then run: railway run node scripts/fix-file-urls.js"
echo "This will update the old Strapi Cloud URLs to Railway URLs."

