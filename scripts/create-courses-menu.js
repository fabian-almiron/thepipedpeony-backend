/**
 * Create a 3-level courses menu from existing course data
 * 
 * Structure:
 * - Level 1: "Courses" top nav item
 * - Level 2: Course series (The Business Series, The Color Series, etc.)
 * - Level 3: Individual courses within each series
 */

const axios = require('axios');

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;

if (!STRAPI_TOKEN) {
  console.error('❌ STRAPI_TOKEN environment variable is required');
  console.log('Usage: STRAPI_TOKEN=your-token node scripts/create-courses-menu.js');
  process.exit(1);
}

const api = axios.create({
  baseURL: `${STRAPI_URL}/api`,
  headers: {
    'Authorization': `Bearer ${STRAPI_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Helper to create or update a menu item
async function createMenuItem(data) {
  try {
    const response = await api.post('/menu-items', { data });
    console.log(`✅ Created menu item: ${data.title}`);
    return response.data.data;
  } catch (error) {
    console.error(`❌ Failed to create menu item "${data.title}":`, error.response?.data || error.message);
    throw error;
  }
}

// Helper to update a menu item
async function updateMenuItem(documentId, data) {
  try {
    const response = await api.put(`/menu-items/${documentId}`, { data });
    console.log(`✅ Updated menu item: ${data.title}`);
    return response.data.data;
  } catch (error) {
    console.error(`❌ Failed to update menu item:`, error.response?.data || error.message);
    throw error;
  }
}

// Fetch all courses grouped by series
async function fetchCoursesBySeries() {
  try {
    const response = await api.get('/courses?fields[0]=title&fields[1]=slug&fields[2]=series&sort=series:asc,order:asc&pagination[limit]=1000');
    const courses = response.data.data;
    
    // Group by series
    const seriesMap = new Map();
    courses.forEach(course => {
      const series = course.series || 'Uncategorized';
      if (!seriesMap.has(series)) {
        seriesMap.set(series, []);
      }
      seriesMap.get(series).push(course);
    });
    
    return seriesMap;
  } catch (error) {
    console.error('❌ Failed to fetch courses:', error.response?.data || error.message);
    throw error;
  }
}

// Get or create the main menu
async function getOrCreateMenu() {
  try {
    // Check if main menu exists
    const response = await api.get('/menus?filters[slug][$eq]=main-menu');
    if (response.data.data && response.data.data.length > 0) {
      console.log('✅ Found existing main menu');
      return response.data.data[0];
    }
    
    // Create if doesn't exist
    const createResponse = await api.post('/menus', {
      data: {
        title: 'Main Menu',
        slug: 'main-menu',
        description: 'Primary navigation menu',
        publishedAt: new Date().toISOString()
      }
    });
    console.log('✅ Created main menu');
    return createResponse.data.data;
  } catch (error) {
    console.error('❌ Failed to get/create menu:', error.response?.data || error.message);
    throw error;
  }
}

// Delete existing menu items for a fresh start
async function cleanupExistingMenuItems() {
  try {
    const response = await api.get('/menu-items?pagination[limit]=1000');
    const items = response.data.data;
    
    console.log(`\n🧹 Cleaning up ${items.length} existing menu items...`);
    
    for (const item of items) {
      await api.delete(`/menu-items/${item.documentId}`);
    }
    
    console.log('✅ Cleanup complete\n');
  } catch (error) {
    console.error('❌ Failed to cleanup menu items:', error.response?.data || error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting 3-level menu creation...\n');
  
  // Step 1: Get or create menu
  const menu = await getOrCreateMenu();
  
  // Step 2: Clean up existing menu items (optional - comment out if you want to keep existing items)
  const cleanup = process.argv.includes('--clean');
  if (cleanup) {
    await cleanupExistingMenuItems();
  }
  
  // Step 3: Fetch courses by series
  console.log('📚 Fetching courses...');
  const seriesMap = await fetchCoursesBySeries();
  console.log(`✅ Found ${seriesMap.size} series with courses\n`);
  
  // Step 4: Create Level 1 - Top nav items
  console.log('📝 Creating Level 1 - Top navigation items...\n');
  
  const coursesTopItem = await createMenuItem({
    title: 'Courses',
    url: '/courses',
    target: '_self',
    order: 1,
    isExternal: false,
    menu: menu.id,
    publishedAt: new Date().toISOString()
  });
  
  const libraryTopItem = await createMenuItem({
    title: 'Library',
    url: '/library',
    target: '_self',
    order: 2,
    isExternal: false,
    menu: menu.id,
    publishedAt: new Date().toISOString()
  });
  
  const blogTopItem = await createMenuItem({
    title: 'Blog',
    url: '/blog',
    target: '_self',
    order: 3,
    isExternal: false,
    menu: menu.id,
    publishedAt: new Date().toISOString()
  });
  
  // Step 5: Create Level 2 - Series (children of Courses)
  console.log('\n📝 Creating Level 2 - Course series...\n');
  
  let seriesOrder = 1;
  const seriesWithMultipleCourses = [];
  
  for (const [seriesName, courses] of seriesMap.entries()) {
    // Create series as child of Courses
    const seriesItem = await createMenuItem({
      title: seriesName,
      url: `/courses?series=${encodeURIComponent(seriesName)}`,
      target: '_self',
      order: seriesOrder++,
      isExternal: false,
      menu: menu.id,
      parent: coursesTopItem.id,
      publishedAt: new Date().toISOString()
    });
    
    // If this series has multiple courses, we'll create level 3
    if (courses.length > 1) {
      seriesWithMultipleCourses.push({ seriesItem, courses });
    }
  }
  
  // Add "View All" option at the end
  await createMenuItem({
    title: 'View All',
    url: '/courses',
    target: '_self',
    order: seriesOrder,
    isExternal: false,
    menu: menu.id,
    parent: coursesTopItem.id,
    publishedAt: new Date().toISOString()
  });
  
  // Step 6: Create Level 3 - Individual courses within series (optional)
  if (process.argv.includes('--with-courses')) {
    console.log('\n📝 Creating Level 3 - Individual courses...\n');
    
    for (const { seriesItem, courses } of seriesWithMultipleCourses) {
      let courseOrder = 1;
      for (const course of courses.slice(0, 10)) { // Limit to 10 courses per series to avoid overwhelming menu
        await createMenuItem({
          title: course.title,
          url: `/courses/${course.slug}`,
          target: '_self',
          order: courseOrder++,
          isExternal: false,
          menu: menu.id,
          parent: seriesItem.id,
          publishedAt: new Date().toISOString()
        });
      }
    }
  }
  
  console.log('\n✨ Done! Your 3-level menu structure is ready.');
  console.log('\n📋 Next steps:');
  console.log('1. Go to Strapi admin → Content Manager → Menu Items');
  console.log('2. Verify the menu structure');
  console.log('3. Adjust orders or add/remove items as needed');
  console.log(`4. View your menu at: ${STRAPI_URL}/api/menus?filters[slug][$eq]=main-menu&populate[menuItems][populate][0]=children.children&populate[menuItems][populate][1]=parent\n`);
}

main().catch(error => {
  console.error('\n❌ Script failed:', error);
  process.exit(1);
});
