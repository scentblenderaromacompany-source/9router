# Gemini Web API Reference

## Overview

Gemini Web API provides direct access to gemini.google.com's web interface using browser cookies.

**Base URL**: `https://gemini.google.com`

## Status: WORKING

**Last tested**: 2026-06-27
**Test result**: Returns "HiHi" in response to "Say hi in one word"

## Authentication

Uses browser cookies from `gemini.google.com`:

- `__Secure-BUCKET` — Bucket cookie (required)
- `__Secure-1PSID` — Main session cookie
- `__Secure-1PSIDTS` — Session timestamp cookie
- `SID`, `HSID`, `SSID`, `APISID`, `SAPISID` — Additional auth cookies
- `__Secure-1PAPISID`, `__Secure-3PAPISID` — API cookies
- `SEARCH_SAMESITE`, `AEC`, `NID` — Other cookies
- `SIDCC`, `__Secure-1PSIDCC` — Security cookies
- `COMPASS` — Gemini-specific cookie

### How to Get Cookies

1. Login to https://gemini.google.com
2. Open Developer Tools (F12) → Application → Cookies
3. Copy ALL cookies from `.google.com` and `.gemini.google.com`
4. Format as cookie string: `__Secure-BUCKET=xxx; SID=yyy; ...`

### Required Cookies (from HAR analysis)

```
__Secure-BUCKET=CI4G
SID=g.a000_xxx
__Secure-1PSID=g.a000_xxx
__Secure-3PSID=g.a000_xxx
HSID=xxx
SSID=xxx
APISID=xxx
SAPISID=xxx
__Secure-1PAPISID=xxx
__Secure-3PAPISID=xxx
SEARCH_SAMESITE=xxx
AEC=xxx
NID=xxx
SIDCC=xxx
__Secure-1PSIDCC=xxx
COMPASS=xxx
```

## XSRF Token (`at`) - REQUIRED

**The `at` (XSRF) token is generated client-side by JavaScript at runtime.** It is NOT embedded in the HTML page.

### Automatic Extraction (requires Puppeteer + Chrome)

If Puppeteer and Chrome are installed, the executor automatically extracts the `at` token:

```bash
# Install Chrome for Puppeteer (one-time)
npx puppeteer browsers install chrome
```

### Manual Extraction

If Puppeteer is not available, you must provide the token manually:

1. Open Gemini in Chrome browser
2. Open DevTools (F12) → Network tab
3. Send a message in Gemini
4. Find the `StreamGenerate` request
5. Look at the POST body: `at=AD1_L...:timestamp`
6. Copy the full `at` value

### Passing Credentials

```javascript
const result = await executor.execute({
  model: 'gemini-3-flash',
  body: { messages },
  stream: false,
  credentials: {
    apiKey: '__Secure-BUCKET=xxx; SID=yyy; ...',  // all cookies
    xsrfToken: 'AD1_LW4ABImQjbjW_zsU5y0Pq9zo:1782560022823'  // optional if Puppeteer available
  }
});
```

## Endpoint

### POST /_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate

Send a chat message with streaming response.

**Headers (from HAR analysis):**

```http
Content-Type: application/x-www-form-urlencoded;charset=UTF-8
Origin: https://gemini.google.com
Referer: https://gemini.google.com/
X-Same-Domain: 1
Cookie: [all cookies]
User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36
Accept: */*
Accept-Encoding: gzip, deflate, br, zstd
Accept-Language: en-US,en;q=0.9
sec-ch-ua: "Google Chrome";v="149", "Chromium";v="149", "Not)A;Brand";v="24"
sec-ch-ua-mobile: ?0
sec-ch-ua-platform: "Linux"
sec-fetch-dest: empty
sec-fetch-mode: cors
sec-fetch-site: same-origin
x-browser-channel: stable
x-browser-copyright: Copyright 2026 Google LLC. All Rights Reserved.
x-browser-validation: 2ykZOU4XYx2sxnP11h4q1YHHPHU=
x-browser-year: 2026
x-client-data: COjvygE=
x-goog-ext-525001261-jspb: [1,null,null,null,"9d8ca3786ebdfbea",null,null,0,[4,5,6,8],null,null,1,null,null,3,1,"D1A8CFC1-112A-40C2-AC51-2EBF7E7453F4"]
x-goog-ext-525005358-jspb: ["5C7CD49B-CC82-4DA6-B8B0-518BC813EB51",1]
x-goog-ext-73010989-jspb: [0]
x-goog-ext-73010990-jspb: [0,0,0]
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| hl | string | Language (default: "en") |
| _reqid | string | Request ID (random 5-digit number) |
| rt | string | Request type (default: "c") |
| bl | string | Build label (from page init, e.g., `boq_assistant-bard-web-server_20260625.12_p1`) |
| f.sid | string | Session ID (from page init, e.g., `6395480719853026805`) |

**Request Body (URL-encoded):**

```
f.req=[null,"[<92-element sparse array>]"]&at=[xsrf_token]&
```

The 92-element array structure (from HAR analysis):

| Index | Value | Description |
|-------|-------|-------------|
| 0 | `[prompt, 0, null, null, null, null, 0]` | Prompt and metadata |
| 1 | `["en"]` | Language |
| 2 | `["", "", "", null, null, null, null, null, null, ""]` | Empty context |
| 3 | `"!" + random_base64` | Encrypted context string |
| 4 | `"07dd29e450ebbfd5b0737191eba88bbc"` | 32-char hex model ID |
| 6 | `[1]` | One array |
| 7 | `1` | Always 1 |
| 10 | `1` | One |
| 11 | `0` | Zero |
| 17 | `[[0]]` | Nested zero |
| 18 | `0` | Zero |
| 27 | `1` | One |
| 30 | `[4]` | Four array |
| 41 | `[1]` | One array |
| 53 | `0` | Zero |
| 59 | `"uuid"` | Request tracing UUID |
| 61 | `[]` | Empty array |
| 67 | `0` | Zero |
| 68 | `2` | Two |
| 79 | `3` | Model number (3 for flash) |
| 80 | `1` | One |
| 91 | `0` | Zero |

### Response Format (Non-SSE)

Gemini uses a non-standard streaming format (not SSE). Response starts with `)]}'` security prefix, then alternating line counts and JSON arrays.

**Response structure:**

```
)]}'
177
[["wrb.fr",null,"[null,[...],{...}]"]]
1331
[["wrb.fr",null,"[null,[...],{...}]"]]
```

**Content extraction path:**

```
parsed[0][2] → JSON string → inner[4][0][1][0] → text content
inner[4][0][8][0] === 2 → done indicator
inner[4][0][37][0][0] → thinking/reasoning content
```

**Example response lines:**

```json
[["wrb.fr",null,"[null,[\"c_00a76a0fd22acf83\",\"r_9ee01f90477acdad\"],null,null,[[\"rc_4a3f8fa905f807c1\",[\"Hi\"],null,null,null,null,null,null,[1],\"en\",...]]]]]
```

## Models

| Model ID | Name | Model Number |
|----------|------|:------------:|
| `gemini-3-pro` | Gemini 3 Pro | 3 |
| `gemini-3-flash` | Gemini 3 Flash | 3 |
| `gemini-3-flash-thinking` | Gemini 3 Flash Thinking | 1 |
| `gemini-3-lite` | Gemini 3 Lite | 6 |
| `gemini-2.5-pro` | Gemini 2.5 Pro | 3 |
| `gemini-2.5-flash` | Gemini 2.5 Flash | 1 |
| `gemini-2.0-flash` | Gemini 2.0 Flash | 1 |
| `gemini-2.0-flash-lite` | Gemini 2.0 Flash Lite | 1 |

## Features

- **Streaming** — Non-standard chunked format (not SSE)
- **Thinking/Reasoning** — Extracted from nested array path
- **Tool Calling** — Via bracket-format prompt injection
- **Multi-turn** — Session-based conversations

## Error Codes

| Status | Description |
|--------|-------------|
| 200 | Success |
| 401 | Auth failed (cookies expired) |
| 403 | Forbidden |
| 418 | Temporary error |
| 429 | Rate limited |

## API Error Codes (in response body)

| Code | Description |
|------|-------------|
| `[5]` | Invalid model or request |
| `[13]` | Missing or invalid `at` (XSRF) token |

## Rate Limits

- Cookie expires in ~30 days
- Concurrent requests limited
- Session may expire after inactivity

## Session Initialization

The executor initializes sessions by fetching the Gemini page to extract:
- `sessionId` (from `FdrFJe` in page JavaScript)
- `buildLabel` (from `cfb2h` or `cf` in page JavaScript)
- `accessToken` (from `SNlM0e` in page JavaScript — **NOTE: removed from HTML in April 2026**)

## HAR Analysis Notes

Key findings from analyzing a real browser HAR capture:

1. **`at` goes in POST body** as `at=` parameter, NOT in query string
2. **Extra headers required**: `x-browser-validation`, `x-goog-ext-*`, `sec-ch-ua*`, `x-client-data`
3. **`__Secure-BUCKET` cookie** is required
4. **Full cookie set** needed (not just `__Secure-1PSID`)
5. **Query params**: Only `bl`, `f.sid`, `hl`, `_reqid`, `rt` (NO `at`)
6. **User-Agent**: Chrome 149 on Linux
7. **`x-browser-validation`**: Static value `2ykZOU4XYx2sxnP11h4q1YHHPHU=`
8. **`x-goog-ext-525001261-jspb`**: Contains UUID and other data
9. **92-element array** (not 102) with specific values at each position
10. **Model ID at index [4]** as 32-char hex string (not at [19] as 16-char)
11. **Response format**: `)]}'` prefix, line counts, wrapped arrays

## Implementation Notes

- Uses `node:sqlite` for database (Node 24.14.0)
- `better-sqlite3` unavailable
- `resolveProviderId("gw")` resolves via alias system
- Provider alias collision fixed: `gemini-web` uses `uiAlias: "gmw"`
