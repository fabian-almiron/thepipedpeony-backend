/**
 * List files in Railway uploads directory
 */
const fs = require('fs');
const path = require('path');

const uploadsPath = '/app/public/uploads';

console.log('📂 Checking uploads directory...\n');

try {
  if (!fs.existsSync(uploadsPath)) {
    console.log('❌ Directory does not exist:', uploadsPath);
    process.exit(1);
  }

  const files = fs.readdirSync(uploadsPath);
  
  console.log(`Found ${files.length} files in ${uploadsPath}:\n`);
  
  // Show first 20 files
  files.slice(0, 20).forEach((file, i) => {
    const filePath = path.join(uploadsPath, file);
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`${i + 1}. ${file} (${sizeKB} KB)`);
  });
  
  if (files.length > 20) {
    console.log(`\n... and ${files.length - 20} more files`);
  }
  
  // Calculate total size
  const totalSize = files.reduce((acc, file) => {
    const filePath = path.join(uploadsPath, file);
    return acc + fs.statSync(filePath).size;
  }, 0);
  
  console.log(`\n📊 Total: ${files.length} files, ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

