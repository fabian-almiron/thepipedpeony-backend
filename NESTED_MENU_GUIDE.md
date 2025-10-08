# Creating Nested/Dropdown Menu Items

## Visual Example

Your screenshot shows this structure:
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
├── The Green Series
├── The Orange Series
├── The Pink Series
├── The Purple Series
├── The Yellow Series
└── The White Series
```

## How to Create This in Strapi

### Part 1: Create Parent Items (Top-Level)

These are the items that show in the main navigation bar.

#### Create "library" (Parent)
```
Content Manager → Menu Item → Create new entry

Title: library
URL: #
Order: 0
Target: _self
Menu: [Select "Logged in Header"]
Parent: (leave empty)
Description: (optional)

Save → Publish
```

#### Create "blog"
```
Title: blog
URL: /blog
Order: 10
Menu: [Select "Logged in Header"]
Parent: (leave empty)

Save → Publish
```

#### Create "shop"
```
Title: shop
URL: /shop
Order: 20
Menu: [Select "Logged in Header"]
Parent: (leave empty)

Save → Publish
```

#### Create "details" (Parent)
```
Title: details
URL: #
Order: 30
Menu: [Select "Logged in Header"]
Parent: (leave empty)

Save → Publish
```

### Part 2: Create Child Items (Dropdown Items)

These items will appear when you hover over their parent.

#### Children of "library"

**Color Library:**
```
Title: Color Library
URL: /color-library
Order: 0
Menu: [Select "Logged in Header"]
Parent: [Select "library"] ⭐ THIS IS THE KEY!

Save → Publish
```

**Recipe Library:**
```
Title: Recipe Library
URL: /recipe-library
Order: 1
Menu: [Select "Logged in Header"]
Parent: [Select "library"] ⭐

Save → Publish
```

#### Children of "details"

**The Black Series:**
```
Title: The Black Series
URL: /series/black
Order: 0
Menu: [Select "Logged in Header"]
Parent: [Select "details"] ⭐

Save → Publish
```

**The Blue Series:**
```
Title: The Blue Series
URL: /series/blue
Order: 1
Menu: [Select "Logged in Header"]
Parent: [Select "details"] ⭐

Save → Publish
```

**Repeat for all color series...**
- The Brown Series (order: 2)
- The Green Series (order: 3)
- The Orange Series (order: 4)
- The Pink Series (order: 5)
- The Purple Series (order: 6)
- The Yellow Series (order: 7)
- The White Series (order: 8)

## Important Tips

### 1. **Order Numbers Matter**

**For Parent Items** (main navigation):
```
Order: 0  → library
Order: 10 → blog
Order: 20 → shop
Order: 30 → details
```
Lower numbers appear first in the main menu.

**For Child Items** (within each dropdown):
```
Under "library":
  Order: 0 → Color Library (appears first)
  Order: 1 → Recipe Library (appears second)

Under "details":
  Order: 0 → The Black Series (appears first)
  Order: 1 → The Blue Series
  Order: 2 → The Brown Series
  ... and so on
```

### 2. **Parent Field is the Key**

- **Top-level items**: Parent field is EMPTY
- **Dropdown items**: Parent field points to the parent menu item

### 3. **Using # for Non-Clickable Parents**

If you want the parent item to ONLY open a dropdown (not link anywhere):
```
URL: #
```

If you want the parent item to be clickable AND have a dropdown:
```
URL: /library (or any real page)
```

### 4. **All Items Must Be Published**

Don't forget to click **Publish** on every menu item!

## Quick Reference: Creating a Dropdown

```
Step 1: Create Parent
┌─────────────────────────┐
│ Title: My Menu          │
│ URL: #                  │
│ Parent: (empty)         │ ← Empty = top level
│ Order: 20               │
└─────────────────────────┘

Step 2: Create Children
┌─────────────────────────┐
│ Title: Child 1          │
│ URL: /child-1           │
│ Parent: [My Menu] ←───  │ ← Set parent!
│ Order: 0                │
└─────────────────────────┘

┌─────────────────────────┐
│ Title: Child 2          │
│ URL: /child-2           │
│ Parent: [My Menu] ←───  │
│ Order: 1                │
└─────────────────────────┘
```

## Visual Result

On your frontend, this will render as:

**Desktop:**
```
┌────────────────────────────────────────────┐
│  library ▼   blog   shop   details ▼       │
└────────────────────────────────────────────┘
     │                            │
     │ Hover                      │ Hover
     ▼                            ▼
┌─────────────┐            ┌──────────────────┐
│Color Library│            │The Black Series  │
│Recipe Library│           │The Blue Series   │
└─────────────┘            │The Brown Series  │
                           │The Green Series  │
                           │The Orange Series │
                           │...               │
                           └──────────────────┘
```

**Mobile:**
```
☰ Menu (tap to open)
  ├─ library ▼ (tap to expand)
  │  ├─ Color Library
  │  └─ Recipe Library
  ├─ blog
  ├─ shop
  └─ details ▼ (tap to expand)
     ├─ The Black Series
     ├─ The Blue Series
     └─ ...
```

## Existing Menu Items You Can Use

From your screenshot in Strapi, you already have some menu items. You can edit them to set up the nesting:

**Existing Items to Convert to Parents:**
- Edit any existing "Library" or similar item
- Change its URL to `#`
- Make sure Parent is empty

**Existing Items to Convert to Children:**
- Edit items like "Color Library", "Recipe Library"
- Set their `Parent` field to point to "library"
- Set appropriate order numbers

## Common Issues

### Dropdown not showing?
- Make sure child items have `Parent` field set
- Verify both parent and children are Published
- Check order numbers are set correctly

### Items in wrong order?
- Edit each item and adjust the `Order` field
- Remember: lower numbers = appears first

### Dropdown shows on wrong parent?
- Edit the child item
- Change the `Parent` field to the correct parent

## Recipe for Your Exact Screenshot

Here's the exact structure to recreate your screenshot:

```
1. Create Parent: "library" (order: 0, url: #, parent: empty)
2. Create Child: "Color Library" (order: 0, url: /color-library, parent: library)
3. Create Child: "Recipe Library" (order: 1, url: /recipe-library, parent: library)

4. Create Parent: "blog" (order: 10, url: /blog, parent: empty)

5. Create Parent: "shop" (order: 20, url: /shop, parent: empty)

6. Create Parent: "details" (order: 30, url: #, parent: empty)
7. Create Child: "The Black Series" (order: 0, url: /series/black, parent: details)
8. Create Child: "The Blue Series" (order: 1, url: /series/blue, parent: details)
9. Create Child: "The Brown Series" (order: 2, url: /series/brown, parent: details)
10. Create Child: "The Green Series" (order: 3, url: /series/green, parent: details)
11. Create Child: "The Orange Series" (order: 4, url: /series/orange, parent: details)
12. Create Child: "The Pink Series" (order: 5, url: /series/pink, parent: details)
13. Create Child: "The Purple Series" (order: 6, url: /series/purple, parent: details)
14. Create Child: "The Yellow Series" (order: 7, url: /series/yellow, parent: details)
15. Create Child: "The White Series" (order: 8, url: /series/white, parent: details)
```

All items should be in the **"Logged in Header"** menu.

## Testing Your Changes

After creating nested items:
1. Make sure all are Published
2. Refresh frontend: http://localhost:3000
3. Hover over parent items to see dropdowns
4. On mobile, tap parent items to expand

The Navigation component automatically handles the dropdown display!

