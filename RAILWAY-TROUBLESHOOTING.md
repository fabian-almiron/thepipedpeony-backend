# Railway Deployment Troubleshooting

## Current Issue: Permission Denied & SQLite Error

### Problem 1: Permission Error (FIXED in new Dockerfile)
The error `EACCES: permission denied, mkdir '/app/.tmp'` has been fixed in the updated Dockerfile.

### Problem 2: Using SQLite Instead of PostgreSQL

The error shows `SqliteDialect.configure` which means Strapi is trying to use SQLite instead of PostgreSQL.

## ✅ Critical Checks

### 1. Verify PostgreSQL Database is Added

In Railway:
- Go to your project
- You should see TWO services: 
  - Your app service (from GitHub)
  - A PostgreSQL database service

If you don't see PostgreSQL:
1. Click "New"
2. Select "Database" → "Add PostgreSQL"
3. Wait for it to provision

### 2. Verify DATABASE_URL Exists

After adding PostgreSQL:
1. Go to your app service (not the database)
2. Click "Variables" tab
3. **CRITICAL**: Look for `DATABASE_URL` in the list
4. It should be there automatically (Railway connects them)

If `DATABASE_URL` is NOT there:
1. Go to your app service
2. Click "Variables"
3. Click "+ New Variable"
4. Click "Add Reference"
5. Select the PostgreSQL database
6. Choose `DATABASE_URL`

### 3. Verify All Environment Variables

Your app service should have these variables:

```
✅ NODE_ENV=production
✅ HOST=0.0.0.0
✅ PORT=1337
✅ DATABASE_CLIENT=postgres
✅ DATABASE_URL=postgresql://... (Auto-added by Railway)
✅ DATABASE_SSL=true
✅ DATABASE_SSL_REJECT_UNAUTHORIZED=false
✅ APP_KEYS=...
✅ API_TOKEN_SALT=...
✅ ADMIN_JWT_SECRET=...
✅ TRANSFER_TOKEN_SALT=...
✅ JWT_SECRET=...
```

## 🔄 After Fixing Dockerfile

### Step 1: Commit and Push Changes
```bash
git add Dockerfile
git commit -m "Fix permissions for Railway deployment"
git push
```

### Step 2: Railway will Auto-Deploy
- Railway should automatically detect the push
- It will rebuild with the new Dockerfile
- Monitor the deployment logs

### Step 3: Force Rebuild (if auto-deploy doesn't trigger)
In Railway:
1. Go to your app service
2. Click "Deployments"
3. Click the three dots on the latest deployment
4. Select "Redeploy"

## 🐛 If Still Failing

### Check Build Logs
1. Go to Railway → Your service
2. Click "Deployments"
3. Click on the active deployment
4. Check the "Build Logs" tab

### Check Deploy Logs
1. Same location as above
2. Click "Deploy Logs" tab
3. Look for any DATABASE_CLIENT or connection errors

### Common Issues

**Issue**: Still seeing SQLite errors
**Fix**: `DATABASE_URL` is not set. Go back to step 2 above.

**Issue**: "Connection refused" or "ECONNREFUSED"
**Fix**: PostgreSQL might not be running. Check the database service status.

**Issue**: "password authentication failed"
**Fix**: There's a mismatch in credentials. Delete and re-add the DATABASE_URL reference.

## 📧 What to Check Next

1. ✅ Dockerfile updated and pushed
2. ✅ PostgreSQL database added to project
3. ✅ DATABASE_URL exists in app variables
4. ✅ All other environment variables set
5. ✅ Deployment triggered

## 🎯 Expected Success

When working correctly, you should see:
```
[INFO] Using postgres database
[INFO] Server started on port 1337
[INFO] ✨ Admin panel: https://your-app.railway.app/admin
```

No SQLite mentions, no permission errors.

