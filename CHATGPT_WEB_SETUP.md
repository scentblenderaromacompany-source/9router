# ChatGPT Web UI Native Integration

9Router now includes native support for ChatGPT web accounts with full tool parsing and function calling. This integration allows you to use your ChatGPT Plus/Pro subscription models directly without requiring external proxies.

## Features

✅ **Native Integration** - No external Chat2API proxy needed (although you can use one)
✅ **Tool Parsing** - Full function calling and tool use support
✅ **Streaming** - Server-sent events for real-time responses
✅ **Vision** - Image understanding with vision models
✅ **Image Generation** - DALL-E 3 support for text-to-image generation
✅ **Multiple Models** - GPT-4o, GPT-4 Turbo, GPT-3.5 Turbo, and more

## Setup Instructions

### Step 1: Get Your ChatGPT Access Token

1. Visit [https://chatgpt.com](https://chatgpt.com) and log in to your ChatGPT account
2. Open your browser's Developer Tools (F12 / Cmd+Option+I)
3. Go to **Application** → **Cookies** → Search for `chatgpt.com`
4. Find the cookie named `__Secure-next-auth.session-token` and copy its value
5. This token is your **accessToken** for 9Router configuration

> **Note:** Your access token grants access to your ChatGPT account. **Keep it private** and never share it publicly.

### Step 2: Add ChatGPT Web Provider in 9Router

#### Option A: Via Dashboard UI (Recommended)

1. Open 9Router Dashboard
2. Go to **Settings** → **Providers**
3. Click **Add New Provider**
4. Select **ChatGPT Web (Native)**
5. Paste your access token
6. Click **Save**

#### Option B: Direct Configuration

Add to your provider configuration:

```json
{
  "id": "chatgpt-web",
  "provider": "chatgpt-web",
  "accessToken": "<your-access-token>",
  "models": [
    "gpt-4o",
    "gpt-4-turbo",
    "gpt-3.5-turbo"
  ]
}
```

### Step 3: Use ChatGPT Models

In any model selector, you can now use:
- `gpt-4o` - Latest GPT-4 with optimizations
- `gpt-4-turbo` - High-capability reasoning model
- `gpt-3.5-turbo` - Fast and efficient
- `gpt-4-vision` - Vision/image understanding
- `gpt-image-2` - DALL-E 3 image generation

## Advanced Configuration

### Using External Chat2API Proxy

If you prefer to use an external Chat2API proxy instead of the native integration:

1. **Install Chat2API**: 
   ```bash
   git clone https://github.com/Z7ANN/chat2api.git
   cd chat2api
   pip install -r requirements.txt
   python main.py
   ```

2. **Add OpenAI-Compatible Provider Node** in 9Router:
   ```json
   {
     "name": "Chat2API",
     "type": "openai-compatible",
     "prefix": "chat2api",
     "apiType": "chat",
     "baseUrl": "http://localhost:8700/v1",
     "apiKey": "any-value-or-empty"
   }
   ```

3. **Use Chat2API models** with the prefix:
   - `chat2api/gpt-4o`
   - `chat2api/gpt-4-turbo`
   - `chat2api/gpt-3.5-turbo`

### Custom Base URL

If running Chat2API on a different host/port:

```json
{
  "provider": "chatgpt-web",
  "accessToken": "<your-token>",
  "providerSpecificData": {
    "baseUrl": "http://your-proxy-host:8700/v1",
    "apiType": "chat"
  }
}
```

## Token Refresh

Access tokens eventually expire. To get a new token:

1. Visit [https://chatgpt.com/api/auth/session](https://chatgpt.com/api/auth/session) while logged in
2. Copy the `accessToken` field from the JSON response
3. Update your 9Router provider configuration with the new token

## Tool Parsing / Function Calling

Tool parsing works automatically:

```javascript
// This request will be processed with function calling support
const response = await fetch('/v1/chat/completions', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer <api-key>' },
  body: JSON.stringify({
    model: 'gpt-4o',
    messages: [
      { role: 'user', content: 'What time is it?' }
    ],
    tools: [
      {
        type: 'function',
        function: {
          name: 'get_current_time',
          description: 'Get the current time',
          parameters: { type: 'object', properties: {} }
        }
      }
    ]
  })
});
```

GPT-4o and other models will properly invoke the available tools without any special configuration.

## Troubleshooting

### "Unauthorized" or "401" Error
- Your access token has expired or is invalid
- Get a fresh token from [https://chatgpt.com/api/auth/session](https://chatgpt.com/api/auth/session)
- Make sure you copied the entire token value

### "Connection refused" to localhost:8700
- The Chat2API proxy is not running (if using external proxy option)
- Start Chat2API: `python main.py`
- Or use native integration which doesn't require a proxy

### Rate Limiting
- You've hit ChatGPT's rate limits
- Wait a few moments and retry
- Consider spacing out requests

### Tool Calling Not Working
- Ensure your model is GPT-4o or GPT-4-Turbo (GPT-3.5-Turbo has limited tool support)
- Verify tools are properly formatted in the request
- Check that function names are unique and valid

## Security Best Practices

1. **Keep tokens private** - Never commit access tokens to version control
2. **Use environment variables** - Store tokens in .env files (not in Git)
3. **Rotate tokens regularly** - Get fresh tokens periodically
4. **Disable sharing** - Don't share dashboard access if tokens are visible
5. **Use secrets management** - For production, use a secrets manager

## API Compatibility

The native ChatGPT Web integration is fully OpenAI API compatible:

```javascript
// Works with OpenAI SDK
const OpenAI = require('openai');

const client = new OpenAI({
  apiKey: '<9router-api-key>',
  baseURL: '<9router-base-url>'
});

const message = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Hello!' }],
  tools: [/* ... */]
});
```

## Model Availability

Models available through ChatGPT Web:

| Model | Description | Vision | Tools | Images |
|-------|-------------|--------|-------|--------|
| gpt-4o | Latest GPT-4 optimized | ✓ | ✓ | - |
| gpt-4-turbo | High-capability reasoning | ✓ | ✓ | - |
| gpt-4-vision | Vision-focused variant | ✓ | ✓ | - |
| gpt-3.5-turbo | Fast and efficient | - | Limited | - |
| gpt-image-2 | DALL-E 3 image generation | - | - | ✓ |

## FAQ

**Q: Do I need a ChatGPT Plus account?**
A: Yes, the native integration uses your ChatGPT account. You need an active subscription for the models you want to use.

**Q: Can I use multiple ChatGPT accounts?**
A: Yes, you can add multiple ChatGPT Web providers with different access tokens.

**Q: Is this officially supported by OpenAI?**
A: This is a community integration via the Chat2API project. It uses the same ChatGPT web interface you access in your browser.

**Q: What happens if ChatGPT changes their API?**
A: The Chat2API proxy handles web UI compatibility. The native integration is a pass-through, so it adapts when Chat2API updates.

## Support & Issues

- **Chat2API Issues**: [github.com/Z7ANN/chat2api/issues](https://github.com/Z7ANN/chat2api/issues)
- **9Router Issues**: [github.com/Z7ANN/9router/issues](https://github.com/Z7ANN/9router/issues)
