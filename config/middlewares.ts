export default ({ env }) => [
  'strapi::logger',
  'strapi::errors',
  'global::health-check',
  'global::cookie-patch', // Patch cookies for Railway proxy
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
        // Railway handles HTTPS at the load balancer level
        secure: false, // Railway proxy handles HTTPS
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 14, // 14 days
        sameSite: 'lax',
      },
    },
  },
  'strapi::favicon',
  'strapi::public',
];
