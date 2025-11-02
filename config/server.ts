export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  // Trust proxy for Railway deployment (enables HTTPS/secure cookies)
  proxy: env.bool('IS_PROXIED', true),
  url: env('PUBLIC_URL', ''),
});
