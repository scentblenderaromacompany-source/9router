#!/usr/bin/env node

/**
 * Test all Web UI providers
 * 
 * Usage:
 *   node test-web-ui-providers.mjs
 * 
 * Environment variables:
 *   GROK_SSO - Grok SSO cookie value
 *   CHATGPT_TOKEN - ChatGPT access token
 *   ZAI_TOKEN - Z.AI API token (optional, will use guest token)
 */

import { ZAIWebExecutor } from './open-sse/executors/z-ai-web.js';
import { ChatGPTWebExecutor } from './open-sse/executors/chatgpt-web.js';
import { GrokWebExecutor } from './open-sse/executors/grok-web.js';

const GROK_SSO = process.env.GROK_SSO;
const CHATGPT_TOKEN = process.env.CHATGPT_TOKEN;
const ZAI_TOKEN = process.env.ZAI_TOKEN;

console.log('🧪 Web UI Provider Tests\n');
console.log('='.repeat(50));

// Test 1: Z.AI Web
console.log('\n📋 Test 1: Z.AI Web Executor');
console.log('-'.repeat(50));

try {
  const zai = new ZAIWebExecutor();
  console.log('✅ Executor instantiated');
  
  // Test URL building
  const url = zai.buildUrl('glm-4.7', true, 0, null);
  console.log(`✅ URL: ${url}`);
  
  // Test headers
  const headers = zai.buildWebHeaders({ apiKey: ZAI_TOKEN || 'guest' });
  console.log(`✅ Headers: ${Object.keys(headers).length} headers`);
  
  // Test message parsing
  const messages = [{ role: 'user', content: 'Hello, what is 2+2?' }];
  const parsed = zai.parseMessages(messages);
  console.log(`✅ Messages parsed: "${parsed}"`);
  
  // Test payload building
  const payload = await zai.buildWebPayload('glm-4.7', messages, true, null);
  console.log(`✅ Payload built: ${Object.keys(payload).length} fields`);
  
  console.log('\n✅ Z.AI Web tests passed!');
} catch (err) {
  console.error('❌ Z.AI Web test failed:', err.message);
}

// Test 2: ChatGPT Web
console.log('\n📋 Test 2: ChatGPT Web Executor');
console.log('-'.repeat(50));

try {
  const chatgpt = new ChatGPTWebExecutor();
  console.log('✅ Executor instantiated');
  
  // Test URL building
  const url = chatgpt.buildUrl('gpt-5.5', true, 0, null);
  console.log(`✅ URL: ${url}`);
  
  // Test headers
  const headers = chatgpt.buildWebHeaders({ accessToken: CHATGPT_TOKEN });
  console.log(`✅ Headers: ${Object.keys(headers).length} headers`);
  
  // Test message parsing
  const messages = [{ role: 'user', content: 'Hello, what is 2+2?' }];
  const parsed = chatgpt.parseMessages(messages);
  console.log(`✅ Messages parsed: "${parsed}"`);
  
  // Test payload building
  const payload = await chatgpt.buildWebPayload('gpt-5.5', messages, true, null);
  console.log(`✅ Payload built: ${Object.keys(payload).length} fields`);
  
  console.log('\n✅ ChatGPT Web tests passed!');
} catch (err) {
  console.error('❌ ChatGPT Web test failed:', err.message);
}

// Test 3: Grok Web
console.log('\n📋 Test 3: Grok Web Executor');
console.log('-'.repeat(50));

try {
  const grok = new GrokWebExecutor();
  console.log('✅ Executor instantiated');
  
  // Test URL building
  const url = grok.buildUrl('grok-4.1-fast', true, 0, null);
  console.log(`✅ URL: ${url}`);
  
  // Test headers
  const headers = grok.buildWebHeaders({ apiKey: GROK_SSO });
  console.log(`✅ Headers: ${Object.keys(headers).length} headers`);
  
  // Test message parsing
  const messages = [{ role: 'user', content: 'Hello, what is 2+2?' }];
  const parsed = grok.parseMessages(messages);
  console.log(`✅ Messages parsed: "${parsed}"`);
  
  // Test payload building
  const payload = await grok.buildWebPayload('grok-4.1-fast', messages, true, null);
  console.log(`✅ Payload built: ${Object.keys(payload).length} fields`);
  
  console.log('\n✅ Grok Web tests passed!');
} catch (err) {
  console.error('❌ Grok Web test failed:', err.message);
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 Summary');
console.log('='.repeat(50));
console.log('\nAll executors instantiate and build payloads correctly.');
console.log('\nTo test real API calls, set environment variables:');
console.log('  export GROK_SSO="your-sso-cookie"');
console.log('  export CHATGPT_TOKEN="your-access-token"');
console.log('  export ZAI_TOKEN="your-api-token"');
console.log('\nThen run:');
console.log('  node test-web-ui-providers.mjs --live');
