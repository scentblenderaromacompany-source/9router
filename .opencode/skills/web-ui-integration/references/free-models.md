# Free Models Reference

## Overview
Complete guide to free AI models available through web UI integrations in 9Router.

## ChatGPT Free Tier

### Available Models
| Model | Limits | Capabilities |
|-------|--------|--------------|
| GPT-4o Mini | Unlimited | text, tools |
| GPT-4o | 10 messages/5 hours | text, vision, tools |
| DALL-E 3 | Limited | image generation |

### How to Access
1. Create free account at https://chatgpt.com
2. Get access token from https://chatgpt.com/api/auth/session
3. Add to 9Router as ChatGPT Web provider
4. Use `gpt-4o-mini` model for unlimited access

### Limitations
- GPT-4o limited to ~10 messages per 5 hours
- 8K context window (vs 128K for paid)
- No o1/o3 reasoning models
- Rate limits during peak hours

## Z.AI Free Tier

### Available Models
| Model | Limits | Capabilities |
|-------|--------|--------------|
| GLM-4.7-Flash | Unlimited | text, tools (128K context) |
| GLM-4.5-Flash | Unlimited | text, tools |
| GLM-4.6V-Flash | Unlimited | text, vision |

### How to Access
1. Create free account at https://z.ai
2. Get API key from https://z.ai/manage-apikey/apikey-list
3. Add to 9Router as Z.AI provider
4. Use `glm-4.7-flash` model for free access

### Limits
- 1,000 requests/day free tier
- 3 requests/minute burst
- Rate-limited during peak hours
- All GLM models accessible (not just Flash)

### Paid Tier (If Needed)
| Model | Input | Output |
|-------|-------|--------|
| GLM-5.1 | $0.45/M | $1.80/M |
| GLM-4.7 | $0.30/M | $1.20/M |
| GLM-5 | $0.35/M | $1.40/M |

## Grok Free Tier

### Available Models
| Model | Limits | Capabilities |
|-------|--------|--------------|
| Grok-3 | Limited | text, tools |
| Grok-3 Mini | Limited | text, thinking |

### How to Access
1. Create free account at https://grok.com
2. Get sso cookie from DevTools
3. Add to 9Router as Grok Web provider

### Limits
- Limited daily requests
- Some models require SuperGrok ($30/month)

## Free Models Strategy

### Recommended Setup
1. **Primary**: ChatGPT Web with GPT-4o Mini (unlimited)
2. **Secondary**: Z.AI with GLM-4.7-Flash (1000 req/day)
3. **Backup**: Grok Web with Grok-3 (limited)

### Model Selection by Task
| Task | Recommended Model | Why |
|------|-------------------|-----|
| Simple chat | GPT-4o Mini | Unlimited, fast |
| Code generation | GLM-4.7-Flash | 128K context, good at code |
| Vision tasks | GPT-4o (when available) | Best vision capability |
| Complex reasoning | GLM-4.7-Flash | Large context, tools |
| Image generation | GPT-4o + DALL-E 3 | Best image quality |

### Account Management
- Use separate accounts for each provider
- Rotate accounts if rate limited
- Monitor usage to stay within limits
- Upgrade to paid if needed for production

## Cost Comparison

### Free Tier Value
| Provider | Free Models | Daily Limit | Monthly Value |
|----------|-------------|-------------|---------------|
| ChatGPT | GPT-4o Mini | Unlimited | ~$50 (vs API) |
| Z.AI | GLM-4.7-Flash | 1000 req | ~$30 (vs API) |
| Grok | Grok-3 | Limited | ~$20 (vs API) |

**Total Free Value**: ~$100/month

### Paid Alternatives
| Provider | Cheapest Paid | Cost |
|----------|---------------|------|
| OpenAI API | GPT-4o Mini | $0.15/M input |
| Z.AI API | GLM-4.7-Flash | Free (1000/day) |
| xAI API | Grok-3 | $3/M input |

## Setup Instructions

### ChatGPT Web
```javascript
// Provider config
{
  id: "chatgpt-web",
  transport: {
    baseUrl: "http://localhost:8700/v1",
    format: "openai"
  },
  models: ["gpt-4o-mini", "gpt-4o"]
}
```

### Z.AI
```javascript
// Provider config
{
  id: "z-ai",
  transport: {
    baseUrl: "https://api.z.ai/api/paas/v4",
    format: "openai"
  },
  models: ["glm-4.7-flash", "glm-4.5-flash", "glm-4.6v-flash"]
}
```

### Grok Web
```javascript
// Provider config
{
  id: "grok-web",
  transport: {
    baseUrl: "https://grok.com/rest/app-chat/conversations/new",
    format: "grok-web"
  },
  models: ["grok-3", "grok-3-mini"]
}
```

## Troubleshooting

### Rate Limits
- **ChatGPT**: Wait 5 hours, use GPT-4o Mini
- **Z.AI**: Wait 1 minute, use Flash models
- **Grok**: Wait 24 hours, use free models

### Token Expiry
- **ChatGPT**: Refresh from chatgpt.com/api/auth/session
- **Z.AI**: API keys don't expire
- **Grok**: Re-login to refresh sso cookie

### Model Not Available
- Check if model is free tier
- Verify account is active
- Try different model variant
