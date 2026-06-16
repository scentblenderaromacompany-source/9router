# Kimi Web API Reference

## Overview

Kimi Web API provides direct access to kimi.com's web interface.

**Base URL**: `https://kimi.com`

## Complete Endpoint List

### Chat Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat` | POST | Create new chat session |
| `/api/chat/{chat_id}/completion/stream` | POST | Send message (SSE streaming) |
| `/api/chat/{chat_id}/completion` | POST | Send message (non-streaming) |
| `/api/chat/{chat_id}` | GET | Get chat session info |
| `/api/chat/{chat_id}/messages` | GET | Get chat history |
| `/api/chat/{chat_id}` | DELETE | Delete chat session |
| `/api/chat/{chat_id}/title` | POST | Generate chat title |
| `/api/chat/{chat_id}/share` | POST | Share chat |
| `/api/chat/{chat_id}/memory` | POST | Save memory |
| `/api/chat/{chat_id}/memory` | GET | Get memory |
| `/api/chat/{chat_id}/regenerate` | POST | Regenerate last response |
| `/api/chat/{chat_id}/stop` | POST | Stop generation |

### File Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/files/upload` | POST | Upload file (multipart) |
| `/api/files` | GET | List files |

### User Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/user/me` | GET | Get current user info |
| `/api/models` | GET | List available models |
| `/api/subscription` | GET | Get subscription info |
| `/api/usage` | GET | Get usage stats |

### Search Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/search` | POST | Web search |

---

## Authentication

```http
Authorization: Bearer <BEARER_TOKEN>
```

Get token from: F12 → Network → any request → Authorization: Bearer token

Token lasts ~30 days.

## Required Headers

```http
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36
Origin: https://kimi.com
Referer: https://kimi.com/
Accept-Language: zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7
```

---

## Endpoint Details

### POST /api/chat

Create a new chat session.

**Request Body:**

```json
{}
```

**Response:**

```json
{
  "data": {
    "id": "chat-abc123",
    "name": "New Chat",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### POST /api/chat/{chat_id}/completion/stream

Send a message with SSE streaming response.

**Request Body:**

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

**Response (SSE Stream):**

```
event: cmpl
data: {"text": "Hello"}

event: cmpl
data: {"text": "!"}

data: [DONE]
```

### POST /api/chat/{chat_id}/completion

Send a message without streaming.

**Request Body:**

```json
{
  "model": "kimi-k2.7",
  "messages": [
    {"role": "user", "content": "Hello!"}
  ],
  "stream": false
}
```

**Response:**

```json
{
  "data": {
    "id": "msg-abc123",
    "content": "Hello! How can I help you?",
    "role": "assistant",
    "model": "kimi-k2.7"
  }
}
```

### GET /api/chat/{chat_id}

Get chat session information.

**Response:**

```json
{
  "data": {
    "id": "chat-abc123",
    "name": "My Chat",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T01:00:00Z"
  }
}
```

### GET /api/chat/{chat_id}/messages

Get chat history.

**Response:**

```json
{
  "data": {
    "messages": [
      {"id": "msg-1", "role": "user", "content": "Hello"},
      {"id": "msg-2", "role": "assistant", "content": "Hi there!"}
    ]
  }
}
```

### DELETE /api/chat/{chat_id}

Delete a chat session.

**Response:**

```json
{
  "data": {
    "success": true
  }
}
```

### POST /api/chat/{chat_id}/title

Generate a chat title.

**Response:**

```json
{
  "data": {
    "title": "Generated Title"
  }
}
```

### POST /api/chat/{chat_id}/share

Share a chat.

**Response:**

```json
{
  "data": {
    "share_url": "https://kimi.com/share/abc123"
  }
}
```

### POST /api/chat/{chat_id}/memory

Save memory for a chat session.

**Request Body:**

```json
{
  "memory": "User prefers Chinese responses"
}
```

**Response:**

```json
{
  "data": {
    "success": true
  }
}
```

### GET /api/chat/{chat_id}/memory

Get memory for a chat session.

**Response:**

```json
{
  "data": {
    "memory": "User prefers Chinese responses"
  }
}
```

### POST /api/chat/{chat_id}/regenerate

Regenerate the last response.

**Response:**

```json
{
  "data": {
    "id": "msg-new-abc123",
    "content": "Regenerated response...",
    "role": "assistant"
  }
}
```

### POST /api/chat/{chat_id}/stop

Stop ongoing generation.

**Response:**

```json
{
  "data": {
    "success": true
  }
}
```

### POST /api/files/upload

Upload a file (multipart/form-data).

**Headers:**

```http
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

**Response:**

```json
{
  "data": {
    "id": "file-abc123",
    "name": "document.pdf",
    "size": 12345
  }
}
```

### GET /api/files

List uploaded files.

**Response:**

```json
{
  "data": {
    "files": [
      {"id": "file-abc123", "name": "document.pdf", "size": 12345}
    ]
  }
}
```

### GET /api/user/me

Get current user information.

**Response:**

```json
{
  "data": {
    "id": "user-123",
    "name": "User",
    "email": "user@example.com"
  }
}
```

### GET /api/models

List available models.

**Response:**

```json
{
  "data": {
    "models": [
      {"id": "kimi-k2.7", "name": "Kimi K2.7"},
      {"id": "kimi-k2.6", "name": "Kimi K2.6"},
      {"id": "kimi-k2.5", "name": "Kimi K2.5"}
    ]
  }
}
```

### GET /api/subscription

Get subscription information.

**Response:**

```json
{
  "data": {
    "plan": "free",
    "expires_at": "2024-12-31T23:59:59Z"
  }
}
```

### GET /api/usage

Get usage statistics.

**Response:**

```json
{
  "data": {
    "messages_today": 50,
    "messages_limit": 100,
    "tokens_today": 10000,
    "tokens_limit": 100000
  }
}
```

### POST /api/search

Web search.

**Request Body:**

```json
{
  "query": "search terms"
}
```

**Response:**

```json
{
  "data": {
    "results": [
      {"title": "Result 1", "url": "https://...", "snippet": "..."}
    ]
  }
}
```

---

## Models

| Model ID | Type | Thinking | Vision | Tools |
|----------|------|:--------:|:------:|:-----:|
| `kimi-k2.7` | K2.7 | ✗ | ✗ | ✓ |
| `kimi-k2.7-thinking` | K2.7 Thinking | ✓ | ✗ | ✓ |
| `kimi-k2.7-code` | K2.7 Code | ✓ | ✗ | ✓ |
| `kimi-k2.6` | K2.6 | ✗ | ✗ | ✓ |
| `kimi-k2.6-thinking` | K2.6 Thinking | ✓ | ✗ | ✓ |
| `kimi-k2.5` | K2.5 | ✗ | ✓ | ✓ |
| `kimi-k2.5-thinking` | K2.5 Thinking | ✓ | ✓ | ✓ |
| `kimi-k2` | K2 | ✗ | ✗ | ✓ |
| `kimi-k2-thinking` | K2 Thinking | ✓ | ✗ | ✓ |
| `kimi-k1.5` | K1.5 | ✗ | ✗ | ✓ |
| `kimi-k1.5-thinking` | K1.5 Thinking | ✓ | ✗ | ✓ |
| `kimi` | Latest | ✗ | ✗ | ✓ |
| `kimi-vision` | Vision | ✗ | ✓ | ✗ |
| `ok-computer` | OK Computer | ✗ | ✗ | ✓ |

---

## Thinking Mode

For thinking models (e.g., `kimi-k2.7-thinking`), add the `thinking` parameter:

```json
{
  "model": "kimi-k2.7",
  "messages": [...],
  "thinking": {"type": "enabled"}
}
```

The response will include `reasoning_content` in the delta:

```json
{
  "choices": [{
    "delta": {
      "reasoning_content": "Let me think about this...",
      "content": "Here's my answer"
    }
  }]
}
```

---

## Tool Calling

Kimi supports builtin function tools like web search:

```json
{
  "model": "kimi-k2.7",
  "messages": [...],
  "tools": [
    {
      "type": "builtin_function",
      "function": {"name": "$web_search"}
    }
  ]
}
```

Available tools:
- `$web_search` - Web search
- `memory` - Memory storage and retrieval
- `code_runner` - Python code execution
- `quickjs` - JavaScript execution
- `excel` - Excel/CSV analysis
- `fetch` - URL content extraction
- `date` - Date/time processing
- `convert` - Unit conversion
- `base64` - Base64 encoding/decoding

---

## Stream Parsing

Kimi uses SSE with `event: cmpl` format:

**Content:**
```
event: cmpl
data: {"text": "Hello"}
```

**Thinking:**
```
event: cmpl
data: {"type": "thinking", "content": "reasoning text"}
```

**Done:**
```
data: [DONE]
```

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
- Token lasts ~30 days
- Sessions are cached and reused

---

## Memory System

Kimi supports persistent memory across conversations:

1. Save memory via `POST /api/chat/{chat_id}/memory`
2. Retrieve memory via `GET /api/chat/{chat_id}/memory`
3. Memory persists across sessions for the same user

---

## Agent Features

Kimi's OK Computer model supports advanced agent capabilities:

- Browser automation
- Code execution (Python, JavaScript)
- File system access
- Web search
- Memory persistence
- Todo list management

These are available through the `ok-computer` model with tool calling.
