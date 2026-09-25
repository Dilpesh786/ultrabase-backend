module.exports = {
  debug: {
    enabled: process.env.NODE_ENV !== 'production',
    level: 'verbose',
    dumpHttpBody: false
  }
};
