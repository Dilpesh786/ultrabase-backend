module.exports = {
  cdn: {
    provider: 'cloudflare',
    domain: process.env.CDN_DOMAIN || 'cdn.ultrabase.local',
    zoneId: process.env.CDN_ZONE_ID || ''
  }
};
