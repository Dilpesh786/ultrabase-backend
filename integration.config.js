module.exports = {
  integrations: {
    stripe: {
      enabled: true,
      publicKey: process.env.STRIPE_PUBLIC_KEY || ''
    },
    paypal: {
      enabled: false,
      mode: 'sandbox'
    }
  }
};
