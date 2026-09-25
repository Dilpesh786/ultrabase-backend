module.exports = {
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    format: 'json',
    transports: ['console', 'file'],
    filename: 'logs/app.log'
  }
};
