/**
 * Kimi Web Integration Test Suite
 * Verifies that native Kimi Web support is working correctly
 */

import { KimiWebExecutor } from './open-sse/executors/kimi-web.js';

console.log('🧪 Kimi Web Integration Tests\n');

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
  const executor = new KimiWebExecutor();
  assert(executor.provider === 'kimi-web', 'Provider ID is kimi-web');
  assert(typeof executor.execute === 'function', 'Has execute method');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 2: Build URL
console.log('\nTest 2: Build URL');
try {
  const executor = new KimiWebExecutor();
  const url = executor.buildUrl('kimi-k2.7', true, null);
  assert(url.includes('/api/chat'), 'Main endpoint correct');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 3: URL builders
console.log('\nTest 3: URL Builders');
try {
  const executor = new KimiWebExecutor();
  assert(executor.getChatSessionUrl().includes('/api/chat'), 'Session create URL');
  assert(executor.getChatInfoUrl('abc').includes('/api/chat/abc'), 'Chat info URL');
  assert(executor.getChatHistoryUrl('abc').includes('/api/chat/abc/messages'), 'Chat history URL');
  assert(executor.getDeleteSessionUrl('abc').includes('/api/chat/abc'), 'Delete session URL');
  assert(executor.getFileUploadUrl().includes('/api/files/upload'), 'File upload URL');
  assert(executor.getFilesUrl().includes('/api/files'), 'Files URL');
  assert(executor.getUserMeUrl().includes('/api/user/me'), 'User me URL');
  assert(executor.getModelsUrl().includes('/api/models'), 'Models URL');
  assert(executor.getChatTitleUrl('abc').includes('/api/chat/abc/title'), 'Chat title URL');
  assert(executor.getShareChatUrl('abc').includes('/api/chat/abc/share'), 'Share chat URL');
  assert(executor.getSearchUrl().includes('/api/search'), 'Search URL');
  assert(executor.getMemoryUrl('abc').includes('/api/chat/abc/memory'), 'Memory URL');
  assert(executor.getRegenerateUrl('abc').includes('/api/chat/abc/regenerate'), 'Regenerate URL');
  assert(executor.getStopUrl('abc').includes('/api/chat/abc/stop'), 'Stop URL');
  assert(executor.getSubscriptionUrl().includes('/api/subscription'), 'Subscription URL');
  assert(executor.getUsageUrl().includes('/api/usage'), 'Usage URL');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 4: Build headers with token
console.log('\nTest 4: Build Headers');
try {
  const executor = new KimiWebExecutor();
  const headers = await executor.buildWebHeaders({ apiKey: 'test-token-12345' });
  assert(headers.Authorization === 'Bearer test-token-12345', 'Bearer token set');
  assert(headers['Content-Type'] === 'application/json', 'Content-Type set');
  assert(headers['Accept'] === 'text/event-stream', 'Accept set');
  assert(headers.Origin === 'https://kimi.com', 'Origin set');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 5: Build headers without token
console.log('\nTest 5: Build Headers (No Token)');
try {
  const executor = new KimiWebExecutor();
  const headers = await executor.buildWebHeaders(null);
  assert(headers.Authorization === undefined, 'No Authorization header');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 6: Build messages array
console.log('\nTest 6: Build Messages Array');
try {
  const executor = new KimiWebExecutor();
  const messages = [
    { role: 'system', content: 'You are helpful.' },
    { role: 'user', content: 'Hi' },
    { role: 'assistant', content: 'Hello!' },
    { role: 'user', content: 'How are you?' }
  ];
  const result = executor.buildMessagesArray(messages, { model: 'kimi-k2.7' });
  assert(result.length === 4, 'All messages included');
  assert(result[0].role === 'system', 'System message');
  assert(result[1].content === 'Hi', 'User message');
  assert(result[2].role === 'assistant', 'Assistant message');
  assert(result[3].content === 'How are you?', 'Last user message');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 7: Build messages array with array content
console.log('\nTest 7: Build Messages Array (Array Content)');
try {
  const executor = new KimiWebExecutor();
  const messages = [
    { role: 'user', content: [
      { type: 'text', text: 'Hello' },
      { type: 'text', text: 'World' }
    ]}
  ];
  const result = executor.buildMessagesArray(messages, { model: 'kimi-k2.7' });
  assert(result[0].content === 'Hello World', 'Array content joined');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 8: Build payload
console.log('\nTest 8: Build Payload');
try {
  const executor = new KimiWebExecutor();
  const messages = [{ role: 'user', content: 'Test' }];
  const credentials = { apiKey: 'test-token' };
  
  // Mock session creation by setting directly
  executor.sessions.set('test-token', 'mock-session-id');
  executor.parentMessageIds.set('test-token', null);
  
  const { payload, chatId } = await executor.buildWebPayload('kimi-k2.7', messages, true, credentials);
  assert(payload.model === 'kimi-k2.7', 'Model set');
  assert(payload.stream === true, 'Stream set');
  assert(chatId === 'mock-session-id', 'Chat ID set');
  assert(Array.isArray(payload.messages), 'Messages is array');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 9: Model mapping
console.log('\nTest 9: Model Mapping');
try {
  const executor = new KimiWebExecutor();
  const models = [
    { input: 'kimi-k2.7', expected: 'kimi-k2.7' },
    { input: 'kimi-k2.6', expected: 'kimi-k2.6' },
    { input: 'kimi-k2.5', expected: 'kimi-k2.5' },
    { input: 'kimi-k2', expected: 'kimi-k2' },
    { input: 'kimi-k1.5', expected: 'kimi-k1.5' },
    { input: 'kimi', expected: 'kimi' },
    { input: 'ok-computer', expected: 'ok-computer' },
  ];
  
  for (const { input, expected } of models) {
    const messages = [{ role: 'user', content: 'test' }];
    executor.sessions.set('test', 'mock');
    const { payload } = await executor.buildWebPayload(input, messages, true, { apiKey: 'test' });
    assert(payload.model === expected, `${input} → ${expected}`);
  }
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 10: Session management
console.log('\nTest 10: Session Management');
try {
  const executor = new KimiWebExecutor();
  const credentials = { apiKey: 'test-token' };
  
  assert(executor.getSessionId(credentials) === null, 'Initial session ID is null');
  assert(executor.getParentMessageId(credentials) === null, 'Initial parent ID is null');
  
  executor.sessions.set('test-token', 'session-123');
  executor.updateParentMessageId(credentials, 'msg-123');
  assert(executor.getSessionId(credentials) === 'session-123', 'Session ID set');
  assert(executor.getParentMessageId(credentials) === 'msg-123', 'Parent ID updated');
  
  executor.clearSession(credentials);
  assert(executor.getSessionId(credentials) === null, 'Session cleared');
  assert(executor.getParentMessageId(credentials) === null, 'Parent ID cleared');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 11: SSE chunk helper
console.log('\nTest 11: SSE Chunk');
try {
  const executor = new KimiWebExecutor();
  const chunk = executor.sseChunk({ id: 'test', content: 'hello' });
  assert(chunk.startsWith('data: '), 'Starts with data:');
  assert(chunk.endsWith('\n\n'), 'Ends with newline');
  const parsed = JSON.parse(chunk.slice(6));
  assert(parsed.id === 'test', 'JSON content correct');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 12: Error response
console.log('\nTest 12: Error Response');
try {
  const executor = new KimiWebExecutor();
  const resp = executor.errorResponse('Test error', 400);
  assert(resp.response.status === 400, 'Status code');
  const body = await resp.response.json();
  assert(body.error.message === 'Test error', 'Error message');
  assert(body.error.code === 'KIMI-WEB_ERROR', 'Error code');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 13: Handle web error messages
console.log('\nTest 13: Error Messages');
try {
  const executor = new KimiWebExecutor();
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

// Test 14: Provider registry
console.log('\nTest 14: Provider Registry');
try {
  const registry = (await import('./open-sse/providers/registry/kimi-web.js')).default;
  assert(registry.id === 'kimi-web', 'Provider ID');
  assert(registry.category === 'webCookie', 'Category');
  assert(registry.authType === 'cookie', 'Auth type');
  assert(registry.models.length >= 14, 'Has all models');
  
  const modelIds = registry.models.map(m => m.id);
  assert(modelIds.includes('kimi-k2.7'), 'Has kimi-k2.7');
  assert(modelIds.includes('kimi-k2.6'), 'Has kimi-k2.6');
  assert(modelIds.includes('kimi-k2.5'), 'Has kimi-k2.5');
  assert(modelIds.includes('kimi-k2'), 'Has kimi-k2');
  assert(modelIds.includes('kimi-k1.5'), 'Has kimi-k1.5');
  assert(modelIds.includes('kimi'), 'Has kimi');
  assert(modelIds.includes('ok-computer'), 'Has ok-computer');
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
