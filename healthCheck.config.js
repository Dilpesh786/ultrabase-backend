module.exports = {
  healthCheck: {
    path: '/health',
    checks: ['database', 'memory', 'disk'],
    interval: 30000
  }
};
