export default {
  "id": "github",
  "priority": 40,
  "alias": "gh",
  "uiAlias": "gh",
  "display": {
    "name": "GitHub Copilot",
    "icon": "code",
    "color": "#333333",
    "textIcon": "GH",
    "website": "https://github.com/features/copilot",
    "notice": {
      "signupUrl": "https://github.com/features/copilot"
    },
    "deprecated": true,
    "deprecationNotice": "RISK_NOTICE"
  },
  "category": "oauth",
  "transport": {
    "baseUrl": "https://api.githubcopilot.com/chat/completions",
    "responsesUrl": "https://api.githubcopilot.com/responses",
    "headers": {
      "copilot-integration-id": "vscode-chat",
      "editor-version": "vscode/1.110.0",
      "editor-plugin-version": "copilot-chat/0.38.0",
      "user-agent": "GitHubCopilotChat/0.38.0",
      "openai-intent": "conversation-panel",
      "x-github-api-version": "2025-04-01",
      "x-vscode-user-agent-library-version": "electron-fetch",
      "X-Initiator": "user",
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    "copilot": {
      "vscodeVersion": "1.110.0",
      "chatVersion": "0.38.0",
      "userAgent": "GitHubCopilotChat/0.38.0",
      "apiVersion": "2025-04-01"
    },
    "usage": {
      "url": "https://api.github.com/copilot_internal/user"
    }
  },
  "models": [
    {
      "id": "gpt-3.5-turbo",
      "name": "GPT-3.5 Turbo",
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
      "id": "gpt-4",
      "name": "GPT-4",
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
      "name": "GPT-4o mini",
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
      "id": "gpt-5.2-codex",
      "name": "GPT-5.2 Codex",
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
      "id": "gpt-5.3-codex",
      "name": "GPT-5.3 Codex",
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
      "id": "claude-haiku-4.5",
      "name": "Claude Haiku 4.5",
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
      "id": "claude-opus-4.5",
      "name": "Claude Opus 4.5",
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
      "id": "claude-sonnet-4",
      "name": "Claude Sonnet 4",
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
      "id": "claude-sonnet-4.5",
      "name": "Claude Sonnet 4.5",
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
      "id": "claude-sonnet-4.6",
      "name": "Claude Sonnet 4.6",
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
      "id": "claude-opus-4.6",
      "name": "Claude Opus 4.6",
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
      "id": "claude-opus-4.7",
      "name": "Claude Opus 4.7",
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
      "id": "gemini-2.5-pro",
      "name": "Gemini 2.5 Pro",
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
      "id": "gemini-3-flash-preview",
      "name": "Gemini 3 Flash",
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
      "id": "gemini-3.1-pro-preview",
      "name": "Gemini 3.1 Pro",
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
      "id": "grok-code-fast-1",
      "name": "Grok Code Fast 1",
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
      "id": "oswe-vscode-prime",
      "name": "Raptor Mini",
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
      "id": "goldeneye-free-auto",
      "name": "GoldenEye",
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
      "id": "text-embedding-3-small",
      "name": "Text Embedding 3 Small (GitHub)",
      "kind": "embedding",
      "capabilities": [
        "text"
      ],
      "params": [
        "encoding_format"
      ]
    },
    {
      "id": "text-embedding-3-large",
      "name": "Text Embedding 3 Large (GitHub)",
      "kind": "embedding",
      "capabilities": [
        "text"
      ],
      "params": [
        "encoding_format"
      ]
    }
  ],
  "serviceKinds": [
    "llm",
    "embedding"
  ],
  "embeddingConfig": {
    "baseUrl": "https://models.github.ai/inference/embeddings",
    "authType": "apikey",
    "authHeader": "bearer"
  },
  "oauth": {
    "clientId": "Iv1.b507a08c87ecfe98",
    "authorizeUrl": "https://github.com/login/oauth/authorize",
    "deviceCodeUrl": "https://github.com/login/device/code",
    "tokenUrl": "https://github.com/login/oauth/access_token",
    "userInfoUrl": "https://api.github.com/user",
    "scopes": "read:user",
    "apiVersion": "2022-11-28",
    "copilotTokenUrl": "https://api.github.com/copilot_internal/v2/token",
    "userAgent": "GitHubCopilotChat/0.26.7",
    "editorVersion": "vscode/1.85.0",
    "editorPluginVersion": "copilot-chat/0.26.7"
  },
  "features": {
    "usage": true
  }
};
