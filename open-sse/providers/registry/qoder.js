export default {
  "id": "qoder",
  "priority": 30,
  "alias": "qd",
  "uiAlias": "qd",
  "display": {
    "name": "Qoder",
    "icon": "water_drop",
    "color": "#EC4899",
    "textIcon": "QD",
    "website": "https://qoder.com",
    "notice": {
      "signupUrl": "https://qoder.com"
    },
    "deprecated": true,
    "deprecationNotice": "RISK_NOTICE"
  },
  "category": "free",
  "transport": {
    "baseUrl": "https://api3.qoder.sh/algo/api/v2/service/pro/sse/agent_chat_generation",
    "headers": {},
    "timeoutMs": 120000,
    "stallTimeoutMs": 120000,
    "usage": {
      "url": "https://openapi.qoder.sh/api/v2/quota/usage"
    }
  },
  "models": [
    {
      "id": "auto",
      "name": "Qoder Auto",
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
      "id": "ultimate",
      "name": "Qoder Ultimate",
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
      "id": "performance",
      "name": "Qoder Performance",
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
      "id": "efficient",
      "name": "Qoder Efficient",
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
      "id": "lite",
      "name": "Qoder Lite",
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
      "id": "qmodel",
      "name": "Qwen 3.6 Plus (Qoder)",
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
      "id": "qmodel_latest",
      "name": "Qoder Qwen 3.7 Max",
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
      "id": "dmodel",
      "name": "DeepSeek V4 Pro (Qoder)",
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
      "id": "dfmodel",
      "name": "DeepSeek V4 Flash (Qoder)",
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
      "id": "gm51model",
      "name": "GLM 5.1 (Qoder)",
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
      "id": "kmodel",
      "name": "Kimi K2.6 (Qoder)",
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
      "id": "mmodel",
      "name": "MiniMax M2.7 (Qoder)",
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
    "openApiBaseUrl": "https://openapi.qoder.sh",
    "centerBaseUrl": "https://center.qoder.sh",
    "chatBaseUrl": "https://api3.qoder.sh",
    "deviceTokenUrl": "https://openapi.qoder.sh/api/v1/deviceToken/poll",
    "refreshUrl": "https://center.qoder.sh/algo/api/v3/user/refresh_token",
    "userInfoUrl": "https://openapi.qoder.sh/api/v1/userinfo",
    "quotaUsageUrl": "https://openapi.qoder.sh/api/v2/quota/usage",
    "loginUrl": "https://qoder.com/device/selectAccounts"
  },
  "features": {
    "usage": true
  }
};
