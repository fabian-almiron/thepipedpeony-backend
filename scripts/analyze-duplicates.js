/**
 * Analyze duplicate files and show exact matching status
 */

const pg = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set!');
  process.exit(1);
}

async function analyzeDuplicates() {
  const client = new pg.Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Find files uploaded multiple times
    const dupsQuery = `
      SELECT hash, COUNT(*) as count, 
             STRING_AGG(id::text || ':' || name, ', ') as files
      FROM files
      WHERE url NOT LIKE '%strapi%' AND url NOT LIKE '%dazzling-friends%'
      GROUP BY hash
      HAVING COUNT(*) > 1
      ORDER BY COUNT(*) DESC
      LIMIT 10;
    `;
    
    const dupsResult = await client.query(dupsQuery);
    
    if (dupsResult.rows.length > 0) {
      console.log('⚠️  Duplicate files found:\n');
      dupsResult.rows.forEach(row => {
        console.log(`  Hash ${row.hash.substring(0, 20)}... uploaded ${row.count} times`);
        console.log(`    Files: ${row.files}\n`);
      });
    }

    // Find old files that need matching
    const oldFilesQuery = `
      SELECT id, name, hash, url
      FROM files
      WHERE url LIKE '%strapi%' OR url LIKE '%dazzling-friends%'
      ORDER BY id
      LIMIT 10;
    `;
    
    const oldResult = await client.query(oldFilesQuery);
    
    console.log('\n📋 Old files needing matches (first 10):\n');
    for (const oldFile of oldResult.rows) {
      // Try to find exact hash match
      const matchQuery = `
        SELECT id, name, hash, url
        FROM files
        WHERE hash = $1
          AND url NOT LIKE '%strapi%' 
          AND url NOT LIKE '%dazzling-friends%'
        LIMIT 1;
      `;
      
      const matchResult = await client.query(matchQuery, [oldFile.hash]);
      
      if (matchResult.rows.length > 0) {
        console.log(`  ✅ ID ${oldFile.id}: ${oldFile.name}`);
        console.log(`     → Matches ID ${matchResult.rows[0].id}: ${matchResult.rows[0].name}`);
      } else {
        console.log(`  ❌ ID ${oldFile.id}: ${oldFile.name} - NO MATCH FOUND`);
      }
    }

    console.log('\n💡 Recommendation:');
    if (dupsResult.rows.length > 0) {
      console.log('   1. Clean up duplicate files in Media Library');
      console.log('   2. Re-run the matching script');
    } else {
      console.log('   The files might not have been uploaded yet, or have different hashes.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

analyzeDuplicates();

