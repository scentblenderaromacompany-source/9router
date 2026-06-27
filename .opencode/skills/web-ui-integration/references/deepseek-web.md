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
| `/users/login` | POST | Login with credentials |
| `/users/me` | GET | Get current user info |
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

```http
Authorization: Bearer <USER_TOKEN>
```

Get token from: F12 → Application → Local Storage → chat.deepseek.com → USER_TOKEN

## Required Headers

```http
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36
Origin: https://chat.deepseek.com
Referer: https://chat.deepseek.com/
x-app-version: 20241129.1
x-client-locale: en_US
x-client-platform: web
x-client-version: 1.0.0-always
x-ds-pow-response: <pow_solution>
```

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
data: {"request_message_id":1,"response_message_id":2}

data: {"p":"response/content","v":"Hello"}

data: {"p":"response/status","v":"FINISHED"}

event: finish
data: {}
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
    "biz_data": {
      "challenge": {
        "algorithm": "DeepSeekHashV1",
        "target": "00000...",
        "salt": "random_string"
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

**Format 1 (Full format):**
```json
{"p": "response/content", "o": "APPEND", "v": "text"}
```

**Format 2 (Simplified):**
```json
{"v": "text"}
```

**Status updates:**
```json
{"p": "response/status", "v": "FINISHED"}
```

**Message IDs:**
```json
{"request_message_id": 1, "response_message_id": 2}
```
