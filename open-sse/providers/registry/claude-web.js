/**
 * Claude Web UI provider — native integration with Claude.ai
 * Uses sessionKey cookie from browser to access Claude models
 * Supports streaming, extended thinking, and tool use
 */
export default {
  id: "claude-web",
  priority: 140,
  alias: "claude-web",
  aliases: ["cw"],
  uiAlias: "cw",
  display: {
    name: "Claude Web (Native)",
    icon: "auto_awesome",
    color: "#D97757",
    textIcon: "CW",
    website: "https://claude.ai",
    notice: {
      signupUrl: "https://claude.ai",
      info: "Requires sessionKey cookie from claude.ai. Get it from F12 → Application → Cookies → sessionKey",
    },
    kindNotice: {
      image: "Requires a Claude account. Uses your Claude Pro/Max subscription quota for API calls.",
    },
  },
  category: "webCookie",
  authType: "cookie",
  authHint: "Paste your Claude sessionKey cookie value (from claude.ai browser cookies)",
  transport: {
    baseUrl: "http://localhost:8700/v1",
    format: "openai",
    authType: "apikey",
  },
  models: [
    // Claude 4.x models
    { id: "claude-sonnet-4-6", name: "Claude Sonnet 4.6", capabilities: ["text", "vision", "tools"], params: ["temperature", "max_tokens"] },
    { id: "claude-opus-4-6", name: "Claude Opus 4.6", capabilities: ["text", "vision", "tools"], params: ["temperature", "max_tokens"] },
    { id: "claude-haiku-4-5", name: "Claude Haiku 4.5", capabilities: ["text", "vision", "tools"], params: ["temperature", "max_tokens"] },
    
    // Claude 4 models
    { id: "claude-sonnet-4", name: "Claude Sonnet 4", capabilities: ["text", "vision", "tools"], params: ["temperature", "max_tokens"] },
    { id: "claude-opus-4", name: "Claude Opus 4", capabilities: ["text", "vision", "tools"], params: ["temperature", "max_tokens"] },
    
    // Claude 3.x models
    { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet", capabilities: ["text", "vision", "tools"], params: ["temperature", "max_tokens"] },
    { id: "claude-3-5-haiku", name: "Claude 3.5 Haiku", capabilities: ["text", "vision", "tools"], params: ["temperature", "max_tokens"] },
  ],
  passthroughModels: true,
  serviceKinds: ["llm"],
  hasProviderSpecificData: false,
};
