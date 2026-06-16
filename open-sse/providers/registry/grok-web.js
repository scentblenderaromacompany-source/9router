export default {
  "id": "grok-web",
  "priority": 150,
  "alias": "grok-web",
  "aliases": [
    "gw"
  ],
  "uiAlias": "gw",
  "display": {
    "name": "Grok Web (Subscription)",
    "icon": "auto_awesome",
    "color": "#1DA1F2",
    "textIcon": "GW",
    "website": "https://grok.com"
  },
  "category": "webCookie",
  "authType": "cookie",
  "authHint": "Paste your sso= cookie value from grok.com",
  "transport": {
    "baseUrl": "https://grok.com/rest/app-chat/conversations/new",
    "format": "grok-web",
    "authType": "cookie"
  },
  "models": [
    {
      "id": "grok-3",
      "name": "Grok 3",
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
      "id": "grok-3-mini",
      "name": "Grok 3 Mini (Thinking)",
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
      "id": "grok-3-thinking",
      "name": "Grok 3 Thinking",
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
      "id": "grok-4",
      "name": "Grok 4",
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
      "id": "grok-4-mini",
      "name": "Grok 4 Mini (Thinking)",
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
      "id": "grok-4-thinking",
      "name": "Grok 4 Thinking",
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
      "id": "grok-4-heavy",
      "name": "Grok 4 Heavy (SuperGrok)",
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
      "id": "grok-4.1-mini",
      "name": "Grok 4.1 Mini (Thinking)",
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
      "id": "grok-4.1-fast",
      "name": "Grok 4.1 Fast",
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
      "id": "grok-4.1-expert",
      "name": "Grok 4.1 Expert",
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
      "id": "grok-4.1-thinking",
      "name": "Grok 4.1 Thinking",
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
      "id": "grok-4.2",
      "name": "Grok 4.2 (4.20 Beta)",
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
  "passthroughModels": true
};
