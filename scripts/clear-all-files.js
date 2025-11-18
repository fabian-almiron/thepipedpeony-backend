/**
 * Clear all files and file relationships
 * Fresh start for uploads
 */

const pg = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set!');
  process.exit(1);
}

async function clearFiles() {
  const client = new pg.Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    console.log('🗑️  Clearing all files and file relationships...\n');

    // Clear relationships first (foreign keys)
    const relResult = await client.query('DELETE FROM files_related_mph');
    console.log(`✅ Deleted ${relResult.rowCount} file relationships`);

    const folderLinkResult = await client.query('DELETE FROM files_folder_lnk');
    console.log(`✅ Deleted ${folderLinkResult.rowCount} file-folder links`);

    // Clear files
    const filesResult = await client.query('DELETE FROM files');
    console.log(`✅ Deleted ${filesResult.rowCount} file records`);

    // Clear folders
    const foldersResult = await client.query('DELETE FROM upload_folders');
    console.log(`✅ Deleted ${foldersResult.rowCount} folders\n`);

    console.log('✅ All files cleared!\n');
    console.log('🔜 Next steps:');
    console.log('   1. Refresh Media Library - should be empty');
    console.log('   2. Upload files through Strapi UI');
    console.log('   3. Manually assign images to products/recipes/courses');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

clearFiles();

