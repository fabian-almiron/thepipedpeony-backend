const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
// TEMPORARY: Replace 'your_token_here' with your actual Strapi API token
// Get it from: http://localhost:1337/admin/settings/api-tokens
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || 'your_token_here';

// Configuration
const CSV_FILE = path.join(__dirname, '../prices.csv');

// Helper function to make API requests
async function makeRequest(endpoint, options = {}) {
  const url = `${STRAPI_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${STRAPI_TOKEN}`,
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API request failed: ${response.status} ${error}`);
  }

  return response.json();
}

// Helper function to clean product name and extract variation info
function parseProductName(productName) {
  // Remove HTML entities
  productName = productName.replace(/&#038;/g, '&');
  
  // Extract variation info
  const handMatch = productName.match(/\((left-handed|right-handed)\)/i);
  const tunedMatch = productName.match(/\b(tuned|untuned)\b/i);
  
  // Remove variation text to get base name
  let baseName = productName
    .replace(/,?\s*\((left-handed|right-handed)\)/gi, '')
    .replace(/,?\s*(tuned|untuned)\s*/gi, '')
    .trim();
  
  // Clean up extra commas and spaces
  baseName = baseName.replace(/,\s*$/, '').trim();
  
  return {
    baseName,
    hand: handMatch ? handMatch[1].toLowerCase() : null,
    tuning: tunedMatch ? tunedMatch[1].toLowerCase() : null,
  };
}

// Helper function to generate slug
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Main import function
async function importProducts() {
  console.log('🚀 Starting product import from Stripe CSV...\n');

  const products = new Map();
  const rows = [];

  // Read CSV file
  await new Promise((resolve, reject) => {
    fs.createReadStream(CSV_FILE)
      .pipe(csv())
      .on('data', (row) => {
        // Skip subscription products (have Interval)
        if (row.Interval || row['Usage Type'] === 'licensed') {
          return;
        }
        
        // Skip products with no amount or name
        if (!row.Amount || !row['Product Name']) {
          return;
        }

        rows.push(row);
      })
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`📦 Found ${rows.length} product prices in CSV\n`);

  // Group products by base name
  for (const row of rows) {
    const productName = row['Product Name'];
    const priceId = row['Price ID'];
    const productId = row['Product ID'];
    const amount = parseFloat(row.Amount);
    
    const { baseName, hand, tuning } = parseProductName(productName);
    
    if (!products.has(baseName)) {
      products.set(baseName, {
        name: baseName,
        prices: [],
        hasVariations: false,
        variations: [],
      });
    }

    const product = products.get(baseName);
    product.prices.push({
      productId,
      priceId,
      amount,
      fullName: productName,
      hand,
      tuning,
    });

    // Check if this product has variations
    if (hand || tuning) {
      product.hasVariations = true;
    }
  }

  console.log(`📊 Grouped into ${products.size} unique products\n`);

  // Import products into Strapi
  let imported = 0;
  let skipped = 0;

  for (const [baseName, productData] of products) {
    try {
      console.log(`\n📦 Processing: ${baseName}`);
      
      // Determine the base price and product ID
      let basePrice = productData.prices[0].amount;
      let baseProductId = productData.prices[0].productId;
      let basePriceId = productData.prices[0].priceId;

      // If there are variations, use the cheapest as base price
      if (productData.hasVariations) {
        const cheapest = productData.prices.reduce((min, p) => 
          p.amount < min.amount ? p : min
        );
        basePrice = cheapest.amount;
        baseProductId = cheapest.productId;
        basePriceId = cheapest.priceId;
      }

      // Build variations array
      const variations = {
        type: 'multiple',
        options: productData.prices.map(p => ({
          name: p.fullName,
          stripePriceId: p.priceId,
          stripeProductId: p.productId,
          price: p.amount,
          hand: p.hand,
          tuning: p.tuning,
        }))
      };

      // Check if product already exists
      const slug = generateSlug(baseName);
      const existingProducts = await makeRequest(
        `/api/products?filters[slug][$eq]=${slug}`
      );

      if (existingProducts.data && existingProducts.data.length > 0) {
        console.log(`   ⚠️  Product already exists, skipping...`);
        skipped++;
        continue;
      }

      // Create product in Strapi
      const productPayload = {
        data: {
          name: baseName,
          slug,
          price: basePrice,
          stripeProductId: baseProductId,
          stripePriceId: basePriceId,
          hasVariations: productData.hasVariations,
          variations: productData.hasVariations ? variations : null,
          stock: 100,
          featured: false,
          publishedAt: new Date().toISOString(),
        },
      };

      console.log(`   💰 Price: $${basePrice}`);
      console.log(`   🎨 Has variations: ${productData.hasVariations}`);
      if (productData.hasVariations) {
        console.log(`   📋 Variations: ${productData.prices.length}`);
        productData.prices.forEach(p => {
          console.log(`      - ${p.fullName} ($${p.amount})`);
        });
      }

      const result = await makeRequest('/api/products', {
        method: 'POST',
        body: JSON.stringify(productPayload),
      });

      console.log(`   ✅ Created product ID: ${result.data.id}`);
      imported++;

    } catch (error) {
      console.error(`   ❌ Error importing ${baseName}:`, error.message);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Import Summary');
  console.log('='.repeat(60));
  console.log(`✅ Imported: ${imported}`);
  console.log(`⚠️  Skipped: ${skipped}`);
  console.log(`📦 Total products: ${products.size}`);
  console.log('='.repeat(60));
}

// Run the import
importProducts()
  .then(() => {
    console.log('\n✅ Import completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  });
