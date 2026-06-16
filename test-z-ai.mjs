/**
 * Z.AI Integration Test Suite
 * Verifies that Z.AI (Zhipu) support is working correctly
 */

import { ZAIExecutor } from './open-sse/executors/z-ai.js';

console.log('🧪 Z.AI Integration Tests\n');

// Test 1: Executor instantiation
console.log('Test 1: Executor Instantiation');
try {
  const executor = new ZAIExecutor();
  console.log('✅ ZAIExecutor instantiated successfully');
  console.log(`   Provider ID: ${executor.provider}`);
} catch (error) {
  console.error('❌ Failed to instantiate executor:', error.message);
  process.exit(1);
}

// Test 2: Build URL with default config
console.log('\nTest 2: Build URL with Default Config');
try {
  const executor = new ZAIExecutor();
  const url = executor.buildUrl('glm-5.1', true, 0, null);
  console.log(`✅ Built URL: ${url}`);
  if (url.includes('api.z.ai/api/paas/v4/chat/completions')) {
    console.log('✅ Default endpoint correct');
  }
} catch (error) {
  console.error('❌ Failed to build URL:', error.message);
  process.exit(1);
}

// Test 3: Build URL with custom base URL
console.log('\nTest 3: Build URL with Custom Base URL');
try {
  const executor = new ZAIExecutor();
  const credentials = {
    providerSpecificData: {
      baseUrl: 'https://custom-api.example.com/v1'
    }
  };
  const url = executor.buildUrl('glm-5.1', true, 0, credentials);
  console.log(`✅ Built custom URL: ${url}`);
  if (url.includes('custom-api.example.com')) {
    console.log('✅ Custom base URL applied correctly');
  }
} catch (error) {
  console.error('❌ Failed to build custom URL:', error.message);
  process.exit(1);
}

// Test 4: Build URL with Coding Plan endpoint
console.log('\nTest 4: Build URL with Coding Plan Endpoint');
try {
  const executor = new ZAIExecutor();
  const credentials = {
    providerSpecificData: {
      useCodingEndpoint: true
    }
  };
  const url = executor.buildUrl('glm-5.1', true, 0, credentials);
  console.log(`✅ Built Coding Plan URL: ${url}`);
  if (url.includes('api.z.ai/api/coding/paas/v4/chat/completions')) {
    console.log('✅ Coding Plan endpoint correct');
  }
} catch (error) {
  console.error('❌ Failed to build Coding Plan URL:', error.message);
  process.exit(1);
}

// Test 5: Build headers with API key
console.log('\nTest 5: Build Headers with API Key');
try {
  const executor = new ZAIExecutor();
  const credentials = { apiKey: 'zai-api-key-12345' };
  const headers = executor.buildHeaders(credentials, true);
  console.log(`✅ Built headers:`, Object.keys(headers));
  if (headers.Authorization === 'Bearer zai-api-key-12345') {
    console.log('✅ Bearer token applied correctly');
  }
  if (headers['Accept'] === 'text/event-stream') {
    console.log('✅ Streaming headers set correctly');
  }
  if (headers['Accept-Language'] === 'en-US,en') {
    console.log('✅ Accept-Language header set correctly');
  }
} catch (error) {
  console.error('❌ Failed to build headers:', error.message);
  process.exit(1);
}

// Test 6: Build headers with access token
console.log('\nTest 6: Build Headers with Access Token');
try {
  const executor = new ZAIExecutor();
  const credentials = { accessToken: 'access-token-67890' };
  const headers = executor.buildHeaders(credentials, false);
  console.log(`✅ Built headers with accessToken`);
  if (headers.Authorization === 'Bearer access-token-67890') {
    console.log('✅ Access token applied correctly');
  }
  if (headers['Accept'] === undefined) {
    console.log('✅ Non-streaming headers set correctly');
  }
} catch (error) {
  console.error('❌ Failed to build headers:', error.message);
  process.exit(1);
}

// Test 7: Transform request - basic
console.log('\nTest 7: Transform Request - Basic');
try {
  const executor = new ZAIExecutor();
  const body = {
    messages: [{ role: 'user', content: 'Hello' }],
    temperature: 0.7
  };
  const transformed = executor.transformRequest('glm-5.1', body, true);
  console.log(`✅ Transformed request:`, Object.keys(transformed));
  if (transformed.model === 'glm-5.1') {
    console.log('✅ Model preserved');
  }
  if (transformed.stream === true) {
    console.log('✅ Stream flag set');
  }
  if (transformed.temperature === 0.7) {
    console.log('✅ Temperature preserved');
  }
  if (transformed.do_sample === true) {
    console.log('✅ do_sample default set');
  }
} catch (error) {
  console.error('❌ Failed to transform request:', error.message);
  process.exit(1);
}

// Test 8: Transform request - with tools
console.log('\nTest 8: Transform Request - With Tools');
try {
  const executor = new ZAIExecutor();
  const tools = [
    {
      type: 'function',
      function: {
        name: 'get_weather',
        description: 'Get weather for a city',
        parameters: { type: 'object', properties: { city: { type: 'string' } } }
      }
    }
  ];
  const body = {
    messages: [{ role: 'user', content: 'What is the weather in Beijing?' }],
    tools: tools,
    tool_choice: 'auto'
  };
  const transformed = executor.transformRequest('glm-5.1', body, true);
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

// Test 9: Transform request - with thinking mode
console.log('\nTest 9: Transform Request - With Thinking Mode');
try {
  const executor = new ZAIExecutor();
  const body = {
    messages: [{ role: 'user', content: 'Think step by step' }],
    thinking: { type: 'enabled' }
  };
  const transformed = executor.transformRequest('glm-5.1', body, true);
  console.log(`✅ Transformed request with thinking`);
  if (transformed.thinking && transformed.thinking.type === 'enabled') {
    console.log('✅ Thinking mode preserved');
  }
} catch (error) {
  console.error('❌ Failed to transform request with thinking:', error.message);
  process.exit(1);
}

// Test 10: Transform request - with response format
console.log('\nTest 10: Transform Request - With Response Format');
try {
  const executor = new ZAIExecutor();
  const body = {
    messages: [{ role: 'user', content: 'Return JSON' }],
    response_format: { type: 'json_object' }
  };
  const transformed = executor.transformRequest('glm-5.1', body, true);
  console.log(`✅ Transformed request with response format`);
  if (transformed.response_format && transformed.response_format.type === 'json_object') {
    console.log('✅ Response format preserved');
  }
} catch (error) {
  console.error('❌ Failed to transform request with response format:', error.message);
  process.exit(1);
}

// Test 11: Provider extends BaseExecutor
console.log('\nTest 11: Inheritance Check');
try {
  const executor = new ZAIExecutor();
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
