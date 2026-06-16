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
| **Kimi** | ❌ Login required | Bearer token | N/A |
| **MiniMax** | ❌ Login required | Bearer token (localStorage) | N/A |
| **Gemini** | ❌ Login required | Cookies (__Secure-1PSID) | N/A |
| **Duck.ai** | ✅ Works (Free) | None required | N/A |

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
| `/api/v0/chat/create_pow_challenge` | POST | Create PoW challenge |
| `/api/v0/file/upload_file` | POST | Upload file |
| `/api/v0/file/fetch_files` | GET | Query file status |
| `/api/v0/file/fork_file_task` | POST | Fork file task |
| `/api/v0/client/settings` | GET | Get model settings |
| `/api/v0/users/me` | GET | Get current user info |
| `/api/v0/users/settings` | GET | Get user settings |
| `/api/v0/users/settings` | PUT | Update user settings |
| `/api/v0/shared/conversations` | GET | List shared conversations |
| `/api/v0/shared/conversations/:id` | GET | Get shared conversation |
| `/api/v0/shared/conversations` | POST | Share conversation |
| `/api/v0/characters` | GET | List characters |
| `/api/v0/characters/:id` | GET | Get character |
| `/api/v0/characters` | POST | Create character |

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

### Reference

See `references/deepseek-web.md` for complete API documentation including all 18 endpoints, request/response formats, error codes, and stream parsing details.

## Kimi Web Integration

### Authentication

Kimi requires a `Bearer` token from browser DevTools:

1. Login to https://kimi.com
2. Open Developer Tools (F12) → Network
3. Find any request → copy the `Authorization: Bearer` token value
4. Use as `apiKey` in provider config

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat` | POST | Create new chat session |
| `/api/chat/{chat_id}/completion/stream` | POST | Send message (SSE streaming) |
| `/api/chat/{chat_id}/completion` | POST | Send message (non-streaming) |
| `/api/chat/{chat_id}` | GET | Get chat session info |
| `/api/chat/{chat_id}/messages` | GET | Get chat history |
| `/api/chat/{chat_id}` | DELETE | Delete chat session |
| `/api/files/upload` | POST | Upload file |
| `/api/files` | GET | List files |
| `/api/user/me` | GET | Get current user info |
| `/api/models` | GET | List available models |
| `/api/chat/{chat_id}/title` | POST | Generate chat title |
| `/api/chat/{chat_id}/share` | POST | Share chat |
| `/api/search` | POST | Web search |

### Request Format

```json
{
  "model": "kimi-k2.7",
  "messages": [
    {"role": "system", "content": "You are Kimi."},
    {"role": "user", "content": "Hello!"}
  ],
  "stream": true,
  "thinking": {"type": "enabled"}
}
```

### Response Format (SSE)

```json
event: cmpl
data: {"text": "Hello"}

event: cmpl
data: {"text": "!"}

data: [DONE]
```

### Available Models

| Model ID | Name | Thinking | Vision | Tools |
|----------|------|:--------:|:------:|:-----:|
| `kimi-k2.7` | Kimi K2.7 | ✗ | ✗ | ✓ |
| `kimi-k2.7-thinking` | Kimi K2.7 Thinking | ✓ | ✗ | ✓ |
| `kimi-k2.7-code` | Kimi K2.7 Code | ✓ | ✗ | ✓ |
| `kimi-k2.6` | Kimi K2.6 | ✗ | ✗ | ✓ |
| `kimi-k2.6-thinking` | Kimi K2.6 Thinking | ✓ | ✗ | ✓ |
| `kimi-k2.5` | Kimi K2.5 | ✗ | ✓ | ✓ |
| `kimi-k2.5-thinking` | Kimi K2.5 Thinking | ✓ | ✓ | ✓ |
| `kimi-k2` | Kimi K2 | ✗ | ✗ | ✓ |
| `kimi-k2-thinking` | Kimi K2 Thinking | ✓ | ✗ | ✓ |
| `kimi-k1.5` | Kimi K1.5 | ✗ | ✗ | ✓ |
| `kimi-k1.5-thinking` | Kimi K1.5 Thinking | ✓ | ✗ | ✓ |
| `kimi` | Kimi Latest | ✗ | ✗ | ✓ |
| `kimi-vision` | Kimi Vision | ✗ | ✓ | ✗ |
| `ok-computer` | OK Computer | ✗ | ✗ | ✓ |

### Usage Example

```javascript
// Basic chat
{
  "provider": "kimi-web",
  "model": "kimi-k2.7",
  "apiKey": "<your-kimi-bearer-token>"
}

// Thinking mode
{
  "provider": "kimi-web",
  "model": "kimi-k2.7-thinking",
  "apiKey": "<your-kimi-bearer-token>"
}

// Vision
{
  "provider": "kimi-web",
  "model": "kimi-vision",
  "apiKey": "<your-kimi-bearer-token>"
}
```

### Features

- **Session Management** — Automatic session creation and caching
- **Multi-turn Conversations** — Parent message ID tracking
- **Deep Thinking** — Reasoning content in `reasoning_content` field
- **Web Search** — Real-time search results via tool calls
- **File Upload** — Text, PDF, and image file support
- **Tool Calling** — Via builtin function definitions

### Notes

- Token lasts ~30 days
- Concurrent requests limited to ~2 per account
- Sessions are cached and reused for multi-turn conversations

### Reference

See `references/kimi-web.md` for complete API documentation including all 13 endpoints, request/response formats, error codes, and stream parsing details.

## MiniMax Web Integration

### Authentication

MiniMax requires a `Bearer` token from browser local storage:

1. Login to https://hailuoai.com
2. Open Developer Tools (F12) → Application → Local Storage
3. Find `hailuoai.com` → copy `_token` and `realUserID` values
4. Combine as: `realUserID + _token` (e.g., `450234567894+eyJhbGciOiJIUzI1NiI......`)
5. Use as `apiKey` in provider config

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/chat/completions` | POST | Send chat message (SSE streaming) |
| `/v1/audio/speech` | POST | Text-to-speech |
| `/v1/audio/transcriptions` | POST | Speech-to-text |
| `/token/check` | GET | Check token validity |

### Request Format

```json
{
  "model": "MiniMax-M3",
  "messages": [
    {"role": "system", "content": "You are MiniMax."},
    {"role": "user", "content": "Hello!"}
  ],
  "stream": true
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

| Model ID | Name | Thinking | Vision | Search |
|----------|------|:--------:|:------:|:------:|
| `minimax-m3` | MiniMax M3 | ✗ | ✓ | ✓ |
| `minimax-m3-thinking` | MiniMax M3 Thinking | ✓ | ✓ | ✓ |
| `minimax-m2.7` | MiniMax M2.7 | ✗ | ✓ | ✓ |
| `minimax-m2.7-thinking` | MiniMax M2.7 Thinking | ✓ | ✓ | ✓ |
| `minimax-m2.5` | MiniMax M2.5 | ✗ | ✓ | ✓ |
| `minimax-m2.5-thinking` | MiniMax M2.5 Thinking | ✓ | ✓ | ✓ |
| `minimax-m2.1` | MiniMax M2.1 | ✗ | ✗ | ✗ |
| `minimax-m2.1-thinking` | MiniMax M2.1 Thinking | ✓ | ✗ | ✗ |
| `minimax-m2` | MiniMax M2 | ✗ | ✗ | ✗ |
| `minimax-m2-thinking` | MiniMax M2 Thinking | ✓ | ✗ | ✗ |
| `hailuo` | Hailuo | ✗ | ✗ | ✗ |
| `hailuo-fast` | Hailuo Fast | ✗ | ✗ | ✗ |

### Usage Example

```javascript
// Basic chat
{
  "provider": "minimax-web",
  "model": "minimax-m3",
  "apiKey": "<realUserID>+<_token>"
}

// Thinking mode
{
  "provider": "minimax-web",
  "model": "minimax-m3-thinking",
  "apiKey": "<realUserID>+<_token>"
}
```

### Features

- **Session Management** — Automatic session creation and caching
- **Multi-turn Conversations** — Parent message ID tracking
- **Deep Thinking** — Reasoning content in `reasoning_content` field
- **Web Search** — Real-time search results via tool calls
- **File Upload** — Text, PDF, and image file support
- **Audio** — Text-to-speech and speech-to-text support

### Notes

- Token extracted from localStorage (no automatic refresh)
- API base: https://hailuoai.com
- Uses OpenAI-compatible format
- Concurrent requests limited to ~2 per account

### Reference

See `references/minimax-web.md` for complete API documentation including all 4 endpoints, request/response formats, error codes, and stream parsing details.

## Gemini Web Integration

### Authentication

Gemini requires cookies from browser DevTools:

1. Login to https://gemini.google.com
2. Open Developer Tools (F12) → Application → Cookies → .google.com
3. Copy `__Secure-1PSID` and `__Secure-1PSIDTS` values
4. Use as `apiKey` in provider config (format: `__Secure-1PSID=xxx; __Secure-1PSIDTS=yyy`)

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate` | POST | Send chat message (custom streaming) |
| `/_/BardChatUi/data/batchexecute` | POST | Batch RPC execute |

### Request Format

Gemini uses a non-standard 81-element sparse array format with URL-encoded form body.

### Available Models

| Model ID | Name |
|----------|------|
| `gemini-3-pro` | Gemini 3 Pro |
| `gemini-3-flash` | Gemini 3 Flash |
| `gemini-3-flash-thinking` | Gemini 3 Flash Thinking |
| `gemini-3-lite` | Gemini 3 Lite |
| `gemini-2.5-pro` | Gemini 2.5 Pro |
| `gemini-2.5-flash` | Gemini 2.5 Flash |
| `gemini-2.0-flash` | Gemini 2.0 Flash |
| `gemini-2.0-flash-lite` | Gemini 2.0 Flash Lite |

### Usage Example

```javascript
{
  "provider": "gemini-web",
  "model": "gemini-3-pro",
  "apiKey": "__Secure-1PSID=xxx; __Secure-1PSIDTS=yyy"
}
```

### Notes

- Token from Google account cookies
- Non-standard streaming format (not SSE)
- Supports thinking/reasoning content

### Reference

See `references/gemini-web.md` for complete API documentation.

## Duck.ai (DuckWeb) Integration

### Authentication

**No authentication required!** Duck.ai is free and anonymous.

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/duckchat/v1/status` | GET | Get VQD challenge token |
| `/duckchat/v1/chat` | POST | Send chat message (SSE streaming) |

### Available Models

| Model ID | Name | Reasoning | Vision | Web Search |
|----------|------|:--------:|:------:|:----------:|
| `gpt-4o-mini` | GPT-4o Mini | ✗ | ✓ | ✓ |
| `gpt-5-mini` | GPT-5 Mini | ✓ | ✓ | ✓ |
| `claude-haiku-4-5` | Claude Haiku 4.5 | ✓ | ✓ | ✓ |
| `meta-llama/Llama-4-Scout-17B-16E-Instruct` | Llama 4 Scout | ✗ | ✗ | ✗ |
| `mistral-small-2603` | Mistral Small | ✗ | ✗ | ✗ |
| `tinfoil/gpt-oss-120b` | GPT-OSS 120B | ✓ | ✗ | ✗ |

### Usage Example

```javascript
{
  "provider": "duck-web",
  "model": "gpt-4o-mini"
}
```

### Features

- **Free** — No account or API key needed
- **Multiple Models** — GPT-4o, Claude, Llama, Mistral
- **Web Search** — Opt-in per request
- **Reasoning** — GPT-5-mini, Claude Haiku support thinking modes

### Notes

- Rate limited to ~20 requests/minute
- VQD challenge tokens rotate automatically
- No conversation persistence (client-side history)

### Reference

See `references/duck-web.md` for complete API documentation.

## Image Generation Providers

### Pollinations.ai (Free)

**No account required!** Free image generation via simple GET URL or POST API.

```javascript
// Simple GET URL
https://image.pollinations.ai/prompt/A%20sunset%20over%20mountains?model=flux&width=1024&height=1024

// Provider config
{
  "provider": "pollinations",
  "model": "flux",
  "prompt": "A sunset over mountains"
}
```

**Models:** flux, flux-realism, flux-anime, flux-3d, kontext, nanobanana, seedream, gptimage, grok, qwen

### Krea AI

Official API with 40+ models. Requires API key from https://www.krea.ai/app/api

```javascript
{
  "provider": "krea",
  "model": "flux-1.1-pro",
  "apiKey": "<your-krea-api-key>",
  "prompt": "A sunset over mountains"
}
```

**Models:** flux-1.1-pro, flux-dev, flux-schnell, imagen-4, ideogram-3.0, seedream, recraft-v3, dall-e-3, midjourney-v6

### Jimeng/Dreamina (Free)

ByteDance's free image generation. Requires session cookie from jimeng.jianying.com

```javascript
{
  "provider": "jimeng",
  "model": "jimeng-6",
  "apiKey": "<session-cookie>",
  "prompt": "A sunset over mountains"
}
```

**Models:** jimeng-6, jimeng-5, jimeng-4.1, jimeng-4

### Flux (Black Forest Labs)

State-of-the-art image generation. Schnell model is free (Apache 2.0).

```javascript
{
  "provider": "flux",
  "model": "flux-schnell",
  "apiKey": "<your-bfl-api-key>",
  "prompt": "A sunset over mountains"
}
```

**Models:** flux-schnell (free), flux-1.1-pro, flux-dev, flux-pro, flux-2-pro, flux-2-dev, flux-2-klein

### Grok Imagine (Free)

xAI's free image generation. No API key required.

```javascript
{
  "provider": "grok-imagine",
  "model": "grok-imagine",
  "prompt": "A sunset over mountains"
}
```

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
