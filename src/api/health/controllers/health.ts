/**
 * health controller
 */

export default {
  index: async (ctx) => {
    try {
      ctx.body = {
        status: 'ok',
        timestamp: new Date().toISOString(),
      };
      ctx.status = 200;
    } catch (err) {
      ctx.body = { status: 'error' };
      ctx.status = 500;
    }
  },
};

