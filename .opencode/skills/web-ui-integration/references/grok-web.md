# Grok Web Reference

## Overview
- **Provider ID**: `grok-web`
- **Website**: https://grok.com
- **Auth**: Cookie-based (sso= cookie)
- **Category**: Web UI Integration

## Authentication

### Get Access Token
1. Go to https://grok.com and sign in
2. Open DevTools → Application → Cookies
3. Copy `sso` cookie value
4. Add to 9Router as Grok Web provider

### Cookie Format
```
sso=<session-token>
```

## Endpoints

### Chat Completions
```
POST https://grok.com/rest/app-chat/conversations/new
```

### Headers
```javascript
headers: {
  "Content-Type": "application/json",
  "Cookie": "sso=YOUR_SESSION_TOKEN",
  "Accept": "text/event-stream"
}
```

## Models

### Free Tier
| Model ID | Name | Capabilities |
|----------|------|--------------|
| `grok-3` | Grok 3 | text, tools |
| `grok-3-mini` | Grok 3 Mini | text, thinking |
| `grok-4-mini` | Grok 4 Mini | text, thinking |
| `grok-4.1-mini` | Grok 4.1 Mini | text, thinking |
| `grok-4.1-fast` | Grok 4.1 Fast | text |

### SuperGrok (Paid)
| Model ID | Name | Capabilities |
|----------|------|--------------|
| `grok-4` | Grok 4 | text, tools |
| `grok-4-heavy` | Grok 4 Heavy | text, tools |
| `grok-4.1-expert` | Grok 4.1 Expert | text, tools |
| `grok-4.1-thinking` | Grok 4.1 Thinking | text, thinking |
| `grok-4.2` | Grok 4.2 | text, tools |

## Request Examples

### Chat Completion
```javascript
const response = await fetch('https://grok.com/rest/app-chat/conversations/new', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Cookie': 'sso=YOUR_SESSION_TOKEN'
  },
  body: JSON.stringify({
    model: 'grok-3',
    messages: [
      { role: 'user', content: 'Hello!' }
    ],
    stream: true
  })
});
```

## Vision Support

Grok supports image inputs:
```javascript
{
  model: 'grok-3',
  messages: [{
    role: 'user',
    content: [
      { type: 'image_url', image_url: { url: 'https://example.com/image.jpg' } },
      { type: 'text', text: 'Describe this image' }
    ]
  }]
}
```

## Executor Files
- Provider: `open-sse/providers/registry/grok-web.js`
- Executor: `open-sse/executors/grok-web.js`
- Tests: `test-grok-web.mjs`

## Limitations
- Free tier has limited requests
- Some models require SuperGrok subscription
- Token expires periodically
- Rate limits apply

## Troubleshooting

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Token expired | Get fresh cookie |
| 429 Rate Limited | Too many requests | Wait or upgrade |
| Model not found | Subscription required | Use free model |
