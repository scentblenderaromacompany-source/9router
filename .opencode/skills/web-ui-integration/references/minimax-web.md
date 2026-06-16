# MiniMax Web API Reference

Complete API documentation for MiniMax Web UI integration.

## Authentication

MiniMax uses a Bearer token extracted from localStorage:

1. Login to https://hailuoai.com
2. Open Developer Tools → Application → Local Storage
3. Copy `_token` and `realUserID` values
4. Combine as: `realUserID + _token`

**Token format:**
```
Bearer 450234567894+eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Header:**
```
Authorization: Bearer <realUserID+_token>
```

**Expiry:** No automatic refresh — token persists until logout.

## API Base URL

```
https://hailuoai.com
```

## Endpoints

### 1. Chat Completions

**Endpoint:** `POST /v1/chat/completions`

**Description:** Send a chat message and receive streaming or non-streaming response.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
Accept: text/event-stream
Origin: https://hailuoai.com
```

**Request Body:**
```json
{
  "model": "MiniMax-M3",
  "messages": [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Hello!"}
  ],
  "stream": true,
  "temperature": 0.7,
  "max_tokens": 4096
}
```

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `model` | string | Yes | Model ID (see models section) |
| `messages` | array | Yes | Array of message objects |
| `stream` | boolean | No | Enable SSE streaming (default: false) |
| `temperature` | number | No | Sampling temperature (0-2) |
| `max_tokens` | integer | No | Maximum tokens to generate |
| `tools` | array | No | Tool definitions for function calling |

**Message Object:**
```json
{
  "role": "user",
  "content": "Hello!"
}
```

Roles: `system`, `user`, `assistant`

**SSE Response Format:**
```
data: {"id":"chatcmpl-123","choices":[{"delta":{"content":"Hello"},"finish_reason":null}]}

data: {"id":"chatcmpl-123","choices":[{"delta":{"content":"!"},"finish_reason":null}]}

data: {"id":"chatcmpl-123","choices":[{"delta":{},"finish_reason":"stop"}]}

data: [DONE]
```

**Non-streaming Response:**
```json
{
  "id": "chatcmpl-123",
  "choices": [
    {
      "message": {"role": "assistant", "content": "Hello!"},
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 5,
    "total_tokens": 15
  }
}
```

### 2. Text-to-Speech

**Endpoint:** `POST /v1/audio/speech`

**Description:** Convert text to speech audio.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "model": "speech-01",
  "input": "Hello, this is a test.",
  "voice": "male-qn-qingse"
}
```

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `model` | string | Yes | TTS model ID |
| `input` | string | Yes | Text to convert |
| `voice` | string | Yes | Voice ID |

**Response:** Audio binary (audio/mpeg)

### 3. Speech-to-Text

**Endpoint:** `POST /v1/audio/transcriptions`

**Description:** Transcribe audio to text.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (multipart):**
- `file`: Audio file (wav, mp3, m4a)
- `model`: STT model ID

**Response:**
```json
{
  "text": "Transcribed text..."
}
```

### 4. Token Check

**Endpoint:** `GET /token/check`

**Description:** Verify if the current token is valid.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "valid": true,
  "userId": "450234567894"
}
```

## Models

### Chat Models

| Model ID | Name | Thinking | Vision | Search |
|----------|------|:--------:|:------:|:------:|
| `MiniMax-M3` | MiniMax M3 | ✗ | ✓ | ✓ |
| `MiniMax-M3` + thinking | MiniMax M3 Thinking | ✓ | ✓ | ✓ |
| `MiniMax-M2.7` | MiniMax M2.7 | ✗ | ✓ | ✓ |
| `MiniMax-M2.7` + thinking | MiniMax M2.7 Thinking | ✓ | ✓ | ✓ |
| `MiniMax-M2.5` | MiniMax M2.5 | ✗ | ✓ | ✓ |
| `MiniMax-M2.5` + thinking | MiniMax M2.5 Thinking | ✓ | ✓ | ✓ |
| `MiniMax-M2.1` | MiniMax M2.1 | ✗ | ✗ | ✗ |
| `MiniMax-M2.1` + thinking | MiniMax M2.1 Thinking | ✓ | ✗ | ✗ |
| `MiniMax-M2` | MiniMax M2 | ✗ | ✗ | ✗ |
| `MiniMax-M2` + thinking | MiniMax M2 Thinking | ✓ | ✗ | ✗ |
| `hailuo` | Hailuo | ✗ | ✗ | ✗ |
| `hailuo-fast` | Hailuo Fast | ✗ | ✗ | ✗ |

**Thinking mode:** Enabled via message content or provider-specific parameter.

### Audio Models

| Model ID | Type |
|----------|------|
| `speech-01` | Text-to-Speech |
| `speech-02` | Text-to-Speech (multilingual) |
| `speech-03` | Text-to-Speech (emotion) |
| `audio-01` | Speech-to-Text |

## Error Codes

| Status | Code | Description |
|--------|------|-------------|
| 400 | `bad_request` | Invalid request body |
| 401 | `unauthorized` | Invalid or expired token |
| 403 | `forbidden` | Account suspended or restricted |
| 429 | `rate_limited` | Too many requests |
| 500 | `server_error` | Internal server error |

## Stream Parsing

**SSE format:**
```
data: {json}\n\n
```

**Parse steps:**
1. Split response by `\n\n`
2. Filter lines starting with `data: `
3. Skip `data: [DONE]`
4. Parse JSON from remaining lines

**Chunk structure:**
```json
{
  "id": "chatcmpl-123",
  "choices": [
    {
      "delta": {
        "content": "Hello"
      },
      "finish_reason": null
    }
  ]
}
```

**Finish reasons:**
- `stop`: Normal completion
- `length`: Hit token limit
- `tool_calls`: Model wants to call a tool

## Rate Limits

- Concurrent requests: ~2 per account
- Requests per minute: ~60
- Tokens per minute: ~100,000

## Common Issues

### 401 Unauthorized
- Token expired or invalid
- Re-extract token from browser

### 429 Rate Limited
- Too many concurrent requests
- Wait and retry

### Empty Response
- Check model name is correct
- Verify token has not expired

## Example Code

### Node.js (Native Fetch)

```javascript
async function chat(message, token) {
  const response = await fetch('https://hailuoai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
      'Origin': 'https://hailuoai.com'
    },
    body: JSON.stringify({
      model: 'MiniMax-M3',
      messages: [{ role: 'user', content: message }],
      stream: true
    })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') break;

        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) process.stdout.write(content);
      }
    }
  }
}
```

### curl

```bash
curl -X POST https://hailuoai.com/v1/chat/completions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -H "Origin: https://hailuoai.com" \
  -d '{
    "model": "MiniMax-M3",
    "messages": [{"role": "user", "content": "Hello!"}],
    "stream": true
  }'
```

## References

- [MiniMax API Documentation](https://api.minimax.chat)
- [MiniMax Platform](https://hailuoai.com)
