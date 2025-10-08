const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

async function importMenus() {
  console.log('🚀 Starting menu import...');
  
  const STRAPI_URL = 'http://localhost:1337';
  const xmlFilePath = path.join(__dirname, '..', 'thepipedpeony.wordpress.2025-10-03 (2).xml');
  
  // Define which menus we want to import
  const MENUS_TO_IMPORT = {
    'logged-in-header': 'Logged In - Header',
    'header-menu-logged-out': 'Header Menu - Logged out',
    'footer-menu': 'Footer Menu'
  };
  
  console.log('📖 Reading XML file...');
  const xmlContent = fs.readFileSync(xmlFilePath, 'utf8');
  
  console.log('🔍 Parsing XML...');
  const parser = new xml2js.Parser();
  const result = await parser.parseStringPromise(xmlContent);
  
  const channel = result.rss.channel[0];
  const items = channel.item || [];
  const terms = channel['wp:term'] || [];
  
  // Extract menu definitions
  const menus = {};
  terms.forEach(term => {
    const taxonomy = term['wp:term_taxonomy']?.[0];
    if (taxonomy === 'nav_menu') {
      const slug = term['wp:term_slug']?.[0];
      const name = term['wp:term_name']?.[0];
      const termId = term['wp:term_id']?.[0];
      
      if (MENUS_TO_IMPORT[slug]) {
        menus[slug] = {
          slug,
          name,
          termId,
          items: []
        };
        console.log(`✅ Found menu: ${name} (slug: ${slug})`);
      }
    }
  });
  
  console.log(`\n📋 Found ${Object.keys(menus).length} menus to import`);
  
  // Extract menu items
  console.log('\n🔍 Extracting menu items...');
  let menuItemCount = 0;
  
  items.forEach(item => {
    const postType = item['wp:post_type']?.[0];
    
    if (postType === 'nav_menu_item') {
      // Get menu association from category
      const categories = item.category || [];
      let menuSlug = null;
      
      categories.forEach(cat => {
        if (cat.$?.domain === 'nav_menu') {
          menuSlug = cat.$.nicename;
        }
      });
      
      if (menuSlug && menus[menuSlug]) {
        const postMeta = item['wp:postmeta'] || [];
        const metaData = {};
        
        postMeta.forEach(meta => {
          const key = meta['wp:meta_key']?.[0];
          const value = meta['wp:meta_value']?.[0];
          if (key) {
            metaData[key] = value;
          }
        });
        
        const menuItem = {
          title: item.title?.[0] || '',
          url: metaData['_menu_item_url'] || item.link?.[0] || '',
          target: metaData['_menu_item_target'] || '_self',
          order: parseInt(item['wp:menu_order']?.[0] || 0),
          parentId: metaData['_menu_item_menu_item_parent'],
          type: metaData['_menu_item_type'],
          objectId: metaData['_menu_item_object_id'],
          cssClass: metaData['_menu_item_classes'] || ''
        };
        
        menus[menuSlug].items.push(menuItem);
        menuItemCount++;
      }
    }
  });
  
  console.log(`✅ Found ${menuItemCount} menu items across all menus`);
  
  // Import menus into Strapi
  console.log('\n📤 Importing menus into Strapi...');
  
  let menusImported = 0;
  let itemsImported = 0;
  let errors = 0;
  
  for (const [slug, menu] of Object.entries(menus)) {
    try {
      console.log(`\n📁 Processing menu: ${menu.name}`);
      
      // Check if menu already exists
      const checkUrl = `${STRAPI_URL}/api/menus?filters[slug][$eq]=${slug}`;
      const checkResponse = await fetch(checkUrl);
      const checkData = await checkResponse.json();
      
      let strapiMenuId;
      
      if (checkData.data && checkData.data.length > 0) {
        console.log(`⏭️  Menu "${menu.name}" already exists, using existing menu`);
        strapiMenuId = checkData.data[0].id;
      } else {
        // Create menu
        const menuPayload = {
          title: menu.name,
          slug: slug,
          description: `Imported from WordPress: ${menu.name}`
        };
        
        const createMenuResponse = await fetch(`${STRAPI_URL}/api/menus`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: menuPayload })
        });
        
        if (!createMenuResponse.ok) {
          throw new Error(`Failed to create menu: ${createMenuResponse.status}`);
        }
        
        const menuResult = await createMenuResponse.json();
        strapiMenuId = menuResult.data.id;
        console.log(`✅ Created menu: ${menu.name} (ID: ${strapiMenuId})`);
        menusImported++;
      }
      
      // Sort menu items by order
      menu.items.sort((a, b) => a.order - b.order);
      
      // First pass: create all menu items without parent relationships
      const itemIdMap = {}; // Map WordPress parent IDs to Strapi IDs
      
      for (const menuItem of menu.items) {
        try {
          // Check if item already exists
          const checkItemUrl = `${STRAPI_URL}/api/menu-items?filters[title][$eq]=${encodeURIComponent(menuItem.title)}&filters[menu][id][$eq]=${strapiMenuId}`;
          const checkItemResponse = await fetch(checkItemUrl);
          const checkItemData = await checkItemResponse.json();
          
          if (checkItemData.data && checkItemData.data.length > 0) {
            console.log(`  ⏭️  Item "${menuItem.title}" already exists`);
            itemIdMap[menuItem.objectId] = checkItemData.data[0].id;
            continue;
          }
          
          const itemPayload = {
            title: menuItem.title,
            url: menuItem.url,
            target: menuItem.target || '_self',
            order: menuItem.order,
            menu: strapiMenuId,
            isExternal: menuItem.url.startsWith('http'),
            cssClass: menuItem.cssClass
          };
          
          const createItemResponse = await fetch(`${STRAPI_URL}/api/menu-items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: itemPayload })
          });
          
          if (!createItemResponse.ok) {
            throw new Error(`Failed to create menu item: ${createItemResponse.status}`);
          }
          
          const itemResult = await createItemResponse.json();
          itemIdMap[menuItem.objectId] = itemResult.data.id;
          
          console.log(`  ✅ Created item: ${menuItem.title} (order: ${menuItem.order})`);
          itemsImported++;
          
        } catch (error) {
          console.error(`  ❌ Error creating menu item "${menuItem.title}":`, error.message);
          errors++;
        }
      }
      
      // Second pass: update parent relationships
      for (const menuItem of menu.items) {
        if (menuItem.parentId && menuItem.parentId !== '0') {
          try {
            const childStrapiId = itemIdMap[menuItem.objectId];
            const parentStrapiId = itemIdMap[menuItem.parentId];
            
            if (childStrapiId && parentStrapiId) {
              const updateResponse = await fetch(`${STRAPI_URL}/api/menu-items/${childStrapiId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  data: {
                    parent: parentStrapiId
                  }
                })
              });
              
              if (updateResponse.ok) {
                console.log(`  🔗 Linked "${menuItem.title}" as child of parent item`);
              }
            }
          } catch (error) {
            console.error(`  ⚠️  Could not set parent for "${menuItem.title}":`, error.message);
          }
        }
      }
      
    } catch (error) {
      console.error(`❌ Error processing menu "${menu.name}":`, error.message);
      errors++;
    }
  }
  
  console.log('\n🎉 Import completed!');
  console.log(`✅ Menus imported: ${menusImported}`);
  console.log(`✅ Menu items imported: ${itemsImported}`);
  console.log(`❌ Errors: ${errors}`);
}

// Run the import
importMenus().catch(error => {
  console.error('❌ Import failed:', error);
  process.exit(1);
});

