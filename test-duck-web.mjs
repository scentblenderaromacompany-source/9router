/**
 * Duck.ai (DuckWeb) Integration Test Suite
 * Verifies that native Duck.ai Web support is working correctly
 */

import { DuckWebExecutor } from './open-sse/executors/duck-web.js';

console.log('🧪 Duck.ai (DuckWeb) Integration Tests\n');

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
  const executor = new DuckWebExecutor();
  assert(executor.providerId === 'duck-web', 'Provider ID is duck-web');
  assert(typeof executor.execute === 'function', 'Has execute method');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 2: Build URL
console.log('\nTest 2: Build URL');
try {
  const executor = new DuckWebExecutor();
  const url = executor.buildUrl('gpt-4o-mini', true, null);
  assert(url.includes('/duckchat/v1/chat'), 'Chat endpoint');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 3: URL builders
console.log('\nTest 3: URL Builders');
try {
  const executor = new DuckWebExecutor();
  assert(executor.getStatusUrl().includes('/duckchat/v1/status'), 'Status URL');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 4: Build headers
console.log('\nTest 4: Build Headers');
try {
  const executor = new DuckWebExecutor();
  const headers = executor.buildWebHeaders(null);
  assert(headers['Content-Type'] === 'application/json', 'Content-Type set');
  assert(headers['Accept'] === 'text/event-stream', 'Accept set');
  assert(headers['Origin'] === 'https://duck.ai', 'Origin set');
  assert(headers['User-Agent'].includes('Chrome'), 'User-Agent set');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 5: Build headers with VQD hash
console.log('\nTest 5: Build Headers (With VQD Hash)');
try {
  const executor = new DuckWebExecutor();
  executor.pendingHash = 'test-hash-123';
  const headers = executor.buildWebHeaders(null);
  assert(headers['x-vqd-hash-1'] === 'test-hash-123', 'VQD hash set');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 6: Build messages array
console.log('\nTest 6: Build Messages Array');
try {
  const executor = new DuckWebExecutor();
  const messages = [
    { role: 'system', content: 'You are helpful.' },
    { role: 'user', content: 'Hello' },
    { role: 'assistant', content: 'Hi!' },
    { role: 'user', content: 'How are you?' }
  ];
  const result = executor.buildMessagesArray(messages);
  assert(result.length === 4, 'All messages included');
  assert(result[0].role === 'system', 'System message');
  assert(result[1].content === 'Hello', 'User message');
  assert(result[2].role === 'assistant', 'Assistant message');
  assert(result[3].content === 'How are you?', 'Last user message');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 7: Build messages array with array content
console.log('\nTest 7: Build Messages Array (Array Content)');
try {
  const executor = new DuckWebExecutor();
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
  const executor = new DuckWebExecutor();
  const messages = [{ role: 'user', content: 'Test' }];
  const payload = executor.buildWebPayload('gpt-4o-mini', messages, true, null);
  assert(payload.model === 'gpt-4o-mini', 'Model set');
  assert(Array.isArray(payload.messages), 'Messages is array');
  assert(payload.messages[0].content === 'Test', 'Message content');
  assert(typeof payload.reasoningEffort === 'string', 'Reasoning effort set');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 9: FE signals generation
console.log('\nTest 9: FE Signals');
try {
  const executor = new DuckWebExecutor();
  const signals = executor.generateFeSignals();
  assert(typeof signals === 'string', 'Signals is string');
  const decoded = JSON.parse(Buffer.from(signals, 'base64').toString());
  assert(decoded.start > 0, 'Has start time');
  assert(Array.isArray(decoded.events), 'Has events');
  assert(decoded.end > 0, 'Has end time');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 10: Provider registry
console.log('\nTest 10: Provider Registry');
try {
  const registry = (await import('./open-sse/providers/registry/duck-web.js')).default;
  assert(registry.id === 'duck-web', 'Provider ID');
  assert(registry.category === 'webCookie', 'Category');
  assert(registry.authType === 'none', 'Auth type (free)');
  assert(registry.models.length >= 6, 'Has all models');
  
  const modelIds = registry.models.map(m => m.id);
  assert(modelIds.includes('gpt-4o-mini'), 'Has gpt-4o-mini');
  assert(modelIds.includes('gpt-5-mini'), 'Has gpt-5-mini');
  assert(modelIds.includes('claude-haiku-4-5'), 'Has claude-haiku-4-5');
  assert(modelIds.includes('meta-llama/Llama-4-Scout-17B-16E-Instruct'), 'Has Llama');
  assert(modelIds.includes('mistral-small-2603'), 'Has Mistral');
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
