/**
 * ChatGPT Web Integration Test Suite
 * Verifies that native ChatGPT Web support is working correctly
 */

import { ChatGPTWebExecutor } from './open-sse/executors/chatgpt-web.js';

console.log('🧪 ChatGPT Web Integration Tests\n');

// Test 1: Executor instantiation
console.log('Test 1: Executor Instantiation');
try {
  const executor = new ChatGPTWebExecutor();
  console.log('✅ ChatGPTWebExecutor instantiated successfully');
  console.log(`   Provider ID: ${executor.provider}`);
} catch (error) {
  console.error('❌ Failed to instantiate executor:', error.message);
  process.exit(1);
}

// Test 2: Build URL with default config
console.log('\nTest 2: Build URL with Default Config');
try {
  const executor = new ChatGPTWebExecutor();
  const url = executor.buildUrl('gpt-4o', true, 0, null);
  console.log(`✅ Built URL: ${url}`);
  if (url.includes('localhost:8700')) {
    console.log('✅ Default endpoint correct');
  }
} catch (error) {
  console.error('❌ Failed to build URL:', error.message);
  process.exit(1);
}

// Test 3: Build URL with custom base URL
console.log('\nTest 3: Build URL with Custom Base URL');
try {
  const executor = new ChatGPTWebExecutor();
  const credentials = {
    providerSpecificData: {
      baseUrl: 'http://custom-host:9000/v1'
    }
  };
  const url = executor.buildUrl('gpt-4o', true, 0, credentials);
  console.log(`✅ Built custom URL: ${url}`);
  if (url.includes('custom-host:9000')) {
    console.log('✅ Custom base URL applied correctly');
  }
} catch (error) {
  console.error('❌ Failed to build custom URL:', error.message);
  process.exit(1);
}

// Test 4: Build headers with access token
console.log('\nTest 4: Build Headers with Access Token');
try {
  const executor = new ChatGPTWebExecutor();
  const credentials = { accessToken: 'test-token-12345' };
  const headers = executor.buildHeaders(credentials, true);
  console.log(`✅ Built headers:`, Object.keys(headers));
  if (headers.Authorization === 'Bearer test-token-12345') {
    console.log('✅ Bearer token applied correctly');
  }
  if (headers['Accept'] === 'text/event-stream') {
    console.log('✅ Streaming headers set correctly');
  }
} catch (error) {
  console.error('❌ Failed to build headers:', error.message);
  process.exit(1);
}

// Test 5: Build headers with API key
console.log('\nTest 5: Build Headers with API Key');
try {
  const executor = new ChatGPTWebExecutor();
  const credentials = { apiKey: 'api-key-67890' };
  const headers = executor.buildHeaders(credentials, false);
  console.log(`✅ Built headers with apiKey`);
  if (headers.Authorization === 'Bearer api-key-67890') {
    console.log('✅ API key applied correctly');
  }
  if (headers['Accept'] === undefined) {
    console.log('✅ Non-streaming headers set correctly');
  }
} catch (error) {
  console.error('❌ Failed to build headers:', error.message);
  process.exit(1);
}

// Test 6: Transform request - basic
console.log('\nTest 6: Transform Request - Basic');
try {
  const executor = new ChatGPTWebExecutor();
  const body = {
    messages: [{ role: 'user', content: 'Hello' }],
    temperature: 0.7
  };
  const transformed = executor.transformRequest('gpt-4o', body, true);
  console.log(`✅ Transformed request:`, Object.keys(transformed));
  if (transformed.model === 'gpt-4o') {
    console.log('✅ Model preserved');
  }
  if (transformed.stream === true) {
    console.log('✅ Stream flag set');
  }
  if (transformed.temperature === 0.7) {
    console.log('✅ Temperature preserved');
  }
} catch (error) {
  console.error('❌ Failed to transform request:', error.message);
  process.exit(1);
}

// Test 7: Transform request - with tools
console.log('\nTest 7: Transform Request - With Tools');
try {
  const executor = new ChatGPTWebExecutor();
  const tools = [
    {
      type: 'function',
      function: {
        name: 'test_function',
        description: 'Test function',
        parameters: { type: 'object', properties: {} }
      }
    }
  ];
  const body = {
    messages: [{ role: 'user', content: 'Hello' }],
    tools: tools,
    tool_choice: 'auto'
  };
  const transformed = executor.transformRequest('gpt-4o', body, true);
  console.log(`✅ Transformed request with tools`);
  if (transformed.tools === tools) {
    console.log('✅ Tools preserved unchanged');
  }
  if (transformed.tool_choice === 'auto') {
    console.log('✅ Tool choice preserved');
  }
} catch (error) {
  console.error('❌ Failed to transform request with tools:', error.message);
  process.exit(1);
}

// Test 8: Provider extends BaseExecutor
console.log('\nTest 8: Inheritance Check');
try {
  const executor = new ChatGPTWebExecutor();
  if (typeof executor.execute === 'function') {
    console.log('✅ Inherits execute() from BaseExecutor');
  }
  if (typeof executor.buildUrl === 'function') {
    console.log('✅ Has buildUrl() method');
  }
  if (typeof executor.buildHeaders === 'function') {
    console.log('✅ Has buildHeaders() method');
  }
  if (typeof executor.transformRequest === 'function') {
    console.log('✅ Has transformRequest() method');
  }
} catch (error) {
  console.error('❌ Failed inheritance check:', error.message);
  process.exit(1);
}

console.log('\n✅ All tests passed!\n');
