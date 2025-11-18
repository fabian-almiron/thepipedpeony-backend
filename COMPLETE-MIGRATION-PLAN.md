# Complete Migration Plan - Database + Images

## Current Situation:
- ✅ Database has all content (products, recipes, blogs, etc.)
- ✅ Database has file records with IDs (1-58)
- ❌ File URLs point to old Strapi Cloud
- ❌ No actual files in Railway volume yet

## The Problem:
When we upload files via Strapi API, it creates NEW file records with NEW IDs, breaking the relationships.

## The Solution:

### Option 1: Manual Re-assignment (Safest - 10 minutes)
1. Upload all files via Strapi UI
2. Manually re-assign images to products/recipes through admin panel
3. Tedious but guaranteed to work

### Option 2: Smart Database Fix (Automated - 5 minutes)
1. Upload files via API (creates new records with new IDs)
2. Match old → new by filename hash
3. Update relationships to use new IDs
4. Delete old file records

## Recommended: Option 2

### Step-by-step:

1. **Upload all images:**
   ```bash
   ./upload-with-api-key.sh
   ```
   This uploads ~215 files and creates NEW records (IDs 59-273)

2. **Run the smart remap script:**
   ```bash
   railway run node scripts/restore-and-remap-images.js
   ```
   This will:
   - Match old file record (ID 1, hash ABC) → new file record (ID 201, hash ABC)
   - Update products: image_id=1 → image_id=201
   - Delete old file record (ID 1)
   - Keep only new record with correct relationship

3. **Verify:**
   - Products should show images
   - Media Library shows ~215 files
   - No duplicates

## Current Status:
- Database re-imported ✅
- Ready to upload files ⏳

