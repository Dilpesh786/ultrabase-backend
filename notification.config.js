module.exports = {
  notification: {
    channels: ['mail', 'sms', 'push'],
    sms: {
      provider: 'twilio',
      accountSid: process.env.TWILIO_ACCOUNT_SID || '',
      authToken: process.env.TWILIO_AUTH_TOKEN || ''
    },
    push: {
      provider: 'firebase',
      serverKey: process.env.FCM_SERVER_KEY || ''
    }
  }
};
