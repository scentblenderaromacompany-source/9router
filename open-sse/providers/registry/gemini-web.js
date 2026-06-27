/**
 * Google Gemini Web UI provider — native integration with gemini.google.com
 * Uses cookies from browser to access Gemini models directly
 * Supports streaming, thinking, vision, and deep research
 * 
 * Authentication: __Secure-1PSID and __Secure-1PSIDTS cookies from gemini.google.com
 */
export default {
  id: "gemini-web",
  priority: 140,
  alias: "gemini-web",
  aliases: ["gmw"],
  uiAlias: "gmw",
  display: {
    name: "Gemini Web (Native)",
    icon: "auto_awesome",
    color: "#4285F4",
    textIcon: "GW",
    website: "https://gemini.google.com",
    notice: {
      signupUrl: "https://gemini.google.com",
      info: "Requires __Secure-1PSID and __Secure-1PSIDTS cookies from gemini.google.com. Get them from F12 → Application → Cookies → .google.com",
    },
    kindNotice: {
      image: "Requires a Google account. Uses your Gemini web chat quota for API calls.",
    },
  },
  category: "webCookie",
  authType: "cookie",
  authHint: "Paste your Gemini cookies (__Secure-1PSID and __Secure-1PSIDTS)",
  transport: {
    baseUrl: "https://gemini.google.com",
    format: "openai",
  },
  models: [
    { id: "gemini-3-pro", name: "Gemini 3 Pro", capabilities: ["text", "vision", "tools"], params: ["temperature", "max_tokens"] },
    { id: "gemini-3-flash", name: "Gemini 3 Flash", capabilities: ["text", "vision", "tools"], params: ["temperature", "max_tokens"] },
    { id: "gemini-3-flash-thinking", name: "Gemini 3 Flash Thinking", capabilities: ["text", "vision", "tools"], params: ["temperature", "max_tokens"] },
    { id: "gemini-3-lite", name: "Gemini 3 Lite", capabilities: ["text", "tools"], params: ["temperature", "max_tokens"] },
    { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", capabilities: ["text", "vision", "tools"], params: ["temperature", "max_tokens"] },
    { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", capabilities: ["text", "vision", "tools"], params: ["temperature", "max_tokens"] },
    { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", capabilities: ["text", "vision", "tools"], params: ["temperature", "max_tokens"] },
    { id: "gemini-2.0-flash-lite", name: "Gemini 2.0 Flash Lite", capabilities: ["text", "tools"], params: ["temperature", "max_tokens"] },
  ],
  passthroughModels: true,
  serviceKinds: ["llm"],
  hasProviderSpecificData: false,
};
