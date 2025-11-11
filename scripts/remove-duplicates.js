/**
 * Remove duplicate content entries (keep newest)
 */

const pg = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set!');
  process.exit(1);
}

async function removeDuplicates() {
  const client = new pg.Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    const tables = ['products', 'categories', 'recipes', 'courses', 'blogs', 'menus'];

    for (const table of tables) {
      console.log(`🔍 Checking ${table} for duplicates...\n`);

      // Find duplicates by slug or name
      const dupQuery = `
        SELECT slug, COUNT(*) as count, STRING_AGG(id::text, ', ') as ids
        FROM ${table}
        WHERE slug IS NOT NULL
        GROUP BY slug
        HAVING COUNT(*) > 1
        ORDER BY COUNT(*) DESC;
      `;

      const dupResult = await client.query(dupQuery);

      if (dupResult.rows.length > 0) {
        console.log(`  Found ${dupResult.rows.length} duplicate slugs:\n`);

        for (const dup of dupResult.rows) {
          const ids = dup.ids.split(', ').map(Number);
          const keepId = Math.max(...ids); // Keep the newest (highest ID)
          const deleteIds = ids.filter(id => id !== keepId);

          console.log(`  "${dup.slug}": ${dup.count} copies (IDs: ${dup.ids})`);
          console.log(`    Keeping: ${keepId}, Deleting: ${deleteIds.join(', ')}`);

          // Delete old duplicates
          for (const delId of deleteIds) {
            await client.query(`DELETE FROM ${table} WHERE id = $1`, [delId]);
          }
        }
        console.log('');
      } else {
        console.log(`  ✅ No duplicates found\n`);
      }
    }

    console.log('✅ Duplicate removal complete!\n');
    console.log('🔍 Refresh your content to verify');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await client.end();
  }
}

removeDuplicates();

