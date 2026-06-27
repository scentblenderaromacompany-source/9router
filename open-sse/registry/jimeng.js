/**
 * Jimeng/Dreamina Provider Registry - ALL Models & Endpoints
 * 
 * Base URLs:
 * - https://jimeng.jianying.com (Chinese)
 * - https://dreamina.com (International)
 * 
 * Auth: Session token (from cookies) or Bearer token
 * 
 * ALL Models:
 * - 11 Image generation models
 * - 11 Video generation models
 * - 2 Avatar models
 * - 4 Canvas operations
 * - Token management
 * - Assets management
 * - History
 */

import { JimengExecutor } from "../executors/jimeng.js";

const REGISTRY = {
  id: "jimeng",
  name: "Jimeng / Dreamina",
  authType: "session_token",
  authHeader: "Authorization",
  authFormat: "Bearer <session_id>",
  category: "image-video",
  enabled: true,
  isDefault: false,
  baseUrl: "https://jimeng.jianying.com",
  dreaminaUrl: "https://dreamina.com",
  description: "ByteDance Jimeng/Dreamina - 11 image models, 11 video models, avatar, canvas tools, free daily credits",

  models: [
    // ============ Image Models (11) ============
    { id: "jimeng-5.0", name: "Jimeng 5.0", mode: "image", input: ["text"], output: ["image"], capabilities: ["text-to-image", "highest-quality"], cost: "free", isDefault: true },
    { id: "jimeng-4.6", name: "Jimeng 4.6", mode: "image", input: ["text"], output: ["image"], capabilities: ["text-to-image"], cost: "free" },
    { id: "jimeng-4.5", name: "Jimeng 4.5", mode: "image", input: ["text"], output: ["image"], capabilities: ["text-to-image"], cost: "free" },
    { id: "jimeng-4.1", name: "Jimeng 4.1", mode: "image", input: ["text"], output: ["image"], capabilities: ["text-to-image"], cost: "free" },
    { id: "jimeng-4.0", name: "Jimeng 4.0", mode: "image", input: ["text"], output: ["image"], capabilities: ["text-to-image"], cost: "free" },
    { id: "jimeng-3.1", name: "Jimeng 3.1", mode: "image", input: ["text"], output: ["image"], capabilities: ["text-to-image"], cost: "free" },
    { id: "jimeng-3.0", name: "Jimeng 3.0", mode: "image", input: ["text"], output: ["image"], capabilities: ["text-to-image"], cost: "free" },
    { id: "nanobanana", name: "Nano Banana", mode: "image", input: ["text"], output: ["image"], capabilities: ["text-to-image", "versatile"], cost: "free" },
    { id: "nanobananapro", name: "Nano Banana Pro", mode: "image", input: ["text"], output: ["image"], capabilities: ["text-to-image", "enhanced"], cost: "free" },
    { id: "seedream-5.0-lite", name: "Seedream 5.0 Lite", mode: "image", input: ["text"], output: ["image"], capabilities: ["text-to-image", "reasoning", "web-search"], cost: "free" },
    { id: "seedream-4.5", name: "Seedream 4.5", mode: "image", input: ["text"], output: ["image"], capabilities: ["text-to-image", "photorealism"], cost: "free" },
    { id: "seedream-4.0", name: "Seedream 4.0", mode: "image", input: ["text"], output: ["image"], capabilities: ["text-to-image"], cost: "free" },

    // ============ Video Models (11) ============
    { id: "jimeng-video-seedance-2.0", name: "Seedance 2.0", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video", "omni-reference"], cost: "free", durations: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], isDefault: true },
    { id: "jimeng-video-seedance-2.0-fast", name: "Seedance 2.0 Fast", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video", "omni-reference", "fast"], cost: "free", durations: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] },
    { id: "jimeng-video-seedance-1.5-pro", name: "Seedance 1.5 Pro", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video"], cost: "free", durations: [5, 10] },
    { id: "jimeng-video-seedance-1.0-fast", name: "Seedance 1.0 Fast", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video", "fast"], cost: "free", durations: [5, 10] },
    { id: "jimeng-video-3.5-pro", name: "Jimeng Video 3.5 Pro", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video"], cost: "free", durations: [5, 10, 12] },
    { id: "jimeng-video-3.0-pro", name: "Jimeng Video 3.0 Pro", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video"], cost: "free", durations: [5, 10] },
    { id: "jimeng-video-3.0", name: "Jimeng Video 3.0", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video"], cost: "free", durations: [5, 10] },
    { id: "jimeng-video-3.0-fast", name: "Jimeng Video 3.0 Fast", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video", "fast"], cost: "free", durations: [5, 10] },
    { id: "jimeng-video-2.0-pro", name: "Jimeng Video 2.0 Pro", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video"], cost: "free", durations: [5, 10] },
    { id: "jimeng-video-2.0", name: "Jimeng Video 2.0", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video"], cost: "free", durations: [5, 10] },
    { id: "jimeng-video-veo3", name: "Veo 3", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video"], cost: "free", durations: [8] },
    { id: "jimeng-video-veo3.1", name: "Veo 3.1", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video"], cost: "free", durations: [8] },
    { id: "jimeng-video-sora2", name: "Sora 2", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video"], cost: "free", durations: [4, 8, 12] },

    // ============ Avatar Models ============
    { id: "avatar-1.0", name: "Avatar 1.0", mode: "avatar", input: ["text", "image"], output: ["image"], capabilities: ["avatar-generation", "style-transfer"], cost: "free" },
    { id: "talking-1.0", name: "Talking Avatar 1.0", mode: "avatar", input: ["image", "audio"], output: ["video"], capabilities: ["talking-avatar", "lip-sync"], cost: "free" },

    // ============ Canvas Operations ============
    { id: "canvas-redraw", name: "Canvas Redraw", mode: "canvas", input: ["image", "mask"], output: ["image"], capabilities: ["partial-redraw", "inpainting"], cost: "free" },
    { id: "canvas-expand", name: "Canvas Expand", mode: "canvas", input: ["image"], output: ["image"], capabilities: ["outpainting", "expansion"], cost: "free" },
    { id: "canvas-eliminate", name: "Canvas Eliminate", mode: "canvas", input: ["image", "mask"], output: ["image"], capabilities: ["object-removal"], cost: "free" },
    { id: "canvas-cutout", name: "Canvas Cutout", mode: "canvas", input: ["image"], output: ["image"], capabilities: ["background-removal", "cutout"], cost: "free" },
  ],

  config: {
    defaultModel: "jimeng-5.0",
    supportedModes: ["image", "video", "avatar", "canvas"],
    supportsStreaming: false,
    supportsEnhancement: false,
    supportsHistory: true,
    supportsAssets: true,
    supportsFreeCredits: true,
    apiVersion: "v1",
    rateLimit: { requests: 10, window: 60000 },
  },
};

export const getJimengModels = () => REGISTRY.models.map(m => m.id);

export const getJimengDefaultModel = () => REGISTRY.config.defaultModel;

export const getJimengRegistry = () => ({ ...REGISTRY });

export const isJimengModel = (modelId) => {
  if (!modelId) return false;
  if (modelId === "jimeng" || modelId.startsWith("jimeng-") || modelId.startsWith("jimeng-video-")) return true;
  if (modelId === "nanobanana" || modelId === "nanobananapro") return true;
  if (modelId.startsWith("seedream-") || modelId.startsWith("seedance-")) return true;
  if (modelId === "avatar-1.0" || modelId === "talking-1.0") return true;
  if (modelId.startsWith("canvas-")) return true;
  if (modelId === "sora-2" || modelId === "veo-3" || modelId === "veo-3.1") return true;
  return false;
};

export const getJimengModelConfig = (modelId) => {
  return REGISTRY.models.find(m => m.id === modelId) || null;
};

export const createJimengExecutor = () => new JimengExecutor();

export const getJimengEndpoints = () => [
  "POST /v1/images/generations          - Text-to-image (11 models)",
  "POST /v1/images/compositions         - Image-to-image (composition)",
  "POST /v1/videos/generations          - Video generation (11 models)",
  "POST /v1/avatar/generate             - Avatar generation",
  "POST /v1/avatar/talking              - Talking avatar (lip-sync)",
  "POST /v1/canvas/redraw               - Partial redraw (inpainting)",
  "POST /v1/canvas/expand               - One-click expansion (outpainting)",
  "POST /v1/canvas/eliminate             - Object elimination",
  "POST /v1/canvas/cutout               - Background removal",
  "GET  /v1/models                      - List available models",
  "POST /token/check                    - Check token status",
  "POST /token/points                   - Get credit points",
  "POST /token/receive                  - Receive daily credits",
  "POST /v1/assets/upload               - Upload asset",
  "GET  /v1/assets                      - List assets",
  "GET  /v1/assets/{id}                 - Get asset",
  "GET  /v1/history/images              - Image generation history",
  "GET  /v1/history/videos              - Video generation history",
];

export default REGISTRY;