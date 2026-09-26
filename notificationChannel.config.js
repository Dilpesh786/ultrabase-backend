module.exports = {
  channels: {
    email: {
      enabled: true,
      provider: 'sendgrid'
    },
    sms: {
      enabled: true,
      provider: 'twilio'
    },
    push: {
      enabled: false,
      provider: 'firebase'
    }
  }
};
