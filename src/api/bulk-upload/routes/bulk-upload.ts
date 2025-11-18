export default {
  routes: [
    {
      method: 'POST',
      path: '/api/bulk-upload',
      handler: 'bulk-upload.upload',
      config: {
        // ⚠️ SECURITY: This endpoint requires authentication to prevent unauthorized file uploads
        auth: {
          scope: ['api::bulk-upload.upload']
        },
      },
    },
  ],
};

