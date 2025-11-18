/**
 * Script to update file URLs from old Strapi Cloud to Railway
 * Run with: node scripts/fix-file-urls.js
 */

const pg = require('pg');

// Railway DATABASE_URL from environment
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set!');
  console.log('Run: railway run node scripts/fix-file-urls.js');
  process.exit(1);
}

const oldBaseUrl = 'https://dazzling-friends-80757c9c53.media.strapiapp.com';
const newBaseUrl = 'https://railwayapp-strapi-production-b4af.up.railway.app';

async function updateFileUrls() {
  const client = new pg.Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Update main files table
    const filesResult = await client.query(`
      UPDATE files 
      SET url = REPLACE(url, $1, $2)
      WHERE url LIKE $3
      RETURNING id, name, url
    `, [oldBaseUrl, newBaseUrl, `${oldBaseUrl}%`]);

    console.log(`\n📝 Updated ${filesResult.rowCount} files in 'files' table:`);
    filesResult.rows.forEach((row, i) => {
      if (i < 5) { // Show first 5
        console.log(`   ${row.name}: ${row.url}`);
      }
    });
    if (filesResult.rowCount > 5) {
      console.log(`   ... and ${filesResult.rowCount - 5} more`);
    }

    // Also update formats column (contains thumbnails, medium, small sizes)
    const formatsResult = await client.query(`
      UPDATE files 
      SET formats = REPLACE(formats::text, $1, $2)::jsonb
      WHERE formats::text LIKE $3
      RETURNING id, name
    `, [oldBaseUrl, newBaseUrl, `%${oldBaseUrl}%`]);

    console.log(`\n🖼️  Updated ${formatsResult.rowCount} file formats (thumbnails, etc.)`);

    console.log('\n✅ Migration complete!');
    console.log('\n🔍 Verify by checking Media Library in admin panel');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

updateFileUrls();

