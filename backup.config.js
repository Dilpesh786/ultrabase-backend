module.exports = {
  backup: {
    enabled: true,
    schedule: '0 0 * * *', // Daily at midnight
    destination: 'backups/',
    retentionDays: 7
  }
};
