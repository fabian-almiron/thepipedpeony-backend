# 📦 Product Import Guide - Stripe to Strapi

This guide will help you import your Stripe products into Strapi, including handling variations like left-handed/right-handed and tuned/untuned.

---

## 🎯 What This Script Does

The import script will:

1. ✅ Read your `prices.csv` exported from Stripe
2. ✅ Group products by base name (e.g., "The Essential Flower Piping Kit")
3. ✅ Detect variations (left-handed, right-handed, tuned, untuned)
4. ✅ Create products in Strapi with proper Stripe linkage
5. ✅ Store variations in JSON format for frontend use
6. ✅ Skip subscription products (only import one-time purchase products)
7. ✅ Prevent duplicates

---

## 📋 Prerequisites

- [x] Strapi is running on `http://localhost:1337`
- [x] You have a Strapi API token with full access
- [x] Your `prices.csv` file is in the Strapi root directory

---

## 🚀 Quick Start (3 Steps)

### Step 1: Make sure Strapi is running

```bash
cd /Users/mac/Documents/9S/CLIENTS/The\ Piped\ Peony/strapi-first-build
npm run dev
```

### Step 2: Set your Strapi API Token

Open a new terminal and set your token:

```bash
export STRAPI_API_TOKEN=your_actual_token_here
```

**To get your token:**
1. Go to http://localhost:1337/admin
2. Settings → API Tokens → Create new API Token
3. Name: "Product Import"
4. Token type: Full access
5. Copy the token

### Step 3: Run the import

```bash
cd /Users/mac/Documents/9S/CLIENTS/The\ Piped\ Peony/strapi-first-build
node scripts/import-products.js
```

---

## 📊 What You'll See

The script will output something like:

```
🚀 Starting product import from Stripe CSV...

📦 Found 42 product prices in CSV

📊 Grouped into 18 unique products

📦 Processing: The Essential Flower Piping Kit
   💰 Price: $200.00
   🎨 Has variations: true
   📋 Variations: 4
      - The Essential Flower Piping Kit, Tuned (left-handed) ($350.00)
      - The Essential Flower Piping Kit, Tuned (right-handed) ($350.00)
      - The Essential Flower Piping Kit, Untuned (left-handed) ($200.00)
      - The Essential Flower Piping Kit, Untuned (right-handed) ($200.00)
   ✅ Created product ID: 1

📦 Processing: The Starter Tip Kit
   💰 Price: $115.00
   🎨 Has variations: true
   📋 Variations: 2
      - The Starter Tip Kit (Right-handed) ($115.00)
      - The Starter Tip Kit (Left-handed) ($115.00)
   ✅ Created product ID: 2

...

============================================================
📊 Import Summary
============================================================
✅ Imported: 18
⚠️  Skipped: 0
📦 Total products: 18
============================================================

✅ Import completed successfully!
```

---

## 🔍 How Variations Work

### Example: The Essential Flower Piping Kit

**Stripe has 4 separate products:**
- `prod_SGB1Uj2AjJPDXP` - Tuned (left-handed) - $350
- `prod_SGB1JxeEdXLvZo` - Tuned (right-handed) - $350
- `prod_SGC26gkoNI0N9i` - Untuned (left-handed) - $200
- `prod_SGC2kfdAeL0z4U` - Untuned (right-handed) - $200

**Strapi creates 1 product with variations:**

```json
{
  "name": "The Essential Flower Piping Kit",
  "slug": "the-essential-flower-piping-kit",
  "price": 200.00,  // Base price (cheapest variation)
  "hasVariations": true,
  "variations": {
    "type": "multiple",
    "options": [
      {
        "name": "The Essential Flower Piping Kit, Tuned (left-handed)",
        "stripePriceId": "price_1RLeqbFSIMTXJoJ2ILnJxujF",
        "stripeProductId": "prod_SGB1Uj2AjJPDXP",
        "price": 350.00,
        "hand": "left-handed",
        "tuning": "tuned"
      },
      {
        "name": "The Essential Flower Piping Kit, Tuned (right-handed)",
        "stripePriceId": "price_1RLeqaFSIMTXJoJ2dN242X4l",
        "stripeProductId": "prod_SGB1JxeEdXLvZo",
        "price": 350.00,
        "hand": "right-handed",
        "tuning": "tuned"
      },
      // ... other variations
    ]
  }
}
```

---

## 🎨 Variation Types Detected

The script automatically detects:

1. **Hand Preference:**
   - `(left-handed)` or `(Left-handed)`
   - `(right-handed)` or `(Right-handed)`

2. **Tuning:**
   - `Tuned` or `tuned`
   - `Untuned` or `untuned`

---

## 🛠️ After Import

### 1. Verify in Strapi Admin

Go to: http://localhost:1337/admin/content-manager/collection-types/api::product.product

You should see all your products with:
- ✅ Names cleaned up (no extra commas or spaces)
- ✅ Proper slugs generated
- ✅ Stripe Product IDs linked
- ✅ Stripe Price IDs linked
- ✅ Variations stored in JSON format

### 2. Add Images

The script doesn't import images (Stripe doesn't export them in CSV). You'll need to:
1. Go to each product in Strapi
2. Click "Add media"
3. Upload product images

### 3. Add Descriptions

Add product descriptions manually in Strapi:
1. Edit each product
2. Fill in the "description" field
3. Save and publish

### 4. Set Stock Levels

All products are imported with stock: 100. Update as needed.

---

## 🔄 Re-running the Import

If you need to re-run the import:

**The script will skip existing products** (by slug), so you can safely run it multiple times.

**To reimport everything:**
1. Delete all products in Strapi
2. Run the script again

---

## 🐛 Troubleshooting

### Error: "API request failed: 401"
**Fix:** Your Strapi API token is invalid or not set.
```bash
export STRAPI_API_TOKEN=your_actual_token_here
node scripts/import-products.js
```

### Error: "Cannot find module 'csv-parser'"
**Fix:** Install dependencies:
```bash
npm install csv-parser
```

### Error: "ENOENT: no such file or directory"
**Fix:** Make sure `prices.csv` is in the Strapi root directory:
```bash
ls -la prices.csv
```

### Products are duplicated
The script checks for existing products by slug. If you see duplicates, they likely have slightly different names. Delete duplicates manually in Strapi.

### Some products are missing
Check the console output - the script skips:
- Subscription products (have an Interval)
- Products without prices
- Products without names

---

## 📝 CSV Format Expected

The script expects a Stripe CSV export with these columns:
- `Price ID` - Stripe price ID
- `Product ID` - Stripe product ID
- `Product Name` - Full product name with variations
- `Amount` - Price in dollars
- `Currency` - Currency code (USD)
- `Interval` - Billing interval (empty for one-time purchases)

---

## 🎯 Next Steps

After importing:

1. **Add images** to all products in Strapi
2. **Write descriptions** for each product
3. **Set featured products** for homepage
4. **Organize categories** if needed
5. **Update stock levels** based on inventory
6. **Test checkout** with a product that has variations

---

## 💡 Pro Tips

1. **Export from Stripe first** - Make sure you have the latest prices
2. **Backup Strapi** - Before importing, backup your database
3. **Test with a few products** - Delete all but 2-3 products from CSV for testing
4. **Check slugs** - Make sure product slugs are URL-friendly
5. **Use variations wisely** - Variations are great for hand preference and size

---

## 🆘 Need Help?

If you encounter issues:
1. Check the console output for specific errors
2. Verify your Strapi is running and accessible
3. Make sure the API token has full access permissions
4. Check that the CSV file is in the correct location

Happy importing! 🎉
