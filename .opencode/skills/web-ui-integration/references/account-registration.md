# Account Registration Reference

## Overview
Automated account registration system for AI providers using browser-harness and agentmail.

## Architecture

```
agentmail.js (temp email)  →  Create inbox, receive verification
         ↓
account-registration.js   →  Browser automation for sign-up
         ↓
browser-harness           →  Execute registration scripts
```

## Dependencies

### agentmail
- API: https://api.agentmail.to/v0
- Purpose: Temporary email addresses for verification
- No API key required for basic usage

### browser-harness
- Purpose: Browser automation for sign-up flows
- Install: `uv tool install browser-harness`

## Usage

### Single Account Registration

```javascript
import { registerZAI, registerChatGPT, registerGrok } from './account-registration.js';

// Register on Z.AI
const zaiAccount = await registerZAI();
console.log(zaiAccount);
// {
//   email: 'zai-xxxxx@agentmail.to',
//   password: 'Zai123456789!Secure',
//   provider: 'z-ai',
//   instructions: [...]
// }

// Register on ChatGPT
const chatgptAccount = await registerChatGPT();

// Register on Grok
const grokAccount = await registerGrok();
```

### Batch Registration

```javascript
import { batchRegister } from './account-registration.js';

const accounts = await batchRegister([
  { provider: 'z-ai', count: 5 },
  { provider: 'chatgpt', count: 3 },
  { provider: 'grok', count: 2 },
]);

console.log(`Created ${accounts.length} accounts`);
```

### Generate Browser Script

```javascript
import { generateRegistrationScript } from './account-registration.js';

const script = generateRegistrationScript(
  'z-ai',
  'user@example.com',
  'SecurePassword123!'
);

// Execute with browser-harness
// browser-harness <<'PY'
// ${script}
// PY
```

## Provider-Specific Instructions

### Z.AI Registration

1. Open https://chat.z.ai
2. Click "Sign in" button
3. Click "Sign up" or "Create account"
4. Enter email address
5. Enter password
6. Complete CAPTCHA verification
7. Check email for verification link
8. Click verification link
9. Access token available in DevTools

### ChatGPT Registration

1. Open https://chatgpt.com
2. Click "Sign up" button
3. Enter email address
4. Enter password
5. Complete email verification
6. Access token in DevTools → Application → Local Storage

### Grok Registration

1. Open https://grok.com
2. Click "Sign up" or "Create account"
3. Enter email address
4. Enter password
5. Complete email verification
6. sso cookie in DevTools → Application → Cookies

## Automated Flow

### Step 1: Create Temporary Email
```javascript
const inbox = await createInbox('zai');
// { inboxId: '...', email: 'zai-xxxxx@agentmail.to' }
```

### Step 2: Register Account
```javascript
// Execute browser automation
await executeRegistration('z-ai', inbox.email, password);
```

### Step 3: Wait for Verification Email
```javascript
const message = await waitForMessage(inbox.inboxId, 60000);
// { id: '...', subject: 'Verify your email', text: '...' }
```

### Step 4: Extract Verification Link
```javascript
const link = extractVerificationLink(message.text);
// 'https://chat.z.ai/verify?token=...'
```

### Step 5: Complete Verification
```javascript
// Open verification link in browser
goto_url(link);
wait_for_load();
```

### Step 6: Extract Access Token
```javascript
// From browser DevTools or local storage
const token = js("localStorage.getItem('token')");
```

### Step 7: Cleanup
```javascript
await deleteInbox(inbox.inboxId);
```

## Browser-Harness Scripts

### Z.AI Registration Script
```bash
browser-harness <<'PY'
ensure_real_tab()
goto_url("https://chat.z.ai")
wait_for_load()
wait(2)

# Click sign in
js("""(function() {
  const btn = document.querySelector('[aria-label="Sign in"]');
  if (btn) btn.click();
  return 'done';
})()""")
wait(2)

# Fill email
js("""(function() {
  const input = document.querySelector('input[type="email"]');
  if (input) {
    input.value = 'user@agentmail.to';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }
  return 'done';
})()""")

# Fill password
js("""(function() {
  const input = document.querySelector('input[type="password"]');
  if (input) {
    input.value = 'SecurePass123!';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }
  return 'done';
})()""")

# Click submit
js("""(function() {
  const btn = document.querySelector('button[type="submit"]');
  if (btn) btn.click();
  return 'done';
})()""")
wait(5)
PY
```

### ChatGPT Registration Script
```bash
browser-harness <<'PY'
ensure_real_tab()
goto_url("https://chatgpt.com/auth/signup")
wait_for_load()
wait(2)

# Fill email
js("""(function() {
  const input = document.querySelector('input[name="email"]');
  if (input) {
    input.value = 'user@agentmail.to';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }
  return 'done';
})()""")

# Fill password
js("""(function() {
  const input = document.querySelector('input[name="password"]');
  if (input) {
    input.value = 'SecurePass123!';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }
  return 'done';
})()""")

# Click continue
js("""(function() {
  const btn = document.querySelector('button[type="submit"]');
  if (btn) btn.click();
  return 'done';
})()""")
wait(5)
PY
```

## Limitations

- CAPTCHA may block automated registration
- Email verification required for most providers
- Rate limits on temp email creation
- Some providers require phone verification
- Browser automation may be detected

## Security Notes

- Use unique passwords for each account
- Store credentials securely
- Rotate accounts if rate limited
- Monitor for account suspensions
- Respect provider terms of service
