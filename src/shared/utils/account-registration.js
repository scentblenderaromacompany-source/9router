/**
 * Browser-based account registration system
 * Uses puppeteer-extra with stealth plugin for anti-detection
 * Uses Flare Solver to bypass Cloudflare/anti-bot protection
 */

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { createInbox, waitForMessage, extractVerificationCode } from './agentmail.js';

puppeteer.use(StealthPlugin());

// Flare Solver configuration
const FLARE_SOLVER_URL = process.env.FLARE_SOLVER_URL || 'https://flaresolverr-5rki.onrender.com';

/**
 * Flare Solver helper - bypasses Cloudflare and anti-bot protection
 * Handles Render free tier hibernation (503) with retry
 */
async function flareRequest(body, timeout = 90000) {
  const maxRetries = 2;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(`${FLARE_SOLVER_URL}/v1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, maxTimeout: timeout }),
        signal: AbortSignal.timeout(timeout + 15000),
      });

      // Render returns 503 when waking from hibernation
      if (res.status === 503) {
        console.log(`Flare Solver waking from hibernation (attempt ${attempt + 1})...`);
        await new Promise(r => setTimeout(r, 10000));
        continue;
      }

      if (!res.ok) throw new Error(`Flare Solver HTTP ${res.status}`);
      const data = await res.json();
      if (data.status !== 'ok') throw new Error(`Flare Solver: ${data.message}`);
      return data.solution;
    } catch (err) {
      if (attempt < maxRetries) {
        console.log(`Flare Solver retry ${attempt + 1}: ${err.message}`);
        await new Promise(r => setTimeout(r, 5000));
      } else {
        throw err;
      }
    }
  }
}

async function flareGet(url, session = 'deepseek') {
  return flareRequest({ cmd: 'request.get', url, session });
}

async function flarePost(url, postData, session = 'deepseek') {
  return flareRequest({ cmd: 'request.post', url, postData, session });
}

async function flareDestroySession(session = 'deepseek') {
  try {
    await fetch(`${FLARE_SOLVER_URL}/v1`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cmd: 'sessions.destroy', session }),
      signal: AbortSignal.timeout(10000),
    });
  } catch {}
}

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

/**
 * Create a temporary email inbox (agentmail with mail.tm fallback)
 */
async function createTempInbox(prefix = '') {
  // Try agentmail first
  try {
    const inbox = await createInbox(prefix);
    return { provider: 'agentmail', inboxId: inbox.inboxId, email: inbox.email };
  } catch (e) {
    console.log(`Agentmail unavailable (${e.message}), trying mail.tm...`);
  }

  // Fallback to mail.tm
  const domainRes = await fetch('https://api.mail.tm/domains');
  const domainData = await domainRes.json();
  const domain = domainData['hydra:member']?.[0]?.domain;
  if (!domain) throw new Error('No temp email domains available');

  const addr = `${prefix || 'tmp'}${Date.now()}@${domain}`;
  const pass = `Tmp${Date.now()}!`;
  const accountRes = await fetch('https://api.mail.tm/accounts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address: addr, password: pass }),
  });
  if (!accountRes.ok) throw new Error(`mail.tm account creation failed: ${accountRes.status}`);
  const account = await accountRes.json();

  // Get auth token for polling
  const tokenRes = await fetch('https://api.mail.tm/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address: addr, password: pass }),
  });
  const tokenData = await tokenRes.json();

  return {
    provider: 'mailtm',
    inboxId: account.id,
    email: addr,
    token: tokenData.token,
  };
}

async function pollTempEmail(tempInbox, timeout = 60000) {
  if (tempInbox.provider === 'agentmail') {
    return await waitForMessage(tempInbox.inboxId, timeout);
  }

  // mail.tm polling
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch('https://api.mail.tm/messages', {
        headers: { Authorization: `Bearer ${tempInbox.token}` },
      });
      const data = await res.json();
      if (data['hydra:member']?.length > 0) {
        const msgId = data['hydra:member'][0].id;
        const msgRes = await fetch(`https://api.mail.tm/messages/${msgId}`, {
          headers: { Authorization: `Bearer ${tempInbox.token}` },
        });
        return await msgRes.json();
      }
    } catch {}
    await new Promise(r => setTimeout(r, 3000));
  }
  throw new Error('Timeout waiting for verification email');
}

/**
 * Register a new account on DeepSeek using Flare Solver
 * Bypasses Cloudflare and Turnstile protection automatically
 */
export async function registerDeepSeek(email = null) {
  console.log('Registering new DeepSeek account via Flare Solver...');

  let tempInbox = null;
  if (!email) {
    tempInbox = await createTempInbox('deepseek');
    email = tempInbox.email;
    console.log(`Created temp email (${tempInbox.provider}): ${email}`);
  }

  const password = `Deep${Date.now()}!Seek`;
  const session = `deepseek-register-${Date.now()}`;

  try {
    // Step 1: Load sign-in page via Flare Solver (bypasses Cloudflare)
    console.log('Loading DeepSeek sign-in page...');
    const page = await flareGet('https://chat.deepseek.com/sign_in', session);
    console.log(`Page loaded: ${page.url} (status ${page.status})`);

    // Extract cookies
    const cookies = page.cookies || [];
    const cookieStr = cookies.map(c => `${c.name}=${c.value}`).join('; ');
    console.log(`Got ${cookies.length} cookies`);

    // Step 2: Submit login form via Flare Solver
    console.log('Submitting login form...');
    const loginResult = await flarePost(
      'https://chat.deepseek.com/api/user/login',
      JSON.stringify({ email, password }),
      session
    );

    console.log(`Login response status: ${loginResult.status}`);

    // Parse response
    let userToken = null;
    if (loginResult.response) {
      try {
        const body = JSON.parse(loginResult.response);
        console.log(`API response code: ${body.code}`);

        if (body.code === 0) {
          userToken = body.data?.biz_data?.token || body.data?.token;
          console.log('Login successful!');
        } else if (body.code === 40003) {
          console.log('Account does not exist - registration required');
        } else {
          console.log(`Login response: ${body.msg || JSON.stringify(body).substring(0, 200)}`);
        }
      } catch {
        console.log('Non-JSON response:', loginResult.response.substring(0, 200));
      }
    }

    // Check cookies for token
    const loginCookies = loginResult?.cookies || [];
    if (!userToken) {
      const tokenCookie = loginCookies.find(c =>
        c.name === 'userToken' || c.name === 'token' || c.name === 'ds_user_token'
      );
      if (tokenCookie) {
        userToken = tokenCookie.value;
        console.log('Got token from cookie!');
      }
    }

    // Step 3: If login failed (account doesn't exist), try signup
    if (!userToken) {
      console.log('Attempting signup...');
      try {
        const signupResult = await flarePost(
          'https://chat.deepseek.com/api/user/register',
          JSON.stringify({ email, password, name: 'AI User' }),
          session
        );

        if (signupResult.response) {
          try {
            const body = JSON.parse(signupResult.response);
            console.log(`Signup response: code=${body.code}, msg=${body.msg}`);

            if (body.code === 0) {
              console.log('Registration successful! Attempting login...');
              // Try login again
              const retryLogin = await flarePost(
                'https://chat.deepseek.com/api/user/login',
                JSON.stringify({ email, password }),
                session
              );
              if (retryLogin.response) {
                const retryBody = JSON.parse(retryLogin.response);
                userToken = retryBody.data?.biz_data?.token || retryBody.data?.token;
              }
            }
          } catch {
            console.log('Signup non-JSON:', signupResult.response.substring(0, 200));
          }
        }
      } catch (e) {
        console.log(`Signup failed: ${e.message}`);
      }
    }

    // Step 4: Handle email verification if needed
    if (tempInbox && !userToken) {
      console.log('Checking for verification email...');
      try {
        const msg = await pollTempEmail(tempInbox, 60000);
        const code = extractVerificationCode(msg.text);
        if (code) {
          console.log(`Verification code: ${code}`);
          await flarePost(
            'https://chat.deepseek.com/api/user/verify',
            JSON.stringify({ email, code }),
            session
          );
          console.log('Verification submitted');

          // Try login after verification
          const verifyLogin = await flarePost(
            'https://chat.deepseek.com/api/user/login',
            JSON.stringify({ email, password }),
            session
          );
          if (verifyLogin.response) {
            const vBody = JSON.parse(verifyLogin.response);
            userToken = vBody.data?.biz_data?.token || vBody.data?.token;
          }
        }
      } catch (e) {
        console.log(`Verification check failed: ${e.message}`);
      }
    }

    console.log(`\n=== RESULT ===`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`USER_TOKEN: ${userToken ? 'EXTRACTED' : 'NOT FOUND'}`);
    if (userToken) console.log(`Token preview: ${userToken.substring(0, 30)}...`);

    return {
      email,
      password,
      provider: 'deepseek-web',
      method: 'flare-solver',
      userToken,
      inboxId: inbox?.inboxId,
      requiresCaptcha: !userToken,
    };
  } finally {
    await flareDestroySession(session);
  }
}

/**
 * Login to existing DeepSeek account using Flare Solver
 * Tries direct API login first, falls back to Puppeteer for manual login
 */
export async function loginDeepSeek(email = null, password = null) {
  console.log('Logging into DeepSeek...');
  const session = `deepseek-login-${Date.now()}`;

  // Method 1: Try Flare Solver for direct login
  if (email && password) {
    console.log('Attempting direct login via Flare Solver...');
    try {
      // First load the page to get cookies/CSRF
      await flareGet('https://chat.deepseek.com/sign_in', session);

      const solution = await flarePost(
        'https://chat.deepseek.com/api/user/login',
        JSON.stringify({ email, password }),
        session
      );

      let userToken = null;

      // Check response body
      if (solution.response) {
        try {
          const body = JSON.parse(solution.response);
          if (body.code === 0) {
            userToken = body.data?.biz_data?.token || body.data?.token;
          }
        } catch {}
      }

      // Check cookies
      if (!userToken) {
        const cookies = solution?.cookies || [];
        const tokenCookie = cookies.find(c =>
          c.name === 'userToken' || c.name === 'token' || c.name === 'ds_user_token'
        );
        if (tokenCookie) userToken = tokenCookie.value;
      }

      if (userToken) {
        console.log('Login successful via Flare Solver!');
        return { provider: 'deepseek-web', userToken, success: true, method: 'flare-solver' };
      }

      console.log('Direct login did not return token');
    } catch (e) {
      console.log(`Flare Solver login failed: ${e.message}`);
    }
  }

  // Method 2: Fallback to Puppeteer with manual login
  console.log('Falling back to Puppeteer for manual login...');
  const browser = await launchBrowser();

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    await page.goto('https://chat.deepseek.com', { waitUntil: 'networkidle2', timeout: 30000 });

    console.log('Please log in manually in the browser window (up to 5 minutes)...');
    let userToken = null;

    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 5000));
      try {
        userToken = await page.evaluate(() =>
          localStorage.getItem('userToken') || localStorage.getItem('USER_TOKEN')
        );
      } catch {}
      if (userToken) break;
    }

    return {
      provider: 'deepseek-web',
      userToken,
      success: !!userToken,
      method: 'puppeteer-manual',
    };
  } finally {
    await browser.close();
    await flareDestroySession(session);
  }
}

export default {
  useZAIGuest,
  chatWithZAI,
  registerZAI,
  registerChatGPT,
  registerGrok,
  registerDeepSeek,
  loginDeepSeek,
};
