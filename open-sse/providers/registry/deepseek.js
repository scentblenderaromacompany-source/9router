export default {
  "id": "deepseek",
  "priority": 110,
  "alias": "deepseek",
  "aliases": [
    "ds"
  ],
  "uiAlias": "ds",
  "display": {
    "name": "DeepSeek",
    "icon": "bolt",
    "color": "#4D6BFE",
    "textIcon": "DS",
    "website": "https://deepseek.com",
    "notice": {
      "apiKeyUrl": "https://platform.deepseek.com/api_keys"
    }
  },
  "category": "apikey",
  "transport": {
    "baseUrl": "https://api.deepseek.com/chat/completions",
    "validateUrl": "https://api.deepseek.com/models",
    "reasoningInject": {
      "scope": "all"
    }
  },
  "models": [
    {
      "id": "deepseek-v4-pro",
      "name": "DeepSeek V4 Pro",
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
      "id": "deepseek-v4-pro-max",
      "name": "DeepSeek V4 Pro Max",
      "upstreamModelId": "deepseek-v4-pro",
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
      "id": "deepseek-v4-pro-none",
      "name": "DeepSeek V4 Pro No Thinking",
      "upstreamModelId": "deepseek-v4-pro",
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
      "id": "deepseek-v4-flash",
      "name": "DeepSeek V4 Flash",
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
      "id": "deepseek-chat",
      "name": "DeepSeek V3.2 Chat",
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
      "id": "deepseek-reasoner",
      "name": "DeepSeek V3.2 Reasoner",
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
  ]
};
