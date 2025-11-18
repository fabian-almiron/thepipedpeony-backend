/**
 * Match files by extracting base filename (ignoring Strapi's hash suffix)
 * Example: "chocolate-cake-recipe.png" matches "chocolate_cake_recipe_abc123.png"
 */

const pg = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set!');
  process.exit(1);
}

// Helper to extract base filename without hash
function getBaseName(filename) {
  // Remove file extension
  let base = filename.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
  
  // Remove Strapi hash suffix (e.g., _abc123def456)
  base = base.replace(/_[a-f0-9]{10,}$/i, '');
  
  // Normalize: replace - with _, remove special chars, lowercase
  base = base.toLowerCase()
    .replace(/-/g, '_')
    .replace(/[^a-z0-9_]/g, '');
  
  return base;
}

async function matchByFilename() {
  const client = new pg.Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Get old files
    const oldFilesResult = await client.query(`
      SELECT id, name, hash, url
      FROM files
      WHERE url LIKE '%strapi%' OR url LIKE '%dazzling-friends%'
      ORDER BY id
    `);

    // Get new files
    const newFilesResult = await client.query(`
      SELECT id, name, hash, url
      FROM files
      WHERE url NOT LIKE '%strapi%' 
        AND url NOT LIKE '%dazzling-friends%'
        AND url NOT LIKE 'http%'
      ORDER BY id
    `);

    console.log(`Old files: ${oldFilesResult.rows.length}`);
    console.log(`New files: ${newFilesResult.rows.length}\n`);

    // Build mapping
    const matches = [];
    const oldFiles = oldFilesResult.rows;
    const newFiles = newFilesResult.rows;

    console.log('🔍 Matching files by base filename...\n');

    for (const oldFile of oldFiles) {
      const oldBase = getBaseName(oldFile.name);
      
      // Find first matching new file
      const newFile = newFiles.find(nf => {
        const newBase = getBaseName(nf.name);
        return newBase === oldBase;
      });

      if (newFile) {
        matches.push({
          old_id: oldFile.id,
          old_name: oldFile.name,
          new_id: newFile.id,
          new_name: newFile.name,
          base: oldBase
        });
        console.log(`  ✅ ${oldFile.id} → ${newFile.id}: ${oldFile.name}`);
      } else {
        console.log(`  ❌ ${oldFile.id}: ${oldFile.name} - NO MATCH (base: ${oldBase})`);
      }
    }

    console.log(`\n📊 Found ${matches.length} matches out of ${oldFiles.length} old files\n`);

    if (matches.length === 0) {
      console.log('❌ No matches found. Files might have completely different names.');
      await client.end();
      return;
    }

    // Ask to proceed
    console.log('Would you like to:');
    console.log('  1. Update relationships with these matches');
    console.log('  2. Show detailed comparison first\n');
    console.log('This script is read-only. Run match-and-update-by-filename.js to apply changes.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

matchByFilename();

