/**
 * DeepSeek Web UI provider — native integration with chat.deepseek.com
 * Uses user token from browser to access DeepSeek models directly
 * Supports streaming, deep thinking, and tool use
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
    { id: "deepseek-web-chat", name: "DeepSeek Chat (Web)", capabilities: ["text", "vision", "tools"], params: ["temperature", "max_tokens"] },
    { id: "deepseek-web-reasoner", name: "DeepSeek Reasoner (Web)", capabilities: ["text", "tools"], params: ["temperature", "max_tokens"] },
  ],
  passthroughModels: true,
  serviceKinds: ["llm"],
  hasProviderSpecificData: false,
};
