export default {
  "id": "openrouter",
  "priority": 10,
  "hasFree": true,
  "alias": "openrouter",
  "display": {
    "name": "OpenRouter",
    "icon": "router",
    "color": "#F97316",
    "textIcon": "OR",
    "website": "https://openrouter.ai",
    "notice": {
      "text": "Free tier: 27+ free models, no credit card needed, 200 req/day. After  0 credit: 1,000 req/day.",
      "apiKeyUrl": "https://openrouter.ai/settings/keys"
    }
  },
  "category": "freeTier",
  "transport": {
    "baseUrl": "https://openrouter.ai/api/v1/chat/completions",
    "thinkingFormat": "openai",
    "headers": {
      "HTTP-Referer": "https://endpoint-proxy.local",
      "X-Title": "Endpoint Proxy"
    }
  },
  "models": [
    {
      "id": "openai/text-embedding-3-large",
      "name": "OpenAI Text Embedding 3 Large",
      "kind": "embedding",
      "capabilities": [
        "text"
      ],
      "params": [
        "encoding_format"
      ]
    },
    {
      "id": "openai/text-embedding-3-small",
      "name": "OpenAI Text Embedding 3 Small",
      "kind": "embedding",
      "capabilities": [
        "text"
      ],
      "params": [
        "encoding_format"
      ]
    },
    {
      "id": "openai/text-embedding-ada-002",
      "name": "OpenAI Text Embedding Ada 002",
      "kind": "embedding",
      "capabilities": [
        "text"
      ],
      "params": [
        "encoding_format"
      ]
    },
    {
      "id": "qwen/qwen3-embedding-8b",
      "name": "Qwen3 Embedding 8B",
      "kind": "embedding",
      "capabilities": [
        "text"
      ],
      "params": [
        "encoding_format"
      ]
    },
    {
      "id": "perplexity/pplx-embed-v1-4b",
      "name": "Perplexity Embed V1 4B",
      "kind": "embedding",
      "capabilities": [
        "embedding"
      ],
      "params": [
        "temperature",
        "max_tokens",
        "top_p"
      ]
    },
    {
      "id": "perplexity/pplx-embed-v1-0.6b",
      "name": "Perplexity Embed V1 0.6B",
      "kind": "embedding",
      "capabilities": [
        "embedding"
      ],
      "params": [
        "temperature",
        "max_tokens",
        "top_p"
      ]
    },
    {
      "id": "nvidia/llama-nemotron-embed-vl-1b-v2:free",
      "name": "NVIDIA Nemotron Embed VL 1B V2 (Free)",
      "kind": "embedding",
      "capabilities": [
        "embedding"
      ],
      "params": [
        "temperature",
        "max_tokens",
        "top_p"
      ]
    },
    {
      "id": "openai/gpt-4o-mini-tts",
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
      "id": "openai/tts-1-hd",
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
      "id": "openai/tts-1",
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
      "id": "openai/dall-e-3",
      "name": "DALL-E 3 (via OpenRouter)",
      "params": [
        "size",
        "quality",
        "style",
        "response_format"
      ],
      "kind": "image",
      "capabilities": [
        "text2img"
      ]
    },
    {
      "id": "openai/gpt-image-1",
      "name": "GPT Image 1 (via OpenRouter)",
      "params": [
        "n",
        "size",
        "quality",
        "response_format"
      ],
      "kind": "image",
      "capabilities": [
        "text2img"
      ]
    },
    {
      "id": "google/imagen-3.0-generate-002",
      "name": "Imagen 3 (via OpenRouter)",
      "params": [
        "n",
        "size"
      ],
      "kind": "image",
      "capabilities": [
        "text2img"
      ]
    },
    {
      "id": "black-forest-labs/FLUX.1-schnell",
      "name": "FLUX.1 Schnell (via OpenRouter)",
      "params": [
        "n",
        "size"
      ],
      "kind": "image",
      "capabilities": [
        "text2img"
      ]
    }
  ],
  "serviceKinds": [
    "llm",
    "embedding",
    "tts",
    "imageToText"
  ],
  "ttsConfig": {
    "baseUrl": "https://openrouter.ai/api/v1/chat/completions",
    "defaultModel": "openai/gpt-4o-mini-tts",
    "headers": {
      "HTTP-Referer": "https://endpoint-proxy.local",
      "X-Title": "Endpoint Proxy"
    }
  },
  "embeddingConfig": {
    "baseUrl": "https://openrouter.ai/api/v1/embeddings",
    "authType": "apikey",
    "authHeader": "bearer",
    "headers": {
      "HTTP-Referer": "https://endpoint-proxy.local",
      "X-Title": "Endpoint Proxy"
    }
  },
  "imageConfig": {
    "baseUrl": "https://openrouter.ai/api/v1/images/generations",
    "headers": {
      "HTTP-Referer": "https://endpoint-proxy.local",
      "X-Title": "Endpoint Proxy"
    }
  },
  "modelsFetcher": {
    "url": "https://openrouter.ai/api/v1/models",
    "type": "openrouter-free"
  },
  "passthroughModels": true
};
