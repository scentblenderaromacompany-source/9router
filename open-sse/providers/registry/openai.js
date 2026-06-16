export default {
  "id": "openai",
  "priority": 30,
  "alias": "openai",
  "display": {
    "name": "OpenAI",
    "icon": "auto_awesome",
    "color": "#10A37F",
    "textIcon": "OA",
    "website": "https://platform.openai.com",
    "notice": {
      "apiKeyUrl": "https://platform.openai.com/api-keys"
    }
  },
  "category": "apikey",
  "thinkingConfig": {
    "options": [
      "auto",
      "none",
      "low",
      "medium",
      "high"
    ],
    "defaultMode": "auto"
  },
  "transport": {
    "baseUrl": "https://api.openai.com/v1/chat/completions",
    "forceStream": true
  },
  "models": [
    {
      "id": "gpt-5.4",
      "name": "GPT-5.4",
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
      "id": "gpt-5.4-mini",
      "name": "GPT-5.4 Mini",
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
      "id": "gpt-5.4-nano",
      "name": "GPT-5.4 Nano",
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
      "id": "gpt-5.2",
      "name": "GPT-5.2",
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
      "id": "gpt-5.1",
      "name": "GPT-5.1",
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
      "id": "gpt-5",
      "name": "GPT-5",
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
      "id": "gpt-5-mini",
      "name": "GPT-5 Mini",
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
      "id": "gpt-5-nano",
      "name": "GPT-5 Nano",
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
      "id": "gpt-4o",
      "name": "GPT-4o",
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
      "id": "gpt-4o-mini",
      "name": "GPT-4o Mini",
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
      "id": "gpt-4-turbo",
      "name": "GPT-4 Turbo",
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
      "id": "gpt-4.1",
      "name": "GPT-4.1",
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
      "id": "gpt-4.1-mini",
      "name": "GPT-4.1 Mini",
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
      "id": "gpt-4.1-nano",
      "name": "GPT-4.1 Nano",
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
      "id": "o3",
      "name": "O3",
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
      "id": "o3-mini",
      "name": "O3 Mini",
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
      "id": "o3-pro",
      "name": "O3 Pro",
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
      "id": "o4-mini",
      "name": "O4 Mini",
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
      "id": "o1",
      "name": "O1",
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
      "id": "o1-mini",
      "name": "O1 Mini",
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
      "id": "text-embedding-3-large",
      "name": "Text Embedding 3 Large",
      "kind": "embedding",
      "capabilities": [
        "text"
      ],
      "params": [
        "encoding_format"
      ]
    },
    {
      "id": "text-embedding-3-small",
      "name": "Text Embedding 3 Small",
      "kind": "embedding",
      "capabilities": [
        "text"
      ],
      "params": [
        "encoding_format"
      ]
    },
    {
      "id": "text-embedding-ada-002",
      "name": "Text Embedding Ada 002",
      "kind": "embedding",
      "capabilities": [
        "text"
      ],
      "params": [
        "encoding_format"
      ]
    },
    {
      "id": "tts-1",
      "name": "TTS-1",
      "kind": "tts",
      "capabilities": [
        "text",
        "audio"
      ],
      "params": [
        "voice",
        "speed",
        "format"
      ]
    },
    {
      "id": "tts-1-hd",
      "name": "TTS-1 HD",
      "kind": "tts",
      "capabilities": [
        "text",
        "audio"
      ],
      "params": [
        "voice",
        "speed",
        "format"
      ]
    },
    {
      "id": "gpt-4o-mini-tts",
      "name": "GPT-4o Mini TTS",
      "kind": "tts",
      "capabilities": [
        "text",
        "audio"
      ],
      "params": [
        "voice",
        "speed",
        "format"
      ]
    },
    {
      "id": "whisper-1",
      "name": "Whisper 1",
      "params": [
        "language",
        "response_format",
        "temperature",
        "prompt"
      ],
      "kind": "stt",
      "capabilities": [
        "text",
        "tools"
      ]
    },
    {
      "id": "gpt-4o-transcribe",
      "name": "GPT-4o Transcribe",
      "params": [
        "language",
        "response_format",
        "temperature",
        "prompt"
      ],
      "kind": "stt",
      "capabilities": [
        "text",
        "tools"
      ]
    },
    {
      "id": "gpt-4o-mini-transcribe",
      "name": "GPT-4o Mini Transcribe",
      "params": [
        "language",
        "response_format",
        "temperature",
        "prompt"
      ],
      "kind": "stt",
      "capabilities": [
        "text",
        "tools"
      ]
    },
    {
      "id": "gpt-image-1",
      "name": "GPT Image 1",
      "params": [
        "n",
        "size",
        "quality",
        "response_format"
      ],
      "kind": "image",
      "capabilities": [
        "text",
        "vision",
        "tools"
      ]
    },
    {
      "id": "dall-e-3",
      "name": "DALL-E 3",
      "params": [
        "size",
        "quality",
        "style",
        "response_format"
      ],
      "kind": "image",
      "capabilities": [
        "text",
        "tools"
      ]
    },
    {
      "id": "dall-e-2",
      "name": "DALL-E 2",
      "params": [
        "n",
        "size",
        "response_format"
      ],
      "kind": "image",
      "capabilities": [
        "text",
        "tools"
      ]
    }
  ],
  "serviceKinds": [
    "llm",
    "embedding",
    "tts",
    "stt",
    "image",
    "imageToText",
    "webSearch"
  ],
  "ttsConfig": {
    "baseUrl": "https://api.openai.com/v1/audio/speech",
    "authType": "apikey",
    "authHeader": "bearer",
    "format": "openai",
    "defaultModel": "gpt-4o-mini-tts"
  },
  "sttConfig": {
    "baseUrl": "https://api.openai.com/v1/audio/transcriptions",
    "authType": "apikey",
    "authHeader": "bearer",
    "format": "openai"
  },
  "embeddingConfig": {
    "baseUrl": "https://api.openai.com/v1/embeddings",
    "authType": "apikey",
    "authHeader": "bearer"
  },
  "imageConfig": {
    "baseUrl": "https://api.openai.com/v1/images/generations"
  },
  "searchViaChat": {
    "defaultModel": "gpt-4o-mini",
    "pricingUrl": "https://openai.com/api/pricing"
  }
};
