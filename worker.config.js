module.exports = {
  worker: {
    concurrency: parseInt(process.env.WORKER_CONCURRENCY, 10) || 5,
    maxJobsPerWorker: 1000,
    pollInterval: 1000,
    timeout: 30000
  }
};
