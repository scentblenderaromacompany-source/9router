/**
 * ChatGPT Web UI provider — native integration with Chat2API proxy
 * Uses ChatGPT access tokens to access models through web UI
 * Supports tool parsing, streaming, vision, and image generation
 */
export default {
  "id": "chatgpt-web",
  "priority": 140,
  "alias": "cgpt-web",
  "aliases": [
    "cgw"
  ],
  "uiAlias": "cgw",
  "display": {
    "name": "ChatGPT Web (Native)",
    "icon": "auto_awesome",
    "color": "#10A37F",
    "textIcon": "CGW",
    "website": "https://chatgpt.com",
    "notice": {
      "signupUrl": "https://chatgpt.com"
    },
    "kindNotice": {
      "image": "Requires a ChatGPT account with web access. Uses your ChatGPT Plus/Pro subscription quota for API calls."
    }
  },
  "category": "webCookie",
  "authType": "cookie",
  "authHint": "Paste your ChatGPT web accessToken (from chatgpt.com/api/auth/session)",
  "transport": {
    "baseUrl": "http://localhost:8700/v1",
    "format": "openai",
    "authType": "apikey"
  },
  "models": [
    {
      "id": "gpt-4o",
      "name": "GPT-4o",
      "capabilities": [
        "text",
        "vision",
        "tools"
      ],
      "params": [
        "temperature",
        "max_tokens",
        "top_p"
      ]
    },
    {
      "id": "gpt-4-turbo",
      "name": "GPT-4 Turbo",
      "capabilities": [
        "text",
        "vision",
        "tools"
      ],
      "params": [
        "temperature",
        "max_tokens",
        "top_p"
      ]
    },
    {
      "id": "gpt-4",
      "name": "GPT-4",
      "capabilities": [
        "text",
        "tools"
      ],
      "params": [
        "temperature",
        "max_tokens",
        "top_p"
      ]
    },
    {
      "id": "gpt-3.5-turbo",
      "name": "GPT-3.5 Turbo",
      "capabilities": [
        "text",
        "tools"
      ],
      "params": [
        "temperature",
        "max_tokens",
        "top_p"
      ]
    },
    {
      "id": "gpt-4-vision",
      "name": "GPT-4 Vision",
      "capabilities": [
        "text",
        "vision"
      ],
      "kind": "image",
      "params": [
        "temperature",
        "max_tokens",
        "top_p"
      ]
    },
    {
      "id": "gpt-4o-vision",
      "name": "GPT-4o Vision",
      "capabilities": [
        "text",
        "vision"
      ],
      "kind": "image",
      "params": [
        "temperature",
        "max_tokens",
        "top_p"
      ]
    },
    {
      "id": "gpt-image-2",
      "name": "DALL-E 3 (gpt-image-2)",
      "capabilities": [
        "text2img",
        "edit"
      ],
      "params": [
        "size",
        "quality",
        "style"
      ],
      "kind": "image"
    }
  ],
  "passthroughModels": true,
  "serviceKinds": [
    "llm",
    "image"
  ],
  "hasProviderSpecificData": false
};
