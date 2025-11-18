export default {
  routes: [
    {
      method: 'GET',
      path: '/upload-check',
      handler: 'upload-check.check',
      config: {
        // SECURITY: Require authentication to check uploads
        auth: {
          scope: ['api::upload-check.check']
        },
      },
    },
  ],
};

