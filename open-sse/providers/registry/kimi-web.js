/**
 * Kimi Web UI provider — native integration with kimi.com
 * Uses bearer token from browser to access Kimi models directly
 * Supports streaming, thinking, web search, vision, and file upload
 * 
 * Available Endpoints:
 * - POST /api/chat                              - Create new chat session
 * - POST /api/chat/{chat_id}/completion/stream   - Send message (SSE streaming)
 * - GET  /api/chat/{chat_id}                     - Get chat session info
 * - GET  /api/chat/{chat_id}/messages            - Get chat history
 * - DELETE /api/chat/{chat_id}                   - Delete chat session
 * - POST /api/files/upload                       - Upload file
 * - GET  /api/files                              - List files
 * - GET  /api/user/me                            - Get current user info
 * - GET  /api/models                             - List available models
 * - POST /api/chat/{chat_id}/title               - Generate chat title
 * - POST /api/chat/{chat_id}/share               - Share chat
 * - GET  /api/search                             - Web search
 */
export default {
  id: "kimi-web",
  priority: 140,
  alias: "kimi-web",
  aliases: ["kw"],
  uiAlias: "kw",
  display: {
    name: "Kimi Web (Native)",
    icon: "smart_toy",
    color: "#6C5CE7",
    textIcon: "KW",
    website: "https://kimi.com",
    notice: {
      signupUrl: "https://kimi.com",
      info: "Requires Bearer token from kimi.com. Get it from F12 → Network → any request → Authorization: Bearer token",
    },
    kindNotice: {
      image: "Requires a Kimi account. Uses your Kimi web chat quota for API calls.",
    },
  },
  category: "webCookie",
  authType: "cookie",
  authHint: "Paste your Kimi Bearer token from browser DevTools",
  transport: {
    baseUrl: "https://kimi.com",
    format: "openai",
  },
  models: [
    // Kimi K2.7 models
    { id: "kimi-k2.7", name: "Kimi K2.7", capabilities: ["text", "tools"], params: ["temperature", "max_tokens"] },
    { id: "kimi-k2.7-thinking", name: "Kimi K2.7 Thinking", capabilities: ["text", "tools"], params: ["temperature", "max_tokens"] },
    { id: "kimi-k2.7-code", name: "Kimi K2.7 Code", capabilities: ["text", "tools"], params: ["temperature", "max_tokens"] },
    
    // Kimi K2.6 models
    { id: "kimi-k2.6", name: "Kimi K2.6", capabilities: ["text", "tools"], params: ["temperature", "max_tokens"] },
    { id: "kimi-k2.6-thinking", name: "Kimi K2.6 Thinking", capabilities: ["text", "tools"], params: ["temperature", "max_tokens"] },
    
    // Kimi K2.5 models
    { id: "kimi-k2.5", name: "Kimi K2.5", capabilities: ["text", "vision", "tools"], params: ["temperature", "max_tokens"] },
    { id: "kimi-k2.5-thinking", name: "Kimi K2.5 Thinking", capabilities: ["text", "vision", "tools"], params: ["temperature", "max_tokens"] },
    
    // Kimi K2 models
    { id: "kimi-k2", name: "Kimi K2", capabilities: ["text", "tools"], params: ["temperature", "max_tokens"] },
    { id: "kimi-k2-thinking", name: "Kimi K2 Thinking", capabilities: ["text", "tools"], params: ["temperature", "max_tokens"] },
    
    // Kimi K1.5 models
    { id: "kimi-k1.5", name: "Kimi K1.5", capabilities: ["text", "tools"], params: ["temperature", "max_tokens"] },
    { id: "kimi-k1.5-thinking", name: "Kimi K1.5 Thinking", capabilities: ["text", "tools"], params: ["temperature", "max_tokens"] },
    
    // Kimi legacy models
    { id: "kimi", name: "Kimi Latest", capabilities: ["text", "tools"], params: ["temperature", "max_tokens"] },
    { id: "kimi-vision", name: "Kimi Vision", capabilities: ["text", "vision"], params: ["temperature", "max_tokens"] },
    
    // OK Computer
    { id: "ok-computer", name: "OK Computer", capabilities: ["text", "tools"], params: ["temperature", "max_tokens"] },
  ],
  passthroughModels: true,
  serviceKinds: ["llm"],
  hasProviderSpecificData: false,
};
