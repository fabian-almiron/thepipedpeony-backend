# Category Import Guide

## Overview
This guide explains how to import categories from the WordPress export CSV into Strapi.

## Prerequisites
- Strapi server must be running (`npm run develop`)
- CSV file: `Categories-Export-2025-October-07-1604.csv`
- Import script: `scripts/import-categories.js`

## Category Structure
Each category will be imported with:
- **name**: The category display name (from "Term Name")
- **slug**: URL-friendly identifier (from "Term Slug")
- **publishedAt**: Auto-published upon import

## How to Run

1. **Start Strapi** (if not already running):
   ```bash
   npm run develop
   ```

2. **Open a new terminal** and run the import script:
   ```bash
   node scripts/import-categories.js
   ```

## Expected Output

```
🚀 Starting category import...
📊 Found 35 categories to process
✅ Imported: The Ranunculus Series (ID: 1)
✅ Imported: Business Series (ID: 2)
✅ Imported: Techniques (ID: 3)
...
🎉 Import completed!
✅ Imported: 35 categories
⏭️  Skipped: 0 categories
❌ Errors: 0 categories
```

## Verify Import

After import, verify in Strapi Admin:
1. Go to **Content Manager** → **Category**
2. You should see all 35 categories
3. Check that names and slugs are correct

## Categories Being Imported

The CSV contains 35 categories including:
- The Ranunculus Series
- Business Series
- Techniques
- The Rose Series
- The Peony Series
- The Carnation Series
- And many more flower and color series...

## Notes

- The script automatically checks for duplicates by slug
- Existing categories will be skipped
- Categories are auto-published upon import
- Empty rows in the CSV are automatically skipped

## Troubleshooting

**Issue**: "Cannot find module 'csv-parser'"
**Solution**: Install dependencies first: `npm install`

**Issue**: "Connection refused to localhost:1337"
**Solution**: Make sure Strapi is running in another terminal

**Issue**: Categories not showing in frontend
**Solution**: Ensure they are published (check publishedAt field)

## Next Steps

After importing categories:
1. Link categories to courses (if needed)
2. Link categories to products (if needed)
3. Verify categories display correctly in frontend
