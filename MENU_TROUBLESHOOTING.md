# Menu System Troubleshooting Guide

## Problem
Menus and menu items created in Strapi are not showing up on the frontend.

## Root Causes Found & Fixed

### 1. ✅ Menu Slug Mismatch (FIXED)
**Problem**: Frontend was looking for menu with slug `"menu"`, but you created:
- `"logged-out-header"` - for non-authenticated users
- `"logged-in-header"` - for authenticated users

**Solution**: Updated frontend code to use correct slugs:
- `/piped-peony-frontend/components/site-header.tsx` - now uses `"logged-out-header"`
- `/piped-peony-frontend/components/logged-in-header.tsx` - now uses `"logged-in-header"`

### 2. ⚠️ API Permissions Not Set (NEEDS YOUR ACTION)
**Problem**: Menu and Menu-item content types don't have public API access enabled.

**Solution**: Follow these steps NOW:

#### Enable API Permissions in Strapi:

1. Open Strapi admin: http://localhost:1337/admin
2. Go to **Settings** (⚙️ icon in left sidebar)
3. Click **Users & Permissions plugin** → **Roles**
4. Click on **Public** role
5. Scroll down and find the **Menu** section:
   - ✅ Check `find`
   - ✅ Check `findOne`
6. Scroll to find the **Menu-item** section:
   - ✅ Check `find`
   - ✅ Check `findOne`
7. Click **Save** button at top right

## Verification Checklist

After enabling permissions, verify everything is working:

### ✅ In Strapi Admin (http://localhost:1337/admin)

1. **Check Menu Items are Published**:
   - Go to Content Manager → Menu Item
   - Each menu item should show "Published" status
   - If any say "Draft", click them and click "Publish"

2. **Check Menu Items are Connected to Menus**:
   - Open each Menu Item
   - Verify the "menu" relation field is set (should link to a Menu)
   - Order numbers should be sequential (0, 1, 2, 3...)

3. **Check Menus are Published**:
   - Go to Content Manager → Menu
   - Both "Logged in Header" and "Logged out Header" should be Published
   - Verify the slugs are correct:
     - `logged-in-header`
     - `logged-out-header`

### ✅ Test API Endpoints

Open these URLs in your browser or use curl:

**Test 1**: Get all menus
```
http://localhost:1337/api/menus
```

**Test 2**: Get menus with items
```
http://localhost:1337/api/menus?populate=menuItems
```

**Test 3**: Get specific menu (what frontend uses)
```
http://localhost:1337/api/menus?filters[slug][$eq]=logged-out-header&populate[menuItems][populate]=children
```

You should see JSON data with your menu items.

### ✅ Test Frontend

1. **Restart your Next.js dev server**:
   ```bash
   cd /Users/mac/Documents/9S/CLIENTS/The\ Piped\ Peony/piped-peony-frontend
   pnpm dev
   ```

2. **Check the website**: http://localhost:3000
   - Your menu items should now appear in the header
   - Check both desktop and mobile navigation

3. **Check browser console**:
   - Open DevTools (F12)
   - Look for any errors related to menus
   - The Navigation component logs warnings if menus aren't found

## Common Issues & Solutions

### Menu items not appearing after setting permissions

**Check in Strapi**:
- Are menu items Published? (not Draft)
- Is each menu item connected to the correct Menu via the "menu" relation?
- Are the Menus themselves Published?

**Check in Browser Console**:
- Any 403 Forbidden errors? → Permissions not saved properly
- Menu not found warning? → Check slug matches exactly
- Network errors? → Make sure Strapi is running on port 1337

### Menu items in wrong order

- Edit each menu item in Strapi
- Set the `order` field (0, 1, 2, 3...) in the sequence you want
- Lower numbers appear first
- Save and refresh frontend

### Dropdown menus not working

To create a dropdown/submenu:
1. Create a parent menu item (e.g., "Academy")
2. Create child menu items (e.g., "Course 1", "Course 2")
3. Edit each child menu item
4. Set its `parent` relation to point to the parent item
5. Save and publish

### Menu showing on wrong pages

The system has two menus:
- **logged-out-header**: Shows when user is NOT logged in
- **logged-in-header**: Shows when user IS logged in

Make sure you're editing the correct menu for the context you want.

## Current Menu Structure (from your screenshots)

### Menu Items Created:
1. Academy (ID: 69) → /academy-details
2. Blog (ID: 71, 82) → /blog
3. Blooming Buttercream™ (ID: 73) → /academy-details/#blooming-buttercream
4. Courses (ID: 77) → /video-library
5. Details (ID: 86) → #
6. Library (ID: 79) → #
7. Meet Dara (ID: 67) → /about
8. Shop (ID: 75, 84) → /shop

**Note**: You have duplicate Blog and Shop items - you may want to delete duplicates.

### Suggested Menu Structure:

**Logged Out Header** (for visitors):
- Shop → /shop
- Academy → /academy-details
- Blog → /blog
- Meet Dara → /about

**Logged In Header** (for members):
- Shop → /shop
- Courses → /video-library
- Library → #
- Blog → /blog
- Meet Dara → /about

## Next Steps

1. ✅ Enable API permissions in Strapi (see steps above)
2. ✅ Verify all menu items are Published
3. ✅ Test API endpoints to confirm data is accessible
4. ✅ Refresh your Next.js frontend
5. ✅ Check that menus appear correctly

## Need More Help?

If menus still don't appear after following these steps:
1. Check browser console for errors
2. Verify Strapi is running on port 1337
3. Verify Next.js is running on port 3000
4. Try clearing browser cache (Cmd+Shift+R)
5. Check the MENU_API_TEST.md file for detailed API testing commands

