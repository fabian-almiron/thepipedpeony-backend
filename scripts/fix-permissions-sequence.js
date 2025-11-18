/**
 * Fix PostgreSQL sequences for admin permissions
 * This script resets the auto-increment sequences to match the actual data
 * Run this when you get "duplicate key value violates unique constraint" errors
 */

const { Client } = require('pg');

async function fixSequences() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Fix admin_permissions sequence
    console.log('Fixing admin_permissions sequence...');
    await client.query(`
      SELECT setval(
        'admin_permissions_id_seq', 
        COALESCE((SELECT MAX(id) FROM admin_permissions), 1),
        true
      );
    `);
    console.log('✓ Fixed admin_permissions sequence');

    // Fix admin_permissions_role_lnk sequence
    console.log('Fixing admin_permissions_role_lnk sequence...');
    await client.query(`
      SELECT setval(
        'admin_permissions_role_lnk_id_seq', 
        COALESCE((SELECT MAX(id) FROM admin_permissions_role_lnk), 1),
        true
      );
    `);
    console.log('✓ Fixed admin_permissions_role_lnk sequence');

    // Fix other common sequences
    console.log('Fixing other admin sequences...');
    
    const sequences = [
      'admin_users_id_seq',
      'admin_roles_id_seq',
      'strapi_api_tokens_id_seq',
      'strapi_transfer_tokens_id_seq'
    ];

    for (const seq of sequences) {
      const tableName = seq.replace('_id_seq', '');
      try {
        await client.query(`
          SELECT setval(
            '${seq}', 
            COALESCE((SELECT MAX(id) FROM ${tableName}), 1),
            true
          );
        `);
        console.log(`✓ Fixed ${seq}`);
      } catch (err) {
        console.log(`- Skipped ${seq} (might not exist)`);
      }
    }

    console.log('\n✅ All sequences fixed successfully!');
    console.log('You can now restart your Strapi application.');

  } catch (error) {
    console.error('❌ Error fixing sequences:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the fix
fixSequences();

