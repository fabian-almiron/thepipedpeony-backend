# Migration Script Changes

## Changes Made

### ✅ Removed Fields
The following fields have been **removed** from the Course content type and import script:

1. **`wordpressId`** - WordPress ID is no longer stored
2. **`order`** - Order/sequence number removed
3. **`publishedDate`** - Published date removed  
4. **`modifiedDate`** - Modified date removed

### ✅ Changed Fields

1. **`slug`** - Now uses the actual slug from WordPress CSV
   - **Before**: Auto-generated from title (`type: "uid"`)
   - **After**: Manual string field with unique constraint (`type: "string"`)
   - **Source**: Takes value from the `Slug` column in CSV

### ✅ Kept Fields

The following fields remain:
- `title` - Course title
- `content` - Course content (HTML/richtext)
- `excerpt` - Short description (max 1000 chars)
- `author` - Author name
- `featured` - Featured flag
- `tags` - Array of tags
- `categories` - Array of categories
- `courseLevel` - beginner/intermediate/advanced
- `episode` - Episode name/number
- `videoId` - Vimeo video ID
- `series` - Course series name
- `about` - About section
- `videoChapters` - Array of {title, time}
- `equipmentNeeded` - Array of equipment items
- `permalink` - Original WordPress permalink
- `featuredImage` - Main course image
- `gallery` - Additional images

## Updated Files

### 1. Schema File
**File**: `/src/api/course/content-types/course/schema.json`

**Changes**:
```json
// BEFORE
"slug": {
  "type": "uid",
  "targetField": "title"
},

// AFTER  
"slug": {
  "type": "string",
  "unique": true
},
```

Removed fields:
- `wordpressId`
- `order`
- `publishedDate`
- `modifiedDate`

### 2. Import Script
**File**: `/scripts/import-courses.js`

**Changes**:
```javascript
// Now uses WordPress slug
slug: courseData.Slug || '',

// Removed from coursePayload:
// - wordpressId
// - order
// - publishedDate
// - modifiedDate
```

**Duplicate check changed**:
```javascript
// BEFORE: Check by WordPress ID
const checkUrl = `${STRAPI_URL}/api/courses?filters[wordpressId][$eq]=${coursePayload.wordpressId}`;

// AFTER: Check by slug
const checkUrl = `${STRAPI_URL}/api/courses?filters[slug][$eq]=${encodeURIComponent(coursePayload.slug)}`;
```

## Migration Process

### Option 1: Fresh Import (Recommended)

If you want to start fresh with the new structure:

1. **Delete existing courses** in Strapi Admin
   - Go to http://localhost:1337/admin
   - Content Manager → Course → Select All → Delete

2. **Restart Strapi** to apply schema changes
   ```bash
   # Stop Strapi (Ctrl+C)
   npm run dev
   ```

3. **Run the import**
   ```bash
   node scripts/import-courses.js
   ```

### Option 2: Keep Existing Data

If you want to keep existing courses:

1. **Restart Strapi** to apply schema changes
   ```bash
   npm run dev
   ```

2. The existing courses will keep their Strapi-generated slugs
3. New imports will use WordPress slugs
4. There may be slug conflicts if you try to re-import existing courses

## Benefits of These Changes

### ✅ Simpler Data Model
- Removed unnecessary WordPress-specific fields
- Cleaner Strapi database

### ✅ WordPress Slug Preservation
- Course URLs remain consistent with WordPress
- `/courses/american-buttercream` works the same way
- SEO benefits from maintaining URL structure

### ✅ No Orphaned Fields
- No dates that don't get updated
- No order fields that need manual management
- Uses Strapi's built-in `createdAt` and `updatedAt` timestamps

### ✅ Duplicate Detection by Slug
- More reliable than WordPress ID
- Matches real-world URL structure
- Prevents URL conflicts

## Frontend Impact

### No Changes Required!
The frontend API functions still work exactly the same:

```typescript
// Still works
const { data: course } = await fetchCourseBySlug('american-buttercream');

// All these still work
fetchCourses()
fetchCoursesBySeries()
fetchFeaturedCourses()
```

The only difference is internal - Strapi now uses the WordPress slugs directly instead of generating new ones.

## Testing

After importing with the updated script:

```bash
# Test getting a course by its WordPress slug
curl "http://localhost:1337/api/courses?filters[slug][$eq]=american-buttercream&populate=*"

# Verify the slug field
curl "http://localhost:1337/api/courses?populate=*" | grep -o '"slug":"[^"]*"' | head -5
```

Expected output:
```
"slug":"american-buttercream"
"slug":"vegan-buttercreams"
"slug":"anatomy-of-a-buttercream-flower"
...
```

## Rollback (If Needed)

If you need to revert to the old schema:

1. Restore the old schema file from git
2. Restore the old import script from git
3. Delete and re-import courses

Or keep the backup files:
- Old schema: `schema.json.backup`
- Old script: `import-courses.js.backup`

---

**Summary**: The migration script now uses WordPress slugs directly and removes unnecessary metadata fields, resulting in a cleaner, more maintainable Strapi database structure.

