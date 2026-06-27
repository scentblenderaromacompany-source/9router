/**
 * Krea AI Provider Registry - ALL Models & Endpoints
 * 
 * Base URL: https://api.krea.ai
 * Auth: Bearer token (API key)
 * 
 * ALL Models:
 * - 25 Image generation models
 * - 31 Video generation models
 * - 3 Enhance/Upscale models
 * - 3D generation
 * - Styles (LoRA) management
 * - Assets management
 * - Node Apps
 */

import { KreaExecutor } from "../executors/krea.js";

const REGISTRY = {
  id: "krea",
  name: "Krea AI",
  authType: "api_key",
  authHeader: "Authorization",
  authFormat: "Bearer <api_key>",
  category: "image-video",
  enabled: true,
  isDefault: false,
  baseUrl: "https://api.krea.ai",
  description: "Krea AI - Complete creative suite: 25 image models, 31 video models, 3 enhance models, 3D, styles, node apps",

  models: [
    // ============ Image Models (25) ============
    { id: "krea/krea-2-large", name: "Krea 2 Large", mode: "image", input: ["text"], output: ["image"], capabilities: ["text-to-image", "photorealism"], cost: "paid", pricing: { perRequest: 0.05 } },
    { id: "krea/krea-2-medium", name: "Krea 2 Medium", mode: "image", input: ["text"], output: ["image"], capabilities: ["text-to-image", "illustrations"], cost: "paid", pricing: { perRequest: 0.03 }, isDefault: true },
    { id: "krea/krea-2-medium-turbo", name: "Krea 2 Medium Turbo", mode: "image", input: ["text"], output: ["image"], capabilities: ["text-to-image", "fast"], cost: "paid", pricing: { perRequest: 0.02 } },
    { id: "openai/gpt-image", name: "ChatGPT Image", mode: "image", input: ["text", "image"], output: ["image"], capabilities: ["text-to-image", "image-to-image", "editing"], cost: "paid", pricing: { perRequest: 0.3747 } },
    { id: "openai/chatgpt-2", name: "ChatGPT 2", mode: "image", input: ["text", "image"], output: ["image"], capabilities: ["text-to-image", "image-to-image", "editing"], cost: "paid" },
    { id: "bfl/flux", name: "Flux", mode: "image", input: ["text"], output: ["image"], capabilities: ["text-to-image", "lora"], cost: "paid" },
    { id: "bfl/flux-1.1-pro", name: "Flux 1.1 Pro", mode: "image", input: ["text"], output: ["image"], capabilities: ["text-to-image"], cost: "paid" },
    { id: "bfl/flux-1.1-pro-ultra", name: "Flux 1.1 Pro Ultra", mode: "image", input: ["text"], output: ["image"], capabilities: ["text-to-image", "highest-quality"], cost: "paid" },
    { id: "bfl/flux-kontext", name: "Flux Kontext", mode: "image", input: ["text", "image"], output: ["image"], capabilities: ["text-to-image", "image-editing"], cost: "paid" },
    { id: "ideogram/ideogram-2.0a-turbo", name: "Ideogram 2.0A Turbo", mode: "image", input: ["text"], output: ["image"], capabilities: ["text-to-image", "fast"], cost: "paid" },
    { id: "ideogram/ideogram-3.0", name: "Ideogram 3.0", mode: "image", input: ["text"], output: ["image"], capabilities: ["text-to-image", "aesthetic", "typography"], cost: "paid" },
    { id: "google/imagen-3", name: "Imagen 3", mode: "image", input: ["text"], output: ["image"], capabilities: ["text-to-image"], cost: "paid" },
    { id: "google/imagen-4", name: "Imagen 4", mode: "image", input: ["text"], output: ["image"], capabilities: ["text-to-image", "photorealism", "typography"], cost: "paid" },
    { id: "google/imagen-4-fast", name: "Imagen 4 Fast", mode: "image", input: ["text"], output: ["image"], capabilities: ["text-to-image", "fast"], cost: "paid" },
    { id: "google/imagen-4-ultra", name: "Imagen 4 Ultra", mode: "image", input: ["text"], output: ["image"], capabilities: ["text-to-image", "highest-quality"], cost: "paid" },
    { id: "luma/luma-uni-1", name: "Luma UNI-1", mode: "image", input: ["text"], output: ["image"], capabilities: ["text-to-image", "reasoning"], cost: "paid" },
    { id: "nano-banana/nano-banana", name: "Nano Banana", mode: "image", input: ["text"], output: ["image"], capabilities: ["text-to-image", "versatile"], cost: "paid" },
    { id: "nano-banana/nano-banana-2", name: "Nano Banana 2", mode: "image", input: ["text", "image"], output: ["image"], capabilities: ["text-to-image", "image-to-image", "web-search"], cost: "paid" },
    { id: "nano-banana/nano-banana-pro", name: "Nano Banana Pro", mode: "image", input: ["text", "image"], output: ["image"], capabilities: ["text-to-image", "image-to-image", "4k", "editing"], cost: "paid" },
    { id: "qwen/qwen-2512", name: "Qwen 2512", mode: "image", input: ["text"], output: ["image"], capabilities: ["text-to-image", "portraits"], cost: "paid" },
    { id: "runway/runway-gen-4", name: "Runway Gen-4", mode: "image", input: ["text", "image"], output: ["image"], capabilities: ["text-to-image", "image-to-image", "cinematic"], cost: "paid" },
    { id: "seededit/seededit", name: "SeedEdit", mode: "image", input: ["text", "image"], output: ["image"], capabilities: ["text-to-image", "image-editing"], cost: "paid" },
    { id: "seedream/seedream-4", name: "Seedream 4", mode: "image", input: ["text"], output: ["image"], capabilities: ["text-to-image", "photorealism", "text-rendering"], cost: "paid" },
    { id: "seedream/seedream-5-lite", name: "Seedream 5 Lite", mode: "image", input: ["text"], output: ["image"], capabilities: ["text-to-image", "reasoning", "web-search"], cost: "paid" },
    { id: "z-image/z-image", name: "Z Image", mode: "image", input: ["text"], output: ["image"], capabilities: ["text-to-image", "fast", "realistic"], cost: "paid" },

    // ============ Video Models (31) ============
    { id: "xai/grok-imagine", name: "Grok Imagine", mode: "video", input: ["text"], output: ["video"], capabilities: ["text-to-video"], cost: "paid" },
    { id: "hailuo/hailuo", name: "Hailuo", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video", "camera-control"], cost: "paid" },
    { id: "hailuo/hailuo-02", name: "Hailuo 02", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video", "dynamic-motion"], cost: "paid" },
    { id: "hailuo/hailuo-2.3", name: "Hailuo 2.3", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video", "dynamic-motion"], cost: "paid" },
    { id: "hailuo/hailuo-2.3-fast", name: "Hailuo 2.3 Fast", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video", "fast"], cost: "paid" },
    { id: "kling/kling-1.0", name: "Kling 1.0", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video", "control"], cost: "paid" },
    { id: "kling/kling-1.5", name: "Kling 1.5", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video", "quality"], cost: "paid" },
    { id: "kling/kling-1.6", name: "Kling 1.6", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video"], cost: "paid" },
    { id: "kling/kling-2.0", name: "Kling 2.0", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video", "aesthetics"], cost: "paid" },
    { id: "kling/kling-2.1", name: "Kling 2.1", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video", "1080p"], cost: "paid" },
    { id: "kling/kling-2.5", name: "Kling 2.5", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video", "style-adaptation"], cost: "paid" },
    { id: "kling/kling-2.6", name: "Kling 2.6", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video", "native-audio"], cost: "paid" },
    { id: "kling/kling-3.0", name: "Kling 3.0", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video", "audio", "15s"], cost: "paid", pricing: { perSec: 0.1764 } },
    { id: "kling/kling-o1", name: "Kling o1", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video", "reasoning"], cost: "paid" },
    { id: "ltx/ltx-2.3-22b", name: "LTX-2.3 22B", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video", "audio"], cost: "paid" },
    { id: "ray/ray-2", name: "Ray 2", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video", "natural-motion"], cost: "paid" },
    { id: "runway/runway-aleph", name: "Runway Aleph", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["video-to-video", "transformation"], cost: "paid" },
    { id: "runway/runway-gen-3", name: "Runway Gen-3", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video", "cinematic"], cost: "paid" },
    { id: "runway/runway-gen-4", name: "Runway Gen-4", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video", "cinematic"], cost: "paid" },
    { id: "runway/runway-gen-4.5", name: "Runway Gen-4.5", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video", "native-text-to-video"], cost: "paid" },
    { id: "seedance/seedance-pro", name: "Seedance Pro", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video"], cost: "paid" },
    { id: "seedance/seedance-pro-fast", name: "Seedance Pro Fast", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video", "fast", "12s"], cost: "paid" },
    { id: "google/veo-2", name: "Veo 2", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video"], cost: "paid" },
    { id: "google/veo-3", name: "Veo 3", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video", "audio"], cost: "paid" },
    { id: "google/veo-3-fast", name: "Veo 3 Fast", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video", "audio", "fast"], cost: "paid" },
    { id: "google/veo-3.1", name: "Veo 3.1", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video", "audio", "highest-quality"], cost: "paid" },
    { id: "google/veo-3.1-fast", name: "Veo 3.1 Fast", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video", "audio", "fast"], cost: "paid" },
    { id: "google/veo-3.1-lite", name: "Veo 3.1 Lite", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video", "fast"], cost: "paid" },
    { id: "wan/wan-2.1", name: "Wan 2.1", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video", "lora", "fast"], cost: "paid" },
    { id: "wan/wan-2.2", name: "Wan 2.2", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video", "fast"], cost: "paid" },
    { id: "wan/wan-2.5", name: "Wan 2.5", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video"], cost: "paid" },

    // ============ Enhance Models (3) ============
    { id: "enhance/standard-enhance", name: "Topaz Standard", mode: "enhance", input: ["image"], output: ["image"], capabilities: ["upscale", "enhance", "22k"], cost: "paid" },
    { id: "enhance/bloom", name: "Topaz Bloom", mode: "enhance", input: ["image"], output: ["image"], capabilities: ["upscale", "enhance", "creative", "10k"], cost: "paid" },
    { id: "enhance/generative", name: "Topaz Generative", mode: "enhance", input: ["image"], output: ["image"], capabilities: ["upscale", "enhance", "generative", "16k"], cost: "paid" },

    // ============ 3D ============
    { id: "3d/generate", name: "3D Generation", mode: "3d", input: ["text", "image"], output: ["3d"], capabilities: ["text-to-3d", "image-to-3d"], cost: "paid" },
  ],

  config: {
    defaultModel: "krea/krea-2-medium",
    supportedModes: ["image", "enhance", "video", "3d"],
    supportsStreaming: false,
    supportsEnhancement: true,
    supportsJobs: true,
    supportsStyles: true,
    supportsAssets: true,
    supportsNodeApps: true,
    rateLimit: { requests: 30, window: 60000 },
  },
};

export const getKreaModels = () => REGISTRY.models.map(m => m.id);

export const getKreaDefaultModel = () => REGISTRY.config.defaultModel;

export const getKreaRegistry = () => ({ ...REGISTRY });

export const isKreaModel = (modelId) => {
  if (!modelId) return false;
  if (modelId === "krea") return true;
  return REGISTRY.models.some(m => m.id === modelId);
};

export const getKreaModelConfig = (modelId) => {
  return REGISTRY.models.find(m => m.id === modelId) || null;
};

export const createKreaExecutor = () => new KreaExecutor();

export const getKreaEndpoints = () => [
  "POST /generate/image/{provider}/{model}  - Image generation (25 models)",
  "POST /generate/enhance/topaz/{model}     - Image upscaling (3 models)",
  "POST /generate/video/{provider}/{model}  - Video generation (31 models)",
  "POST /generate/3d                        - 3D generation",
  "GET  /jobs                               - List jobs",
  "GET  /jobs/{id}                          - Get job status",
  "DELETE /jobs/{id}                        - Cancel job",
  "GET  /styles                             - List styles",
  "GET  /styles/{id}                        - Get style",
  "POST /styles/train                       - Train LoRA",
  "PATCH /styles/{id}                       - Update style",
  "POST /styles/{id}/share                  - Share style",
  "POST /styles/{id}/workspace              - Add to workspace",
  "POST /assets                             - Upload asset (multipart)",
  "GET  /assets                             - List assets",
  "GET  /assets/{id}                        - Get asset",
  "DELETE /assets/{id}                      - Delete asset",
  "GET  /node-apps                          - List node apps",
  "GET  /node-apps/{id}                     - Get node app",
  "POST /node-apps/{id}/execute             - Execute node app",
];

export default REGISTRY;