/**
 * Grok Imagine (xAI) Provider Registry - ALL Models & Endpoints
 * 
 * Base URL: https://api.x.ai
 * Auth: Bearer token (x-api-key)
 * 
 * ALL Models:
 * - 2 Image models (grok-imagine-image, grok-imagine-image-quality)
 * - 2 Video models (grok-imagine-video, grok-imagine-video-1.5-preview)
 * 
 * Features:
 * - Image: 1k, 2k resolution, up to 4 images per request
 * - Video: 1-15s duration, 480p/720p, async polling
 */

import { GrokImagineExecutor } from "../executors/grok-imagine.js";

const REGISTRY = {
  id: "grok-imagine",
  name: "Grok Imagine (xAI)",
  authType: "api_key",
  authHeader: "Authorization",
  authFormat: "Bearer <xai_api_key>",
  category: "image-video",
  enabled: true,
  isDefault: false,
  baseUrl: "https://api.x.ai",
  description: "xAI Grok Imagine - Image generation (1k/2k), video generation (1-15s, 720p), async polling",

  models: [
    // ============ Image Models (2) ============
    { id: "grok-imagine-image", name: "Grok Imagine Image", mode: "image", input: ["text"], output: ["image"], capabilities: ["text-to-image", "fast"], cost: "paid" },
    { id: "grok-imagine-image-quality", name: "Grok Imagine Image Quality", mode: "image", input: ["text", "image"], output: ["image"], capabilities: ["text-to-image", "image-to-image", "high-quality"], cost: "paid", isDefault: true },

    // ============ Video Models (2) ============
    { id: "grok-imagine-video", name: "Grok Imagine Video", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video", "reference-to-video", "video-edit", "video-extend"], cost: "paid", durations: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] },
    { id: "grok-imagine-video-1.5-preview", name: "Grok Imagine Video 1.5 Preview", mode: "video", input: ["text", "image"], output: ["video"], capabilities: ["text-to-video", "image-to-video", "reference-to-video", "video-edit", "video-extend", "latest"], cost: "paid", durations: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] },
  ],

  config: {
    defaultModel: "grok-imagine-image-quality",
    supportedModes: ["image", "video"],
    supportsStreaming: false,
    supportsEnhancement: false,
    supportsAsync: true,
    supportsBatch: true,
    maxBatchSize: 4,
    imageResolutions: ["1k", "2k"],
    videoResolutions: ["480p", "720p"],
    rateLimit: { requests: 60, window: 60000 },
  },
};

export const getGrokImagineModels = () => REGISTRY.models.map(m => m.id);

export const getGrokImagineDefaultModel = () => REGISTRY.config.defaultModel;

export const getGrokImagineRegistry = () => ({ ...REGISTRY });

export const isGrokImagineModel = (modelId) => {
  if (!modelId) return false;
  if (modelId === "grok-imagine") return true;
  if (modelId.startsWith("grok-imagine-")) return true;
  return false;
};

export const getGrokImagineModelConfig = (modelId) => {
  return REGISTRY.models.find(m => m.id === modelId) || null;
};

export const createGrokImagineExecutor = () => new GrokImagineExecutor();

export const getGrokImagineEndpoints = () => [
  "POST /v1/images/generations  - Text-to-image (1k, 2k resolution, up to 4 images)",
  "POST /v1/images/edits        - Image editing (up to 3 source images)",
  "POST /v1/videos/generations  - Video generation (1-15s, 480p/720p)",
  "POST /v1/videos/edits        - Video editing",
  "POST /v1/videos/extensions   - Video extension",
  "GET  /v1/videos/{request_id} - Poll video results (pending/done/expired/failed)",
];

export default REGISTRY;