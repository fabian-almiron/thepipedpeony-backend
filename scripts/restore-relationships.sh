#!/bin/bash

echo "🔄 Restoring relationship data from backup..."
echo ""

cd /Users/mac/.cursor/worktrees/pp-back-end/5kCSU

# Extract just the relationship table data
echo "📦 Extracting relationship data..."

gunzip -c strapi_db_import.sql.gz | grep -E "^COPY (categories_course_lnk|categories_courses_lnk|products_category_lnk|recipes_categories_lnk|menu_items_menu_lnk)" -A 10000 | head -500 > /tmp/relationships.sql

echo "📤 Importing to Railway..."
echo ""

cat /tmp/relationships.sql | railway connect Postgres 2>&1 | tail -30

rm /tmp/relationships.sql

echo ""
echo "✅ Relationship import complete!"
echo ""
echo "Run this to verify:"
echo "  railway run node scripts/check-relationships.js"

