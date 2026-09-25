module.exports = {
  viewEngine: {
    engine: 'ejs',
    viewsFolder: 'views',
    cache: process.env.NODE_ENV === 'production'
  }
};
