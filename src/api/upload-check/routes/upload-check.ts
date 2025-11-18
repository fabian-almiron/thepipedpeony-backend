export default {
  routes: [
    {
      method: 'GET',
      path: '/upload-check',
      handler: 'upload-check.check',
      config: {
        auth: false,
      },
    },
  ],
};

