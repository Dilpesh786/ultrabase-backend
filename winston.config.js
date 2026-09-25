module.exports = {
  winston: {
    level: process.env.LOG_LEVEL || 'info',
    file: {
      filename: 'logs/app.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: 'json'
    },
    console: {
      format: 'simple'
    }
  }
};
