const readline = require('readline');

async function deleteAllRecipes() {
  const STRAPI_URL = 'http://localhost:1337';
  
  // Create readline interface for user confirmation
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  // Prompt user for confirmation
  const answer = await new Promise((resolve) => {
    rl.question('⚠️  Are you sure you want to delete ALL recipes? This cannot be undone. (yes/no): ', resolve);
  });
  
  rl.close();
  
  if (answer.toLowerCase() !== 'yes') {
    console.log('❌ Deletion cancelled.');
    return;
  }
  
  console.log('🗑️  Starting recipe deletion...');
  
  try {
    // Fetch all recipes
    const response = await fetch(`${STRAPI_URL}/api/recipes?pagination[limit]=1000`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch recipes: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const recipes = data.data;
    
    console.log(`📊 Found ${recipes.length} recipes to delete`);
    
    if (recipes.length === 0) {
      console.log('✅ No recipes found. Nothing to delete.');
      return;
    }
    
    let deleted = 0;
    let errors = 0;
    
    for (const recipe of recipes) {
      try {
        const deleteResponse = await fetch(`${STRAPI_URL}/api/recipes/${recipe.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!deleteResponse.ok) {
          throw new Error(`Failed to delete: ${deleteResponse.status}`);
        }
        
        console.log(`✅ Deleted: ${recipe.attributes.title} (ID: ${recipe.id})`);
        deleted++;
        
      } catch (error) {
        console.error(`❌ Error deleting recipe ${recipe.id}:`, error.message);
        errors++;
      }
    }
    
    console.log('\n🎉 Deletion completed!');
    console.log(`✅ Deleted: ${deleted} recipes`);
    console.log(`❌ Errors: ${errors} recipes`);
    
  } catch (error) {
    console.error('❌ Deletion failed:', error.message);
    process.exit(1);
  }
}

// Run the deletion
deleteAllRecipes();

