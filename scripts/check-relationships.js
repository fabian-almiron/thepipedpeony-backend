/**
 * Check relationship tables for missing data
 */

const pg = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set!');
  process.exit(1);
}

async function checkRelationships() {
  const client = new pg.Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Check various relationship tables
    const tables = [
      'categories_course_lnk',
      'categories_courses_lnk',
      'products_category_lnk',
      'recipes_categories_lnk',
      'menu_items_menu_lnk',
    ];

    console.log('📊 Relationship table status:\n');

    for (const table of tables) {
      try {
        const result = await client.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`  ${table}: ${result.rows[0].count} relationships`);
      } catch (err) {
        console.log(`  ${table}: ERROR - ${err.message}`);
      }
    }

    // Count actual content
    console.log('\n📊 Content counts:\n');
    
    const contentTables = ['categories', 'courses', 'products', 'recipes', 'menus', 'menu_items'];
    
    for (const table of contentTables) {
      const result = await client.query(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`  ${table}: ${result.rows[0].count}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkRelationships();

