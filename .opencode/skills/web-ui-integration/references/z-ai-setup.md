# Z.AI (Zhipu) Web Integration Setup

## Quick Start

### Step 1: Get API Key
Visit: https://z.ai/manage-apikey/apikey-list
Create a new API key and copy it

### Step 2: Add Provider
Go to **9Router Dashboard** → **Providers** → **Add Z.AI (Zhipu)**
Paste your API key

### Step 3: Use Models
Select `glm-5.1`, `glm-5-turbo`, `glm-4.7`, or other GLM models from the dropdown. Tools and function calling work automatically!

## Configuration

### Minimal
```json
{
  "provider": "z-ai",
  "apiKey": "<your-z-ai-api-key>"
}
```

### Full
```json
{
  "provider": "z-ai",
  "apiKey": "<your-z-ai-api-key>",
  "providerSpecificData": {
    "baseUrl": "https://api.z.ai/api/paas/v4",
    "useCodingEndpoint": false
  }
}
```

## Available Models

### Text Models
- `glm-5.1` - Latest flagship model (128K context)
- `glm-5-turbo` - Fast flagship model
- `glm-5` - Standard flagship
- `glm-4.7` - Previous generation
- `glm-4.7-flash` - Fast inference
- `glm-4.7-flashx` - Ultra-fast inference
- `glm-4.6` - Legacy model
- `glm-4.5` - Older generation
- `glm-4.5-air` - Lightweight
- `glm-4.5-airx` - Ultra-lightweight
- `glm-4.5-flash` - Fast legacy

### Vision Models
- `glm-5v-turbo` - Latest vision model
- `glm-4.6v` - Previous vision
- `glm-4.6v-flash` - Fast vision
- `glm-4.5v` - Legacy vision

## Features

- **Tool/Function Calling**: Full support on GLM-4.6+ models
- **Vision**: Image understanding on V-series models
- **Streaming**: Real-time SSE streaming
- **Thinking Mode**: Chain-of-thought reasoning on GLM-4.5+
- **JSON Mode**: Structured output with response_format

## Coding Plan Endpoint

For GLM Coding Plan subscribers, use the dedicated endpoint:

```json
{
  "provider": "z-ai",
  "apiKey": "<your-api-key>",
  "providerSpecificData": {
    "useCodingEndpoint": true
  }
}
```

This routes through `https://api.z.ai/api/coding/paas/v4` for Coding Plan quota.

## Browser Automation with agent-browser

Use [agent-browser](https://github.com/vercel-labs/agent-browser) to intercept and inspect z.ai web traffic:

### Install
```bash
npm install -g agent-browser
agent-browser install  # Download Chrome
```

### Intercept Z.AI Traffic
```bash
# Open Z.AI chat interface
agent-browser open https://z.ai
agent-browser snapshot -i

# Monitor network requests
agent-browser console --listen

# Execute JavaScript to capture API calls
agent-browser js "
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    console.log('Fetch:', args[0], args[1]);
    return originalFetch(...args);
  };
"
```

### Capture API Requests
```bash
# Open dev tools network tab equivalent
agent-browser open https://z.ai
agent-browser wait 3000
agent-browser js "
  performance.getEntriesByType('resource')
    .filter(r => r.name.includes('api.z.ai'))
    .forEach(r => console.log('API:', r.name));
"
```

## Troubleshooting

**Q: "401 Unauthorized"**
A: Get fresh API key from https://z.ai/manage-apikey/apikey-list

**Q: "429 Rate Limited"**
A: Check your quota in Z.AI dashboard. Use GLM-4.7-flash for lower quota usage.

**Q: "Tools not being invoked"**
A: Use models that support tools (glm-5.1, glm-5-turbo, glm-4.7+)

**Q: "Model not found"**
A: Check model ID is correct. Use passthroughModels to add custom models.

## API Reference

- **Base URL**: `https://api.z.ai/api/paas/v4`
- **Coding URL**: `https://api.z.ai/api/coding/paas/v4`
- **Auth**: Bearer token in Authorization header
- **Docs**: https://docs.z.ai/api-reference/llm/chat-completion
