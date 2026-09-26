module.exports = {
  loadBalancer: {
    algorithm: 'round-robin',
    healthCheckInterval: 10000,
    failoverEnabled: true
  }
};
