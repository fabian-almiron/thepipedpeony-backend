# 🎯 Menu Fix - Action Plan

## What Was Wrong

Your menus weren't showing on the frontend because:
1. ❌ Menu slugs didn't match (frontend looking for "menu", you created "logged-out-header")
2. ❌ API permissions weren't enabled in Strapi

## What I Fixed

✅ **Updated frontend code** to use correct menu slugs:
- `site-header.tsx` now uses `"logged-out-header"`
- `logged-in-header.tsx` now uses `"logged-in-header"`

## What YOU Need to Do Now (2 minutes)

### Step 1: Enable API Permissions in Strapi

1. Open **http://localhost:1337/admin**
2. Click **Settings** (⚙️ in left sidebar)
3. Click **Users & Permissions** → **Roles**
4. Click **Public** role
5. Scroll to **Menu** section and check:
   - ✅ `find`
   - ✅ `findOne`
6. Scroll to **Menu-item** section and check:
   - ✅ `find`
   - ✅ `findOne`
7. Click **Save** (top right)

### Step 2: Verify Menu Items are Published

1. Go to **Content Manager** → **Menu Item**
2. Make sure all 10 items show "Published" status
3. If any say "Draft", click them and hit **Publish**

### Step 3: Verify Menus are Published

1. Go to **Content Manager** → **Menu**
2. Both menus should be "Published":
   - "Logged in Header" (slug: `logged-in-header`)
   - "Logged out Header" (slug: `logged-out-header`)

### Step 4: Test the API

Open this URL in your browser:
```
http://localhost:1337/api/menus?populate=menuItems
```

You should see JSON data with your menus. If you see `"data": []` or an error, go back to Step 1.

### Step 5: Restart Next.js Frontend

```bash
# Stop the current dev server (Ctrl+C)
# Then restart:
cd /Users/mac/Documents/9S/CLIENTS/The\ Piped\ Peony/piped-peony-frontend
pnpm dev
```

### Step 6: Check Your Site

Open **http://localhost:3000**

Your menu items should now appear in the header! 🎉

## Expected Result

### Desktop View:
```
┌────────────────────────────────────────────────────────────┐
│ 🌸 The Piped Peony  |  Shop  Blog  Academy  About  |  🛒  │
└────────────────────────────────────────────────────────────┘
```

### Mobile View:
```
┌──────────────────────┐
│ 🌸 Logo    ☰ Menu 🛒│
│                      │
│  [Tap menu to see:]  │
│  Shop                │
│  Blog                │
│  Academy             │
│  About               │
└──────────────────────┘
```

## Troubleshooting

### If menus STILL don't show after these steps:

1. **Check browser console** (F12 → Console tab)
   - Look for red errors
   - Look for "Menu not found" warnings

2. **Verify API is working**:
   ```bash
   curl "http://localhost:1337/api/menus?filters[slug][\$eq]=logged-out-header&populate[menuItems][populate]=children"
   ```
   Should return JSON with your menu data

3. **Hard refresh browser**: Press `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows)

4. **Check Strapi is running**: http://localhost:1337 should load

5. **Check Next.js is running**: http://localhost:3000 should load

## Additional Documentation

I've created detailed guides for you:

1. **MENU_TROUBLESHOOTING.md** - Complete troubleshooting guide
2. **MENU_API_TEST.md** - API testing commands
3. **MENU_SETUP_VISUAL.md** - Visual guide showing how everything connects
4. **MENU_IMPORT_GUIDE.md** - Your original import guide
5. **MENU_SYSTEM_GUIDE.md** - Complete system documentation

## Quick Tips

### To reorder menu items:
- Edit the menu item in Strapi
- Change the `order` field (0 = first, 1 = second, etc.)
- Save and refresh frontend

### To create a dropdown:
1. Create a parent item (e.g., "Academy")
2. Create child items
3. Set each child's `parent` field to the parent item
4. Save and refresh

### To add new menu items:
1. Create in Strapi → Content Manager → Menu Item
2. Set title, URL, order
3. Link to correct menu (logged-in-header or logged-out-header)
4. Publish
5. Refresh frontend

## Summary

- ✅ Frontend code updated to use correct slugs
- ⏳ YOU need to enable API permissions (Step 1 above)
- ⏳ YOU need to verify items are published (Steps 2-3 above)
- ⏳ Test and restart (Steps 4-6 above)

**Total time needed: ~2 minutes**

Once you complete Step 1 (enabling permissions), your menus will work! 🚀

