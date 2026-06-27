export default {
  "id": "cline",
  "priority": 80,
  "alias": "cl",
  "uiAlias": "cl",
  "display": {
    "name": "Cline",
    "icon": "smart_toy",
    "color": "#5B9BD5",
    "textIcon": "CL",
    "website": "https://cline.bot",
    "notice": {
      "signupUrl": "https://cline.bot"
    }
  },
  "category": "oauth",
  "transport": {
    "baseUrl": "https://api.cline.bot/api/v1/chat/completions",
    "headers": {
      "HTTP-Referer": "https://cline.bot",
      "X-Title": "Cline"
    },
    "tokenUrl": "https://api.cline.bot/api/v1/auth/token",
    "refreshUrl": "https://api.cline.bot/api/v1/auth/refresh",
    "auth": {
      "combined": true,
      "header": "Authorization",
      "scheme": "bearer",
      "hooks": [
        "clineHeaders"
      ]
    }
  },
  "models": [
    {
      "id": "anthropic/claude-opus-4.7",
      "name": "Claude Opus 4.7",
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
      "id": "anthropic/claude-sonnet-4.6",
      "name": "Claude Sonnet 4.6",
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
      "id": "anthropic/claude-opus-4.6",
      "name": "Claude Opus 4.6",
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
      "id": "openai/gpt-5.3-codex",
      "name": "GPT-5.3 Codex",
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
      "id": "openai/gpt-5.4",
      "name": "GPT-5.4",
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
      "id": "google/gemini-3.1-pro-preview",
      "name": "Gemini 3.1 Pro Preview",
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
      "id": "google/gemini-3.1-flash-lite-preview",
      "name": "Gemini 3.1 Flash Lite Preview",
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
      "id": "kwaipilot/kat-coder-pro",
      "name": "KAT Coder Pro",
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
    "appBaseUrl": "https://app.cline.bot",
    "apiBaseUrl": "https://api.cline.bot",
    "authorizeUrl": "https://api.cline.bot/api/v1/auth/authorize",
    "tokenExchangeUrl": "https://api.cline.bot/api/v1/auth/token",
    "refreshUrl": "https://api.cline.bot/api/v1/auth/refresh"
  }
};
