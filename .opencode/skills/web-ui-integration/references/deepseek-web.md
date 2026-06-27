# DeepSeek Web API Reference

## Overview

DeepSeek Web API provides direct access to chat.deepseek.com's web interface.

**Base URL**: `https://chat.deepseek.com/api/v0`

## Complete Endpoint List

### Chat Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/chat/completion` | POST | Send chat message (SSE streaming) |
| `/chat_session/create` | POST | Create new session |
| `/chat_session/delete` | POST | Delete session |
| `/chat/history_messages` | GET | Get chat history |
| `/chat/create_pow_challenge` | POST | Create PoW challenge |

### File Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/file/upload_file` | POST | Upload file (multipart) |
| `/file/fetch_files` | GET | Query file status |
| `/file/fork_file_task` | POST | Fork file (e.g., image to vision) |

### User Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/users/current` | GET | Get current user info (used for token validation) |
| `/users/login` | POST | Login with credentials |
| `/users/settings` | GET | Get user settings |
| `/users/settings` | PUT | Update user settings |

### Client Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/client/settings` | GET | Get client settings |
| `/client/settings?scope=model` | GET | Get model settings |

### Shared Conversation Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/shared/conversations` | GET | List shared conversations |
| `/shared/conversations/{id}` | GET | Get shared conversation |
| `/shared/conversations` | POST | Share conversation |

### Character Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/characters` | GET | List characters |
| `/characters/{id}` | GET | Get character |
| `/characters` | POST | Create character |

---

## Authentication

### Token Exchange

1. Call `GET /api/v0/users/current` with `Authorization: Bearer <USER_TOKEN>`
2. Response contains `data.biz_data.token` (access token) — valid for ~1 hour
3. Use access token for subsequent API calls

### Required Headers

```http
Authorization: Bearer <access_token>
Content-Type: application/json
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36
Origin: https://chat.deepseek.com
Referer: https://chat.deepseek.com/
X-App-Version: 2.0.0
X-Client-Locale: en_US
X-Client-Platform: web
X-Client-Version: 2.0.0
X-Ds-Pow-Response: <pow_solution_base64>
```

### Proof of Work (PoW)

Required for chat and file upload endpoints:

1. Call `POST /chat/create_pow_challenge` with `{"target_path": "/api/v0/chat/completion"}`
2. Solve challenge using WASM SHA-3 hash (algorithm: `DeepSeekHashV1`)
3. Encode solution as Base64 JSON and add to `X-Ds-Pow-Response` header

### Token Validation

To validate a USER_TOKEN, call `GET /api/v0/users/current`:
- HTTP 200 with `code: 0` → valid
- HTTP 401/403 or `code: 40003` → invalid/expired

---

## Endpoint Details

### POST /chat/completion

Send a chat message with SSE streaming response.

**Request Body:**

```json
{
  "chat_session_id": "uuid",
  "parent_message_id": null,
  "prompt": "Hello, how are you?",
  "ref_file_ids": [],
  "thinking_enabled": true,
  "search_enabled": false
}
```

**Response (SSE Stream):**

```
event: ready
data: {"request_message_id":3,"response_message_id":4,"model_type":"default"}

event: update_session
data: {"updated_at":1782482484.660483}

data: {"v":{"response":{"message_id":4,"parent_id":3,"model":"","role":"ASSISTANT","thinking_enabled":false,"ban_edit":false,"ban_regenerate":false,"status":"WIP","incomplete_message":null,"accumulated_token_usage":0,"feedback":null,"inserted_at":1782482484.648015,"search_enabled":false,"fragments":[{"id":2,"type":"RESPONSE","content":"Hello","references":[],"stage_id":1}],"conversation_mode":"DEFAULT","has_pending_fragment":false,"auto_continue":false,"search_triggered":false}}}

data: {"p":"response/fragments/-1/content","o":"APPEND","v":"."}

data: {"p":"response","o":"BATCH","v":[{"p":"accumulated_token_usage","v":49},{"p":"quasi_status","v":"FINISHED"}]}

data: {"p":"response/status","o":"SET","v":"FINISHED"}

event: update_session
data: {"updated_at":1782482484.824122}

event: close
data: {"click_behavior":"none","auto_resume":false}
```

### POST /chat_session/create

Create a new chat session.

**Request Body:**

```json
{
  "character_id": null
}
```

**Response:**

```json
{
  "code": 0,
  "data": {
    "biz_data": {
      "id": "acd61ee0-ceaa-426c-aaf2-5e91f6e8792c",
      "character_id": null,
      "model_type": "DEFAULT",
      "title": null,
      "title_type": "WIP",
      "version": 0,
      "current_message_id": null,
      "pinned": false,
      "inserted_at": 1774012756.515,
      "updated_at": 1774012756.515
    }
  },
  "chat_session_id": "acd61ee0-ceaa-426c-aaf2-5e91f6e8792c"
}
```

### POST /chat_session/delete

Delete a chat session.

**Request Body:**

```json
{
  "chat_session_id": "session-id"
}
```

### GET /chat/history_messages

Get conversation history.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| chat_session_id | string | Yes | Session ID |
| offset | integer | No | Offset (default: 0) |
| limit | integer | No | Limit (default: 20) |

**Response:**

```json
{
  "code": 0,
  "data": {
    "biz_data": {
      "chat_session": {
        "id": "acd61ee0-ceaa-426c-aaf2-5e91f6e8792c",
        "title": "My Conversation",
        "title_type": "FINAL",
        "pinned": false,
        "updated_at": 1774012756.515,
        "seq_id": 196175956,
        "agent": "chat",
        "version": 0,
        "current_message_id": null,
        "inserted_at": 1774012756.515
      },
      "chat_messages": [],
      "cache_valid": false,
      "route_id": null
    }
  }
}
```

### POST /chat/create_pow_challenge

Create a Proof of Work challenge.

**Request Body:**

```json
{
  "target_path": "/api/v0/chat/completion"
}
```

**Response:**

```json
{
  "code": 0,
  "data": {
    "biz_code": 0,
    "biz_msg": "",
    "biz_data": {
      "challenge": {
        "algorithm": "DeepSeekHashV1",
        "challenge": "0bbb2e1858e367e67ec0d9183f91554626673df2d595bec52e1388b1d3217ce1",
        "salt": "1044c2944c60cab9f056",
        "signature": "7137e3181ac684b26fbcb484660622505ef0502681350097c4488ab67a9e895a",
        "difficulty": 144000,
        "expire_at": 1782482728802,
        "expire_after": 300000,
        "target_path": "/api/v0/chat/completion"
      }
    }
  }
}
```

### POST /file/upload_file

Upload a file (multipart/form-data).

**Headers:**

```http
Content-Type: multipart/form-data
x-ds-pow-response: <pow_solution>
x-file-size: <file_size_bytes>
```

**Response:**

```json
{
  "code": 0,
  "data": {
    "biz_data": {
      "id": "file-d3983c30-0679-425c-a3c0-6596940052f9",
      "status": "PENDING",
      "file_name": "README.md",
      "previewable": false,
      "file_size": 3154,
      "token_usage": 0,
      "error_code": null,
      "inserted_at": 1774017375.563,
      "updated_at": 1774017375.563
    }
  }
}
```

### GET /file/fetch_files

Query file status.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| file_ids | string | Yes | Comma-separated file IDs |

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
          "previewable": true,
          "file_size": 3154,
          "token_usage": 817,
          "error_code": null,
          "inserted_at": 1774017375.563,
          "updated_at": 1774017639.0
        }
      ]
    }
  }
}
```

**File Status:**

| Status | Description |
|--------|-------------|
| PENDING | Parsing in progress |
| SUCCESS | Ready to use |
| FAILED | Parse failed |

### POST /file/fork_file_task

Fork a file to a different type (e.g., image to vision).

**Request Body:**

```json
{
  "file_id": "file-xxx",
  "fork_type": "vision"
}
```

### POST /users/login

Login with credentials.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

**Response:**

```json
{
  "code": 0,
  "data": {
    "biz_data": {
      "token": "eyJ...",
      "user_id": "user-123"
    }
  }
}
```

### GET /users/me

Get current user information.

**Response:**

```json
{
  "code": 0,
  "data": {
    "biz_data": {
      "id": "user-123",
      "email": "user@example.com",
      "name": "User",
      "avatar": "https://...",
      "created_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

### GET /client/settings

Get client settings.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| scope | string | No | "model" for model settings |

### GET /shared/conversations

List shared conversations.

### POST /shared/conversations

Share a conversation.

**Request Body:**

```json
{
  "chat_session_id": "session-id"
}
```

### GET /characters

List available characters.

### POST /characters

Create a custom character.

**Request Body:**

```json
{
  "name": "Assistant",
  "description": "A helpful assistant",
  "prompt": "You are a helpful assistant."
}
```

---

## Models

### Internal model_type Values (sent in API request)

| model_type | Base Model | Reasoning | Search |
|------------|------------|:---------:|:------:|
| `default` | V4 Flash | ✗ | ✗ |
| `default` + `thinking_enabled` | V4 Flash Reasoning | ✓ | ✗ |
| `default` + `search_enabled` | V4 Flash Search | ✗ | ✓ |
| `default` + both | V4 Flash Reasoning+Search | ✓ | ✓ |
| `expert` | V4 Pro | ✗ | ✗ |
| `expert` + `thinking_enabled` | V4 Pro Reasoning | ✓ | ✗ |
| `expert` + `search_enabled` | V4 Pro Search | ✗ | ✓ |
| `expert` + both | V4 Pro Reasoning+Search | ✓ | ✓ |

### User-Facing Model IDs (mapped by executor)

| Model ID | model_type | thinking | search |
|----------|:----------:|:--------:|:------:|
| `deepseek-v4-flash` | default | ✗ | ✗ |
| `deepseek-v4-flash-reasoner` | default | ✓ | ✗ |
| `deepseek-v4-flash-search` | default | ✗ | ✓ |
| `deepseek-v4-flash-reasoner-search` | default | ✓ | ✓ |
| `deepseek-v4-pro` | expert | ✗ | ✗ |
| `deepseek-v4-pro-reasoner` | expert | ✓ | ✗ |
| `deepseek-v4-pro-search` | expert | ✗ | ✓ |
| `deepseek-v4-pro-reasoner-search` | expert | ✓ | ✓ |
| `deepseek-chat` | default | ✗ | ✗ |
| `deepseek-reasoner` | default | ✓ | ✗ |

---

## Proof of Work (PoW)

DeepSeek requires PoW verification for chat and file upload endpoints.

**Flow:**

1. Call `POST /chat/create_pow_challenge` with target path
2. Solve challenge using SHA3-256 hash collision
3. Add `x-ds-pow-response` header to request

**Target Paths:**

| Endpoint | Target Path |
|----------|-------------|
| Chat completion | `/api/v0/chat/completion` |
| File upload | `/api/v0/file/upload_file` |

---

## Error Codes

| Status | Description |
|--------|-------------|
| 200 | Success |
| 400 | Bad request |
| 401 | Token expired/invalid |
| 403 | Forbidden |
| 429 | Rate limited |
| 500 | Server error |
| 503 | Service unavailable |

---

## Rate Limits

- ~2 concurrent requests per account
- Token expires in ~24 hours
- PoW required for chat completion
- File upload requires separate PoW

---

## Stream Parsing

DeepSeek uses two SSE formats:

**Format 1 (v0 format with fragments):**
```json
data: {"v":{"response":{"message_id":4,"parent_id":3,"model":"","role":"ASSISTANT","thinking_enabled":false,"ban_edit":false,"ban_regenerate":false,"status":"WIP","incomplete_message":null,"accumulated_token_usage":0,"feedback":null,"inserted_at":1782482484.648015,"search_enabled":false,"fragments":[{"id":2,"type":"RESPONSE","content":"Hello","references":[],"stage_id":1}],"conversation_mode":"DEFAULT","has_pending_fragment":false,"auto_continue":false,"search_triggered":false}}}

data: {"p":"response/fragments/-1/content","o":"APPEND","v":"."}

data: {"p":"response/status","o":"SET","v":"FINISHED"}
```

**Format 2 (OpenAI-compatible):**
```json
data: {"choices": [{"delta": {"content": "Hello"}, "finish_reason": null}]}
data: {"choices": [{"delta": {}, "finish_reason": "stop"}]}
data: [DONE]
```

**Status updates:**
```json
{"p": "response/status", "v": "FINISHED"}
```

**Message IDs:**
```json
{"request_message_id": 1, "response_message_id": 2}
```
