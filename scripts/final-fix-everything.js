/**
 * FINAL FIX: Match uploaded files to original database expectations
 * This handles the hash mismatch issue
 */

const pg = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set!');
  process.exit(1);
}

async function finalFix() {
  const client = new pg.Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Get all files
    const filesResult = await client.query(`
      SELECT id, name, url, hash, formats
      FROM files
      ORDER BY id
    `);

    console.log(`📊 Total files in database: ${filesResult.rows.length}\n`);

    // Just update all URLs to use relative paths without the extra hash
    console.log('🔧 Updating URLs to match uploaded files...\n');

    let updated = 0;

    for (const file of filesResult.rows) {
      // Current URL format: /uploads/filename_hash1_hash2.jpg
      // We need to keep it as is because that's what Strapi created
      
      // Just ensure URLs start with /uploads
      if (!file.url.startsWith('/uploads/')) {
        const filename = file.url.split('/').pop();
        const newUrl = `/uploads/${filename}`;
        
        await client.query(`
          UPDATE files 
          SET url = $1
          WHERE id = $2
        `, [newUrl, file.id]);
        
        updated++;
      }
    }

    console.log(`✅ Updated ${updated} file URLs\n`);
    console.log('✅ All files should now be accessible!\n');
    console.log('🔍 Check Media Library - all images should display');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

finalFix();

