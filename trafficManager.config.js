module.exports = {
  trafficManager: {
    enabled: true,
    maxConcurrentRequests: 10000,
    timeout: 30000,
    retryAttempts: 3
  }
};
