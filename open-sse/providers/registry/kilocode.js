export default {
  "id": "kilocode",
  "priority": 70,
  "alias": "kc",
  "uiAlias": "kc",
  "display": {
    "name": "Kilo Code",
    "icon": "code",
    "color": "#FF6B35",
    "textIcon": "KC",
    "website": "https://kilocode.ai",
    "notice": {
      "signupUrl": "https://kilocode.ai"
    }
  },
  "category": "oauth",
  "transport": {
    "baseUrl": "https://api.kilo.ai/api/openrouter/chat/completions",
    "headers": {},
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer",
      "hooks": [
        "kilocodeOrg"
      ]
    }
  },
  "models": [
    {
      "id": "anthropic/claude-sonnet-4-20250514",
      "name": "Claude Sonnet 4",
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
      "id": "anthropic/claude-opus-4-20250514",
      "name": "Claude Opus 4",
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
      "id": "google/gemini-2.5-pro",
      "name": "Gemini 2.5 Pro",
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
      "id": "google/gemini-2.5-flash",
      "name": "Gemini 2.5 Flash",
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
      "id": "openai/gpt-4.1",
      "name": "GPT-4.1",
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
      "id": "openai/o3",
      "name": "o3",
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
      "id": "deepseek/deepseek-chat",
      "name": "DeepSeek Chat",
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
      "id": "deepseek/deepseek-reasoner",
      "name": "DeepSeek Reasoner",
      "capabilities": [
        "text",
        "tools"
      ],
      "params": [
        "temperature",
        "max_tokens",
        "top_p"
      ]
    }
  ],
  "oauth": {
    "apiBaseUrl": "https://api.kilo.ai",
    "initiateUrl": "https://api.kilo.ai/api/device-auth/codes",
    "pollUrlBase": "https://api.kilo.ai/api/device-auth/codes"
  }
};
