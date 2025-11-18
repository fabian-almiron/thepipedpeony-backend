#!/bin/bash

# Railway PostgreSQL Setup Script
# This script helps you set up PostgreSQL for your Railway deployment

echo "🚂 Railway PostgreSQL Setup"
echo "================================"
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null
then
    echo "⚠️  Railway CLI is not installed."
    echo ""
    echo "To install Railway CLI:"
    echo "  npm i -g @railway/cli"
    echo ""
    echo "Or add PostgreSQL manually:"
    echo "  1. Go to https://railway.app"
    echo "  2. Open your project"
    echo "  3. Click '+ New'"
    echo "  4. Select 'Database' → 'Add PostgreSQL'"
    echo "  5. Railway will automatically connect it to your app"
    echo ""
    exit 1
fi

echo "✅ Railway CLI found!"
echo ""

# Check if logged in
echo "Checking Railway login status..."
if ! railway whoami &> /dev/null
then
    echo "⚠️  Not logged in to Railway"
    echo ""
    echo "Logging in..."
    railway login
fi

echo "✅ Logged in to Railway"
echo ""

# Link to project (if not already linked)
if [ ! -f "railway.json" ] && [ ! -d ".railway" ]; then
    echo "🔗 Linking to Railway project..."
    echo ""
    echo "Please select your project from the list:"
    railway link
    echo ""
fi

echo "📊 Adding PostgreSQL database..."
echo ""
echo "Running: railway add --database postgres"
echo ""

# Add PostgreSQL
railway add --database postgres

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ PostgreSQL database added successfully!"
    echo ""
    echo "🎉 Next steps:"
    echo "  1. Push your code: git push"
    echo "  2. Railway will auto-deploy"
    echo "  3. Check deployment: railway logs"
    echo "  4. Open your app: railway open"
    echo ""
    echo "📝 The DATABASE_URL is automatically set by Railway"
else
    echo ""
    echo "❌ Failed to add PostgreSQL"
    echo ""
    echo "Please add it manually:"
    echo "  1. Go to https://railway.app"
    echo "  2. Open your project"
    echo "  3. Click '+ New'"
    echo "  4. Select 'Database' → 'Add PostgreSQL'"
    echo ""
fi

