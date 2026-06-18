export default {
  "id": "glm-cn",
  "priority": 130,
  "alias": "glm-cn",
  "display": {
    "name": "GLM (China)",
    "icon": "code",
    "color": "#DC2626",
    "textIcon": "GC",
    "website": "https://open.bigmodel.cn",
    "notice": {
      "apiKeyUrl": "https://open.bigmodel.cn/usercenter/apikeys"
    }
  },
  "category": "apikey",
  "transport": {
    "baseUrl": "https://open.bigmodel.cn/api/coding/paas/v4/chat/completions",
    "headers": {},
    "usage": {
      "url": "https://open.bigmodel.cn/api/monitor/usage/quota/limit"
    }
  },
  "models": [
    {
      "id": "glm-5.1",
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
      "id": "glm-4.7",
      "name": "GLM-4.7",
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
      "id": "glm-4.6",
      "name": "GLM-4.6",
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
      "id": "glm-4.5-air",
      "name": "GLM-4.5-Air",
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
  "features": {
    "usage": true,
    "usageApikey": true
  }
};
