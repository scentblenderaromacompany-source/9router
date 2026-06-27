export default {
  "id": "cerebras",
  "priority": 60,
  "alias": "cerebras",
  "display": {
    "name": "Cerebras",
    "icon": "memory",
    "color": "#FF4F00",
    "textIcon": "CB",
    "website": "https://www.cerebras.ai",
    "notice": {
      "apiKeyUrl": "https://cloud.cerebras.ai/platform"
    }
  },
  "category": "apikey",
  "transport": {
    "baseUrl": "https://api.cerebras.ai/v1/chat/completions",
    "validateUrl": "https://api.cerebras.ai/v1/models",
    "quirks": {
      "dropClientMetadata": true
    }
  },
  "models": [
    {
      "id": "gpt-oss-120b",
      "name": "GPT OSS 120B",
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
      "id": "zai-glm-4.7",
      "name": "ZAI GLM 4.7",
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
      "id": "llama-3.3-70b",
      "name": "Llama 3.3 70B",
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
      "id": "llama-4-scout-17b-16e-instruct",
      "name": "Llama 4 Scout",
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
      "id": "qwen-3-235b-a22b-instruct-2507",
      "name": "Qwen3 235B A22B",
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
      "id": "qwen-3-32b",
      "name": "Qwen3 32B",
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
