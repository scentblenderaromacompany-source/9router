/**
 * Pollinations.ai Provider Registry - ALL live models from API
 */

import { PollinationsExecutor } from "../executors/pollinations.js";

const REGISTRY = {
  id: "pollinations",
  name: "Pollinations.ai",
  authType: "api_key_optional",
  authHeader: "Authorization",
  authFormat: "Bearer <sk_* or pk_* key>",
  category: "multi-modal",
  enabled: true,
  isDefault: true,
  baseUrl: "https://gen.pollinations.ai",
  description: "Free multi-modal AI: chat, image, video, TTS, STT, embeddings, realtime",

  models: [
    // ============ Text Models (55+) ============
    { id: "openai", name: "OpenAI", mode: "chat", input: ["text"], output: ["text"], capabilities: ["chat", "function-calling"], cost: "free" },
    { id: "openai-fast", name: "OpenAI Fast", mode: "chat", input: ["text"], output: ["text"], capabilities: ["chat", "function-calling"], cost: "free" },
    { id: "openai-large", name: "OpenAI Large", mode: "chat", input: ["text"], output: ["text"], capabilities: ["chat", "function-calling", "reasoning"], cost: "free" },
    { id: "gpt-5.4-mini", name: "GPT-5.4 Mini", mode: "chat", input: ["text"], output: ["text"], capabilities: ["chat", "function-calling"], cost: "free" },
    { id: "gpt-5.5", name: "GPT-5.5", mode: "chat", input: ["text"], output: ["text"], capabilities: ["chat", "function-calling", "reasoning"], cost: "free" },
    { id: "qwen-coder", name: "Qwen Coder", mode: "chat", input: ["text"], output: ["text"], capabilities: ["chat", "function-calling"], cost: "free" },
    { id: "qwen-coder-large", name: "Qwen Coder Large", mode: "chat", input: ["text"], output: ["text"], capabilities: ["chat", "function-calling"], cost: "free" },
    { id: "qwen-large", name: "Qwen Large", mode: "chat", input: ["text"], output: ["text"], capabilities: ["chat", "function-calling", "reasoning"], cost: "free" },
    { id: "qwen-vision", name: "Qwen Vision", mode: "chat", input: ["text", "image"], output: ["text"], capabilities: ["chat", "vision", "function-calling"], cost: "free" },
    { id: "qwen-vision-pro", name: "Qwen Vision Pro", mode: "chat", input: ["text", "image"], output: ["text"], capabilities: ["chat", "vision", "function-calling", "reasoning"], cost: "free" },
    { id: "mistral", name: "Mistral", mode: "chat", input: ["text"], output: ["text"], capabilities: ["chat", "function-calling"], cost: "free" },
    { id: "mistral-4", name: "Mistral 4", mode: "chat", input: ["text"], output: ["text"], capabilities: ["chat", "function-calling", "reasoning"], cost: "free" },
    { id: "mistral-large", name: "Mistral Large", mode: "chat", input: ["text"], output: ["text"], capabilities: ["chat", "function-calling", "reasoning"], cost: "free" },
    { id: "gemini", name: "Gemini", mode: "chat", input: ["text"], output: ["text"], capabilities: ["chat", "function-calling"], cost: "free" },
    { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash", mode: "chat", input: ["text"], output: ["text"], capabilities: ["chat", "function-calling"], cost: "free" },
    { id: "gemini-flash-lite-3.1", name: "Gemini Flash Lite 3.1", mode: "chat", input: ["text"], output: ["text"], capabilities: ["chat", "function-calling"], cost: "free" },
    { id: "gemini-fast", name: "Gemini Fast", mode: "chat", input: ["text"], output: ["text"], capabilities: ["chat", "function-calling"], cost: "free" },
    { id: "gemini-large", name: "Gemini Large", mode: "chat", input: ["text"], output: ["text"], capabilities: ["chat", "function-calling", "reasoning"], cost: "free" },
    { id: "gemini-search", name: "Gemini Search", mode: "chat", input: ["text"], output: ["text"], capabilities: ["chat", "search"], cost: "free" },
    { id: "gemini-search-fast", name: "Gemini Search Fast", mode: "chat", input: ["text"], output: ["text"], capabilities: ["chat", "search"], cost: "free" },
    { id: "gemini-search-large", name: "Gemini Search Large", mode: "chat", input: ["text"], output: ["text"], capabilities: ["chat", "search"], cost: "free" },
    { id: "deepseek", name: "DeepSeek", mode: "chat", input: ["text"], output: ["text"], capabilities: ["chat", "function-calling", "reasoning"], cost: "free" },
    { id: "deepseek-pro", name: "DeepSeek Pro", mode: "chat", input: ["text"], output: ["text"], capabilities: ["chat", "function-calling", "reasoning"], cost: "free" },
    { id: "gemma", name: "Gemma", mode: "chat", input: ["text"], output: ["text"], capabilities: ["chat", "function-calling", "reasoning"], cost: "free" },
    { id: "grok", name: "Grok", mode: "chat", input: ["text"], output: ["text"], capabilities: ["chat", "function-calling"], cost: "free" },
    { id: "grok-large", name: "Grok Large", mode: "chat", input: ["text"], output: ["text"], capabilities: ["chat", "function-calling", "reasoning"], cost: "free" },
    { id: "grok-4.3", name: "Grok 4.3", mode: "chat", input: ["text"], output: ["text"], capabilities: ["chat", "function-calling", "reasoning"], cost: "free" },
    { id: "claude-fast", name: "Claude Fast", mode: "chat", input: ["text"], output: ["text"], capabilities: ["chat", "function-calling"], cost: "free" },
    { id: "claude", name: "Claude", mode: "chat", input: ["text"], output: ["text"], capabilities: ["chat", "function-calling"], cost: "free" },
    { id: "claude-large", name: "Claude Large", mode: "chat", input: ["text"], output: ["text"], capabilities: ["chat", "function-calling"], cost: "free" },
    { id: "claude-opus-4.7", name: "Claude Opus 4.7", mode: "chat", input: ["text"], output: ["text"], capabilities: ["chat", "function-calling"], cost: "free" },
    { id: "claude-opus-4.8", name: "Claude Opus 4.8", mode: "chat", input: ["text"], output: ["text"], capabilities: ["chat", "function-calling"], cost: "free" },
    { id: "perplexity-fast", name: "Perplexity Fast", mode: "chat", input: ["text"], output: ["text"], capabilities: ["chat", "search"], cost: "free" },
    { id: "perplexity-deep", name: "Perplexity Deep", mode: "chat", input: ["text"], output: ["text"], capabilities: ["chat", "search"], cost: "free" },
    { id: "perplexity", name: "Perplexity", mode: "chat", input: ["text"], output: ["text"], capabilities: ["chat", "search"], cost: "free" },
    { id: "perplexity-reasoning", name: "Perplexity Reasoning", mode: "chat", input: ["text"], output: ["text"], capabilities: ["chat", "search", "reasoning"], cost: "free" },
    { id: "kimi", name: "Kimi", mode: "chat", input: ["text"], output: ["text"], capabilities: ["chat", "function-calling", "reasoning"], cost: "free" },
    { id: "kimi-k2.6", name: "Kimi K2.6", mode: "chat", input: ["text"], output: ["text"], capabilities: ["chat", "function-calling", "reasoning"], cost: "free" },
    { id: "kimi-k2.7-code", name: "Kimi K2.7 Code", mode: "chat", input: ["text"], output: ["text"], capabilities: ["chat", "function-calling", "reasoning"], cost: "free" },
    { id: "nova-fast", name: "Nova Fast", mode: "chat", input: ["text"], output: ["text"], capabilities: ["chat", "function-calling"], cost: "free" },
    { id: "nova", name: "Nova", mode: "chat", input: ["text"], output: ["text"], capabilities: ["chat", "function-calling", "reasoning"], cost: "free" },
    { id: "glm", name: "GLM", mode: "chat", input: ["text"], output: ["text"], capabilities: ["chat", "function-calling", "reasoning"], cost: "free" },
    { id: "llama", name: "Llama", mode: "chat", input: ["text"], output: ["text"], capabilities: ["chat", "function-calling"], cost: "free" },
    { id: "llama-maverick", name: "Llama Maverick", mode: "chat", input: ["text"], output: ["text"], capabilities: ["chat", "function-calling"], cost: "free" },
    { id: "llama-scout", name: "Llama Scout", mode: "chat", input: ["text"], output: ["text"], capabilities: ["chat", "function-calling"], cost: "free" },
    { id: "minimax", name: "MiniMax", mode: "chat", input: ["text"], output: ["text"], capabilities: ["chat", "function-calling", "reasoning"], cost: "free" },
    { id: "minimax-m3", name: "MiniMax M3", mode: "chat", input: ["text"], output: ["text"], capabilities: ["chat", "function-calling", "reasoning"], cost: "free" },
    { id: "polly", name: "Polly", mode: "chat", input: ["text"], output: ["text"], capabilities: ["chat", "function-calling", "reasoning"], cost: "free" },
    { id: "midijourney", name: "Midijourney", mode: "chat", input: ["text"], output: ["text"], capabilities: ["chat", "function-calling"], cost: "free" },
    { id: "midijourney-large", name: "Midijourney Large", mode: "chat", input: ["text"], output: ["text"], capabilities: ["chat", "function-calling"], cost: "free" },
    { id: "step-flash", name: "Step Flash", mode: "chat", input: ["text"], output: ["text"], capabilities: ["chat", "function-calling", "reasoning"], cost: "free" },
    { id: "step-3.5-flash", name: "Step 3.5 Flash", mode: "chat", input: ["text"], output: ["text"], capabilities: ["chat", "function-calling", "reasoning"], cost: "free" },
    { id: "qwen-safety", name: "Qwen Safety", mode: "chat", input: ["text"], output: ["text"], capabilities: ["chat", "search"], cost: "free" },
    { id: "openai-audio", name: "OpenAI Audio", mode: "chat", input: ["text", "audio"], output: ["text", "audio"], capabilities: ["chat", "audio"], cost: "free" },
    { id: "openai-audio-large", name: "OpenAI Audio Large", mode: "chat", input: ["text", "audio"], output: ["text", "audio"], capabilities: ["chat", "audio"], cost: "free" },

    // ============ Image Models (25+) ============
    { id: "flux", name: "Flux", mode: "image", input: ["text"], output: ["image"], capabilities: ["text-to-image"], cost: "free", isDefault: true },
    { id: "zimage", name: "ZImage", mode: "image", input: ["text"], output: ["image"], capabilities: ["text-to-image"], cost: "free" },
    { id: "gptimage", name: "GPT Image", mode: "image", input: ["text"], output: ["image"], capabilities: ["text-to-image", "image-to-image"], cost: "free" },
    { id: "gptimage-large", name: "GPT Image Large", mode: "image", input: ["text", "image"], output: ["image"], capabilities: ["text-to-image", "image-to-image"], cost: "free" },
    { id: "gpt-image-2", name: "GPT Image 2", mode: "image", input: ["text", "image"], output: ["image"], capabilities: ["text-to-image", "image-to-image"], cost: "free" },
    { id: "kontext", name: "Kontext", mode: "image", input: ["text", "image"], output: ["image"], capabilities: ["text-to-image", "image-to-image"], cost: "free" },
    { id: "seedream5", name: "Seedream 5", mode: "image", input: ["text"], output: ["image"], capabilities: ["text-to-image"], cost: "free" },
    { id: "seedream", name: "Seedream", mode: "image", input: ["text", "image"], output: ["image"], capabilities: ["text-to-image", "image-to-image"], cost: "free" },
    { id: "seedream-pro", name: "Seedream Pro", mode: "image", input: ["text"], output: ["image"], capabilities: ["text-to-image"], cost: "free" },
    { id: "ideogram-v4-turbo", name: "Ideogram V4 Turbo", mode: "image", input: ["text"], output: ["image"], capabilities: ["text-to-image"], cost: "free" },
    { id: "ideogram-v4-balanced", name: "Ideogram V4 Balanced", mode: "image", input: ["text"], output: ["image"], capabilities: ["text-to-image"], cost: "free" },
    { id: "ideogram-v4-quality", name: "Ideogram V4 Quality", mode: "image", input: ["text"], output: ["image"], capabilities: ["text-to-image"], cost: "free" },
    { id: "wan-image", name: "Wan Image", mode: "image", input: ["text"], output: ["image"], capabilities: ["text-to-image"], cost: "free" },
    { id: "wan-image-pro", name: "Wan Image Pro", mode: "image", input: ["text"], output: ["image"], capabilities: ["text-to-image"], cost: "free" },
    { id: "qwen-image", name: "Qwen Image", mode: "image", input: ["text"], output: ["image"], capabilities: ["text-to-image"], cost: "free" },
    { id: "grok-imagine", name: "Grok Imagine", mode: "image", input: ["text"], output: ["image"], capabilities: ["text-to-image"], cost: "free" },
    { id: "grok-imagine-pro", name: "Grok Imagine Pro", mode: "image", input: ["text"], output: ["image"], capabilities: ["text-to-image"], cost: "free" },
    { id: "klein", name: "Klein", mode: "image", input: ["text", "image"], output: ["image"], capabilities: ["text-to-image", "image-to-image"], cost: "free" },
    { id: "p-image", name: "P-Image", mode: "image", input: ["text"], output: ["image"], capabilities: ["text-to-image"], cost: "free" },
    { id: "p-image-edit", name: "P-Image Edit", mode: "image", input: ["text", "image"], output: ["image"], capabilities: ["text-to-image", "image-to-image"], cost: "free" },
    { id: "nova-canvas", name: "Nova Canvas", mode: "image", input: ["text"], output: ["image"], capabilities: ["text-to-image"], cost: "free" },
    { id: "nanobanana", name: "NanoBanana", mode: "image", input: ["text", "image"], output: ["image"], capabilities: ["text-to-image", "image-to-image"], cost: "free" },
    { id: "nanobanana-2", name: "NanoBanana 2", mode: "image", input: ["text", "image"], output: ["image"], capabilities: ["text-to-image", "image-to-image"], cost: "free" },
    { id: "nanobanana-pro", name: "NanoBanana Pro", mode: "image", input: ["text", "image"], output: ["image"], capabilities: ["text-to-image", "image-to-image"], cost: "free" },

    // ============ Video Models (12+) ============
    { id: "veo", name: "Veo", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video"], cost: "free" },
    { id: "seedance-pro", name: "Seedance Pro", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video"], cost: "free" },
    { id: "seedance-2.0", name: "Seedance 2.0", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video"], cost: "free" },
    { id: "wan", name: "Wan", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video"], cost: "free" },
    { id: "wan-fast", name: "Wan Fast", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video"], cost: "free" },
    { id: "wan-pro", name: "Wan Pro", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video"], cost: "free" },
    { id: "wan-pro-1080p", name: "Wan Pro 1080p", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video"], cost: "free" },
    { id: "grok-video-pro", name: "Grok Video Pro", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video"], cost: "free" },
    { id: "ltx-2", name: "LTX 2", mode: "video", input: ["text"], output: ["video"], capabilities: ["text-to-video"], cost: "free" },
    { id: "p-video-720p", name: "P-Video 720p", mode: "video", input: ["text"], output: ["video"], capabilities: ["text-to-video"], cost: "free" },
    { id: "p-video-1080p", name: "P-Video 1080p", mode: "video", input: ["text"], output: ["video"], capabilities: ["text-to-video"], cost: "free" },
    { id: "nova-reel", name: "Nova Reel", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video"], cost: "free" },

    // ============ Audio Models (10+) ============
    { id: "elevenlabs", name: "ElevenLabs", mode: "audio", input: ["text"], output: ["audio"], capabilities: ["text-to-speech"], cost: "free" },
    { id: "elevenflash", name: "ElevenFlash", mode: "audio", input: ["text"], output: ["audio"], capabilities: ["text-to-speech"], cost: "free" },
    { id: "elevenmusic", name: "ElevenMusic", mode: "audio", input: ["text"], output: ["audio"], capabilities: ["text-to-music"], cost: "free" },
    { id: "acestep", name: "AceStep", mode: "audio", input: ["text"], output: ["audio"], capabilities: ["text-to-music"], cost: "free" },
    { id: "qwen-tts", name: "Qwen TTS", mode: "audio", input: ["text"], output: ["audio"], capabilities: ["text-to-speech"], cost: "free" },
    { id: "qwen-tts-instruct", name: "Qwen TTS Instruct", mode: "audio", input: ["text"], output: ["audio"], capabilities: ["text-to-speech"], cost: "free" },
    { id: "whisper", name: "Whisper", mode: "audio", input: ["audio"], output: ["text"], capabilities: ["speech-to-text"], cost: "free" },
    { id: "scribe", name: "Scribe", mode: "audio", input: ["audio"], output: ["text"], capabilities: ["speech-to-text"], cost: "free" },
    { id: "universal-2", name: "Universal 2", mode: "audio", input: ["audio"], output: ["text"], capabilities: ["speech-to-text"], cost: "free" },
    { id: "universal-3-pro", name: "Universal 3 Pro", mode: "audio", input: ["audio"], output: ["text"], capabilities: ["speech-to-text"], cost: "free" },

    // ============ Embedding Models (5) ============
    { id: "gemini-2", name: "Gemini 2", mode: "embedding", input: ["text", "image", "audio", "video"], output: ["embedding"], capabilities: ["embeddings", "multimodal"], cost: "free" },
    { id: "openai-3-small", name: "OpenAI 3 Small", mode: "embedding", input: ["text"], output: ["embedding"], capabilities: ["embeddings"], cost: "free" },
    { id: "openai-3-large", name: "OpenAI 3 Large", mode: "embedding", input: ["text"], output: ["embedding"], capabilities: ["embeddings"], cost: "free" },
    { id: "cohere-embed-v4", name: "Cohere Embed V4", mode: "embedding", input: ["text"], output: ["embedding"], capabilities: ["embeddings"], cost: "free" },
    { id: "qwen3-embedding-8b", name: "Qwen3 Embedding 8B", mode: "embedding", input: ["text"], output: ["embedding"], capabilities: ["embeddings"], cost: "free" },

    // ============ Realtime Models ============
    { id: "gpt-realtime-2", name: "GPT Realtime 2", mode: "realtime", input: ["text", "audio"], output: ["text", "audio"], capabilities: ["realtime", "voice"], cost: "paid" },
  ],

  config: {
    defaultModel: "flux",
    supportedModes: ["chat", "image", "video", "audio", "embedding", "realtime"],
    supportsStreaming: true,
    supportsEnhancement: false,
    supportsRealtime: true,
    rateLimit: { requests: 100, window: 60000 },
  },
};

export const getPollinationsModels = () => REGISTRY.models.map(m => m.id);

export const getPollinationsDefaultModel = () => REGISTRY.config.defaultModel;

export const getPollinationsRegistry = () => ({ ...REGISTRY });

export const isPollinationsModel = (modelId) => {
  if (!modelId) return false;
  return REGISTRY.models.some(m => m.id === modelId);
};

export const getPollinationsModelConfig = (modelId) => {
  return REGISTRY.models.find(m => m.id === modelId) || null;
};

export const createPollinationsExecutor = () => new PollinationsExecutor();

export const getPollinationsEndpoints = () => [
  "POST /v1/chat/completions      - Chat completions",
  "POST /text                     - Text generation",
  "GET  /text/{prompt}            - Simple text",
  "GET  /image/{prompt}           - Simple image",
  "POST /v1/images/generations    - Image generation",
  "POST /v1/images/edits          - Image editing",
  "GET  /video/{prompt}           - Video generation",
  "POST /v1/audio/speech          - TTS",
  "POST /v1/audio/transcriptions  - STT",
  "GET  /audio/{text}             - Simple TTS",
  "POST /v1/embeddings            - Embeddings",
  "GET  /v1/models                - List models (OpenAI)",
  "GET  /models                   - List all models",
  "GET  /image/models             - Image/video models",
  "GET  /text/models              - Text models",
  "GET  /audio/models             - Audio models",
  "GET  /embeddings/models        - Embedding models",
  "POST /upload                   - Upload media",
  "GET  /{hash}                   - Retrieve media",
  "HEAD /{hash}                   - Check media",
  "GET  /{hash}/metadata          - Media metadata",
  "GET  /account/profile          - Profile",
  "GET  /account/balance          - Balance",
  "GET  /account/usage            - Usage",
  "GET  /account/usage/daily      - Daily usage",
  "GET  /account/earnings         - Earnings",
  "WS   /v1/realtime              - Realtime WebSocket",
];

export default REGISTRY;
