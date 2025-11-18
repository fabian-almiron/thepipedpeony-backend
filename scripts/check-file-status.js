/**
 * Check the current state of files in the database
 */

const pg = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set!');
  process.exit(1);
}

async function checkFiles() {
  const client = new pg.Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Count total files
    const countResult = await client.query('SELECT COUNT(*) as count FROM files');
    console.log(`📊 Total files in database: ${countResult.rows[0].count}\n`);

    // Show files by date
    const filesQuery = `
      SELECT 
        id, 
        name, 
        hash,
        url,
        created_at,
        CASE 
          WHEN url LIKE '%strapi%cloud%' OR url LIKE '%dazzling-friends%' THEN 'OLD (Strapi Cloud)'
          WHEN url LIKE '%railway%' THEN 'NEW (Railway)'
          ELSE 'Local'
        END as source
      FROM files 
      ORDER BY id
      LIMIT 20;
    `;
    
    const filesResult = await client.query(filesQuery);
    
    console.log('📁 First 20 files:\n');
    filesResult.rows.forEach(row => {
      const date = new Date(row.created_at).toISOString().substring(0, 16);
      console.log(`  ID ${row.id}: ${row.name.substring(0, 40)} - ${row.source} (${date})`);
    });

    // Count by source
    const sourceQuery = `
      SELECT 
        CASE 
          WHEN url LIKE '%strapi%cloud%' OR url LIKE '%dazzling-friends%' THEN 'Strapi Cloud'
          WHEN url LIKE '%railway%' THEN 'Railway'
          ELSE 'Other'
        END as source,
        COUNT(*) as count
      FROM files
      GROUP BY source;
    `;
    
    const sourceResult = await client.query(sourceQuery);
    
    console.log('\n📊 Files by source:\n');
    sourceResult.rows.forEach(row => {
      console.log(`  ${row.source}: ${row.count} files`);
    });

    // Check if any products have image relationships
    const relQuery = `
      SELECT COUNT(*) as count 
      FROM files_related_mph 
      WHERE related_type = 'api::product.product';
    `;
    
    const relResult = await client.query(relQuery);
    console.log(`\n🔗 Product image relationships: ${relResult.rows[0].count}\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

checkFiles();

