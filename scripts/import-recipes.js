const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const https = require('https');
const http = require('http');

async function importRecipes() {
  console.log('🚀 Starting recipe import...');
  
  const STRAPI_URL = 'http://localhost:1337';
  const API_TOKEN = process.env.STRAPI_API_TOKEN || '';
  
  const csvFilePath = path.join(__dirname, '..', 'recepies.csv');
  const recipes = [];
  
  // Read and parse CSV
  let headers = [];
  
  await new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv({
        mapHeaders: ({ header, index }) => {
          const originalHeader = header;
          let finalHeader = header;
          let suffix = 1;
          
          while (headers.includes(finalHeader)) {
            finalHeader = `${originalHeader}_${suffix}`;
            suffix++;
          }
          
          headers.push(finalHeader);
          return finalHeader;
        }
      }))
      .on('data', (row) => {
        recipes.push(row);
      })
      .on('end', resolve)
      .on('error', reject);
  });
  
  console.log(`📊 Found ${recipes.length} total rows to process`);
  
  let imported = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const recipeData of recipes) {
    try {
      // Debug: Log first recipe data
      if (imported === 0 && skipped === 0) {
        console.log('\n📋 First row fields:', Object.keys(recipeData).slice(0, 15));
        console.log('   Title field:', recipeData.Title);
        console.log('   Post Type field:', recipeData['Post Type']);
        console.log('');
      }
      
      // Skip if no title or if it's not a recipe
      if (!recipeData.Title || recipeData['Post Type'] !== 'recipes') {
        skipped++;
        continue;
      }
      
      // Parse equipment
      const equipment = parseRepeaterField(recipeData, 'equipment', 'equipment_item');
      
      // Parse ingredients
      const ingredients = parseRepeaterField(recipeData, 'ingredients', 'ingredients_item');
      
      // Parse important items
      const important = parseRepeaterField(recipeData, 'important', 'important_items');
      
      // Parse notes
      const notes = parseRepeaterField(recipeData, 'notes', 'note_item');
      
      // Get categories from the "Recipe Categories" column
      const categoryNames = recipeData['Recipe Categories'] 
        ? recipeData['Recipe Categories'].split('|').map(c => c.trim()).filter(c => c)
        : [];
      
      // Prepare recipe data - only include non-empty values
      const recipePayload = {
        title: recipeData.Title,
        slug: recipeData.Slug || '',
        publishedAt: null // Draft by default
      };
      
      // Add optional fields only if they have values
      if (recipeData.header_title) recipePayload.headerTitle = recipeData.header_title;
      if (recipeData.method_label) recipePayload.methodLabel = recipeData.method_label;
      if (recipeData.short_description) recipePayload.shortDescription = recipeData.short_description;
      if (recipeData.time) recipePayload.time = recipeData.time;
      if (recipeData.difficulty) recipePayload.difficulty = recipeData.difficulty;
      if (recipeData.long_description) recipePayload.longDescription = recipeData.long_description;
      if (recipeData.notice) recipePayload.notice = recipeData.notice;
      if (recipeData['Recipe  Video ID'] || recipeData.recipe__video_id) {
        recipePayload.recipeVideoId = recipeData['Recipe  Video ID'] || recipeData.recipe__video_id;
      }
      
      // Add arrays only if they have items
      if (equipment.length > 0) recipePayload.equipment = equipment;
      if (ingredients.length > 0) recipePayload.ingredients = ingredients;
      if (important.length > 0) recipePayload.important = important;
      if (notes.length > 0) recipePayload.notes = notes;
      
      // Check if recipe already exists by slug
      const checkUrl = `${STRAPI_URL}/api/recipes?filters[slug][$eq]=${encodeURIComponent(recipePayload.slug)}`;
      const checkResponse = await fetch(checkUrl);
      const checkData = await checkResponse.json();
      
      if (checkData.data && checkData.data.length > 0) {
        console.log(`⏭️  Skipping existing recipe: ${recipeData.Title}`);
        skipped++;
        continue;
      }
      
      // Create the recipe via API
      const createUrl = `${STRAPI_URL}/api/recipes`;
      
      // Debug: log payload for first recipe
      if (imported === 0 && errors === 0) {
        console.log('\n🔍 Sample payload:', JSON.stringify(recipePayload, null, 2).substring(0, 500));
        console.log('');
      }
      
      const createResponse = await fetch(createUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: recipePayload })
      });
      
      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        
        // Try to parse and show more detailed error
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.error?.details) {
            throw new Error(`API error: ${createResponse.status} - ${JSON.stringify(errorJson.error.details)}`);
          }
        } catch (e) {
          // Fall through to original error
        }
        
        throw new Error(`API error: ${createResponse.status} - ${errorText}`);
      }
      
      const result = await createResponse.json();
      const recipeId = result.data.documentId;
      
      console.log(`✅ Created recipe: ${recipeData.Title} (ID: ${recipeId})`);
      
      // Handle featured image download and upload
      if (recipeData.featured_image && recipeData.featured_image.trim() !== '') {
        try {
          const imageUrl = recipeData.featured_image.trim();
          console.log(`   📸 Downloading image from: ${imageUrl}`);
          
          const imageBuffer = await downloadImage(imageUrl);
          const fileName = path.basename(new URL(imageUrl).pathname);
          
          // Upload image to Strapi
          const uploadedFile = await uploadImageToStrapi(
            STRAPI_URL,
            imageBuffer,
            fileName
          );
          
          if (uploadedFile) {
            // Link image to recipe
            await linkImageToRecipe(STRAPI_URL, recipeId, uploadedFile.id);
            console.log(`   ✅ Image uploaded and linked`);
          }
        } catch (imageError) {
          console.error(`   ⚠️  Failed to process image:`, imageError.message);
        }
      }
      
      // Handle categories
      if (categoryNames.length > 0) {
        try {
          const categoryIds = await findOrCreateCategories(STRAPI_URL, categoryNames);
          
          if (categoryIds.length > 0) {
            await linkCategoriesToRecipe(STRAPI_URL, recipeId, categoryIds);
            console.log(`   ✅ Linked ${categoryIds.length} categories`);
          }
        } catch (catError) {
          console.error(`   ⚠️  Failed to link categories:`, catError.message);
        }
      }
      
      imported++;
      
    } catch (error) {
      console.error(`❌ Error importing recipe "${recipeData.Title}":`, error.message);
      errors++;
    }
  }
  
  console.log(`\n🎉 Import completed!`);
  console.log(`✅ Imported: ${imported} recipes`);
  console.log(`⏭️  Skipped: ${skipped} rows`);
  console.log(`❌ Errors: ${errors} recipes`);
}

/**
 * Parse repeater field from CSV columns like equipment_0_equipment_item, equipment_1_equipment_item, etc.
 */
function parseRepeaterField(data, fieldPrefix, itemSuffix) {
  const items = [];
  
  // Try up to 30 items (adjust based on your data)
  for (let i = 0; i < 30; i++) {
    const key = `${fieldPrefix}_${i}_${itemSuffix}`;
    
    if (data[key] && data[key].trim() !== '') {
      items.push(data[key].trim());
    }
  }
  
  return items;
}

/**
 * Download image from URL
 */
function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirect
        return downloadImage(response.headers.location).then(resolve).catch(reject);
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }
      
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Upload image to Strapi
 */
async function uploadImageToStrapi(strapiUrl, imageBuffer, fileName) {
  const FormData = require('form-data');
  const form = new FormData();
  
  form.append('files', imageBuffer, {
    filename: fileName,
    contentType: 'image/jpeg'
  });
  
  const uploadUrl = `${strapiUrl}/api/upload`;
  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: form,
    headers: form.getHeaders()
  });
  
  if (!response.ok) {
    throw new Error(`Failed to upload image: ${response.status}`);
  }
  
  const uploadedFiles = await response.json();
  return uploadedFiles[0];
}

/**
 * Link uploaded image to recipe
 */
async function linkImageToRecipe(strapiUrl, recipeId, fileId) {
  const updateUrl = `${strapiUrl}/api/recipes/${recipeId}`;
  const response = await fetch(updateUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: {
        featuredImage: fileId
      }
    })
  });
  
  if (!response.ok) {
    throw new Error(`Failed to link image: ${response.status}`);
  }
  
  return await response.json();
}

/**
 * Find or create categories by name
 */
async function findOrCreateCategories(strapiUrl, categoryNames) {
  const categoryIds = [];
  
  for (const name of categoryNames) {
    try {
      // Check if category exists
      const checkUrl = `${strapiUrl}/api/categories?filters[name][$eq]=${encodeURIComponent(name)}`;
      const checkResponse = await fetch(checkUrl);
      const checkData = await checkResponse.json();
      
      if (checkData.data && checkData.data.length > 0) {
        // Category exists, use its documentId
        categoryIds.push(checkData.data[0].documentId);
      } else {
        // Create new category
        const createUrl = `${strapiUrl}/api/categories`;
        const createResponse = await fetch(createUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: {
              name: name,
              slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
            }
          })
        });
        
        if (createResponse.ok) {
          const result = await createResponse.json();
          categoryIds.push(result.data.documentId);
          console.log(`   ➕ Created category: ${name}`);
        }
      }
    } catch (error) {
      console.error(`   ⚠️  Error with category "${name}":`, error.message);
    }
  }
  
  return categoryIds;
}

/**
 * Link categories to recipe using Strapi 5 connect syntax
 */
async function linkCategoriesToRecipe(strapiUrl, recipeId, categoryIds) {
  const updateUrl = `${strapiUrl}/api/recipes/${recipeId}`;
  const response = await fetch(updateUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: {
        categories: {
          connect: categoryIds.map(id => ({ documentId: id }))
        }
      }
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to link categories: ${response.status} - ${errorText}`);
  }
  
  return await response.json();
}

// Run the import
importRecipes().catch(error => {
  console.error('❌ Import failed:', error);
  process.exit(1);
});
