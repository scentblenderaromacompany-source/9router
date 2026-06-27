export default {
  "id": "cohere",
  "priority": 90,
  "alias": "cohere",
  "display": {
    "name": "Cohere",
    "icon": "hub",
    "color": "#39594D",
    "textIcon": "CO",
    "website": "https://cohere.com",
    "notice": {
      "apiKeyUrl": "https://dashboard.cohere.com/api-keys"
    }
  },
  "category": "apikey",
  "transport": {
    "baseUrl": "https://api.cohere.ai/v1/chat/completions",
    "validateUrl": "https://api.cohere.ai/v1/models"
  },
  "models": [
    {
      "id": "command-r-plus-08-2024",
      "name": "Command R+ (Aug 2024)",
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
      "id": "command-r-08-2024",
      "name": "Command R (Aug 2024)",
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
      "id": "command-a-03-2025",
      "name": "Command A (Mar 2025)",
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
