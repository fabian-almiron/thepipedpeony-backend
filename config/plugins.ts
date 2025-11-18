export default ({ env }) => ({
  'users-permissions': {
    enabled: false,
  },
  // Cloudinary upload provider (comment out to use local uploads)
  upload: {
    config: {
      provider: env('UPLOAD_PROVIDER', 'local'), // Set to 'cloudinary' to enable
      providerOptions: {
        cloud_name: env('CLOUDINARY_NAME'),
        api_key: env('CLOUDINARY_KEY'),
        api_secret: env('CLOUDINARY_SECRET'),
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
});
