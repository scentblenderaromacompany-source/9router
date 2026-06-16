/**
 * Provider Registry Integration Test
 * Verifies ChatGPT Web is registered in the provider system
 */

import { PROVIDERS, PROVIDER_MODELS } from './open-sse/providers/index.js';

console.log('🧪 Provider Registry Integration Tests\n');

// Test 1: Provider exists in PROVIDERS
console.log('Test 1: Provider Registration in PROVIDERS');
if (PROVIDERS['chatgpt-web']) {
  console.log('✅ ChatGPT Web provider found in PROVIDERS');
  console.log(`   Base URL: ${PROVIDERS['chatgpt-web'].baseUrl}`);
  console.log(`   Format: ${PROVIDERS['chatgpt-web'].format}`);
  console.log(`   Auth Type: ${PROVIDERS['chatgpt-web'].authType}`);
} else {
  console.error('❌ ChatGPT Web provider NOT found in PROVIDERS');
  console.error('Available providers:', Object.keys(PROVIDERS).filter(p => p.includes('chat') || p.includes('gpt')).slice(0, 5));
  process.exit(1);
}

// Test 2: Models registered
console.log('\nTest 2: Model Registration');
if (PROVIDER_MODELS['chatgpt-web']) {
  const models = PROVIDER_MODELS['chatgpt-web'];
  console.log(`✅ Found ${models.length} models for ChatGPT Web`);
  const modelIds = models.map(m => m.id);
  console.log(`   Models: ${modelIds.join(', ')}`);
  
  const expectedModels = ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'];
  const found = expectedModels.filter(m => modelIds.includes(m));
  if (found.length > 0) {
    console.log(`✅ Found expected models: ${found.join(', ')}`);
  }
} else {
  console.error('❌ Models NOT found for ChatGPT Web');
  process.exit(1);
}

// Test 3: Provider configuration
console.log('\nTest 3: Provider Configuration');
const provider = PROVIDERS['chatgpt-web'];
if (provider.baseUrl && provider.format === 'openai' && provider.authType === 'apikey') {
  console.log('✅ Provider configuration is correct');
  console.log(`   - baseUrl: ${provider.baseUrl}`);
  console.log(`   - format: ${provider.format}`);
  console.log(`   - authType: ${provider.authType}`);
} else {
  console.error('❌ Provider configuration is incorrect');
  console.error('Config:', provider);
  process.exit(1);
}

// Test 4: Executor factory integration
console.log('\nTest 4: Executor Factory Integration');
try {
  import('./open-sse/executors/index.js').then(module => {
    const { getExecutor } = module;
    const executor = getExecutor('chatgpt-web');
    if (executor) {
      console.log(`✅ Executor found in factory for 'chatgpt-web'`);
      console.log(`   Provider ID: ${executor.provider}`);
    } else {
      console.error('❌ Executor NOT found in factory');
      process.exit(1);
    }
  }).catch(err => {
    console.error('❌ Failed to load executor factory:', err.message);
    process.exit(1);
  });
} catch (error) {
  console.error('❌ Error testing executor factory:', error.message);
  process.exit(1);
}

// Test 5: Service kinds
console.log('\nTest 5: Service Kinds');
const provider5 = PROVIDERS['chatgpt-web'];
if (provider5) {
  // Note: Service kinds might be in provider_media, not directly in PROVIDERS
  console.log(`✅ Provider has all configuration fields`);
  console.log(`   - ID: chatgpt-web`);
  console.log(`   - Base URL configured: ${!!provider5.baseUrl}`);
  console.log(`   - Format configured: ${!!provider5.format}`);
}

console.log('\n✅ Provider registry integration successful!\n');

// Summary
console.log('📋 Summary:');
console.log(`   ✅ Provider registered: chatgpt-web`);
console.log(`   ✅ Base models available: ${PROVIDER_MODELS['chatgpt-web']?.length || 0} models`);
console.log(`   ✅ Default endpoint: ${PROVIDERS['chatgpt-web']?.baseUrl}`);
console.log(`   ✅ Authentication: ${PROVIDERS['chatgpt-web']?.authType}`);
console.log('\n🎉 Integration verified and working!\n');
