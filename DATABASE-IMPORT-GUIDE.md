# Database Import Guide for Railway

This guide explains how to import an existing Strapi database export into your Railway PostgreSQL deployment.

## Prerequisites

- Your database export file (`.sql` or `.sql.gz`)
- Railway CLI installed: `npm i -g @railway/cli`
- Railway project already deployed with PostgreSQL database

## Method 1: Using Railway CLI (Recommended)

### Step 1: Install Railway CLI

```bash
npm i -g @railway/cli
```

### Step 2: Login to Railway

```bash
railway login
```

### Step 3: Link to Your Project

```bash
cd /Users/mac/.cursor/worktrees/pp-back-end/5kCSU
railway link
```

Select your project from the list.

### Step 4: Get Database Connection Details

```bash
railway variables
```

Look for the `DATABASE_URL` variable. It will look like:
```
postgresql://postgres:password@host:port/railway
```

### Step 5: Import the Database

#### If you have a .sql file:

```bash
# Connect to Railway PostgreSQL and import
railway run psql $DATABASE_URL < your-export-file.sql
```

#### If you have a .sql.gz file:

```bash
# Decompress and import in one command
gunzip -c your-export-file.sql.gz | railway run psql $DATABASE_URL
```

## Method 2: Using psql Directly

### Step 1: Get Database Credentials

From Railway dashboard:
1. Go to your project
2. Click on the PostgreSQL service
3. Go to "Variables" or "Connect" tab
4. Note down: HOST, PORT, USER, PASSWORD, DATABASE

### Step 2: Import Using psql

#### If you have a .sql file:

```bash
psql -h [HOST] -p [PORT] -U [USER] -d [DATABASE] < your-export-file.sql
```

#### If you have a .sql.gz file:

```bash
gunzip -c your-export-file.sql.gz | psql -h [HOST] -p [PORT] -U [USER] -d [DATABASE]
```

You'll be prompted for the password.

## Method 3: Using pgAdmin or DBeaver (GUI)

### Step 1: Install a PostgreSQL Client

- [pgAdmin](https://www.pgadmin.org/download/)
- [DBeaver](https://dbeaver.io/download/)
- [TablePlus](https://tableplus.com/)

### Step 2: Connect to Railway Database

Use the connection details from Railway (HOST, PORT, USER, PASSWORD, DATABASE).

### Step 3: Import via GUI

1. Right-click on your database
2. Select "Restore" or "Import"
3. Choose your SQL file
4. Execute the import

## Method 4: Using Railway Web Terminal

### Step 1: Open Railway Dashboard

1. Go to your Railway project
2. Click on the PostgreSQL service
3. Click on "Data" tab

### Step 2: Use Query Tool

If your SQL file is small, you can:
1. Copy the contents of your SQL file
2. Paste into the Query tool
3. Execute

**Note:** This method is only practical for small databases.

## Important Considerations

### 1. Database Compatibility

Make sure your export is compatible:
- **From MySQL to PostgreSQL**: You'll need to convert the SQL syntax
- **From PostgreSQL to PostgreSQL**: Direct import should work
- **From SQLite to PostgreSQL**: You'll need to convert the SQL syntax

### 2. Clear Existing Data (if needed)

If you want to start fresh, clear the database first:

```bash
# Connect to Railway database
railway run psql $DATABASE_URL

# Drop all tables (BE CAREFUL!)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

# Exit
\q
```

Then import your data.

### 3. Check Strapi Migrations

After importing, Strapi might need to run migrations:

```bash
# In your Railway deployment logs, you should see:
# "Database migration completed"
```

If not, you may need to redeploy:

```bash
railway up --detach
```

## Troubleshooting

### Error: "relation already exists"

Your database already has tables. Either:
1. Clear the database first (see above)
2. Or modify your SQL file to include `DROP TABLE IF EXISTS` statements

### Error: "syntax error"

Your SQL export might be from a different database type:
- Use a conversion tool like [pgloader](https://pgloader.io/) for MySQL → PostgreSQL
- Or manually adjust the SQL syntax

### Error: "permission denied"

Make sure you're using the correct user credentials from Railway.

### Connection Timeout

Railway databases are private by default. Make sure you're:
1. Using Railway CLI (`railway run`)
2. Or connecting from an allowed IP address

## Verification

After import, verify your data:

```bash
# Connect to database
railway run psql $DATABASE_URL

# List all tables
\dt

# Check a specific table (e.g., blogs)
SELECT COUNT(*) FROM blogs;

# Exit
\q
```

Then visit your Railway app URL and check:
- Admin panel: `https://your-app.railway.app/admin`
- API endpoints: `https://your-app.railway.app/api/blogs`

## Example: Complete Import Process

Here's a complete example assuming you have `strapi_db.sql`:

```bash
# 1. Navigate to your project
cd /Users/mac/.cursor/worktrees/pp-back-end/5kCSU

# 2. Login to Railway
railway login

# 3. Link to your project
railway link

# 4. Import the database
railway run psql $DATABASE_URL < strapi_db.sql

# 5. Verify the import
railway run psql $DATABASE_URL -c "\dt"

# 6. Redeploy to ensure Strapi recognizes the data
railway up --detach

# 7. Check logs
railway logs
```

## Need Help?

If you encounter issues:
1. Check Railway logs: `railway logs`
2. Verify database connection: `railway run psql $DATABASE_URL -c "SELECT version();"`
3. Check Strapi documentation: https://docs.strapi.io/dev-docs/migration


