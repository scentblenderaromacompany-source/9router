/**
 * Browser-based account registration system
 * Uses browser-harness for automated sign-up on AI providers
 */

import { createInbox, waitForMessage, extractVerificationCode, deleteInbox } from './agentmail.js';
import { execSync } from 'child_process';

/**
 * Execute a browser-harness script
 * @param {string} script - Browser-harness script to execute
 * @returns {string} Output from browser-harness
 */
function executeBrowserScript(script) {
  try {
    const result = execSync(`browser-harness <<'PY'\n${script}\nPY`, {
      encoding: 'utf-8',
      timeout: 60000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return result;
  } catch (error) {
    console.error('Browser script error:', error.message);
    return null;
  }
}

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

  // Browser script for Z.AI registration
  const browserScript = `
ensure_real_tab()
goto_url("https://chat.z.ai")
wait_for_load()
wait(3)

# Click sign in button
js("""(function() {
  const btn = document.querySelector('[aria-label="Sign in"]') ||
              Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Sign in'));
  if (btn) {
    btn.click();
    return 'Clicked sign in';
  }
  return 'No sign in button found';
})()""")
wait(2)

# Click sign up button
js("""(function() {
  const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Sign up'));
  if (btn) {
    btn.click();
    return 'Clicked sign up';
  }
  return 'No sign up button found';
})()""")
wait(2)

# Fill in email using native setter
js("""(function() {
  const input = document.querySelector('input[type="email"]');
  if (input) {
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    nativeInputValueSetter.call(input, '${email}');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    return 'Email filled';
  }
  return 'No email input found';
})()""")

# Fill in password
js("""(function() {
  const input = document.querySelector('input[type="password"]');
  if (input) {
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    nativeInputValueSetter.call(input, '${password}');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    return 'Password filled';
  }
  return 'No password input found';
})()""")

# Click create account button
js("""(function() {
  const btn = Array.from(document.querySelectorAll('button')).find(b => 
    b.textContent.includes('Create Account') || 
    b.textContent.includes('Sign up') ||
    b.textContent.includes('Register')
  );
  if (btn) {
    btn.click();
    return 'Clicked create account';
  }
  return 'No create account button found';
})()""")
wait(5)

# Get current URL
url = js("window.location.href")
print(f"Final URL: {url}")
`;

  console.log('🌐 Opening browser for Z.AI registration...');
  const result = executeBrowserScript(browserScript);
  console.log('Browser output:', result);

  // Wait for verification email
  if (inbox) {
    console.log('📧 Waiting for verification email...');
    try {
      const message = await waitForMessage(inbox.inboxId, 60000);
      console.log('📧 Received verification email:', message.subject);
      
      // Extract verification code
      const code = extractVerificationCode(message.text);
      if (code) {
        console.log(`📧 Verification code: ${code}`);
      }
    } catch (error) {
      console.log('⚠️ No verification email received (may not be required)');
    }
  }

  return {
    email,
    password,
    provider: 'z-ai',
    method: 'browser-automation',
    inboxId: inbox?.inboxId,
    instructions: [
      '1. Check browser for registration status',
      '2. Complete any CAPTCHA if prompted',
      '3. Check email for verification',
      '4. Copy access token from DevTools → Network → Authorization header',
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

  // Browser script for ChatGPT registration
  const browserScript = `
ensure_real_tab()
goto_url("https://chatgpt.com")
wait_for_load()
wait(3)

# Click sign up button
js("""(function() {
  const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Sign up'));
  if (btn) {
    btn.click();
    return 'Clicked sign up';
  }
  return 'No sign up button found';
})()""")
wait(2)

# Fill in email using native setter
js("""(function() {
  const input = document.querySelector('input[type="email"]');
  if (input) {
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    nativeInputValueSetter.call(input, '${email}');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    return 'Email filled';
  }
  return 'No email input found';
})()""")

# Click continue button
js("""(function() {
  const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Continue'));
  if (btn) {
    btn.click();
    return 'Clicked continue';
  }
  return 'No continue button found';
})()""")
wait(5)

# Get current URL
url = js("window.location.href")
print(f"Final URL: {url}")
`;

  console.log('🌐 Opening browser for ChatGPT registration...');
  const result = executeBrowserScript(browserScript);
  console.log('Browser output:', result);

  // Wait for verification email
  if (inbox) {
    console.log('📧 Waiting for verification email...');
    try {
      const message = await waitForMessage(inbox.inboxId, 60000);
      console.log('📧 Received verification email:', message.subject);
      
      // Extract verification code
      const code = extractVerificationCode(message.text);
      if (code) {
        console.log(`📧 Verification code: ${code}`);
      }
    } catch (error) {
      console.log('⚠️ No verification email received');
    }
  }

  return {
    email,
    password,
    provider: 'chatgpt',
    method: 'browser-automation',
    inboxId: inbox?.inboxId,
    instructions: [
      '1. Check browser for registration status',
      '2. Enter verification code if prompted',
      '3. Complete profile (name, age)',
      '4. Copy access token from DevTools → Application → Local Storage → session',
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

  // Browser script for Grok registration
  const browserScript = `
ensure_real_tab()
goto_url("https://grok.com")
wait_for_load()
wait(3)

# Click sign up button
js("""(function() {
  const btns = document.querySelectorAll('button');
  for (const btn of btns) {
    if (btn.textContent?.includes('Sign up') || btn.textContent?.includes('Create')) {
      btn.click();
      return 'Clicked sign up';
    }
  }
  return 'No sign up button found';
})()""")
wait(2)

# Fill in email using native setter
js("""(function() {
  const input = document.querySelector('input[type="email"]');
  if (input) {
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    nativeInputValueSetter.call(input, '${email}');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    return 'Email filled';
  }
  return 'No email input found';
})()""")

# Fill in password
js("""(function() {
  const input = document.querySelector('input[type="password"]');
  if (input) {
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    nativeInputValueSetter.call(input, '${password}');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    return 'Password filled';
  }
  return 'No password input found';
})()""")

# Click submit button
js("""(function() {
  const btn = Array.from(document.querySelectorAll('button')).find(b => 
    b.textContent.includes('Submit') || 
    b.textContent.includes('Create') ||
    b.textContent.includes('Sign up')
  );
  if (btn) {
    btn.click();
    return 'Clicked submit';
  }
  return 'No submit button found';
})()""")
wait(5)

# Get current URL
url = js("window.location.href")
print(f"Final URL: {url}")
`;

  console.log('🌐 Opening browser for Grok registration...');
  const result = executeBrowserScript(browserScript);
  console.log('Browser output:', result);

  // Wait for verification email
  if (inbox) {
    console.log('📧 Waiting for verification email...');
    try {
      const message = await waitForMessage(inbox.inboxId, 60000);
      console.log('📧 Received verification email:', message.subject);
      
      // Extract verification link
      const link = extractVerificationCode(message.text);
      if (link) {
        console.log(`📧 Verification code: ${link}`);
      }
    } catch (error) {
      console.log('⚠️ No verification email received');
    }
  }

  return {
    email,
    password,
    provider: 'grok',
    method: 'browser-automation',
    inboxId: inbox?.inboxId,
    instructions: [
      '1. Check browser for registration status',
      '2. Complete email verification if prompted',
      '3. Copy sso cookie from DevTools → Application → Cookies → sso',
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

export default {
  registerZAI,
  registerChatGPT,
  registerGrok,
  batchRegister,
};
