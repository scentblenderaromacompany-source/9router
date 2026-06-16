#!/usr/bin/env node
/**
 * Z.AI Live API Test Suite
 * Tests actual API calls to Z.AI endpoints
 * 
 * Usage:
 *   ZAI_API_KEY=your-key node test-z-ai-live.mjs
 *   node test-z-ai-live.mjs --key your-key
 *   node test-z-ai-live.mjs --all  # Run all tests
 */

import { ZAIExecutor } from './open-sse/executors/z-ai.js';

// Get API key from args or environment
const args = process.argv.slice(2);
const keyIndex = args.indexOf('--key');
const API_KEY = keyIndex >= 0 ? args[keyIndex + 1] : process.env.ZAI_API_KEY;
const RUN_ALL = args.includes('--all');

if (!API_KEY) {
  console.log('❌ No API key provided');
  console.log('Usage: ZAI_API_KEY=your-key node test-z-ai-live.mjs');
  console.log('   or: node test-z-ai-live.mjs --key your-key');
  process.exit(1);
}

console.log('🧪 Z.AI Live API Tests\n');
console.log(`API Key: ${API_KEY.substring(0, 8)}...${API_KEY.substring(API_KEY.length - 4)}\n`);

const executor = new ZAIExecutor();
const credentials = { apiKey: API_KEY };

// Helper function to make API calls
async function makeRequest(url, headers, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
  
  const responseText = await response.text();
  
  return {
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries()),
    body: responseText,
    json: (() => { try { return JSON.parse(responseText); } catch { return null; } })()
  };
}

// Test 1: Chat Completion (GLM-4.7)
async function testChatCompletion() {
  console.log('Test 1: Chat Completion (GLM-4.7)');
  try {
    const url = executor.buildUrl('glm-4.7', false, 0, credentials);
    const headers = executor.buildHeaders(credentials, false);
    const body = executor.transformRequest('glm-4.7', {
      messages: [
        { role: 'user', content: 'Say "Hello from Z.AI" and nothing else.' }
      ],
      temperature: 0.7,
      max_tokens: 50
    }, false, credentials);
    
    console.log(`  URL: ${url}`);
    const result = await makeRequest(url, headers, body);
    
    if (result.status === 200 && result.json) {
      console.log('  ✅ Success');
      console.log(`  Response: ${result.json.choices?.[0]?.message?.content || 'No content'}`);
      console.log(`  Model: ${result.json.model}`);
      console.log(`  Usage: ${JSON.stringify(result.json.usage)}`);
      return true;
    } else {
      console.log(`  ❌ Failed: ${result.status} ${result.statusText}`);
      console.log(`  Body: ${result.body.substring(0, 200)}`);
      return false;
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return false;
  }
}

// Test 2: Streaming Chat Completion
async function testStreamingChat() {
  console.log('\nTest 2: Streaming Chat Completion (GLM-4.7-Flash)');
  try {
    const url = executor.buildUrl('glm-4.7-flash', true, 0, credentials);
    const headers = executor.buildHeaders(credentials, true);
    const body = executor.transformRequest('glm-4.7-flash', {
      messages: [
        { role: 'user', content: 'Count from 1 to 5.' }
      ],
      temperature: 0.7,
      max_tokens: 100
    }, true, credentials);
    
    console.log(`  URL: ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    
    if (response.status === 200) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      let chunkCount = 0;
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
        
        for (const line of lines) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullResponse += content;
              chunkCount++;
            }
          } catch {}
        }
      }
      
      console.log('  ✅ Streaming Success');
      console.log(`  Chunks received: ${chunkCount}`);
      console.log(`  Response: ${fullResponse.substring(0, 100)}...`);
      return true;
    } else {
      console.log(`  ❌ Failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return false;
  }
}

// Test 3: Vision Model (GLM-5V-Turbo)
async function testVisionModel() {
  console.log('\nTest 3: Vision Model (GLM-5V-Turbo)');
  try {
    const url = executor.buildUrl('glm-5v-turbo', false, 0, credentials);
    const headers = executor.buildHeaders(credentials, false);
    const body = executor.transformRequest('glm-5v-turbo', {
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: 'https://cdn.bigmodel.cn/static/logo/register.png' }
            },
            {
              type: 'text',
              text: 'Describe this image in one sentence.'
            }
          ]
        }
      ],
      max_tokens: 100
    }, false, credentials);
    
    console.log(`  URL: ${url}`);
    const result = await makeRequest(url, headers, body);
    
    if (result.status === 200 && result.json) {
      console.log('  ✅ Vision Success');
      console.log(`  Response: ${result.json.choices?.[0]?.message?.content || 'No content'}`);
      return true;
    } else {
      console.log(`  ❌ Failed: ${result.status}`);
      console.log(`  Body: ${result.body.substring(0, 200)}`);
      return false;
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return false;
  }
}

// Test 4: Tool/Function Calling
async function testToolCalling() {
  console.log('\nTest 4: Tool/Function Calling (GLM-5.1)');
  try {
    const url = executor.buildUrl('glm-5.1', false, 0, credentials);
    const headers = executor.buildHeaders(credentials, false);
    const body = executor.transformRequest('glm-5.1', {
      messages: [
        { role: 'user', content: 'What is the weather in Tokyo?' }
      ],
      tools: [
        {
          type: 'function',
          function: {
            name: 'get_weather',
            description: 'Get weather for a city',
            parameters: {
              type: 'object',
              properties: {
                city: { type: 'string', description: 'City name' }
              },
              required: ['city']
            }
          }
        }
      ],
      tool_choice: 'auto',
      temperature: 0.3
    }, false, credentials);
    
    console.log(`  URL: ${url}`);
    const result = await makeRequest(url, headers, body);
    
    if (result.status === 200 && result.json) {
      const choice = result.json.choices?.[0];
      if (choice?.message?.tool_calls) {
        console.log('  ✅ Tool Calling Success');
        console.log(`  Tool calls: ${choice.message.tool_calls.length}`);
        choice.message.tool_calls.forEach((tc, i) => {
          console.log(`  [${i}] ${tc.function.name}(${tc.function.arguments})`);
        });
        return true;
      } else if (choice?.message?.content) {
        console.log('  ✅ Got text response (model may not have called tool)');
        console.log(`  Response: ${choice.message.content.substring(0, 100)}`);
        return true;
      }
    }
    console.log(`  ❌ Failed: ${result.status}`);
    console.log(`  Body: ${result.body.substring(0, 200)}`);
    return false;
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return false;
  }
}

// Test 5: Thinking Mode
async function testThinkingMode() {
  console.log('\nTest 5: Thinking Mode (GLM-5.1)');
  try {
    const url = executor.buildUrl('glm-5.1', true, 0, credentials);
    const headers = executor.buildHeaders(credentials, true);
    const body = executor.transformRequest('glm-5.1', {
      messages: [
        { role: 'user', content: 'What is 2+2? Think step by step.' }
      ],
      thinking: { type: 'enabled' },
      max_tokens: 200
    }, true, credentials);
    
    console.log(`  URL: ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    
    if (response.status === 200) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      let reasoningContent = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
        
        for (const line of lines) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta;
            if (delta?.content) fullResponse += delta.content;
            if (delta?.reasoning_content) reasoningContent += delta.reasoning_content;
          } catch {}
        }
      }
      
      console.log('  ✅ Thinking Mode Success');
      if (reasoningContent) {
        console.log(`  Reasoning: ${reasoningContent.substring(0, 100)}...`);
      }
      console.log(`  Response: ${fullResponse.substring(0, 100)}...`);
      return true;
    } else {
      console.log(`  ❌ Failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return false;
  }
}

// Test 6: Image Generation
async function testImageGeneration() {
  console.log('\nTest 6: Image Generation (GLM-Image)');
  try {
    const url = executor.buildUrl('glm-image', false, 0, credentials);
    const headers = executor.buildHeaders(credentials, false);
    const body = executor.transformRequest('glm-image', {
      prompt: 'A cute orange cat sitting on a windowsill',
      size: '1024x1024'
    }, false, credentials);
    
    console.log(`  URL: ${url}`);
    const result = await makeRequest(url, headers, body);
    
    if (result.status === 200 && result.json) {
      console.log('  ✅ Image Generation Success');
      if (result.json.data?.[0]?.url) {
        console.log(`  Image URL: ${result.json.data[0].url.substring(0, 80)}...`);
      }
      return true;
    } else {
      console.log(`  ❌ Failed: ${result.status}`);
      console.log(`  Body: ${result.body.substring(0, 300)}`);
      return false;
    }
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return false;
  }
}

// Run tests
async function runTests() {
  const tests = [
    testChatCompletion,
    testStreamingChat,
    testVisionModel,
    testToolCalling,
    testThinkingMode,
    testImageGeneration,
  ];
  
  const results = [];
  
  for (const test of tests) {
    const result = await test();
    results.push(result);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Results Summary');
  console.log('='.repeat(50));
  console.log(`Passed: ${results.filter(r => r).length}/${results.length}`);
  
  if (results.every(r => r)) {
    console.log('\n✅ All tests passed!');
  } else {
    console.log('\n❌ Some tests failed');
    process.exit(1);
  }
}

runTests();
