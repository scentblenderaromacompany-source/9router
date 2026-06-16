/**
 * Z.AI (Zhipu) provider — integration with Zhipu AI's international platform
 * Uses Z.AI API keys to access GLM models
 * Supports chat, vision, tools, thinking, image generation, video, audio, and more
 */
export default {
  id: "z-ai",
  priority: 145,
  alias: "zai",
  aliases: ["zhipu", "glm"],
  uiAlias: "zai",
  display: {
    name: "Z.AI (Zhipu)",
    icon: "auto_awesome",
    color: "#6366F1",
    textIcon: "ZAI",
    website: "https://z.ai",
    notice: {
      signupUrl: "https://z.ai/manage-apikey/apikey-list",
    },
    kindNotice: {
      image: "Requires a Z.AI account with API access. Uses GLM Coding Plan or pay-per-token quota.",
    },
  },
  category: "api",
  authType: "apikey",
  authHint: "Paste your Z.AI API key from https://z.ai/manage-apikey/apikey-list",
  transport: {
    baseUrl: "https://api.z.ai/api/paas/v4",
    format: "openai",
    authType: "apikey",
  },
  models: [
    // Text models (flagship)
    { id: "glm-5.1", name: "GLM-5.1", capabilities: ["text", "tools"], description: "Latest flagship model, 128K context" },
    { id: "glm-5-turbo", name: "GLM-5 Turbo", capabilities: ["text", "tools"], description: "Fast flagship model" },
    { id: "glm-5", name: "GLM-5", capabilities: ["text", "tools"], description: "Standard flagship" },
    
    // Text models (4.7 series)
    { id: "glm-4.7", name: "GLM-4.7", capabilities: ["text", "tools"], description: "Previous generation" },
    { id: "glm-4.7-flash", name: "GLM-4.7 Flash", capabilities: ["text", "tools"], description: "Fast inference" },
    { id: "glm-4.7-flashx", name: "GLM-4.7 FlashX", capabilities: ["text", "tools"], description: "Ultra-fast inference" },
    
    // Text models (4.6 series)
    { id: "glm-4.6", name: "GLM-4.6", capabilities: ["text", "tools"], description: "Legacy model" },
    
    // Text models (4.5 series)
    { id: "glm-4.5", name: "GLM-4.5", capabilities: ["text", "tools"], description: "Older generation" },
    { id: "glm-4.5-air", name: "GLM-4.5 Air", capabilities: ["text", "tools"], description: "Lightweight" },
    { id: "glm-4.5-x", name: "GLM-4.5 X", capabilities: ["text", "tools"], description: "Extended variant" },
    { id: "glm-4.5-airx", name: "GLM-4.5 AirX", capabilities: ["text", "tools"], description: "Ultra-lightweight" },
    { id: "glm-4.5-flash", name: "GLM-4.5 Flash", capabilities: ["text", "tools"], description: "Fast legacy" },
    
    // Text models (legacy)
    { id: "glm-4-32b-0414-128k", name: "GLM-4 32B 128K", capabilities: ["text", "tools"], description: "128K context legacy" },
    
    // Vision models
    { id: "glm-5v-turbo", name: "GLM-5V Turbo", capabilities: ["text", "vision", "tools"], kind: "image", description: "Latest vision model, 128K output" },
    { id: "glm-4.6v", name: "GLM-4.6V", capabilities: ["text", "vision", "tools"], kind: "image", description: "Previous vision, 32K output" },
    { id: "glm-4.6v-flash", name: "GLM-4.6V Flash", capabilities: ["text", "vision"], kind: "image", description: "Fast vision" },
    { id: "glm-4.6v-flashx", name: "GLM-4.6V FlashX", capabilities: ["text", "vision"], kind: "image", description: "Ultra-fast vision" },
    { id: "glm-4.5v", name: "GLM-4.5V", capabilities: ["text", "vision"], kind: "image", description: "Legacy vision, 16K output" },
    { id: "autoglm-phone-multilingual", name: "AutoGLM Phone", capabilities: ["text", "vision", "tools"], kind: "image", description: "Mobile assistant model" },
    
    // Image generation models
    { id: "glm-image", name: "GLM-Image", capabilities: ["text2img"], kind: "image", description: "Image generation" },
    { id: "cogview-4", name: "CogView-4", capabilities: ["text2img"], kind: "image", description: "Advanced image generation" },
    
    // Video generation models
    { id: "cogvideox-3", name: "CogVideoX-3", capabilities: ["text2video"], kind: "video", description: "Text/Image to video" },
    { id: "vidu-q1", name: "Vidu Q1", capabilities: ["text2video", "image2video"], kind: "video", description: "High-performance video" },
    { id: "vidu-2", name: "Vidu 2", capabilities: ["text2video", "image2video"], kind: "video", description: "Video generation" },
    
    // Audio models
    { id: "glm-asr-2512", name: "GLM-ASR-2512", capabilities: ["speech2text"], kind: "audio", description: "Speech to text" },
    
    // OCR/Document models
    { id: "glm-ocr", name: "GLM-OCR", capabilities: ["ocr"], kind: "image", description: "Document layout parsing" },
  ],
  passthroughModels: true,
  serviceKinds: ["llm", "image", "video", "audio"],
  hasProviderSpecificData: false,
};
