export default ({ env }) => [
  'strapi::logger',
  'strapi::errors',
  'global::health-check',
  'strapi::security',
  {
    name: 'strapi::cors',
    config: {
      origin: [
        'http://localhost:3000', 
        'http://localhost:3001',
        'https://the-pp-new.vercel.app',
        'https://*.vercel.app'
      ],
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
      credentials: true,
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  {
    name: 'strapi::session',
    config: {
      cookie: {
        secure: env.bool('FORCE_HTTPS', true),
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 14, // 14 days
        sameSite: env.bool('FORCE_HTTPS', true) ? 'strict' : 'lax',
      },
    },
  },
  'strapi::favicon',
  'strapi::public',
];
