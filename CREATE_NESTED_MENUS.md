# How to Create Nested Menu Items (Dropdowns)

## 🎯 You Want This Structure:

```
library ▼
├── Color Library
└── Recipe Library

blog

shop

details ▼
├── The Black Series
├── The Blue Series
├── The Brown Series
└── (and more...)
```

## 📋 Two Ways to Create This:

### Option 1: Manual Creation in Strapi (Recommended First Time)

#### Step 1: Create Parent Menu Items

Go to **Content Manager → Menu Item → Create new entry**

**Create "library":**
- Title: `library`
- URL: `#` (makes it non-clickable, just opens dropdown)
- Order: `0`
- Menu: Select `Logged in Header`
- Parent: (leave empty)
- **Save & Publish**

**Create "blog":**
- Title: `blog`
- URL: `/blog`
- Order: `10`
- Menu: Select `Logged in Header`
- Parent: (leave empty)
- **Save & Publish**

**Create "shop":**
- Title: `shop`
- URL: `/shop`
- Order: `20`
- Menu: Select `Logged in Header`
- Parent: (leave empty)
- **Save & Publish**

**Create "details":**
- Title: `details`
- URL: `#`
- Order: `30`
- Menu: Select `Logged in Header`
- Parent: (leave empty)
- **Save & Publish**

#### Step 2: Create Child Menu Items (Dropdown Items)

**Under "library" → Create "Color Library":**
- Title: `Color Library`
- URL: `/color-library`
- Order: `0`
- Menu: Select `Logged in Header`
- **Parent: Select `library`** ⭐ THIS IS THE KEY!
- **Save & Publish**

**Under "library" → Create "Recipe Library":**
- Title: `Recipe Library`
- URL: `/recipe-library`
- Order: `1`
- Menu: Select `Logged in Header`
- **Parent: Select `library`** ⭐
- **Save & Publish**

**Under "details" → Create all the series:**

For each series, create a menu item with:
- Title: `The [Color] Series` (e.g., "The Black Series")
- URL: `/series/black` (or appropriate URL)
- Order: `0, 1, 2, 3...` (sequential)
- Menu: Select `Logged in Header`
- **Parent: Select `details`** ⭐
- **Save & Publish**

Series to create:
1. The Black Series (order: 0)
2. The Blue Series (order: 1)
3. The Brown Series (order: 2)
4. The Green Series (order: 3)
5. The Orange Series (order: 4)
6. The Pink Series (order: 5)
7. The Purple Series (order: 6)
8. The Yellow Series (order: 7)
9. The White Series (order: 8)

### Option 2: Automated Script (Quick Setup)

I've created a script that can create all of this automatically.

#### Run the script:

```bash
cd /Users/mac/Documents/9S/CLIENTS/The\ Piped\ Peony/strapi-first-build
node scripts/create-logged-in-menu.js
```

The script will:
- ✅ Create or find the "Logged in Header" menu
- ✅ Create all parent items (library, blog, shop, details)
- ✅ Create all child items with proper parent relationships
- ✅ Set correct order numbers
- ✅ Publish everything automatically

**Note:** If you already have menu items, you may want to delete them first or manually organize them.

## 🎨 The Magic: Parent Field

The **Parent** field is what creates the dropdown:

```
┌──────────────────────────┐
│ Parent Item              │
│ - Parent: (empty)        │ ← Top level
│ - URL: #                 │
└──────────────────────────┘
        │
        │ "has children"
        ▼
┌──────────────────────────┐
│ Child Item 1             │
│ - Parent: [Parent Item]  │ ← Points to parent!
│ - URL: /page1            │
└──────────────────────────┘

┌──────────────────────────┐
│ Child Item 2             │
│ - Parent: [Parent Item]  │ ← Points to parent!
│ - URL: /page2            │
└──────────────────────────┘
```

## ✅ Checklist After Creating Nested Menus

- [ ] All parent items are Published
- [ ] All child items are Published
- [ ] Each child has its `Parent` field set correctly
- [ ] Order numbers are sequential (0, 1, 2, 3...)
- [ ] Menu & Menu-item API permissions are enabled
- [ ] Frontend is restarted

## 🧪 Test It

1. Open http://localhost:3000
2. Hover over "library" → Should show dropdown with Color Library and Recipe Library
3. Hover over "details" → Should show dropdown with all color series

## 📱 Mobile Behavior

On mobile devices:
- Tap parent items (library, details) to expand/collapse their children
- Children appear as indented items in the mobile menu
- Works automatically with the existing Navigation component

## 💡 Pro Tips

### Use `#` for non-clickable parents
If you want the parent to ONLY show a dropdown (not link anywhere):
```
URL: #
```

### Order numbers with gaps
Use gaps in order numbers (0, 10, 20, 30) so you can easily insert items later:
```
Order: 0  → library
Order: 10 → blog
Order: 20 → shop
Order: 30 → details

Need to add something between blog and shop?
Order: 15 → new item (easy!)
```

### Styling child items differently
You can use the `cssClass` field to add custom CSS classes to menu items for special styling.

## 🐛 Troubleshooting

### Dropdown not appearing?
- Check that child items have `Parent` field set
- Verify both parent and children are Published
- Make sure you're hovering on desktop (or tapping on mobile)

### Items in wrong order?
- Edit each item and adjust the `Order` field
- Lower numbers appear first

### Wrong items in dropdown?
- Edit the child item
- Change its `Parent` field to point to the correct parent item

## 📖 Related Documentation

- **NESTED_MENU_GUIDE.md** - Complete guide with more examples
- **MENU_TROUBLESHOOTING.md** - If things aren't working
- **MENU_SETUP_VISUAL.md** - Visual diagrams of the system

## 🚀 Ready to Go!

After creating your nested menus, just refresh your frontend and you'll see beautiful dropdowns! The Navigation component handles all the styling and interaction automatically.

