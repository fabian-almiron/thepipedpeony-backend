/**
 * Restore product/recipe/course image relationships from backup
 * with proper ID remapping
 */

const pg = require('pg');
const { execSync } = require('child_process');
const fs = require('fs');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set!');
  process.exit(1);
}

function getBaseName(filename) {
  let base = filename.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
  base = base.replace(/_[a-f0-9]{10,}$/i, '');
  base = base.toLowerCase()
    .replace(/-/g, '_')
    .replace(/[^a-z0-9_]/g, '');
  return base;
}

async function restoreProductImages() {
  const client = new pg.Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Step 1: Extract old file data from backup
    console.log('📦 Extracting file data from backup...\n');
    
    const backupFiles = execSync(
      'cd /Users/mac/.cursor/worktrees/pp-back-end/5kCSU && gunzip -c strapi_db_import.sql.gz | awk \'/COPY public.files \\(/,/^\\\\\\\\.$/\'',
      { encoding: 'utf-8' }
    );

    // Parse old file IDs and names
    const oldFileMap = {};
    const lines = backupFiles.split('\n');
    
    for (const line of lines) {
      if (line && !line.startsWith('COPY') && line !== '\\.') {
        const parts = line.split('\t');
        if (parts.length > 2) {
          const id = parseInt(parts[0]);
          const name = parts[2]; // name is usually 3rd column
          if (id && name) {
            oldFileMap[id] = name;
          }
        }
      }
    }

    console.log(`Found ${Object.keys(oldFileMap).length} files in backup\n`);

    // Step 2: Get current uploaded files
    const newFilesResult = await client.query('SELECT id, name FROM files ORDER BY id');
    const newFiles = newFilesResult.rows;

    console.log(`Current uploaded files: ${newFiles.length}\n`);

    // Step 3: Build ID mapping (old ID → new ID)
    const idMapping = {};
    
    for (const [oldId, oldName] of Object.entries(oldFileMap)) {
      const oldBase = getBaseName(oldName);
      
      const newFile = newFiles.find(nf => {
        const newBase = getBaseName(nf.name);
        return newBase === oldBase;
      });

      if (newFile) {
        idMapping[oldId] = newFile.id;
      }
    }

    console.log(`✅ Matched ${Object.keys(idMapping).length} files\n`);

    // Step 4: Extract and restore relationships with remapped IDs
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
          const id = parseInt(parts[0]);
          const oldFileId = parseInt(parts[1]);
          const relatedId = parseInt(parts[2]);
          const relatedType = parts[3];
          const field = parts[4];
          const order = parts[5] || null;

          // Map old file ID to new file ID
          const newFileId = idMapping[oldFileId];

          if (newFileId) {
            try {
              await client.query(`
                INSERT INTO files_related_mph (id, file_id, related_id, related_type, field, "order")
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (id) DO NOTHING
              `, [id, newFileId, relatedId, relatedType, field, order]);
              inserted++;
            } catch (err) {
              // Ignore duplicates
            }
          } else {
            skipped++;
          }
        }
      }
    }

    console.log(`✅ Inserted ${inserted} file relationships`);
    console.log(`⚠️  Skipped ${skipped} (no matching files)\n`);

    console.log('✅ Complete! Product images should now appear!\n');
    console.log('🔍 Refresh your products page to verify');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await client.end();
  }
}

restoreProductImages();

