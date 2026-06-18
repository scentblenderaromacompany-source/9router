export default {
  "id": "assemblyai",
  "priority": 30,
  "alias": "assemblyai",
  "aliases": [
    "aai"
  ],
  "uiAlias": "aai",
  "display": {
    "name": "AssemblyAI",
    "icon": "record_voice_over",
    "color": "#0062FF",
    "textIcon": "AA",
    "website": "https://assemblyai.com",
    "notice": {
      "apiKeyUrl": "https://www.assemblyai.com/app/api-keys"
    }
  },
  "category": "apikey",
  "authType": "apikey",
  "transport": {
    "baseUrl": "https://api.assemblyai.com/v1/audio/transcriptions",
    "validateUrl": "https://api.assemblyai.com/v1/account"
  },
  "models": [
    {
      "id": "universal-3-pro",
      "name": "Universal 3 Pro",
      "params": [
        "language"
      ],
      "kind": "stt",
      "capabilities": [
        "text",
        "tools"
      ]
    },
    {
      "id": "universal-2",
      "name": "Universal 2",
      "params": [
        "language"
      ],
      "kind": "stt",
      "capabilities": [
        "text",
        "tools"
      ]
    },
    {
      "id": "best",
      "name": "Best (Nano + Universal)",
      "kind": "stt",
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
      "id": "nano",
      "name": "Nano (Fast)",
      "kind": "stt",
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
    "stt"
  ],
  "sttConfig": {
    "baseUrl": "https://api.assemblyai.com/v2/transcript",
    "authType": "apikey",
    "authHeader": "authorization",
    "format": "assemblyai"
  }
};
