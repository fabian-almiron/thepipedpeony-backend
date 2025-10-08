# Recipe Import Guide

## Content Type Created ✅

A new **Recipe** content type has been created in Strapi with the following fields matching the ACF structure:

### Fields

| Field Name | Type | Description |
|------------|------|-------------|
| `title` | String | Recipe title (required) |
| `slug` | UID | URL-friendly slug (auto-generated from title) |
| `featuredImage` | Media | Recipe featured image |
| `headerTitle` | String | Header title for the recipe |
| `methodLabel` | String | Method label (e.g., "Stand-mixer Method") |
| `shortDescription` | Text | Short description of the recipe |
| `time` | String | Time required |
| `difficulty` | String | Difficulty level |
| `longDescription` | Rich Text | Detailed description with formatting |
| `equipment` | JSON | Array of equipment items |
| `ingredients` | JSON | Array of ingredients |
| `notice` | Text | Important notice text |
| `important` | JSON | Array of important items/tips |
| `notes` | JSON | Array of notes |
| `recipeVideoId` | String | Video ID for recipe video |
| `categories` | Relation | Many-to-Many relation with Categories |

## Import Script Features 🎯

The import script (`scripts/import-recipes.js`) includes:

1. ✅ **CSV Parsing**: Reads from `recepies.csv`
2. ✅ **Image Download**: Automatically downloads featured images from URLs
3. ✅ **Image Upload**: Uploads images to Strapi media library
4. ✅ **Category Linking**: Creates/finds categories and links them to recipes
5. ✅ **Repeater Fields**: Parses ACF repeater fields:
   - Equipment items
   - Ingredients items
   - Important items
   - Note items
6. ✅ **Duplicate Prevention**: Checks for existing recipes by slug before importing

## How to Run the Import

### Prerequisites

1. Make sure Strapi is running:
   ```bash
   npm run develop
   ```

2. Ensure the `recepies.csv` file is in the project root

3. The script requires the `form-data` package:
   ```bash
   npm install form-data
   ```

### Run the Import

```bash
node scripts/import-recipes.js
```

### What the Script Does

1. **Reads the CSV** and parses all recipe data
2. **For each recipe**:
   - Creates the recipe entry in Strapi
   - Downloads the featured image from the URL
   - Uploads the image to Strapi
   - Links the image to the recipe
   - Finds or creates categories from "Recipe Categories" column
   - Links the categories to the recipe

### Expected Output

```
🚀 Starting recipe import...
📊 Found 23 total rows to process

📋 First row fields: [...field names...]
   Title field: Blooming Buttercream™ - 4.5 Quart
   Post Type field: recipes

✅ Created recipe: Blooming Buttercream™ - 4.5 Quart (ID: xxx)
   📸 Downloading image from: https://...
   ✅ Image uploaded and linked
   ✅ Linked 1 categories

... (more recipes)

🎉 Import completed!
✅ Imported: 23 recipes
⏭️  Skipped: 0 rows
❌ Errors: 0 recipes
```

## Data Mapping

### CSV Column → Strapi Field

| CSV Column | Strapi Field |
|------------|--------------|
| `Title` | `title` |
| `Slug` | `slug` |
| `featured_image` | `featuredImage` (downloaded & uploaded) |
| `header_title` | `headerTitle` |
| `method_label` | `methodLabel` |
| `short_description` | `shortDescription` |
| `time` | `time` |
| `difficulty` | `difficulty` |
| `long_description` | `longDescription` |
| `equipment_0_equipment_item`, `equipment_1_equipment_item`, ... | `equipment` (JSON array) |
| `ingredients_0_ingredients_item`, `ingredients_1_ingredients_item`, ... | `ingredients` (JSON array) |
| `notice` | `notice` |
| `important_0_important_items`, `important_1_important_items`, ... | `important` (JSON array) |
| `notes_0_note_item`, `notes_1_note_item`, ... | `notes` (JSON array) |
| `Recipe  Video ID` | `recipeVideoId` |
| `Recipe Categories` | `categories` (relation) |

### Repeater Field Format

ACF repeater fields are converted to JSON arrays in Strapi:

**ACF Format (CSV):**
```
equipment_0_equipment_item: "4.5 quart mixer"
equipment_1_equipment_item: "Balloon whisk attachment"
equipment_2_equipment_item: "Paddle attachment"
```

**Strapi Format (JSON):**
```json
[
  "4.5 quart mixer",
  "Balloon whisk attachment",
  "Paddle attachment"
]
```

## Category Relation

The script automatically:
1. Parses the "Recipe Categories" column (pipe-separated values)
2. Checks if each category exists in Strapi
3. Creates new categories if they don't exist
4. Links all categories to the recipe using Strapi 5's `connect` syntax

**Example:** 
- CSV: `Recipe Categories: "Blooming Buttercream|Vegan Buttercream"`
- Result: Two categories created/found and linked to the recipe

## Troubleshooting

### Images Not Downloading
- Check that the URLs in the CSV are accessible
- Verify your internet connection
- Some URLs may require HTTPS

### Categories Not Linking
- Ensure Strapi is running
- Check that the categories API is accessible at `/api/categories`
- Verify the relation is set up correctly in the schema

### Duplicate Recipes
- The script checks for existing recipes by slug
- If a recipe with the same slug exists, it will be skipped
- Check the console output for "⏭️ Skipping existing recipe" messages

## Next Steps

1. Build Strapi to generate TypeScript types:
   ```bash
   npm run build
   ```

2. Check the imported recipes in Strapi admin:
   - Navigate to Content Manager → Recipes
   - Verify images are attached
   - Check category relations

3. Query recipes via API:
   ```
   GET /api/recipes?populate=*
   ```

## Notes

- The script uses [[memory:9661515]] Strapi 5 conventions
- Relations use `documentId` instead of `id`
- Images are uploaded to the default Strapi upload folder
- Categories are auto-created with slugified names

