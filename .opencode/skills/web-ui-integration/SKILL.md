---
name: web-ui-integration
description: Use when creating Web UI integrations (like ChatGPT Web, Z.AI, Grok Web, Claude Web, DeepSeek Web) in 9Router. Covers executor creation, provider registry, traffic interception, browser automation, and test suites.
license: MIT
compatibility: opencode
metadata:
  audience: developers
  workflow: 9router
---

# Web UI Integration Skill

Use this skill when building native Web UI integrations in 9Router.

## Architecture

```
Provider Registry → Executor → Index Registration
```

Two core components:
- **Provider Registry** (`open-sse/providers/registry/<id>.js`): Metadata, models, auth config
- **Executor** (`open-sse/executors/<id>.js`): HTTP requests, auth, request transformation

## Quick Start

### 1. Create Provider Registry

```javascript
// open-sse/providers/registry/<provider-id>.js
export default {
  id: "provider-id",
  priority: 140,
  alias: "short",
  display: {
    name: "Provider Name",
    icon: "auto_awesome",
    color: "#HEXCOLOR",
    website: "https://provider.com",
  },
  category: "webCookie",
  authType: "cookie",
  transport: {
    baseUrl: "http://localhost:PORT/v1",
    format: "openai",
  },
  models: [
    { id: "model-id", name: "Model Name", capabilities: ["text", "vision", "tools"] },
  ],
  passthroughModels: true,
  serviceKinds: ["llm"],
};
```

### 2. Create Executor

```javascript
// open-sse/executors/<provider-id>.js
import { BaseExecutor } from "./base.js";
import { PROVIDERS } from "../config/providers.js";

export class ProviderExecutor extends BaseExecutor {
  constructor() {
    super("provider-id", PROVIDERS["provider-id"] || {
      baseUrl: "http://localhost:PORT/v1",
      format: "openai"
    });
  }

  buildUrl(model, stream, urlIndex = 0, credentials = null) {
    const baseUrl = credentials?.providerSpecificData?.baseUrl || this.config.baseUrl;
    return `${baseUrl.trim().replace(/\/$/, "")}/chat/completions`;
  }

  buildHeaders(credentials, stream = true) {
    const headers = { "Content-Type": "application/json" };
    const token = credentials?.apiKey || credentials?.accessToken;
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (stream) headers["Accept"] = "text/event-stream";
    return headers;
  }

  transformRequest(model, body, stream, credentials) {
    const transformed = {
      model: body.model || model,
      messages: body.messages || [],
      stream: stream ?? body.stream ?? false,
    };
    if (body.temperature !== undefined) transformed.temperature = body.temperature;
    if (body.max_tokens !== undefined) transformed.max_tokens = body.max_tokens;
    if (body.tools) transformed.tools = body.tools;
    return transformed;
  }
}
```

### 3. Register in Indexes

**Executor Index** (`open-sse/executors/index.js`):
```javascript
import { ProviderExecutor } from "./provider-id.js";
const executors = { "provider-id": new ProviderExecutor() };
export { ProviderExecutor } from "./provider-id.js";
```

**Provider Registry Index** (`open-sse/providers/registry/index.js`):
```javascript
import p40b from "./provider-id.js";
export default [/* existing */, p40b];
```

### 4. Add CLI Tool Definition

Add to `src/shared/constants/cliTools.js`:
```javascript
provider_id: {
  id: "provider-id",
  name: "Provider Name",
  icon: "terminal",
  color: "#HEXCOLOR",
  description: "Provider description",
  configType: "guide",
  guideSteps: [
    { step: 1, title: "Get Token", desc: "Visit provider.com/api/auth/session" },
    { step: 2, title: "Add Provider", desc: "Go to Providers → Add New" },
  ],
}
```

### 5. Create Test Suite

```javascript
// test-<provider-id>.mjs
import { ProviderExecutor } from './open-sse/executors/provider-id.js';

const executor = new ProviderExecutor();
const url = executor.buildUrl('model-id', true, 0, null);
const headers = executor.buildHeaders({ accessToken: 'test' }, true);
console.log('✅ All tests passed');
```

## Provider Status

| Provider | Guest Mode | Registration | CAPTCHA Type |
|----------|-----------|--------------|--------------|
| **Z.AI** | ✅ Works (Skip login) | Alibaba Cloud slider | Manual required |
| **Claude** | ❌ Login required | Session Key cookie | N/A |
| **ChatGPT** | ❌ Login required | Turnstile | Manual required |
| **Grok** | ❌ Login required | SSO-based | N/A |
| **DeepSeek** | ❌ Login required | User Token (local storage) | N/A |

## Z.AI Integration

### Guest Mode (No Registration)

Z.AI works without login via "Skip for now" button:

```javascript
import { useZAIGuest, chatWithZAI } from './src/shared/utils/account-registration.js';

// Method 1: Get browser page
const { page, browser } = await useZAIGuest();
// Use page for chat...

// Method 2: Send message and get response
const response = await chatWithZAI('Hello, what model are you?');
console.log(response);
```

### Browser Automation Flow

```
1. goto("https://chat.z.ai")
2. Click "Sign in" → "Continue with Email" → "Skip for now"
3. Type in textarea → Press Enter
4. Wait 15-20s for response
```

### Traffic Interception

Z.AI API endpoints (from traffic analysis):

```
POST /api/v2/chat/completions
Authorization: Bearer <guest-token>
```

## Claude Web Integration

### Authentication

Claude requires a `sessionKey` cookie from the browser:

1. Login to https://claude.ai
2. Open Developer Tools (F12) → Application → Cookies
3. Find `sessionKey` cookie value
4. Use as `apiKey` in provider config

### API Endpoints

```
GET  /api/organizations                           # Get organization ID
POST /api/organizations/{org_id}/chat_conversations  # Create conversation
POST /api/organizations/{org_id}/chat_conversations/{conv_id}/completion  # Send message
```

### Request Format

```json
{
  "prompt": "Human: Hello\n\nAssistant:",
  "timezone": "UTC",
  "model": "claude-sonnet-4-6-20260214"
}
```

### Available Models

| Model ID | Name |
|----------|------|
| `claude-sonnet-4-6` | Claude Sonnet 4.6 |
| `claude-opus-4-6` | Claude Opus 4.6 |
| `claude-haiku-4-5` | Claude Haiku 4.5 |
| `claude-sonnet-4` | Claude Sonnet 4 |
| `claude-opus-4` | Claude Opus 4 |
| `claude-3-5-sonnet` | Claude 3.5 Sonnet |
| `claude-3-5-haiku` | Claude 3.5 Haiku |

### Usage Example

```javascript
// Provider config
{
  "provider": "claude-web",
  "model": "claude-sonnet-4-6",
  "apiKey": "<your-session-key>"
}
```

## DeepSeek Web Integration

### Authentication

DeepSeek requires a `USER_TOKEN` from browser local storage:

1. Login to https://chat.deepseek.com
2. Open Developer Tools (F12) → Application → Local Storage
3. Find `chat.deepseek.com` → copy the `USER_TOKEN` value
4. Use as `apiKey` in provider config

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v0/chat/completion` | POST | Send chat message (SSE streaming) |
| `/api/v0/chat_session/create` | POST | Create new session |
| `/api/v0/chat_session/delete` | POST | Delete session |
| `/api/v0/chat/history_messages` | GET | Get chat history |
| `/api/v0/file/upload_file` | POST | Upload file |
| `/api/v0/file/fetch_files` | GET | Query file status |
| `/api/v0/client/settings` | GET | Get model settings |
| `/api/v0/chat/create_pow_challenge` | POST | Create PoW challenge |

### Request Format

```json
{
  "prompt": "Hello, how are you?",
  "chat_session_id": "session-id",
  "parent_message_id": null,
  "model": "default",
  "stream": true,
  "search_enabled": false,
  "thinking_enabled": false,
  "ref_file_ids": []
}
```

### Response Format (SSE)

```json
data: {"choices": [{"delta": {"content": "Hello"}, "finish_reason": null}]}
data: {"choices": [{"delta": {"content": "!"}, "finish_reason": null}]}
data: {"choices": [{"delta": {}, "finish_reason": "stop"}]}
data: [DONE]
```

### Available Models

| Model ID | Name | Reasoning | Search | Vision |
|----------|------|:---------:|:------:|:------:|
| `deepseek-default` | DeepSeek V4 Flash | ✗ | ✗ | ✗ |
| `deepseek-reasoner` | DeepSeek V4 Flash Reasoning | ✓ | ✗ | ✗ |
| `deepseek-search` | DeepSeek V4 Flash Search | ✗ | ✓ | ✗ |
| `deepseek-reasoner-search` | DeepSeek V4 Flash Reasoning+Search | ✓ | ✓ | ✗ |
| `deepseek-expert` | DeepSeek V4 Pro | ✗ | ✗ | ✗ |
| `deepseek-expert-reasoner` | DeepSeek V4 Pro Reasoning | ✓ | ✗ | ✗ |
| `deepseek-expert-search` | DeepSeek V4 Pro Search | ✗ | ✓ | ✗ |
| `deepseek-expert-reasoner-search` | DeepSeek V4 Pro Reasoning+Search | ✓ | ✓ | ✗ |
| `deepseek-vision` | DeepSeek Vision | ✗ | ✗ | ✓ |
| `deepseek-vision-reasoner` | DeepSeek Vision Reasoning | ✓ | ✗ | ✓ |

### Usage Example

```javascript
// Basic chat
{
  "provider": "deepseek-web",
  "model": "deepseek-default",
  "apiKey": "<your-deepseek-user-token>"
}

// Reasoning mode
{
  "provider": "deepseek-web",
  "model": "deepseek-reasoner",
  "apiKey": "<your-deepseek-user-token>"
}

// Expert (V4 Pro) with reasoning
{
  "provider": "deepseek-web",
  "model": "deepseek-expert-reasoner",
  "apiKey": "<your-deepseek-user-token>"
}
```

### Features

- **Session Management** — Automatic session creation and caching
- **Multi-turn Conversations** — Parent message ID tracking
- **Proof of Work (PoW)** — Automatic challenge solving
- **Deep Thinking** — Reasoning content in `reasoning_content` field
- **Web Search** — Real-time search results
- **File Upload** — Text and image file support
- **Tool Calling** — Via DSML prompt injection

### Notes

- Token expires in ~24 hours; re-login required
- PoW solving requires Node.js for WASM solver
- Concurrent requests limited to ~2 per account
- Sessions are cached and reused for multi-turn conversations

## Browser Automation (puppeteer-extra-stealth)

### Installation

```bash
npm install puppeteer-extra puppeteer-extra-plugin-stealth puppeteer
```

### Basic Usage

```javascript
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-blink-features=AutomationControlled']
});

const page = await browser.newPage();
// navigator.webdriver returns false (passes bot detection)
```

### Human-Like Behavior

```javascript
function randomDelay(min = 500, max = 2000) {
  return new Promise(r => setTimeout(r, min + Math.random() * (max - min)));
}

async function humanType(page, selector, text) {
  await page.click(selector);
  for (const char of text) {
    await page.keyboard.type(char, { delay: 50 + Math.random() * 100 });
  }
}
```

## Model Capabilities

| Capability | Description |
|------------|-------------|
| `text` | Text generation |
| `vision` | Image understanding |
| `tools` | Function/tool calling |
| `text2img` | Image generation |

## Priority Values

- 160-180: Official API providers
- 140-160: Web UI integrations
- 120-140: Third-party proxies
- 100-120: Local providers

## Checklist

- [ ] Provider registry created
- [ ] Executor created with buildUrl, buildHeaders, transformRequest
- [ ] Registered in executors/index.js
- [ ] Registered in providers/registry/index.js
- [ ] CLI tool definition added
- [ ] Test suite passing
- [ ] Guest mode tested (if applicable)
