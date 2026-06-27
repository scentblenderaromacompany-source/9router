/**
 * Z.AI (Zhipu) provider — integration with Zhipu AI's international platform
 * Uses Z.AI API keys to access GLM models
 * Supports chat, vision, tools, thinking, image generation, video, audio, and more
 */
export default {
  "id": "z-ai",
  "priority": 145,
  "alias": "zai",
  "aliases": [
    "zhipu",
    "glm"
  ],
  "uiAlias": "zai",
  "display": {
    "name": "Z.AI (Zhipu)",
    "icon": "auto_awesome",
    "color": "#6366F1",
    "textIcon": "ZAI",
    "website": "https://z.ai",
    "notice": {
      "signupUrl": "https://z.ai/manage-apikey/apikey-list"
    },
    "kindNotice": {
      "image": "Requires a Z.AI account with API access. Uses GLM Coding Plan or pay-per-token quota."
    }
  },
  "category": "apikey",
  "authType": "apikey",
  "authHint": "Paste your Z.AI API key from https://z.ai/manage-apikey/apikey-list",
  "transport": {
    "baseUrl": "https://api.z.ai/api/paas/v4",
    "format": "openai",
    "authType": "apikey"
  },
  "models": [
    {
      "id": "glm-5.1",
      "name": "GLM-5.1",
      "capabilities": [
        "text",
        "tools"
      ],
      "description": "Latest flagship model, 128K context",
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
      "description": "Fast flagship model",
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
      "description": "Standard flagship",
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
      "description": "Previous generation",
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
      "description": "Fast inference",
      "params": [
        "temperature",
        "max_tokens",
        "top_p"
      ]
    },
    {
      "id": "glm-4.7-flashx",
      "name": "GLM-4.7 FlashX",
      "capabilities": [
        "text",
        "tools"
      ],
      "description": "Ultra-fast inference",
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
      "description": "Legacy model",
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
      "description": "Older generation",
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
      "description": "Lightweight",
      "params": [
        "temperature",
        "max_tokens",
        "top_p"
      ]
    },
    {
      "id": "glm-4.5-x",
      "name": "GLM-4.5 X",
      "capabilities": [
        "text",
        "tools"
      ],
      "description": "Extended variant",
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
      "description": "Ultra-lightweight",
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
      "description": "Fast legacy",
      "params": [
        "temperature",
        "max_tokens",
        "top_p"
      ]
    },
    {
      "id": "glm-4-32b-0414-128k",
      "name": "GLM-4 32B 128K",
      "capabilities": [
        "text",
        "tools"
      ],
      "description": "128K context legacy",
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
      "description": "Latest vision model, 128K output",
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
      "description": "Previous vision, 32K output",
      "params": [
        "temperature",
        "max_tokens",
        "top_p"
      ]
    },
    {
      "id": "glm-4.6v-flash",
      "name": "GLM-4.6V Flash",
      "capabilities": [
        "text",
        "vision"
      ],
      "kind": "image",
      "description": "Fast vision",
      "params": [
        "temperature",
        "max_tokens",
        "top_p"
      ]
    },
    {
      "id": "glm-4.6v-flashx",
      "name": "GLM-4.6V FlashX",
      "capabilities": [
        "text",
        "vision"
      ],
      "kind": "image",
      "description": "Ultra-fast vision",
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
        "vision"
      ],
      "kind": "image",
      "description": "Legacy vision, 16K output",
      "params": [
        "temperature",
        "max_tokens",
        "top_p"
      ]
    },
    {
      "id": "autoglm-phone-multilingual",
      "name": "AutoGLM Phone",
      "capabilities": [
        "text",
        "vision",
        "tools"
      ],
      "kind": "image",
      "description": "Mobile assistant model",
      "params": [
        "temperature",
        "max_tokens",
        "top_p"
      ]
    },
    {
      "id": "glm-image",
      "name": "GLM-Image",
      "capabilities": [
        "text2img"
      ],
      "kind": "image",
      "description": "Image generation",
      "params": [
        "size",
        "quality",
        "background",
        "image_detail",
        "output_format"
      ]
    },
    {
      "id": "cogview-4",
      "name": "CogView-4",
      "capabilities": [
        "text2img"
      ],
      "kind": "image",
      "description": "Advanced image generation",
      "params": [
        "temperature",
        "max_tokens",
        "top_p"
      ]
    },
    {
      "id": "cogvideox-3",
      "name": "CogVideoX-3",
      "capabilities": [
        "text2video"
      ],
      "kind": "video",
      "description": "Text/Image to video",
      "params": [
        "resolution",
        "duration",
        "fps"
      ]
    },
    {
      "id": "vidu-q1",
      "name": "Vidu Q1",
      "capabilities": [
        "text2video",
        "image2video"
      ],
      "kind": "video",
      "description": "High-performance video",
      "params": [
        "temperature",
        "max_tokens",
        "top_p"
      ]
    },
    {
      "id": "vidu-2",
      "name": "Vidu 2",
      "capabilities": [
        "text2video",
        "image2video"
      ],
      "kind": "video",
      "description": "Video generation",
      "params": [
        "temperature",
        "max_tokens",
        "top_p"
      ]
    },
    {
      "id": "glm-asr-2512",
      "name": "GLM-ASR-2512",
      "capabilities": [
        "speech2text"
      ],
      "kind": "audio",
      "description": "Speech to text",
      "params": [
        "temperature",
        "max_tokens",
        "top_p"
      ]
    },
    {
      "id": "glm-ocr",
      "name": "GLM-OCR",
      "capabilities": [
        "ocr"
      ],
      "kind": "image",
      "description": "Document layout parsing",
      "params": [
        "temperature",
        "max_tokens",
        "top_p"
      ]
    }
  ],
  "passthroughModels": true,
  "serviceKinds": [
    "llm",
    "image",
    "video",
    "audio"
  ],
  "hasProviderSpecificData": false
};
