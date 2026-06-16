export default {
  "id": "iflow",
  "hidden": true,
  "priority": 110,
  "alias": "if",
  "display": {
    "name": "iFlow AI",
    "icon": "water_drop",
    "color": "#6366F1",
    "textIcon": "IF",
    "website": "https://iflow.cn",
    "notice": {
      "signupUrl": "https://iflow.cn"
    }
  },
  "category": "oauth",
  "transport": {
    "baseUrl": "https://apis.iflow.cn/v1/chat/completions",
    "thinkingFormat": "openai",
    "headers": {
      "User-Agent": "iFlow-Cli"
    }
  },
  "models": [
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
      "id": "qwen3-max",
      "name": "Qwen3 Max",
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
      "id": "qwen3-vl-plus",
      "name": "Qwen3 VL Plus",
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
      "id": "qwen3-max-preview",
      "name": "Qwen3 Max Preview",
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
      "id": "qwen3-235b",
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
      "id": "qwen3-235b-a22b-instruct",
      "name": "Qwen3 235B A22B Instruct",
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
      "id": "qwen3-235b-a22b-thinking-2507",
      "name": "Qwen3 235B A22B Thinking",
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
      "id": "qwen3-32b",
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
    },
    {
      "id": "kimi-k2",
      "name": "Kimi K2",
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
      "id": "deepseek-v3.2",
      "name": "DeepSeek V3.2 Exp",
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
      "id": "deepseek-v3.1",
      "name": "DeepSeek V3.1 Terminus",
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
      "id": "deepseek-v3",
      "name": "DeepSeek V3 671B",
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
      "id": "deepseek-r1",
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
    },
    {
      "id": "iflow-rome-30ba3b",
      "name": "iFlow ROME",
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
    "clientId": "10009311001",
    "clientSecret": "4Z3YjXycVsQvyGF1etiNlIBB4RsqSDtW",
    "authorizeUrl": "https://iflow.cn/oauth",
    "tokenUrl": "https://iflow.cn/oauth/token",
    "userInfoUrl": "https://iflow.cn/api/oauth/getUserInfo",
    "extraParams": {
      "loginMethod": "phone",
      "type": "phone"
    },
    "refreshLeadMs": 86400000
  }
};
