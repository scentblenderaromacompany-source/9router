# ChatGPT Web Reference

## Overview
- **Provider ID**: `chatgpt-web`
- **Website**: https://chatgpt.com
- **Proxy**: Chat2API (https://github.com/Z7ANN/chat2api)
- **Auth**: ChatGPT access token (not API key)

## Architecture

```
9Router → Chat2API Proxy → ChatGPT Web UI
```

The Chat2API proxy converts ChatGPT web interface into an OpenAI-compatible API.

## Setup

### Option A: Native Provider (Recommended)
1. Get access token from https://chatgpt.com/api/auth/session
2. Go to Providers → Add ChatGPT Web (Native)
3. Paste access token

### Option B: External Chat2API Proxy
1. Install Chat2API from https://github.com/Z7ANN/chat2api
2. Configure as OpenAI-compatible endpoint

## Authentication

### Access Token
```javascript
// Get from: https://chatgpt.com/api/auth/session
headers: {
  "Authorization": "Bearer YOUR_ACCESS_TOKEN",
  "Content-Type": "application/json"
}
```

### API Key (via proxy)
```javascript
headers: {
  "Authorization": "Bearer YOUR_API_KEY",
  "Content-Type": "application/json"
}
```

## Endpoints

### Chat Completions
```
POST http://localhost:8700/v1/chat/completions
```

### Image Generation
```
POST http://localhost:8700/v1/images/generations
```

## Models

| Model ID | Name | Capabilities |
|----------|------|--------------|
| `gpt-4o` | GPT-4o | text, vision, tools |
| `gpt-4-turbo` | GPT-4 Turbo | text, vision, tools |
| `gpt-4` | GPT-4 | text, tools |
| `gpt-3.5-turbo` | GPT-3.5 Turbo | text, tools |
| `gpt-4-vision` | GPT-4 Vision | text, vision |
| `gpt-4o-vision` | GPT-4o Vision | text, vision |
| `gpt-image-2` | DALL-E 3 | text2img, edit |

## Request Examples

### Chat Completion
```javascript
const response = await fetch('http://localhost:8700/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
  },
  body: JSON.stringify({
    model: 'gpt-4o',
    messages: [
      { role: 'user', content: 'Hello!' }
    ],
    stream: true
  })
});
```

### With Tools
```javascript
{
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Weather in NYC?' }],
  tools: [{
    type: 'function',
    function: {
      name: 'get_weather',
      description: 'Get weather for a location',
      parameters: {
        type: 'object',
        properties: { location: { type: 'string' } },
        required: ['location']
      }
    }
  }]
}
```

### Image Generation
```javascript
{
  model: 'gpt-image-2',
  prompt: 'A sunset over mountains',
  size: '1024x1024',
  quality: 'hd',
  style: 'vivid'
}
```

## Tool Parsing

ChatGPT Web supports native tool/function calling:

1. Tools are parsed from the response
2. Tool calls are extracted and formatted
3. Results are sent back to continue the conversation

### Tool Response Format
```javascript
{
  choices: [{
    message: {
      role: 'assistant',
      tool_calls: [{
        id: 'call_abc123',
        type: 'function',
        function: {
          name: 'get_weather',
          arguments: '{"location":"NYC"}'
        }
      }]
    }
  }]
}
```

## Vision Support

GPT-4o and GPT-4-turbo support image inputs:

```javascript
{
  model: 'gpt-4o',
  messages: [{
    role: 'user',
    content: [
      { type: 'image_url', image_url: { url: 'https://example.com/image.jpg' } },
      { type: 'text', text: 'What is in this image?' }
    ]
  }]
}
```

## Executor Files
- Provider: `open-sse/providers/registry/chatgpt-web.js`
- Executor: `open-sse/executors/chatgpt-web.js`
- Tests: `test-chatgpt-web.mjs`

## Limitations
- Requires active ChatGPT Plus/Pro subscription
- Token expires periodically (need refresh)
- Rate limits apply based on subscription tier
- Some features may not work through proxy

## Troubleshooting

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Token expired | Get fresh token from chatgpt.com/api/auth/session |
| 429 Rate Limited | Too many requests | Wait or upgrade subscription |
| Tool parsing failed | Model mismatch | Use gpt-4o or gpt-4-turbo |
