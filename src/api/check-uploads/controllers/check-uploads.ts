import fs from 'fs';
import path from 'path';

export default {
  check: async (ctx) => {
    try {
      const uploadsPath = path.join(process.cwd(), 'public', 'uploads');
      
      if (!fs.existsSync(uploadsPath)) {
        ctx.body = { error: 'Uploads directory does not exist', path: uploadsPath };
        return;
      }

      const files = fs.readdirSync(uploadsPath);
      
      // Get file details
      const fileDetails = files.slice(0, 20).map(file => {
        const stats = fs.statSync(path.join(uploadsPath, file));
        return {
          name: file,
          size: Math.round(stats.size / 1024) + ' KB',
        };
      });

      ctx.body = {
        uploadsPath,
        exists: true,
        totalFiles: files.length,
        sampleFiles: fileDetails,
      };
    } catch (err) {
      ctx.body = { error: err.message };
      ctx.status = 500;
    }
  },
};

