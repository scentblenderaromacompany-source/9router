export default {
  "id": "alicode-intl",
  "priority": 10,
  "alias": "alicode-intl",
  "display": {
    "name": "Alibaba Intl",
    "icon": "cloud",
    "color": "#FF6A00",
    "textIcon": "ALi",
    "website": "https://modelstudio.console.alibabacloud.com",
    "notice": {
      "apiKeyUrl": "https://modelstudio.console.alibabacloud.com/?apiKey=1"
    }
  },
  "category": "apikey",
  "transport": {
    "baseUrl": "https://coding-intl.dashscope.aliyuncs.com/v1/chat/completions",
    "headers": {}
  },
  "models": [
    {
      "id": "qwen3.5-plus",
      "name": "Qwen3.5 Plus",
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
      "id": "kimi-k2.5",
      "name": "Kimi K2.5",
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
      "id": "glm-5",
      "name": "GLM 5",
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
      "id": "MiniMax-M2.5",
      "name": "MiniMax M2.5",
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
      "id": "qwen3-coder-next",
      "name": "Qwen3 Coder Next",
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
      "id": "qwen3-coder-plus",
      "name": "Qwen3 Coder Plus",
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
      "id": "glm-4.7",
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
    }
  ]
};
