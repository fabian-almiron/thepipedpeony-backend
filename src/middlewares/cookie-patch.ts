/**
 * `cookie-patch` middleware
 * Patches Set-Cookie headers to work with Railway's HTTPS proxy
 */

export default (config, { strapi }) => {
  return async (ctx, next) => {
    await next();
    
    // Patch Set-Cookie headers to remove Secure flag for Railway proxy
    if (ctx.response && ctx.response.headers) {
      const setCookie = ctx.response.headers['set-cookie'];
      if (setCookie) {
        const patched = Array.isArray(setCookie)
          ? setCookie.map(cookie => {
              // Remove Secure flag but keep other attributes
              return cookie.replace(/;\s*Secure/gi, '');
            })
          : setCookie.replace(/;\s*Secure/gi, '');
        
        ctx.response.headers['set-cookie'] = patched;
      }
    }
  };
};

