// Tests use Node's built-in test runner, so there is nothing to install.
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { greet, createServer } = require('../src/app');

// ---------- Unit tests: small, fast, test one function ----------
describe('greet()', () => {
  test('greets a person by name', () => {
    assert.equal(greet('Sam'), 'Hello, Sam!');
  });

  test('trims extra spaces', () => {
    assert.equal(greet('  Sam  '), 'Hello, Sam!');
  });

  test('falls back to World when the name is empty', () => {
    assert.equal(greet(''), 'Hello, World!');
    assert.equal(greet('   '), 'Hello, World!');
  });

  test('falls back to World when the name is missing', () => {
    assert.equal(greet(undefined), 'Hello, World!');
    assert.equal(greet(null), 'Hello, World!');
  });
});

// ---------- Integration tests: start the real server and call it ----------
describe('HTTP server', () => {
  let server;
  let baseUrl;

  before(async () => {
    server = createServer();
    // Port 0 means "pick any free port", so tests never clash.
    await new Promise((resolve) => server.listen(0, resolve));
    baseUrl = `http://localhost:${server.address().port}`;
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  test('GET /health returns ok', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { status: 'ok' });
  });

  test('GET /greet?name=Sam returns a greeting', async () => {
    const res = await fetch(`${baseUrl}/greet?name=Sam`);
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { message: 'Hello, Sam!' });
  });

  test('GET /greet without a name greets the World', async () => {
    const res = await fetch(`${baseUrl}/greet`);
    assert.deepEqual(await res.json(), { message: 'Hello, World!' });
  });

  test('unknown path returns 404', async () => {
    const res = await fetch(`${baseUrl}/nope`);
    assert.equal(res.status, 404);
  });
});
