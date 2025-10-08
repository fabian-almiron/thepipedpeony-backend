const STRAPI_URL = 'http://localhost:1337';

async function deleteAllCourses() {
  console.log('🗑️  Starting to delete all courses...\n');
  
  try {
    // Get all courses
    const response = await fetch(`${STRAPI_URL}/api/courses?pagination[pageSize]=500`);
    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      console.log('✅ No courses found. Database is already clean!');
      return;
    }
    
    const totalCourses = data.data.length;
    console.log(`📊 Found ${totalCourses} courses to delete\n`);
    
    let deleted = 0;
    let errors = 0;
    
    for (const course of data.data) {
      try {
        const deleteResponse = await fetch(`${STRAPI_URL}/api/courses/${course.documentId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (deleteResponse.ok) {
          console.log(`✅ Deleted: ${course.title} (ID: ${course.id})`);
          deleted++;
        } else {
          const errorText = await deleteResponse.text();
          console.log(`❌ Failed to delete: ${course.title} - ${errorText}`);
          errors++;
        }
      } catch (error) {
        console.error(`❌ Error deleting course "${course.title}":`, error.message);
        errors++;
      }
    }
    
    console.log(`\n🎉 Deletion completed!`);
    console.log(`✅ Deleted: ${deleted} courses`);
    console.log(`❌ Errors: ${errors} courses`);
    
    if (errors > 0) {
      console.log('\n⚠️  Some courses failed to delete. You may need to:');
      console.log('   1. Enable DELETE permission for Public role in Strapi admin');
      console.log('   2. Or delete remaining courses manually in Strapi admin');
    }
    
  } catch (error) {
    console.error('❌ Failed to delete courses:', error.message);
    console.log('\nTry deleting manually in Strapi admin:');
    console.log('http://localhost:1337/admin → Content Manager → Course → Select All → Delete');
  }
}

deleteAllCourses().catch(console.error);

