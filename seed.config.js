module.exports = {
  seed: {
    runOnStartup: process.env.RUN_SEEDER === 'true',
    collections: ['users', 'roles', 'permissions'],
    dropExisting: false
  }
};
