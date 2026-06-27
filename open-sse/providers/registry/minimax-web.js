/**
 * MiniMax Web UI provider — native integration with hailuoai.com / agent.minimaxi.com
 * Uses bearer token from browser to access MiniMax models directly
 * Supports streaming, thinking, web search, vision, and tool use
 * 
 * Available Endpoints:
 * - POST /v1/chat/completions               - Chat completion (OpenAI compatible)
 * - POST /v1/audio/speech                    - Text-to-speech
 * - POST /v1/audio/transcriptions            - Speech-to-text
 * - POST /token/check                        - Token health check
 */
export default {
  id: "minimax-web",
  priority: 140,
  alias: "minimax-web",
  aliases: ["mmw"],
  uiAlias: "mmw",
  display: {
    name: "MiniMax Web (Native)",
    icon: "bolt",
    color: "#21D07A",
    textIcon: "MMW",
    website: "https://hailuoai.com",
    notice: {
      signupUrl: "https://hailuoai.com",
      info: "Requires Bearer token from hailuoai.com. Get it from F12 → Application → Local Storage → _token + realUserID",
    },
    kindNotice: {
      image: "Requires a MiniMax account. Uses your HailuoAI web chat quota for API calls.",
    },
  },
  category: "webCookie",
  authType: "cookie",
  authHint: "Paste your MiniMax Bearer token (realUserID + _token)",
  transport: {
    baseUrl: "https://hailuoai.com",
    format: "openai",
  },
  models: [
    // MiniMax M3 models
    { id: "minimax-m3", name: "MiniMax-M3", capabilities: ["text", "vision", "tools"], params: ["temperature", "max_tokens"] },
    { id: "minimax-m3-thinking", name: "MiniMax-M3 Thinking", capabilities: ["text", "vision", "tools"], params: ["temperature", "max_tokens"] },
    
    // MiniMax M2.7 models
    { id: "minimax-m2.7", name: "MiniMax-M2.7", capabilities: ["text", "tools"], params: ["temperature", "max_tokens"] },
    { id: "minimax-m2.7-thinking", name: "MiniMax-M2.7 Thinking", capabilities: ["text", "tools"], params: ["temperature", "max_tokens"] },
    
    // MiniMax M2.5 models
    { id: "minimax-m2.5", name: "MiniMax-M2.5", capabilities: ["text", "tools"], params: ["temperature", "max_tokens"] },
    { id: "minimax-m2.5-highspeed", name: "MiniMax-M2.5 Highspeed", capabilities: ["text", "tools"], params: ["temperature", "max_tokens"] },
    
    // MiniMax M2.1 models
    { id: "minimax-m2.1", name: "MiniMax-M2.1", capabilities: ["text", "tools"], params: ["temperature", "max_tokens"] },
    { id: "minimax-m2.1-highspeed", name: "MiniMax-M2.1 Highspeed", capabilities: ["text", "tools"], params: ["temperature", "max_tokens"] },
    
    // MiniMax M2 models
    { id: "minimax-m2", name: "MiniMax-M2", capabilities: ["text", "tools"], params: ["temperature", "max_tokens"] },
    
    // Legacy models
    { id: "hailuo", name: "Hailuo (Legacy)", capabilities: ["text"], params: ["temperature", "max_tokens"] },
    { id: "minimax-text-01", name: "MiniMax Text-01", capabilities: ["text"], params: ["temperature", "max_tokens"] },
    { id: "minimax-vl-01", name: "MiniMax VL-01", capabilities: ["text", "vision"], params: ["temperature", "max_tokens"] },
  ],
  passthroughModels: true,
  serviceKinds: ["llm"],
  hasProviderSpecificData: false,
};
