const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

// Configuration
const STRAPI_URL = 'https://dazzling-friends-80757c9c53.strapiapp.com';
const API_TOKEN = 'a674555034857562b9ed526bc9432f780ec36df3ba0acd4c6e1996edfdde8e2dca30e933bbca48cb0d32d706e021322aa1acfeec3e74c8aae1935d857e25a43eb2d3134c68d4aedfa74c1d39886a9ecc5fd875bfa7916c983862789480e55a992de4932e461851057a3f04c7cfa0a0909a478462958735bd281b55e0280cc458';
const LOCAL_UPLOAD_DIR = path.join(__dirname, 'public', 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
  fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
}

/**
 * Fetch data from Strapi API
 */
async function fetchFromStrapi(endpoint) {
  return new Promise((resolve, reject) => {
    const url = `${STRAPI_URL}${endpoint}`;
    
    https.get(url, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`
      }
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Failed to parse JSON: ${e.message}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Download a file from URL to local path
 */
async function downloadFile(fileUrl, localPath) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(fileUrl);
    const protocol = parsedUrl.protocol === 'https:' ? https : http;
    
    // Create directory if it doesn't exist
    const dir = path.dirname(localPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const file = fs.createWriteStream(localPath);
    
    protocol.get(fileUrl, (response) => {
      // Follow redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        return downloadFile(response.headers.location, localPath)
          .then(resolve)
          .catch(reject);
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: HTTP ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(localPath, () => {}); // Delete file on error
      reject(err);
    });
    
    file.on('error', (err) => {
      fs.unlink(localPath, () => {}); // Delete file on error
      reject(err);
    });
  });
}

/**
 * Main function to download all Strapi images
 */
async function downloadAllImages() {
  console.log('🚀 Starting Strapi Cloud image download...\n');
  console.log(`📡 Fetching files from: ${STRAPI_URL}`);
  console.log(`💾 Saving to: ${LOCAL_UPLOAD_DIR}\n`);
  
  try {
    // Fetch all files from Strapi
    const response = await fetchFromStrapi('/api/upload/files?pagination[limit]=1000');
    
    const files = response.data || response;
    
    if (!Array.isArray(files) || files.length === 0) {
      console.log('⚠️  No files found in Strapi Cloud');
      return;
    }
    
    console.log(`📦 Found ${files.length} files to download\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Download each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileData = file.attributes || file;
      
      // Get file URL (could be absolute or relative)
      let fileUrl = fileData.url;
      if (fileUrl.startsWith('/')) {
        fileUrl = `${STRAPI_URL}${fileUrl}`;
      }
      
      // Determine local path - extract filename from URL
      const urlPath = new URL(fileUrl).pathname;
      const fileName = path.basename(urlPath);
      const localPath = path.join(LOCAL_UPLOAD_DIR, fileName);
      
      try {
        console.log(`[${i + 1}/${files.length}] Downloading: ${fileData.name || fileName}`);
        await downloadFile(fileUrl, localPath);
        console.log(`✅ Saved to: uploads/${fileName}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed: ${fileData.name || path.basename(fileUrl)}`);
        console.error(`   Error: ${error.message}`);
        errorCount++;
      }
      
      console.log('');
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 Download Summary:');
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    console.log(`   📁 Total: ${files.length}`);
    console.log('='.repeat(50));
    console.log('\n✨ Download complete!');
    
  } catch (error) {
    console.error('\n❌ Error fetching files from Strapi:');
    console.error(error.message);
    
    if (error.message.includes('401') || error.message.includes('403')) {
      console.error('\n⚠️  Authentication failed. Please check your API token.');
    }
    
    process.exit(1);
  }
}

// Run the script
downloadAllImages();

