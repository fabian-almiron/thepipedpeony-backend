# Recipe Import Troubleshooting

## Issue: 500 Internal Server Error

If you're getting 500 errors when running the import script, follow these steps:

### Step 1: Restart Strapi

After creating a new content type, Strapi **must be restarted** to load the new schema.

1. Stop Strapi (Ctrl+C in the terminal where it's running)
2. Start it again:
   ```bash
   npm run develop
   ```
3. Wait for Strapi to fully start (you should see "Server started" message)

### Step 2: Verify Recipe Content Type Exists

1. Open Strapi admin: http://localhost:1337/admin
2. Go to Content-Type Builder
3. Verify "Recipe" appears in the list
4. Click on Recipe and verify all fields are present:
   - title (Text)
   - slug (UID)
   - featuredImage (Media)
   - headerTitle, methodLabel, shortDescription, time, difficulty (Text fields)
   - longDescription (Rich Text)
   - equipment, ingredients, important, notes (JSON)
   - recipeVideoId (Text)
   - categories (Relation to Category - Many to Many)

### Step 3: Check Permissions

1. In Strapi admin, go to Settings → Users & Permissions Plugin → Roles → Public
2. Under "Recipe", enable:
   - find
   - findOne
   
3. Under "Category", enable:
   - find
   - findOne
   - create (for auto-creating categories)
   - update (for linking)

### Step 4: Test API Manually

Before running the import, test if the API works:

```bash
curl -X POST http://localhost:1337/api/recipes \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "title": "Test Recipe",
      "slug": "test-recipe"
    }
  }'
```

Expected response: A JSON object with the created recipe.

If this fails, check the Strapi terminal for error details.

### Step 5: Run Import with Debug Info

The updated script now shows:
- Sample payload being sent
- More detailed error messages

Run again:
```bash
node scripts/import-recipes.js
```

### Common Issues

#### Issue: "Content type not found"
**Solution:** Strapi wasn't restarted. Go back to Step 1.

#### Issue: "Forbidden" or "Unauthorized"
**Solution:** Check permissions in Step 3.

#### Issue: "Validation error" 
**Solution:** Check the error details. It will show which field is causing issues.

#### Issue: Categories not linking
**Solution:** 
1. Make sure the Category content type has the inverse relation to Recipe
2. Check that Public role has create/update permissions for Category

### Manual Check in Strapi

After restarting Strapi, you should see:

1. **Content Manager** in the left sidebar should show "Recipe" 
2. You should be able to click "+ Create new entry" for Recipe
3. Try creating a test recipe manually to verify everything works

### If Still Failing

Check the Strapi server logs in the terminal where Strapi is running. The error details will be shown there.

Common log errors:
- `Unknown attribute` → Field name mismatch between script and schema
- `Relation not found` → Category relation not properly set up
- `Invalid JSON` → JSON fields getting non-array data

