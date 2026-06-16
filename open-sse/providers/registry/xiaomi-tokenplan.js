export default {
  "id": "xiaomi-tokenplan",
  "priority": 300,
  "alias": "xiaomi-tokenplan",
  "aliases": [
    "xmtp"
  ],
  "uiAlias": "xmtp",
  "display": {
    "name": "Xiaomi MiMo (Token Plan)",
    "icon": "smart_toy",
    "color": "#FF6700",
    "textIcon": "XT",
    "website": "https://mimo.xiaomi.com",
    "notice": {
      "text": "Xiaomi MiMo Token Plan subscription (API key starts with tp-). Token Plan keys are cluster-specific — select the region matching your subscription.",
      "apiKeyUrl": "https://mimo.xiaomi.com"
    }
  },
  "category": "apikey",
  "hasProviderSpecificData": true,
  "defaultRegion": "sgp",
  "transport": {
    "baseUrl": "https://token-plan-sgp.xiaomimimo.com/v1/chat/completions",
    "regions": {
      "sgp": "https://token-plan-sgp.xiaomimimo.com/v1",
      "cn": "https://token-plan-cn.xiaomimimo.com/v1",
      "ams": "https://token-plan-ams.xiaomimimo.com/v1"
    },
    "defaultRegion": "sgp"
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
      "id": "mimo-v2.5-pro-claude",
      "name": "MiMo V2.5 Pro (Claude Native)",
      "targetFormat": "claude",
      "upstreamModelId": "mimo-v2.5-pro",
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
      "id": "mimo-v2-pro",
      "name": "MiMo V2 Pro",
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
      "id": "mimo-v2-tts",
      "name": "MiMo V2 TTS",
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
      "id": "mimo-v2.5-tts",
      "name": "MiMo V2.5 TTS",
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
      "id": "mimo-v2.5-tts-voiceclone",
      "name": "MiMo V2.5 TTS Voice Clone",
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
      "id": "mimo-v2.5-tts-voicedesign",
      "name": "MiMo V2.5 TTS Voice Design",
      "capabilities": [
        "text",
        "audio"
      ],
      "params": [
        "voice",
        "speed",
        "format"
      ]
    }
  ]
};
