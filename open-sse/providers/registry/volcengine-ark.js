export default {
  "id": "volcengine-ark",
  "priority": 270,
  "alias": "volcengine-ark",
  "aliases": [
    "ark"
  ],
  "uiAlias": "ark",
  "display": {
    "name": "Volcengine Ark",
    "icon": "cloud",
    "color": "#1677FF",
    "textIcon": "ARK",
    "website": "https://ark.cn-beijing.volces.com",
    "notice": {
      "apiKeyUrl": "https://console.volcengine.com/ark/region:ark+cn-beijing/apiKey"
    }
  },
  "category": "apikey",
  "transport": {
    "baseUrl": "https://ark.cn-beijing.volces.com/api/coding/v3/chat/completions",
    "headers": {}
  },
  "models": [
    {
      "id": "Doubao-Seed-2.0-Code",
      "name": "Doubao-Seed-2.0-Code",
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
      "id": "Doubao-Seed-2.0-pro",
      "name": "Doubao-Seed-2.0-pro",
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
      "id": "Doubao-Seed-2.0-lite",
      "name": "Doubao-Seed-2.0-lite",
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
      "id": "Doubao-Seed-Code",
      "name": "Doubao-Seed-Code",
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
      "id": "DeepSeek-V4-Flash",
      "name": "DeepSeek-V4-Flash",
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
      "id": "DeepSeek-V4-Pro",
      "name": "DeepSeek-V4-Pro",
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
      "id": "GLM-5.1",
      "name": "GLM-5.1",
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
      "id": "MiniMax-M2.7",
      "name": "MiniMax-M2.7",
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
      "id": "Kimi-K2.6",
      "name": "Kimi-K2.6",
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
