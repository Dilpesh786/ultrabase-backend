module.exports = {
  shutdown: {
    signals: ['SIGINT', 'SIGTERM'],
    timeout: 10000
  }
};
