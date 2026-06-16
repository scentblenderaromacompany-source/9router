/**
 * Image Generation Providers Test Suite
 * Tests for Pollinations, Krea, Jimeng, Flux, and Grok Imagine
 */

console.log('🧪 Image Generation Providers Tests\n');

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

// ============ Pollinations Tests ============
console.log('--- Pollinations.ai ---');

try {
  const { PollinationsExecutor } = await import('./open-sse/executors/pollinations.js');
  const executor = new PollinationsExecutor();
  
  assert(executor.providerId === 'pollinations', 'Pollinations: Provider ID');
  
  const imageUrl = executor.buildImageUrl('A sunset', 'flux', 1024, 768, 12345);
  assert(imageUrl.includes('/prompt/'), 'Pollinations: Image URL has /prompt/');
  assert(imageUrl.includes('model=flux'), 'Pollinations: Image URL has model param');
  assert(imageUrl.includes('width=1024'), 'Pollinations: Image URL has width');
  assert(imageUrl.includes('height=768'), 'Pollinations: Image URL has height');
  assert(imageUrl.includes('seed=12345'), 'Pollinations: Image URL has seed');
  
  const payload = executor.buildPayload('A cat', 'flux', 512, 512, 999);
  assert(payload.prompt === 'A cat', 'Pollinations: Payload prompt');
  assert(payload.model === 'flux', 'Pollinations: Payload model');
  assert(payload.seed === 999, 'Pollinations: Payload seed');
  
  const registry = (await import('./open-sse/providers/registry/pollinations.js')).default;
  assert(registry.id === 'pollinations', 'Pollinations: Registry ID');
  assert(registry.category === 'imageGen', 'Pollinations: Category');
  assert(registry.models.length >= 12, 'Pollinations: Has models');
} catch (error) {
  console.error('❌ Pollinations failed:', error.message);
}

// ============ Krea Tests ============
console.log('\n--- Krea AI ---');

try {
  const { KreaExecutor } = await import('./open-sse/executors/krea.js');
  const executor = new KreaExecutor();
  
  assert(executor.providerId === 'krea', 'Krea: Provider ID');
  assert(executor.buildGenerateUrl().includes('/v1/images/generations'), 'Krea: Generate URL');
  assert(executor.buildModelsUrl().includes('/v1/models'), 'Krea: Models URL');
  assert(executor.buildJobStatusUrl('job123').includes('job123'), 'Krea: Job status URL');
  
  const headers = executor.buildHeaders({ apiKey: 'test-key' });
  assert(headers['Authorization'] === 'Bearer test-key', 'Krea: Auth header');
  
  const payload = executor.buildPayload('A cat', 'flux-1.1-pro', 1024, 1024, 42);
  assert(payload.prompt === 'A cat', 'Krea: Payload prompt');
  assert(payload.model === 'flux-1.1-pro', 'Krea: Payload model');
  assert(payload.seed === 42, 'Krea: Payload seed');
  
  const registry = (await import('./open-sse/providers/registry/krea.js')).default;
  assert(registry.id === 'krea', 'Krea: Registry ID');
  assert(registry.models.length >= 12, 'Krea: Has models');
} catch (error) {
  console.error('❌ Krea failed:', error.message);
}

// ============ Jimeng Tests ============
console.log('\n--- Jimeng/Dreamina ---');

try {
  const { JimengExecutor } = await import('./open-sse/executors/jimeng.js');
  const executor = new JimengExecutor();
  
  assert(executor.providerId === 'jimeng', 'Jimeng: Provider ID');
  assert(executor.buildGenerateUrl().includes('/aigc_draft/generate'), 'Jimeng: Generate URL');
  assert(executor.buildTaskStatusUrl('task123').includes('task123'), 'Jimeng: Task status URL');
  
  const headers = executor.buildHeaders({ apiKey: 'session-cookie-value' });
  assert(headers['Cookie'] === 'session-cookie-value', 'Jimeng: Cookie header');
  
  const payload = executor.buildPayload('A cat', 'jimeng-6', 1024, 1024, 42, 'realistic');
  assert(payload.prompt === 'A cat', 'Jimeng: Payload prompt');
  assert(payload.model_info.model_name === 'jimeng-6', 'Jimeng: Payload model');
  assert(payload.seed === 42, 'Jimeng: Payload seed');
  assert(payload.style === 'realistic', 'Jimeng: Payload style');
  
  const registry = (await import('./open-sse/providers/registry/jimeng.js')).default;
  assert(registry.id === 'jimeng', 'Jimeng: Registry ID');
  assert(registry.models.length >= 4, 'Jimeng: Has models');
} catch (error) {
  console.error('❌ Jimeng failed:', error.message);
}

// ============ Flux Tests ============
console.log('\n--- Flux (Black Forest Labs) ---');

try {
  const { FluxExecutor } = await import('./open-sse/executors/flux.js');
  const executor = new FluxExecutor();
  
  assert(executor.providerId === 'flux', 'Flux: Provider ID');
  assert(executor.buildGenerateUrl('flux-1.1-pro').includes('/v1/flux-1.1-pro'), 'Flux: Generate URL for 1.1-pro');
  assert(executor.buildGenerateUrl('flux-schnell').includes('/v1/flux-schnell'), 'Flux: Generate URL for schnell');
  assert(executor.buildGenerateUrl('flux-2-pro').includes('/v1/flux-2-pro'), 'Flux: Generate URL for 2-pro');
  assert(executor.buildResultUrl('job123').includes('job123'), 'Flux: Result URL');
  
  const headers = executor.buildHeaders({ apiKey: 'test-key' });
  assert(headers['X-Key'] === 'test-key', 'Flux: X-Key header');
  
  const payload = executor.buildPayload('A cat', 'flux-1.1-pro', 1024, 768, 42, 20, 7.5);
  assert(payload.prompt === 'A cat', 'Flux: Payload prompt');
  assert(payload.width === 1024, 'Flux: Payload width');
  assert(payload.height === 768, 'Flux: Payload height');
  assert(payload.seed === 42, 'Flux: Payload seed');
  assert(payload.num_inference_steps === 20, 'Flux: Payload steps');
  assert(payload.guidance === 7.5, 'Flux: Payload guidance');
  
  // Ultra mode
  const ultraPayload = executor.buildPayload('A cat', 'flux-1.1-pro-ultra', 1920, 1080);
  assert(ultraPayload.raw === true, 'Flux: Ultra mode raw flag');
  assert(ultraPayload.aspect_ratio === '16:9', 'Flux: Ultra mode aspect ratio');
  
  const registry = (await import('./open-sse/providers/registry/flux.js')).default;
  assert(registry.id === 'flux', 'Flux: Registry ID');
  assert(registry.models.length >= 8, 'Flux: Has models');
} catch (error) {
  console.error('❌ Flux failed:', error.message);
}

// ============ Grok Imagine Tests ============
console.log('\n--- Grok Imagine ---');

try {
  const { GrokImagineExecutor } = await import('./open-sse/executors/grok-imagine.js');
  const executor = new GrokImagineExecutor();
  
  assert(executor.providerId === 'grok-imagine', 'Grok Imagine: Provider ID');
  assert(executor.buildGenerateUrl().includes('/rest/id/grok-imagine'), 'Grok Imagine: Generate URL');
  assert(executor.buildSessionUrl().includes('/rest/id/'), 'Grok Imagine: Session URL');
  
  const payload = executor.buildPayload('A cat', 1024, 768, 42);
  assert(payload.prompt === 'A cat', 'Grok Imagine: Payload prompt');
  assert(payload.width === 1024, 'Grok Imagine: Payload width');
  assert(payload.height === 768, 'Grok Imagine: Payload height');
  assert(payload.seed === 42, 'Grok Imagine: Payload seed');
  
  const registry = (await import('./open-sse/providers/registry/grok-imagine.js')).default;
  assert(registry.id === 'grok-imagine', 'Grok Imagine: Registry ID');
  assert(registry.authType === 'none', 'Grok Imagine: Free (no auth)');
} catch (error) {
  console.error('❌ Grok Imagine failed:', error.message);
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
