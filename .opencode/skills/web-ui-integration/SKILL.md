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
| `text2video` | Video generation |
| `image2video` | Image-to-video |
| `speech2text` | Audio transcription |
| `ocr` | Document/layout parsing |
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

## Traffic Interception for API Discovery

Use browser-harness to intercept web UI traffic and discover API endpoints, authentication patterns, and request formats.

### Basic Traffic Interception

```bash
browser-harness <<'PY'
import time

# Open the target site
new_tab("https://provider.com")
wait_for_load()
time.sleep(3)

# Install fetch interceptor
intercept_js = """
(function() {
    window._capturedRequests = [];
    
    // Patch fetch
    const origFetch = window.fetch;
    window.fetch = async function(...args) {
        const [url, options] = args;
        window._capturedRequests.push({
            type: 'fetch',
            url: typeof url === 'string' ? url : url?.url,
            method: options?.method || 'GET',
            headers: options?.headers,
            body: options?.body,
            time: Date.now()
        });
        return origFetch.apply(this, args);
    };
    
    // Patch XMLHttpRequest
    const origOpen = XMLHttpRequest.prototype.open;
    const origSend = XMLHttpRequest.prototype.send;
    const origSetHeader = XMLHttpRequest.prototype.setRequestHeader;
    
    XMLHttpRequest.prototype.open = function(method, url, ...rest) {
        this._method = method;
        this._url = url;
        this._headers = {};
        return origOpen.call(this, method, url, ...rest);
    };
    
    XMLHttpRequest.prototype.setRequestHeader = function(name, value) {
        if (this._headers) this._headers[name] = value;
        return origSetHeader.call(this, name, value);
    };
    
    XMLHttpRequest.prototype.send = function(body) {
        window._capturedRequests.push({
            type: 'xhr',
            url: this._url,
            method: this._method,
            headers: this._headers,
            body: body,
            time: Date.now()
        });
        return origSend.call(this, body);
    };
    
    return 'Interception ready';
})()
"""

js(intercept_js)

# Perform actions (type message, click buttons, etc.)
# ... user interactions ...

# Wait for requests
time.sleep(5)

# Get captured requests
requests = js("JSON.stringify(window._capturedRequests || [], null, 2)")
print(requests)
PY
```

### Analyze API Patterns

```bash
browser-harness <<'PY'
import time

# After capturing requests, analyze them
analyze_js = """
(function() {
    const requests = window._capturedRequests || [];
    
    // Group by endpoint
    const endpoints = {};
    requests.forEach(r => {
        const url = new URL(r.url, window.location.origin);
        const path = url.pathname;
        if (!endpoints[path]) endpoints[path] = [];
        endpoints[path].push({
            method: r.method,
            hasBody: !!r.body,
            bodyPreview: r.body ? r.body.substring(0, 200) : null,
            headers: r.headers
        });
    });
    
    // Find auth patterns
    const authPatterns = requests.filter(r => 
        r.headers?.Authorization || 
        r.headers?.authorization ||
        r.url.includes('token') ||
        r.url.includes('api_key')
    ).map(r => ({
        url: r.url.substring(0, 100),
        authHeader: r.headers?.Authorization || r.headers?.authorization,
        hasToken: r.url.includes('token')
    }));
    
    return JSON.stringify({
        totalRequests: requests.length,
        endpoints,
        authPatterns,
        uniqueMethods: [...new Set(requests.map(r => r.method))]
    }, null, 2;
})()
"""

analysis = js(analyze_js)
print(analysis)
PY
```

### Extract Request/Response Format

```bash
browser-harness <<'PY'
import time

# Capture full request details
capture_detail_js = """
(function() {
    const requests = window._capturedRequests || [];
    
    // Find chat/API completion requests
    const apiRequests = requests.filter(r => 
        r.url.includes('chat') || 
        r.url.includes('completion') ||
        r.url.includes('api')
    );
    
    return apiRequests.map(r => {
        let bodyParsed = null;
        try {
            bodyParsed = JSON.parse(r.body);
        } catch(e) {
            bodyParsed = r.body;
        }
        
        return {
            endpoint: r.url,
            method: r.method,
            requestBody: bodyParsed,
            headers: r.headers
        };
    });
})()
"""

details = js(capture_detail_js)
print(details)
PY
```

### Monitor Network via Performance API

```bash
browser-harness <<'PY'
# Use Performance API for all network entries
network_js = """
(function() {
    const entries = performance.getEntriesByType('resource');
    
    // Filter for API calls
    const apiCalls = entries.filter(e => {
        const name = e.name.toLowerCase();
        return name.includes('api') || 
               name.includes('chat') || 
               name.includes('completion') ||
               name.includes('graphql');
    }).map(e => ({
        url: e.name,
        type: e.initiatorType,
        duration: Math.round(e.duration),
        size: e.transferSize,
        status: e.responseStatus
    }));
    
    // Get XHR/fetch specifically
    const xhrFetch = entries.filter(e => 
        e.initiatorType === 'xmlhttprequest' || 
        e.initiatorType === 'fetch'
    ).map(e => ({
        url: e.name,
        type: e.initiatorType,
        duration: Math.round(e.duration),
        size: e.transferSize
    }));
    
    return JSON.stringify({
        apiCalls: apiCalls.slice(0, 20),
        xhrFetch: xhrFetch.slice(0, 20),
        totalEntries: entries.length
    }, null, 2);
})()
"""

print(js(network_js))
PY
```

### agent-browser Traffic Interception

Using [agent-browser](https://github.com/vercel-labs/agent-browser):

```bash
# Install agent-browser
npm install -g agent-browser
agent-browser install

# Open site and capture network
agent-browser open https://provider.com
agent-browser snapshot -i

# Execute JS to intercept
agent-browser js "
window._requests = [];
const origFetch = window.fetch;
window.fetch = async (...args) => {
    window._requests.push({url: args[0], opts: args[1]});
    return origFetch(...args);
};
"

# Perform actions, then check
agent-browser js "JSON.stringify(window._requests, null, 2)"
```

### Real-World Example: Z.AI Traffic Analysis

```bash
browser-harness <<'PY'
import time

# Open Z.AI
new_tab("https://chat.z.ai")
wait_for_load()
time.sleep(3)

# Close any modals
js("""(function() {
    const btn = document.querySelector('[role="dialog"] svg')?.closest('button');
    if (btn) btn.click();
    return 'done';
})()""")
time.sleep(1)

# Install interceptor
js("""(function() {
    window._captured = [];
    const orig = window.fetch;
    window.fetch = async (...args) => {
        window._captured.push({
            url: typeof args[0] === 'string' ? args[0] : args[0]?.url,
            method: args[1]?.method || 'GET',
            body: args[1]?.body
        });
        return orig(...args);
    };
    return 'ready';
})()""")

# Send a message
js("""(function() {
    const inp = document.getElementById('chat-input');
    const btn = document.getElementById('send-message-button');
    if (inp && btn) {
        inp.value = 'Hello';
        inp.dispatchEvent(new Event('input', {bubbles: true}));
        btn.click();
        return 'sent';
    }
    return 'not found';
})()""")

time.sleep(5)

# Get results
requests = js("JSON.stringify(window._captured, null, 2)")
print("API Endpoints Discovered:")
print(requests)

# Result showed:
# - POST /api/v2/chat/completions (web UI endpoint)
# - Query params: token, user_id, requestId, etc.
# - Body: model, messages, stream, features, variables
PY
```

### Key Patterns to Capture

| Pattern | What to Look For |
|---------|------------------|
| **Authentication** | Bearer tokens, API keys, cookies, JWT |
| **Endpoints** | URL paths, query parameters |
| **Request Body** | JSON structure, required fields |
| **Headers** | Content-Type, custom headers |
| **Streaming** | SSE, WebSocket connections |
| **Error Responses** | Error codes, messages |

### Export Findings

After intercepting traffic, document findings:

```markdown
## API Discovery: [Provider Name]

### Endpoints
- **Chat**: `POST /api/v1/chat/completions`
- **Image**: `POST /api/v1/images/generate`

### Authentication
- Header: `Authorization: Bearer <token>`
- Token stored in: `localStorage.token`

### Request Format
```json
{
  "model": "model-id",
  "messages": [...],
  "stream": true
}
```

### Notes
- Requires CAPTCHA for anonymous users
- JWT token expires after 24 hours
```

## Multi-Endpoint Providers

Some providers (like Z.AI) expose multiple API endpoints for different services. Here's how to implement them:

### Z.AI Example (Complete)

Z.AI provides endpoints for:
- **Chat**: `/paas/v4/chat/completions`
- **Image Generation**: `/paas/v4/images/generations`
- **Video Generation**: `/paas/v4/videos/generations`
- **Audio Transcription**: `/paas/v4/audio/transcriptions`
- **OCR/Layout**: `/paas/v4/layout_parsing`
- **Web Search**: `/paas/v4/web_search`
- **Web Reader**: `/paas/v4/reader`
- **Tokenizer**: `/paas/v4/tokenizer`

### Executor Pattern for Multi-Endpoint

```javascript
buildUrl(model, stream, urlIndex = 0, credentials = null) {
  const baseUrl = credentials?.providerSpecificData?.baseUrl || this.config.baseUrl;
  const endpoint = this._getEndpoint(model, credentials);
  return `${baseUrl}${endpoint}`;
}

_getEndpoint(model, credentials) {
  // Check for explicit endpoint override
  const endpointType = credentials?.providerSpecificData?.endpointType;
  if (endpointType) {
    const endpoints = {
      'chat': '/chat/completions',
      'image': '/images/generations',
      'video': '/videos/generations',
      'audio': '/audio/transcriptions',
      'ocr': '/layout_parsing',
      'web-search': '/web_search',
      'web-reader': '/reader',
    };
    return endpoints[endpointType] || '/chat/completions';
  }

  // Auto-detect from model name
  if (model?.includes('image') || model?.includes('cogview')) {
    return '/images/generations';
  }
  if (model?.includes('video') || model?.includes('cogvideo')) {
    return '/videos/generations';
  }
  if (model?.includes('asr') || model?.includes('audio')) {
    return '/audio/transcriptions';
  }
  
  return '/chat/completions';
}

transformRequest(model, body, stream, credentials) {
  const endpointType = credentials?.providerSpecificData?.endpointType || 
                       this._guessEndpointType(model, body);
  
  switch (endpointType) {
    case 'image': return this._transformImageRequest(body, model);
    case 'video': return this._transformVideoRequest(body, model);
    case 'audio': return this._transformAudioRequest(body);
    default: return this._transformChatRequest(model, body, stream);
  }
}
```

### Provider Registry for Multi-Endpoint

```javascript
models: [
  // Chat models
  { id: "glm-5.1", name: "GLM-5.1", capabilities: ["text", "tools"] },
  
  // Vision models
  { id: "glm-5v-turbo", name: "GLM-5V Turbo", capabilities: ["text", "vision", "tools"], kind: "image" },
  
  // Image generation
  { id: "glm-image", name: "GLM-Image", capabilities: ["text2img"], kind: "image" },
  
  // Video generation
  { id: "cogvideox-3", name: "CogVideoX-3", capabilities: ["text2video"], kind: "video" },
  
  // Audio
  { id: "glm-asr-2512", name: "GLM-ASR-2512", capabilities: ["speech2text"], kind: "audio" },
  
  // OCR
  { id: "glm-ocr", name: "GLM-OCR", capabilities: ["ocr"], kind: "image" },
],
serviceKinds: ["llm", "image", "video", "audio"],
```

## Captured Traffic Reference

### ChatGPT Web (Captured 2026-06-16)

**Main Endpoint:**
```
POST https://chatgpt.com/backend-anon/f/conversation
```

**Required Headers:**
```javascript
{
  "accept": "text/event-stream",
  "content-type": "application/json",
  "oai-client-build-number": "7511904",
  "oai-client-version": "prod-a5747f44f9bfe551e0bc9db0a31f22a497f6568a",
  "oai-device-id": "<uuid>",
  "oai-language": "en-US",
  "oai-session-id": "<uuid>",
  "openai-sentinel-chat-requirements-token": "<jwt>",
  "openai-sentinel-proof-token": "<base64>",
  "openai-sentinel-turnstile-token": "<base64>",
  "x-conduit-token": "<jwt>",
  "x-oai-turn-trace-id": "<uuid>",
  "x-openai-target-path": "/backend-api/f/conversation"
}
```

**Token Acquisition Flow:**
1. GET `/backend-anon/f/conversation/prepare` → `conduit_token`
2. GET `/backend-anon/sentinel/chat-requirements/prepare` → `prepare_token`
3. Complete Turnstile challenge
4. GET `/backend-anon/sentinel/chat-requirements/finalize` → `sentinel token`
5. POST `/backend-anon/f/conversation` with all tokens

**Response Format (SSE):**
```javascript
event: delta
data: {"p": "", "o": "add", "v": {"message": {"content": {"parts": ["Response"]}}}}

data: [DONE]
```

**Key Findings:**
- Free tier uses GPT-5.5 (not GPT-4o)
- Anonymous access supported
- Tokens expire in ~60 seconds
- Cloudflare Turnstile required

### Z.AI Web (Captured 2026-06-16)

**Auth Endpoint:**
```
GET https://chat.z.ai/api/v1/auths/
```

**Create Chat:**
```
POST https://chat.z.ai/api/v1/chats/new
```

**Chat Completion (Blocked by CAPTCHA):**
```
POST https://chat.z.ai/api/v2/chat/completions
```

**Required Headers:**
```javascript
{
  "authorization": "Bearer <jwt-token>",
  "x-fe-version": "prod-fe-1.1.54",
  "x-signature": "<signature-hash>"
}
```

**Key Findings:**
- Guest JWT token from `/api/v1/auths/`
- Alibaba Cloud CAPTCHA blocks automated access
- CAPTCHA tokens are single-use
- Developer API recommended for programmatic access

## Checklist

- [ ] Provider registry created with models and auth config
- [ ] Executor created with buildUrl, buildHeaders, transformRequest
- [ ] Executor registered in `executors/index.js`
- [ ] Provider registered in `providers/registry/index.js`
- [ ] CLI tool definition added to `cliTools.js`
- [ ] Test suite created and passing
- [ ] Documentation created (setup guide)
- [ ] Image generation support added (if applicable)
- [ ] Multi-endpoint support added (if applicable)
- [ ] Browser automation tested (if applicable)
- [ ] Changes committed on feature branch
- [ ] Branch pushed to fork
