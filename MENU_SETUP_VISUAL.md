# Menu System Visual Guide

## How the Menu System Works

```
┌─────────────────────────────────────────────────────────────────┐
│                         STRAPI CMS                              │
│                    (http://localhost:1337)                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Creates Content
                              ▼
        ┌─────────────────────────────────────────┐
        │         MENU COLLECTION                 │
        │  ┌───────────────────────────────┐      │
        │  │ Logged out Header             │      │
        │  │ slug: "logged-out-header"     │      │
        │  └───────────────────────────────┘      │
        │                                          │
        │  ┌───────────────────────────────┐      │
        │  │ Logged in Header              │      │
        │  │ slug: "logged-in-header"      │      │
        │  └───────────────────────────────┘      │
        └─────────────────────────────────────────┘
                              │
                              │ Has many
                              ▼
        ┌─────────────────────────────────────────┐
        │      MENU ITEM COLLECTION               │
        │  ┌───────────────────────────────┐      │
        │  │ Shop      → /shop      [0]    │      │
        │  │ Blog      → /blog      [1]    │      │
        │  │ Academy   → /academy   [2]    │      │
        │  │ Meet Dara → /about     [3]    │      │
        │  └───────────────────────────────┘      │
        │       │                                  │
        │       │ [#] = order number               │
        │       │ (controls display sequence)      │
        └───────┼─────────────────────────────────┘
                │
                │ Published & Permissions Set
                │
                ▼
        ┌─────────────────────────────────────────┐
        │         STRAPI REST API                 │
        │ /api/menus?populate[menuItems][...]     │
        └─────────────────────────────────────────┘
                              │
                              │ Fetches via HTTP
                              ▼
        ┌─────────────────────────────────────────┐
        │         NEXT.JS FRONTEND                │
        │      (http://localhost:3000)            │
        │                                          │
        │  ┌───────────────────────────────┐      │
        │  │   <Navigation> Component      │      │
        │  │   - Fetches menu by slug      │      │
        │  │   - Renders menu items        │      │
        │  │   - Handles dropdowns         │      │
        │  └───────────────────────────────┘      │
        └─────────────────────────────────────────┘
                              │
                              │ Displays to
                              ▼
        ┌─────────────────────────────────────────┐
        │              USER BROWSER               │
        │  ┌─────────────────────────────┐        │
        │  │  Shop | Blog | Academy      │        │
        │  │                                │        │
        │  └─────────────────────────────┘        │
        └─────────────────────────────────────────┘
```

## Permission Flow

```
WITHOUT PERMISSIONS SET:
STRAPI → ❌ API Blocked → ❌ Frontend gets nothing → ❌ Menu doesn't show

WITH PERMISSIONS SET:
STRAPI → ✅ API Accessible → ✅ Frontend gets data → ✅ Menu shows!
```

## Required Settings

### In Strapi Admin Panel:

```
Settings
  └── Users & Permissions
       └── Roles
            └── Public
                 ├── Menu
                 │    ├── ✅ find
                 │    └── ✅ findOne
                 └── Menu-item
                      ├── ✅ find
                      └── ✅ findOne
```

## Data Flow Example

### 1. You Create in Strapi:
```
Menu: "Logged out Header"
├── Title: "Logged out Header"
├── Slug: "logged-out-header"
└── Menu Items:
    ├── Shop (order: 0, url: /shop)
    ├── Blog (order: 1, url: /blog)
    └── About (order: 2, url: /about)
```

### 2. Strapi Stores as:
```json
{
  "id": 11,
  "title": "Logged out Header",
  "slug": "logged-out-header",
  "menuItems": [
    { "id": 75, "title": "Shop", "url": "/shop", "order": 0 },
    { "id": 71, "title": "Blog", "url": "/blog", "order": 1 },
    { "id": 67, "title": "About", "url": "/about", "order": 2 }
  ]
}
```

### 3. API Endpoint:
```
GET /api/menus?filters[slug][$eq]=logged-out-header&populate[menuItems][populate]=children
```

### 4. Frontend Receives:
```javascript
{
  data: {
    id: 11,
    title: "Logged out Header",
    slug: "logged-out-header",
    menuItems: [
      { title: "Shop", url: "/shop", order: 0 },
      { title: "Blog", url: "/blog", order: 1 },
      { title: "About", url: "/about", order: 2 }
    ]
  }
}
```

### 5. User Sees:
```
┌──────────────────────────────────────┐
│  🌸 Logo    Shop | Blog | About  🛒  │
└──────────────────────────────────────┘
```

## Creating a Dropdown Menu

```
Parent Menu Item:
┌─────────────────────┐
│ Title: Academy      │
│ URL: #              │ ← Use # for non-clickable
│ Order: 2            │
│ Parent: (empty)     │
└─────────────────────┘
        │
        │ Has children
        ▼
Child Menu Items:
┌─────────────────────┐  ┌─────────────────────┐
│ Title: Courses      │  │ Title: Library      │
│ URL: /courses       │  │ URL: /library       │
│ Order: 0            │  │ Order: 1            │
│ Parent: Academy ←───┤  │ Parent: Academy ←───┤
└─────────────────────┘  └─────────────────────┘

Result on Frontend:
┌───────────────────┐
│ Academy           │ ← Hover to show dropdown
└───────────────────┘
  ┌─────────────────┐
  │ Courses         │
  │ Library         │
  └─────────────────┘
```

## Troubleshooting Visual

### ❌ Problem: Menu Not Showing
```
Check each link in the chain:

1. Strapi running? 
   → Check: http://localhost:1337
   
2. Menu published?
   → Check: Content Manager → Menu
   
3. Menu items published?
   → Check: Content Manager → Menu Item
   
4. API permissions set?
   → Check: Settings → Roles → Public
   
5. API returning data?
   → Check: http://localhost:1337/api/menus
   
6. Frontend running?
   → Check: http://localhost:3000
   
7. Correct slug?
   → Check: Navigation component uses "logged-out-header"
```

### ✅ Working State
```
✓ Strapi running on :1337
✓ Menus are Published
✓ Menu Items are Published
✓ Menu Items linked to Menu
✓ API permissions enabled
✓ API returns JSON data
✓ Frontend fetches successfully
✓ Menu renders in header
```

## Menu Management Best Practices

### 1. **Use Clear Naming**
```
Good:
- "Main Header" or "Primary Navigation"
- "Logged In Header" / "Logged Out Header"
- "Footer Navigation"

Bad:
- "Menu 1", "Menu 2"
- "Test", "New Menu"
```

### 2. **Set Order Numbers Carefully**
```
Use increments of 10 for easy reordering:

Order: 0  → Home
Order: 10 → Shop
Order: 20 → Blog
Order: 30 → About

Later need to add between Shop and Blog?
Order: 15 → Academy (easy!)
```

### 3. **Use Descriptive URLs**
```
Good:
- /shop
- /about
- /blog
- /academy-details

Bad:
- /page1
- /p
- /details (too generic)
```

### 4. **Organize Submenus Logically**
```
Academy (parent)
├── All Courses
├── Beginner
├── Advanced
└── Upcoming

Not:
Random Items
├── Course
├── Shop
├── Another Course
└── About
```

## Quick Reference Commands

### Check if API is working:
```bash
curl "http://localhost:1337/api/menus?populate=menuItems"
```

### Check specific menu:
```bash
curl "http://localhost:1337/api/menus?filters[slug][\$eq]=logged-out-header&populate[menuItems][populate]=children"
```

### Restart services:
```bash
# Restart Strapi
cd strapi-first-build
npm run dev

# Restart Next.js
cd piped-peony-frontend
pnpm dev
```

