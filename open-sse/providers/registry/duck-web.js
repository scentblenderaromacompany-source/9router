/**
 * Duck.ai (DuckDuckGo AI Chat) Web UI provider — native integration with duck.ai
 * Uses VQD challenge tokens for authentication (no API key required)
 * Supports GPT-4o, GPT-5-mini, Claude Haiku 4.5, Llama 4 Scout, Mistral Small
 */
export default {
  id: "duck-web",
  priority: 140,
  alias: "duck-web",
  aliases: ["dw"],
  uiAlias: "dw",
  display: {
    name: "Duck.ai (Free)",
    icon: "chat",
    color: "#DE5833",
    textIcon: "DW",
    website: "https://duck.ai",
    notice: {
      signupUrl: "https://duck.ai",
      info: "No account required! Duck.ai provides free access to GPT-4o, Claude Haiku 4.5, Llama 4 Scout, and Mistral Small.",
    },
    kindNotice: {
      image: "Free tier available. Supports GPT-5-mini reasoning, web search, and vision.",
    },
  },
  category: "webCookie",
  authType: "none",
  authHint: "No authentication needed — Duck.ai is free and anonymous",
  transport: {
    baseUrl: "https://duck.ai",
    format: "openai",
  },
  models: [
    { id: "gpt-4o-mini", name: "GPT-4o Mini", capabilities: ["text", "vision", "tools"], params: ["temperature"] },
    { id: "gpt-5-mini", name: "GPT-5 Mini", capabilities: ["text", "vision", "tools"], params: ["temperature"] },
    { id: "claude-haiku-4-5", name: "Claude Haiku 4.5", capabilities: ["text", "vision", "tools"], params: ["temperature"] },
    { id: "meta-llama/Llama-4-Scout-17B-16E-Instruct", name: "Llama 4 Scout", capabilities: ["text"], params: ["temperature"] },
    { id: "mistral-small-2603", name: "Mistral Small", capabilities: ["text"], params: ["temperature"] },
    { id: "tinfoil/gpt-oss-120b", name: "GPT-OSS 120B", capabilities: ["text"], params: ["temperature"] },
  ],
  passthroughModels: true,
  serviceKinds: ["llm"],
  hasProviderSpecificData: false,
};
