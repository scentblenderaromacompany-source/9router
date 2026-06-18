export default {
  "id": "blackbox",
  "priority": 50,
  "alias": "blackbox",
  "aliases": [
    "bb"
  ],
  "uiAlias": "bb",
  "display": {
    "name": "Blackbox AI",
    "icon": "smart_toy",
    "color": "#5B5FEF",
    "textIcon": "BB",
    "website": "https://blackbox.ai",
    "notice": {
      "apiKeyUrl": "https://www.blackbox.ai/api-management"
    }
  },
  "category": "apikey",
  "transport": {
    "baseUrl": "https://api.blackbox.ai/chat/completions",
    "thinkingFormat": "openai"
  },
  "models": [
    {
      "id": "gpt-4o",
      "name": "GPT-4o",
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
      "id": "gpt-4o-mini",
      "name": "GPT-4o mini",
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
      "id": "claude-sonnet-4.6",
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
      "id": "claude-sonnet-4.5",
      "name": "Claude Sonnet 4.5",
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
      "id": "claude-opus-4.6",
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
      "id": "claude-sonnet-4-6",
      "name": "Claude Sonnet 4.6 (Legacy)",
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
      "id": "claude-opus-4-6",
      "name": "Claude Opus 4.6 (Legacy)",
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
      "id": "deepseek-v3-671b",
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
      "id": "o1",
      "name": "OpenAI o1",
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
      "id": "o3-mini",
      "name": "OpenAI o3-mini",
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
      "id": "gemini-2.5-flash",
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
      "id": "gemini-3-flash-preview",
      "name": "Gemini 3 Flash Preview",
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
    }
  ]
};
