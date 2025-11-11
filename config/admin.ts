export default ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
    // Session configuration for cookie settings
    sessions: {
      cookie: {
        secure: env.bool('FORCE_HTTPS', true),
        sameSite: env.bool('FORCE_HTTPS', true) ? 'strict' : 'lax',
      },
    },
  },
  apiToken: {
    salt: env('API_TOKEN_SALT'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT'),
    },
  },
  secrets: {
    encryptionKey: env('ENCRYPTION_KEY'),
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
  },
  url: env('PUBLIC_URL', '/admin'),
  // Force secure cookies to work behind Railway's HTTPS proxy
  forceHTTPS: env.bool('FORCE_HTTPS', true),
});
