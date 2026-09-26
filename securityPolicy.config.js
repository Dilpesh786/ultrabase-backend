module.exports = {
  policy: {
    contentSecurityPolicy: true,
    xssProtection: true,
    frameguard: { action: 'deny' },
    hsts: { maxAge: 31536000, includeSubDomains: true }
  }
};
