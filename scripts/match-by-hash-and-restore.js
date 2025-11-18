/**
 * Match files by hash and restore all relationships
 */

const pg = require('pg');
const { execSync } = require('child_process');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set!');
  process.exit(1);
}

async function matchAndRestore() {
  const client = new pg.Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Step 1: Extract file data from backup
    console.log('📦 Extracting file data from backup...\n');
    
    const backupFiles = execSync(
      'cd /Users/mac/.cursor/worktrees/pp-back-end/5kCSU && gunzip -c strapi_db_import.sql.gz | awk \'/COPY public.files \\(/,/^\\\\\\\\.$/\'',
      { encoding: 'utf-8' }
    );

    // Parse: column 1 = id, column 9 = hash
    const oldHashToId = {};
    const lines = backupFiles.split('\n');
    
    for (const line of lines) {
      if (line && !line.startsWith('COPY') && line !== '\\.') {
        const parts = line.split('\t');
        if (parts.length > 9) {
          const id = parseInt(parts[0]);
          const hash = parts[8]; // Column 9 (0-indexed = 8)
          if (id && hash) {
            oldHashToId[hash] = id;
          }
        }
      }
    }

    console.log(`Found ${Object.keys(oldHashToId).length} files in backup\n`);

    // Step 2: Get new files and match by hash in filename
    const newFilesResult = await client.query('SELECT id, name, hash FROM files');
    const newFiles = newFilesResult.rows;

    console.log(`Current files: ${newFiles.length}\n`);

    // Build mapping: old ID → new ID
    const idMapping = {};
    let matched = 0;

    for (const newFile of newFiles) {
      // The uploaded filename contains the old hash
      // e.g., "chocolate_cake_recipe_0a13eb69d3_newhas h.png" contains "0a13eb69d3"
      
      for (const [oldHash, oldId] of Object.entries(oldHashToId)) {
        if (newFile.name.includes(oldHash) || newFile.hash === oldHash) {
          idMapping[oldId] = newFile.id;
          matched++;
          break;
        }
      }
    }

    console.log(`✅ Matched ${matched} files (old ID → new ID)\n`);

    if (matched < 10) {
      console.log('⚠️  Very few matches! This might not work well.');
    }

    // Step 3: Restore file relationships with remapping
    console.log('🔗 Restoring file relationships...\n');

    const relationData = execSync(
      'cd /Users/mac/.cursor/worktrees/pp-back-end/5kCSU && gunzip -c strapi_db_import.sql.gz | awk \'/COPY public.files_related_mph/,/^\\\\\\\\.$/\'',
      { encoding: 'utf-8' }
    );

    const relationLines = relationData.split('\n');
    let inserted = 0;
    let skipped = 0;

    for (const line of relationLines) {
      if (line && !line.startsWith('COPY') && line !== '\\.') {
        const parts = line.split('\t');
        if (parts.length >= 5) {
          const oldFileId = parseInt(parts[1]);
          const relatedId = parseInt(parts[2]);
          const relatedType = parts[3];
          const field = parts[4];
          const order = parts[5] ? parseInt(parts[5]) : null;

          const newFileId = idMapping[oldFileId];

          if (newFileId) {
            try {
              await client.query(`
                INSERT INTO files_related_mph (file_id, related_id, related_type, field, "order")
                VALUES ($1, $2, $3, $4, $5)
              `, [newFileId, relatedId, relatedType, field, order]);
              inserted++;
            } catch (err) {
              // Duplicate or other error
            }
          } else {
            skipped++;
          }
        }
      }
    }

    console.log(`✅ Inserted ${inserted} file relationships`);
    console.log(`⚠️  Skipped ${skipped} (no matching files)\n`);

    console.log('✅ Complete!\n');
    console.log('🔍 Refresh your products - images should appear!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await client.end();
  }
}

matchAndRestore();

