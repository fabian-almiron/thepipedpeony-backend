const https = require('https');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Configuration
const STRAPI_URL = 'https://dazzling-friends-80757c9c53.strapiapp.com';
const API_TOKEN = 'a674555034857562b9ed526bc9432f780ec36df3ba0acd4c6e1996edfdde8e2dca30e933bbca48cb0d32d706e021322aa1acfeec3e74c8aae1935d857e25a43eb2d3134c68d4aedfa74c1d39886a9ecc5fd875bfa7916c983862789480e55a992de4932e461851057a3f04c7cfa0a0909a478462958735bd281b55e0280cc458';
const DB_PATH = path.join(__dirname, '.tmp', 'data.db');

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
 * Convert Strapi Cloud URL to local URL
 */
function convertToLocalUrl(cloudUrl) {
  // Extract just the filename from the cloud URL
  const urlParts = cloudUrl.split('/');
  const filename = urlParts[urlParts.length - 1];
  return `/uploads/${filename}`;
}

/**
 * Import file metadata into local database
 */
async function importFileMetadata() {
  console.log('🚀 Starting file metadata import...\n');
  console.log(`📡 Fetching file metadata from: ${STRAPI_URL}`);
  console.log(`💾 Importing into: ${DB_PATH}\n`);
  
  try {
    // Fetch all files from Strapi Cloud
    const response = await fetchFromStrapi('/api/upload/files?pagination[limit]=1000');
    const files = response.data || response;
    
    if (!Array.isArray(files) || files.length === 0) {
      console.log('⚠️  No files found in Strapi Cloud');
      return;
    }
    
    console.log(`📦 Found ${files.length} files to import\n`);
    
    // Open database connection
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('❌ Failed to connect to database:', err.message);
        process.exit(1);
      }
    });
    
    // Prepare insert statement
    const insertStmt = db.prepare(`
      INSERT INTO files (
        document_id, name, alternative_text, caption, width, height, 
        formats, hash, ext, mime, size, url, preview_url, provider, 
        provider_metadata, folder_path, created_at, updated_at, 
        published_at, created_by_id, updated_by_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Begin transaction
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const attrs = file.attributes || file;
        
        try {
          // Convert cloud URL to local URL
          const localUrl = convertToLocalUrl(attrs.url);
          
          // Convert formats to use local URLs
          let formats = null;
          if (attrs.formats) {
            formats = JSON.parse(JSON.stringify(attrs.formats));
            for (const key in formats) {
              if (formats[key].url) {
                formats[key].url = convertToLocalUrl(formats[key].url);
              }
            }
          }
          
          insertStmt.run(
            file.id || null,                          // document_id
            attrs.name || '',                         // name
            attrs.alternativeText || null,            // alternative_text
            attrs.caption || null,                    // caption
            attrs.width || null,                      // width
            attrs.height || null,                     // height
            formats ? JSON.stringify(formats) : null, // formats
            attrs.hash || '',                         // hash
            attrs.ext || '',                          // ext
            attrs.mime || '',                         // mime
            attrs.size || 0,                          // size
            localUrl,                                 // url (converted to local)
            attrs.previewUrl || null,                 // preview_url
            'local',                                  // provider (changed to local)
            null,                                     // provider_metadata
            attrs.folderPath || '/',                  // folder_path
            attrs.createdAt || new Date().toISOString(), // created_at
            attrs.updatedAt || new Date().toISOString(), // updated_at
            attrs.publishedAt || new Date().toISOString(), // published_at
            attrs.createdBy?.id || null,              // created_by_id
            attrs.updatedBy?.id || null               // updated_by_id
          );
          
          console.log(`[${i + 1}/${files.length}] ✅ Imported: ${attrs.name}`);
          console.log(`   Cloud: ${attrs.url}`);
          console.log(`   Local: ${localUrl}\n`);
          successCount++;
          
        } catch (error) {
          console.error(`[${i + 1}/${files.length}] ❌ Failed: ${attrs.name || 'Unknown'}`);
          console.error(`   Error: ${error.message}\n`);
          errorCount++;
        }
      }
      
      insertStmt.finalize();
      
      db.run('COMMIT', (err) => {
        if (err) {
          console.error('\n❌ Failed to commit transaction:', err.message);
          db.run('ROLLBACK');
          db.close();
          process.exit(1);
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('📊 Import Summary:');
        console.log(`   ✅ Successful: ${successCount}`);
        console.log(`   ❌ Failed: ${errorCount}`);
        console.log(`   📁 Total: ${files.length}`);
        console.log('='.repeat(60));
        console.log('\n✨ Import complete!');
        console.log('\n📝 Next steps:');
        console.log('   1. Verify files in database: sqlite3 .tmp/data.db "SELECT COUNT(*) FROM files;"');
        console.log('   2. Start your Strapi backend: npm run dev');
        console.log('   3. Check admin panel: http://localhost:1337/admin');
        
        db.close();
      });
    });
    
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
importFileMetadata();

