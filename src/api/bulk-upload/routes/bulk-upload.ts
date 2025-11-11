export default {
  routes: [
    {
      method: 'POST',
      path: '/api/bulk-upload',
      handler: 'bulk-upload.upload',
      config: {
        auth: false,
      },
    },
  ],
};

