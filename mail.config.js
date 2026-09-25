module.exports = {
  mail: {
    host: process.env.MAIL_HOST || 'smtp.mailtrap.io',
    port: process.env.MAIL_PORT || 2525,
    auth: {
      user: process.env.MAIL_USER || '',
      pass: process.env.MAIL_PASS || ''
    },
    from: 'noreply@ultrabase.com'
  }
};
