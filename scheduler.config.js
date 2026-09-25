module.exports = {
  scheduler: {
    enabled: process.env.ENABLE_SCHEDULER === 'true',
    timezone: process.env.TZ || 'UTC',
    defaultCron: '0 0 * * *' // Daily at midnight
  }
};
