module.exports = {
  webhook: {
    secret: process.env.WEBHOOK_SECRET || 'secret',
    timeout: 10000,
    retries: 3
  }
};
