/**
 * Browser-based account registration system
 * Uses puppeteer-extra with stealth plugin for anti-detection
 */

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { createInbox, waitForMessage, extractVerificationCode, deleteInbox } from './agentmail.js';

puppeteer.use(StealthPlugin());

/**
 * Random delay to simulate human behavior
 */
function randomDelay(min = 500, max = 2000) {
  return new Promise((resolve) => setTimeout(resolve, min + Math.random() * (max - min)));
}

/**
 * Type text with human-like delays
 */
async function humanType(page, selector, text) {
  await page.click(selector);
  for (const char of text) {
    await page.keyboard.type(char, { delay: 50 + Math.random() * 100 });
  }
}

/**
 * Launch stealth browser
 */
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
 * Register a new account on Z.AI
 */
export async function registerZAI(email = null) {
  console.log('Registering new Z.AI account...');

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

    console.log('Opening Z.AI...');
    await page.goto('https://chat.z.ai', { waitUntil: 'networkidle2', timeout: 30000 });
    await randomDelay(2000, 4000);

    // Click sign in
    const signInBtn = await page.$('button[aria-label="Sign in"], button:has-text("Sign in")');
    if (signInBtn) {
      await signInBtn.click();
      await randomDelay();
    }

    // Click sign up
    const signUpBtn = await page.$('button:has-text("Sign up"), a:has-text("Sign up")');
    if (signUpBtn) {
      await signUpBtn.click();
      await randomDelay();
    }

    // Fill email
    const emailInput = await page.$('input[type="email"], input[name="email"]');
    if (emailInput) {
      await humanType(page, 'input[type="email"], input[name="email"]', email);
      await randomDelay();
    }

    // Fill password
    const passwordInput = await page.$('input[type="password"]');
    if (passwordInput) {
      await humanType(page, 'input[type="password"]', password);
      await randomDelay();
    }

    // Click submit
    const submitBtn = await page.$('button[type="submit"], button:has-text("Create Account"), button:has-text("Sign up")');
    if (submitBtn) {
      await submitBtn.click();
      await randomDelay(3000, 5000);
    }

    console.log('Registration submitted. Check for CAPTCHA...');

    // Wait for verification email if using temp email
    if (inbox) {
      try {
        const message = await waitForMessage(inbox.inboxId, 60000);
        console.log('Received verification email:', message.subject);
        const code = extractVerificationCode(message.text);
        if (code) console.log(`Verification code: ${code}`);
      } catch {
        console.log('No verification email received');
      }
    }

    return {
      email,
      password,
      provider: 'z-ai',
      method: 'puppeteer-stealth',
      inboxId: inbox?.inboxId,
    };
  } finally {
    await browser.close();
  }
}

/**
 * Register a new account on ChatGPT
 */
export async function registerChatGPT(email = null) {
  console.log('Registering new ChatGPT account...');

  let inbox = null;
  if (!email) {
    inbox = await createInbox('chatgpt');
    email = inbox.email;
    console.log(`Created temp email: ${email}`);
  }

  const password = `Chatgpt${Date.now()}!Secure`;
  const browser = await launchBrowser();

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    console.log('Opening ChatGPT...');
    await page.goto('https://chatgpt.com', { waitUntil: 'networkidle2', timeout: 30000 });
    await randomDelay(2000, 4000);

    // Click sign up
    const signUpBtn = await page.$('button:has-text("Sign up"), a:has-text("Sign up")');
    if (signUpBtn) {
      await signUpBtn.click();
      await randomDelay();
    }

    // Fill email
    const emailInput = await page.$('input[type="email"], input[name="email"]');
    if (emailInput) {
      await humanType(page, 'input[type="email"], input[name="email"]', email);
      await randomDelay();
    }

    // Click continue
    const continueBtn = await page.$('button:has-text("Continue"), button[type="submit"]');
    if (continueBtn) {
      await continueBtn.click();
      await randomDelay(3000, 5000);
    }

    console.log('Registration submitted. Check for Turnstile challenge...');

    if (inbox) {
      try {
        const message = await waitForMessage(inbox.inboxId, 60000);
        console.log('Received verification email:', message.subject);
        const code = extractVerificationCode(message.text);
        if (code) console.log(`Verification code: ${code}`);
      } catch {
        console.log('No verification email received');
      }
    }

    return {
      email,
      password,
      provider: 'chatgpt',
      method: 'puppeteer-stealth',
      inboxId: inbox?.inboxId,
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
    console.log(`Created temp email: ${email}`);
  }

  const password = `Grok${Date.now()}!Secure`;
  const browser = await launchBrowser();

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    console.log('Opening Grok...');
    await page.goto('https://grok.com', { waitUntil: 'networkidle2', timeout: 30000 });
    await randomDelay(2000, 4000);

    // Click sign up
    const signUpBtn = await page.$('button:has-text("Sign up"), a:has-text("Sign up"), button:has-text("Create")');
    if (signUpBtn) {
      await signUpBtn.click();
      await randomDelay();
    }

    // Fill email
    const emailInput = await page.$('input[type="email"], input[name="email"]');
    if (emailInput) {
      await humanType(page, 'input[type="email"], input[name="email"]', email);
      await randomDelay();
    }

    // Fill password
    const passwordInput = await page.$('input[type="password"]');
    if (passwordInput) {
      await humanType(page, 'input[type="password"]', password);
      await randomDelay();
    }

    // Click submit
    const submitBtn = await page.$('button[type="submit"], button:has-text("Submit"), button:has-text("Create")');
    if (submitBtn) {
      await submitBtn.click();
      await randomDelay(3000, 5000);
    }

    console.log('Registration submitted...');

    if (inbox) {
      try {
        const message = await waitForMessage(inbox.inboxId, 60000);
        console.log('Received verification email:', message.subject);
        const code = extractVerificationCode(message.text);
        if (code) console.log(`Verification code: ${code}`);
      } catch {
        console.log('No verification email received');
      }
    }

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

/**
 * Batch register accounts on multiple providers
 */
export async function batchRegister(providers) {
  const results = [];

  for (const { provider, count } of providers) {
    for (let i = 0; i < count; i++) {
      try {
        let result;
        switch (provider) {
          case 'z-ai':
            result = await registerZAI();
            break;
          case 'chatgpt':
            result = await registerChatGPT();
            break;
          case 'grok':
            result = await registerGrok();
            break;
          default:
            console.warn(`Unknown provider: ${provider}`);
            continue;
        }
        results.push(result);
        console.log(`Registered ${provider} account: ${result.email}`);
      } catch (error) {
        console.error(`Failed to register ${provider} account:`, error.message);
      }
    }
  }

  return results;
}

export default {
  registerZAI,
  registerChatGPT,
  registerGrok,
  batchRegister,
};
