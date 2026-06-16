---
name: web-ui-integration
description: Use when creating Web UI integrations (like ChatGPT Web, Grok Web, etc.) in 9Router. Also use when continuing GitHub Copilot sessions, managing forks, or rebasing on upstream. Covers executor creation, provider registry, test suites, and documentation.
---

# Web UI Integration Skill

Use this skill when building native Web UI integrations in 9Router. Also covers continuing GitHub Copilot sessions and fork workflows.

## Architecture Overview

9Router integrates Web UI providers through two core components:

```
Provider Registry (metadata)  →  Provider definition, models, auth config
         ↓
Executor (logic)              →  HTTP requests, auth, request transformation
         ↓
Index Registration            →  Register in executors/index.js and providers/registry/index.js
```

## Step 1: Create Provider Registry

Create `open-sse/providers/registry/<provider-id>.js`:

```javascript
export default {
  id: "provider-id",
  priority: 140,  // Higher = preferred (140-160 for web providers)
  alias: "short-alias",
  aliases: ["alt"],
  uiAlias: "ui",
  display: {
    name: "Provider Display Name",
    icon: "auto_awesome",
    color: "#HEXCOLOR",
    textIcon: "ABC",
    website: "https://provider.com",
    notice: {
      signupUrl: "https://provider.com/signup",
    },
    kindNotice: {
      image: "Requires account with web access. Uses subscription quota.",
    },
  },
  category: "webCookie",  // or "api" for API key providers
  authType: "cookie",     // or "apikey"
  authHint: "Paste your access token from...",
  transport: {
    baseUrl: "http://localhost:PORT/v1",
    format: "openai",     // Most web providers use OpenAI format
    authType: "apikey",   // How the executor sends auth
  },
  models: [
    { id: "model-id", name: "Model Name", capabilities: ["text", "vision", "tools"] },
    { id: "image-model", name: "Image Model", capabilities: ["text2img"], kind: "image" },
  ],
  passthroughModels: true,  // Allow custom models
  serviceKinds: ["llm", "image"],
  hasProviderSpecificData: false,
};
```

### Model Capabilities Reference

| Capability | Description |
|------------|-------------|
| `text` | Text generation |
| `vision` | Image understanding |
| `tools` | Function/tool calling |
| `text2img` | Image generation |
| `edit` | Image editing |

### Common Priority Values

- 160-180: Official API providers (OpenAI, Anthropic)
- 140-160: Web UI integrations (ChatGPT Web, Grok Web)
- 120-140: Third-party proxies
- 100-120: Local providers (Ollama)

## Step 2: Create Executor

Create `open-sse/executors/<provider-id>.js`:

```javascript
import { BaseExecutor } from "./base.js";
import { PROVIDERS } from "../config/providers.js";

export class ProviderExecutor extends BaseExecutor {
  constructor() {
    super("provider-id", PROVIDERS["provider-id"] || {
      baseUrl: "http://localhost:PORT/v1",
      format: "openai"
    });
  }

  /**
   * Build API endpoint URL
   * @param {string} model - Model ID
   * @param {boolean} stream - Streaming enabled
   * @param {number} urlIndex - URL rotation index
   * @param {object} credentials - User credentials
   * @returns {string} Full API URL
   */
  buildUrl(model, stream, urlIndex = 0, credentials = null) {
    const baseUrl = credentials?.providerSpecificData?.baseUrl ||
                    this.config.baseUrl ||
                    "http://localhost:PORT/v1";
    const normalized = baseUrl.trim().replace(/\/$/, "");

    // Some providers have different endpoints for streaming
    const endpoint = stream ? "/chat/completions" : "/chat/completions";
    return `${normalized}${endpoint}`;
  }

  /**
   * Build request headers with authentication
   * @param {object} credentials - User credentials
   * @param {boolean} stream - Streaming enabled
   * @returns {object} Headers object
   */
  buildHeaders(credentials, stream = true) {
    const headers = {
      "Content-Type": "application/json",
    };

    // Support both accessToken and apiKey
    const token = credentials?.apiKey || credentials?.accessToken;
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    if (stream) {
      headers["Accept"] = "text/event-stream";
    }

    return headers;
  }

  /**
   * Transform request body to provider format
   * @param {string} model - Model ID
   * @param {object} body - Request body
   * @param {boolean} stream - Streaming enabled
   * @param {object} credentials - User credentials
   * @returns {object} Transformed request body
   */
  transformRequest(model, body, stream, credentials) {
    const transformed = {
      model: body.model || model,
      messages: body.messages || [],
      stream: stream !== undefined ? stream : body.stream ?? false,
    };

    // Preserve standard OpenAI parameters
    if (body.temperature !== undefined) transformed.temperature = body.temperature;
    if (body.max_tokens !== undefined) transformed.max_tokens = body.max_tokens;
    if (body.top_p !== undefined) transformed.top_p = body.top_p;
    if (body.frequency_penalty !== undefined) transformed.frequency_penalty = body.frequency_penalty;
    if (body.presence_penalty !== undefined) transformed.presence_penalty = body.presence_penalty;

    // Tool/function calling support
    if (body.tools) transformed.tools = body.tools;
    if (body.tool_choice) transformed.tool_choice = body.tool_choice;

    // Vision support
    if (body.vision_detail) transformed.vision_detail = body.vision_detail;

    return transformed;
  }
}
```

### Executor Method Reference

| Method | Purpose | Required |
|--------|---------|----------|
| `buildUrl()` | Construct API endpoint | Yes |
| `buildHeaders()` | Set auth and content headers | Yes |
| `transformRequest()` | Convert request to provider format | Yes |
| `execute()` | Full request lifecycle (inherited) | No |

## Step 3: Register in Indexes

### Executor Index (`open-sse/executors/index.js`)

```javascript
// Add import at top
import { ProviderExecutor } from "./provider-id.js";

// Add to executors object
const executors = {
  // ... existing executors
  "provider-id": new ProviderExecutor(),
};

// Add export at bottom
export { ProviderExecutor } from "./provider-id.js";
```

### Provider Registry Index (`open-sse/providers/registry/index.js`)

```javascript
// Add import (use next available p-number)
import p40b from "./provider-id.js";

// Add to export array (maintain order)
export default [
  // ... existing providers
  p40b,
  // ...
];
```

## Step 4: Add CLI Tool Definition

Add to `src/shared/constants/cliTools.js`:

```javascript
export const CLI_TOOLS = {
  // ... existing tools
  provider_id: {
    id: "provider-id",
    name: "Provider Display Name",
    icon: "terminal",
    color: "#HEXCOLOR",
    description: "Provider integration description",
    configType: "guide",
    notes: [
      {
        type: "info",
        text: "Description of the provider integration.",
      },
    ],
    guideSteps: [
      {
        step: 1,
        title: "Get Access Token",
        desc: "Visit provider.com/api/auth/session and copy token.",
      },
      {
        step: 2,
        title: "Add Provider",
        desc: "Go to Providers → Add New → Select Provider",
      },
    ],
    codeBlock: {
      language: "json",
      code: `{
  "provider": "provider-id",
  "model": "model-id",
  "accessToken": "<your-token>"
}`,
    },
  },
};
```

## Step 5: Create Test Suite

Create `test-<provider-id>.mjs`:

```javascript
import { ProviderExecutor } from './open-sse/executors/provider-id.js';

console.log('🧪 Provider Integration Tests\n');

// Test 1: Executor instantiation
console.log('Test 1: Executor Instantiation');
try {
  const executor = new ProviderExecutor();
  console.log('✅ Executor instantiated');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 2: Build URL
console.log('\nTest 2: Build URL');
try {
  const executor = new ProviderExecutor();
  const url = executor.buildUrl('model-id', true, 0, null);
  console.log(`✅ URL: ${url}`);
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 3: Build headers
console.log('\nTest 3: Build Headers');
try {
  const executor = new ProviderExecutor();
  const headers = executor.buildHeaders({ accessToken: 'test-token' }, true);
  console.log(`✅ Headers:`, Object.keys(headers));
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 4: Transform request
console.log('\nTest 4: Transform Request');
try {
  const executor = new ProviderExecutor();
  const body = { messages: [{ role: 'user', content: 'Hello' }] };
  const transformed = executor.transformRequest('model-id', body, true);
  console.log(`✅ Transformed:`, Object.keys(transformed));
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

// Test 5: Inheritance check
console.log('\nTest 5: Inheritance Check');
try {
  const executor = new ProviderExecutor();
  if (typeof executor.execute === 'function') console.log('✅ Has execute()');
  if (typeof executor.buildUrl === 'function') console.log('✅ Has buildUrl()');
  if (typeof executor.buildHeaders === 'function') console.log('✅ Has buildHeaders()');
  if (typeof executor.transformRequest === 'function') console.log('✅ Has transformRequest()');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}

console.log('\n✅ All tests passed!\n');
```

Run tests:
```bash
node test-<provider-id>.mjs
```

## Step 6: Create Documentation

Create `PROVIDER_NAME_WEB_SETUP.md`:

```markdown
# Provider Web Integration Setup

## Quick Start

### Step 1: Get Access Token
Visit: https://provider.com/api/auth/session (while logged in)
Copy the `accessToken` value

### Step 2: Add Provider
Go to **9Router Dashboard** → **Providers** → **Add Provider Name**
Paste your access token

### Step 3: Use Models
Select `model-id` from the model dropdown. Tools and function calling work automatically!

## Configuration

### Minimal
```json
{
  "provider": "provider-id",
  "accessToken": "<your-token>"
}
```

### Full
```json
{
  "provider": "provider-id",
  "accessToken": "<your-token>",
  "providerSpecificData": {
    "baseUrl": "http://localhost:8700/v1",
    "apiType": "chat"
  }
}
```

## Troubleshooting

**Q: "401 Unauthorized"**
A: Get fresh token from provider.com/api/auth/session

**Q: "Connection refused"**
A: Ensure the provider's proxy or API is running

**Q: "Tools not being invoked"**
A: Use models that support tools (check capabilities)
```

## Fork Workflow

### Initial Setup

```bash
# Fork on GitHub UI, then clone
git clone https://github.com/YOUR-USER/9router.git
cd 9router

# Add upstream remote
git remote add upstream https://github.com/decolua/9router.git

# Verify remotes
git remote -v
# origin    https://github.com/YOUR-USER/9router (fetch/push)
# upstream  https://github.com/decolua/9router (fetch/push)
```

### Creating Feature Branch

```bash
# Always work on feature branches, not master
git checkout master
git pull upstream master
git checkout -b feature/your-feature

# Make changes, commit
git add .
git commit -m "feat: add provider integration"
git push origin feature/your-feature
```

### Syncing with Upstream

```bash
# 1. Fetch upstream changes
git fetch upstream

# 2. Update master
git checkout master
git rebase upstream/master
git push origin master --force-with-lease

# 3. Rebase your feature branch
git checkout feature/your-feature
git rebase master

# 4. Force push (safe after rebase)
git push origin feature/your-feature --force-with-lease
```

### Conflict Resolution

```bash
# If rebase has conflicts
git rebase upstream/master

# Edit conflicted files, then:
git add <resolved-files>
git rebase --continue

# Or abort if needed
git rebase --abort
```

## Continuing GitHub Copilot Sessions

When resuming a Copilot session:

1. **Check git status** for uncommitted changes
2. **Read modified files** to understand current state
3. **Run existing tests** to verify what works
4. **Continue from last logical break point**

```bash
# Quick status check
git status
git log --oneline -5
git diff --stat

# Find uncommitted work
git status --short
```

## File Structure Reference

```
open-sse/
├── executors/
│   ├── index.js                    # Register executor here
│   ├── base.js                     # BaseExecutor class
│   └── <provider-id>.js           # Your executor
└── providers/
    └── registry/
        ├── index.js                # Register provider here
        └── <provider-id>.js       # Your provider definition

src/shared/constants/
└── cliTools.js                     # CLI tool definitions

test-<provider-id>.mjs             # Test suite
<PROVIDER_NAME>_SETUP.md           # User documentation
```

## Image Generation

Web UI providers often support image generation (DALL-E, etc.). The executor must pass image-specific parameters:

### Add Image Parameters to Executor

```javascript
// In transformRequest method
if (body.size) transformed.size = body.size;           // '1024x1024', '1792x1024', etc.
if (body.quality) transformed.quality = body.quality;   // 'standard', 'hd'
if (body.style) transformed.style = body.style;         // 'vivid', 'natural'
if (body.response_format) transformed.response_format = body.response_format; // 'url', 'b64_json'
```

### Image Generation Request

```javascript
const body = executor.transformRequest('dall-e-3', {
  messages: [{ role: 'user', content: 'A sunset over mountains' }],
  size: '1024x1024',
  quality: 'hd',
  style: 'vivid'
}, false, credentials);
```

### Test Image Generation

```bash
node test-image-generation.mjs
node generate-image-direct.mjs --token YOUR_TOKEN
```

## Browser Automation with browser-harness

Use [browser-harness](https://github.com/browser-use/browser-harness) for browser-based tasks (login flows, web scraping, UI testing).

### Installation

```bash
# Install uv (Python package manager)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install browser-harness
uv tool install browser-harness

# Verify
browser-harness --version
browser-harness --doctor
```

### Cloud Browser (Recommended)

No local Chrome needed. Get a free API key:

1. Visit https://cloud.browser-use.com/new-api-key
2. Sign up for free tier (3 concurrent browsers)
3. Set the key:
   ```bash
   export BROWSER_USE_API_KEY=your-key-here
   ```

### Generate Image via Cloud Browser

**Option A: Free (No Login Required) - Pollinations.ai**

```bash
# Direct URL - generates image automatically
curl -L -o image.png "https://image.pollinations.ai/prompt/YOUR_PROMPT?width=1024&height=1024&nologo=true"
```

Or with browser-harness:
```bash
browser-harness <<'PY'
prompt = "A serene Japanese garden with cherry blossoms"
encoded = prompt.replace(" ", "%20")
url = f"https://image.pollinations.ai/prompt/{encoded}?width=1024&height=1024&nologo=true"
new_tab(url)
wait_for_load()
time.sleep(10)
capture_screenshot("/tmp/generated.png")
PY
```

**Option B: ChatGPT (Requires Login)**

```bash
# Create browser
BU_AUTOSPAWN=1 browser-harness <<'PY'
daemon = start_remote_daemon("image-gen", timeout=300)
print(f"Browser URL: {daemon}")
PY

# Connect and use (replace BROWSER_ID)
export BU_CDP_WS="wss://BROWSER_ID.cdp.browser-use.com"
browser-harness <<'PY'
import time
new_tab("https://chatgpt.com")
wait_for_load()
time.sleep(3)
# ... login flow ...
# ... generate image ...
PY
```

### Local Chrome (Way 2)

Launch Chrome with remote debugging:

```bash
# Linux
chromium-browser --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-debug

# macOS
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222

# Windows
chrome.exe --remote-debugging-port=9222
```

Then use browser-harness:

```bash
browser-harness <<'PY'
new_tab("https://chatgpt.com")
wait_for_load()
print(page_info())
PY
```

### Useful browser-harness Commands

```bash
# Check connection
browser-harness --doctor

# Page info
browser-harness <<'PY'
print(page_info())
PY

# Screenshot
browser-harness <<'PY'
capture_screenshot("/tmp/screenshot.png")
PY

# JavaScript execution
browser-harness <<'PY'
result = js("return document.title")
print(result)
PY

# Click at coordinates
browser-harness <<'PY'
click_at_xy(100, 200)
PY
```

## Checklist

- [ ] Provider registry created with models and auth config
- [ ] Executor created with buildUrl, buildHeaders, transformRequest
- [ ] Executor registered in `executors/index.js`
- [ ] Provider registered in `providers/registry/index.js`
- [ ] CLI tool definition added to `cliTools.js`
- [ ] Test suite created and passing
- [ ] Documentation created (setup guide)
- [ ] Image generation support added (if applicable)
- [ ] Browser automation tested (if applicable)
- [ ] Changes committed on feature branch
- [ ] Branch pushed to fork
