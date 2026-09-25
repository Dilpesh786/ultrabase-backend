module.exports = {
  backupSchedule: {
    frequency: '0 0 * * *', // Daily at midnight
    retentionDays: 30,
    destination: './backups'
  }
};
