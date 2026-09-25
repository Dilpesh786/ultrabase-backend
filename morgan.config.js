module.exports = {
  morgan: {
    format: process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
    options: {
      skip: (req, res) => res.statusCode < 400
    }
  }
};
