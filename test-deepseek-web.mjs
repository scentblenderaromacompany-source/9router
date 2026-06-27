/**
 * DeepSeek Web Integration Test Suite
 * Verifies that native DeepSeek Web support is working correctly
 *
 * Model IDs match official DeepSeek API:
 * - deepseek-v4-flash, deepseek-v4-flash-reasoner, deepseek-v4-flash-search
 * - deepseek-v4-pro, deepseek-v4-pro-reasoner, deepseek-v4-pro-search
 * - deepseek-chat, deepseek-reasoner (legacy V3.2)
 */

import { DeepSeekWebExecutor } from './open-sse/executors/deepseek-web.js';

console.log('🧪 DeepSeek Web Integration Tests\n');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ ${message}`);
    passed++;
  } else {
    console.error(`❌ ${message}`);
    failed++;
  }
}

// Test 1: Executor instantiation
console.log('Test 1: Executor Instantiation');
try {
  const executor = new DeepSeekWebExecutor();
  assert(executor.provider === 'deepseek-web', 'Provider ID is deepseek-web');
  assert(typeof executor.execute === 'function', 'Has execute method');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 2: Build URL
console.log('\nTest 2: Build URL');
try {
  const executor = new DeepSeekWebExecutor();
  const url = executor.buildUrl('deepseek-v4-flash', true, 0, null);
  assert(url === 'https://chat.deepseek.com/api/v0/chat/completion', 'Main endpoint correct');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 3: Build headers with token (uses FAKE_HEADERS now)
console.log('\nTest 3: Build Headers');
try {
  const executor = new DeepSeekWebExecutor();
  const headers = await executor.buildWebHeaders({ apiKey: 'test-token-12345' });
  assert(headers.Authorization === 'Bearer test-token-12345', 'Bearer token set');
  assert(headers['Content-Type'] === 'application/json', 'Content-Type set');
  assert(headers.Origin === 'https://chat.deepseek.com', 'Origin set');
  assert(headers['X-Client-Version'] === '2.0.0', 'Client version set');
  assert(headers['X-Client-Platform'] === 'web', 'Client platform set');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 4: Build headers without token
console.log('\nTest 4: Build Headers (No Token)');
try {
  const executor = new DeepSeekWebExecutor();
  const headers = await executor.buildWebHeaders(null);
  assert(headers.Authorization === undefined, 'No Authorization header');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 5: Build prompt with DeepSeek markers
console.log('\nTest 5: Build Prompt (DeepSeek Markers)');
try {
  const executor = new DeepSeekWebExecutor();
  const messages = [
    { role: 'system', content: 'You are helpful.' },
    { role: 'user', content: 'Hi' },
    { role: 'assistant', content: 'Hello!' },
    { role: 'user', content: 'How are you?' }
  ];
  const prompt = executor.buildPrompt(messages);
  assert(prompt.includes('You are helpful.'), 'System message (no prefix)');
  assert(prompt.includes('<｜User｜>Hi'), 'User message with marker');
  assert(prompt.includes('<｜Assistant｜>Hello!<｜end of sentence｜>'), 'Assistant message with markers');
  assert(prompt.includes('<｜User｜>How are you?'), 'Last user message with marker');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 6: Build prompt with array content
console.log('\nTest 6: Build Prompt (Array Content)');
try {
  const executor = new DeepSeekWebExecutor();
  const messages = [
    { role: 'user', content: [
      { type: 'text', text: 'Hello' },
      { type: 'text', text: 'World' }
    ]}
  ];
  const prompt = executor.buildPrompt(messages);
  assert(prompt.includes('Hello') && prompt.includes('World'), 'Array content joined');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 7: Build payload
console.log('\nTest 7: Build Payload');
try {
  const executor = new DeepSeekWebExecutor();
  const messages = [{ role: 'user', content: 'Test' }];
  const credentials = { apiKey: 'test-token' };

  // Mock session creation by setting directly
  executor.sessionCache.set('test-token', { sessionId: 'mock-session-id', createdAt: Date.now() });
  executor.parentMessageIds.set('test-token', null);

  const payload = await executor.buildWebPayload('deepseek-v4-flash', messages, true, credentials);
  assert(payload.prompt === 'Test', 'Prompt for single user message (no marker at index 0)');
  assert(payload.model_type === 'default', 'model_type is default for v4-flash');
  assert(payload.chat_session_id === 'mock-session-id', 'Session ID set');
  assert(payload.ref_file_ids !== undefined, 'ref_file_ids present');
  assert(payload.search_enabled === false, 'search_enabled false for base model');
  assert(payload.thinking_enabled === false, 'thinking_enabled false for base model');
  assert(payload.preempt === false, 'preempt false');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 8: Model mapping — V4 Flash models
console.log('\nTest 8: Model Mapping (V4 Flash)');
try {
  const executor = new DeepSeekWebExecutor();
  const models = [
    { input: 'deepseek-v4-flash', expectedType: 'default', expectSearch: false, expectThink: false },
    { input: 'deepseek-v4-flash-reasoner', expectedType: 'default', expectSearch: false, expectThink: true },
    { input: 'deepseek-v4-flash-search', expectedType: 'default', expectSearch: true, expectThink: false },
    { input: 'deepseek-v4-flash-reasoner-search', expectedType: 'default', expectSearch: true, expectThink: true },
  ];

  executor.sessionCache.set('test', { sessionId: 's', createdAt: Date.now() });

  for (const { input, expectedType, expectSearch, expectThink } of models) {
    const messages = [{ role: 'user', content: 'test' }];
    const payload = await executor.buildWebPayload(input, messages, true, { apiKey: 'test' });
    assert(payload.model_type === expectedType, `${input} → model_type=${expectedType}`);
    assert(payload.search_enabled === expectSearch, `${input} → search_enabled=${expectSearch}`);
    assert(payload.thinking_enabled === expectThink, `${input} → thinking_enabled=${expectThink}`);
  }
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 9: Model mapping — V4 Pro models
console.log('\nTest 9: Model Mapping (V4 Pro)');
try {
  const executor = new DeepSeekWebExecutor();
  const models = [
    { input: 'deepseek-v4-pro', expectedType: 'expert', expectSearch: false, expectThink: false },
    { input: 'deepseek-v4-pro-reasoner', expectedType: 'expert', expectSearch: false, expectThink: true },
    { input: 'deepseek-v4-pro-search', expectedType: 'expert', expectSearch: true, expectThink: false },
    { input: 'deepseek-v4-pro-reasoner-search', expectedType: 'expert', expectSearch: true, expectThink: true },
  ];

  executor.sessionCache.set('test', { sessionId: 's', createdAt: Date.now() });

  for (const { input, expectedType, expectSearch, expectThink } of models) {
    const messages = [{ role: 'user', content: 'test' }];
    const payload = await executor.buildWebPayload(input, messages, true, { apiKey: 'test' });
    assert(payload.model_type === expectedType, `${input} → model_type=${expectedType}`);
    assert(payload.search_enabled === expectSearch, `${input} → search_enabled=${expectSearch}`);
    assert(payload.thinking_enabled === expectThink, `${input} → thinking_enabled=${expectThink}`);
  }
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 10: Model mapping — Legacy V3.2
console.log('\nTest 10: Model Mapping (Legacy V3.2)');
try {
  const executor = new DeepSeekWebExecutor();
  const models = [
    { input: 'deepseek-chat', expectedType: 'default', expectSearch: false, expectThink: false },
    { input: 'deepseek-reasoner', expectedType: 'default', expectSearch: false, expectThink: true },
  ];

  executor.sessionCache.set('test', { sessionId: 's', createdAt: Date.now() });

  for (const { input, expectedType, expectSearch, expectThink } of models) {
    const messages = [{ role: 'user', content: 'test' }];
    const payload = await executor.buildWebPayload(input, messages, true, { apiKey: 'test' });
    assert(payload.model_type === expectedType, `${input} → model_type=${expectedType}`);
    assert(payload.search_enabled === expectSearch, `${input} → search_enabled=${expectSearch}`);
    assert(payload.thinking_enabled === expectThink, `${input} → thinking_enabled=${expectThink}`);
  }
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 11: Session management
console.log('\nTest 11: Session Management');
try {
  const executor = new DeepSeekWebExecutor();
  const credentials = { apiKey: 'test-token' };

  assert(executor.getParentMessageId(credentials) === null, 'Initial parent ID is null');

  executor.updateParentMessageId(credentials, 'msg-123');
  assert(executor.getParentMessageId(credentials) === 'msg-123', 'Parent ID updated');

  executor.clearSession(credentials);
  assert(executor.getParentMessageId(credentials) === null, 'Session cleared');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 12: SSE chunk helper
console.log('\nTest 12: SSE Chunk');
try {
  const executor = new DeepSeekWebExecutor();
  const chunk = executor.sseChunk({ id: 'test', content: 'hello' });
  assert(chunk.startsWith('data: '), 'Starts with data:');
  assert(chunk.endsWith('\n\n'), 'Ends with newline');
  const parsed = JSON.parse(chunk.slice(6));
  assert(parsed.id === 'test', 'JSON content correct');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 13: Error response
console.log('\nTest 13: Error Response');
try {
  const executor = new DeepSeekWebExecutor();
  const resp = executor.errorResponse('Test error', 400);
  assert(resp.response.status === 400, 'Status code');
  const body = await resp.response.json();
  assert(body.error.message === 'Test error', 'Error message');
  assert(body.error.code === 'DEEPSEEK-WEB_ERROR', 'Error code');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 14: Handle web error messages
console.log('\nTest 14: Error Messages');
try {
  const executor = new DeepSeekWebExecutor();
  const errors = [
    { status: 401, expected: 'session expired' },
    { status: 403, expected: 'session expired' },
    { status: 429, expected: 'rate limited' },
    { status: 404, expected: 'not found' },
    { status: 400, expected: 'bad request' },
    { status: 500, expected: 'server error' },
  ];

  for (const { status, expected } of errors) {
    const resp = executor.handleWebError({ status }, status, null);
    const body = await resp.response.json();
    assert(body.error.message.toLowerCase().includes(expected), `${status} error message`);
  }
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 15: Provider registry
console.log('\nTest 15: Provider Registry');
try {
  const registry = (await import('./open-sse/providers/registry/deepseek-web.js')).default;
  assert(registry.id === 'deepseek-web', 'Provider ID');
  assert(registry.category === 'webCookie', 'Category');
  assert(registry.authType === 'cookie', 'Auth type');
  assert(registry.models.length >= 10, 'Has all models');

  const modelIds = registry.models.map(m => m.id);
  assert(modelIds.includes('deepseek-v4-flash'), 'Has deepseek-v4-flash');
  assert(modelIds.includes('deepseek-v4-flash-reasoner'), 'Has deepseek-v4-flash-reasoner');
  assert(modelIds.includes('deepseek-v4-flash-search'), 'Has deepseek-v4-flash-search');
  assert(modelIds.includes('deepseek-v4-pro'), 'Has deepseek-v4-pro');
  assert(modelIds.includes('deepseek-v4-pro-reasoner'), 'Has deepseek-v4-pro-reasoner');
  assert(modelIds.includes('deepseek-chat'), 'Has deepseek-chat (legacy)');
  assert(modelIds.includes('deepseek-reasoner'), 'Has deepseek-reasoner (legacy)');
  assert(!modelIds.includes('deepseek-default'), 'No stale deepseek-default');
  assert(!modelIds.includes('deepseek-expert'), 'No stale deepseek-expert');
  assert(!modelIds.includes('deepseek-vision'), 'No stale deepseek-vision');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Summary
console.log('\n' + '='.repeat(40));
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('='.repeat(40));

if (failed > 0) {
  process.exit(1);
} else {
  console.log('\n✅ All tests passed!\n');
}
