/**
 * MiniMax Web Integration Test Suite
 * Verifies that native MiniMax Web support is working correctly
 */

import { MiniMaxWebExecutor } from './open-sse/executors/minimax-web.js';

console.log('🧪 MiniMax Web Integration Tests\n');

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
  const executor = new MiniMaxWebExecutor();
  assert(executor.provider === 'minimax-web', 'Provider ID is minimax-web');
  assert(typeof executor.execute === 'function', 'Has execute method');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 2: Build URL
console.log('\nTest 2: Build URL');
try {
  const executor = new MiniMaxWebExecutor();
  const url = executor.buildUrl('minimax-m3', true, null);
  assert(url.includes('/v1/chat/completions'), 'Main endpoint correct');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 3: URL builders
console.log('\nTest 3: URL Builders');
try {
  const executor = new MiniMaxWebExecutor();
  assert(executor.getChatCompletionsUrl().includes('/v1/chat/completions'), 'Chat completions URL');
  assert(executor.getAudioSpeechUrl().includes('/v1/audio/speech'), 'Audio speech URL');
  assert(executor.getAudioTranscriptionsUrl().includes('/v1/audio/transcriptions'), 'Audio transcriptions URL');
  assert(executor.getTokenCheckUrl().includes('/token/check'), 'Token check URL');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 4: Build headers with token
console.log('\nTest 4: Build Headers');
try {
  const executor = new MiniMaxWebExecutor();
  const headers = await executor.buildWebHeaders({ apiKey: 'test-token-12345' });
  assert(headers.Authorization === 'Bearer test-token-12345', 'Bearer token set');
  assert(headers['Content-Type'] === 'application/json', 'Content-Type set');
  assert(headers['Accept'] === 'text/event-stream', 'Accept set');
  assert(headers.Origin === 'https://hailuoai.com', 'Origin set');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 5: Build headers without token
console.log('\nTest 5: Build Headers (No Token)');
try {
  const executor = new MiniMaxWebExecutor();
  const headers = await executor.buildWebHeaders(null);
  assert(headers.Authorization === undefined, 'No Authorization header');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 6: Build messages array
console.log('\nTest 6: Build Messages Array');
try {
  const executor = new MiniMaxWebExecutor();
  const messages = [
    { role: 'system', content: 'You are helpful.' },
    { role: 'user', content: 'Hi' },
    { role: 'assistant', content: 'Hello!' },
    { role: 'user', content: 'How are you?' }
  ];
  const result = executor.buildMessagesArray(messages);
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
  const executor = new MiniMaxWebExecutor();
  const messages = [
    { role: 'user', content: [
      { type: 'text', text: 'Hello' },
      { type: 'text', text: 'World' }
    ]}
  ];
  const result = executor.buildMessagesArray(messages);
  assert(result[0].content === 'Hello World', 'Array content joined');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 8: Build payload
console.log('\nTest 8: Build Payload');
try {
  const executor = new MiniMaxWebExecutor();
  const messages = [{ role: 'user', content: 'Test' }];
  const credentials = { apiKey: 'test-token' };
  
  const payload = await executor.buildWebPayload('minimax-m3', messages, true, credentials);
  assert(payload.model === 'MiniMax-M3', 'Model set');
  assert(payload.stream === true, 'Stream set');
  assert(Array.isArray(payload.messages), 'Messages is array');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 9: Model mapping
console.log('\nTest 9: Model Mapping');
try {
  const executor = new MiniMaxWebExecutor();
  const models = [
    { input: 'minimax-m3', expected: 'MiniMax-M3' },
    { input: 'minimax-m2.7', expected: 'MiniMax-M2.7' },
    { input: 'minimax-m2.5', expected: 'MiniMax-M2.5' },
    { input: 'minimax-m2.1', expected: 'MiniMax-M2.1' },
    { input: 'minimax-m2', expected: 'MiniMax-M2' },
    { input: 'hailuo', expected: 'hailuo' },
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

// Test 10: SSE chunk helper
console.log('\nTest 10: SSE Chunk');
try {
  const executor = new MiniMaxWebExecutor();
  const chunk = executor.sseChunk({ id: 'test', content: 'hello' });
  assert(chunk.startsWith('data: '), 'Starts with data:');
  assert(chunk.endsWith('\n\n'), 'Ends with newline');
  const parsed = JSON.parse(chunk.slice(6));
  assert(parsed.id === 'test', 'JSON content correct');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 11: Error response
console.log('\nTest 11: Error Response');
try {
  const executor = new MiniMaxWebExecutor();
  const resp = executor.errorResponse('Test error', 400);
  assert(resp.response.status === 400, 'Status code');
  const body = await resp.response.json();
  assert(body.error.message === 'Test error', 'Error message');
  assert(body.error.code === 'MINIMAX-WEB_ERROR', 'Error code');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 12: Handle web error messages
console.log('\nTest 12: Error Messages');
try {
  const executor = new MiniMaxWebExecutor();
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

// Test 13: Provider registry
console.log('\nTest 13: Provider Registry');
try {
  const registry = (await import('./open-sse/providers/registry/minimax-web.js')).default;
  assert(registry.id === 'minimax-web', 'Provider ID');
  assert(registry.category === 'webCookie', 'Category');
  assert(registry.authType === 'cookie', 'Auth type');
  assert(registry.models.length >= 12, 'Has all models');
  
  const modelIds = registry.models.map(m => m.id);
  assert(modelIds.includes('minimax-m3'), 'Has minimax-m3');
  assert(modelIds.includes('minimax-m2.7'), 'Has minimax-m2.7');
  assert(modelIds.includes('minimax-m2.5'), 'Has minimax-m2.5');
  assert(modelIds.includes('minimax-m2.1'), 'Has minimax-m2.1');
  assert(modelIds.includes('minimax-m2'), 'Has minimax-m2');
  assert(modelIds.includes('hailuo'), 'Has hailuo');
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
