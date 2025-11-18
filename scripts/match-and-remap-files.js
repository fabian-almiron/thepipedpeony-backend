/**
 * Match old file records to new uploaded files by name/hash
 * and update all relationships
 */

const pg = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set!');
  console.log('Run: railway run node scripts/match-and-remap-files.js');
  process.exit(1);
}

async function matchAndRemap() {
  const client = new pg.Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    console.log('🔍 Finding matches between old and new files...\n');

    // Match by hash (most reliable) or by extracting base filename
    const matchQuery = `
      WITH old_files AS (
        SELECT id, name, hash, url
        FROM files
        WHERE url LIKE '%strapi%' OR url LIKE '%dazzling-friends%'
      ),
      new_files AS (
        SELECT id, name, hash, url
        FROM files
        WHERE url NOT LIKE '%strapi%' AND url NOT LIKE '%dazzling-friends%'
          AND url NOT LIKE 'http%' -- exclude old external URLs
      )
      SELECT 
        old_files.id as old_id,
        old_files.name as old_name,
        new_files.id as new_id,
        new_files.name as new_name,
        CASE 
          WHEN old_files.hash = new_files.hash THEN 'hash_match'
          ELSE 'name_match'
        END as match_type
      FROM old_files
      LEFT JOIN new_files ON (
        old_files.hash = new_files.hash
        OR new_files.name LIKE '%' || REPLACE(REPLACE(old_files.name, '.jpg', '%'), '.png', '%')
      )
      WHERE new_files.id IS NOT NULL
      ORDER BY old_files.id;
    `;
    
    const matchResult = await client.query(matchQuery);
    
    if (matchResult.rows.length === 0) {
      console.log('❌ No matches found! Files might have different names.');
      await client.end();
      return;
    }

    console.log(`Found ${matchResult.rows.length} matches:\n`);
    matchResult.rows.slice(0, 10).forEach(row => {
      console.log(`  ${row.old_id} → ${row.new_id}: ${row.old_name} (${row.match_type})`);
    });
    if (matchResult.rows.length > 10) {
      console.log(`  ... and ${matchResult.rows.length - 10} more\n`);
    }

    // Step 2: Update all file relationships
    console.log('\n🔗 Updating file relationships...\n');
    
    let totalUpdated = 0;
    
    for (const match of matchResult.rows) {
      const result = await client.query(`
        UPDATE files_related_mph 
        SET file_id = $1 
        WHERE file_id = $2
      `, [match.new_id, match.old_id]);
      
      if (result.rowCount > 0) {
        console.log(`  Updated ${result.rowCount} relations: ${match.old_name}`);
        totalUpdated += result.rowCount;
      }
    }

    console.log(`\n✅ Updated ${totalUpdated} total relationships\n`);

    // Step 3: Delete old file records
    console.log('🗑️  Deleting old file records (keeping new ones)...\n');
    
    const oldIds = matchResult.rows.map(r => r.old_id).join(',');
    const deleteResult = await client.query(`
      DELETE FROM files 
      WHERE id IN (${oldIds})
    `);

    console.log(`✅ Deleted ${deleteResult.rowCount} old file records\n`);

    console.log('✅ Complete! All relationships remapped.\n');
    console.log('🔍 Check your products - images should now appear!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await client.end();
  }
}

matchAndRemap();

