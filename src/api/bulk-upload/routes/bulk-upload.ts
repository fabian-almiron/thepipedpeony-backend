export default {
  routes: [
    {
      method: 'POST',
      path: '/bulk-upload',
      handler: 'bulk-upload.upload',
      config: {
        auth: false, // Remove this after testing
        policies: [],
        middlewares: [],
      },
    },
  ],
};

