/**
 * Script to create the "Logged in Header" menu with nested items
 * 
 * This creates the structure:
 * - library (with Color Library and Recipe Library children)
 * - blog
 * - shop  
 * - details (with all color series children)
 * 
 * Run: node scripts/create-logged-in-menu.js
 */

const fs = require('fs');
const path = require('path');

// Strapi API configuration
const STRAPI_URL = 'http://localhost:1337';
const API_TOKEN = null; // If you have one, add it here

// Menu items structure
const menuStructure = {
  menuSlug: 'logged-in-header',
  menuTitle: 'Logged in Header',
  menuDescription: 'Navigation for logged-in users',
  items: [
    // Parent: courses
    {
      title: 'courses',
      url: '#',
      order: 0,
      target: '_self',
      isExternal: false,
      children: [
        { title: 'The Business Series', url: '/category/business-series/', order: 0 },
        { title: 'The Color Series', url: '/category/color-series/', order: 1 },
        { title: 'The Decorating Series', url: '/category/decorating-series/', order: 2 },
        { title: 'The Flower Piping Series', url: '/category/flower-piping-series/', order: 3 },
        { title: 'The Graveyard Series', url: '/category/graveyard-series/', order: 4 },
        { title: 'The Kids Series', url: '/category/kids-series/', order: 5 },
        { title: 'The Recipe Series', url: '/category/recipe-series/', order: 6 },
        { title: 'The Starter Series', url: '/category/starter-series/', order: 7 },
        { title: 'View All', url: '/courses', order: 8 },
      ],
    },
    // Parent: library
    {
      title: 'library',
      url: '#',
      order: 10,
      target: '_self',
      isExternal: false,
      children: [
        {
          title: 'Recipe Library',
          url: '#',
          order: 0,
        },
        {
          title: 'Color Library',
          url: '#',
          order: 1,
          // Note: Color Library will have nested children - see below
        },
      ],
    },
    // Single item: blog
    {
      title: 'blog',
      url: '/blog',
      order: 20,
      target: '_self',
      isExternal: false,
    },
    // Single item: shop
    {
      title: 'shop',
      url: '/shop',
      order: 30,
      target: '_self',
      isExternal: false,
    },
    // Parent: details (you'll handle dropdown)
    {
      title: 'details',
      url: '#',
      order: 40,
      target: '_self',
      isExternal: false,
    },
  ],
  
  // Color Library nested items (children of "Color Library")
  colorLibraryItems: [
    { title: 'The Black Series', url: '/category/the-black-series/', order: 0 },
    { title: 'The Blue Series', url: '/category/the-blue-series/', order: 1 },
    { title: 'The Brown Series', url: '/category/the-brown-series/', order: 2 },
    { title: 'The Green Series', url: '/category/the-green-series/', order: 3 },
    { title: 'The Orange Series', url: '/category/the-orange-series/', order: 4 },
    { title: 'The Pink Series', url: '/category/the-pink-series/', order: 5 },
    { title: 'The Purple Series', url: '/category/the-purple-series/', order: 6 },
    { title: 'The Yellow Series', url: '/category/the-yellow-series/', order: 7 },
    { title: 'The White Series', url: '/category/the-white-series/', order: 8 },
  ],
};

async function makeRequest(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (API_TOKEN) {
    headers['Authorization'] = `Bearer ${API_TOKEN}`;
  }

  const response = await fetch(`${STRAPI_URL}${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  return response.json();
}

async function findOrCreateMenu() {
  console.log(`\n🔍 Looking for menu with slug: "${menuStructure.menuSlug}"...`);

  try {
    // Check if menu exists
    const menus = await makeRequest(`/api/menus?filters[slug][$eq]=${menuStructure.menuSlug}`);

    if (menus.data && menus.data.length > 0) {
      console.log(`✅ Found existing menu (ID: ${menus.data[0].id})`);
      return menus.data[0];
    }

    // Create new menu
    console.log(`📝 Creating new menu...`);
    const newMenu = await makeRequest('/api/menus', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          title: menuStructure.menuTitle,
          slug: menuStructure.menuSlug,
          description: menuStructure.menuDescription,
          publishedAt: new Date().toISOString(),
        },
      }),
    });

    console.log(`✅ Created menu (ID: ${newMenu.data.id})`);
    return newMenu.data;
  } catch (error) {
    console.error('❌ Error with menu:', error.message);
    throw error;
  }
}

async function createMenuItem(item, menuId, parentId = null) {
  const menuItemData = {
    title: item.title,
    url: item.url,
    order: item.order,
    target: item.target || '_self',
    isExternal: item.isExternal || false,
    menu: menuId,
    publishedAt: new Date().toISOString(),
  };

  if (parentId) {
    menuItemData.parent = parentId;
  }

  if (item.description) {
    menuItemData.description = item.description;
  }

  try {
    const response = await makeRequest('/api/menu-items', {
      method: 'POST',
      body: JSON.stringify({ data: menuItemData }),
    });
    return response.data;
  } catch (error) {
    console.error(`❌ Error creating menu item "${item.title}":`, error.message);
    throw error;
  }
}

async function createMenuItems(menu) {
  console.log(`\n📋 Creating menu items for "${menu.title}"...\n`);

  let successCount = 0;
  let errorCount = 0;
  let colorLibraryItemId = null;

  for (const item of menuStructure.items) {
    try {
      // Create parent item
      console.log(`  Creating: "${item.title}" (order: ${item.order})`);
      const parentItem = await createMenuItem(item, menu.id);
      console.log(`  ✅ Created parent: "${item.title}" (ID: ${parentItem.id})`);
      successCount++;

      // Create children if any
      if (item.children && item.children.length > 0) {
        console.log(`     └─ Creating ${item.children.length} children...`);

        for (const child of item.children) {
          try {
            const childData = {
              ...child,
              target: child.target || '_self',
              isExternal: child.isExternal || false,
            };
            const childItem = await createMenuItem(childData, menu.id, parentItem.id);
            console.log(`        ✅ Created child: "${child.title}" (ID: ${childItem.id})`);
            successCount++;
            
            // Save Color Library ID for nested items
            if (child.title === 'Color Library') {
              colorLibraryItemId = childItem.id;
            }
          } catch (error) {
            console.error(`        ❌ Failed to create child: "${child.title}"`);
            errorCount++;
          }
        }
      }

      console.log(''); // Empty line for readability
    } catch (error) {
      console.error(`  ❌ Failed to create: "${item.title}"`);
      errorCount++;
    }
  }

  // Create Color Library nested items (3rd level)
  if (colorLibraryItemId && menuStructure.colorLibraryItems) {
    console.log(`  Creating nested items under "Color Library"...\n`);
    
    for (const colorItem of menuStructure.colorLibraryItems) {
      try {
        const itemData = {
          ...colorItem,
          target: '_self',
          isExternal: false,
        };
        const nestedItem = await createMenuItem(itemData, menu.id, colorLibraryItemId);
        console.log(`     ✅ Created: "${colorItem.title}" (ID: ${nestedItem.id})`);
        successCount++;
      } catch (error) {
        console.error(`     ❌ Failed to create: "${colorItem.title}"`);
        errorCount++;
      }
    }
    console.log('');
  }

  return { successCount, errorCount };
}

async function main() {
  console.log('🚀 Starting menu creation...');
  console.log(`📍 Strapi URL: ${STRAPI_URL}`);

  try {
    // Step 1: Find or create the menu
    const menu = await findOrCreateMenu();

    // Step 2: Create menu items
    const { successCount, errorCount } = await createMenuItems(menu);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully created: ${successCount} menu items`);
    if (errorCount > 0) {
      console.log(`❌ Failed: ${errorCount} menu items`);
    }
    console.log('\n✨ Done! Check your menu at:');
    console.log(`   ${STRAPI_URL}/admin/content-manager/collection-types/api::menu.menu`);
    console.log('\n💡 Don\'t forget to:');
    console.log('   1. Verify all items are Published');
    console.log('   2. Enable API permissions (Menu & Menu-item)');
    console.log('   3. Refresh your frontend');

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.log('\n💡 Make sure:');
    console.log('   1. Strapi is running at', STRAPI_URL);
    console.log('   2. The Menu and Menu-item content types exist');
    console.log('   3. You have permission to create content');
    process.exit(1);
  }
}

main();

