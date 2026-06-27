# Duck.ai (DuckWeb) API Reference

Complete API documentation for Duck.ai (DuckDuckGo AI Chat) integration.

## Authentication

**No authentication required!** Duck.ai is free and anonymous.

## API Base URL

```
https://duck.ai
```

## Endpoints

### 1. Status (Get VQD Token)

**Endpoint:** `GET /duckchat/v1/status`

**Headers:**
```
Accept: */*
x-vqd-accept: 1
Referer: https://duckduckgo.com/
```

**Response Headers:**
- `x-vqd-hash-1`: Base64-encoded JavaScript challenge

### 2. Chat

**Endpoint:** `POST /duckchat/v1/chat`

**Headers:**
```
Content-Type: application/json
Accept: text/event-stream
x-vqd-hash-1: <solved_challenge>
x-fe-version: serp_YYYYMMDD_HHMMSS_ET-<hash>
x-fe-signals: <base64 JSON>
Origin: https://duck.ai
Referer: https://duck.ai/
```

**Request Body:**
```json
{
  "model": "gpt-4o-mini",
  "metadata": {
    "toolChoice": {
      "NewsSearch": false,
      "VideosSearch": false,
      "LocalSearch": false,
      "WeatherForecast": false,
      "WebSearch": false
    }
  },
  "messages": [
    {"role": "user", "content": "Hello"}
  ],
  "canUseTools": true,
  "reasoningEffort": "low",
  "canUseApproxLocation": null,
  "durableStream": {
    "messageId": "<uuid>",
    "conversationId": "<uuid>"
  }
}
```

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `model` | string | Yes | Model ID |
| `messages` | array | Yes | Array of message objects |
| `metadata.toolChoice` | object | Yes | Tool selection flags |
| `canUseTools` | boolean | No | Enable tool use |
| `reasoningEffort` | string | No | Reasoning level (none/minimal/low/medium/high) |
| `durableStream` | object | No | Stream persistence config |

**SSE Response Format:**
```
data: {"message": "Hello"}
data: {"message": " world"}
data: [DONE]
```

**Other Events:**
- `data: [CHAT_TITLE ...]` — Chat title
- `data: [LIMIT ...]` — Rate limit
- `data: [PING ...]` — Keepalive

## Models

| Model ID | Name | Reasoning | Vision | Web Search |
|----------|------|:--------:|:------:|:----------:|
| `gpt-4o-mini` | GPT-4o Mini | ✗ | ✓ | ✓ |
| `gpt-5-mini` | GPT-5 Mini | ✓ | ✓ | ✓ |
| `claude-haiku-4-5` | Claude Haiku 4.5 | ✓ | ✓ | ✓ |
| `meta-llama/Llama-4-Scout-17B-16E-Instruct` | Llama 4 Scout | ✗ | ✗ | ✗ |
| `mistral-small-2603` | Mistral Small | ✗ | ✗ | ✗ |
| `tinfoil/gpt-oss-120b` | GPT-OSS 120B | ✓ | ✗ | ✗ |

## Reasoning Effort

Only for reasoning models (`gpt-5-mini`, `claude-haiku-4-5`, `gpt-oss-120b`):

| Level | Description |
|-------|-------------|
| `none` | No thinking |
| `minimal` | Quick reasoning |
| `low` | Light reasoning |
| `medium` | Moderate reasoning |
| `high` | Deep reasoning |

## VQD Token Flow

1. Visit `https://duck.ai/` to get FE version
2. GET `/duckchat/v1/status` to get `x-vqd-hash-1`
3. Solve challenge (base64 decode → JS evaluation → hash)
4. Use solved hash in chat request
5. Server returns new hash in response headers
6. Repeat from step 4

## Rate Limits

- HTTP 429: Rate limited
- ERR_CONVERSATION_LIMIT: Conversation limit reached
- Recommended: max ~20 requests/minute
- Minimum 1s between requests

## Error Codes

| Status | Meaning |
|--------|---------|
| 418 | Challenge rejected (solve new VQD) |
| 429 | Rate limited |
| 5xx | Transient error (retry) |

## References

- [Duck.ai](https://duck.ai)
- [duck-ai-api (Node.js)](https://github.com/Brioch/duck-ai-api)
- [p2d-duck (Python)](https://github.com/pooraddyy/p2d-duck)

## 9Router Integration Notes (2026-06)

- In 9Router UI/API setup, treat Duck as a no-auth provider (`authType: "none"`) and allow saving connection without credentials.
- Real call check with `DuckWebExecutor` currently returns upstream HTTP 400 for a minimal prompt in this environment (provider reachable, request rejected by Duck side).
- When testing full `/api/v1/*` server routes in Next dev, unrelated webpack compile failure from `gemini-web` transitive dependency can cause HTTP 500 before executor logic runs.
