/**
 * Script to remap old file IDs to new file IDs after re-upload
 * This fixes broken image relationships in products, recipes, etc.
 */

const pg = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set!');
  console.log('Run: railway run node scripts/remap-file-ids.js');
  process.exit(1);
}

async function remapFileIds() {
  const client = new pg.Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Step 1: Create a mapping of hash -> new ID
    console.log('📊 Building file ID mapping...\n');
    
    const mappingQuery = `
      SELECT 
        f_old.id as old_id,
        f_old.hash as file_hash,
        f_old.name as old_name,
        f_new.id as new_id,
        f_new.name as new_name,
        f_new.created_at as new_created
      FROM files f_old
      LEFT JOIN files f_new ON f_old.hash = f_new.hash AND f_new.created_at > '2025-11-11 19:00:00'
      WHERE f_old.created_at < '2025-11-11 19:00:00'
        AND f_new.id IS NOT NULL
        AND f_old.id != f_new.id
      ORDER BY f_old.id;
    `;
    
    const mappingResult = await client.query(mappingQuery);
    
    if (mappingResult.rows.length === 0) {
      console.log('ℹ️  No file ID remapping needed (or files already matched)');
      await client.end();
      return;
    }
    
    console.log(`Found ${mappingResult.rows.length} files to remap:\n`);
    mappingResult.rows.slice(0, 5).forEach(row => {
      console.log(`  ${row.old_id} → ${row.new_id} : ${row.old_name}`);
    });
    if (mappingResult.rows.length > 5) {
      console.log(`  ... and ${mappingResult.rows.length - 5} more\n`);
    }

    // Step 2: Update files_related_mph table (main relationship table)
    console.log('\n🔗 Updating file relationships...\n');
    
    let totalUpdated = 0;
    
    for (const mapping of mappingResult.rows) {
      const updateResult = await client.query(`
        UPDATE files_related_mph 
        SET file_id = $1 
        WHERE file_id = $2
      `, [mapping.new_id, mapping.old_id]);
      
      if (updateResult.rowCount > 0) {
        console.log(`  Updated ${updateResult.rowCount} relations for: ${mapping.old_name}`);
        totalUpdated += updateResult.rowCount;
      }
    }

    console.log(`\n✅ Updated ${totalUpdated} file relationships`);

    // Step 3: Check for other potential file reference tables
    const tablesWithFileRefs = [
      'products_cmps',
      'components_product_product_tabs_cmps',
      'files_folder_lnk'
    ];

    for (const tableName of tablesWithFileRefs) {
      try {
        // Check if table has file_id column
        const checkColumn = await client.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = $1 AND column_name = 'file_id'
        `, [tableName]);

        if (checkColumn.rows.length > 0) {
          let tableUpdated = 0;
          for (const mapping of mappingResult.rows) {
            const updateResult = await client.query(`
              UPDATE ${tableName} 
              SET file_id = $1 
              WHERE file_id = $2
            `, [mapping.new_id, mapping.old_id]);
            tableUpdated += updateResult.rowCount;
          }
          if (tableUpdated > 0) {
            console.log(`  Updated ${tableUpdated} references in ${tableName}`);
          }
        }
      } catch (err) {
        // Table might not exist, skip
      }
    }

    console.log('\n✅ File ID remapping complete!');
    console.log('\n🔍 Refresh your products/recipes to see images restored');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

remapFileIds();

