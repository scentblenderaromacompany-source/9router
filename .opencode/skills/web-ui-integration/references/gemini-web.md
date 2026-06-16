# Gemini Web API Reference

Complete API documentation for Google Gemini Web UI integration.

## Authentication

Gemini uses Google account cookies for authentication.

**Required cookies:**
- `__Secure-1PSID` — Primary session cookie
- `__Secure-1PSIDTS` — Secondary session cookie (recommended)

**How to get cookies:**
1. Login to https://gemini.google.com
2. Open Developer Tools (F12) → Application → Cookies → .google.com
3. Copy `__Secure-1PSID` and `__Secure-1PSIDTS` values

**Cookie format:**
```
__Secure-1PSID=ANgEpph...; __Secure-1PSIDTS=AOESTxE...
```

## API Base URL

```
https://gemini.google.com
```

## Endpoints

### 1. StreamGenerate (Chat)

**Endpoint:** `POST /_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate`

**Headers:**
```
Content-Type: application/x-www-form-urlencoded;charset=utf-8
Origin: https://gemini.google.com
Referer: https://gemini.google.com/
X-Same-Domain: 1
Cookie: __Secure-1PSID=...; __Secure-1PSIDTS=...
```

**Query Parameters:**
```
hl=en
_reqid={random_5_digits}
rt=c
bl={build_label}
f.sid={session_id}
```

**Request Body (URL-encoded):**
```
f.req=[[null,"[81-element array]"]]
at={access_token}
```

**81-Element Sparse Array:**
| Index | Value | Description |
|-------|-------|-------------|
| 0 | `[prompt, 0, null, null, null, null, 0]` | Prompt and file data |
| 1 | `["en"]` | Language |
| 2 | `[cid, rid, rcid, ...]` | Chat metadata |
| 6 | `[1]` | Unknown |
| 7 | `1` or `0` | Streaming flag |
| 10 | `1` | Unknown |
| 19 | `model_id` | Model identifier |
| 27 | `1` | Unknown |
| 30 | `[4]` | Unknown |
| 41 | `[1]` | Unknown |
| 59 | `uuid` | Request UUID |
| 79 | `model_number` | Model tier number |
| 80 | `1` or `2` | Normal or extended thinking |

**Response Format:**

Response is NOT SSE — it's a custom chunked format:
```
{line_count}\n
line1\n
line2\n
...
```

Each line contains a nested array. Text content is in `[2]` (JSON string) → `[4][0][1][0]`.

### 2. BatchExecute (RPC)

**Endpoint:** `POST /_/BardChatUi/data/batchexecute`

Used for operations like listing chats, getting user status, etc.

**Headers:**
```
Content-Type: application/x-www-form-urlencoded;charset=utf-8
x-goog-ext-525001261-jspb: [1,null,null,null,null,null,null,null,[4,5,6,8],null,null,null,null,null,null,null]
x-goog-ext-73010989-jspb: [0]
```

**RPC IDs:**
| Function | RPC ID |
|----------|--------|
| Get User Status | `otAQ7b` |
| List Chats | `MaZiqc` |
| Read Chat | `hNvQHb` |
| Delete Chat | `GzXR5e` |

## Models

| Model ID | Internal ID | Capacity | Tier |
|----------|-------------|----------|------|
| gemini-3-pro | `9d8ca3786ebdfbea` | 1 | 3 |
| gemini-3-flash | `fbb127bbb056c959` | 1 | 1 |
| gemini-3-flash-thinking | `5bf011840784117a` | 1 | 1 |
| gemini-3-lite | `cf41b0e0dd7d53e5` | 1 | 6 |
| gemini-2.5-pro | `e6fa609c3fa255c0` | 4 | 3 |
| gemini-2.5-flash | `56fdd199312815e2` | 4 | 1 |

## Error Codes

| Code | Meaning |
|------|---------|
| 1013 | Temporary error (retry) |
| 1037 | Usage limit exceeded |
| 1050 | Model inconsistent with history |
| 1052 | Model unavailable |
| 1060 | IP temporarily blocked |

## Cookie Refresh

Cookies should be refreshed every ~10 minutes:

```
POST https://accounts.google.com/RotateCookies
```

## References

- [Gemini-API (Python)](https://github.com/HanaokaYuzu/Gemini-API)
- [Gemini-Reverse (Node.js)](https://github.com/rynn-k/Gemini-Reverse)
