# Menu Import Guide

This guide will help you import navigation menus from the WordPress XML export into Strapi.

## Menus to Import

The import script will import these 3 specific menus:

1. **Header Menu - Logged In** (`logged-in-header`)
   - Navigation for authenticated users
   
2. **Header Menu - Logged Out** (`header-menu-logged-out`)
   - Navigation for guest users
   
3. **Footer Menu** (`footer-menu`)
   - Footer navigation links

## Prerequisites

### Strapi Content Types Already Exist ✅

You already have the Menu system set up:
- **Menu** content type (`api::menu.menu`)
- **Menu Item** content type (`api::menu-item.menu-item`)

These were created when you set up the menu system earlier.

## Import Process

### Step 1: Make Sure Strapi is Running

```bash
cd /Users/mac/Documents/9S/CLIENTS/The\ Piped\ Peony/strapi-first-build
npm run dev
```

Strapi should be accessible at `http://localhost:1337`

### Step 2: Enable Public API Access

Enable API access for Menu and Menu-Item:

1. Go to **Settings** → **Users & Permissions** → **Roles** → **Public**
2. Find **Menu** and enable:
   - ✅ `find`
   - ✅ `findOne`
   - ✅ `create` (needed for import)
   - ✅ `update` (needed for parent relationships)
3. Find **Menu-Item** and enable:
   - ✅ `find`
   - ✅ `findOne`
   - ✅ `create` (needed for import)
   - ✅ `update` (needed for parent relationships)
4. Click **Save**

⚠️ **Note:** After import, you may want to disable `create` and `update` permissions for security.

### Step 3: Run the Import Script

```bash
node scripts/import-menus.js
```

### Expected Output

```
🚀 Starting menu import...
📖 Reading XML file...
🔍 Parsing XML...
✅ Found menu: Logged In - Header (slug: logged-in-header)
✅ Found menu: Header Menu - Logged out (slug: header-menu-logged-out)
✅ Found menu: Footer Menu (slug: footer-menu)

📋 Found 3 menus to import

🔍 Extracting menu items...
✅ Found 25 menu items across all menus

📤 Importing menus into Strapi...

📁 Processing menu: Logged In - Header
✅ Created menu: Logged In - Header (ID: 1)
  ✅ Created item: My Courses (order: 0)
  ✅ Created item: All Courses (order: 2)
  ...

📁 Processing menu: Header Menu - Logged out
✅ Created menu: Header Menu - Logged out (ID: 2)
  ✅ Created item: Login (order: 0)
  ...

📁 Processing menu: Footer Menu
✅ Created menu: Footer Menu (ID: 3)
  ✅ Created item: About (order: 0)
  ...

🎉 Import completed!
✅ Menus imported: 3
✅ Menu items imported: 25
❌ Errors: 0
```

## Viewing Imported Menus

### In Strapi Admin

1. Go to `http://localhost:1337/admin`
2. Navigate to **Content Manager** → **Menu**
3. You should see your 3 menus
4. Navigate to **Content Manager** → **Menu Item**
5. You should see all menu items

### Via API

**Get all menus:**
```
http://localhost:1337/api/menus?populate=menuItems
```

**Get specific menu with items:**
```
http://localhost:1337/api/menus?filters[slug][$eq]=logged-in-header&populate[menuItems][populate]=*
```

**Get menu items for a specific menu:**
```
http://localhost:1337/api/menu-items?filters[menu][slug][$eq]=footer-menu&sort=order:asc
```

## Menu Structure

Each **Menu** contains:
- `title` - Menu name (e.g., "Footer Menu")
- `slug` - URL-friendly identifier (e.g., "footer-menu")
- `description` - Description of the menu
- `menuItems` - Relation to menu items

Each **Menu Item** contains:
- `title` - Display text (e.g., "My Courses")
- `url` - Link URL
- `target` - Link target (_self, _blank, etc.)
- `order` - Sort order (0, 1, 2...)
- `isExternal` - Whether link is external
- `menu` - Relation to parent menu
- `parent` - Relation to parent menu item (for submenus)
- `children` - Relation to child menu items
- `cssClass` - CSS class names
- `icon` - Icon identifier (optional)

## Import Details

### What Gets Imported

✅ Menu titles and slugs  
✅ Menu item titles  
✅ Menu item URLs  
✅ Menu item order/sorting  
✅ Menu item targets (_self, _blank)  
✅ Parent-child relationships (submenus)  
✅ External link detection  
✅ CSS classes  

### What Doesn't Get Imported

❌ WordPress-specific metadata  
❌ Custom fields not in Strapi schema  
❌ ACF (Advanced Custom Fields) data  
❌ Conditional logic rules  

## Troubleshooting

### Error: "Failed to fetch"

**Problem:** Strapi is not running or not accessible.

**Solution:**
```bash
npm run dev
```

### Error: "403 Forbidden"

**Problem:** Public API permissions are not enabled.

**Solution:** Enable permissions as described in Step 2.

### Menu items appear in wrong order

**Problem:** Order field wasn't set correctly.

**Solution:** The script uses `wp:menu_order` from WordPress. You can manually adjust order in Strapi admin or edit items via API.

### Parent-child relationships not working

**Problem:** Parent items weren't created before children, or IDs don't match.

**Solution:** The script handles this with a two-pass approach. If issues persist, check the console logs for specific errors.

## Re-running the Import

The script is **idempotent** - safe to run multiple times:

- Existing menus will be reused
- Existing menu items will be skipped
- Only new items will be created

To completely re-import:

1. Delete all menus and menu items from Strapi admin
2. Run the script again

## Next Steps

After importing menus:

1. ✅ Verify menus in Strapi admin
2. ✅ Test menu API endpoints
3. ✅ Update frontend to fetch menus from Strapi
4. ✅ Implement menu rendering in Next.js
5. ✅ Add authentication logic to show correct header menu
6. ✅ Consider disabling `create`/`update` permissions for Public role

## Frontend Integration Example

```typescript
// lib/strapi-api.ts
export async function fetchMenuBySlug(slug: string) {
  const response = await fetch(
    `${STRAPI_URL}/api/menus?filters[slug][$eq]=${slug}&populate[menuItems][populate]=children&populate[menuItems][sort][0]=order:asc`
  );
  const data = await response.json();
  return data.data[0];
}

// Usage in component
const headerMenu = await fetchMenuBySlug('logged-in-header');
const footerMenu = await fetchMenuBySlug('footer-menu');
```

## Notes

- The script preserves WordPress menu structure and order
- Menu items are linked to their parent menus via relations
- Hierarchical menus (parent-child) are fully supported
- External links are automatically detected (URLs starting with "http")
- The script handles both custom links and page links from WordPress

---

**Ready to import?** Run `node scripts/import-menus.js` to get started! 🚀

