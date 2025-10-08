# Recipe Import Guide

This guide will help you import recipes from the WordPress CSV export into Strapi.

## Content Type Created

The **Recipe** content type has been created with the following fields:

### Basic Information
- `title` - Recipe title (string, required)
- `slug` - URL-friendly slug (UID, auto-generated from title)
- `content` - Full recipe content (richtext)
- `excerpt` - Short description (text, max 500 chars)
- `author` - Recipe author (string)
- `publishDate` - Original publish date (date)

### Recipe Details
- `headerImage` - Featured recipe image (media)
- `headerTitle` - Header/banner title (string)
- `methodLabel` - Method description (e.g., "Stand-mixer Method") (string)
- `shortDescription` - Brief recipe description (text)
- `longDescription` - Extended description (text)

### Recipe Components
- `equipment` - List of equipment needed (JSON array)
- `ingredients` - List of ingredients (JSON array)
- `importantNotes` - Important tips and notes (JSON array)
- `additionalNotes` - Additional recipe notes (JSON array)

### Metadata
- `time` - Preparation/cooking time (string)
- `difficulty` - Recipe difficulty (enum: beginner, intermediate, advanced)
- `recipeCategories` - Recipe categories/tags (JSON array)
- `featured` - Featured recipe flag (boolean)
- `videoId` - Associated video ID (string)
- `notice` - Special notice or alert (text)
- `permalink` - Original WordPress URL (string)

## Import Process

### Step 1: Prepare Your Environment

1. Make sure Strapi is running:
   ```bash
   npm run dev
   ```

2. The Strapi server should be accessible at `http://localhost:1337`

### Step 2: Build Strapi (to register new content type)

Since we just added a new Recipe content type, you need to rebuild Strapi:

```bash
npm run build
# Then restart the server
npm run dev
```

### Step 3: Enable Public API Access

Before importing, enable public access to the Recipe API:

1. Go to **Settings** → **Users & Permissions** → **Roles** → **Public**
2. Find **Recipe** in the permissions list
3. Check these permissions:
   - ✅ `find`
   - ✅ `findOne`
   - ✅ `create` (needed for import script)
4. Click **Save**

⚠️ **Note:** After import is complete, you may want to disable the `create` permission for security.

### Step 4: Run the Import Script

```bash
cd /Users/mac/Documents/9S/CLIENTS/The\ Piped\ Peony/strapi-first-build
node scripts/import-recipes.js
```

### What the Script Does

The import script will:

1. ✅ Read the `recipes-Export-2025-October-03-1619.csv` file
2. ✅ Parse all recipe data including:
   - Multiple equipment items (equipment_0_equipment_item, equipment_1_equipment_item, etc.)
   - Multiple ingredients (ingredients_0_ingredients_item, etc.)
   - Important notes (important_0_important_items, etc.)
   - Additional notes (notes_0_note_item, etc.)
3. ✅ Check for duplicate recipes by slug
4. ✅ Skip recipes that already exist
5. ✅ Create new recipe entries via the Strapi API
6. ✅ Report import statistics

### Expected Output

```
🚀 Starting recipe import...
📊 Found 24 total rows to process

📋 First row fields sample: [...]
   Title field: Blooming Buttercream™ - 4.5 Quart
   Post Type field: recipes

✅ Imported: Blooming Buttercream™ - 4.5 Quart (ID: 1)
✅ Imported: Blooming Buttercream™ - 6 Quart (ID: 2)
...

🎉 Import completed!
✅ Imported: 24 recipes
⏭️  Skipped: 0 rows
❌ Errors: 0 recipes
```

## Viewing Imported Recipes

### In Strapi Admin

1. Go to `http://localhost:1337/admin`
2. Navigate to **Content Manager** → **Recipe**
3. You should see all imported recipes

### Via API

- **Get all recipes:** `http://localhost:1337/api/recipes`
- **Get single recipe:** `http://localhost:1337/api/recipes?filters[slug][$eq]=blooming-buttercream-4-5-quart`

## CSV Field Mapping

The import script maps WordPress CSV fields to Strapi fields:

| CSV Field | Strapi Field | Notes |
|-----------|--------------|-------|
| Title | title | Required |
| Slug | slug | Used for duplicate detection |
| Content | content | Full HTML content |
| Excerpt | excerpt | Fallback to short_description |
| Date | publishDate | Original publish date |
| header_image | headerImage | Future: Can be downloaded |
| header_title | headerTitle | Recipe header |
| method_label | methodLabel | e.g., "Stand-mixer Method" |
| short_description | shortDescription | Brief description |
| long_description | longDescription | Extended description |
| equipment_N_equipment_item | equipment | Array of equipment items |
| ingredients_N_ingredients_item | ingredients | Array of ingredient items |
| important_N_important_items | importantNotes | Array of important notes |
| notes_N_note_item | additionalNotes | Array of additional notes |
| time | time | Prep/cook time |
| difficulty | difficulty | beginner/intermediate/advanced |
| Recipe Categories | recipeCategories | Array of categories |
| Featured | featured | Boolean flag |
| recipe__video_id | videoId | Associated video ID |
| notice | notice | Special notice text |
| Permalink | permalink | Original WordPress URL |
| Author First/Last Name | author | Combined author name |

## Troubleshooting

### Error: "Failed to fetch"

**Problem:** Strapi is not running or not accessible.

**Solution:** 
```bash
npm run dev
```

### Error: "403 Forbidden"

**Problem:** Public API permissions are not enabled.

**Solution:** Enable `create` permission for Public role as described in Step 3.

### Error: "Duplicate key error" or "Already exists"

**Problem:** Recipe with the same slug already exists.

**Solution:** The script automatically skips duplicates. If you want to reimport, delete existing recipes from Strapi admin first.

### Script shows "Skipped: 24 rows"

**Problem:** All recipes were skipped because they're not marked as "recipes" post type or already exist.

**Solution:** 
- Check that the CSV has `Post Type` column with value "recipes"
- Check if recipes already exist in Strapi

## Re-running the Import

To re-import recipes:

1. **Delete all existing recipes** (if you want to start fresh):
   ```bash
   node scripts/delete-all-recipes.js
   ```

2. **Run the import again**:
   ```bash
   node scripts/import-recipes.js
   ```

## Next Steps

After importing recipes:

1. ✅ Verify recipe data in Strapi admin
2. ✅ Download and upload recipe images (currently stored as URLs)
3. ✅ Create frontend pages to display recipes
4. ✅ Add recipe filtering and search functionality
5. ✅ Consider disabling `create` permission for Public role

## Notes

- The script preserves WordPress slugs for URL consistency
- Recipe categories are stored as a JSON array for flexibility
- Equipment, ingredients, and notes are stored as JSON arrays
- Images are not automatically imported - you'll need to upload them manually or extend the script
- The script is idempotent - safe to run multiple times

