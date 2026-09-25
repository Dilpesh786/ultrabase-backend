module.exports = {
  pushNotification: {
    provider: 'firebase',
    serverKey: process.env.FCM_SERVER_KEY || '',
    senderId: process.env.FCM_SENDER_ID || ''
  }
};
