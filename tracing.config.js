module.exports = {
  tracing: {
    enabled: process.env.NODE_ENV === 'production',
    serviceName: 'ultrabase-backend',
    samplerRate: 1.0
  }
};
