# 3-Level Navigation Menu Setup Guide

## Overview

Your navigation system already supports 3-level menus! This guide shows you how to populate the menu data in Strapi to create the navigation structure shown in your mockup.

## Current Menu Structure

### Level 1 (Top Navigation Bar)
- **courses** - Main category
- **library** - Another main category  
- **blog** - Another main category

### Level 2 (Dropdown Menu)
When hovering over "courses", shows:
- The Business Series
- The Color Series
- The Decorating Series ▸ (has sub-items)
- The Flower Piping Series ▸ (has sub-items)
- The Graveyard Series
- The Kids Series
- The Recipe Series
- The Starter Series
- View All

### Level 3 (Nested Dropdown)
When hovering over series with ▸ arrow, shows individual courses within that series.

## Technical Details

### Already Implemented ✅

1. **Database Schema** - `menu-item` collection supports parent-child relationships
2. **API Fetching** - `fetchMenu()` retrieves 3 levels with proper population
3. **Frontend Rendering** - Navigation component displays all 3 levels with hover dropdowns
4. **Arrows** - Automatically shows ▸ for items with children

### Menu Structure in Strapi

```
Menu (main-menu)
├── Menu Item: Courses (parent: null)
│   ├── Menu Item: The Business Series (parent: Courses)
│   ├── Menu Item: The Color Series (parent: Courses)
│   ├── Menu Item: The Decorating Series (parent: Courses)
│   │   ├── Menu Item: Course 1 (parent: The Decorating Series)
│   │   ├── Menu Item: Course 2 (parent: The Decorating Series)
│   │   └── Menu Item: Course 3 (parent: The Decorating Series)
│   ├── Menu Item: The Flower Piping Series (parent: Courses)
│   │   ├── Menu Item: Course 1 (parent: The Flower Piping Series)
│   │   └── Menu Item: Course 2 (parent: The Flower Piping Series)
│   └── Menu Item: View All (parent: Courses)
├── Menu Item: Library (parent: null)
└── Menu Item: Blog (parent: null)
```

## Automated Setup

### Option 1: Generate from Course Data

Run the automated script to create the menu structure from your existing courses:

```bash
# Basic setup - Creates Courses, Library, Blog with series as level 2
STRAPI_TOKEN=your-token node scripts/create-courses-menu.js

# With cleanup - Removes existing menu items first
STRAPI_TOKEN=your-token node scripts/create-courses-menu.js --clean

# With individual courses - Creates level 3 with actual course links
STRAPI_TOKEN=your-token node scripts/create-courses-menu.js --with-courses
```

**To get your STRAPI_TOKEN:**
1. Go to Strapi Admin → Settings → API Tokens
2. Create a new API token with full access
3. Copy the token value

### Option 2: Manual Setup in Strapi Admin

1. **Create the Menu**
   - Go to Content Manager → Menu
   - Create new entry:
     - Title: "Main Menu"
     - Slug: "main-menu"
     - Publish it

2. **Create Level 1 Items** (Top navigation)
   - Go to Content Manager → Menu Items
   - Create these items:
     - Title: "Courses", URL: "/courses", Order: 1, Menu: Main Menu
     - Title: "Library", URL: "/library", Order: 2, Menu: Main Menu
     - Title: "Blog", URL: "/blog", Order: 3, Menu: Main Menu
   - Leave "Parent" empty for these items

3. **Create Level 2 Items** (Series under Courses)
   - Create menu items with Parent = "Courses":
     - Title: "The Business Series", URL: "/courses?series=The Business Series", Order: 1, Parent: Courses
     - Title: "The Color Series", URL: "/courses?series=The Color Series", Order: 2, Parent: Courses
     - Title: "The Decorating Series", URL: "/courses?series=The Decorating Series", Order: 3, Parent: Courses
     - Title: "The Flower Piping Series", URL: "/courses?series=The Flower Piping Series", Order: 4, Parent: Courses
     - Title: "The Graveyard Series", URL: "/courses?series=The Graveyard Series", Order: 5, Parent: Courses
     - Title: "The Kids Series", URL: "/courses?series=The Kids Series", Order: 6, Parent: Courses
     - Title: "The Recipe Series", URL: "/courses?series=The Recipe Series", Order: 7, Parent: Courses
     - Title: "The Starter Series", URL: "/courses?series=The Starter Series", Order: 8, Parent: Courses
     - Title: "View All", URL: "/courses", Order: 9, Parent: Courses

4. **Create Level 3 Items** (Individual courses)
   - For series with multiple courses (like The Decorating Series):
     - Create menu items with Parent = "The Decorating Series"
     - Title: Course name, URL: "/courses/course-slug", Order: 1, 2, 3..., Parent: The Decorating Series

## Testing Your Menu

### API Test

Test the menu API endpoint:

```bash
curl "http://localhost:1337/api/menus?filters[slug][\$eq]=main-menu&populate[menuItems][populate][0]=children.children&populate[menuItems][populate][1]=parent"
```

### Frontend Test

1. Make sure your frontend is using the Navigation component:
   ```tsx
   import Navigation from '@/components/navigation';
   
   <Navigation menuSlug="main-menu" className="header-nav" />
   ```

2. The component will automatically:
   - Show top-level items in the header
   - Create dropdowns for items with children
   - Show arrows (▸) for items with grandchildren
   - Create nested dropdowns on hover

## Styling Notes

The navigation component uses Tailwind classes. Key styling features:

- **Hover Dropdowns**: `group-hover:opacity-100 group-hover:visible`
- **Nested Dropdowns**: Position `left-full` to appear to the right
- **Arrows**: Shows `▸` when `showArrow={true}`
- **Transitions**: Smooth fade-in with `transition-all duration-200`

## Customization

### Change Arrow Style

Edit the arrow in `components/navigation.tsx` line 28:

```tsx
{showArrow && <span className="ml-1">▸</span>}
```

Change to:
```tsx
{showArrow && <span className="ml-1">→</span>}
// or
{showArrow && <ChevronRight className="w-4 h-4 ml-1" />}
```

### Change Dropdown Position

For dropdowns that appear left instead of right:

```tsx
// Current (right-side nested)
className="absolute left-full top-0 ml-1"

// Change to (left-side nested)
className="absolute right-full top-0 mr-1"
```

### Add Icons

1. Add icon field in Strapi menu item
2. The navigation component already supports it:
   ```tsx
   {item.icon && <span className={`icon ${item.icon}`} />}
   ```

## Troubleshooting

### Menu Not Showing

1. Check menu exists in Strapi with slug "main-menu"
2. Verify menu items are published
3. Check browser console for errors
4. Test API endpoint directly (see API Test above)

### Dropdowns Not Appearing

1. Check that items have proper parent relationships
2. Verify children are being populated in API response
3. Check CSS - ensure `group` and `group-hover` classes are present
4. Check z-index - dropdowns should have `z-50`

### Arrows Not Showing

1. Verify child items exist and are populated
2. Check that `showArrow` prop is passed to MenuItemComponent
3. Verify condition: `child.children && child.children.length > 0`

## Next Steps

After setting up your menu:

1. ✅ Verify all 3 levels appear correctly
2. ✅ Test hover interactions
3. ✅ Test on mobile (shows as nested list)
4. ✅ Add any custom styling
5. ✅ Consider adding icons to menu items
6. ✅ Set up similar menus for "Library" and "Blog" if needed

## Additional Resources

- **Menu Schema**: `/src/api/menu/content-types/menu/schema.json`
- **Menu Item Schema**: `/src/api/menu-item/content-types/menu-item/schema.json`
- **Navigation Component**: `/components/navigation.tsx`
- **API Functions**: `/lib/strapi-api.ts` (lines 674-803)
- **Import Script**: `/scripts/create-courses-menu.js`
