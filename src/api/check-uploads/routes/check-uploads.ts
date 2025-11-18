export default {
  routes: [
    {
      method: 'GET',
      path: '/check-uploads',
      handler: 'check-uploads.check',
      config: {
        // SECURITY: Require authentication to check uploads
        auth: {
          scope: ['api::check-uploads.check']
        },
      },
    },
  ],
};

