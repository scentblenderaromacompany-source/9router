# Z.AI (Zhipu) Reference

## Overview
- **Provider ID**: `z-ai`
- **Website**: https://z.ai
- **API Docs**: https://docs.z.ai
- **API Key**: https://z.ai/manage-apikey/apikey-list

## API Endpoints

### Developer API (Recommended)
Base URL: `https://api.z.ai/api/paas/v4`

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/chat/completions` | POST | Chat, Vision, Tools |
| `/images/generations` | POST | Image generation |
| `/async/images/generations` | POST | Async image generation |
| `/videos/generations` | POST | Video generation |
| `/audio/transcriptions` | POST | Speech to text |
| `/layout_parsing` | POST | OCR/document parsing |
| `/web_search` | POST | Web search |
| `/reader` | POST | Web page reader |
| `/tokenizer` | POST | Text tokenization |
| `/async-result/{id}` | GET | Async result retrieval |

### Coding Plan Endpoint
Base URL: `https://api.z.ai/api/coding/paas/v4`

Same endpoints as developer API but uses Coding Plan quota.

### Web UI API (NOT Recommended)
Base URL: `https://chat.z.ai/api/v2`

⚠️ **Requires CAPTCHA verification - cannot be used for programmatic access**

## Authentication

```javascript
headers: {
  "Authorization": "Bearer YOUR_API_KEY",
  "Content-Type": "application/json",
  "Accept-Language": "en-US,en"
}
```

## Models

### Text Models
| Model ID | Name | Capabilities |
|----------|------|--------------|
| `glm-5.1` | GLM-5.1 | text, tools (128K context) |
| `glm-5-turbo` | GLM-5 Turbo | text, tools |
| `glm-5` | GLM-5 | text, tools |
| `glm-4.7` | GLM-4.7 | text, tools |
| `glm-4.7-flash` | GLM-4.7 Flash | text, tools |
| `glm-4.7-flashx` | GLM-4.7 FlashX | text, tools |
| `glm-4.6` | GLM-4.6 | text, tools |
| `glm-4.5` | GLM-4.5 | text, tools |
| `glm-4.5-air` | GLM-4.5 Air | text, tools |
| `glm-4.5-x` | GLM-4.5 X | text, tools |
| `glm-4.5-airx` | GLM-4.5 AirX | text, tools |
| `glm-4.5-flash` | GLM-4.5 Flash | text, tools |
| `glm-4-32b-0414-128k` | GLM-4 32B | text, tools |

### Vision Models
| Model ID | Name | Capabilities |
|----------|------|--------------|
| `glm-5v-turbo` | GLM-5V Turbo | text, vision, tools |
| `glm-4.6v` | GLM-4.6V | text, vision, tools |
| `glm-4.6v-flash` | GLM-4.6V Flash | text, vision |
| `glm-4.6v-flashx` | GLM-4.6V FlashX | text, vision |
| `glm-4.5v` | GLM-4.5V | text, vision |
| `autoglm-phone-multilingual` | AutoGLM Phone | text, vision, tools |

### Image Generation
| Model ID | Name |
|----------|------|
| `glm-image` | GLM-Image |
| `cogview-4` | CogView-4 |

### Video Generation
| Model ID | Name |
|----------|------|
| `cogvideox-3` | CogVideoX-3 |
| `vidu-q1` | Vidu Q1 |
| `vidu-2` | Vidu 2 |

### Audio
| Model ID | Name |
|----------|------|
| `glm-asr-2512` | GLM-ASR-2512 |

### OCR
| Model ID | Name |
|----------|------|
| `glm-ocr` | GLM-OCR |

## Request Examples

### Chat Completion
```javascript
const response = await fetch('https://api.z.ai/api/paas/v4/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    model: 'glm-5.1',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Hello!' }
    ],
    temperature: 1,
    stream: false
  })
});
```

### With Tools
```javascript
{
  model: 'glm-5.1',
  messages: [{ role: 'user', content: 'Weather in Beijing?' }],
  tools: [{
    type: 'function',
    function: {
      name: 'get_weather',
      description: 'Get weather for a city',
      parameters: {
        type: 'object',
        properties: { city: { type: 'string' } },
        required: ['city']
      }
    }
  }],
  tool_choice: 'auto'
}
```

### With Thinking Mode
```javascript
{
  model: 'glm-5.1',
  messages: [{ role: 'user', content: 'Think step by step' }],
  thinking: { type: 'enabled' },
  stream: true
}
```

### Vision
```javascript
{
  model: 'glm-5v-turbo',
  messages: [{
    role: 'user',
    content: [
      { type: 'image_url', image_url: { url: 'https://example.com/image.jpg' } },
      { type: 'text', text: 'Describe this image' }
    ]
  }]
}
```

### Image Generation
```javascript
const response = await fetch('https://api.z.ai/api/paas/v4/images/generations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    model: 'glm-image',
    prompt: 'A cute cat sitting on a windowsill',
    size: '1024x1024'
  })
});
```

## Executor Files
- Provider: `open-sse/providers/registry/z-ai.js`
- Executor: `open-sse/executors/z-ai.js`
- Tests: `test-z-ai.mjs`

## Notes
- Developer API is recommended (no CAPTCHA)
- Web UI API requires Alibaba Cloud CAPTCHA verification
- Thinking mode supported on GLM-4.5+ models
- 128K context on GLM-5.1, GLM-5, GLM-4.7 series
