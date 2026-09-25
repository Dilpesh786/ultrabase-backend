module.exports = {
  websocket: {
    path: '/ws',
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    },
    pingInterval: 25000,
    pingTimeout: 5000
  }
};
