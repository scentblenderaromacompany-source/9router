/**
 * DeepSeek Web Integration Test Suite
 * Verifies that native DeepSeek Web support is working correctly
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
  const url = executor.buildUrl('deepseek-default', true, 0, null);
  assert(url === 'https://chat.deepseek.com/api/v0/chat/completion', 'Main endpoint correct');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 3: URL builders
console.log('\nTest 3: URL Builders');
try {
  const executor = new DeepSeekWebExecutor();
  assert(executor.getChatSessionUrl().includes('/api/v0/chat_session/create'), 'Session create URL');
  assert(executor.getDeleteSessionUrl().includes('/api/v0/chat_session/delete'), 'Session delete URL');
  assert(executor.getHistoryUrl().includes('/api/v0/chat/history_messages'), 'History URL');
  assert(executor.getFileUploadUrl().includes('/api/v0/file/upload_file'), 'File upload URL');
  assert(executor.getFileStatusUrl('test').includes('/api/v0/file/fetch_files'), 'File status URL');
  assert(executor.getSettingsUrl().includes('/api/v0/client/settings'), 'Settings URL');
  assert(executor.getPowChallengeUrl().includes('/api/v0/chat/create_pow_challenge'), 'PoW URL');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 4: Build headers with token
console.log('\nTest 4: Build Headers');
try {
  const executor = new DeepSeekWebExecutor();
  const headers = await executor.buildWebHeaders({ apiKey: 'test-token-12345' });
  assert(headers.Authorization === 'Bearer test-token-12345', 'Bearer token set');
  assert(headers['Content-Type'] === 'application/json', 'Content-Type set');
  assert(headers['Accept'] === 'text/event-stream', 'Accept set');
  assert(headers.Origin === 'https://chat.deepseek.com', 'Origin set');
  assert(headers['x-client-version'] === '2.0.2', 'Client version set');
  assert(headers['x-client-platform'] === 'web', 'Client platform set');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 5: Build headers without token
console.log('\nTest 5: Build Headers (No Token)');
try {
  const executor = new DeepSeekWebExecutor();
  const headers = await executor.buildWebHeaders(null);
  assert(headers.Authorization === undefined, 'No Authorization header');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 6: Build prompt
console.log('\nTest 6: Build Prompt');
try {
  const executor = new DeepSeekWebExecutor();
  const messages = [
    { role: 'system', content: 'You are helpful.' },
    { role: 'user', content: 'Hi' },
    { role: 'assistant', content: 'Hello!' },
    { role: 'user', content: 'How are you?' }
  ];
  const prompt = executor.buildPrompt(messages);
  assert(prompt.includes('[System] You are helpful.'), 'System message');
  assert(prompt.includes('Hi'), 'User message');
  assert(prompt.includes('[Assistant] Hello!'), 'Assistant message');
  assert(prompt.includes('How are you?'), 'Last user message');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 7: Build prompt with array content
console.log('\nTest 7: Build Prompt (Array Content)');
try {
  const executor = new DeepSeekWebExecutor();
  const messages = [
    { role: 'user', content: [
      { type: 'text', text: 'Hello' },
      { type: 'text', text: 'World' }
    ]}
  ];
  const prompt = executor.buildPrompt(messages);
  assert(prompt.includes('Hello World'), 'Array content joined');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 8: Build payload
console.log('\nTest 8: Build Payload');
try {
  const executor = new DeepSeekWebExecutor();
  const messages = [{ role: 'user', content: 'Test' }];
  const credentials = { apiKey: 'test-token' };
  
  // Mock session creation by setting directly
  executor.sessions.set('test-token', 'mock-session-id');
  executor.parentMessageIds.set('test-token', null);
  
  const payload = await executor.buildWebPayload('deepseek-default', messages, true, credentials);
  assert(payload.prompt === 'Test', 'Prompt set');
  assert(payload.model === 'default', 'Model set');
  assert(payload.stream === true, 'Stream set');
  assert(payload.chat_session_id === 'mock-session-id', 'Session ID set');
  assert(payload.ref_file_ids !== undefined, 'ref_file_ids present');
  assert(payload.search_enabled !== undefined, 'search_enabled present');
  assert(payload.thinking_enabled !== undefined, 'thinking_enabled present');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 9: Model mapping
console.log('\nTest 9: Model Mapping');
try {
  const executor = new DeepSeekWebExecutor();
  const models = [
    { input: 'deepseek-default', expected: 'default' },
    { input: 'deepseek-reasoner', expected: 'reasoner' },
    { input: 'deepseek-search', expected: 'search' },
    { input: 'deepseek-expert', expected: 'expert' },
    { input: 'deepseek-expert-reasoner', expected: 'expert-reasoner' },
    { input: 'deepseek-vision', expected: 'vision' },
    { input: 'deepseek-web-chat', expected: 'default' },
    { input: 'deepseek-web-reasoner', expected: 'reasoner' },
  ];
  
  for (const { input, expected } of models) {
    const messages = [{ role: 'user', content: 'test' }];
    const payload = await executor.buildWebPayload(input, messages, true, { apiKey: 'test' });
    assert(payload.model === expected, `${input} → ${expected}`);
  }
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 10: Session management
console.log('\nTest 10: Session Management');
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

// Test 11: SSE chunk helper
console.log('\nTest 11: SSE Chunk');
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

// Test 12: Error response
console.log('\nTest 12: Error Response');
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

// Test 13: Handle web error messages
console.log('\nTest 13: Error Messages');
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

// Test 14: Provider registry
console.log('\nTest 14: Provider Registry');
try {
  const registry = (await import('./open-sse/providers/registry/deepseek-web.js')).default;
  assert(registry.id === 'deepseek-web', 'Provider ID');
  assert(registry.category === 'webCookie', 'Category');
  assert(registry.authType === 'cookie', 'Auth type');
  assert(registry.models.length >= 12, 'Has all models');
  
  const modelIds = registry.models.map(m => m.id);
  assert(modelIds.includes('deepseek-default'), 'Has deepseek-default');
  assert(modelIds.includes('deepseek-reasoner'), 'Has deepseek-reasoner');
  assert(modelIds.includes('deepseek-expert'), 'Has deepseek-expert');
  assert(modelIds.includes('deepseek-vision'), 'Has deepseek-vision');
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
