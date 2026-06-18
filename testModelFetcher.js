#!/usr/bin/env node

/**
 * Test script for the Model Fetching System
 *
 * This script demonstrates the basic functionality of the Model Fetching System
 * and verifies that all components are working correctly.
 */

const { ModelFetcherScheduler } = require('@/lib/modelFetchers/scheduler');
const { ModelCache } = require('@/lib/modelFetchers/cache');
const { RateLimiter } = require('@/lib/modelFetchers/rateLimiter');

async function testCache() {
  console.log('Testing cache system...');

  const cache = new ModelCache();

  // Test setting and getting data
  await cache.set('test-key', { data: 'test-value' }, 1000);
  const result = await cache.get('test-key');

  if (result && result.data === 'test-value') {
    console.log('✓ Cache test passed: Data stored and retrieved correctly');
  } else {
    console.log('✗ Cache test failed: Data not stored or retrieved correctly');
    return false;
  }

  // Test cache expiration
  await cache.set('expire-key', { data: 'expire-value' }, -1000);
  const expired = await cache.get('expire-key');

  if (expired === null) {
    console.log('✓ Cache expiration test passed: Expired data correctly removed');
  } else {
    console.log('✗ Cache expiration test failed: Expired data not removed');
    return false;
  }

  return true;
}

async function testRateLimiter() {
  console.log('\nTesting rate limiter...');

  const rateLimiter = new RateLimiter(5);

  // Test allowing requests within limit
  for (let i = 0; i < 5; i++) {
    await rateLimiter.acquire();
  }

  if (rateLimiter.requests.length === 5) {
    console.log('✓ Rate limiter test passed: All requests allowed within limit');
  } else {
    console.log('✗ Rate limiter test failed: Not all requests allowed');
    return false;
  }

  // Test blocking requests beyond limit
  const start = Date.now();
  await rateLimiter.acquire();
  const end = Date.now();

  if (end - start >= 60000) {
    console.log('✓ Rate limiter blocking test passed: Requests blocked beyond limit');
  } else {
    console.log('✗ Rate limiter blocking test failed: Requests not blocked');
    return false;
  }

  return true;
}

async function testScheduler() {
  console.log('\nTesting scheduler...');

  const scheduler = new ModelFetcherScheduler();

  // Test scheduler initialization
  if (scheduler.fetchers && typeof scheduler.fetchers === 'object') {
    console.log('✓ Scheduler initialization test passed: Fetchers initialized');
  } else {
    console.log('✗ Scheduler initialization test failed: Fetchers not initialized');
    return false;
  }

  // Test scheduler status
  if (scheduler.isSchedulerRunning() === false) {
    console.log('✓ Scheduler status test passed: Scheduler not running');
  } else {
    console.log('✗ Scheduler status test failed: Scheduler incorrectly running');
    return false;
  }

  // Test scheduler stop
  scheduler.stop();
  if (scheduler.isSchedulerRunning() === false) {
    console.log('✓ Scheduler stop test passed: Scheduler stopped');
  } else {
    console.log('✗ Scheduler stop test failed: Scheduler not stopped');
    return false;
  }

  return true;
}

async function testProviderFetchers() {
  console.log('\nTesting provider fetchers...');

  const scheduler = new ModelFetcherScheduler();

  // Test getting fetcher class for known providers
  const openaiFetcher = scheduler.getFetcherClass('openai');
  if (openaiFetcher) {
    console.log('✓ OpenAI fetcher test passed: Fetcher found for OpenAI');
  } else {
    console.log('✗ OpenAI fetcher test failed: No fetcher found for OpenAI');
    return false;
  }

  const anthropicFetcher = scheduler.getFetcherClass('anthropic');
  if (anthropicFetcher) {
    console.log('✓ Anthropic fetcher test passed: Fetcher found for Anthropic');
  } else {
    console.log('✗ Anthropic fetcher test failed: No fetcher found for Anthropic');
    return false;
  }

  // Test getting fetcher class for unknown provider
  const unknownFetcher = scheduler.getFetcherClass('unknown');
  if (unknownFetcher === null) {
    console.log('✓ Unknown provider test passed: No fetcher found for unknown provider');
  } else {
    console.log('✗ Unknown provider test failed: Fetcher found for unknown provider');
    return false;
  }

  return true;
}

async function main() {
  console.log('=== Model Fetching System Test ===\n');

  const tests = [
    testCache,
    testRateLimiter,
    testScheduler,
    testProviderFetchers,
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.log(`✗ Test failed with error: ${error.message}`);
      failed++;
    }
  }

  console.log('\n=== Test Summary ===');
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${passed + failed}`);

  if (failed === 0) {
    console.log('\n✓ All tests passed! The Model Fetching System is working correctly.');
    process.exit(0);
  } else {
    console.log('\n✗ Some tests failed. Please check the system configuration.');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
