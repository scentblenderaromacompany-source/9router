/**
 * Gemini Web Integration Test Suite
 * Verifies that native Google Gemini Web support is working correctly
 */

import { GeminiWebExecutor } from './open-sse/executors/gemini-web.js';

console.log('🧪 Gemini Web Integration Tests\n');

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
  const executor = new GeminiWebExecutor();
  assert(executor.providerId === 'gemini-web', 'Provider ID is gemini-web');
  assert(typeof executor.execute === 'function', 'Has execute method');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 2: Build URL
console.log('\nTest 2: Build URL');
try {
  const executor = new GeminiWebExecutor();
  const url = executor.buildUrl('gemini-3-pro', true, null);
  assert(url.includes('/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate'), 'StreamGenerate endpoint');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 3: URL builders
console.log('\nTest 3: URL Builders');
try {
  const executor = new GeminiWebExecutor();
  assert(executor.getBatchExecuteUrl().includes('/BardChatUi/data/batchexecute'), 'Batch execute URL');
  assert(executor.getInitUrl().includes('/app'), 'Init URL');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 4: Build headers with cookies
console.log('\nTest 4: Build Headers');
try {
  const executor = new GeminiWebExecutor();
  const headers = executor.buildWebHeaders({ apiKey: '__Secure-1PSID=abc123; __Secure-1PSIDTS=xyz789' });
  assert(headers['Content-Type'].includes('application/x-www-form-urlencoded'), 'Content-Type set');
  assert(headers['Origin'] === 'https://gemini.google.com', 'Origin set');
  assert(headers['X-Same-Domain'] === '1', 'X-Same-Domain set');
  assert(headers['Cookie'].includes('__Secure-1PSID=abc123'), 'Cookie set');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 5: Build headers without credentials
console.log('\nTest 5: Build Headers (No Credentials)');
try {
  const executor = new GeminiWebExecutor();
  const headers = executor.buildWebHeaders(null);
  assert(!headers['Cookie'], 'No cookie header');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 6: Parse cookies from string
console.log('\nTest 6: Parse Cookies');
try {
  const executor = new GeminiWebExecutor();
  const cookies1 = executor.parseCookies({ apiKey: '__Secure-1PSID=abc; __Secure-1PSIDTS=xyz' });
  assert(cookies1.includes('__Secure-1PSID=abc'), 'Cookies from string');
  
  const cookies2 = executor.parseCookies({ apiKey: '{"__Secure_1PSID":"abc","__Secure_1PSIDTS":"xyz"}' });
  assert(cookies2.includes('__Secure-1PSID=abc'), 'Cookies from JSON');
  
  const cookies3 = executor.parseCookies({ apiKey: 'simple-token' });
  assert(cookies3.includes('__Secure-1PSID=simple-token'), 'Simple token as cookie');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 7: Model info
console.log('\nTest 7: Model Info');
try {
  const executor = new GeminiWebExecutor();
  const models = ['gemini-3-pro', 'gemini-3-flash', 'gemini-2.5-pro', 'gemini-2.5-flash'];
  for (const model of models) {
    const info = executor.getModelInfo(model);
    assert(info.modelId !== null, `${model} has modelId`);
    assert(typeof info.capacityTail === 'number', `${model} has capacityTail`);
  }
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 8: Build payload
console.log('\nTest 8: Build Payload');
try {
  const executor = new GeminiWebExecutor();
  const messages = [
    { role: 'system', content: 'You are helpful.' },
    { role: 'user', content: 'Hello' }
  ];
  const payload = executor.buildWebPayload('gemini-3-pro', messages, true, { apiKey: 'test' });
  assert(Array.isArray(payload.innerArray), 'Inner array is array');
  assert(payload.innerArray.length === 92, 'Inner array has 92 elements');
  assert(payload.modelInfo.modelId !== null, 'Model info has modelId');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 9: Provider registry
console.log('\nTest 9: Provider Registry');
try {
  const registry = (await import('./open-sse/providers/registry/gemini-web.js')).default;
  assert(registry.id === 'gemini-web', 'Provider ID');
  assert(registry.category === 'webCookie', 'Category');
  assert(registry.authType === 'cookie', 'Auth type');
  assert(registry.models.length >= 8, 'Has all models');
  
  const modelIds = registry.models.map(m => m.id);
  assert(modelIds.includes('gemini-3-pro'), 'Has gemini-3-pro');
  assert(modelIds.includes('gemini-3-flash'), 'Has gemini-3-flash');
  assert(modelIds.includes('gemini-2.5-pro'), 'Has gemini-2.5-pro');
  assert(modelIds.includes('gemini-2.5-flash'), 'Has gemini-2.5-flash');
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
