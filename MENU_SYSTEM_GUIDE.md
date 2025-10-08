# 🧭 Menu System Guide

## Overview
This guide explains how to use the custom Menu system in Strapi v5 for managing navigation menus in your Next.js frontend.

## 📋 Content Types Created

### 1. Menu
- **Purpose**: Top-level navigation containers
- **Fields**:
  - `title` (Text, Required): Display name for the menu
  - `slug` (UID, Required): Unique identifier (auto-generated from title)
  - `description` (Text, Optional): Description of the menu's purpose
  - `menuItems` (Relation): One-to-many relation with Menu Items

### 2. Menu Item
- **Purpose**: Individual navigation links within menus
- **Fields**:
  - `title` (Text, Required): Display text for the link
  - `url` (Text, Required): Link destination (e.g., "/", "/about", "https://external.com")
  - `target` (Enumeration): Link target (`_self`, `_blank`, `_parent`, `_top`)
  - `order` (Integer): Sort order within the menu
  - `isExternal` (Boolean): Whether the link is external
  - `description` (Text, Optional): Tooltip or description
  - `icon` (Text, Optional): CSS class for icons
  - `cssClass` (Text, Optional): Additional CSS classes
  - `menu` (Relation): Many-to-one relation with Menu
  - `parent` (Relation): Self-referencing for nested menus
  - `children` (Relation): Self-referencing for nested menus

## 🔧 Setup Instructions

### 1. Strapi Permissions
Make sure the following permissions are enabled for the **Public** role:

**Menu**:
- ✅ find
- ✅ findOne

**Menu Item**:
- ✅ find
- ✅ findOne

### 2. Creating Menus in Strapi Admin

1. **Create a Menu**:
   - Go to Content Manager → Menu
   - Click "Create new entry"
   - Fill in:
     - Title: "Main Navigation" (or your preferred name)
     - Slug: Will auto-generate (e.g., "main-navigation")
     - Description: Optional description
   - Save & Publish

2. **Create Menu Items**:
   - Go to Content Manager → Menu Item
   - Click "Create new entry"
   - Fill in:
     - Title: "Home"
     - URL: "/"
     - Target: "_self"
     - Order: 1
     - Is External: false
     - Menu: Select your created menu
   - Save & Publish
   - Repeat for other menu items

3. **Creating Nested Menus** (Optional):
   - Create a parent menu item first
   - Create child menu items and set the "Parent" field to the parent item

## 🚀 Frontend Integration

### API Functions Available

```typescript
// Fetch a specific menu by slug
const { data: menu, error } = await fetchMenu('main-navigation');

// Fetch all menus
const { data: menus, error } = await fetchAllMenus();
```

### Using the Navigation Component

```tsx
import Navigation from '@/components/navigation';

// In your layout or header component
<Navigation 
  menuSlug="main-navigation" 
  className="flex space-x-6" 
/>
```

### Example Menu Structure

```json
{
  "id": 1,
  "title": "Main Navigation",
  "slug": "main-navigation",
  "menuItems": [
    {
      "id": 1,
      "title": "Home",
      "url": "/",
      "target": "_self",
      "order": 1,
      "isExternal": false,
      "children": []
    },
    {
      "id": 2,
      "title": "Shop",
      "url": "/shop",
      "target": "_self",
      "order": 2,
      "isExternal": false,
      "children": [
        {
          "id": 3,
          "title": "All Products",
          "url": "/shop",
          "target": "_self",
          "order": 1,
          "isExternal": false
        }
      ]
    }
  ]
}
```

## 🎨 Customizing the Navigation Component

The Navigation component supports:

- **Dropdown menus**: Automatically created for items with children
- **External links**: Handled with proper `rel="noopener noreferrer"`
- **Custom CSS classes**: Via the `cssClass` field in menu items
- **Icons**: Via the `icon` field (add your icon CSS classes)

### Styling Example

```tsx
<Navigation 
  menuSlug="main-navigation" 
  className="hidden md:flex items-center space-x-8 text-gray-700"
/>
```

## 🧪 Testing

Visit `/test-menu` in your Next.js app to see:
- All available menus
- Menu structure visualization
- Live navigation component demo

## 📝 Best Practices

1. **Menu Slugs**: Use descriptive slugs like "main-nav", "footer-nav", "mobile-nav"
2. **Order Field**: Use increments of 10 (10, 20, 30) to allow easy reordering
3. **External Links**: Always set `isExternal: true` for external URLs
4. **Nested Menus**: Keep nesting to 2 levels maximum for better UX
5. **Publishing**: Always publish both Menu and Menu Items for them to appear in the API

## 🔍 Troubleshooting

**Menu not appearing?**
- Check that both Menu and Menu Items are published
- Verify permissions are set for Public role
- Check the menu slug matches what you're using in the component

**API returning empty?**
- Ensure Strapi is running on http://localhost:1337
- Check browser network tab for API errors
- Verify the populate parameters are working correctly

**Dropdown not working?**
- Make sure parent-child relationships are set correctly
- Check that CSS hover states are properly configured
- Ensure z-index is high enough for dropdowns

## 🚀 Next Steps

1. Replace hardcoded navigation in your header with the Navigation component
2. Create different menus for different sections (header, footer, mobile)
3. Add icons and custom styling to match your design
4. Consider adding menu caching for better performance

---

**Created**: October 2025  
**Strapi Version**: v5.25.0  
**Next.js Version**: 15.2.4