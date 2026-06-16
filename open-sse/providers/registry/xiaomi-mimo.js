export default {
  "id": "xiaomi-mimo",
  "priority": 290,
  "alias": "xiaomi-mimo",
  "aliases": [
    "mimo"
  ],
  "uiAlias": "mimo",
  "display": {
    "name": "Xiaomi MiMo",
    "icon": "smart_toy",
    "color": "#FF6900",
    "textIcon": "XM",
    "website": "https://xiaomimimo.com",
    "notice": {
      "apiKeyUrl": "https://xiaomimimo.com"
    }
  },
  "category": "apikey",
  "transport": {
    "baseUrl": "https://api.xiaomimimo.com/v1/chat/completions",
    "validateUrl": "https://api.xiaomimimo.com/v1/models"
  },
  "models": [
    {
      "id": "mimo-v2.5-pro",
      "name": "MiMo V2.5 Pro",
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
      "id": "mimo-v2.5",
      "name": "MiMo V2.5",
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
      "id": "mimo-v2-omni",
      "name": "MiMo V2 Omni",
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
      "id": "mimo-v2-flash",
      "name": "MiMo V2 Flash",
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
