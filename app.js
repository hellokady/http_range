const cluster = require('cluster');
const os = require('os');
const cpus = os.cpus().length;

if (cluster.isMaster) {
  for (let i = 0; i < cpus; i++) {
    cluster.fork();
  }
  cluster.on('exit', () => {
    cluster.fork();
  });
} else {
  require('./main');
}
