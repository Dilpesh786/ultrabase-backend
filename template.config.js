module.exports = {
  template: {
    engine: 'ejs',
    viewsPath: 'views/templates',
    cache: process.env.NODE_ENV === 'production'
  }
};
