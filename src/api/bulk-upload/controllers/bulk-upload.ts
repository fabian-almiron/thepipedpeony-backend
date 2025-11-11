import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import tar from 'tar';

export default {
  upload: async (ctx) => {
    try {
      const uploadsPath = path.join(process.cwd(), 'public', 'uploads');
      
      // Ensure directory exists
      if (!fs.existsSync(uploadsPath)) {
        fs.mkdirSync(uploadsPath, { recursive: true });
      }

      // Get the uploaded tarball from request
      const file = ctx.request.files?.file;
      
      if (!file) {
        ctx.status = 400;
        ctx.body = { error: 'No file uploaded' };
        return;
      }

      // Extract tar.gz to uploads directory
      await tar.x({
        file: file.path,
        cwd: uploadsPath,
      });

      // Count files after extraction
      const files = fs.readdirSync(uploadsPath);
      
      ctx.body = {
        success: true,
        message: 'Files uploaded successfully',
        fileCount: files.length,
        uploadsPath,
      };
    } catch (err) {
      strapi.log.error('Bulk upload error:', err);
      ctx.status = 500;
      ctx.body = { error: err.message };
    }
  },
};

