import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';
import proxyModule from '../src/lib/chat2apiProxy.js';

const { resolveChat2ApiProxyConfig, proxyToChat2Api } = proxyModule;

function createTestServer(handler) {
  return new Promise((resolve) => {
    const server = http.createServer(handler);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${address.port}` });
    });
  });
}

test('resolveChat2ApiProxyConfig returns null when disabled', async () => {
  delete process.env.CHAT2API_PROXY_ENABLED;
  const config = await resolveChat2ApiProxyConfig(new Headers());
  assert.equal(config, null);
});

test('proxyToChat2Api forwards requests to an upstream Chat2API server', async () => {
  const upstream = await createTestServer((req, res) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({
        ok: true,
        path: req.url,
        auth: req.headers.authorization,
        body,
      }));
    });
  });

  process.env.CHAT2API_PROXY_ENABLED = 'true';
  process.env.CHAT2API_PROXY_BASE_URL = upstream.baseUrl;
  process.env.CHAT2API_PROXY_API_KEY = 'test-key';

  const request = new Request('http://localhost/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: 'hello' }] }),
  });

  const response = await proxyToChat2Api(request);
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.path, '/v1/chat/completions');
  assert.equal(payload.auth, 'Bearer test-key');
  assert.match(payload.body, /gpt-4o-mini/);

  upstream.server.close();
  await once(upstream.server, 'close');
});

test('proxyToChat2Api avoids duplicating /v1 when the upstream base URL already includes it', async () => {
  const upstream = await createTestServer((req, res) => {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ path: req.url }));
  });

  process.env.CHAT2API_PROXY_ENABLED = 'true';
  process.env.CHAT2API_PROXY_BASE_URL = `${upstream.baseUrl}/v1`;
  process.env.CHAT2API_PROXY_API_KEY = 'test-key';

  const request = new Request('http://localhost/api/v1/chat/completions', {
    method: 'GET',
  });

  const response = await proxyToChat2Api(request);
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.path, '/v1/chat/completions');

  upstream.server.close();
  await once(upstream.server, 'close');
});

test('resolveChat2ApiProxyConfig uses provider connections when no explicit base URL is set', async () => {
  delete process.env.CHAT2API_PROXY_BASE_URL;
  process.env.CHAT2API_PROXY_ENABLED = 'true';

  const request = new Request('http://localhost/api/v1/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ model: 'deepseek/deepseek-chat' }),
  });

  const providerConnections = [{
    isActive: true,
    provider: 'deepseek',
    providerSpecificData: {
      baseUrl: 'https://example.test/v1',
      apiKey: 'provider-key',
    },
  }];

  const config = await resolveChat2ApiProxyConfig(new Headers(), { chat2ApiProxyEnabled: true }, request, providerConnections);
  assert.equal(config?.baseUrl, 'https://example.test/v1');
  assert.equal(config?.apiKey, 'provider-key');
  assert.equal(config?.source, 'provider-connection');
});

test('resolveChat2ApiProxyConfig uses a provider header when the model is bare', async () => {
  delete process.env.CHAT2API_PROXY_BASE_URL;
  process.env.CHAT2API_PROXY_ENABLED = 'true';

  const request = new Request('http://localhost/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-9router-provider': 'deepseek',
    },
    body: JSON.stringify({ model: 'deepseek-chat' }),
  });

  const providerConnections = [{
    isActive: true,
    provider: 'deepseek',
    providerSpecificData: {
      baseUrl: 'https://example.test/v1',
      apiKey: 'provider-key',
    },
  }];

  const config = await resolveChat2ApiProxyConfig(new Headers(), { chat2ApiProxyEnabled: true }, request, providerConnections);
  assert.equal(config?.baseUrl, 'https://example.test/v1');
  assert.equal(config?.apiKey, 'provider-key');
});

test('proxyToChat2Api rewrites Kimi requests to the provider-specific chat path and body format', async () => {
  const upstream = await createTestServer((req, res) => {
    let body = Buffer.alloc(0);
    req.on('data', (chunk) => {
      body = Buffer.concat([body, Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)]);
    });
    req.on('end', () => {
      const payloadText = body.toString('utf8');
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({
        ok: true,
        path: req.url,
        contentType: req.headers['content-type'],
        payload: payloadText,
      }));
    });
  });

  process.env.CHAT2API_PROXY_ENABLED = 'true';
  process.env.CHAT2API_PROXY_BASE_URL = upstream.baseUrl;
  process.env.CHAT2API_PROXY_API_KEY = 'test-key';

  const request = new Request('http://localhost/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
      'x-9router-provider': 'kimi',
    },
    body: JSON.stringify({ model: 'Kimi-K2.6', messages: [{ role: 'user', content: 'hello' }] }),
  });

  const response = await proxyToChat2Api(request);
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.path, '/apiv2/kimi.gateway.chat.v1.ChatService/Chat');
  assert.match(payload.contentType, /connect\+json/);
  assert.match(payload.payload, /"scenario":"SCENARIO_K2D6"/);
  assert.match(payload.payload, /"message"/);

  upstream.server.close();
  await once(upstream.server, 'close');
});
