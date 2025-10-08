# ✅ Ready to Import Courses

Everything is set up and ready to migrate your WordPress courses to Strapi!

## What's Been Created

### Backend (Strapi)
1. ✅ **Course Content Type** - Complete schema with all fields
   - `/src/api/course/content-types/course/schema.json`
   - `/src/api/course/controllers/course.ts`
   - `/src/api/course/routes/course.ts`
   - `/src/api/course/services/course.ts`

2. ✅ **Import Script** - Automated CSV parser
   - `/scripts/import-courses.js`
   - Handles video chapters (up to 50 per course)
   - Handles equipment lists (up to 30 items)
   - Parses categories, tags, and all metadata
   - Prevents duplicate imports

3. ✅ **Dependencies** - csv-parser installed

### Frontend (Next.js)
1. ✅ **Type Definitions** - StrapiCourse interface
   - `/data/types.ts` updated with course types

2. ✅ **API Functions** - 10 functions ready to use
   - `/lib/strapi-api.ts` updated with course functions
   - No linting errors

3. ✅ **Documentation** - Complete guides
   - `/COURSES_API_GUIDE.md` - Frontend usage guide

### Documentation
1. ✅ **Backend Guide** - `/COURSE_IMPORT_GUIDE.md`
2. ✅ **Frontend Guide** - `/piped-peony-frontend/COURSES_API_GUIDE.md`
3. ✅ **Complete Migration Guide** - `/WORDPRESS_TO_STRAPI_MIGRATION.md`

## Quick Start - Import in 3 Steps

### Step 1: Restart Strapi (to register new content type)
```bash
cd /Users/mac/Documents/9S/CLIENTS/The\ Piped\ Peony/strapi-first-build
npm run dev
```

### Step 2: Set Permissions
1. Go to http://localhost:1337/admin
2. Settings → Users & Permissions → Roles → Public
3. Find "Course" section
4. Enable: `find` ✅ and `findOne` ✅
5. Save

### Step 3: Import Courses
```bash
node scripts/import-courses.js
```

That's it! Your courses will be imported with:
- ✅ All content and metadata
- ✅ Video chapters with timestamps
- ✅ Equipment/supply lists
- ✅ Categories and tags
- ✅ Series organization
- ✅ Featured images
- ✅ Course ordering

## Expected Output

```
🚀 Starting course import...
📊 Found 149 courses to import
✅ Imported: 3. American Buttercream (ID: 1)
✅ Imported: 4. Vegan Buttercream (ID: 2)
✅ Imported: 9. Anatomy of a Buttercream Flower (ID: 3)
...
🎉 Import completed!
✅ Imported: 149 courses
⏭️  Skipped: 0 courses
❌ Errors: 0 courses
```

## Verify Import

1. **In Strapi Admin**
   - Go to Content Manager → Course
   - Open a course
   - Check video chapters, equipment lists, categories

2. **Via API**
   ```bash
   curl http://localhost:1337/api/courses?populate=*
   ```

3. **In Frontend**
   ```bash
   cd /Users/mac/Documents/9S/CLIENTS/The\ Piped\ Peony/piped-peony-frontend
   pnpm dev
   ```
   Visit http://localhost:3000/courses

## What Each Course Includes

- **Basic Info**: title, slug, content, excerpt
- **Media**: featured image, gallery
- **Classification**: tags, categories, level, series
- **Video**: videoId, chapters with timestamps
- **Equipment**: Array of items needed
- **Metadata**: WordPress ID, permalink, order, dates
- **Author**: Author name

## Frontend API Functions Ready

```typescript
import { 
  fetchCourses,           // All courses with pagination
  fetchCourseBySlug,      // Single course
  fetchCoursesBySeries,   // Filter by series
  fetchCoursesByCategory, // Filter by category
  fetchCoursesByLevel,    // Filter by level
  fetchFeaturedCourses,   // Featured only
  searchCourses,          // Search
  fetchCourseSeries,      // Get all series
  fetchCourseCategories   // Get all categories
} from '@/lib/strapi-api';
```

## Need Help?

📖 Read the guides:
- Backend: `COURSE_IMPORT_GUIDE.md`
- Frontend: `../piped-peony-frontend/COURSES_API_GUIDE.md`
- Complete: `../WORDPRESS_TO_STRAPI_MIGRATION.md`

## Re-importing

To re-import courses:
1. Delete existing courses in Strapi admin
2. Run `node scripts/import-courses.js` again

The script automatically skips existing courses based on WordPress ID.

---

🎉 **You're ready to go!** Just follow the 3 steps above to start importing.

