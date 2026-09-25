module.exports = {
  search: {
    engine: 'elasticsearch',
    host: process.env.ELASTICSEARCH_HOST || 'localhost',
    port: process.env.ELASTICSEARCH_PORT || 9200,
    indexPrefix: 'ultrabase_'
  }
};
