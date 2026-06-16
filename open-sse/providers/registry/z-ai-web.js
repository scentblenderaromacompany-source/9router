export default {
  "id": "z-ai-web",
  "priority": 145,
  "alias": "zaiweb",
  "aliases": [
    "z-ai-web",
    "zai-web"
  ],
  "uiAlias": "Z.AI Web",
  "display": {
    "name": "Z.AI Web",
    "icon": "auto_awesome",
    "color": "#7c3aed",
    "textIcon": "Z",
    "website": "https://chat.z.ai",
    "notice": {
      "signupUrl": "https://chat.z.ai"
    },
    "kindNotice": {
      "image": "Requires solving CAPTCHA manually when prompted. Free models: GLM-4.7-Flash, GLM-4.5-Flash"
    }
  },
  "category": "webCookie",
  "authType": "cookie",
  "authHint": "Paste your guest token from chat.z.ai/api/v1/auths/ or use browser to get token",
  "transport": {
    "baseUrl": "https://chat.z.ai",
    "format": "openai",
    "authType": "apikey"
  },
  "models": [
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
      "id": "glm-4.7-flash",
      "name": "GLM-4.7 Flash",
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
      "id": "glm-4.5-flash",
      "name": "GLM-4.5 Flash",
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
      "id": "glm-5.1",
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
      "id": "glm-5-turbo",
      "name": "GLM-5 Turbo",
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
      "name": "GLM-5",
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
      "id": "glm-4.5",
      "name": "GLM-4.5",
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
      "name": "GLM-4.5 Air",
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
      "id": "glm-4.5-airx",
      "name": "GLM-4.5 AirX",
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
      "id": "glm-5v-turbo",
      "name": "GLM-5V Turbo",
      "capabilities": [
        "text",
        "vision",
        "tools"
      ],
      "kind": "image",
      "params": [
        "temperature",
        "max_tokens",
        "top_p"
      ]
    },
    {
      "id": "glm-4.6v",
      "name": "GLM-4.6V",
      "capabilities": [
        "text",
        "vision",
        "tools"
      ],
      "kind": "image",
      "params": [
        "temperature",
        "max_tokens",
        "top_p"
      ]
    },
    {
      "id": "glm-4.5v",
      "name": "GLM-4.5V",
      "capabilities": [
        "text",
        "vision",
        "tools"
      ],
      "kind": "image",
      "params": [
        "temperature",
        "max_tokens",
        "top_p"
      ]
    }
  ],
  "passthroughModels": true,
  "serviceKinds": [
    "llm"
  ],
  "hasProviderSpecificData": true
};
