# Uploading Files to Railway Deployment

Your database has file metadata, but the actual files aren't on Railway yet. Here's how to fix it:

## Option 1: Railway Volume (Persistent Storage)

### Step 1: Create a Volume in Railway

1. Go to Railway dashboard → Your service
2. Click **Settings** → **Volumes**
3. Click **New Volume**
4. Set mount path: `/app/public/uploads`
5. Click **Add**

### Step 2: Upload Your Files

Once the volume is created and mounted:

```bash
# Navigate to your old Strapi uploads directory
cd /path/to/old-strapi/public/uploads

# Create a tarball
tar -czf uploads.tar.gz *

# Upload via Railway CLI
railway run bash -c "cd /app/public/uploads && tar -xzf -" < uploads.tar.gz
```

**Note:** This preserves files across deployments!

---

## Option 2: Cloud Storage (Best for Production)

Use Cloudinary, AWS S3, or another cloud provider.

### Setup Cloudinary (Easiest)

1. **Install the plugin:**

```bash
npm install @strapi/provider-upload-cloudinary
```

2. **Add to `config/plugins.ts`:**

```typescript
export default ({ env }) => ({
  upload: {
    config: {
      provider: 'cloudinary',
      providerOptions: {
        cloud_name: env('CLOUDINARY_NAME'),
        api_key: env('CLOUDINARY_KEY'),
        api_secret: env('CLOUDINARY_SECRET'),
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
});
```

3. **Add environment variables in Railway:**
   - `CLOUDINARY_NAME`
   - `CLOUDINARY_KEY`
   - `CLOUDINARY_SECRET`

4. **Migrate existing files:**

You'll need to manually upload your existing files to Cloudinary and update the database URLs.

---

## Option 3: Manual Upload via SFTP/rsync

If Railway provides SSH access:

```bash
# Using rsync
rsync -avz /path/to/old-strapi/public/uploads/ railway:/app/public/uploads/
```

---

## About Thumbnail Regeneration

Strapi **does not** have a built-in thumbnail regeneration function. Thumbnails are generated on upload.

### If you need to regenerate thumbnails:

Install this community plugin:

```bash
npm install strapi-plugin-regenerate-thumbnails
```

Then run it from the admin panel: Settings → Regenerate Thumbnails

---

## Quick Test

After uploading files, verify they work:

1. Go to Media Library in admin
2. Click on an image
3. Check if it displays properly
4. Test the URL: `https://your-app.railway.app/uploads/filename.jpg`

---

## Recommended Approach

**For Production:** Use **Cloudinary** or **AWS S3**
- ✅ Reliable
- ✅ CDN included
- ✅ Automatic backups
- ✅ Image optimization

**For Testing:** Use **Railway Volume**
- ✅ Quick setup
- ✅ Free with Railway
- ⚠️  Limited by volume size

