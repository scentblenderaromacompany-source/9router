export default {
  "id": "voyage-ai",
  "priority": 40,
  "alias": "voyage-ai",
  "uiAlias": "voyage",
  "display": {
    "name": "Voyage AI",
    "icon": "data_array",
    "color": "#0EA5E9",
    "textIcon": "VG",
    "website": "https://www.voyageai.com",
    "notice": {
      "apiKeyUrl": "https://dash.voyageai.com/api-keys"
    }
  },
  "category": "apikey",
  "authType": "apikey",
  "transport": null,
  "models": [
    {
      "id": "voyage-3-large",
      "name": "Voyage 3 Large",
      "kind": "embedding",
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
      "id": "voyage-3.5",
      "name": "Voyage 3.5",
      "kind": "embedding",
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
      "id": "voyage-3.5-lite",
      "name": "Voyage 3.5 Lite",
      "kind": "embedding",
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
      "id": "voyage-code-3",
      "name": "Voyage Code 3",
      "kind": "embedding",
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
      "id": "voyage-finance-2",
      "name": "Voyage Finance 2",
      "kind": "embedding",
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
      "id": "voyage-law-2",
      "name": "Voyage Law 2",
      "kind": "embedding",
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
      "id": "voyage-multilingual-2",
      "name": "Voyage Multilingual 2",
      "kind": "embedding",
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
  "serviceKinds": [
    "embedding"
  ],
  "embeddingConfig": {
    "baseUrl": "https://api.voyageai.com/v1/embeddings"
  }
};
