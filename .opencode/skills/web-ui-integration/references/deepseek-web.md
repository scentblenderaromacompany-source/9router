# DeepSeek Web API Reference

## Overview

DeepSeek Web API provides direct access to chat.deepseek.com's web interface.
Uses USER_TOKEN from browser local storage for authentication.

**Base URL**: `https://chat.deepseek.com`

## Authentication

```http
Authorization: Bearer <USER_TOKEN>
```

Get token from: F12 → Application → Local Storage → chat.deepseek.com → USER_TOKEN

## Endpoints

### Chat Completion

```http
POST /api/v0/chat/completion
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "prompt": "Hello, how are you?",
  "chat_session_id": "uuid",
  "parent_message_id": null,
  "model": "default",
  "stream": true,
  "search_enabled": false,
  "thinking_enabled": false,
  "ref_file_ids": []
}
```

**Response (SSE Stream):**

```
event: ready
data: {"request_message_id":1,"response_message_id":2}

data: {"p":"response/content","v":"Hello"}

data: {"p":"response/status","v":"FINISHED"}

event: finish
data: {}
```

### Create Session

```http
POST /api/v0/chat_session/create
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "agent": "chat"
}
```

**Response:**

```json
{
  "code": 0,
  "data": {
    "biz_data": {
      "id": "acd61ee0-ceaa-426c-aaf2-5e91f6e8792c",
      "agent": "chat",
      "title": null,
      "inserted_at": 1774012756.515
    }
  },
  "chat_session_id": "acd61ee0-ceaa-426c-aaf2-5e91f6e8792c"
}
```

### Delete Session

```http
POST /api/v0/chat_session/delete
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "chat_session_id": "session-id"
}
```

### Get History

```http
GET /api/v0/chat/history_messages?chat_session_id=<id>&offset=0&limit=20
Authorization: Bearer <token>
```

**Response:**

```json
{
  "code": 0,
  "data": {
    "biz_data": {
      "chat_session": { "id": "...", "title": "..." },
      "chat_messages": []
    }
  }
}
```

### Upload File

```http
POST /api/v0/file/upload_file
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

**Request Body (multipart):**

- `file`: Binary file data

**Response:**

```json
{
  "code": 0,
  "data": {
    "biz_data": {
      "id": "file-d3983c30-0679-425c-a3c0-6596940052f9",
      "status": "PENDING",
      "file_name": "README.md",
      "file_size": 3154
    }
  }
}
```

### Get File Status

```http
GET /api/v0/file/fetch_files?file_ids=file-xxx,file-yyy
Authorization: Bearer <token>
```

**Response:**

```json
{
  "code": 0,
  "data": {
    "biz_data": {
      "files": [
        {
          "id": "file-xxx",
          "status": "SUCCESS",
          "file_name": "README.md",
          "token_usage": 817
        }
      ]
    }
  }
}
```

### Get Model Settings

```http
GET /api/v0/client/settings?scope=model
Authorization: Bearer <token>
```

### Create PoW Challenge

```http
POST /api/v0/chat/create_pow_challenge
Content-Type: application/json
Authorization: Bearer <token>
```

## Models

| Model ID | Type | Reasoning | Search | Vision |
|----------|------|:---------:|:------:|:------:|
| `default` | V4 Flash | ✗ | ✗ | ✗ |
| `reasoner` | V4 Flash Reasoning | ✓ | ✗ | ✗ |
| `search` | V4 Flash Search | ✗ | ✓ | ✗ |
| `reasoner-search` | V4 Flash Reasoning+Search | ✓ | ✓ | ✗ |
| `expert` | V4 Pro | ✗ | ✗ | ✗ |
| `expert-reasoner` | V4 Pro Reasoning | ✓ | ✗ | ✗ |
| `expert-search` | V4 Pro Search | ✗ | ✓ | ✗ |
| `expert-reasoner-search` | V4 Pro Reasoning+Search | ✓ | ✓ | ✗ |
| `vision` | Vision | ✗ | ✗ | ✓ |
| `vision-reasoner` | Vision Reasoning | ✓ | ✗ | ✓ |

## Headers

```http
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ...
Origin: https://chat.deepseek.com
Referer: https://chat.deepseek.com/
x-client-version: 2.0.2
x-client-platform: web
Authorization: Bearer <token>
```

## Rate Limits

- ~2 concurrent requests per account
- Token expires in ~24 hours
- PoW required for chat completion

## Error Codes

| Status | Description |
|--------|-------------|
| 401 | Token expired |
| 403 | Invalid token |
| 429 | Rate limited |
| 400 | Bad request |
| 500 | Server error |
| 503 | Service unavailable |

## Implementation Notes

### Session Management

Sessions are cached per API key. Each session tracks:
- `chat_session_id` — UUID for the conversation
- `parent_message_id` — Last response message ID for continuity

### Proof of Work (PoW)

DeepSeek requires PoW verification for chat completion:
1. Call `POST /api/v0/chat/create_pow_challenge`
2. Solve challenge using SHA3-256 hash collision
3. Add `x-ds-pow-response` header to request

### Tool Calling

DeepSeek doesn't support native function calling. Tool calling is implemented via:
1. DSML prompt injection in system message
2. Parse `[TOOL🛠️]...[/TOOL🛠️]` markers in response
3. Convert to OpenAI `tool_calls` format

### Stream Parsing

DeepSeek uses two SSE formats:

**Format 1 (OpenAI-compatible):**
```json
{"choices": [{"delta": {"content": "text"}}]}
```

**Format 2 (v0 API):**
```json
{"p": "response/content", "v": "text"}
{"o": "APPEND", "v": "text"}
```
