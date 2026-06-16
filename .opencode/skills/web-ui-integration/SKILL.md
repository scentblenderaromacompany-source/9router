---
name: web-ui-integration
description: Use when creating Web UI integrations (like ChatGPT Web, Z.AI, Grok Web) in 9Router. Covers executor creation, provider registry, traffic interception, browser automation, and test suites.
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

## Model Capabilities

| Capability | Description |
|------------|-------------|
| `text` | Text generation |
| `vision` | Image understanding |
| `tools` | Function/tool calling |
| `text2img` | Image generation |
| `text2video` | Video generation |
| `speech2text` | Audio transcription |
| `ocr` | Document parsing |

## Priority Values

- 160-180: Official API providers
- 140-160: Web UI integrations
- 120-140: Third-party proxies
- 100-120: Local providers

## Traffic Interception

Use browser-harness to discover API endpoints:

```bash
browser-harness <<'PY'
ensure_real_tab()
goto_url("https://provider.com")
wait_for_load()

# Install fetch interceptor
js("""(function() {
  window._captured = [];
  const orig = window.fetch;
  window.fetch = async (...args) => {
    window._captured.push({
      url: args[0],
      method: args[1]?.method || 'GET',
      body: args[1]?.body
    });
    return orig(...args);
  };
  return 'ready';
})()""")

# Perform actions, then get captured requests
requests = js("JSON.stringify(window._captured, null, 2)")
print(requests)
PY
```

## Browser Automation

```bash
# Install
uv tool install browser-harness

# Basic usage
browser-harness <<'PY'
ensure_real_tab()
goto_url("https://provider.com")
wait_for_load()
url = js("window.location.href")
print(f"URL: {url}")
PY
```

## References

See `references/` folder for:
- `z-ai.md` - Z.AI provider reference
- `chatgpt-web.md` - ChatGPT Web reference
- `grok-web.md` - Grok Web reference
- `free-models.md` - Free models comparison
- `z-ai-traffic.md` - Intercepted Z.AI traffic
- `chatgpt-web-traffic.md` - Intercepted ChatGPT traffic
- `account-registration.md` - Automated registration system

## Checklist

- [ ] Provider registry created
- [ ] Executor created with buildUrl, buildHeaders, transformRequest
- [ ] Registered in executors/index.js
- [ ] Registered in providers/registry/index.js
- [ ] CLI tool definition added
- [ ] Test suite passing
- [ ] Documentation created
