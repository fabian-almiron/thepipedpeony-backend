export default {
  routes: [
    {
      method: 'GET',
      path: '/check-uploads',
      handler: 'check-uploads.check',
      config: {
        auth: false,
      },
    },
  ],
};

