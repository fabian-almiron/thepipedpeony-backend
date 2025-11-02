# Deploying to Railway

This guide will help you deploy your Strapi 5 application to Railway.

## Prerequisites

1. A [Railway](https://railway.app/) account
2. Railway CLI (optional but recommended): `npm i -g @railway/cli`

## Quick Deploy

### Option 1: Deploy from GitHub (Recommended)

1. Push your code to a GitHub repository
2. Go to [Railway](https://railway.app/)
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your repository
6. Railway will automatically detect the Dockerfile

### Option 2: Deploy with Railway CLI

```bash
# Install Railway CLI (if not already installed)
npm i -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Deploy
railway up
```

## Environment Variables

After deployment, you **MUST** set these environment variables in Railway:

### Required Variables

Go to your project in Railway → Variables tab and add:

```env
# Node Environment
NODE_ENV=production

# Server Configuration
HOST=0.0.0.0
PORT=1337

# Strapi Secrets (GENERATE NEW ONES - DO NOT USE THESE EXAMPLES!)
APP_KEYS=key1here,key2here,key3here,key4here
API_TOKEN_SALT=your-random-salt-here
ADMIN_JWT_SECRET=your-random-secret-here
TRANSFER_TOKEN_SALT=your-random-transfer-salt-here
JWT_SECRET=your-random-jwt-secret-here

# Database Configuration
DATABASE_CLIENT=postgres
```

### Generate Secrets

You can generate secure random secrets using Node.js:

```bash
# Generate a random secret (run this for each secret needed)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Or for APP_KEYS (needs 4 keys separated by commas)
node -e "console.log([...Array(4)].map(() => require('crypto').randomBytes(32).toString('base64')).join(','))"
```

## Database Setup

### Add PostgreSQL Database

1. In your Railway project, click "New"
2. Select "Database" → "Add PostgreSQL"
3. Railway will automatically create a `DATABASE_URL` environment variable
4. Add these additional database variables:

```env
DATABASE_SSL=true
DATABASE_SSL_REJECT_UNAUTHORIZED=false
```

## Post-Deployment Steps

### 1. Access Your Admin Panel

Once deployed, visit:
```
https://your-app.up.railway.app/admin
```

Create your first admin user.

### 2. Configure CORS (if needed)

If you have a frontend application, update `config/middlewares.ts` to allow your frontend domain:

```typescript
export default [
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'https://res.cloudinary.com'],
          'media-src': ["'self'", 'data:', 'blob:', 'https://res.cloudinary.com'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      origin: ['https://your-frontend-domain.com'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
      keepHeaderOnError: true,
    },
  },
  // ... rest of middlewares
];
```

### 3. File Uploads

By default, Strapi stores uploads in the `public/uploads` folder. For production, consider using:

- **Cloudinary** (recommended for images)
- **AWS S3**
- **Railway Volumes** (for persistent storage)

#### To use Railway Volumes:

1. In Railway, go to your service
2. Click "Settings" → "Volumes"
3. Add a volume with mount path: `/app/public/uploads`

## Monitoring

### Health Check

The Dockerfile includes a health check endpoint. Railway will automatically monitor it.

### Logs

View logs in Railway dashboard or via CLI:

```bash
railway logs
```

## Troubleshooting

### Build Fails

- Check that all dependencies are in `package.json`
- Verify Node version compatibility (18-22)

### Database Connection Issues

- Verify `DATABASE_URL` is set (should be automatic with Railway PostgreSQL)
- Check `DATABASE_SSL` is set to `true`

### App Crashes on Start

- Ensure all required environment variables are set
- Check logs: `railway logs`
- Verify APP_KEYS and other secrets are properly formatted

### Admin Panel 404

- Make sure you ran `npm run build` (Dockerfile does this automatically)
- Check that `NODE_ENV=production`

## Updating Your Deployment

Railway automatically redeploys when you push to your connected GitHub branch.

Or using CLI:
```bash
railway up
```

## Custom Domain

1. Go to your service in Railway
2. Click "Settings" → "Domains"
3. Click "Custom Domain"
4. Follow the instructions to add your domain

## Resources

- [Railway Documentation](https://docs.railway.app/)
- [Strapi Documentation](https://docs.strapi.io/)
- [Strapi Deployment Guide](https://docs.strapi.io/dev-docs/deployment)

