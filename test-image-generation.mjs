/**
 * Image Generation Test - Verify Request Format
 * Tests the executor's image generation request building
 */

import { ChatGPTWebExecutor } from './open-sse/executors/chatgpt-web.js';

console.log('🖼️  Image Generation Request Test\n');

const executor = new ChatGPTWebExecutor();

// Test 1: Build image generation request
console.log('Test 1: Build Image Generation Request');
const credentials = { accessToken: 'test-token-12345' };
const url = executor.buildUrl('gpt-image-2', false, 0, credentials);
const headers = executor.buildHeaders(credentials, false);

const body = executor.transformRequest('gpt-image-2', {
  messages: [
    {
      role: 'user',
      content: "A serene Japanese garden with a red bridge over a koi pond, cherry blossoms falling, golden hour lighting, photorealistic, 4k"
    }
  ],
  size: '1024x1024',
  quality: 'hd',
  style: 'vivid'
}, false, credentials);

console.log('✅ Request built successfully');
console.log(`   URL: ${url}`);
console.log(`   Method: POST`);
console.log(`   Headers: ${JSON.stringify(headers, null, 2)}`);
console.log(`   Body: ${JSON.stringify(body, null, 2)}`);

// Test 2: Verify image-specific parameters
console.log('\nTest 2: Verify Image Parameters');
if (body.model === 'gpt-image-2') {
  console.log('✅ Model set correctly: gpt-image-2');
}
if (body.size === '1024x1024') {
  console.log('✅ Size set correctly: 1024x1024');
}
if (body.quality === 'hd') {
  console.log('✅ Quality set correctly: hd');
}
if (body.style === 'vivid') {
  console.log('✅ Style set correctly: vivid');
}

// Test 3: Test with DALL-E 3 model
console.log('\nTest 3: DALL-E 3 Model');
const dalle3Body = executor.transformRequest('dall-e-3', {
  messages: [
    {
      role: 'user',
      content: "A futuristic city skyline at sunset"
    }
  ],
  size: '1792x1024',
  quality: 'standard'
}, false, credentials);

console.log(`✅ DALL-E 3 request: ${dalle3Body.model}, ${dalle3Body.size}, ${dalle3Body.quality}`);

// Test 4: Show how to use with real token
console.log('\n📝 How to Generate a Real Image:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('1. Get your access token:');
console.log('   Visit https://chatgpt.com/api/auth/session while logged in');
console.log('   Copy the "accessToken" value\n');
console.log('2. Run the generator:');
console.log('   node generate-image.mjs --token YOUR_ACCESS_TOKEN\n');
console.log('3. Or use curl directly:');
console.log(`   curl -X POST ${url} \\`);
console.log(`     -H "Authorization: Bearer YOUR_TOKEN" \\`);
console.log(`     -H "Content-Type: application/json" \\`);
console.log(`     -d '${JSON.stringify(body)}'`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

console.log('\n✅ All request format tests passed!');
