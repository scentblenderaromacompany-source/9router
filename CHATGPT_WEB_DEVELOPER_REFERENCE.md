# ChatGPT Web Integration - Developer Reference

## Quick Reference

### File Structure
```
9Router/
├── open-sse/executors/
│   ├── chatgpt-web.js          # ChatGPTWebExecutor class
│   └── index.js                 # Executor registration
├── open-sse/providers/registry/
│   ├── chatgpt-web.js          # Provider definition
│   └── index.js                 # Provider registration
├── src/shared/constants/
│   └── cliTools.js             # CLI tool guides
├── CHATGPT_WEB_SETUP.md        # User setup guide
├── CHATGPT_WEB_INTEGRATION_SUMMARY.md  # Implementation summary
└── CHATGPT_WEB_DEVELOPER_REFERENCE.md  # This file
```

## Core Implementation Details

### ChatGPTWebExecutor (chatgpt-web.js)

**Class:** `ChatGPTWebExecutor extends BaseExecutor`

**Key Methods:**

#### buildUrl(model, stream, urlIndex, credentials)
```javascript
// Returns Chat2API endpoint URL
// Input: model name, stream flag, url index, credentials
// Output: "http://localhost:8700/v1/chat/completions"

// Configurable via credentials.providerSpecificData:
{
  "baseUrl": "http://custom-host:8700/v1",
  "apiType": "chat"  // or "responses"
}
```

#### buildHeaders(credentials, stream)
```javascript
// Constructs HTTP headers with Bearer token
// Returns: { "Authorization": "Bearer <token>", "Content-Type": "application/json" }

// Token sources:
// 1. credentials.apiKey (primary)
// 2. credentials.accessToken (secondary)
```

#### transformRequest(model, body, stream, credentials)
```javascript
// Normalizes request to OpenAI format
// Preserves: tools, tool_choice, vision_detail
// Ensures: model, messages, stream fields set

// Example transformation:
Input: { model: "gpt-4o", messages: [...], tools: [...] }
Output: { model: "gpt-4o", messages: [...], stream: true, tools: [...] }
```

### Provider Definition (registry/chatgpt-web.js)

**Structure:**
```javascript
{
  id: "chatgpt-web",           // Provider identifier
  alias: "cgpt-web",            // Short alias
  aliases: ["cgw"],             // Additional aliases
  display: {                     // UI display info
    name: "ChatGPT Web (Native)",
    icon: "auto_awesome",
    color: "#10A37F"
  },
  category: "webCookie",        // Auth category
  authType: "cookie",           // Auth method
  transport: {                  // Connection config
    baseUrl: "http://localhost:8700/v1",
    format: "openai",
    authType: "apikey"
  },
  models: [                     // Available models
    { id: "gpt-4o", name: "GPT-4o", capabilities: [...] },
    // ... more models
  ],
  passthroughModels: true,      // Allow custom models
  serviceKinds: ["llm", "image"]  // Service types
}
```

## Request/Response Flow

### Incoming Request
```
1. User sends request to 9Router
2. Router identifies model → "gpt-4o"
3. Router finds provider → "chatgpt-web"
4. Loads executor → ChatGPTWebExecutor
5. Calls execute({ model, body, stream, credentials, signal, log })
```

### Execute Flow (BaseExecutor)
```
1. buildUrl() → Get Chat2API endpoint
2. buildHeaders() → Add Bearer token
3. transformRequest() → Normalize to OpenAI format
4. fetch() → Send to Chat2API proxy
5. Stream/parse response
6. Return to client
```

### Response Handling
```
Streaming:
  Chat2API → SSE format
    ↓
  BaseExecutor relays via ReadableStream
    ↓
  Client receives SSE events

Non-streaming:
  Chat2API → JSON response
    ↓
  BaseExecutor buffers and returns complete response
    ↓
  Client receives JSON
```

## Integration Points

### 1. Executor Factory (executors/index.js)
```javascript
import { ChatGPTWebExecutor } from "./chatgpt-web.js";

const executors = {
  // ... other executors
  "chatgpt-web": new ChatGPTWebExecutor(),
  // ...
};

export function getExecutor(provider) {
  return executors[provider] || executors.default;
}
```

### 2. Provider Registry (providers/registry/index.js)
```javascript
import p40a from "./chatgpt-web.js";

export default [
  // ... other providers
  p40a,  // ChatGPT Web
  // ...
];
```

### 3. CLI Tools Guide (src/shared/constants/cliTools.js)
```javascript
chatgpt_web: {
  id: "chatgpt-web",
  name: "ChatGPT Web (Native)",
  configType: "guide",
  guideSteps: [/* ... */],
  // ...
}
```

## Token Format

**Access Token Source:** 
```
https://chatgpt.com/api/auth/session
```

**Token JSON Response:**
```json
{
  "user": { ... },
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Im5LQjBZLU5GN...",
  "expires": "2025-02-28T15:30:00Z"
}
```

**Storage in 9Router:**
```javascript
credentials = {
  apiKey: "<full-access-token>",  // or accessToken field
  provider: "chatgpt-web",
  providerSpecificData: {
    baseUrl: "http://localhost:8700/v1",
    apiType: "chat"
  }
}
```

## Tool Invocation Flow

### Request with Tools
```javascript
{
  "model": "gpt-4o",
  "messages": [...],
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "get_weather",
        "description": "...",
        "parameters": { ... }
      }
    }
  ]
}
```

### Processing
```
1. transformRequest() passes tools unchanged to Chat2API
2. Chat2API sends to ChatGPT web with proper formatting
3. GPT-4o processes tools and decides to invoke
4. Response includes tool_calls in standard OpenAI format
```

### Response with Tool Call
```javascript
{
  "choices": [{
    "finish_reason": "tool_calls",
    "message": {
      "tool_calls": [{
        "id": "call_abc123",
        "type": "function",
        "function": {
          "name": "get_weather",
          "arguments": "{\"location\": \"New York\"}"
        }
      }]
    }
  }]
}
```

## Error Handling

### Chat2API Unavailable
```
Executor buildUrl() → "http://localhost:8700/v1/chat/completions"
Fetch fails → BaseExecutor retries or returns error
Response: { error: { message: "Connection refused", type: "upstream_error" } }
```

### Invalid Access Token
```
Request sent to Chat2API with Bearer token
Chat2API validates with ChatGPT API
401 response returned
User gets: { error: { message: "Unauthorized", code: "HTTP_401" } }
Solution: Get fresh token from https://chatgpt.com/api/auth/session
```

### Rate Limiting
```
Chat2API returns 429 (Too Many Requests)
BaseExecutor applies retry logic from config
After max retries: { error: { message: "Rate limited" } }
```

## Extending the Implementation

### Custom Base URL
```javascript
// User configuration
{
  "provider": "chatgpt-web",
  "accessToken": "...",
  "providerSpecificData": {
    "baseUrl": "https://api.myproxy.com:9000/v1"
  }
}

// In buildUrl():
const baseUrl = credentials?.providerSpecificData?.baseUrl || 
                this.config.baseUrl || 
                "http://localhost:8700/v1";
```

### Custom Model Mapping
```javascript
// Could be extended to support model aliasing
// Example: "gpt-4" → "gpt-4-1106-preview"

transformRequest(model, body) {
  const modelMap = {
    "gpt-4": "gpt-4-1106-preview",
    "gpt-4-short": "gpt-4-vision-preview"
  };
  
  const actualModel = modelMap[model] || model;
  return { ...body, model: actualModel };
}
```

### Token Auto-Refresh
```javascript
// Could be extended with refreshCredentials hook
async refreshCredentials(credentials, log) {
  // Fetch new token from ChatGPT if possible
  // Store in credential manager
  return updatedCredentials;
}
```

## Testing

### Unit Test Template
```javascript
import { ChatGPTWebExecutor } from "./chatgpt-web.js";

describe("ChatGPTWebExecutor", () => {
  let executor;
  
  beforeEach(() => {
    executor = new ChatGPTWebExecutor();
  });
  
  test("buildUrl with default config", () => {
    const url = executor.buildUrl("gpt-4o", true, 0, null);
    expect(url).toBe("http://localhost:8700/v1/chat/completions");
  });
  
  test("buildUrl with custom baseUrl", () => {
    const credentials = {
      providerSpecificData: { baseUrl: "http://custom:9000/v1" }
    };
    const url = executor.buildUrl("gpt-4o", true, 0, credentials);
    expect(url).toBe("http://custom:9000/v1/chat/completions");
  });
  
  test("buildHeaders with access token", () => {
    const credentials = { accessToken: "test-token-123" };
    const headers = executor.buildHeaders(credentials);
    expect(headers.Authorization).toBe("Bearer test-token-123");
  });
  
  test("transformRequest preserves tools", () => {
    const body = {
      messages: [],
      tools: [{ type: "function", function: { name: "test" } }]
    };
    const result = executor.transformRequest("gpt-4o", body, true);
    expect(result.tools).toEqual(body.tools);
  });
});
```

### Integration Test Template
```javascript
describe("ChatGPT Web Integration", () => {
  test("stream chat completion with tools", async () => {
    const credentials = {
      accessToken: process.env.CHATGPT_ACCESS_TOKEN
    };
    
    const response = await executor.execute({
      model: "gpt-4o",
      body: {
        messages: [{ role: "user", content: "Hello" }],
        tools: [{ type: "function", function: { name: "test" } }]
      },
      stream: true,
      credentials
    });
    
    expect(response.status).toBe(200);
    // Parse streaming response
  });
});
```

## Debugging

### Enable Debug Logging
```javascript
// In request handlers
const log = {
  debug: (tag, msg) => console.log(`[${tag}] ${msg}`),
  info: (tag, msg) => console.log(`[INFO] [${tag}] ${msg}`),
  warn: (tag, msg) => console.warn(`[WARN] [${tag}] ${msg}`),
  error: (tag, msg) => console.error(`[ERROR] [${tag}] ${msg}`)
};

executor.execute({ ..., log });
```

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Invalid/expired token | Get new token from ChatGPT settings |
| Connection refused | Chat2API not running | Start Chat2API on port 8700 |
| 429 Too Many Requests | Rate limited | Implement backoff, wait before retry |
| Empty response | Malformed request | Verify OpenAI format compliance |
| Tools not invoked | Model doesn't support | Use gpt-4o or gpt-4-turbo, not 3.5 |

## Performance Considerations

### Latency
- Direct to Chat2API: ~100ms (if local)
- Chat2API to ChatGPT: ~500ms-2s (network dependent)
- Total TTFB: ~600ms-2s

### Throughput
- Respects ChatGPT API rate limits
- Implements exponential backoff
- Supports concurrent requests via streaming

### Memory
- Streaming responses don't buffer full response
- Non-streaming buffers response (use streaming when possible)
- Tool definitions passed through (not transformed)

## References

- **Chat2API:** https://github.com/Z7ANN/chat2api
- **OpenAI API:** https://platform.openai.com/docs/api-reference
- **9Router:** https://github.com/Z7ANN/9router
- **BaseExecutor:** `/workspaces/9router/open-sse/executors/base.js`
- **Provider Schema:** `/workspaces/9router/open-sse/providers/schema.js`
