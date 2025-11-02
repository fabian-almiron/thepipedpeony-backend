const https = require('https');
const { Client } = require('pg');

// Configuration
const STRAPI_URL = 'https://dazzling-friends-80757c9c53.strapiapp.com';
const API_TOKEN = 'a674555034857562b9ed526bc9432f780ec36df3ba0acd4c6e1996edfdde8e2dca30e933bbca48cb0d32d706e021322aa1acfeec3e74c8aae1935d857e25a43eb2d3134c68d4aedfa74c1d39886a9ecc5fd875bfa7916c983862789480e55a992de4932e461851057a3f04c7cfa0a0909a478462958735bd281b55e0280cc458';
const DATABASE_URL = 'postgresql://mac@localhost:5432/strapi_db';

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
 * Import file metadata into PostgreSQL database
 */
async function importFileMetadata() {
  console.log('🚀 Starting file metadata import to PostgreSQL...\n');
  console.log(`📡 Fetching file metadata from: ${STRAPI_URL}`);
  console.log(`💾 Importing into PostgreSQL: ${DATABASE_URL}\n`);
  
  const client = new Client({
    connectionString: DATABASE_URL,
  });
  
  try {
    // Connect to database
    await client.connect();
    console.log('✅ Connected to PostgreSQL database\n');
    
    // Check current file count
    const countResult = await client.query('SELECT COUNT(*) FROM files');
    const currentCount = parseInt(countResult.rows[0].count);
    console.log(`📊 Current files in database: ${currentCount}\n`);
    
    // Fetch all files from Strapi Cloud
    const response = await fetchFromStrapi('/api/upload/files?pagination[limit]=1000');
    const files = response.data || response;
    
    if (!Array.isArray(files) || files.length === 0) {
      console.log('⚠️  No files found in Strapi Cloud');
      await client.end();
      return;
    }
    
    console.log(`📦 Found ${files.length} files to import\n`);
    
    // Start transaction
    await client.query('BEGIN');
    
    let successCount = 0;
    let errorCount = 0;
    let updateCount = 0;
    let insertCount = 0;
    
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
        
        // Check if file already exists
        const existingFile = await client.query(
          'SELECT id FROM files WHERE hash = $1 OR name = $2',
          [attrs.hash, attrs.name]
        );
        
        if (existingFile.rows.length > 0) {
          // Update existing file
          await client.query(`
            UPDATE files SET
              url = $1,
              provider = $2,
              formats = $3,
              updated_at = $4
            WHERE id = $5
          `, [
            localUrl,
            'local',
            formats ? JSON.stringify(formats) : null,
            new Date(),
            existingFile.rows[0].id
          ]);
          
          console.log(`[${i + 1}/${files.length}] 🔄 Updated: ${attrs.name}`);
          console.log(`   Cloud: ${attrs.url}`);
          console.log(`   Local: ${localUrl}\n`);
          updateCount++;
        } else {
          // Insert new file
          await client.query(`
            INSERT INTO files (
              document_id, name, alternative_text, caption, width, height,
              formats, hash, ext, mime, size, url, preview_url, provider,
              provider_metadata, folder_path, created_at, updated_at,
              published_at, created_by_id, updated_by_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
          `, [
            file.id || null,
            attrs.name || '',
            attrs.alternativeText || null,
            attrs.caption || null,
            attrs.width || null,
            attrs.height || null,
            formats ? JSON.stringify(formats) : null,
            attrs.hash || '',
            attrs.ext || '',
            attrs.mime || '',
            attrs.size || 0,
            localUrl,
            attrs.previewUrl || null,
            'local',
            null,
            attrs.folderPath || '/',
            attrs.createdAt || new Date().toISOString(),
            attrs.updatedAt || new Date().toISOString(),
            attrs.publishedAt || new Date().toISOString(),
            attrs.createdBy?.id || null,
            attrs.updatedBy?.id || null
          ]);
          
          console.log(`[${i + 1}/${files.length}] ✅ Inserted: ${attrs.name}`);
          console.log(`   Cloud: ${attrs.url}`);
          console.log(`   Local: ${localUrl}\n`);
          insertCount++;
        }
        
        successCount++;
        
      } catch (error) {
        console.error(`[${i + 1}/${files.length}] ❌ Failed: ${attrs.name || 'Unknown'}`);
        console.error(`   Error: ${error.message}\n`);
        errorCount++;
      }
    }
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 Import Summary:');
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   🔄 Updated: ${updateCount}`);
    console.log(`   ➕ Inserted: ${insertCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    console.log(`   📁 Total: ${files.length}`);
    console.log('='.repeat(60));
    console.log('\n✨ Import complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Restart Strapi: Stop the server (Ctrl+C) and run "npm run dev"');
    console.log('   2. Check admin panel: http://localhost:1337/admin');
    console.log('   3. Copy a file URL - it should now be local!');
    
  } catch (error) {
    // Rollback on error
    await client.query('ROLLBACK');
    console.error('\n❌ Error:');
    console.error(error.message);
    
    if (error.message.includes('401') || error.message.includes('403')) {
      console.error('\n⚠️  Authentication failed. Please check your API token.');
    }
    
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the script
importFileMetadata();

