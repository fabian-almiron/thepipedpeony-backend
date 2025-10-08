# Course Import Guide - WordPress to Strapi Migration

This guide will help you import your WordPress courses (with ACF custom fields) into Strapi.

## What's Been Created

### 1. Course Content Type
Location: `/src/api/course/`

The Course content type includes all the fields from your WordPress export:
- **Basic Info**: title, slug, content, excerpt, author
- **Media**: featuredImage, gallery
- **Classification**: tags, categories, courseLevel, series
- **Video Data**: episode, videoId, videoChapters (with timestamps)
- **Equipment**: equipmentNeeded (array of items)
- **Metadata**: wordpressId, permalink, order, dates
- **Publishing**: featured, publishedAt

### 2. Import Script
Location: `/scripts/import-courses.js`

Features:
- ✅ Parses CSV data from WordPress export
- ✅ Handles up to 50 video chapters per course
- ✅ Handles up to 30 equipment items per course
- ✅ Converts pipe-separated categories and tags
- ✅ Prevents duplicate imports using WordPress ID
- ✅ Auto-publishes courses
- ✅ Detailed import logging

## Setup Instructions

### Step 1: Install Dependencies

```bash
cd /Users/mac/Documents/9S/CLIENTS/The\ Piped\ Peony/strapi-first-build
npm install csv-parser
```

### Step 2: Restart Strapi

Stop your current Strapi instance (Ctrl+C) and restart it to register the new Course content type:

```bash
npm run dev
```

Wait for Strapi to fully load (you'll see "Server started" message).

### Step 3: Set Permissions in Strapi Admin

1. Go to http://localhost:1337/admin
2. Navigate to **Settings** → **Users & Permissions** → **Roles** → **Public**
3. Find the **Course** section
4. Check the following permissions:
   - ✅ `find` (to list all courses)
   - ✅ `findOne` (to get individual courses)
5. Click **Save**

### Step 4: Run the Import Script

```bash
node scripts/import-courses.js
```

You should see output like:
```
🚀 Starting course import...
📊 Found 72 courses to import
✅ Imported: 3. American Buttercream (ID: 1)
✅ Imported: 4. Vegan Buttercream (ID: 2)
...
🎉 Import completed!
✅ Imported: 72 courses
⏭️  Skipped: 0 courses
❌ Errors: 0 courses
```

### Step 5: Verify in Strapi Admin

1. Go to http://localhost:1337/admin
2. Click on **Content Manager** → **Course**
3. You should see all your imported courses
4. Open a course to verify all data imported correctly:
   - Video chapters
   - Equipment lists
   - Categories and tags
   - Video ID

### Step 6: Test the API

Test the API endpoint in your browser or with curl:

```bash
# Get all courses
curl http://localhost:1337/api/courses?populate=*

# Get a specific course by ID
curl http://localhost:1337/api/courses/1?populate=*
```

## Course Data Structure

### Video Chapters JSON Format
```json
[
  {
    "title": "1 Introduction",
    "time": "00.00.01"
  },
  {
    "title": "2 Important information",
    "time": "00.00.39"
  }
]
```

### Equipment Needed JSON Format
```json
[
  "powdered sugar",
  "salted or unsalted butter",
  "flavoring",
  "standmixer",
  "silicone spatula"
]
```

### Categories/Tags JSON Format
```json
["The Recipe Series", "The Starter Series"]
```

## Troubleshooting

### Issue: "Module not found: csv-parser"
**Solution**: Run `npm install csv-parser`

### Issue: "Unknown attribute course"
**Solution**: Restart Strapi with `npm run dev` to register the new content type

### Issue: Courses not visible in API
**Solution**: Check that Public role has `find` and `findOne` permissions enabled

### Issue: Duplicate courses
**Solution**: The script checks for existing courses by WordPress ID and skips them. To re-import, delete courses from Strapi admin first.

### Issue: Missing video chapters or equipment
**Solution**: Check your CSV file format. The script looks for columns named:
- `video_chapters_0_chapter_title`, `video_chapters_0_jump_to_time`, etc.
- `what_youll_need_0_item`, `what_youll_need_1_item`, etc.

## Re-importing Data

If you need to re-import courses:

1. Delete existing courses in Strapi Admin (Content Manager → Course → Select All → Delete)
2. Run the import script again: `node scripts/import-courses.js`

Or to update existing courses, modify the script to use `update` instead of skipping.

## Next Steps

After successful import, you can:
1. Create frontend components to display courses
2. Add course search and filtering
3. Integrate video player with chapter navigation
4. Create course series pages
5. Add course enrollment/membership features

## CSV Field Mapping

WordPress CSV Column → Strapi Field:
- `ID` → `wordpressId`
- `Title` → `title`
- `Content` → `content`
- `Excerpt` → `excerpt`
- `Date` → `publishedDate`
- `Categories` → `categories` (JSON)
- `Tags` → `tags` (JSON)
- `Course Levels` → `courseLevel`
- `episode` → `episode`
- `video_id` → `videoId`
- `series` → `series`
- `about` → `about`
- `video_chapters_X_*` → `videoChapters` (JSON)
- `what_youll_need_X_item` → `equipmentNeeded` (JSON)
- `Permalink` → `permalink`
- `Order` → `order`
- `Post Modified Date` → `modifiedDate`

