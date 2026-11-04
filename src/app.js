// A very small web app with no external dependencies.
// It has two endpoints:
//   GET /health          -> {"status":"ok"}
//   GET /greet?name=Sam  -> {"message":"Hello, Sam!"}

const http = require('node:http');

// Pure function: easy to unit test.
function greet(name) {
  const clean = String(name ?? '').trim();
  if (!clean) return 'Hello, World!';
  return `Hello, ${clean}!`;
}

function sendJson(res, statusCode, body) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

function createServer() {
  return http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');

    if (req.method === 'GET' && url.pathname === '/health') {
      return sendJson(res, 200, { status: 'ok' });
    }

    if (req.method === 'GET' && url.pathname === '/greet') {
      const name = url.searchParams.get('name');
      return sendJson(res, 200, { message: greet(name) });
    }

    return sendJson(res, 404, { error: 'Not found' });
  });
}

module.exports = { greet, createServer };
