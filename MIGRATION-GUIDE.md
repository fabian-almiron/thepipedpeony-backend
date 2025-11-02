# Migrating Local Data to Railway

## Overview

Your Railway deployment has the **schema** (content types, structure) but not your **data** (actual content entries). This guide shows you how to migrate your local SQLite data to Railway PostgreSQL.

---

## 🎯 What Needs Migration:

- ✅ Content entries (blogs, products, recipes, courses, etc.)
- ✅ Media files (images, uploads)
- ✅ Admin users
- ✅ Settings/configurations

---

## Option 1: Strapi Transfer Command (Recommended)

Strapi 5 has a built-in transfer feature for moving data between environments.

### Step 1: Create Transfer Token on Railway

1. Go to your Railway Strapi admin: `https://your-app.railway.app/admin`
2. Log in (create admin user if you haven't)
3. Go to **Settings** → **API Tokens** → **Transfer Tokens**
4. Click **"Create new Transfer Token"**
5. Name it: `migration-token`
6. Set permissions: **Full Access**
7. **Copy the token** (you'll only see it once!)

### Step 2: Run Transfer from Local

In your local project directory:

```bash
# Make sure you're running the latest version
npm install

# Run the transfer command
npx strapi transfer \
  --to https://your-app.railway.app/admin \
  --to-token YOUR_TRANSFER_TOKEN_HERE
```

**Replace:**
- `https://your-app.railway.app` with your actual Railway URL
- `YOUR_TRANSFER_TOKEN_HERE` with the token you copied

### What This Does:
- ✅ Transfers all content
- ✅ Transfers media files
- ✅ Maintains relationships
- ✅ One command solution

---

## Option 2: Export/Import via Admin Panel

### Step 1: Export from Local

1. Start your local Strapi: `npm run develop`
2. Go to: `http://localhost:1337/admin`
3. For each content type:
   - Go to Content Manager
   - Select all entries
   - Click "Export" (if available)
   - Save as JSON/CSV

### Step 2: Import to Railway

1. Go to your Railway admin: `https://your-app.railway.app/admin`
2. For each content type:
   - Go to Content Manager
   - Click "Import"
   - Upload your exported files

**⚠️ Note:** This method doesn't preserve IDs or relationships well. Use Option 1 if possible.

---

## Option 3: Database Migration Script

If you have complex data or need more control:

### Step 1: Export Local SQLite Data

```bash
# Install SQLite tools if needed (macOS)
brew install sqlite3

# Navigate to your project
cd /Users/mac/Documents/9S/CLIENTS/The\ Piped\ Peony/pp-back-end

# Export data
sqlite3 .tmp/data.db .dump > local-backup.sql
```

### Step 2: Convert SQLite to PostgreSQL

SQLite and PostgreSQL have different syntax. You'll need to convert:

```bash
# Install conversion tool
npm install -g sqlite-to-postgres

# Convert the dump
sqlite-to-postgres local-backup.sql > postgres-data.sql
```

### Step 3: Import to Railway PostgreSQL

```bash
# Install Railway CLI if not installed
npm i -g @railway/cli

# Link your project
railway link

# Connect to PostgreSQL
railway connect postgres

# In the PostgreSQL prompt:
\i postgres-data.sql
```

**⚠️ Warning:** This method is complex and error-prone. Only use if Options 1-2 don't work.

---

## Option 4: Manual Content Recreation

If you don't have much content:

1. Go to Railway admin: `https://your-app.railway.app/admin`
2. Manually recreate content entries
3. Re-upload media files

**Good for:** Small amounts of content, testing

---

## 🎯 Recommended Approach:

### For Strapi 5: Use Option 1 (Transfer Command)

It's:
- ✅ Built into Strapi
- ✅ Handles media files
- ✅ Preserves relationships
- ✅ One command
- ✅ Officially supported

---

## 📝 Step-by-Step: Transfer Command

### 1. Get Your Railway URL

Find it in Railway Dashboard → Your service → Settings → Domains

Example: `https://thepipedpeony-backend.up.railway.app`

### 2. Create Admin User on Railway (if not done)

Visit: `https://your-app.railway.app/admin`

### 3. Create Transfer Token

Settings → API Tokens → Transfer Tokens → Create new

### 4. Run Transfer from Local

```bash
npx strapi transfer \
  --to https://thepipedpeony-backend.up.railway.app/admin \
  --to-token your_token_here
```

### 5. Confirm Transfer

The command will show:
- Number of entries to transfer
- Content types
- Media files

Type `y` to confirm.

### 6. Wait for Completion

The transfer may take several minutes depending on:
- Amount of content
- Number of media files
- Network speed

---

## ✅ Verify Migration

After transfer completes:

1. Go to Railway admin: `https://your-app.railway.app/admin`
2. Check Content Manager for each content type
3. Verify:
   - ✅ All entries are present
   - ✅ Images/media files are working
   - ✅ Relationships are intact
   - ✅ Published/Draft states are correct

---

## 🚨 Troubleshooting

### "Connection refused"
- Verify your Railway URL is correct
- Ensure app is running on Railway

### "Invalid token"
- Create a new transfer token
- Make sure you copied the full token

### "Permission denied"
- Ensure transfer token has **Full Access**

### Media files not transferring
- Check local `public/uploads` folder exists
- Verify Railway has write permissions (Dockerfile handles this)

### Partial transfer
- Run the command again - it should resume/skip existing

---

## 💡 Tips

- **Backup first**: Export local data before starting
- **Test admin user**: Create test user on Railway before transferring
- **Stable connection**: Use wired/stable internet for large transfers
- **Off-peak**: Transfer during low-traffic times if possible

---

## 🔄 Alternative: Fresh Start

If you have very little content, you might prefer to:

1. Start fresh on Railway
2. Manually recreate a few entries
3. Use it as an opportunity to clean up old content

This can be faster than migrating if you have minimal data.

---

## Need Help?

- Check Strapi docs: https://docs.strapi.io/dev-docs/data-management/transfer
- Verify your Strapi version: `npm list @strapi/strapi`
- Check transfer command options: `npx strapi transfer --help`

