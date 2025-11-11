/**
 * `health-check` middleware
 */

export default (config, { strapi }) => {
  return async (ctx, next) => {
    if (ctx.request.url === '/health' && ctx.request.method === 'GET') {
      ctx.status = 200;
      ctx.body = {
        status: 'ok',
        timestamp: new Date().toISOString(),
      };
      return;
    }
    
    await next();
  };
};

