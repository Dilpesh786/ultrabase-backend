module.exports = {
  queue: {
    name: 'default-queue',
    redis: {
      host: '127.0.0.1',
      port: 6379
    },
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000
      }
    }
  }
};
