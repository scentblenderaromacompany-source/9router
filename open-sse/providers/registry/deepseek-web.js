/**
 * DeepSeek Web UI provider — native integration with chat.deepseek.com
 * Uses user token from browser to access DeepSeek models directly
 *
 * Official model IDs from api.deepseek.com:
 * - deepseek-v4-flash: DeepSeek V4 Flash (current flagship fast model)
 * - deepseek-v4-pro: DeepSeek V4 Pro (current flagship pro model)
 * - deepseek-chat: DeepSeek V3.2 Chat (deprecated 2026/07/24)
 * - deepseek-reasoner: DeepSeek V3.2 Reasoner (deprecated 2026/07/24)
 *
 * Web UI model_type mapping:
 * - model_type "default" → V4 Flash
 * - model_type "expert" → V4 Pro
 * - search_enabled: true → web search
 * - thinking_enabled: true → reasoning mode
 */
export default {
  id: "deepseek-web",
  priority: 140,
  alias: "deepseek-web",
  aliases: ["dsw"],
  uiAlias: "dsw",
  display: {
    name: "DeepSeek Web (Native)",
    icon: "bolt",
    color: "#4D6BFE",
    textIcon: "DSW",
    website: "https://chat.deepseek.com",
    notice: {
      signupUrl: "https://chat.deepseek.com",
      info: "Requires USER_TOKEN from chat.deepseek.com local storage. Get it from F12 → Application → Local Storage → chat.deepseek.com → USER_TOKEN",
    },
    kindNotice: {
      image: "Requires a DeepSeek account. Uses your DeepSeek web chat quota for API calls.",
    },
  },
  category: "webCookie",
  authType: "cookie",
  authHint: "Paste your DeepSeek USER_TOKEN from browser local storage",
  transport: {
    baseUrl: "https://chat.deepseek.com",
    format: "openai",
  },
  models: [
    // V4 Flash models (model_type: "default")
    { id: "deepseek-v4-flash", name: "DeepSeek V4 Flash", capabilities: ["text", "tools"], params: ["temperature", "max_tokens"] },
    { id: "deepseek-v4-flash-reasoner", name: "DeepSeek V4 Flash Reasoning", capabilities: ["text", "tools"], params: ["temperature", "max_tokens"] },
    { id: "deepseek-v4-flash-search", name: "DeepSeek V4 Flash Search", capabilities: ["text", "tools"], params: ["temperature", "max_tokens"] },
    { id: "deepseek-v4-flash-reasoner-search", name: "DeepSeek V4 Flash Reasoning+Search", capabilities: ["text", "tools"], params: ["temperature", "max_tokens"] },

    // V4 Pro models (model_type: "expert")
    { id: "deepseek-v4-pro", name: "DeepSeek V4 Pro", capabilities: ["text", "tools"], params: ["temperature", "max_tokens"] },
    { id: "deepseek-v4-pro-reasoner", name: "DeepSeek V4 Pro Reasoning", capabilities: ["text", "tools"], params: ["temperature", "max_tokens"] },
    { id: "deepseek-v4-pro-search", name: "DeepSeek V4 Pro Search", capabilities: ["text", "tools"], params: ["temperature", "max_tokens"] },
    { id: "deepseek-v4-pro-reasoner-search", name: "DeepSeek V4 Pro Reasoning+Search", capabilities: ["text", "tools"], params: ["temperature", "max_tokens"] },

    // Legacy V3.2 models (still supported by web UI)
    { id: "deepseek-chat", name: "DeepSeek V3.2 Chat", capabilities: ["text", "tools"], params: ["temperature", "max_tokens"] },
    { id: "deepseek-reasoner", name: "DeepSeek V3.2 Reasoner", capabilities: ["text", "tools"], params: ["temperature", "max_tokens"] },
  ],
  passthroughModels: true,
  serviceKinds: ["llm"],
  hasProviderSpecificData: false,
};
