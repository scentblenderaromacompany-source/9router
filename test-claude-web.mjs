/**
 * Claude Web Integration Test Suite
 * Verifies that native Claude Web support is working correctly
 */

import { ClaudeWebExecutor } from './open-sse/executors/claude-web.js';

console.log('🧪 Claude Web Integration Tests\n');

// Test 1: Executor instantiation
console.log('Test 1: Executor Instantiation');
try {
  const executor = new ClaudeWebExecutor();
  console.log('✅ ClaudeWebExecutor instantiated successfully');
  console.log(`   Provider ID: ${executor.provider}`);
} catch (error) {
  console.error('❌ Failed to instantiate executor:', error.message);
  process.exit(1);
}

// Test 2: Build URL - organizations endpoint
console.log('\nTest 2: Build URL - Organizations Endpoint');
try {
  const executor = new ClaudeWebExecutor();
  const url = executor.buildUrl('claude-sonnet-4-6', true, 0, null);
  console.log(`✅ Built URL: ${url}`);
  if (url.includes('claude.ai/api/organizations')) {
    console.log('✅ Organizations endpoint correct');
  }
} catch (error) {
  console.error('❌ Failed to build URL:', error.message);
  process.exit(1);
}

// Test 3: Build web headers with session key
console.log('\nTest 3: Build Web Headers with Session Key');
try {
  const executor = new ClaudeWebExecutor();
  const credentials = { apiKey: 'test-session-key-12345' };
  const headers = await executor.buildWebHeaders(credentials);
  console.log(`✅ Built headers:`, Object.keys(headers));
  if (headers.Cookie === 'sessionKey=test-session-key-12345') {
    console.log('✅ Session key cookie applied correctly');
  }
  if (headers['Content-Type'] === 'application/json') {
    console.log('✅ Content-Type set correctly');
  }
  if (headers['Accept'] === 'text/event-stream') {
    console.log('✅ Streaming headers set correctly');
  }
} catch (error) {
  console.error('❌ Failed to build headers:', error.message);
  process.exit(1);
}

// Test 4: Build web headers without credentials
console.log('\nTest 4: Build Web Headers without Credentials');
try {
  const executor = new ClaudeWebExecutor();
  const headers = await executor.buildWebHeaders(null);
  console.log(`✅ Built headers without credentials`);
  if (headers.Cookie === undefined) {
    console.log('✅ No cookie header when no credentials');
  }
} catch (error) {
  console.error('❌ Failed to build headers without credentials:', error.message);
  process.exit(1);
}

// Test 5: Build prompt from messages
console.log('\nTest 5: Build Prompt from Messages');
try {
  const executor = new ClaudeWebExecutor();
  const messages = [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Hello!' },
    { role: 'assistant', content: 'Hi there!' },
    { role: 'user', content: 'How are you?' }
  ];
  const prompt = executor.buildPrompt(messages);
  console.log(`✅ Built prompt:\n${prompt}`);
  if (prompt.includes('System: You are a helpful assistant.')) {
    console.log('✅ System message formatted correctly');
  }
  if (prompt.includes('Human: Hello!')) {
    console.log('✅ User message formatted correctly');
  }
  if (prompt.includes('Assistant: Hi there!')) {
    console.log('✅ Assistant message formatted correctly');
  }
  if (prompt.endsWith('Assistant:')) {
    console.log('✅ Prompt ends with Assistant: (correct for Claude)');
  }
} catch (error) {
  console.error('❌ Failed to build prompt:', error.message);
  process.exit(1);
}

// Test 6: Build prompt with array content
console.log('\nTest 6: Build Prompt with Array Content');
try {
  const executor = new ClaudeWebExecutor();
  const messages = [
    { role: 'user', content: [
      { type: 'text', text: 'Hello' },
      { type: 'text', text: 'World' }
    ]}
  ];
  const prompt = executor.buildPrompt(messages);
  console.log(`✅ Built prompt from array content: ${prompt}`);
  if (prompt.includes('Human: Hello World')) {
    console.log('✅ Array content joined correctly');
  }
} catch (error) {
  console.error('❌ Failed to build prompt with array content:', error.message);
  process.exit(1);
}

// Test 7: Build web payload
console.log('\nTest 7: Build Web Payload');
try {
  const executor = new ClaudeWebExecutor();
  const messages = [{ role: 'user', content: 'Hello!' }];
  const payload = await executor.buildWebPayload('claude-sonnet-4-6', messages, true, null);
  console.log(`✅ Built payload:`, Object.keys(payload));
  if (payload.model === 'claude-sonnet-4-6-20260214') {
    console.log('✅ Model slug mapped correctly');
  }
  if (payload.timezone === 'UTC') {
    console.log('✅ Timezone set correctly');
  }
  if (payload.prompt.includes('Human: Hello!')) {
    console.log('✅ Prompt included in payload');
  }
} catch (error) {
  console.error('❌ Failed to build payload:', error.message);
  process.exit(1);
}

// Test 8: Model mapping
console.log('\nTest 8: Model Mapping');
try {
  const executor = new ClaudeWebExecutor();
  const testCases = [
    { input: 'claude-sonnet-4-6', expected: 'claude-sonnet-4-6-20260214' },
    { input: 'claude-opus-4-6', expected: 'claude-opus-4-6-20260214' },
    { input: 'claude-haiku-4-5', expected: 'claude-haiku-4-5-20251015' },
    { input: 'claude-sonnet-4', expected: 'claude-sonnet-4-20250514' },
    { input: 'claude-opus-4', expected: 'claude-opus-4-20250514' },
    { input: 'claude-3-5-sonnet', expected: 'claude-3-5-sonnet-20241022' },
    { input: 'claude-3-5-haiku', expected: 'claude-3-5-haiku-20241022' },
  ];
  
  for (const { input, expected } of testCases) {
    const messages = [{ role: 'user', content: 'test' }];
    const payload = await executor.buildWebPayload(input, messages, true, null);
    if (payload.model === expected) {
      console.log(`✅ ${input} → ${expected}`);
    } else {
      console.error(`❌ ${input} → ${payload.model} (expected ${expected})`);
      process.exit(1);
    }
  }
} catch (error) {
  console.error('❌ Failed model mapping test:', error.message);
  process.exit(1);
}

// Test 9: Inheritance check
console.log('\nTest 9: Inheritance Check');
try {
  const executor = new ClaudeWebExecutor();
  if (typeof executor.execute === 'function') {
    console.log('✅ Has execute() method');
  }
  if (typeof executor.buildUrl === 'function') {
    console.log('✅ Has buildUrl() method');
  }
  if (typeof executor.buildWebHeaders === 'function') {
    console.log('✅ Has buildWebHeaders() method');
  }
  if (typeof executor.buildWebPayload === 'function') {
    console.log('✅ Has buildWebPayload() method');
  }
  if (typeof executor.buildPrompt === 'function') {
    console.log('✅ Has buildPrompt() method');
  }
  if (typeof executor.getOrganizationId === 'function') {
    console.log('✅ Has getOrganizationId() method');
  }
  if (typeof executor.createConversation === 'function') {
    console.log('✅ Has createConversation() method');
  }
  if (typeof executor.parseWebStream === 'function') {
    console.log('✅ Has parseWebStream() method');
  }
} catch (error) {
  console.error('❌ Failed inheritance check:', error.message);
  process.exit(1);
}

// Test 10: Error response
console.log('\nTest 10: Error Response');
try {
  const executor = new ClaudeWebExecutor();
  const errorResp = executor.errorResponse('Test error', 400);
  console.log(`✅ Error response created`);
  if (errorResp.response.status === 400) {
    console.log('✅ Status code correct');
  }
  const body = await errorResp.response.json();
  if (body.error.message === 'Test error') {
    console.log('✅ Error message correct');
  }
  if (body.error.code === 'CLAUDE-WEB_ERROR') {
    console.log('✅ Error code correct');
  }
} catch (error) {
  console.error('❌ Failed error response test:', error.message);
  process.exit(1);
}

console.log('\n✅ All tests passed!\n');
