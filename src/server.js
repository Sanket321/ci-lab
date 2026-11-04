// Entry point: starts the web server.
const { createServer } = require('./app');

const port = process.env.PORT || 3000;

createServer().listen(port, () => {
  console.log(`ci-lab listening on http://localhost:${port}`);
});
