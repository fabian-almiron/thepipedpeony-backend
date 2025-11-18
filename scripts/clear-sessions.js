/**
 * Clear old sessions to fix login duplicate key error
 */

const pg = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set!');
  process.exit(1);
}

async function clearSessions() {
  const client = new pg.Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    console.log('🗑️  Clearing old sessions...\n');

    const result = await client.query('DELETE FROM strapi_sessions');
    
    console.log(`✅ Deleted ${result.rowCount} sessions\n`);
    console.log('✅ You can now log in again!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

clearSessions();

