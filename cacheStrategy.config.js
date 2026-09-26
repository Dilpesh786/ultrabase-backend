module.exports = {
  strategy: {
    defaultTTL: 3600,
    checkPeriod: 600,
    maxKeys: 5000,
    engine: 'memory'
  }
};
