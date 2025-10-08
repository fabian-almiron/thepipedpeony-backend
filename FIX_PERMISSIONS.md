# 🔓 Fix Strapi Permissions - URGENT

## Error: "Forbidden access" when fetching subscriptions

You need to enable Public permissions for the Subscription content type.

### Quick Fix Steps:

1. **Go to Strapi Admin**: http://localhost:1337/admin

2. **Navigate to Settings**:
   - Click **Settings** (⚙️) in left sidebar
   - Scroll to **Users & Permissions plugin**
   - Click **Roles**

3. **Click on "Public" role**

4. **Find "Subscription" section** (scroll down)

5. **Enable these permissions**:
   - ✅ Check **find**
   - ✅ Check **findOne**

6. **Click SAVE** (top right)

## That's it! The subscription fetch should work now.

Test by refreshing your signup page.
