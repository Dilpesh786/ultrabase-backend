module.exports = {
  loadBalancer: {
    algorithm: 'round-robin',
    servers: [
      { host: 'localhost', port: 5000, weight: 1 }
    ],
    healthCheckInterval: 30000
  }
};
