/**
 * Image Generation via ChatGPT Web - Headless Mode
 * Uses Playwright to manage browser session and generate images
 */

import { chromium } from 'playwright';
import { writeFile } from 'fs/promises';

const IMAGE_PROMPT = "A serene Japanese garden with a red bridge over a koi pond, cherry blossoms falling, golden hour lighting, photorealistic, 4k";

async function generateImage() {
  console.log('🎨 ChatGPT Web Image Generator (Headless)\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Try to access chatgpt.com session
    console.log('Checking for existing session...');
    await page.goto('https://chatgpt.com/api/auth/session', { timeout: 10000 });
    const content = await page.textContent('body');

    let sessionData;
    try {
      sessionData = JSON.parse(content);
    } catch (e) {
      console.log('No active session found.');
      console.log('\nTo generate images, you need to:');
      console.log('1. Log in to chatgpt.com in a browser');
      console.log('2. Visit https://chatgpt.com/api/auth/session');
      console.log('3. Copy the accessToken value');
      console.log('4. Run: node generate-image.mjs --token YOUR_TOKEN');
      return;
    }

    if (!sessionData?.accessToken) {
      console.log('No access token in session. Please log in to chatgpt.com first.');
      return;
    }

    console.log('✅ Session found! Generating image...\n');

    // Use the token to generate image via fetch
    const response = await page.evaluate(async ({ token, prompt }) => {
      const res = await fetch('https://chatgpt.com/backend-api/attributions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: prompt,
          model: 'dall-e-3'
        })
      });
      return await res.json();
    }, { token: sessionData.accessToken, prompt: IMAGE_PROMPT });

    console.log('Response:', JSON.stringify(response, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

// CLI mode with token argument
async function generateWithToken(token) {
  console.log('🎨 ChatGPT Web Image Generator\n');
  console.log(`Prompt: "${IMAGE_PROMPT}"\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Generating image via ChatGPT Web API...');

    // Use page.evaluate to make the API call with proper CORS handling
    const response = await page.evaluate(async ({ token, prompt }) => {
      // ChatGPT's image generation endpoint
      const res = await fetch('https://chatgpt.com/backend-api/attributions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          prompt: prompt,
          model: 'dall-e-3',
          size: '1024x1024',
          quality: 'hd'
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API error ${res.status}: ${errorText}`);
      }

      return await res.json();
    }, { token, prompt: IMAGE_PROMPT });

    console.log('✅ Response received!');

    // Process response based on format
    if (response.data?.[0]?.b64_json) {
      const imageData = Buffer.from(response.data[0].b64_json, 'base64');
      await writeFile('./generated-image.png', imageData);
      console.log(`✅ Image saved to: generated-image.png (${(imageData.length / 1024).toFixed(1)} KB)`);
    } else if (response.data?.[0]?.url) {
      console.log(`📸 Image URL: ${response.data[0].url}`);
    } else {
      console.log('Response format:', JSON.stringify(response, null, 2).slice(0, 1000));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\nTip: Make sure your access token is valid and not expired.');
    console.log('Get a fresh token from: https://chatgpt.com/api/auth/session');
  } finally {
    await browser.close();
  }
}

// Parse CLI args
const args = process.argv.slice(2);
const tokenIndex = args.indexOf('--token');

if (tokenIndex !== -1 && args[tokenIndex + 1]) {
  generateWithToken(args[tokenIndex + 1]);
} else {
  generateImage();
}
