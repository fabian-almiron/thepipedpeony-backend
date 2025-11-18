# Railway Deployment Checklist ✅

## Pre-Deployment

- [ ] Ensure your code is pushed to GitHub
- [ ] Generate production secrets: `npm run generate-secrets`
- [ ] Save the generated secrets somewhere secure (you'll need them for Railway)

## Railway Setup

### 1. Create Project
- [ ] Go to [railway.app](https://railway.app)
- [ ] Click "New Project"
- [ ] Select "Deploy from GitHub repo"
- [ ] Choose your repository
- [ ] Railway will auto-detect the Dockerfile and start building

### 2. Add Database
- [ ] In your Railway project, click "New"
- [ ] Select "Database" → "Add PostgreSQL"
- [ ] Wait for database to be provisioned
- [ ] Note: `DATABASE_URL` is automatically created

### 3. Configure Environment Variables

Go to your service → "Variables" tab and add:

**Required Variables:**
- [ ] `NODE_ENV` = `production`
- [ ] `HOST` = `0.0.0.0`
- [ ] `PORT` = `1337`
- [ ] `DATABASE_CLIENT` = `postgres`
- [ ] `DATABASE_SSL` = `true`
- [ ] `DATABASE_SSL_REJECT_UNAUTHORIZED` = `false`

**Secrets (use values from `npm run generate-secrets`):**
- [ ] `APP_KEYS` = (4 comma-separated keys)
- [ ] `API_TOKEN_SALT` = (your generated value)
- [ ] `ADMIN_JWT_SECRET` = (your generated value)
- [ ] `TRANSFER_TOKEN_SALT` = (your generated value)
- [ ] `JWT_SECRET` = (your generated value)

### 4. Deploy
- [ ] Variables are saved
- [ ] Click "Deploy" or trigger redeploy
- [ ] Wait for build to complete (~3-5 minutes)

## Post-Deployment

### 5. Verify Deployment
- [ ] Check deployment logs for errors
- [ ] Visit your Railway URL (found in service settings)
- [ ] Visit `/admin` endpoint
- [ ] Create your first admin user

### 6. Optional: Configure Domain
- [ ] Go to service settings → "Domains"
- [ ] Add custom domain (if desired)
- [ ] Update DNS records as instructed

### 7. Optional: File Storage
If you need persistent file uploads:
- [ ] Add a Volume: Settings → Volumes → Add Volume
- [ ] Mount path: `/app/public/uploads`

OR

- [ ] Set up Cloudinary/S3 for media storage
- [ ] Add provider credentials to environment variables

## Testing

- [ ] Test API endpoints: `https://your-app.railway.app/api`
- [ ] Test admin login: `https://your-app.railway.app/admin`
- [ ] Upload a test file
- [ ] Create test content

## Troubleshooting

If deployment fails:
1. Check Railway logs for errors
2. Verify all environment variables are set correctly
3. Ensure DATABASE_URL is present (should be automatic)
4. Review [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed troubleshooting

## Need Help?

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions and troubleshooting.

