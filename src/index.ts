export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }) {
    // Force Koa to trust proxy for Railway deployment
    // This makes ctx.protocol return 'https' based on X-Forwarded-Proto header
    strapi.server.app.proxy = true;
    
    // Log to confirm it's set
    strapi.log.info('Proxy trust enabled for Railway deployment');
  },
};
