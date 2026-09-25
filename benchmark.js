const autocannon = require('autocannon');

function runBenchmark() {
  const instance = autocannon({
    url: 'http://localhost:5000',
    connections: 10,
    duration: 10
  }, console.log);

  autocannon.track(instance, { renderProgressBar: true });
}

if (require.main === module) {
  runBenchmark();
}

module.exports = runBenchmark;
