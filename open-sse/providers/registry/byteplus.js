export default {
  "id": "byteplus",
  "priority": 70,
  "alias": "byteplus",
  "aliases": [
    "bpm"
  ],
  "uiAlias": "bpm",
  "display": {
    "name": "BytePlus ModelArk",
    "icon": "cloud",
    "color": "#2563EB",
    "textIcon": "BP",
    "website": "https://console.byteplus.com/ark",
    "notice": {
      "text": "Free credits for new accounts. Access to Seed 2.0, Kimi K2 Thinking, GLM 4.7, GPT-OSS-120B models.",
      "apiKeyUrl": "https://console.byteplus.com/ark/region:ark+ap-southeast-1/apiKey"
    }
  },
  "category": "freeTier",
  "transport": {
    "baseUrl": "https://ark.ap-southeast.bytepluses.com/api/coding/v3/chat/completions",
    "headers": {}
  },
  "models": [
    {
      "id": "seed-2-0-pro-260328",
      "name": "Seed 2.0 Pro",
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
      "id": "seed-2-0-code-preview-260328",
      "name": "Seed 2.0 Code Preview",
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
      "id": "seed-2-0-mini-260215",
      "name": "Seed 2.0 Mini",
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
      "id": "seed-2-0-lite-260228",
      "name": "Seed 2.0 Lite",
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
      "id": "kimi-k2-thinking-251104",
      "name": "Kimi K2 Thinking",
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
      "id": "glm-4-7-251222",
      "name": "GLM 4.7",
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
      "id": "gpt-oss-120b-250805",
      "name": "GPT-OSS-120B",
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
  "serviceKinds": [
    "llm"
  ]
};
