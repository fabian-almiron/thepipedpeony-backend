const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

async function importCourses() {
  console.log('🚀 Starting course import...');
  
  // We'll use fetch to call the Strapi API directly
  const STRAPI_URL = 'http://localhost:1337';
  const API_TOKEN = process.env.STRAPI_API_TOKEN || ''; // You can add this later if needed
  
  const csvFilePath = path.join(__dirname, '..', 'courses-Export-2025-October-02-1802.csv');
  const courses = [];
  
  // Read and parse CSV with custom headers to handle duplicate column names
  let headers = [];
  let firstRow = true;
  
  await new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv({
        mapHeaders: ({ header, index }) => {
          // Handle duplicate column names by appending suffix
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
        courses.push(row);
      })
      .on('end', resolve)
      .on('error', reject);
  });
  
  console.log(`📊 Found ${courses.length} total rows to process`);
  
  let imported = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const courseData of courses) {
    try {
      // Debug: Log first course data to see what fields we're getting
      if (imported === 0 && skipped === 0) {
        console.log('\n📋 First row fields:', Object.keys(courseData).slice(0, 10));
        console.log('   Title field:', courseData.Title);
        console.log('   Post Type field:', courseData['Post Type']);
        console.log('');
      }
      
      // Skip if no title or if it's not a course
      if (!courseData.Title || courseData['Post Type'] !== 'courses') {
        skipped++;
        continue;
      }
      
      // Parse video chapters
      const videoChapters = parseVideoChapters(courseData);
      
      // Parse equipment needed
      const equipmentNeeded = parseEquipmentNeeded(courseData);
      
      // Parse categories and tags
      const categories = courseData.Categories ? courseData.Categories.split('|').map(c => c.trim()) : [];
      const tags = courseData.Tags ? courseData.Tags.split('|').map(t => t.trim()) : [];
      
      // Prepare course data
      const coursePayload = {
        title: courseData.Title,
        slug: courseData.Slug || '', // Use the actual slug from WordPress
        content: courseData.Content || '',
        excerpt: (courseData.Excerpt || courseData.about || '').substring(0, 1000),
        author: courseData['Author First Name'] && courseData['Author Last Name'] 
          ? `${courseData['Author First Name']} ${courseData['Author Last Name']}`
          : 'The Piped Peony Team',
        featured: courseData.Featured === '1' || courseData.Featured === 'yes',
        tags: tags,
        categories: categories,
        courseLevel: (() => {
          let level = (courseData['Course Levels'] || 'beginner').toLowerCase().trim();
          // Handle multiple levels separated by |, take the first one
          if (level.includes('|')) {
            level = level.split('|')[0].trim();
          }
          // Fix common typos
          if (level === 'beginnner') level = 'beginner';
          // Ensure it's a valid level
          if (!['beginner', 'intermediate', 'advanced'].includes(level)) {
            level = 'beginner';
          }
          return level;
        })(),
        episode: courseData.episode || '',
        videoId: courseData.video_id || '',
        series: courseData.series || '',
        about: courseData.about || '',
        videoChapters: videoChapters,
        equipmentNeeded: equipmentNeeded,
        permalink: courseData.Permalink || ''
      };
      
      // Check if course already exists by slug
      const checkUrl = `${STRAPI_URL}/api/courses?filters[slug][$eq]=${encodeURIComponent(coursePayload.slug)}`;
      const checkResponse = await fetch(checkUrl);
      const checkData = await checkResponse.json();
      
      if (checkData.data && checkData.data.length > 0) {
        console.log(`⏭️  Skipping existing course: ${courseData.Title}`);
        skipped++;
        continue;
      }
      
      // Create the course via API
      const createUrl = `${STRAPI_URL}/api/courses`;
      const createResponse = await fetch(createUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: coursePayload })
      });
      
      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        throw new Error(`API error: ${createResponse.status} - ${errorText}`);
      }
      
      const result = await createResponse.json();
      console.log(`✅ Imported: ${courseData.Title} (ID: ${result.data.id})`);
      imported++;
      
    } catch (error) {
      console.error(`❌ Error importing course "${courseData.Title}":`, error.message);
      errors++;
    }
  }
  
  console.log(`\n🎉 Import completed!`);
  console.log(`✅ Imported: ${imported} courses`);
  console.log(`⏭️  Skipped: ${skipped} rows`);
  console.log(`❌ Errors: ${errors} courses`);
}

function parseVideoChapters(courseData) {
  const chapters = [];
  
  // Look for video chapter data (up to 50 chapters based on your CSV)
  for (let i = 0; i < 50; i++) {
    const titleKey = `video_chapters_${i}_chapter_title`;
    const timeKey = `video_chapters_${i}_jump_to_time`;
    
    if (courseData[titleKey] && courseData[timeKey]) {
      chapters.push({
        title: courseData[titleKey],
        time: courseData[timeKey]
      });
    }
  }
  
  return chapters;
}

function parseEquipmentNeeded(courseData) {
  const equipment = [];
  
  // Look for equipment data (up to 30 items based on your CSV)
  for (let i = 0; i < 30; i++) {
    const itemKey = `what_youll_need_${i}_item`;
    
    if (courseData[itemKey]) {
      equipment.push(courseData[itemKey]);
    }
  }
  
  return equipment;
}

// Run the import
importCourses().catch(error => {
  console.error('❌ Import failed:', error);
  process.exit(1);
});
