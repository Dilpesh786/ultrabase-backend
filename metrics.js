const os = require('os');

function getSystemMetrics() {
  return {
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    freeMemory: os.freemem(),
    totalMemory: os.totalmem(),
    loadAverage: os.loadavg()
  };
}

module.exports = { getSystemMetrics };
