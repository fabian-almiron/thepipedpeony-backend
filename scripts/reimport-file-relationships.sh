#!/bin/bash

echo "🔄 Re-importing file relationships from backup..."
echo ""
echo "This will restore the connections between products/recipes and images"
echo "WITHOUT duplicating the actual content."
echo ""

# Extract just the file relationship tables from the backup
cd /Users/mac/.cursor/worktrees/pp-back-end/5kCSU

echo "📦 Extracting relationship data from backup..."

# Decompress and extract only specific tables
gunzip -c strapi_db_import.sql.gz | grep -A 10000 "COPY files_related_mph" > /tmp/file_relationships.sql

echo "📤 Importing file relationships to Railway..."

# Import just those tables, ignoring duplicate errors
cat /tmp/file_relationships.sql | railway connect Postgres 2>&1 | grep -v "already exists" | tail -20

# Clean up
rm /tmp/file_relationships.sql

echo ""
echo "✅ Re-import complete!"
echo ""
echo "⚠️  You'll see some errors about duplicates - that's normal and expected."
echo "    We only want to restore the relationship data."
echo ""
echo "🔜 Next step: Run the file ID remapping script"
echo "    railway run node scripts/remap-file-ids.js"

