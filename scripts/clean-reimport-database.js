/**
 * Clean re-import: Delete all content and re-import from backup
 * Keeps: admin users, API tokens, Strapi system tables
 * Deletes: products, recipes, blogs, courses, categories, files, menus
 */

const pg = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set!');
  console.log('Run: railway run node scripts/clean-reimport-database.js');
  process.exit(1);
}

async function cleanDatabase() {
  const client = new pg.Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    console.log('🗑️  Deleting content (keeping admin users and system tables)...\n');

    // List of content tables to clear
    const contentTables = [
      // Main content
      'products', 'recipes', 'blogs', 'courses', 'categories', 
      'menus', 'menu_items', 'subscriptions',
      
      // Files
      'files', 'upload_folders',
      
      // Component tables
      'components_product_accordion_items',
      'components_product_product_tabs',
      
      // Relationship tables
      'files_related_mph',
      'files_folder_lnk',
      'products_cmps',
      'products_category_lnk',
      'recipes_categories_lnk',
      'categories_course_lnk',
      'categories_courses_lnk',
      'menu_items_menu_lnk',
      'menu_items_parent_lnk',
      'upload_folders_parent_lnk',
      'components_product_product_tabs_cmps',
    ];

    let totalDeleted = 0;

    for (const table of contentTables) {
      try {
        const result = await client.query(`DELETE FROM ${table}`);
        console.log(`  ✅ Cleared ${table}: ${result.rowCount} rows`);
        totalDeleted += result.rowCount;
      } catch (err) {
        console.log(`  ⚠️  ${table}: ${err.message}`);
      }
    }

    console.log(`\n✅ Deleted ${totalDeleted} total rows\n`);
    console.log('✅ Database cleaned! Ready for re-import.\n');
    console.log('🔜 Next: Run the database import from your terminal:');
    console.log('   cd /Users/mac/.cursor/worktrees/pp-back-end/5kCSU');
    console.log('   gunzip -c strapi_db_import.sql.gz | railway connect Postgres');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

cleanDatabase();

