/**
 * DeepSeek Web UI provider — native integration with chat.deepseek.com
 * Uses user token from browser to access DeepSeek models directly
 * Supports streaming, deep thinking, web search, vision, and tool use
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
    // DeepSeek V4 Flash models
    { id: "deepseek-default", name: "DeepSeek V4 Flash", capabilities: ["text", "tools"], params: ["temperature", "max_tokens"] },
    { id: "deepseek-reasoner", name: "DeepSeek V4 Flash Reasoning", capabilities: ["text", "tools"], params: ["temperature", "max_tokens"] },
    { id: "deepseek-search", name: "DeepSeek V4 Flash Search", capabilities: ["text", "tools"], params: ["temperature", "max_tokens"] },
    { id: "deepseek-reasoner-search", name: "DeepSeek V4 Flash Reasoning+Search", capabilities: ["text", "tools"], params: ["temperature", "max_tokens"] },
    
    // DeepSeek V4 Pro models
    { id: "deepseek-expert", name: "DeepSeek V4 Pro", capabilities: ["text", "tools"], params: ["temperature", "max_tokens"] },
    { id: "deepseek-expert-reasoner", name: "DeepSeek V4 Pro Reasoning", capabilities: ["text", "tools"], params: ["temperature", "max_tokens"] },
    { id: "deepseek-expert-search", name: "DeepSeek V4 Pro Search", capabilities: ["text", "tools"], params: ["temperature", "max_tokens"] },
    { id: "deepseek-expert-reasoner-search", name: "DeepSeek V4 Pro Reasoning+Search", capabilities: ["text", "tools"], params: ["temperature", "max_tokens"] },
    
    // DeepSeek Vision models
    { id: "deepseek-vision", name: "DeepSeek Vision", capabilities: ["text", "vision", "tools"], params: ["temperature", "max_tokens"] },
    { id: "deepseek-vision-reasoner", name: "DeepSeek Vision Reasoning", capabilities: ["text", "vision", "tools"], params: ["temperature", "max_tokens"] },
    
    // Legacy aliases
    { id: "deepseek-web-chat", name: "DeepSeek Chat (Legacy)", capabilities: ["text", "tools"], params: ["temperature", "max_tokens"] },
    { id: "deepseek-web-reasoner", name: "DeepSeek Reasoner (Legacy)", capabilities: ["text", "tools"], params: ["temperature", "max_tokens"] },
  ],
  passthroughModels: true,
  serviceKinds: ["llm"],
  hasProviderSpecificData: false,
};
