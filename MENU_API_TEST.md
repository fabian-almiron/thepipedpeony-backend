# Menu API Testing Guide

## Test the Menu API

After enabling permissions in Strapi, test the API with these commands:

### 1. Test if menus are accessible:
```bash
curl "http://localhost:1337/api/menus"
```

### 2. Test if menu items are populated:
```bash
curl "http://localhost:1337/api/menus?populate=menuItems"
```

### 3. Test with full nested structure (this is what the frontend uses):
```bash
curl "http://localhost:1337/api/menus?populate[menuItems][populate]=children"
```

### 4. Test specific menu by slug:
```bash
curl "http://localhost:1337/api/menus?filters[slug][\$eq]=logged-out-header&populate[menuItems][populate]=children"
```

## Expected Response

You should see JSON data like:
```json
{
  "data": [
    {
      "id": 11,
      "documentId": "...",
      "title": "Logged out Header",
      "slug": "logged-out-header",
      "description": null,
      "menuItems": [
        {
          "id": 71,
          "title": "Blog",
          "url": "/blog",
          "target": "_self",
          "order": 0,
          "isExternal": false,
          "children": []
        }
      ]
    }
  ]
}
```

## Troubleshooting

### If you get an empty response or error 403:
- Go to **Settings → Users & Permissions → Roles → Public**
- Enable `find` and `findOne` for both **Menu** and **Menu-item**
- Click Save

### If menu items are not showing:
- Make sure menu items are **Published** (not draft)
- Check that menu items have the **menu** relation field set
- Verify the `order` field to control display order

### If menus are not showing:
- Make sure menus are **Published** (not draft)
- Check that the slug matches what the frontend is looking for:
  - `logged-out-header` for non-authenticated users
  - `logged-in-header` for authenticated users

