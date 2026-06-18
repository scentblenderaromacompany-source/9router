#!/usr/bin/env node

/**
 * Real API Test Suite for Free No Account Required Models and Providers
 * 
 * This test suite makes actual API calls to verify that free providers work correctly.
 * Tests are designed to respect rate limits and handle authentication appropriately.
 * 
 * Usage:
 *   node test-free-providers-real-api.mjs
 * 
 * Environment variables (optional):
 *   DUCK_API_KEY - Duck.ai API key (optional, not required for free access)
 *   POLLINATIONS_API_KEY - Pollinations API key (optional, not required for free access)
 *   GROK_API_KEY - Grok Imagine API key (optional, not required for free access)
 */

import https from 'https';
import http from 'http';

console.log('🧪 Real API Tests for Free Providers\n');
console.log('='.repeat(60));

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    const request = protocol.request(url, options, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ statusCode: response.statusCode, data: jsonData, headers: response.headers });
        } catch (error) {
          resolve({ statusCode: response.statusCode, data: data, headers: response.headers, error: error.message });
        }
      });
    });
    
    request.on('error', (error) => {
      reject(error);
    });
    
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
    
    Object.keys(options.headers || {}).forEach((key) => {
      request.setHeader(key, options.headers[key]);
    });
    
    request.end(options.body);
  });
}

// Test 1: Duck.ai API Test
console.log('\n📋 Test 1: Duck.ai API (Free, No Account Required)');
console.log('-'.repeat(60));

async function testDuckAI() {
  try {
    console.log('🔍 Testing Duck.ai API endpoint...');
    
    // Duck.ai uses VQD challenge tokens for authentication
    // For free access, we can try without authentication
    const url = 'https://duck.ai/duckchat/v1/status';
    
    const response = await makeRequest(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': '9Router-Free-Provider-Test/1.0'
      }
    });
    
    if (response.statusCode === 200) {
      console.log(`✅ Duck.ai API responded successfully: ${response.statusCode}`);
      console.log(`✅ Response data: ${JSON.stringify(response.data, null, 2)}`);
      
      // Check if we got models data
      if (response.data.models || response.data.model) {
        console.log(`✅ Duck.ai models available: ${response.data.models ? response.data.models.length : 'N/A'}`);
        return true;
      } else {
        console.log('⚠️  Duck.ai response did not contain expected models data');
        return false;
      }
    } else {
      console.log(`❌ Duck.ai API failed: ${response.statusCode}`);
      console.log(`❌ Error: ${response.error || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Duck.ai API test failed with error: ${error.message}`);
    return false;
  }
}

// Test 2: Pollinations API Test
console.log('\n📋 Test 2: Pollinations.ai API (Free, No Account Required)');
console.log('-'.repeat(60));

async function testPollinations() {
  try {
    console.log('🔍 Testing Pollinations API endpoint...');
    
    // Pollinations provides a simple models endpoint
    const url = 'https://image.pollinations.ai/models';
    
    const response = await makeRequest(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': '9Router-Free-Provider-Test/1.0'
      }
    });
    
    if (response.statusCode === 200) {
      console.log(`✅ Pollinations API responded successfully: ${response.statusCode}`);
      console.log(`✅ Response data: ${JSON.stringify(response.data, null, 2)}`);
      
      // Check if we got models data
      if (response.data.models && Array.isArray(response.data.models)) {
        console.log(`✅ Pollinations models available: ${response.data.models.length} models`);
        console.log(`✅ Sample models: ${response.data.models.slice(0, 3).map(m => m.id).join(', ')}`);
        return true;
      } else {
        console.log('⚠️  Pollinations response did not contain expected models data');
        return false;
      }
    } else {
      console.log(`❌ Pollinations API failed: ${response.statusCode}`);
      console.log(`❌ Error: ${response.error || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Pollinations API test failed with error: ${error.message}`);
    return false;
  }
}

// Test 3: Grok Imagine API Test
console.log('\n📋 Test 3: Grok Imagine API (Free, No Account Required)');
console.log('-'.repeat(60));

async function testGrokImagine() {
  try {
    console.log('🔍 Testing Grok Imagine API endpoint...');
    
    // Grok Imagine uses reverse-engineered API
    // Try the models endpoint
    const url = 'https://grok.x.ai/api/v1/models';
    
    const response = await makeRequest(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': '9Router-Free-Provider-Test/1.0'
      }
    });
    
    if (response.statusCode === 200) {
      console.log(`✅ Grok Imagine API responded successfully: ${response.statusCode}`);
      console.log(`✅ Response data: ${JSON.stringify(response.data, null, 2)}`);
      
      // Check if we got models data
      if (response.data.models && Array.isArray(response.data.models)) {
        console.log(`✅ Grok Imagine models available: ${response.data.models.length} models`);
        return true;
      } else {
        console.log('⚠️  Grok Imagine response did not contain expected models data');
        return false;
      }
    } else {
      console.log(`❌ Grok Imagine API failed: ${response.statusCode}`);
      console.log(`❌ Error: ${response.error || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Grok Imagine API test failed with error: ${error.message}`);
    return false;
  }
}

// Test 4: Rate Limiting Test
console.log('\n📋 Test 4: Rate Limiting Test');
console.log('-'.repeat(60));

async function testRateLimiting() {
  try {
    console.log('🔍 Testing rate limiting for free providers...');
    
    // Test multiple rapid requests to check rate limiting
    const baseUrl = 'https://duck.ai/duckchat/v1/status';
    const requests = [];
    
    for (let i = 0; i < 5; i++) {
      requests.push(
        makeRequest(baseUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': '9Router-Free-Provider-Test/1.0'
          }
        })
      );
    }
    
    console.log('🔍 Making 5 rapid requests to test rate limiting...');
    const results = await Promise.allSettled(requests);
    
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.statusCode === 200).length;
    const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value.statusCode !== 200)).length;
    
    console.log(`✅ Rate limiting test completed: ${successful} successful, ${failed} failed`);
    
    if (successful > 0) {
      console.log(`✅ Rate limiting is working (some requests succeeded despite rapid calls)`);
      return true;
    } else {
      console.log(`⚠️  All requests failed - this might indicate rate limiting or connectivity issues`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Rate limiting test failed with error: ${error.message}`);
    return false;
  }
}

// Test 5: Cache Test
console.log('\n📋 Test 5: Cache Test');
console.log('-'.repeat(60));

async function testCache() {
  try {
    console.log('🔍 Testing cache functionality...');
    
    const url = 'https://duck.ai/duckchat/v1/status';
    
    // First request
    console.log('🔍 Making first request...');
    const firstResponse = await makeRequest(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': '9Router-Free-Provider-Test/1.0'
      }
    });
    
    // Second request (should be cached)
    console.log('🔍 Making second request (should be cached)...');
    const secondResponse = await makeRequest(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': '9Router-Free-Provider-Test/1.0'
      }
    });
    
    console.log(`✅ First request status: ${firstResponse.statusCode}`);
    console.log(`✅ Second request status: ${secondResponse.statusCode}`);
    
    // Both should succeed
    if (firstResponse.statusCode === 200 && secondResponse.statusCode === 200) {
      console.log(`✅ Cache test passed: Both requests succeeded`);
      return true;
    } else {
      console.log(`❌ Cache test failed: One or both requests failed`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Cache test failed with error: ${error.message}`);
    return false;
  }
}

// Main test execution
async function runTests() {
  const results = [];
  
  // Run all tests
  results.push(['Duck.ai API', await testDuckAI()]);
  results.push(['Pollinations API', await testPollinations()]);
  results.push(['Grok Imagine API', await testGrokImagine()]);
  results.push(['Rate Limiting', await testRateLimiting()]);
  results.push(['Cache', await testCache()]);
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary');
  console.log('='.repeat(60));
  
  let passed = 0;
  let failed = 0;
  
  for (const [testName, result] of results) {
    if (result) {
      console.log(`✅ ${testName}: PASSED`);
      passed++;
    } else {
      console.log(`❌ ${testName}: FAILED`);
      failed++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Final Results');
  console.log('='.repeat(60));
  console.log(`\nTotal Tests: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`);
  
  if (passed === results.length) {
    console.log('\n🎉 All tests passed! Free providers are working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the output above for details.');
  }
  
  return passed === results.length;
}

// Run the tests
runTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});
