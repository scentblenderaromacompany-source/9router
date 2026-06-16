/**
 * Browser-based account registration system
 * Uses puppeteer-extra with stealth plugin for anti-detection
 */

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { createInbox, waitForMessage, extractVerificationCode } from './agentmail.js';

puppeteer.use(StealthPlugin());

function randomDelay(min = 500, max = 2000) {
  return new Promise((resolve) => setTimeout(resolve, min + Math.random() * (max - min)));
}

async function humanType(page, selector, text) {
  await page.click(selector);
  await randomDelay(200, 400);
  for (const char of text) {
    await page.keyboard.type(char, { delay: 50 + Math.random() * 100 });
  }
}

async function launchBrowser() {
  return puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-dev-shm-usage',
    ],
  });
}

/**
 * Use Z.AI as guest (no registration needed)
 */
export async function useZAIGuest() {
  console.log('Opening Z.AI as guest...');

  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    await page.goto('https://chat.z.ai', { waitUntil: 'networkidle2', timeout: 30000 });
    await randomDelay(2000, 3000);

    // Skip login
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, a'));
      btns.find(b => b.textContent?.includes('Sign in'))?.click();
    });
    await randomDelay(2000, 3000);
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, a'));
      btns.find(b => b.textContent?.includes('Continue with Email'))?.click();
    });
    await randomDelay(2000, 3000);
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, a'));
      btns.find(b => b.textContent?.includes('Skip for now'))?.click();
    });
    await randomDelay(3000, 5000);

    console.log('Z.AI ready for chat (guest mode)');
    return { page, browser };
  } catch (error) {
    await browser.close();
    throw error;
  }
}

/**
 * Send a message to Z.AI and get response
 */
export async function chatWithZAI(message) {
  const { page, browser } = await useZAIGuest();

  try {
    const textarea = await page.$('textarea');
    if (!textarea) throw new Error('Chat input not found');

    await textarea.click();
    await randomDelay();
    await page.keyboard.type(message, { delay: 30 });
    await randomDelay();
    await page.keyboard.press('Enter');

    console.log('Message sent, waiting for response...');
    await new Promise(r => setTimeout(r, 15000));

    const text = await page.evaluate(() => document.body.innerText);
    return text;
  } finally {
    await browser.close();
  }
}

/**
 * Register a new account on Z.AI (requires manual CAPTCHA solving)
 */
export async function registerZAI(email = null) {
  console.log('Registering new Z.AI account...');
  console.log('Note: Z.AI uses Alibaba Cloud CAPTCHA - manual solving required');

  let inbox = null;
  if (!email) {
    inbox = await createInbox('zai');
    email = inbox.email;
    console.log(`Created temp email: ${email}`);
  }

  const password = `Zai${Date.now()}!Secure`;
  const browser = await launchBrowser();

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    await page.goto('https://chat.z.ai', { waitUntil: 'networkidle2', timeout: 30000 });
    await randomDelay(2000, 4000);

    // Navigate to signup
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, a'));
      btns.find(b => b.textContent?.includes('Sign in'))?.click();
    });
    await randomDelay(2000, 3000);
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, a'));
      btns.find(b => b.textContent?.includes('Continue with Email'))?.click();
    });
    await randomDelay(2000, 3000);
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a, button'));
      links.find(b => b.textContent?.includes('Sign up'))?.click();
    });
    await randomDelay(2000, 3000);

    // Fill form
    await humanType(page, 'input[placeholder*="Name"]', 'Z.AI User');
    await randomDelay();
    await humanType(page, 'input[type="email"]', email);
    await randomDelay();
    await humanType(page, 'input[type="password"]', password);
    await randomDelay();

    // Click verification (CAPTCHA will appear)
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, div'));
      btns.find(b => b.textContent?.includes('Click to start verification'))?.click();
    });

    console.log('CAPTCHA displayed - manual solving required');
    console.log('Waiting 60s for CAPTCHA to be solved...');
    await new Promise(r => setTimeout(r, 60000));

    // Check if registered
    const url = page.url();
    console.log('Final URL:', url);

    return {
      email,
      password,
      provider: 'z-ai',
      method: 'puppeteer-stealth',
      inboxId: inbox?.inboxId,
      requiresCaptcha: true,
    };
  } finally {
    await browser.close();
  }
}

/**
 * Register a new account on ChatGPT (requires manual Turnstile solving)
 */
export async function registerChatGPT(email = null) {
  console.log('Registering new ChatGPT account...');

  let inbox = null;
  if (!email) {
    inbox = await createInbox('chatgpt');
    email = inbox.email;
  }

  const password = `Chatgpt${Date.now()}!Secure`;
  const browser = await launchBrowser();

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    await page.goto('https://chatgpt.com', { waitUntil: 'networkidle2', timeout: 30000 });
    await randomDelay(2000, 4000);

    const signUpBtn = await page.$('button:has-text("Sign up"), a:has-text("Sign up")');
    if (signUpBtn) await signUpBtn.click();
    await randomDelay();

    const emailInput = await page.$('input[type="email"]');
    if (emailInput) await humanType(page, 'input[type="email"]', email);
    await randomDelay();

    const continueBtn = await page.$('button:has-text("Continue")');
    if (continueBtn) await continueBtn.click();
    await randomDelay(5000);

    console.log('Turnstile challenge may appear - manual solving required');

    return {
      email,
      password,
      provider: 'chatgpt',
      method: 'puppeteer-stealth',
      inboxId: inbox?.inboxId,
      requiresCaptcha: true,
    };
  } finally {
    await browser.close();
  }
}

/**
 * Register a new account on Grok
 */
export async function registerGrok(email = null) {
  console.log('Registering new Grok account...');

  let inbox = null;
  if (!email) {
    inbox = await createInbox('grok');
    email = inbox.email;
  }

  const password = `Grok${Date.now()}!Secure`;
  const browser = await launchBrowser();

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    await page.goto('https://grok.com', { waitUntil: 'networkidle2', timeout: 30000 });
    await randomDelay(2000, 4000);

    const signUpBtn = await page.$('button:has-text("Sign up"), a:has-text("Sign up")');
    if (signUpBtn) await signUpBtn.click();
    await randomDelay();

    const emailInput = await page.$('input[type="email"]');
    if (emailInput) await humanType(page, 'input[type="email"]', email);
    await randomDelay();

    const passwordInput = await page.$('input[type="password"]');
    if (passwordInput) await humanType(page, 'input[type="password"]', password);
    await randomDelay();

    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) await submitBtn.click();
    await randomDelay(5000);

    return {
      email,
      password,
      provider: 'grok',
      method: 'puppeteer-stealth',
      inboxId: inbox?.inboxId,
    };
  } finally {
    await browser.close();
  }
}

export default {
  useZAIGuest,
  chatWithZAI,
  registerZAI,
  registerChatGPT,
  registerGrok,
};
