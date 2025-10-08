const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

async function importCategories() {
  console.log('🚀 Starting category import...');
  
  const STRAPI_URL = 'http://localhost:1337';
  const csvFilePath = path.join(__dirname, '..', 'Categories-Export-2025-October-07-1604.csv');
  const categories = [];
  
  // Read and parse CSV
  await new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        categories.push(row);
      })
      .on('end', resolve)
      .on('error', reject);
  });
  
  console.log(`📊 Found ${categories.length} categories to process`);
  
  let imported = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const categoryData of categories) {
    try {
      // Skip if no name
      if (!categoryData['Term Name'] || categoryData['Term Name'].trim() === '') {
        skipped++;
        continue;
      }
      
      const categoryPayload = {
        name: categoryData['Term Name'].trim(),
        slug: categoryData['Term Slug'].trim(),
        publishedAt: new Date() // Auto-publish
      };
      
      // Check if category already exists by slug
      const checkUrl = `${STRAPI_URL}/api/categories?filters[slug][$eq]=${encodeURIComponent(categoryPayload.slug)}`;
      const checkResponse = await fetch(checkUrl);
      const checkData = await checkResponse.json();
      
      if (checkData.data && checkData.data.length > 0) {
        console.log(`⏭️  Already exists: ${categoryPayload.name}`);
        skipped++;
        continue;
      }
      
      // Create the category via API
      const createUrl = `${STRAPI_URL}/api/categories`;
      const createResponse = await fetch(createUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: categoryPayload })
      });
      
      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        throw new Error(`API error: ${createResponse.status} - ${errorText}`);
      }
      
      const result = await createResponse.json();
      console.log(`✅ Imported: ${categoryPayload.name} (ID: ${result.data.id})`);
      imported++;
      
    } catch (error) {
      console.error(`❌ Error importing category "${categoryData['Term Name']}":`, error.message);
      errors++;
    }
  }
  
  console.log(`\n🎉 Import completed!`);
  console.log(`✅ Imported: ${imported} categories`);
  console.log(`⏭️  Skipped: ${skipped} categories`);
  console.log(`❌ Errors: ${errors} categories`);
}

// Run the import
importCategories().catch(error => {
  console.error('❌ Import failed:', error);
  process.exit(1);
});
