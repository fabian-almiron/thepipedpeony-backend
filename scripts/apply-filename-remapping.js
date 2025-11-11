/**
 * Apply filename-based remapping to fix image relationships
 */

const pg = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set!');
  process.exit(1);
}

function getBaseName(filename) {
  let base = filename.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
  base = base.replace(/_[a-f0-9]{10,}$/i, '');
  base = base.toLowerCase()
    .replace(/-/g, '_')
    .replace(/[^a-z0-9_]/g, '');
  return base;
}

async function applyRemapping() {
  const client = new pg.Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Get old and new files
    const oldFilesResult = await client.query(`
      SELECT id, name, hash, url
      FROM files
      WHERE url LIKE '%strapi%' OR url LIKE '%dazzling-friends%'
      ORDER BY id
    `);

    const newFilesResult = await client.query(`
      SELECT id, name, hash, url
      FROM files
      WHERE url NOT LIKE '%strapi%' 
        AND url NOT LIKE '%dazzling-friends%'
        AND url NOT LIKE 'http%'
      ORDER BY id
    `);

    const oldFiles = oldFilesResult.rows;
    const newFiles = newFilesResult.rows;
    
    console.log('🔍 Matching and updating...\n');

    let matched = 0;
    let updated = 0;

    for (const oldFile of oldFiles) {
      const oldBase = getBaseName(oldFile.name);
      
      const newFile = newFiles.find(nf => {
        const newBase = getBaseName(nf.name);
        return newBase === oldBase;
      });

      if (newFile) {
        matched++;
        
        // Update relationships
        const result = await client.query(`
          UPDATE files_related_mph 
          SET file_id = $1 
          WHERE file_id = $2
        `, [newFile.id, oldFile.id]);
        
        if (result.rowCount > 0) {
          console.log(`  ✅ ${oldFile.id} → ${newFile.id}: ${oldFile.name} (${result.rowCount} relations)`);
          updated += result.rowCount;
        }
      }
    }

    console.log(`\n📊 Matched ${matched} files`);
    console.log(`✅ Updated ${updated} relationships\n`);

    // Delete old file records
    console.log('🗑️  Cleaning up old file records...\n');
    
    const deleteResult = await client.query(`
      DELETE FROM files 
      WHERE url LIKE '%strapi%' OR url LIKE '%dazzling-friends%'
    `);

    console.log(`✅ Deleted ${deleteResult.rowCount} old file records\n`);
    console.log('✅ Complete! Products should now show images.\n');
    console.log('🔍 Refresh your products page to verify!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await client.end();
  }
}

applyRemapping();

