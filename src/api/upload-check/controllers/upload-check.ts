import fs from 'fs';
import path from 'path';

export default {
  check: async (ctx) => {
    try {
      const uploadsPath = path.join(process.cwd(), 'public', 'uploads');
      
      // Check if directory exists
      const exists = fs.existsSync(uploadsPath);
      
      // Get directory contents if it exists
      let files = [];
      let fileCount = 0;
      if (exists) {
        files = fs.readdirSync(uploadsPath);
        fileCount = files.length;
      }
      
      ctx.body = {
        uploadsPath,
        exists,
        fileCount,
        sampleFiles: files.slice(0, 10),
        cwd: process.cwd(),
      };
    } catch (err) {
      ctx.body = { error: err.message };
      ctx.status = 500;
    }
  },
};

