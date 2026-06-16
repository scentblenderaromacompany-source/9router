# ChatGPT Web Traffic Analysis

## Intercepted: 2026-06-16

## API Endpoints

### 1. Prepare Conversation
```
GET https://chatgpt.com/backend-anon/f/conversation/prepare
```

**Response:**
```json
{
  "status": "ok",
  "conduit_token": "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Chat Completion (Main)
```
POST https://chatgpt.com/backend-anon/f/conversation
```

**Headers:**
```javascript
{
  "accept": "text/event-stream",
  "content-type": "application/json",
  "oai-client-build-number": "7511904",
  "oai-client-version": "prod-a5747f44f9bfe551e0bc9db0a31f22a497f6568a",
  "oai-device-id": "b83deeae-4e87-4d83-a77f-cb523166ca7b",
  "oai-echo-logs": "0,7272",
  "oai-language": "en-US",
  "oai-session-id": "f30bbcb8-31da-46b3-a0de-b418be9b5560",
  "oai-telemetry": "[1,null]",
  "openai-sentinel-chat-requirements-token": "gAAAAABqMLM1qe4fN1Wx...",
  "openai-sentinel-proof-token": "gAAAAABWzI0OTQsIk1vbiBKdW4gMTU...",
  "openai-sentinel-turnstile-token": "QhoWBB8LGhQQcnthSBAdGw0YHAUO...",
  "x-conduit-token": "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9...",
  "x-oai-turn-trace-id": "eb912718-59c5-498c-8574-d6ea1f3b04e0",
  "x-openai-target-path": "/backend-api/f/conversation",
  "x-openai-target-route": "/backend-api/f/conversation"
}
```

**Request Body:**
```json
{
  "action": "next",
  "messages": [
    {
      "id": "ec050bb0-da2f-4683-9f20-b5900c949e36",
      "author": {"role": "user"},
      "create_time": 1781576549.282,
      "content": {
        "content_type": "text",
        "parts": ["What is 2+2?"]
      },
      "metadata": {
        "selected_github_repos": [],
        "selected_all_github_repos": false,
        "serialization_metadata": {"custom_symbol_offsets": []}
      }
    }
  ],
  "parent_message_id": "client-created-root",
  "model": "auto",
  "client_prepare_state": "success",
  "timezone_offset_min": 300,
  "timezone": "America/Chicago",
  "conversation_mode": {"kind": "primary_assistant"},
  "enable_message_followups": true,
  "system_hints": [],
  "supports_buffering": true,
  "supported_encodings": ["v1"],
  "client_contextual_info": {
    "is_dark_mode": false,
    "time_since_loaded": 56,
    "page_height": 770,
    "page_width": 1512,
    "pixel_ratio": 2,
    "screen_height": 982,
    "screen_width": 1512,
    "app_name": "chatgpt.com"
  },
  "no_auth_ad_preferences": {
    "personalization_enabled": true,
    "history_enabled": true,
    "bazaar_consent_set": false
  },
  "paragen_cot_summary_display_override": "allow",
  "force_parallel_switch": "auto"
}
```

### 3. Sentinel Endpoints
```
GET https://chatgpt.com/backend-anon/sentinel/chat-requirements/prepare
GET https://chatgpt.com/backend-anon/sentinel/chat-requirements/finalize
GET https://chatgpt.com/backend-anon/sentinel/ping
POST https://chatgpt.com/backend-api/sentinel/ping
```

## Response Format (SSE)

```javascript
event: delta_encoding
data: "v1"

data: {"type": "resume_conversation_token", "kind": "topic", "token": "...", "conversation_id": "..."}

data: {"type": "message_marker", "conversation_id": "...", "message_id": "...", "marker": "user_visible_token", "event": "first"}

event: delta
data: {"p": "", "o": "add", "v": {"message": {"id": "...", "author": {"role": "assistant"}, "content": {"content_type": "text", "parts": ["2 + 2 = **4**."]}, "status": "finished_successfully", "end_turn": true, "metadata": {"resolved_model_slug": "gpt-5-5", "model_slug": "gpt-5-5"}}}, "c": 0}

data: {"type": "message_marker", "conversation_id": "...", "message_id": "...", "marker": "last_token", "event": "last"}

data: {"type": "server_ste_metadata", "metadata": {"plan_type": "guest", "model_slug": "gpt-5-3-mini", ...}}

data: {"type": "message_stream_complete", "conversation_id": "..."}

data: [DONE]
```

## Key Findings

### Security Tokens Required
1. **conduit_token**: JWT from `/prepare` endpoint (60s expiry)
2. **sentinel-chat-requirements-token**: From `/sentinel/chat-requirements/prepare`
3. **sentinel-proof-token**: Base64 encoded proof
4. **sentinel-turnstile-token**: Cloudflare Turnstile token

### Model Selection
- Free tier uses `gpt-5-5` (not gpt-4o as expected!)
- Model slug in response: `gpt-5-5`
- Alt model: `gpt-5-3-mini`

### Anonymous Access
- No login required for basic chat
- Guest users get access to GPT-5.5
- Limited to `backend-anon` endpoints
- Device ID and session ID tracking

### Request Format
- Custom format (not OpenAI-compatible)
- Uses `action: "next"` for new messages
- `parent_message_id` for conversation threading
- `model: "auto"` lets server choose model

### Response Format
- Server-Sent Events (SSE)
- Custom delta format: `{"p": "", "o": "add", "v": {...}}`
- Message markers for stream boundaries
- `[DONE]` sentinel

## Implementation Notes

### For 9Router Executor
```javascript
// Headers to set
headers: {
  "accept": "text/event-stream",
  "content-type": "application/json",
  "oai-client-build-number": "7511904",
  "oai-client-version": "prod-a5747f44f9bfe551e0bc9db0a31f22a497f6568a",
  "oai-device-id": generateUUID(),
  "oai-language": "en-US",
  "oai-session-id": generateUUID(),
  "openai-sentinel-chat-requirements-token": requirementsToken,
  "openai-sentinel-proof-token": proofToken,
  "openai-sentinel-turnstile-token": turnstileToken,
  "x-conduit-token": conduitToken
}

// Token acquisition flow
1. GET /backend-anon/f/conversation/prepare → conduit_token
2. GET /backend-anon/sentinel/chat-requirements/prepare → prepare_token
3. Complete Turnstile challenge
4. GET /backend-anon/sentinel/chat-requirements/finalize → sentinel token
5. POST /backend-anon/f/conversation with all tokens
```

### Limitations
- Tokens expire quickly (~60 seconds)
- Turnstile challenge required per session
- Rate limiting on anonymous access
- Conversation history not persisted for guests
