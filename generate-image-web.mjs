/**
 * Real Image Generation via ChatGPT Web Interface
 * Uses Playwright to interact with chatgpt.com directly
 */

import { chromium } from 'playwright';
import { writeFile } from 'fs/promises';

const IMAGE_PROMPT = "A serene Japanese garden with a red bridge over a koi pond, cherry blossoms falling, golden hour lighting, photorealistic, 4k";

async function generateImageViaWeb() {
  console.log('🎨 Generating Image via ChatGPT Web Interface\n');
  console.log(`Prompt: "${IMAGE_PROMPT}"\n`);

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox'
    ]
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 720 }
  });

  const page = await context.newPage();

  try {
    // Navigate to chatgpt.com
    console.log('1. Opening chatgpt.com...');
    await page.goto('https://chatgpt.com', { waitUntil: 'networkidle', timeout: 60000 });

    // Take screenshot to see current state
    await page.screenshot({ path: './chatgpt-step1.png' });
    console.log('   Screenshot saved: chatgpt-step1.png');

    // Check if we need to log in
    const isLoggedIn = await page.evaluate(() => {
      return !document.querySelector('[data-testid="login-button"]') &&
             !window.location.href.includes('/auth/login');
    });

    if (!isLoggedIn) {
      console.log('\n⚠️  Please log in to your ChatGPT account in the browser window.');
      console.log('   Press Enter in this terminal when logged in...');
      await new Promise(resolve => process.stdin.once('data', resolve));
    }

    // Wait for the chat interface to load
    console.log('\n2. Waiting for chat interface...');
    await page.waitForSelector('textarea, [contenteditable="true"]', { timeout: 30000 });
    await page.screenshot({ path: './chatgpt-step2.png' });
    console.log('   Screenshot saved: chatgpt-step2.png');

    // Type the image generation prompt
    console.log('\n3. Typing image prompt...');
    const inputField = await page.$('textarea, [contenteditable="true"]');
    if (inputField) {
      await inputField.click();
      await inputField.fill(IMAGE_PROMPT);
      await page.screenshot({ path: './chatgpt-step3.png' });
      console.log('   Screenshot saved: chatgpt-step3.png');
    }

    // Submit the prompt
    console.log('\n4. Submitting prompt...');
    const submitButton = await page.$('button[data-testid="send-button"], button[aria-label="Send prompt"]');
    if (submitButton) {
      await submitButton.click();
    } else {
      // Try pressing Enter
      await page.keyboard.press('Enter');
    }

    // Wait for response
    console.log('\n5. Waiting for image generation...');
    await page.waitForTimeout(10000);  // Wait for generation to start
    await page.screenshot({ path: './chatgpt-step4.png' });
    console.log('   Screenshot saved: chatgpt-step4.png');

    // Wait for image to appear
    console.log('\n6. Waiting for image to complete...');
    try {
      await page.waitForSelector('img[src*="dalle"], img[alt*="Generated"], .image-message', { timeout: 120000 });
      await page.screenshot({ path: './chatgpt-step5.png' });
      console.log('   Screenshot saved: chatgpt-step5.png');

      // Try to download the image
      const imageElement = await page.$('img[src*="dalle"], img[alt*="Generated"], .image-message img');
      if (imageElement) {
        const imageUrl = await imageElement.getAttribute('src');
        console.log(`\n   Image URL: ${imageUrl}`);

        // Download image
        const response = await page.evaluate(async (url) => {
          const res = await fetch(url);
          const blob = await res.blob();
          const buffer = await blob.arrayBuffer();
          return Array.from(new Uint8Array(buffer));
        }, imageUrl);

        const imageData = Buffer.from(response);
        await writeFile('./generated-image.png', imageData);
        console.log(`\n✅ Image saved to: generated-image.png (${(imageData.length / 1024).toFixed(1)} KB)`);
      }
    } catch (e) {
      console.log('   ⏳ Image still generating... taking final screenshot');
      await page.screenshot({ path: './chatgpt-final.png' });
      console.log('   Final screenshot saved: chatgpt-final.png');
    }

    console.log('\n🏁 Process complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: './chatgpt-error.png' });
    console.log('   Error screenshot saved: chatgpt-error.png');
  } finally {
    await browser.close();
  }
}

generateImageViaWeb();
