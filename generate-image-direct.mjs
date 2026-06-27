/**
 * Direct Image Generation via ChatGPT Web API
 * Uses our ChatGPTWebExecutor with a valid access token
 */

import { ChatGPTWebExecutor } from './open-sse/executors/chatgpt-web.js';
import { writeFile } from 'fs/promises';

const IMAGE_PROMPT = "A serene Japanese garden with a red bridge over a koi pond, cherry blossoms falling, golden hour lighting, photorealistic, 4k";

async function generateImage(accessToken, chatgptUrl = 'http://localhost:8700/v1') {
  console.log('🎨 ChatGPT Web Image Generator\n');
  console.log(`Prompt: "${IMAGE_PROMPT}"\n`);

  const executor = new ChatGPTWebExecutor();

  // Build request
  const credentials = {
    accessToken,
    providerSpecificData: {
      baseUrl: chatgptUrl,
      apiType: 'chat'
    }
  };

  const url = executor.buildUrl('gpt-image-2', false, 0, credentials);
  const headers = executor.buildHeaders(credentials, false);

  const body = executor.transformRequest('gpt-image-2', {
    messages: [
      {
        role: 'user',
        content: IMAGE_PROMPT
      }
    ],
    size: '1024x1024',
    quality: 'hd',
    style: 'vivid'
  }, false, credentials);

  console.log(`Endpoint: ${url}`);
  console.log('Sending request...\n');

  try {
    // Make the API call
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Response received!\n');

    // Extract image data
    if (data.data && data.data[0]) {
      const item = data.data[0];

      if (item.b64_json) {
        // Base64 encoded image
        const imageData = Buffer.from(item.b64_json, 'base64');
        await writeFile('./generated-image.png', imageData);
        console.log(`✅ Image saved to: generated-image.png (${(imageData.length / 1024).toFixed(1)} KB)`);
      } else if (item.url) {
        // URL to download
        console.log(`📸 Image URL: ${item.url}`);

        // Download the image
        const imgResponse = await fetch(item.url);
        const imgBuffer = Buffer.from(await imgResponse.arrayBuffer());
        await writeFile('./generated-image.png', imgBuffer);
        console.log(`✅ Image downloaded to: generated-image.png (${(imgBuffer.length / 1024).toFixed(1)} KB)`);
      }
    } else {
      console.log('Response:', JSON.stringify(data, null, 2));
    }

    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

// Parse CLI args
const args = process.argv.slice(2);
const tokenIndex = args.indexOf('--token');
const urlIndex = args.indexOf('--url');

if (tokenIndex === -1 || !args[tokenIndex + 1]) {
  console.log('Usage: node generate-image-direct.mjs --token YOUR_TOKEN [--url CHAT2API_URL]');
  console.log('');
  console.log('Options:');
  console.log('  --token    Your ChatGPT access token (required)');
  console.log('  --url      Chat2API proxy URL (default: http://localhost:8700/v1)');
  console.log('');
  console.log('To get your access token:');
  console.log('1. Log in to chatgpt.com');
  console.log('2. Visit https://chatgpt.com/api/auth/session');
  console.log('3. Copy the "accessToken" value');
  process.exit(1);
}

const token = args[tokenIndex + 1];
const url = urlIndex !== -1 ? args[urlIndex + 1] : 'http://localhost:8700/v1';

generateImage(token, url);
