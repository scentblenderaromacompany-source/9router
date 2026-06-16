// MITM Tools — IDE tools intercepted via MITM proxy
export const MITM_TOOLS = {
  antigravity: {
    id: "antigravity",
    name: "Antigravity",
    image: "/providers/antigravity.png",
    color: "#4285F4",
    description: "Google Antigravity IDE with MITM",
    configType: "mitm",
    mitmDomain: "daily-cloudcode-pa.googleapis.com",
    modelAliases: ["gemini-3.5-flash-low", "gemini-3-flash-agent", "gemini-3.5-flash-extra-low", "gemini-3.1-pro-low", "gemini-pro-agent", "claude-sonnet-4-6", "claude-opus-4-6-thinking", "gpt-oss-120b-medium", "gemini-3-flash"],
    defaultModels: [
      { id: "gemini-3.5-flash-low", name: "Gemini 3.5 Flash (Medium) / Default", alias: "gemini-3.5-flash-low" },
      { id: "gemini-3-flash-agent", name: "Gemini 3.5 Flash (High)", alias: "gemini-3-flash-agent" },
      { id: "gemini-3.5-flash-extra-low", name: "Gemini 3.5 Flash (Low)", alias: "gemini-3.5-flash-extra-low" },
      { id: "gemini-3.1-pro-low", name: "Gemini 3.1 Pro (Low)", alias: "gemini-3.1-pro-low" },
      { id: "gemini-pro-agent", name: "Gemini 3.1 Pro (High)", alias: "gemini-pro-agent" },
      { id: "claude-sonnet-4-6", name: "Claude Sonnet 4.6 (Thinking)", alias: "claude-sonnet-4-6" },
      { id: "claude-opus-4-6-thinking", name: "Claude Opus 4.6 (Thinking)", alias: "claude-opus-4-6-thinking" },
      { id: "gpt-oss-120b-medium", name: "GPT-OSS 120B (Medium)", alias: "gpt-oss-120b-medium" },
      { id: "gemini-3-flash", name: "Gemini 3 Flash (Command)", alias: "gemini-3-flash" },
    ],
  },
  copilot: {
    id: "copilot",
    name: "GitHub Copilot",
    image: "/providers/copilot.png",
    color: "#1F6FEB",
    description: "GitHub Copilot IDE with MITM",
    configType: "mitm",
    mitmDomain: "api.individual.githubcopilot.com",
    modelAliases: ["gpt-5-mini", "gpt-5.4-nano", "claude-haiku-4.5", "gpt-4o", "gpt-4.1"],
    defaultModels: [
      // Verified via live MITM passthrough capture of the GitHub Copilot CLI: its model
      // picker offers "GPT-5 mini" (default → wire id "gpt-5-mini"), "Claude Haiku 4.5"
      // ("claude-haiku-4.5") and "Auto". "Auto" is NOT a wire id — Copilot dispatches
      // concrete models dynamically (observed "gpt-5.4-nano" for light tasks and
      // "claude-haiku-4.5"), so it needs no slot of its own. Without a slot for
      // gpt-5-mini / gpt-5.4-nano, getMappedModel returns null and the /chat/completions
      // call is passed through to GitHub Copilot instead of the configured provider —
      // and gpt-5-mini is the CLI default, so the primary turn leaks (same class as the
      // Kiro "auto" misrouting). gpt-4o / gpt-4.1 are kept for the VS Code Copilot Chat picker.
      { id: "gpt-5-mini", name: "GPT-5 mini", alias: "gpt-5-mini" },
      { id: "gpt-5.4-nano", name: "GPT-5.4 nano", alias: "gpt-5.4-nano" },
      { id: "claude-haiku-4.5", name: "Claude Haiku 4.5", alias: "claude-haiku-4.5" },
      { id: "gpt-4o", name: "GPT-4o", alias: "gpt-4o" },
      { id: "gpt-4.1", name: "GPT-4.1", alias: "gpt-4.1" },
    ],
  },
  kiro: {
    id: "kiro",
    name: "Kiro",
    image: "/providers/kiro.png",
    color: "#FF6B00",
    description: "Kiro IDE with MITM",
    configType: "mitm",
    mitmDomain: "q.us-east-1.amazonaws.com",
    defaultModels: [
      { id: "claude-sonnet-4.5", name: "Claude Sonnet 4.5", alias: "claude-sonnet-4.5" },
      { id: "claude-sonnet-4", name: "Claude Sonnet 4", alias: "claude-sonnet-4" },
      { id: "claude-haiku-4.5", name: "Claude Haiku 4.5", alias: "claude-haiku-4.5" },
      { id: "deepseek-3.2", name: "DeepSeek 3.2", alias: "deepseek-3.2" },
      { id: "minimax-m2.1", name: "MiniMax M2.1", alias: "minimax-m2.1" },
      { id: "simple-task", name: "Qwen3 Coder Next", alias: "simple-task" },
    ],
  },
  // cursor: {
  //   id: "cursor",
  //   name: "Cursor",
  //   image: "/providers/cursor.png",
  //   color: "#000000",
  //   description: "Cursor IDE with MITM",
  //   configType: "mitm",
  //   mitmDomain: "api2.cursor.sh",
  //   defaultModels: [
  //     { id: "claude-sonnet-4-5", name: "Claude Sonnet 4.5", alias: "claude-sonnet-4-5" },
  //     { id: "claude-opus-4", name: "Claude Opus 4", alias: "claude-opus-4" },
  //     { id: "gpt-4o", name: "GPT-4o", alias: "gpt-4o" },
  //   ],
  // },
};

// CLI Tools configuration
export const CLI_TOOLS = {
  claude: {
    id: "claude",
    name: "Claude Code",
    image: "/providers/claude.png",
    color: "#D97757",
    description: "Anthropic Claude Code CLI",
    configType: "env",
    envVars: {
      baseUrl: "ANTHROPIC_BASE_URL",
      model: "ANTHROPIC_MODEL",
      opusModel: "ANTHROPIC_DEFAULT_OPUS_MODEL",
      sonnetModel: "ANTHROPIC_DEFAULT_SONNET_MODEL",
      haikuModel: "ANTHROPIC_DEFAULT_HAIKU_MODEL",
    },
    modelAliases: ["default", "sonnet", "opus", "haiku", "opusplan"],
    settingsFile: "~/.claude/settings.json",
    defaultModels: [
      { id: "opus", name: "Claude Opus", alias: "opus", envKey: "ANTHROPIC_DEFAULT_OPUS_MODEL", defaultValue: "cc/claude-opus-4-6" },
      { id: "sonnet", name: "Claude Sonnet", alias: "sonnet", envKey: "ANTHROPIC_DEFAULT_SONNET_MODEL", defaultValue: "cc/claude-sonnet-4-6" },
      { id: "haiku", name: "Claude Haiku", alias: "haiku", envKey: "ANTHROPIC_DEFAULT_HAIKU_MODEL", defaultValue: "cc/claude-haiku-4-5-20251001" },
    ],
  },
  openclaw: {
    id: "openclaw",
    name: "Open Claw",
    image: "/providers/openclaw.png",
    color: "#FF6B35",
    description: "Open Claw AI Assistant",
    configType: "custom",
  },
  codex: {
    id: "codex",
    name: "OpenAI Codex CLI / App",
    image: "/providers/codex.png",
    color: "#10A37F",
    description: "OpenAI Codex CLI",
    configType: "custom",
  },
  opencode: {
    id: "opencode",
    name: "OpenCode",
    image: "/providers/opencode.png",
    color: "#E87040",
    description: "OpenCode AI Terminal Assistant",
    configType: "custom",
  },
  chat2api: {
    id: "chat2api",
    name: "Chat2API",
    icon: "terminal",
    color: "#0EA5E9",
    description: "Chat2API proxy integration — native provider or via external proxy",
    configType: "guide",
    notes: [
      {
        type: "info",
        text: "9Router now includes native ChatGPT Web support. Use the built-in 'chatgpt-web' provider for direct access with tool parsing.",
      },
    ],
    guideSteps: [
      {
        step: 1,
        title: "Option A: Use Native ChatGPT Web Provider (Recommended)",
        desc: "Go to Providers → Add ChatGPT Web and configure with your ChatGPT access token.",
      },
      {
        step: 2,
        title: "Option B: Use Chat2API Proxy (External)",
        desc: "If you prefer an external proxy, install Chat2API from github.com/Z7ANN/chat2api and configure as OpenAI-compatible.",
      },
      {
        step: 3,
        title: "Select ChatGPT Models",
        desc: "Use models like gpt-4o, gpt-4-turbo, gpt-3.5-turbo with full tool parsing support.",
      },
    ],
    codeBlock: {
      language: "json",
      code: `// Native provider config (recommended):
{
  "provider": "chatgpt-web",
  "model": "gpt-4o",
  "accessToken": "<your-chatgpt-access-token>"
}

// Or external Chat2API proxy:
{
  "name": "Chat2API",
  "type": "openai-compatible",
  "prefix": "chat2api",
  "apiType": "chat",
  "baseUrl": "http://localhost:8700/v1"
}`,
    },
  },
  chatgpt_web: {
    id: "chatgpt-web",
    name: "ChatGPT Web (Native)",
    image: "/providers/openai.png",
    color: "#10A37F",
    description: "Native ChatGPT Web UI integration with full tool parsing support",
    configType: "guide",
    notes: [
      {
        type: "info",
        text: "Use your ChatGPT account access token to access ChatGPT models directly with full function calling support.",
      },
      {
        type: "info",
        text: "Requires your ChatGPT Plus/Pro subscription. Tool parsing works natively without external proxies.",
      },
    ],
    guideSteps: [
      {
        step: 1,
        title: "Get Your Access Token",
        desc: "Visit https://chatgpt.com/api/auth/session while logged in and copy the 'accessToken' value.",
      },
      {
        step: 2,
        title: "Add ChatGPT Web Provider",
        desc: "Go to Providers → Add New → Select 'ChatGPT Web (Native)'",
      },
      {
        step: 3,
        title: "Paste Access Token",
        desc: "Paste your access token in the authentication field.",
      },
      {
        step: 4,
        title: "Select Models",
        desc: "Choose from gpt-4o, gpt-4-turbo, gpt-3.5-turbo, or add custom ChatGPT models.",
      },
      {
        step: 5,
        title: "Enable Tool Parsing",
        desc: "Tool parsing and function calling work automatically on all requests.",
      },
    ],
    codeBlock: {
      language: "json",
      code: `{
  "provider": "chatgpt-web",
  "models": [
    "gpt-4o",
    "gpt-4-turbo",
    "gpt-3.5-turbo"
  ],
  "accessToken": "<your-chatgpt-access-token>",
  "supportedCapabilities": [
    "text",
    "vision",
    "tools",
    "image-generation"
  ]
}`,
    },
  },
  z_ai: {
    id: "z-ai",
    name: "Z.AI (Zhipu)",
    icon: "terminal",
    color: "#6366F1",
    description: "Z.AI integration for GLM models with full tool and vision support",
    configType: "guide",
    notes: [
      {
        type: "info",
        text: "Z.AI provides access to GLM models (GLM-5.1, GLM-5, GLM-4.7) from Zhipu AI's international platform.",
      },
      {
        type: "info",
        text: "Supports tool/function calling, vision, and thinking mode on supported models.",
      },
    ],
    guideSteps: [
      {
        step: 1,
        title: "Get API Key",
        desc: "Visit https://z.ai/manage-apikey/apikey-list and create a new API key.",
      },
      {
        step: 2,
        title: "Add Z.AI Provider",
        desc: "Go to Providers → Add New → Select 'Z.AI (Zhipu)'",
      },
      {
        step: 3,
        title: "Paste API Key",
        desc: "Paste your Z.AI API key in the authentication field.",
      },
      {
        step: 4,
        title: "Select Models",
        desc: "Choose from glm-5.1, glm-5-turbo, glm-4.7, or add custom Z.AI models.",
      },
      {
        step: 5,
        title: "Enable Tool Parsing",
        desc: "Tool parsing and function calling work automatically on all requests.",
      },
    ],
    codeBlock: {
      language: "json",
      code: `{
  "provider": "z-ai",
  "models": [
    "glm-5.1",
    "glm-5-turbo",
    "glm-4.7",
    "glm-4.7-flash"
  ],
  "apiKey": "<your-z-ai-api-key>",
  "supportedCapabilities": [
    "text",
    "vision",
    "tools"
  ]
}`,
    },
  },
  z_ai_web: {
    id: "z-ai-web",
    name: "Z.AI Web (Free)",
    icon: "terminal",
    color: "#7c3aed",
    description: "Z.AI Web UI integration with guest mode (no login required)",
    configType: "guide",
    notes: [
      {
        type: "info",
        text: "Z.AI Web works without registration via guest mode. Use 'Skip for now' button on login page.",
      },
      {
        type: "info",
        text: "Free models: GLM-4.7-Flash, GLM-4.5-Flash. CAPTCHA may appear on registration.",
      },
    ],
    guideSteps: [
      {
        step: 1,
        title: "No Login Required",
        desc: "Z.AI Web works in guest mode. The provider will automatically skip login.",
      },
      {
        step: 2,
        title: "Add Z.AI Web Provider",
        desc: "Go to Providers → Add New → Select 'Z.AI Web (Free)'",
      },
      {
        step: 3,
        title: "Select Model",
        desc: "Choose from glm-4.7, glm-4.7-flash, glm-4.5-flash, or add custom Z.AI models.",
      },
    ],
    codeBlock: {
      language: "json",
      code: `{
  "provider": "z-ai-web",
  "model": "glm-4.7"
}`,
    },
  },
  grok_web: {
    id: "grok-web",
    name: "Grok Web (Subscription)",
    icon: "terminal",
    color: "#1DA1F2",
    description: "Grok Web UI integration with sso cookie authentication",
    configType: "guide",
    notes: [
      {
        type: "info",
        text: "Use your Grok account sso cookie to access Grok models directly through the web interface.",
      },
      {
        type: "info",
        text: "Supports Grok 3, 4, and 4.1 models including thinking variants.",
      },
    ],
    guideSteps: [
      {
        step: 1,
        title: "Get Your SSO Cookie",
        desc: "Visit https://grok.com while logged in, open Developer Tools (F12) → Application → Cookies → copy the 'sso' value.",
      },
      {
        step: 2,
        title: "Add Grok Web Provider",
        desc: "Go to Providers → Add New → Select 'Grok Web (Subscription)'",
      },
      {
        step: 3,
        title: "Paste SSO Cookie",
        desc: "Paste your sso cookie value in the authentication field.",
      },
      {
        step: 4,
        title: "Select Model",
        desc: "Choose from grok-3, grok-4, grok-4.1-mini, or add custom Grok models.",
      },
    ],
    codeBlock: {
      language: "json",
      code: `{
  "provider": "grok-web",
  "model": "grok-4",
  "apiKey": "<your-grok-sso-cookie>"
}`,
    },
  },
  cowork: {
    id: "cowork",
    name: "Claude Cowork",
    image: "/providers/claude.png",
    color: "#D97757",
    description: "Claude Desktop Cowork (third-party inference)",
    configType: "custom",
  },
  hermes: {
    id: "hermes",
    name: "Hermes Agent",
    image: "/providers/hermes.png",
    color: "#8B5CF6",
    description: "Nous Research self-improving AI agent",
    configType: "custom",
  },
  droid: {
    id: "droid",
    name: "Factory Droid",
    image: "/providers/droid.png",
    color: "#00D4FF",
    description: "Factory Droid AI Assistant",
    configType: "custom",
  },
  cursor: {
    id: "cursor",
    name: "Cursor",
    image: "/providers/cursor.png",
    color: "#000000",
    description: "Cursor AI Code Editor",
    configType: "guide",
    requiresExternalUrl: true,
    notes: [
      { type: "warning", text: "Requires Cursor Pro account to use this feature." },
      { type: "cloudCheck", text: "Cursor routes requests through its own server, so local endpoint is not supported. Please enable Tunnel or Cloud Endpoint in Settings." },
    ],
    guideSteps: [
      { step: 1, title: "Open Settings", desc: "Go to Settings → Models" },
      { step: 2, title: "Enable OpenAI API", desc: "Enable \"OpenAI API key\" option" },
      { step: 3, title: "Base URL", value: "{{baseUrl}}", copyable: true },
      { step: 4, title: "API Key", type: "apiKeySelector" },
      { step: 5, title: "Add Custom Model", desc: "Click \"View All Model\" → \"Add Custom Model\"" },
      { step: 6, title: "Select Model", type: "modelSelector" },
    ],
  },
  cline: {
    id: "cline",
    name: "Cline",
    image: "/providers/cline.png",
    color: "#00D1B2",
    description: "Cline AI Coding Assistant",
    configType: "custom",
  },
  kilo: {
    id: "kilo",
    name: "Kilo Code",
    image: "/providers/kilocode.png",
    color: "#FF6B6B",
    description: "Kilo Code AI Assistant",
    configType: "custom",
  },
  roo: {
    id: "roo",
    name: "Roo",
    image: "/providers/roo.png",
    color: "#FF6B6B",
    description: "Roo AI Assistant",
    configType: "guide",
    guideSteps: [
      { step: 1, title: "Open Settings", desc: "Go to Roo Settings panel" },
      { step: 2, title: "Select Provider", desc: "Choose API Provider → Ollama" },
      { step: 3, title: "Base URL", value: "{{baseUrl}}", copyable: true },
      { step: 4, title: "API Key", type: "apiKeySelector" },
      { step: 5, title: "Select Model", type: "modelSelector" },
    ],
  },
  continue: {
    id: "continue",
    name: "Continue",
    image: "/providers/continue.png",
    color: "#7C3AED",
    description: "Continue AI Assistant",
    configType: "guide",
    guideSteps: [
      { step: 1, title: "Open Config", desc: "Open Continue configuration file" },
      { step: 2, title: "API Key", type: "apiKeySelector" },
      { step: 3, title: "Select Model", type: "modelSelector" },
      { step: 4, title: "Add Model Config", desc: "Add the following configuration to your models array:" },
    ],
    codeBlock: {
      language: "json",
      code: `{
  "apiBase": "{{baseUrl}}",
  "title": "{{model}}",
  "model": "{{model}}",
  "provider": "openai",
  "apiKey": "{{apiKey}}"
}`,
    },
  },
  amp: {
    id: "amp",
    name: "Amp CLI",
    image: "/providers/amp.png",
    color: "#F97316",
    description: "Sourcegraph Amp coding assistant CLI",
    docsUrl: "/docs?section=cli-tools&tool=amp",
    configType: "guide",
    defaultCommand: "amp",
    modelAliases: ["g25p", "g25f", "cs45", "g54"],
    notes: [
      { type: "info", text: "Use 9Router model aliases to keep Amp shorthand mappings stable across provider updates." },
      { type: "warning", text: "Suggested shorthand examples: g25p → gemini/gemini-2.5-pro, g25f → gemini/gemini-2.5-flash, cs45 → cc/claude-sonnet-4-5-20250929." },
    ],
    guideSteps: [
      { step: 1, title: "Install Amp", desc: "Install the Amp CLI using the package manager supported by your environment." },
      { step: 2, title: "API Key", type: "apiKeySelector" },
      { step: 3, title: "Base URL", value: "{{baseUrl}}", copyable: true },
      { step: 4, title: "Select Model", type: "modelSelector" },
      { step: 5, title: "Add Shorthands", desc: "Map Amp shorthand names such as g25p or cs45 to 9Router aliases in your local config." },
    ],
    codeBlock: {
      language: "bash",
      code: `export OPENAI_API_KEY="{{apiKey}}"
export OPENAI_BASE_URL="{{baseUrl}}"
amp --model "{{model}}"
# Example shorthand aliases you can map locally:
# g25p -> gemini/gemini-2.5-pro
# cs45 -> cc/claude-sonnet-4-5-20250929`,
    },
  },
  qwen: {
    id: "qwen",
    name: "Qwen Code",
    image: "/providers/qwen.png",
    color: "#10B981",
    description: "Alibaba Qwen Code CLI — supports OpenAI, Anthropic & Gemini providers via 9Router",
    docsUrl: "https://qwenlm.github.io/qwen-code-docs/en/users/configuration/model-providers/",
    configType: "guide",
    defaultCommand: "qwen",
    notes: [
      { type: "info", text: "Qwen Code supports multiple provider types (openai, anthropic, gemini) via modelProviders in settings.json. 9Router works as an OpenAI-compatible endpoint." },
      { type: "info", text: "Any model available in 9Router can be used — not just Qwen models. Select from Qwen, Claude, Gemini, GPT, and more." },
      { type: "warning", text: "Config path: Linux/macOS ~/.qwen/settings.json • Windows %USERPROFILE%\\.qwen\\settings.json" },
      { type: "error", text: "Qwen OAuth free tier was discontinued on 2026-04-15. Use 9Router with alicode/openrouter/anthropic/gemini providers instead." },
    ],
    modelAliases: ["coder-model", "qwen3-coder-plus", "qwen3-coder-flash", "vision-model", "claude-sonnet-4-6", "claude-opus-4-6-thinking", "gemini-3-flash", "gemini-3.1-pro-high"],
    defaultModels: [
      { id: "coder-model", name: "Coder Model (Qwen 3.6 Plus)", alias: "coder-model", envKey: "OPENAI_MODEL", defaultValue: "coder-model", isTopLevel: true },
      { id: "qwen3-coder-plus", name: "Qwen 3 Coder Plus", alias: "qwen3-coder-plus", envKey: "OPENAI_MODEL", defaultValue: "qwen3-coder-plus" },
      { id: "qwen3-coder-flash", name: "Qwen 3 Coder Flash", alias: "qwen3-coder-flash", envKey: "OPENAI_MODEL", defaultValue: "qwen3-coder-flash" },
      { id: "vision-model", name: "Vision Model (Multimodal)", alias: "vision-model", envKey: "OPENAI_MODEL", defaultValue: "vision-model" },
      { id: "claude-sonnet-4-6", name: "Claude Sonnet 4.6", alias: "claude-sonnet-4-6", envKey: "OPENAI_MODEL", defaultValue: "claude-sonnet-4-6" },
      { id: "claude-opus-4-6-thinking", name: "Claude Opus 4.6 Thinking", alias: "claude-opus-4-6-thinking", envKey: "OPENAI_MODEL", defaultValue: "claude-opus-4-6-thinking" },
      { id: "gemini-3.1-pro-high", name: "Gemini 3.1 Pro High", alias: "gemini-3.1-pro-high", envKey: "OPENAI_MODEL", defaultValue: "gemini-3.1-pro-high" },
      { id: "gemini-3-flash", name: "Gemini 3 Flash", alias: "gemini-3-flash", envKey: "OPENAI_MODEL", defaultValue: "gemini-3-flash" },
    ],
    guideSteps: [
      { step: 1, title: "Install Qwen Code", desc: "npm install -g @qwen-code/qwen-code" },
      { step: 2, title: "API Key", type: "apiKeySelector" },
      { step: 3, title: "Base URL", value: "{{baseUrl}}", copyable: true },
      { step: 4, title: "Select Model", type: "modelSelector" },
      { step: 5, title: "Save Config", desc: "Copy the JSON below to your ~/.qwen/settings.json file." },
    ],
    codeBlock: {
      language: "json",
      code: `{
  "security": {
    "auth": {
      "selectedType": "openai",
      "apiKey": "{{apiKey}}",
      "baseUrl": "{{baseUrl}}"
    }
  },
  "model": {
    "name": "{{model}}"
  }
}`,
    },
  },
  "deepseek-tui": {
    id: "deepseek-tui",
    name: "DeepSeek TUI",
    image: "/providers/deepseek-tui.png",
    color: "#4D6BFE",
    description: "DeepSeek Terminal Coding Agent (Rust TUI)",
    docsUrl: "https://github.com/DeepSeek-TUI/DeepSeek-TUI",
    configType: "custom",
    defaultCommand: "deepseek",
    modelAliases: ["deepseek-v4-pro", "deepseek-v4-flash", "deepseek-chat", "deepseek-reasoner"],
    defaultModels: [
      { id: "deepseek-v4-pro", name: "DeepSeek V4 Pro", alias: "deepseek-v4-pro" },
      { id: "deepseek-v4-flash", name: "DeepSeek V4 Flash", alias: "deepseek-v4-flash" },
      { id: "deepseek-chat", name: "DeepSeek V3 Chat", alias: "deepseek-chat" },
    ],
    notes: [
      { type: "info", text: "DeepSeek TUI uses ~/.deepseek/config.toml for configuration. 9Router will update the provider to 'openai' mode with your base_url, api_key, and model." },
      { type: "warning", text: "Config path: Linux/macOS ~/.deepseek/config.toml • Windows %USERPROFILE%\\.deepseek\\config.toml" },
    ],
  },
  jcode: {
    id: "jcode",
    name: "jcode",
    image: "/providers/jcode.png",
    color: "#FF6B35",
    description: "High-performance Rust-based coding agent harness",
    configType: "custom",
    docsUrl: "https://github.com/1jehuang/jcode",
    notes: [
      {
        type: "info",
        text: "jcode is a Rust-based coding agent with semantic memory, multi-agent swarms, and extreme performance (27.8 MB RAM, 14ms boot)."
      },
      {
        type: "info",
        text: "Configure 9router as an OpenAI-compatible provider to route all jcode requests through 9router's optimization layer."
      },
      {
        type: "warning",
        text: "Requires jcode installed. Install via: curl -fsSL https://raw.githubusercontent.com/1jehuang/jcode/master/scripts/install.sh | bash"
      },
    ],
    defaultModels: [
      { id: "claude-opus-4-7", name: "Claude Opus 4.7", alias: "opus", defaultValue: "cc/claude-opus-4-7" },
      { id: "claude-sonnet-4-6", name: "Claude Sonnet 4.6", alias: "sonnet", defaultValue: "cc/claude-sonnet-4-6" },
      { id: "gpt-5.5", name: "GPT 5.5", alias: "gpt5", defaultValue: "cx/gpt-5.5" },
      { id: "gemini-3.1-pro", name: "Gemini 3.1 Pro", alias: "gemini", defaultValue: "gemini/gemini-3.1-pro" },
    ],
  },
  // HIDDEN: gemini-cli
  // "gemini-cli": {
  //   id: "gemini-cli",
  //   name: "Gemini CLI",
  //   icon: "terminal",
  //   color: "#4285F4",
  //   description: "Google Gemini CLI",
  //   configType: "env",
  //   envVars: {
  //     baseUrl: "GEMINI_API_BASE_URL",
  //     model: "GEMINI_MODEL",
  //   },
  //   defaultModels: [
  //     { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", alias: "pro" },
  //     { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", alias: "flash" },
  //   ],
  // },
  claude_web: {
    id: "claude-web",
    name: "Claude Web (Native)",
    icon: "terminal",
    color: "#D97757",
    description: "Native Claude Web UI integration with sessionKey authentication",
    configType: "guide",
    notes: [
      {
        type: "info",
        text: "Use your Claude account sessionKey cookie to access Claude models directly through the web interface.",
      },
      {
        type: "info",
        text: "Supports Claude Sonnet 4.6, Opus 4.6, Haiku 4.5, and other Claude models.",
      },
    ],
    guideSteps: [
      {
        step: 1,
        title: "Get Your Session Key",
        desc: "Visit https://claude.ai while logged in, open Developer Tools (F12) → Application → Cookies → copy the 'sessionKey' value.",
      },
      {
        step: 2,
        title: "Add Claude Web Provider",
        desc: "Go to Providers → Add New → Select 'Claude Web (Native)'",
      },
      {
        step: 3,
        title: "Paste Session Key",
        desc: "Paste your sessionKey cookie value in the authentication field.",
      },
      {
        step: 4,
        title: "Select Model",
        desc: "Choose from claude-sonnet-4-6, claude-opus-4-6, claude-haiku-4-5, or add custom Claude models.",
      },
    ],
    codeBlock: {
      language: "json",
      code: `{
  "provider": "claude-web",
  "model": "claude-sonnet-4-6",
  "apiKey": "<your-claude-session-key>"
}`,
    },
  },
  deepseek_web: {
    id: "deepseek-web",
    name: "DeepSeek Web (Native)",
    icon: "terminal",
    color: "#4D6BFE",
    description: "Native DeepSeek Web UI integration with USER_TOKEN authentication",
    configType: "guide",
    notes: [
      {
        type: "info",
        text: "Use your DeepSeek account USER_TOKEN to access DeepSeek models directly through the web interface.",
      },
      {
        type: "info",
        text: "Supports DeepSeek Chat and DeepSeek Reasoner models with deep thinking.",
      },
    ],
    guideSteps: [
      {
        step: 1,
        title: "Get Your User Token",
        desc: "Visit https://chat.deepseek.com while logged in, open Developer Tools (F12) → Application → Local Storage → chat.deepseek.com → copy the 'USER_TOKEN' value.",
      },
      {
        step: 2,
        title: "Add DeepSeek Web Provider",
        desc: "Go to Providers → Add New → Select 'DeepSeek Web (Native)'",
      },
      {
        step: 3,
        title: "Paste User Token",
        desc: "Paste your USER_TOKEN value in the authentication field.",
      },
      {
        step: 4,
        title: "Select Model",
        desc: "Choose from deepseek-web-chat or deepseek-web-reasoner.",
      },
    ],
    codeBlock: {
      language: "json",
      code: `{
  "provider": "deepseek-web",
  "model": "deepseek-web-chat",
  "apiKey": "<your-deepseek-user-token>"
}`,
    },
  },
};

// Get all provider models for mapping dropdown
export const getProviderModelsForMapping = (providers) => {
  const result = [];
  providers.forEach(conn => {
    if (conn.isActive && (conn.testStatus === "active" || conn.testStatus === "success")) {
      result.push({
        connectionId: conn.id,
        provider: conn.provider,
        name: conn.name,
        models: conn.models || [],
      });
    }
  });
  return result;
};

