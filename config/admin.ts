export default ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
    // Session configuration for cookie settings
    // Railway handles HTTPS at the load balancer, internal traffic is HTTP
    sessions: {
      cookie: {
        secure: false, // Railway proxy handles HTTPS
        sameSite: 'lax',
        httpOnly: true,
      },
      // Session lifespans (Strapi 5 new config)
      maxSessionLifespan: 1000 * 60 * 60 * 24 * 14, // 14 days
      maxRefreshTokenLifespan: 1000 * 60 * 60 * 24 * 30, // 30 days
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
