/**
 * Complete solution: Restore file relationships from backup and remap IDs
 * This fixes broken image connections in products, recipes, etc.
 */

const pg = require('pg');
const { execSync } = require('child_process');
const fs = require('fs');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set!');
  console.log('Run: railway run node scripts/restore-and-remap-images.js');
  process.exit(1);
}

async function restoreAndRemap() {
  const client = new pg.Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Step 1: Build mapping of old file IDs to new file IDs
    console.log('📊 Step 1: Building file ID mapping...\n');
    
    const mappingQuery = `
      WITH old_files AS (
        SELECT id, hash, name, created_at
        FROM files
        WHERE created_at < '2025-11-11 19:00:00'
      ),
      new_files AS (
        SELECT id, hash, name, created_at
        FROM files
        WHERE created_at >= '2025-11-11 19:00:00'
      )
      SELECT 
        old_files.id as old_id,
        old_files.hash,
        old_files.name as old_name,
        new_files.id as new_id,
        new_files.name as new_name
      FROM old_files
      INNER JOIN new_files ON old_files.hash = new_files.hash
      WHERE old_files.id != new_files.id
      ORDER BY old_files.id;
    `;
    
    const mappingResult = await client.query(mappingQuery);
    
    console.log(`Found ${mappingResult.rows.length} file mappings:\n`);
    mappingResult.rows.slice(0, 5).forEach(row => {
      console.log(`  ID ${row.old_id} → ${row.new_id} : ${row.old_name}`);
    });
    if (mappingResult.rows.length > 5) {
      console.log(`  ... and ${mappingResult.rows.length - 5} more\n`);
    }

    // Create a map for quick lookup
    const idMap = {};
    mappingResult.rows.forEach(row => {
      idMap[row.old_id] = row.new_id;
    });

    // Step 2: Update files_related_mph relationships
    console.log('\n🔗 Step 2: Updating file relationships...\n');
    
    let updated = 0;
    
    for (const [oldId, newId] of Object.entries(idMap)) {
      const updateResult = await client.query(`
        UPDATE files_related_mph 
        SET file_id = $1 
        WHERE file_id = $2
      `, [newId, oldId]);
      
      updated += updateResult.rowCount;
    }

    console.log(`✅ Updated ${updated} file relationships in files_related_mph`);

    // Step 3: Delete old duplicate files (keep only new ones)
    console.log('\n🗑️  Step 3: Cleaning up old duplicate file records...\n');
    
    const oldIds = Object.keys(idMap).join(',');
    if (oldIds) {
      const deleteResult = await client.query(`
        DELETE FROM files 
        WHERE id IN (${oldIds})
      `);
      
      console.log(`✅ Removed ${deleteResult.rowCount} old duplicate file records`);
    }

    console.log('\n✅ Complete! Image relationships restored.\n');
    console.log('🔍 Check your products and recipes - images should be back!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

restoreAndRemap();

