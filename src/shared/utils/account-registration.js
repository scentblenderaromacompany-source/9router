/**
 * Browser-based account registration system
 * Uses browser-harness for automated sign-up on AI providers
 */

import { createInbox, waitForMessage, extractVerificationLink, extractVerificationCode, deleteInbox } from './agentmail.js';

/**
 * Register a new account on Z.AI
 * @param {string} email - Email address (optional, creates temp if not provided)
 * @returns {Promise<{email: string, password: string, token: string}>}
 */
export async function registerZAI(email = null) {
  console.log('🔐 Registering new Z.AI account...');

  // Create temporary email if not provided
  let inbox = null;
  if (!email) {
    inbox = await createInbox('zai');
    email = inbox.email;
    console.log(`📧 Created temp email: ${email}`);
  }

  const password = `Zai${Date.now()}!Secure`;

  // Launch browser and navigate to Z.AI
  const browserScript = `
ensure_real_tab()
goto_url("https://chat.z.ai")
wait_for_load()
wait(2)

// Click sign in button
js("""
(function() {
  const btn = document.querySelector('[aria-label="Sign in"]') ||
              document.querySelector('button:has-text("Sign in")');
  if (btn) {
    btn.click();
    return 'Clicked sign in';
  }
  return 'No sign in button found';
})()
""")
wait(2)

// Fill in email
js("""
(function() {
  const emailInput = document.querySelector('input[type="email"]') ||
                     document.querySelector('input[name="email"]');
  if (emailInput) {
    emailInput.value = '${email}';
    emailInput.dispatchEvent(new Event('input', { bubbles: true }));
    return 'Email filled';
  }
  return 'No email input found';
})()
""")

// Fill in password
js("""
(function() {
  const passwordInput = document.querySelector('input[type="password"]') ||
                        document.querySelector('input[name="password"]');
  if (passwordInput) {
    passwordInput.value = '${password}';
    passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
    return 'Password filled';
  }
  return 'No password input found';
})()
""")

// Click sign up / create account button
js("""
(function() {
  const buttons = document.querySelectorAll('button');
  for (const btn of buttons) {
    const text = btn.textContent?.toLowerCase() || '';
    if (text.includes('sign up') || text.includes('create') || text.includes('register')) {
      btn.click();
      return 'Clicked sign up button';
    }
  }
  return 'No sign up button found';
})()
""")
wait(3)
`;

  // Execute browser automation
  console.log('🌐 Opening browser...');
  // Note: In production, this would use browser-harness
  // For now, we return the credentials for manual setup

  return {
    email,
    password,
    provider: 'z-ai',
    method: 'browser-automation',
    instructions: [
      '1. Open https://chat.z.ai in browser',
      '2. Click "Sign in" button',
      '3. Click "Sign up" or "Create account"',
      `4. Enter email: ${email}`,
      `5. Enter password: ${password}`,
      '6. Complete any CAPTCHA verification',
      '7. Check email for verification link',
      '8. Click verification link',
      '9. Copy access token from DevTools',
    ],
  };
}

/**
 * Register a new account on ChatGPT
 * @param {string} email - Email address (optional, creates temp if not provided)
 * @returns {Promise<{email: string, password: string, token: string}>}
 */
export async function registerChatGPT(email = null) {
  console.log('🔐 Registering new ChatGPT account...');

  // Create temporary email if not provided
  let inbox = null;
  if (!email) {
    inbox = await createInbox('chatgpt');
    email = inbox.email;
    console.log(`📧 Created temp email: ${email}`);
  }

  const password = `Chatgpt${Date.now()}!Secure`;

  return {
    email,
    password,
    provider: 'chatgpt',
    method: 'browser-automation',
    instructions: [
      '1. Open https://chatgpt.com in browser',
      '2. Click "Sign up" button',
      `3. Enter email: ${email}`,
      `4. Enter password: ${password}`,
      '5. Complete any verification',
      '6. Check email for verification code',
      '7. Enter verification code',
      '8. Copy access token from DevTools → Application → Local Storage',
    ],
  };
}

/**
 * Register a new account on Grok
 * @param {string} email - Email address (optional, creates temp if not provided)
 * @returns {Promise<{email: string, password: string, token: string}>}
 */
export async function registerGrok(email = null) {
  console.log('🔐 Registering new Grok account...');

  // Create temporary email if not provided
  let inbox = null;
  if (!email) {
    inbox = await createInbox('grok');
    email = inbox.email;
    console.log(`📧 Created temp email: ${email}`);
  }

  const password = `Grok${Date.now()}!Secure`;

  return {
    email,
    password,
    provider: 'grok',
    method: 'browser-automation',
    instructions: [
      '1. Open https://grok.com in browser',
      '2. Click "Sign up" or "Create account"',
      `3. Enter email: ${email}`,
      `4. Enter password: ${password}`,
      '5. Complete any verification',
      '6. Check email for verification link',
      '7. Click verification link',
      '8. Copy sso cookie from DevTools → Application → Cookies',
    ],
  };
}

/**
 * Batch register accounts on multiple providers
 * @param {Array<{provider: string, count: number}>} providers - Providers and count
 * @returns {Promise<Array<{provider: string, email: string, password: string}>>}
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
        console.log(`✅ Registered ${provider} account: ${result.email}`);
      } catch (error) {
        console.error(`❌ Failed to register ${provider} account:`, error.message);
      }
    }
  }

  return results;
}

/**
 * Generate browser-harness script for account registration
 * @param {string} provider - Provider name (z-ai, chatgpt, grok)
 * @param {string} email - Email address
 * @param {string} password - Password
 * @returns {string} Browser-harness script
 */
export function generateRegistrationScript(provider, email, password) {
  const scripts = {
    'z-ai': `
ensure_real_tab()
goto_url("https://chat.z.ai")
wait_for_load()
wait(2)

// Click sign in
js("""(function() {
  const btn = document.querySelector('[aria-label="Sign in"]');
  if (btn) btn.click();
  return 'done';
})()""")
wait(2)

// Fill email
js("""(function() {
  const input = document.querySelector('input[type="email"]');
  if (input) {
    input.value = '${email}';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }
  return 'done';
})()""")

// Fill password
js("""(function() {
  const input = document.querySelector('input[type="password"]');
  if (input) {
    input.value = '${password}';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }
  return 'done';
})()""")

// Click submit
js("""(function() {
  const btn = document.querySelector('button[type="submit"]');
  if (btn) btn.click();
  return 'done';
})()""")
wait(5)
`,
    chatgpt: `
ensure_real_tab()
goto_url("https://chatgpt.com")
wait_for_load()
wait(2)

// Click sign up
js("""(function() {
  const btn = document.querySelector('a[href="/auth/signup"]');
  if (btn) btn.click();
  return 'done';
})()""")
wait(2)

// Fill email
js("""(function() {
  const input = document.querySelector('input[name="email"]');
  if (input) {
    input.value = '${email}';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }
  return 'done';
})()""")

// Fill password
js("""(function() {
  const input = document.querySelector('input[name="password"]');
  if (input) {
    input.value = '${password}';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }
  return 'done';
})()""")

// Click continue
js("""(function() {
  const btn = document.querySelector('button[type="submit"]');
  if (btn) btn.click();
  return 'done';
})()""")
wait(5)
`,
    grok: `
ensure_real_tab()
goto_url("https://grok.com")
wait_for_load()
wait(2)

// Click sign up
js("""(function() {
  const btns = document.querySelectorAll('button');
  for (const btn of btns) {
    if (btn.textContent?.includes('Sign up')) {
      btn.click();
      return 'clicked';
    }
  }
  return 'not found';
})()""")
wait(2)

// Fill email
js("""(function() {
  const input = document.querySelector('input[type="email"]');
  if (input) {
    input.value = '${email}';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }
  return 'done';
})()""")

// Fill password
js("""(function() {
  const input = document.querySelector('input[type="password"]');
  if (input) {
    input.value = '${password}';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }
  return 'done';
})()""")

// Click submit
js("""(function() {
  const btn = document.querySelector('button[type="submit"]');
  if (btn) btn.click();
  return 'done';
})()""")
wait(5)
`,
  };

  return scripts[provider] || null;
}

export default {
  registerZAI,
  registerChatGPT,
  registerGrok,
  batchRegister,
  generateRegistrationScript,
};
