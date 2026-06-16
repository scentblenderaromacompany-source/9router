/**
 * Flux (Black Forest Labs) Provider Registry - ALL Models & Endpoints
 * 
 * Base URL: https://api.bfl.ai
 * Auth: x-key header with API key
 * 
 * ALL Models:
 * - 14 Generation models (FLUX.2, FLUX.1, Kontext, Fill, Expand)
 * - 2 Finetuned models (Fill + Ultra with LoRA)
 * - 3 Tools (Outpainting, VTO, Erase)
 * - Utility (Poll, Credits, Finetunes)
 */

import { FluxExecutor } from "../executors/flux.js";

const REGISTRY = {
  id: "flux",
  name: "Flux (Black Forest Labs)",
  authType: "api_key",
  authHeader: "x-key",
  authFormat: "x-key: <api_key>",
  category: "image",
  enabled: true,
  isDefault: false,
  baseUrl: "https://api.bfl.ai",
  description: "Black Forest Labs FLUX - 14 generation models, 2 finetuned, 3 tools, up to 4MP",

  models: [
    // ============ FLUX.2 Models (7) ============
    { id: "flux-2-max", name: "FLUX.2 [max]", mode: "image", input: ["text", "image"], output: ["image"], capabilities: ["text-to-image", "image-to-image", "multi-reference", "grounding", "highest-quality"], cost: "paid", pricing: { perMP: 0.05 } },
    { id: "flux-2-pro-preview", name: "FLUX.2 [pro] preview", mode: "image", input: ["text", "image"], output: ["image"], capabilities: ["text-to-image", "image-to-image", "multi-reference"], cost: "paid" },
    { id: "flux-2-pro", name: "FLUX.2 [pro]", mode: "image", input: ["text", "image"], output: ["image"], capabilities: ["text-to-image", "image-to-image", "multi-reference"], cost: "paid", isDefault: true, pricing: { perMP: 0.03 } },
    { id: "flux-2-flex", name: "FLUX.2 [flex]", mode: "image", input: ["text", "image"], output: ["image"], capabilities: ["text-to-image", "image-to-image", "typography"], cost: "paid", pricing: { perMP: 0.03 } },
    { id: "flux-2-klein-4b", name: "FLUX.2 [klein] 4B", mode: "image", input: ["text", "image"], output: ["image"], capabilities: ["text-to-image", "image-to-image", "fast", "open-weights"], cost: "paid", pricing: { perMP: 0.003 } },
    { id: "flux-2-klein-9b-preview", name: "FLUX.2 [klein] 9B preview", mode: "image", input: ["text", "image"], output: ["image"], capabilities: ["text-to-image", "image-to-image", "fast"], cost: "paid" },
    { id: "flux-2-klein-9b", name: "FLUX.2 [klein] 9B", mode: "image", input: ["text", "image"], output: ["image"], capabilities: ["text-to-image", "image-to-image", "sub-second", "open-weights"], cost: "paid", pricing: { perMP: 0.005 } },

    // ============ FLUX.1 Models (5) ============
    { id: "flux-pro-1.1", name: "FLUX1.1 [pro]", mode: "image", input: ["text"], output: ["image"], capabilities: ["text-to-image", "fast"], cost: "paid", pricing: { perMP: 0.004 } },
    { id: "flux-pro-1.1-ultra", name: "FLUX1.1 [pro] Ultra", mode: "image", input: ["text", "image"], output: ["image"], capabilities: ["text-to-image", "image-to-image", "4mp", "raw-mode"], cost: "paid", pricing: { perMP: 0.006 } },
    { id: "flux-dev", name: "FLUX.1 [dev]", mode: "image", input: ["text"], output: ["image"], capabilities: ["text-to-image"], cost: "free" },
    { id: "flux-kontext-pro", name: "FLUX.1 Kontext [pro]", mode: "image", input: ["text", "image"], output: ["image"], capabilities: ["text-to-image", "image-to-image", "editing"], cost: "paid", pricing: { perMP: 0.03 } },
    { id: "flux-kontext-max", name: "FLUX.1 Kontext [max]", mode: "image", input: ["text", "image"], output: ["image"], capabilities: ["text-to-image", "image-to-image", "best-editing"], cost: "paid", pricing: { perMP: 0.05 } },

    // ============ Tool Models (2) ============
    { id: "flux-pro-1.0-fill", name: "FLUX.1 Fill [pro]", mode: "image", input: ["text", "image", "mask"], output: ["image"], capabilities: ["inpainting", "outpainting"], cost: "paid", pricing: { perMP: 0.03 } },
    { id: "flux-pro-1.0-expand", name: "FLUX.1 Expand [pro]", mode: "image", input: ["text", "image"], output: ["image"], capabilities: ["outpainting", "expansion"], cost: "paid", pricing: { perMP: 0.03 } },

    // ============ Finetuned Models (2) ============
    { id: "flux-pro-1.0-fill-finetuned", name: "FLUX.1 Fill [pro] Finetuned", mode: "image", input: ["text", "image", "mask"], output: ["image"], capabilities: ["inpainting", "outpainting", "lora"], cost: "paid" },
    { id: "flux-pro-1.1-ultra-finetuned", name: "FLUX1.1 [pro] Ultra Finetuned", mode: "image", input: ["text", "image"], output: ["image"], capabilities: ["text-to-image", "image-to-image", "4mp", "lora"], cost: "paid" },

    // ============ Tools (3) ============
    { id: "tool-outpainting", name: "Outpainting", mode: "tool", input: ["image"], output: ["image"], capabilities: ["outpainting"], cost: "paid" },
    { id: "tool-vto", name: "Virtual Try-On", mode: "tool", input: ["image", "image"], output: ["image"], capabilities: ["virtual-try-on", "fashion"], cost: "paid" },
    { id: "tool-erase", name: "Object Eraser", mode: "tool", input: ["image", "mask"], output: ["image"], capabilities: ["object-removal"], cost: "paid" },
  ],

  config: {
    defaultModel: "flux-2-pro",
    supportedModes: ["image", "tool"],
    supportsStreaming: false,
    supportsEnhancement: false,
    supportsPolling: true,
    supportsWebhook: true,
    supportsMultiReference: true,
    supportsFinetunes: true,
    maxInputImages: 10,
    rateLimit: { concurrent: 24, window: 60000 },
  },
};

export const getFluxModels = () => REGISTRY.models.map(m => m.id);

export const getFluxDefaultModel = () => REGISTRY.config.defaultModel;

export const getFluxRegistry = () => ({ ...REGISTRY });

export const isFluxModel = (modelId) => {
  if (!modelId) return false;
  if (modelId === "flux") return true;
  if (modelId.startsWith("flux-")) return true;
  if (modelId.startsWith("tool-")) return true;
  return false;
};

export const getFluxModelConfig = (modelId) => {
  return REGISTRY.models.find(m => m.id === modelId) || null;
};

export const createFluxExecutor = () => new FluxExecutor();

export const getFluxEndpoints = () => [
  "POST /v1/flux-2-max                    - FLUX.2 [max] - Highest quality",
  "POST /v1/flux-2-pro-preview            - FLUX.2 [pro] preview",
  "POST /v1/flux-2-pro                    - FLUX.2 [pro] - Recommended",
  "POST /v1/flux-2-flex                   - FLUX.2 [flex] - Typography",
  "POST /v1/flux-2-klein-4b               - FLUX.2 [klein] 4B - Fastest",
  "POST /v1/flux-2-klein-9b-preview       - FLUX.2 [klein] 9B preview",
  "POST /v1/flux-2-klein-9b               - FLUX.2 [klein] 9B - Sub-second",
  "POST /v1/flux-pro-1.1                  - FLUX1.1 [pro] - Fast",
  "POST /v1/flux-pro-1.1-ultra            - FLUX1.1 [pro] Ultra - 4MP",
  "POST /v1/flux-dev                      - FLUX.1 [dev] - Free",
  "POST /v1/flux-kontext-pro              - FLUX.1 Kontext [pro]",
  "POST /v1/flux-kontext-max              - FLUX.1 Kontext [max]",
  "POST /v1/flux-pro-1.0-fill             - FLUX.1 Fill [pro] - Inpainting",
  "POST /v1/flux-pro-1.0-expand           - FLUX.1 Expand [pro] - Outpainting",
  "POST /v1/flux-pro-1.0-fill-finetuned   - Fill [pro] Finetuned - LoRA",
  "POST /v1/flux-pro-1.1-ultra-finetuned  - Ultra Finetuned - LoRA",
  "POST /v1/flux-tools/outpainting-v1     - Outpainting tool",
  "POST /v1/flux-tools/vto-v1             - Virtual try-on tool",
  "POST /v1/flux-tools/erase-v1           - Object erasing tool",
  "GET  /v1/get_result                    - Poll task result",
  "GET  /v1/credits                       - Account credits",
  "GET  /v1/my_finetunes                  - List finetunes",
  "GET  /v1/finetune_details              - Finetune details",
  "POST /v1/delete_finetune               - Delete finetune",
];

export default REGISTRY;