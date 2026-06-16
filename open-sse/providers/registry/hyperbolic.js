export default {
  "id": "hyperbolic",
  "priority": 160,
  "alias": "hyperbolic",
  "aliases": [
    "hyp"
  ],
  "uiAlias": "hyp",
  "display": {
    "name": "Hyperbolic",
    "icon": "bolt",
    "color": "#00D4FF",
    "textIcon": "HY",
    "website": "https://hyperbolic.xyz",
    "notice": {
      "apiKeyUrl": "https://app.hyperbolic.xyz/settings"
    }
  },
  "category": "apikey",
  "authType": "apikey",
  "transport": {
    "baseUrl": "https://api.hyperbolic.xyz/v1/chat/completions",
    "validateUrl": "https://api.hyperbolic.xyz/v1/models"
  },
  "models": [
    {
      "id": "Qwen/QwQ-32B",
      "name": "QwQ 32B",
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
      "id": "deepseek-ai/DeepSeek-R1",
      "name": "DeepSeek R1",
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
      "id": "deepseek-ai/DeepSeek-V3",
      "name": "DeepSeek V3",
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
      "id": "meta-llama/Llama-3.3-70B-Instruct",
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
      "id": "meta-llama/Llama-3.2-3B-Instruct",
      "name": "Llama 3.2 3B",
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
      "id": "Qwen/Qwen2.5-72B-Instruct",
      "name": "Qwen 2.5 72B",
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
      "id": "Qwen/Qwen2.5-Coder-32B-Instruct",
      "name": "Qwen 2.5 Coder 32B",
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
      "id": "NousResearch/Hermes-3-Llama-3.1-70B",
      "name": "Hermes 3 70B",
      "capabilities": [
        "text",
        "web"
      ],
      "params": [
        "query",
        "max_results",
        "filter"
      ]
    }
  ]
};
