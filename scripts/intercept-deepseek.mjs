/**
 * DeepSeek Web API Traffic Interceptor
 * Captures all API requests made by chat.deepseek.com
 * 
 * Usage: node scripts/intercept-deepseek.mjs
 * 
 * This script will:
 * 1. Launch a browser with puppeteer
 * 2. Navigate to chat.deepseek.com
 * 3. Intercept all network requests
 * 4. Log API endpoints, headers, and payloads
 */

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { writeFileSync } from 'fs';
import { join } from 'path';

puppeteer.use(StealthPlugin());

const DEEPSEEK_URL = 'https://chat.deepseek.com';
const OUTPUT_FILE = join(process.cwd(), 'deepseek-api-capture.json');

const capturedRequests = [];
const capturedResponses = [];

function randomDelay(min = 500, max = 2000) {
  return new Promise(r => setTimeout(r, min + Math.random() * (max - min)));
}

async function launchBrowser() {
  return puppeteer.launch({
    headless: false, // Set to true for headless mode
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-dev-shm-usage',
      '--window-size=1280,720',
    ],
  });
}

async function interceptDeepSeekAPI() {
  console.log('🔍 DeepSeek API Traffic Interceptor');
  console.log('====================================\n');
  
  const browser = await launchBrowser();
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 720 });
  
  // Set up request interception
  await page.setRequestInterception(true);
  
  page.on('request', (request) => {
    const url = request.url();
    
    // Capture DeepSeek API requests
    if (url.includes('chat.deepseek.com/api/') || 
        url.includes('chat.deepseek.com/backend-anon/')) {
      
      const requestData = {
        timestamp: new Date().toISOString(),
        url,
        method: request.method(),
        headers: request.headers(),
        postData: request.postData() || null,
        resourceType: request.resourceType(),
      };
      
      capturedRequests.push(requestData);
      
      console.log(`📡 Request: ${request.method()} ${url}`);
      if (request.postData()) {
        try {
          const body = JSON.parse(request.postData());
          console.log(`   Body: ${JSON.stringify(body, null, 2).slice(0, 200)}...`);
        } catch {
          console.log(`   Body: ${request.postData().slice(0, 100)}...`);
        }
      }
    }
    
    request.continue();
  });
  
  page.on('response', async (response) => {
    const url = response.url();
    
    // Capture DeepSeek API responses
    if (url.includes('chat.deepseek.com/api/') || 
        url.includes('chat.deepseek.com/backend-anon/')) {
      
      try {
        const responseText = await response.text();
        let responseData;
        
        try {
          responseData = JSON.parse(responseText);
        } catch {
          responseData = responseText.slice(0, 500);
        }
        
        const capturedResponse = {
          timestamp: new Date().toISOString(),
          url,
          status: response.status(),
          headers: response.headers(),
          data: responseData,
        };
        
        capturedResponses.push(capturedResponse);
        
        console.log(`📥 Response: ${response.status()} ${url}`);
        if (typeof responseData === 'object') {
          console.log(`   Data: ${JSON.stringify(responseData, null, 2).slice(0, 200)}...`);
        }
      } catch (err) {
        // Response body may not be available
      }
    }
  });
  
  // Navigate to DeepSeek
  console.log('\n🌐 Navigating to chat.deepseek.com...');
  await page.goto(DEEPSEEK_URL, { waitUntil: 'networkidle2', timeout: 60000 });
  
  console.log('\n⏳ Page loaded. Waiting for user to interact...');
  console.log('   (Login if needed, then send a message to capture the chat API)\n');
  
  // Wait for user interaction
  await randomDelay(30000, 60000);
  
  // Save captured data
  const output = {
    capturedAt: new Date().toISOString(),
    requests: capturedRequests,
    responses: capturedResponses,
    endpoints: extractEndpoints(),
  };
  
  writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`\n✅ Captured ${capturedRequests.length} requests and ${capturedResponses.length} responses`);
  console.log(`📁 Saved to: ${OUTPUT_FILE}`);
  
  // Print summary
  printEndpointSummary();
  
  await browser.close();
}

function extractEndpoints() {
  const endpoints = {};
  
  for (const req of capturedRequests) {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;
    const key = `${method} ${path}`;
    
    if (!endpoints[key]) {
      endpoints[key] = {
        method,
        path,
        count: 0,
        examples: [],
      };
    }
    
    endpoints[key].count++;
    
    if (endpoints[key].examples.length < 3) {
      let body = null;
      if (req.postData) {
        try {
          body = JSON.parse(req.postData);
        } catch {
          body = req.postData;
        }
      }
      endpoints[key].examples.push({
        query: Object.fromEntries(url.searchParams),
        body,
      });
    }
  }
  
  return endpoints;
}

function printEndpointSummary() {
  console.log('\n📊 Endpoint Summary');
  console.log('==================\n');
  
  const endpoints = extractEndpoints();
  
  for (const [key, info] of Object.entries(endpoints)) {
    console.log(`${info.method} ${info.path}`);
    console.log(`   Count: ${info.count}`);
    if (info.examples[0]?.body) {
      console.log(`   Example body: ${JSON.stringify(info.examples[0].body).slice(0, 100)}...`);
    }
    console.log('');
  }
}

// Run if executed directly
interceptDeepSeekAPI().catch(console.error);
