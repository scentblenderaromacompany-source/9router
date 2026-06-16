export default {
  "id": "siliconflow",
  "priority": 250,
  "alias": "siliconflow",
  "display": {
    "name": "SiliconFlow",
    "icon": "cloud_queue",
    "color": "#5B6EF5",
    "textIcon": "SF",
    "website": "https://cloud.siliconflow.com",
    "notice": {
      "apiKeyUrl": "https://cloud.siliconflow.com/account/ak"
    }
  },
  "category": "apikey",
  "transport": {
    "baseUrl": "https://api.siliconflow.com/v1/chat/completions",
    "validateUrl": "https://api.siliconflow.com/v1/models",
    "thinkingFormat": "openai"
  },
  "models": [
    {
      "id": "deepseek-ai/DeepSeek-V4-Pro",
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
      "id": "deepseek-ai/DeepSeek-V4-Flash",
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
      "id": "deepseek-ai/DeepSeek-V3.2",
      "name": "DeepSeek V3.2",
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
      "id": "deepseek-ai/DeepSeek-V3.2-Exp",
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
      "id": "deepseek-ai/DeepSeek-V3.1",
      "name": "DeepSeek V3.1",
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
      "id": "deepseek-ai/DeepSeek-V3.1-Terminus",
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
      "id": "Qwen/Qwen3.5-397B-A17B",
      "name": "Qwen 3.5 397B A17B",
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
      "id": "Qwen/Qwen3.5-122B-A10B",
      "name": "Qwen 3.5 122B A10B",
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
      "id": "zai-org/GLM-5.1",
      "name": "GLM 5.1",
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
      "id": "zai-org/GLM-5",
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
      "id": "moonshotai/Kimi-K2.6",
      "name": "Kimi K2.6",
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
      "id": "moonshotai/Kimi-K2.5",
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
      "id": "openai/gpt-oss-120b",
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
      "id": "MiniMaxAI/MiniMax-M2.5",
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
      "id": "inclusionAI/Ling-flash-2.0",
      "name": "Ling Flash 2.0",
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
