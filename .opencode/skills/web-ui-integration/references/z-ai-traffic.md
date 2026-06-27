# Z.AI Web Traffic Analysis

## Intercepted: 2026-06-16

## API Endpoints

### 1. Authentication
```
GET https://chat.z.ai/api/v1/auths/
```

**Response:**
```json
{
  "token": "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "d9e18319-1ca9-47cb-9c0d-8662a95ca112",
    "email": "guest-1781574926128@guest.com",
    "name": "Guest",
    "role": "pending"
  }
}
```

### 2. Configuration
```
GET https://chat.z.ai/api/config
```

### 3. Available Models
```
GET https://chat.z.ai/api/models
```

### 4. User Settings
```
GET https://chat.z.ai/api/v1/users/user/settings
```

### 5. Scene Configuration
```
GET https://chat.z.ai/api/v1/scene-cfg/
```

### 6. Create New Chat
```
POST https://chat.z.ai/api/v1/chats/new
```

**Headers:**
```javascript
{
  "accept": "application/json",
  "accept-language": "en-US",
  "authorization": "Bearer eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9...",
  "content-type": "application/json"
}
```

**Request Body:**
```json
{
  "chat": {
    "id": "",
    "title": "New Chat",
    "models": ["glm-4.7"],
    "params": {},
    "history": {
      "messages": {
        "fc2387db-c792-4f03-a087-77a77b2e2ac8": {
          "id": "fc2387db-c792-4f03-a087-77a77b2e2ac8",
          "parentId": null,
          "childrenIds": [],
          "role": "user",
          "content": "Hello, what is 2+2?",
          "timestamp": 1781576636,
          "models": ["glm-4.7"]
        }
      },
      "currentId": "fc2387db-c792-4f03-a087-77a77b2e2ac8"
    },
    "tags": [],
    "flags": [],
    "features": [
      {"server": "vibe-coding", "status": "hidden", "type": "mcp"},
      {"server": "ppt-maker", "status": "hidden", "type": "mcp"},
      {"server": "image-search", "status": "hidden", "type": "mcp"},
      {"server": "deep-research", "status": "hidden", "type": "mcp"},
      {"server": "tool_selector", "status": "hidden", "type": "tool_selector"}
    ],
    "mcp_servers": [],
    "enable_thinking": true,
    "reasoning_effort": "max",
    "auto_web_search": false,
    "message_version": 1,
    "extra": {},
    "timestamp": 1781576636186,
    "type": "default"
  }
}
```

**Response:**
```json
{
  "id": "78111117-dddd-434a-8552-44b1c85a24c6",
  "user_id": "d9e18319-1ca9-47cb-9c0d-8662a95ca112",
  "title": "New Chat",
  "chat": {
    "id": "78111117-dddd-434a-8552-44b1c85a24c6",
    "models": ["glm-4.7"],
    "params": {},
    "history": {...},
    "tags": [],
    "features": [...],
    "enable_thinking": true,
    "reasoning_effort": "max",
    "timestamp": 1781576636186,
    "extra": {}
  },
  "updated_at": 1781576636,
  "created_at": 1781576636,
  "share_id": null,
  "archived": false,
  "pinned": false,
  "meta": {
    "auto_web_search": false,
    "flags": null,
    "mcp_servers": [],
    "models": ["glm-4.7"],
    "workspace_id": "78111117-dddd-434a-8552-44b1c85a24c6"
  },
  "folder_id": null,
  "message_version": 1,
  "type": "default",
  "im_context": null
}
```

## Chat Completion Endpoint

The chat completion endpoint was not captured because it requires CAPTCHA verification.

### Expected Endpoint
```
POST https://chat.z.ai/api/v2/chat/completions
```

### Required Headers
```javascript
{
  "content-type": "application/json",
  "accept": "application/json",
  "accept-language": "en-US",
  "authorization": "Bearer <jwt-token>",
  "x-fe-version": "prod-fe-1.1.54",
  "x-signature": "<signature-hash>"
}
```

### Expected Request Body
```json
{
  "stream": true,
  "model": "glm-4.7",
  "messages": [{"role": "user", "content": "..."}],
  "signature_prompt": "...",
  "params": {},
  "extra": {},
  "features": {
    "image_generation": false,
    "web_search": false,
    "auto_web_search": false,
    "preview_mode": true,
    "flags": [],
    "vlm_tools_enable": false,
    "vlm_web_search_enable": false,
    "vlm_website_mode": false,
    "enable_thinking": true
  },
  "variables": {
    "{{USER_NAME}}": "Guest-...",
    "{{USER_LOCATION}}": "Unknown",
    "{{CURRENT_DATETIME}}": "...",
    "{{CURRENT_DATE}}": "...",
    "{{CURRENT_TIME}}": "...",
    "{{CURRENT_WEEKDAY}}": "...",
    "{{CURRENT_TIMEZONE}}": "...",
    "{{USER_LANGUAGE}}": "en-US"
  },
  "chat_id": "<uuid>",
  "id": "<uuid>",
  "current_user_message_id": "<uuid>",
  "current_user_message_parent_id": "<uuid>",
  "background_tasks": {
    "title_generation": true,
    "tags_generation": true
  },
  "captcha_verify_param": "<base64-encoded-captcha>"
}
```

## CAPTCHA System

### Provider
Alibaba Cloud CAPTCHA (AliyunCaptcha)

### Endpoints
```
https://o.alicdn.com/captcha-frontend/aliyunCaptcha/AliyunCaptcha.js
https://cloudauth-device-dualstack.ap-southeast-1.aliyuncs.com
https://no8xfe.captcha-open-southeast.aliyuncs.com/
```

### Elements
```html
<div id="chat-captcha-element"></div>
<button id="chat-captcha-trigger"></button>
```

### Scene ID
`didk33e0`

## Key Findings

### Authentication
- Guest users get JWT token from `/api/v1/auths/`
- Token format: ES256 JWT
- Token contains: `{"id":"...","email":"guest-...@guest.com"}`

### Chat Flow
1. Get auth token from `/api/v1/auths/`
2. Create chat with `/api/v1/chats/new`
3. Send message with `/api/v2/chat/completions` (requires CAPTCHA)

### Security
- Alibaba Cloud CAPTCHA required for chat completion
- CAPTCHA tokens are single-use
- Signature header required (`x-signature`)
- Frontend version check (`x-fe-version`)

### Models Available
- `glm-4.7` (default)
- `glm-4.7-flash` (free)
- `glm-4.5-flash` (free)
- `glm-5.1` (paid)
- And more...

## Implementation Notes

### For 9Router Executor
```javascript
// Authentication flow
1. GET /api/v1/auths/ → auth token
2. POST /api/v1/chats/new → chat_id
3. POST /api/v2/chat/completions → response (requires CAPTCHA)

// Headers
headers: {
  "authorization": "Bearer " + authToken,
  "x-fe-version": "prod-fe-1.1.54",
  "x-signature": signature
}
```

### Limitations
- CAPTCHA required for chat completion
- CAPTCHA tokens are single-use
- Cannot be automated easily
- Developer API recommended for programmatic access

## Comparison with ChatGPT

| Feature | ChatGPT | Z.AI |
|---------|---------|------|
| Anonymous access | Yes | Yes |
| CAPTCHA required | No (Turnstile) | Yes (Alibaba) |
| Token expiry | ~60 seconds | ~5 minutes |
| Rate limiting | Yes | Yes |
| Free models | GPT-5.5 (limited) | GLM-4.7-Flash |
