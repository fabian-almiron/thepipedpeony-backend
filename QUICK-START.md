# Quick Start: Deploy to Railway

This is the fastest way to get your Strapi app running on Railway.

## Step 1: Push to GitHub ✅

```bash
git add .
git commit -m "Ready for Railway deployment"
git push
```

## Step 2: Deploy to Railway 🚂

### Option A: Web Dashboard (Recommended)

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose this repository
5. Railway starts building...

### Option B: CLI

```bash
# Install CLI (if not installed)
npm i -g @railway/cli

# Login
railway login

# Initialize and deploy
railway init
railway up
```

## Step 3: Add PostgreSQL Database 🐘

**CRITICAL:** You must add PostgreSQL before your app will work!

### Option A: Web Dashboard (Easiest)

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Wait ~30 seconds for provisioning
4. ✅ Done! `DATABASE_URL` is auto-created

### Option B: CLI

```bash
# Make sure you're in the project directory
cd /path/to/pp-back-end

# Run the setup script
chmod +x railway-setup.sh
./railway-setup.sh

# Or manually:
railway add --database postgres
```

## Step 4: Add Environment Variables 🔐

1. Generate secrets:
```bash
npm run generate-secrets
```

2. Copy the output

3. In Railway:
   - Go to your **app service** (not the database)
   - Click **"Variables"**
   - Click **"RAW Editor"**
   - Paste this:

```bash
NODE_ENV=production
HOST=0.0.0.0
PORT=1337

# Paste your generated secrets here
APP_KEYS=your-generated-keys
API_TOKEN_SALT=your-generated-salt
ADMIN_JWT_SECRET=your-generated-secret
TRANSFER_TOKEN_SALT=your-generated-salt
JWT_SECRET=your-generated-secret

# Database Configuration
DATABASE_CLIENT=postgres
DATABASE_SSL=true
DATABASE_SSL_REJECT_UNAUTHORIZED=false
```

4. Click **"Update Variables"**

## Step 5: Wait for Deployment ⏳

Railway will automatically redeploy with the new environment variables.

Monitor progress:
- **Web**: Railway Dashboard → Your service → "Deployments"
- **CLI**: `railway logs`

## Step 6: Access Your App 🎉

Once deployed successfully:

### Get your URL:
- **Web**: Railway Dashboard → Your service → "Settings" → "Domains"
- **CLI**: `railway open`

### Visit Admin Panel:
```
https://your-app.railway.app/admin
```

Create your first admin user!

### Test API:
```
https://your-app.railway.app/api
```

---

## ⚠️ Troubleshooting

### "Permission denied" errors
✅ Fixed in latest Dockerfile - make sure you pushed latest code

### "SQLite" errors
❌ PostgreSQL database not added or DATABASE_URL missing
- Add PostgreSQL (Step 3)
- Verify `DATABASE_URL` exists in app variables

### Build fails
- Check Railway logs
- Verify all environment variables are set
- See [RAILWAY-TROUBLESHOOTING.md](./RAILWAY-TROUBLESHOOTING.md)

---

## 📚 More Help

- Detailed guide: [DEPLOYMENT.md](./DEPLOYMENT.md)
- Checklist: [RAILWAY-CHECKLIST.md](./RAILWAY-CHECKLIST.md)
- Troubleshooting: [RAILWAY-TROUBLESHOOTING.md](./RAILWAY-TROUBLESHOOTING.md)

