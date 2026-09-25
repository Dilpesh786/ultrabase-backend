module.exports = {
  email: {
    service: 'sendgrid',
    apiKey: process.env.SENDGRID_API_KEY || '',
    fromAddress: process.env.EMAIL_FROM || 'no-reply@ultrabase.local'
  }
};
