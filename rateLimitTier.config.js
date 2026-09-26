module.exports = {
  tiers: {
    free: { windowMs: 15 * 60 * 1000, max: 100 },
    pro: { windowMs: 15 * 60 * 1000, max: 1000 },
    enterprise: { windowMs: 15 * 60 * 1000, max: 10000 }
  }
};
