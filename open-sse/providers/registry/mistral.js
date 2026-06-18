export default {
  "id": "mistral",
  "priority": 80,
  "alias": "mistral",
  "display": {
    "name": "Mistral",
    "icon": "air",
    "color": "#FF7000",
    "textIcon": "MI",
    "website": "https://mistral.ai",
    "notice": {
      "apiKeyUrl": "https://console.mistral.ai/api-keys"
    }
  },
  "category": "apikey",
  "transport": {
    "baseUrl": "https://api.mistral.ai/v1/chat/completions",
    "validateUrl": "https://api.mistral.ai/v1/models",
    "quirks": {
      "dropClientMetadata": true
    }
  },
  "models": [
    {
      "id": "mistral-large-latest",
      "name": "Mistral Large 3",
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
      "id": "codestral-latest",
      "name": "Codestral",
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
      "id": "mistral-medium-latest",
      "name": "Mistral Medium 3",
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
      "id": "mistral-embed",
      "name": "Mistral Embed",
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
    "llm",
    "imageToText",
    "embedding"
  ],
  "embeddingConfig": {
    "baseUrl": "https://api.mistral.ai/v1/embeddings",
    "authType": "apikey",
    "authHeader": "bearer"
  }
};
