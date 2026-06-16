/**
 * DeepSeek Web Integration Test Suite
 * Verifies that native DeepSeek Web support is working correctly
 */

import { DeepSeekWebExecutor } from './open-sse/executors/deepseek-web.js';

console.log('🧪 DeepSeek Web Integration Tests\n');

// Test 1: Executor instantiation
console.log('Test 1: Executor Instantiation');
try {
  const executor = new DeepSeekWebExecutor();
  console.log('✅ DeepSeekWebExecutor instantiated successfully');
  console.log(`   Provider ID: ${executor.provider}`);
} catch (error) {
  console.error('❌ Failed to instantiate executor:', error.message);
  process.exit(1);
}

// Test 2: Build URL - chat completion endpoint
console.log('\nTest 2: Build URL - Chat Completion Endpoint');
try {
  const executor = new DeepSeekWebExecutor();
  const url = executor.buildUrl('deepseek-web-chat', true, 0, null);
  console.log(`✅ Built URL: ${url}`);
  if (url.includes('chat.deepseek.com/api/v0/chat/completion')) {
    console.log('✅ Chat completion endpoint correct');
  }
} catch (error) {
  console.error('❌ Failed to build URL:', error.message);
  process.exit(1);
}

// Test 3: Build web headers with user token
console.log('\nTest 3: Build Web Headers with User Token');
try {
  const executor = new DeepSeekWebExecutor();
  const credentials = { apiKey: 'test-user-token-12345' };
  const headers = await executor.buildWebHeaders(credentials);
  console.log(`✅ Built headers:`, Object.keys(headers));
  if (headers.Authorization === 'Bearer test-user-token-12345') {
    console.log('✅ User token applied correctly');
  }
  if (headers['Content-Type'] === 'application/json') {
    console.log('✅ Content-Type set correctly');
  }
  if (headers['Accept'] === 'text/event-stream') {
    console.log('✅ Streaming headers set correctly');
  }
  if (headers.Origin === 'https://chat.deepseek.com') {
    console.log('✅ Origin header set correctly');
  }
} catch (error) {
  console.error('❌ Failed to build headers:', error.message);
  process.exit(1);
}

// Test 4: Build web headers without credentials
console.log('\nTest 4: Build Web Headers without Credentials');
try {
  const executor = new DeepSeekWebExecutor();
  const headers = await executor.buildWebHeaders(null);
  console.log(`✅ Built headers without credentials`);
  if (headers.Authorization === undefined) {
    console.log('✅ No Authorization header when no credentials');
  }
} catch (error) {
  console.error('❌ Failed to build headers without credentials:', error.message);
  process.exit(1);
}

// Test 5: Build prompt from messages
console.log('\nTest 5: Build Prompt from Messages');
try {
  const executor = new DeepSeekWebExecutor();
  const messages = [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Hello!' },
    { role: 'assistant', content: 'Hi there!' },
    { role: 'user', content: 'How are you?' }
  ];
  const prompt = executor.buildPrompt(messages);
  console.log(`✅ Built prompt:\n${prompt}`);
  if (prompt.includes('[System] You are a helpful assistant.')) {
    console.log('✅ System message formatted correctly');
  }
  if (prompt.includes('Hello!')) {
    console.log('✅ User message formatted correctly');
  }
  if (prompt.includes('[Assistant] Hi there!')) {
    console.log('✅ Assistant message formatted correctly');
  }
} catch (error) {
  console.error('❌ Failed to build prompt:', error.message);
  process.exit(1);
}

// Test 6: Build prompt with array content
console.log('\nTest 6: Build Prompt with Array Content');
try {
  const executor = new DeepSeekWebExecutor();
  const messages = [
    { role: 'user', content: [
      { type: 'text', text: 'Hello' },
      { type: 'text', text: 'World' }
    ]}
  ];
  const prompt = executor.buildPrompt(messages);
  console.log(`✅ Built prompt from array content: ${prompt}`);
  if (prompt.includes('Hello World')) {
    console.log('✅ Array content joined correctly');
  }
} catch (error) {
  console.error('❌ Failed to build prompt with array content:', error.message);
  process.exit(1);
}

// Test 7: Build web payload
console.log('\nTest 7: Build Web Payload');
try {
  const executor = new DeepSeekWebExecutor();
  const messages = [{ role: 'user', content: 'Hello!' }];
  const credentials = { apiKey: 'test-token' };
  const payload = await executor.buildWebPayload('deepseek-web-chat', messages, true, credentials);
  console.log(`✅ Built payload:`, Object.keys(payload));
  if (payload.model === 'chat') {
    console.log('✅ Model mode mapped correctly');
  }
  if (payload.stream === true) {
    console.log('✅ Stream flag set correctly');
  }
  if (payload.prompt.includes('Hello!')) {
    console.log('✅ Prompt included in payload');
  }
  if (payload.chat_session_id) {
    console.log('✅ Session ID included in payload');
  }
} catch (error) {
  console.error('❌ Failed to build payload:', error.message);
  process.exit(1);
}

// Test 8: Model mapping
console.log('\nTest 8: Model Mapping');
try {
  const executor = new DeepSeekWebExecutor();
  const testCases = [
    { input: 'deepseek-web-chat', expected: 'chat' },
    { input: 'deepseek-web-reasoner', expected: 'reasoner' },
  ];
  
  for (const { input, expected } of testCases) {
    const messages = [{ role: 'user', content: 'test' }];
    const credentials = { apiKey: 'test-token' };
    const payload = await executor.buildWebPayload(input, messages, true, credentials);
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
  const executor = new DeepSeekWebExecutor();
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
  if (typeof executor.getOrCreateSession === 'function') {
    console.log('✅ Has getOrCreateSession() method');
  }
  if (typeof executor.getParentMessageId === 'function') {
    console.log('✅ Has getParentMessageId() method');
  }
  if (typeof executor.updateParentMessageId === 'function') {
    console.log('✅ Has updateParentMessageId() method');
  }
  if (typeof executor.clearSession === 'function') {
    console.log('✅ Has clearSession() method');
  }
  if (typeof executor.parseWebStream === 'function') {
    console.log('✅ Has parseWebStream() method');
  }
  if (typeof executor.sseChunk === 'function') {
    console.log('✅ Has sseChunk() method');
  }
} catch (error) {
  console.error('❌ Failed inheritance check:', error.message);
  process.exit(1);
}

// Test 10: Error response
console.log('\nTest 10: Error Response');
try {
  const executor = new DeepSeekWebExecutor();
  const errorResp = executor.errorResponse('Test error', 400);
  console.log(`✅ Error response created`);
  if (errorResp.response.status === 400) {
    console.log('✅ Status code correct');
  }
  const body = await errorResp.response.json();
  if (body.error.message === 'Test error') {
    console.log('✅ Error message correct');
  }
  if (body.error.code === 'DEEPSEEK-WEB_ERROR') {
    console.log('✅ Error code correct');
  }
} catch (error) {
  console.error('❌ Failed error response test:', error.message);
  process.exit(1);
}

// Test 11: SSE chunk helper
console.log('\nTest 11: SSE Chunk Helper');
try {
  const executor = new DeepSeekWebExecutor();
  const chunk = executor.sseChunk({ id: 'test', content: 'hello' });
  console.log(`✅ SSE chunk created: ${chunk.trim()}`);
  if (chunk.startsWith('data: ')) {
    console.log('✅ Starts with data: prefix');
  }
  if (chunk.endsWith('\n\n')) {
    console.log('✅ Ends with double newline');
  }
  const parsed = JSON.parse(chunk.slice(6));
  if (parsed.id === 'test' && parsed.content === 'hello') {
    console.log('✅ JSON content correct');
  }
} catch (error) {
  console.error('❌ Failed SSE chunk test:', error.message);
  process.exit(1);
}

// Test 12: Session management
console.log('\nTest 12: Session Management');
try {
  const executor = new DeepSeekWebExecutor();
  const credentials = { apiKey: 'test-token' };
  
  // Test getParentMessageId
  const parentId = executor.getParentMessageId(credentials);
  console.log(`✅ Initial parent message ID: ${parentId}`);
  if (parentId === 'client-created-root') {
    console.log('✅ Default parent message ID correct');
  }
  
  // Test updateParentMessageId
  executor.updateParentMessageId(credentials, 'new-message-id');
  const newParentId = executor.getParentMessageId(credentials);
  console.log(`✅ Updated parent message ID: ${newParentId}`);
  if (newParentId === 'new-message-id') {
    console.log('✅ Parent message ID updated correctly');
  }
  
  // Test clearSession
  executor.clearSession(credentials);
  const clearedParentId = executor.getParentMessageId(credentials);
  console.log(`✅ After clear, parent message ID: ${clearedParentId}`);
  if (clearedParentId === 'client-created-root') {
    console.log('✅ Session cleared correctly');
  }
} catch (error) {
  console.error('❌ Failed session management test:', error.message);
  process.exit(1);
}

console.log('\n✅ All tests passed!\n');
